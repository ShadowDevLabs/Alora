import type { Component } from 'solid-js';
import { createSignal, Show, onMount } from 'solid-js';
import styles from '../assets/css/Settings.module.css';
import SettingsGear from 'lucide-solid/icons/settings';
import Palette from 'lucide-solid/icons/palette';
import SearchIcon from 'lucide-solid/icons/search';
import Code from 'lucide-solid/icons/code-xml';
import General from '../components/settings/General';
import Themes from '../components/settings/Themes';
import Search from '../components/settings/Search';
import '../assets/css/themes.css';

const Settings: Component = () => {
  const [theme, setTheme] = createSignal(localStorage.getItem("theme") ?? "dark");

  onMount(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "theme" && e.newValue && e.newValue !== theme()) {
        setTheme(e.newValue);
        document.documentElement.className = e.newValue;
      }
    };
    window.addEventListener("storage", onStorage);
    document.documentElement.className = theme();
    return () => window.removeEventListener("storage", onStorage);
  });

  const [content, setContent] = createSignal<"general" | "themes" | "search">("general");

  function switcher(to: "general" | "themes" | "search") {
    setContent(to);
  }

  return (
    <div class={styles.body}>
      <h1 class={styles.header}>Settings</h1>
      <div class={styles.navbar}>
        <button
          class={`${styles.tab} ${content() === "general" ? styles.active : ""}`}
          onClick={() => switcher("general")}
        >
          <SettingsGear size={24} /> General
        </button>
        <button
          class={`${styles.tab} ${content() === "themes" ? styles.active : ""}`}
          onClick={() => switcher("themes")}
        >
          <Palette size={24} /> Themes
        </button>
        <button
          class={`${styles.tab} ${content() === "search" ? styles.active : ""}`}
          onClick={() => switcher("search")}
        >
          <SearchIcon size={24} /> Search
        </button>
      </div>
      <div id="content">
        <Show when={content() === "general"}>
          <General />
        </Show>
        <Show when={content() === "themes"}>
          {/* Pass theme and setTheme to Themes component */}
          <Themes theme={theme()} setTheme={setTheme} />
        </Show>
        <Show when={content() === "search"}>
          <Search />
        </Show>
      </div>
    </div>
  );
};

export default Settings;

