import type { Component } from 'solid-js';
import { For, createSignal, onMount, Show, createEffect } from 'solid-js';
import { useParams, useNavigate } from "@solidjs/router";
import SlidersHorizontal from 'lucide-solid/icons/sliders-horizontal';
import Share2 from 'lucide-solid/icons/share-2';
import ZoomOut from 'lucide-solid/icons/zoom-out';
import Plus from 'lucide-solid/icons/plus';
import Window from '../components/Window';
import styles from '../assets/css/App.module.css';
import { init as initProxy } from '../proxy';
import Settings from '../settings';
import '../assets/css/themes.css';
import LiveShareMenu from '../components/LiveshareMenu';

window.addEventListener('transport', initProxy as EventListener);
initProxy();

const Home: Component = () => {
  const params = useParams();
  const navigate = useNavigate();
  let ws: WebSocket;
  let appRef: HTMLDivElement | undefined;

  const [liveShareOpen, setLiveShareOpen] = createSignal(false);
  const [windows, setWindows] = createSignal<{ id: string, url: string, isClosing?: boolean }[]>([]);
  const [stackingOrder, setStackingOrder] = createSignal<string[]>([]);
  const [panOffset, setPanOffset] = createSignal({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = createSignal(false);
  const [lastPos, setLastPos] = createSignal({ x: 0, y: 0 });

  const [cloak, setCloak] = createSignal({
    title: 'Alora',
    icon: '/icons/favicon.ico'
  });

  const loadAndApplyCloak = async () => {
    const cloakSettings = await Settings.get("cloak");
    console.log("1. Fetched settings from DB:", cloakSettings);
    setCloak({
      title: cloakSettings?.title || 'Alora',
      icon: cloakSettings?.icon || '/icons/favicon.ico'
    });
  };

  const startSession = () => {
    const sessionId = params.sessionId || crypto.randomUUID();
    if (!params.sessionId) {
      navigate(`/${sessionId}`, { replace: true });
    }
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
    ws.onopen = () => {
      console.log('WebSocket connected');
      ws.send(JSON.stringify({ session: sessionId, data: { type: 'join' } }));
      if (windows().length === 0) {
        addWindow('alora://new', true);
      }
    };
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
  };

  onMount(() => {
    loadAndApplyCloak();
    startSession();

    const cleanup = Settings.onUpdate((key) => {
      console.log(`Received update for setting: '${key}'`);
      if (key === 'cloak') {
        loadAndApplyCloak();
      }
    });

    return cleanup;
  });

  createEffect(() => {
    const currentCloak = cloak();
    console.log('3. Running effect to update document head...');

    document.title = currentCloak.title;
    console.log(`   - Set document.title to: "${document.title}"`);

    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
      console.log('   - Created new <link> for favicon.');
    }
    link.href = currentCloak.icon;
    console.log(`   - Set favicon href to: "${link.href}"`);
  });

  const sendGlobalUpdate = (type: string, data: object) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ session: params.sessionId, data: { type, ...data } }));
    }
  };

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

  function Dock() {
    const share = () => {
      setLiveShareOpen(!liveShareOpen);
      const sessionId = params.sessionId || crypto.randomUUID();
      if (!params.sessionId) {
        navigate(`/${sessionId}`, { replace: true });
      }
      ws.send(JSON.stringify({ session: sessionId, data: { type: 'share' } }));
    };
    return (
      <div class={styles.dock}>
        <button class={styles.button} onClick={() => addWindow()}><Plus size='18' /></button>
        <button class={styles.button} onClick={() => addWindow('alora://settings')}><SlidersHorizontal size='18' /></button>
        <button class={styles.button} onClick={share}><Share2 size='18' /></button>
        <button class={styles.button}><ZoomOut size='18' /></button>
      </div>
    );
  }

  return (
    <>
      <div ref={appRef} class={styles.App} style={{ 'background-position': `${panOffset().x}px ${panOffset().y}px` }} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onMouseMove={handleMouseMove} onWheel={handleWheel}>
        <Show when={liveShareOpen()}>
          <LiveShareMenu open={() => setLiveShareOpen(true)} sessionId='' close={() => setLiveShareOpen(false)} />
        </Show>
        <Dock />
        <For each={windows()}>{(item) => (
          <Window id={item.id} startUrl={item.url} zIndex={stackingOrder().indexOf(item.id)} onFocus={bringToFront} onClose={closeWindow} isClosing={item.isClosing} panOffset={panOffset()} ws={ws} />
        )}</For>
      </div>
    </>
  );
};

export default Home;