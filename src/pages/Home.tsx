import type { Component } from 'solid-js';
import { For, createSignal } from 'solid-js';
import SlidersHorizontal from 'lucide-solid/icons/sliders-horizontal';
import ZoomOut from 'lucide-solid/icons/zoom-out';
import Plus from 'lucide-solid/icons/plus';
import Window from '../components/Window';
import styles from '../assets/css/App.module.css';
import { init as initProxy } from '../proxy';

const [windows, setWindows] = createSignal<{ id: string, url: string, closing?: boolean }[]>([]);
const [stackingOrder, setStackingOrder] = createSignal<string[]>([]);
window.addEventListener('transport', initProxy as EventListener);
initProxy();

function Dock() {
  return (
    <div class={styles.dock}>
      <button class={styles.button} onClick={() => addWindow()}><Plus size='18' /></button>
      <button class={styles.button}><ZoomOut size='18' /></button>
      <button class={styles.button} onClick={() => addWindow('alora://settings')}><SlidersHorizontal size='18' /></button>
    </div>
  );
}

function closeWindow(id: string) {
  setWindows(prev =>
    prev.map(w => (w.id === id ? { ...w, closing: true } : w))
  );

  setTimeout(() => {
    setWindows(prev => prev.filter(w => w.id !== id));
    setStackingOrder(prev => prev.filter(windowId => windowId !== id));
  }, 300);
}

function addWindow(url?: string) {
  const newWindow = { id: crypto.randomUUID(), url: url || (windows().length == 2 ? 'alora://test' : 'alora://new'), closing: false };
  setWindows(prev => [...prev, newWindow]);
  setStackingOrder(prev => [...prev, newWindow.id]);
}

function bringToFront(id: string) {
  setStackingOrder(prev => {
    if (prev[prev.length - 1] === id) return prev;
    return [...prev.filter(windowId => windowId !== id), id];
  });
}

const Home: Component = () => {
  let appRef: HTMLDivElement | undefined;
  const [isPanning, setIsPanning] = createSignal(false);
  const [lastPos, setLastPos] = createSignal({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = createSignal({ x: 0, y: 0 });

  if (windows().length === 0) {
    addWindow();
  }

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

  const handleMouseLeave = () => {
    setIsPanning(false);
    if (appRef) appRef.style.cursor = 'grab';
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isPanning() || !appRef) return;
    const dx = e.clientX - lastPos().x;
    const dy = e.clientY - lastPos().y;
    setPanOffset({
      x: panOffset().x + dx,
      y: panOffset().y + dy
    });
    setLastPos({ x: e.clientX, y: e.clientY });
  };

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    setPanOffset(prev => ({
      x: prev.x - (e.shiftKey ? e.deltaY : 0),
      y: prev.y - (e.shiftKey ? 0 : e.deltaY)
    }));
  };

  return (
    <div
      ref={appRef}
      class={styles.App}
      style={{ 'background-position': `${panOffset().x}px ${panOffset().y}px` }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
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
          isClosing={item.closing}
          panOffset={panOffset()}
        />
      )}</For>
    </div>
  );
};

export default Home;