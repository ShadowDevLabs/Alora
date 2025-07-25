import type { Component } from 'solid-js';
import styles from '../assets/css/Settings.module.css';
import SettingsGear from 'lucide-solid/icons/settings';
import Palette from 'lucide-solid/icons/palette';
import Search from 'lucide-solid/icons/search';
import Code from 'lucide-solid/icons/code-xml';
import General from '../components/settings/General'
const Settings: Component = () => {
  return (
    <div class={styles.body}>
      <h1 class={styles.header}>Settings</h1>
      <div class={styles.navbar}>
        <button class={`${styles.tab} ${styles.active}`}><SettingsGear size={24} /> General</button>
        <button class={styles.tab}><Palette size={24} /> Themes</button>
        <button class={styles.tab}><Search size={24} /> Search</button>
        <button class={styles.tab}><Code size={24} /> Developer</button>
      </div>
      <div id="content">
        <General />
      </div>
    </div>
  );
};

export default Settings;
