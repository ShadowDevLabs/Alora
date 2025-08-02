import type { Component } from 'solid-js';
import { createSignal, onMount } from 'solid-js';
import Settings from '../../settings';
import styles from '../../assets/css/Settings.module.css';

const Search: Component = () => {
    const [searchUrl, setSearchUrl] = createSignal('');
    const [proxy, setProxy] = createSignal('');

    onMount(async () => {
        setSearchUrl(await Settings.get('searchEngine'));
        setProxy(await Settings.get('proxy'));
    });

    return (
        <div class={styles.generalContent}>
            <div class={styles.settingSection}>
                <div class={styles.settingSectionTitle}>Search Engine</div>
                <div class={styles.settingSectionText}>Changing this will change the search engine used when searching.</div>
                <select
                    class={styles.select}
                    value={searchUrl()}
                    onChange={e => Settings.set("searchEngine", e.currentTarget.selectedOptions[0].dataset.url!)}
                >
                    <option value="https://www.google.com/search?q={query}" data-url="https://www.google.com/search?q={query}">Google</option>
                    <option value="https://www.bing.com/search?q={query}" data-url="https://www.bing.com/search?q={query}">Bing</option>
                    <option value="https://search.yahoo.com/search?p={query}" data-url="https://search.yahoo.com/search?p={query}">Yahoo</option>
                    <option value="https://duckduckgo.com/?q={query}" data-url="https://duckduckgo.com/?q={query}">DuckDuckGo</option>
                    <option value="https://search.brave.com/search?q={query}" data-url="https://search.brave.com/search?q={query}">Brave</option>
                    <option value="https://yandex.com/search/?text={query}s" data-url="https://yandex.com/search/?text={query}">Yandex</option>
                </select>
            </div>

            <div class={styles.settingSection}>
                <div class={styles.settingSectionTitle}>Proxy Engine</div>
                <div class={styles.settingSectionText}>
                    This will change the proxy that is used when browsing on Alora.
                </div>
                <select
                    class={styles.select}
                    value={proxy()}
                    onChange={e => Settings.set("proxy", e.currentTarget.value)}
                >
                    <option value="uv">Ultraviolet</option>
                    <option value="scramjet">Scramjet</option>
                </select>
            </div>
        </div>
    );
};

export default Search;
