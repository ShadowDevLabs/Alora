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
      <button class={styles.button} onClick={addWindow}><Plus size='18' /></button>
      <button class={styles.button}><SlidersHorizontal size='18' /></button>
      <button class={styles.button}><ZoomOut size='18' /></button>
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

function addWindow() {
  const newWindow = { id: crypto.randomUUID(), url: (windows().length == 2 ? '/test' : '/new'), closing: false };
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
  if (windows().length === 0) {
    addWindow();
  }

  return (
    <div class={styles.App}>
      <Dock />
      <For each={windows()}>{(item) => (
        <Window
          id={item.id}
          url={item.url}
          zIndex={stackingOrder().indexOf(item.id)}
          onFocus={bringToFront}
          onClose={closeWindow}
          isClosing={item.closing}
        />
      )}</For>
    </div>
  );
};

export default Home;