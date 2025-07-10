import type { Component } from 'solid-js'
import ZoomIn from 'lucide-solid/icons/zoom-in'
import ZoomOut from 'lucide-solid/icons/zoom-out'
import Plus from 'lucide-solid/icons/plus'
import Window from '../components/Window';
import styles from '../assets/css/App.module.css';

const Home: Component = () => {
  return (
    <div class={styles.App}>
      <div class={styles.dock}>
        <button class={styles.button} onclick={() => {}}><Plus size='18'/></button>
        <button class={styles.button}><ZoomIn size='18'/></button>
        <button class={styles.button}><ZoomOut size='18'/></button>
      </div>
      <Window />
    </div>
  )
}

export default Home