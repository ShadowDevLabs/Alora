import { Component, For, createSignal, onMount } from 'solid-js';
import { useParams, useNavigate } from "@solidjs/router";
import SlidersHorizontal from 'lucide-solid/icons/sliders-horizontal';
import Share2 from 'lucide-solid/icons/share-2';
import ZoomOut from 'lucide-solid/icons/zoom-out';
import Plus from 'lucide-solid/icons/plus';
import Window from '../components/Window';
import styles from '../assets/css/App.module.css';
import { init as initProxy } from '../proxy';

// Initialize the proxy once
window.addEventListener('transport', initProxy as EventListener);
initProxy();

const Home: Component = () => {
  // --- Component State ---
  const params = useParams();
  const navigate = useNavigate();
  let ws: WebSocket;
  let appRef: HTMLDivElement | undefined;

  // Window and UI state now live inside the component
  const [windows, setWindows] = createSignal<{ id: string, url: string, isClosing?: boolean }[]>([]);
  const [stackingOrder, setStackingOrder] = createSignal<string[]>([]);
  const [panOffset, setPanOffset] = createSignal({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = createSignal(false);
  const [lastPos, setLastPos] = createSignal({ x: 0, y: 0 });

  // --- WebSocket and Session Management ---
  onMount(() => {
    const sessionId = params.sessionId || crypto.randomUUID();
    if (!params.sessionId) {
      navigate(`/${sessionId}`, { replace: true });
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws = new WebSocket(`${protocol}//${window.location.host}/ws`);

    ws.onopen = () => {
      console.log('WebSocket connected. Joining session:', sessionId);
      ws.send(JSON.stringify({ session: sessionId, data: { type: 'join' } }));
      // Add the first window if the session is new
      if (windows().length === 0) {
        addWindow('alora://new', true); // Don't broadcast the very first one
      }
    };

    // Listen for global actions from other clients
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      switch (message.type) {
        case 'addWindow':
          addWindow(message.window.url, true);
          break;
        case 'closeWindow':
          closeWindow(message.id, true);
          break;
        case 'bringToFront':
          bringToFront(message.id, true);
          break;
      }
    };
    ws.onclose = () => console.log('WebSocket disconnected');
    ws.onerror = (err) => console.error('WebSocket error:', err);
  });

  // Helper to send updates to other clients
  const sendGlobalUpdate = (type: string, data: object) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ session: params.sessionId, data: { type, ...data } }));
    }
  };

  // --- Window Management Functions ---
  const addWindow = (url: string = 'alora://new', fromRemote: boolean = false) => {
    const newWindow = { id: crypto.randomUUID(), url: url, isClosing: false };
    setWindows(prev => [...prev, newWindow]);
    setStackingOrder(prev => [...prev, newWindow.id]);

    if (!fromRemote) {
      sendGlobalUpdate('addWindow', { window: newWindow });
    }
  };

  const closeWindow = (id: string, fromRemote: boolean = false) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isClosing: true } : w));
    setTimeout(() => {
      setWindows(prev => prev.filter(w => w.id !== id));
      setStackingOrder(prev => prev.filter(windowId => windowId !== id));
    }, 300);

    if (!fromRemote) {
      sendGlobalUpdate('closeWindow', { id });
    }
  };

  const bringToFront = (id: string, fromRemote: boolean = false) => {
    setStackingOrder(prev => {
      if (prev.length > 0 && prev[prev.length - 1] === id) return prev;
      return [...prev.filter(windowId => windowId !== id), id];
    });

    if (!fromRemote) {
      sendGlobalUpdate('bringToFront', { id });
    }
  };

  // --- UI Handlers ---
  const handleMouseDown = (e: MouseEvent) => {
    if (e.target !== appRef) return;
    setIsPanning(true);
    setLastPos({ x: e.clientX, y: e.clientY });
    if (appRef) appRef.style.cursor = 'grabbing';
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    if (appRef) appRef.style.cursor = 'grab';
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isPanning() || !appRef) return;
    const dx = e.clientX - lastPos().x;
    const dy = e.clientY - lastPos().y;
    setPanOffset({ x: panOffset().x + dx, y: panOffset().y + dy });
    setLastPos({ x: e.clientX, y: e.clientY });
  };

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    setPanOffset(prev => ({
      x: prev.x - (e.shiftKey ? e.deltaY : 0),
      y: prev.y - (e.shiftKey ? 0 : e.deltaY)
    }));
  };

  // --- Dock Component ---
  // Defined inside Home to have access to its functions
  function Dock() {
    const share = () => {
      const shareUrl = window.location.href;
      navigator.clipboard.writeText(shareUrl);
      alert(`Share link copied to clipboard: ${shareUrl}`);
    };
    return (
      <div class={styles.dock}>
        <button class={styles.button} onClick={() => addWindow()}><Plus size='18' /></button>
        <button class={styles.button} onClick={share}><Share2 size='18' /></button>
        <button class={styles.button}><ZoomOut size='18' /></button>
        <button class={styles.button} onClick={() => addWindow('alora://settings')}><SlidersHorizontal size='18' /></button>
      </div>
    );
  }

  // --- Render ---
  return (
    <div
      ref={appRef}
      class={styles.App}
      style={{ 'background-position': `${panOffset().x}px ${panOffset().y}px` }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp} // Use mouseup to also stop panning when leaving
      onMouseMove={handleMouseMove}
      onWheel={handleWheel}
    >
      <Dock />
      <For each={windows()}>{(item) => (
        <Window
          id={item.id}
          startUrl={item.url}
          zIndex={stackingOrder().indexOf(item.id)}
          onFocus={bringToFront}
          onClose={closeWindow}
          isClosing={item.isClosing}
          panOffset={panOffset()}
          ws={ws} // Pass the single WebSocket instance to each window
        />
      )}</For>
    </div>
  );
};

export default Home;