import { Component, onMount } from 'solid-js';
import styles from '../assets/css/New.module.css';

interface Shortcut {
  name: string;
  url: string;
}

const NewPage: Component = () => {
  const shortcutsTempList: Shortcut[] = [
    { name: 'Netflix', url: 'netflix.com' },
    { name: 'YouTube', url: 'youtube.com' },
    { name: 'TikTok', url: 'tiktok.com' },
    { name: 'Discord', url: 'discord.com' },
    { name: 'GitHub', url: 'github.com' },
    { name: 'Spotify', url: 'spotify.com' },
    { name: 'Twitter', url: 'twitter.com' },
    { name: 'ShuttleAI', url: 'shuttleai.com' }
  ];

  const getFaviconUrl = (domain: string): string => {
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  };

  return (
    <main class={styles.mainContent}>
      <h1 class={styles.logoTitle}>Alora</h1>

      <div class={styles.searchContainer}>
        <img src="assets/imgs/icons/shadow.png" class={styles.shadowIcon} alt="Shadow Icon" />
        <input type="text" class={styles.mainSearch} placeholder="Ask ShadowAI anything..." />
      </div>

      <div class={styles.shortcuts} id="shortcuts">
        {shortcutsTempList.map((site) => (
          <a 
            class={styles.shortcutCard} 
            href={`https://${site.url}`} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <div class={styles.shortcutIcon}>
              <img 
                src={getFaviconUrl(site.url)} 
                alt={site.name} 
                loading="lazy" 
              />
            </div>
            <div class={styles.shortcutTitle}>{site.name}</div>
          </a>
        ))}
      </div>
    </main>
  );
};

export default NewPage;
