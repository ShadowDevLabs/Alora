import { Component } from 'solid-js';
import styles from '../../assets/css/Settings.module.css';

const Search: Component = () => {
    return (
        <div class={styles.generalContent}>
            <div class={styles.settingSection}>
                <div class={styles.settingSectionTitle}>Search Engine</div>
                <div class={styles.settingSectionText}>Changing this will change the search engine used when searching.</div>
                <select class={styles.select}>
                    <option value="google" data-url="https://www.google.com/search?q=%s">Google</option>
                    <option value="bing" data-url="https://www.bing.com/search?q=%s"> Bing</option>
                    <option value="yahoo" data-url="https://search.yahoo.com/search?p=%s">Yahoo</option>
                    <option value="duckduckgo" data-url="https://duckduckgo.com/?q=%s">DuckDuckGo</option>
                    <option value="brave" data-url="https://search.brave.com/search?q=%s">Brave</option>
                    <option value="yandex" data-url="https://yandex.com/search/?text=%s">Yandex</option>
                </select>
            </div>
            <div class={styles.settingSection}>
                <div class={styles.settingSectionTitle}>Proxy Engine</div>
                <div class={styles.settingSectionText}>
                    This will change the proxy that is used when browsing on Alora.
                </div>
                <select class={styles.select}>
                    <option value="uv">Ultraviolet</option>
                    <option value="scramjet">Scramjet</option>
                </select>
            </div>
        </div>
    );
};

export default Search;
