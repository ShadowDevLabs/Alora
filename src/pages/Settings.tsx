import type { Component } from 'solid-js';
import { createSignal, Show } from 'solid-js';
import styles from '../assets/css/Settings.module.css';
import SettingsGear from 'lucide-solid/icons/settings';
import Palette from 'lucide-solid/icons/palette';
import SearchIcon from 'lucide-solid/icons/search';
import Code from 'lucide-solid/icons/code-xml';
import General from '../components/settings/General';
import Themes from '../components/settings/Themes';
import Search from '../components/settings/Search';

const Settings: Component = () => {
  const [content, setContent] = createSignal<'general' | 'themes' | 'search'>('general');

  function switcher(to: 'general' | 'themes' | 'search'): void {
    setContent(to);
  }

  return (
    <div class={styles.body}>
      <h1 class={styles.header}>Settings</h1>
      <div class={styles.navbar}>
        <button class={`${styles.tab} ${content() === 'general' ? styles.active : ''}`} onClick={() => switcher('general')}><SettingsGear size={24} /> General</button>
        <button class={`${styles.tab} ${content() === 'themes' ? styles.active : ''}`} onClick={() => switcher('themes')}><Palette size={24} /> Themes</button>
        <button class={`${styles.tab} ${content() === 'search' ? styles.active : ''}`} onClick={() => switcher('search')}><SearchIcon size={24} /> Search</button>
        {/*  <button class={styles.tab}><Code size={24} /> Developer</button> */}
      </div>
      <div id="content">
        <Show when={content() === 'general'}><General /></Show>
        <Show when={content() === 'themes'}><Themes /></Show>
        <Show when={content() === 'search'}><Search /></Show>
      </div>
    </div>
  );
};

export default Settings;
