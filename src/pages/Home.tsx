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
  let liveShareRef: typeof LiveShareMenu | undefined

  const [liveShareOpen, setLiveShareOpen] = createSignal(false);
  const [windows, setWindows] = createSignal<{ id: string, url: string, isClosing?: boolean }[]>([]);
  const [stackingOrder, setStackingOrder] = createSignal<string[]>([]);
  const [panOffset, setPanOffset] = createSignal({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = createSignal(false);
  const [lastPos, setLastPos] = createSignal({ x: 0, y: 0 });
  const [sessionId, setSessionId] = createSignal(params.sessionId);

  const [cloak, setCloak] = createSignal({
    title: 'Alora',
    icon: '/icons/favicon.ico'
  });

  const loadAndApplyCloak = async () => {
    const cloakSettings = await Settings.get("cloak");
    setCloak({
      title: cloakSettings?.title || 'Alora',
      icon: cloakSettings?.icon || '/icons/favicon.ico'
    });
  };


  const startSession = (id?: string) => {
    setSessionId(id || params.sessionId || crypto.randomUUID());
    if (!params.sessionId) {
      navigate(`/${sessionId()}`, { replace: true });
    }
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
    ws.onopen = () => {
      console.log('WebSocket connected');
      ws.send(JSON.stringify({ session: sessionId, data: { type: 'join' } }));
    };
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.id) //send to window with id;
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
          case 'move':
            //Implement
            break;
          case 'resize':
            //Implement
            break;
        }
    };
    ws.onclose = () => console.log('WebSocket disconnected');
    ws.onerror = (err) => console.error('WebSocket error:', err);
    return sessionId();
  };

  if (params.sessionId) startSession();

  const endSession = () => {
    navigate('/', { replace: true });
    ws?.close();
  }

  onMount(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'theme' && e.newValue && document.documentElement.className !== e.newValue) {
        document.documentElement.className = e.newValue;
      }
    };
    window.addEventListener('storage', onStorage);
    document.documentElement.className = localStorage.getItem('theme') ?? 'dark';

    loadAndApplyCloak();
    if (windows().length === 0) {
      addWindow('alora://new', true);
    }

    const cleanupSettings = Settings.onUpdate((key) => {
      if (key === 'cloak') loadAndApplyCloak();
    });

    return () => {
      window.removeEventListener('storage', onStorage);
      cleanupSettings();
    };
  });


  createEffect(() => {
    const currentCloak = cloak();
    document.title = currentCloak.title;

    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = currentCloak.icon;
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
    return (
      <div class={styles.dock}>
        <button class={styles.button} onClick={() => addWindow()}><Plus size='18' /></button>
        <button class={styles.button} onClick={() => addWindow('alora://settings')}><SlidersHorizontal size='18' /></button>
        <button class={styles.button} onClick={() => setLiveShareOpen(!liveShareOpen())}><Share2 size='18' /></button>
        <button class={styles.button}><ZoomOut size='18' /></button>
      </div>
    );
  }

  return (
    <>
      <div ref={appRef} class={styles.App} style={{ 'background-position': `${panOffset().x}px ${panOffset().y}px` }} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onMouseMove={handleMouseMove} onWheel={handleWheel}>
        <Dock />
        <For each={windows()}>{(item) => (
          <Window id={item.id} startUrl={item.url} zIndex={stackingOrder().indexOf(item.id)} onFocus={bringToFront} onClose={closeWindow} isClosing={item.isClosing} panOffset={panOffset()} ws={ws} />
        )}</For>
        <Show when={liveShareOpen()}>
          <LiveShareMenu sessionId={sessionId()} open={() => setLiveShareOpen(true)} close={() => setLiveShareOpen(false)} openSession={startSession} closeSession={endSession} />
        </Show>
      </div>
    </>
  );
};

export default Home;