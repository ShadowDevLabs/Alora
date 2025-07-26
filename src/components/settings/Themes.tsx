import type { Component } from 'solid-js';
import { createSignal } from 'solid-js';
import Settings from '../../settings';
import styles from '../../assets/css/Settings.module.css';

const Themes: Component = () => {
    return (
        <div class={styles.generalContent}>
            <div class={styles.settingSection}>
                <div class={styles.settingSectionTitle}>PreMade Themes</div>
                <div class={styles.settingSectionText}>Choose one of the premade themes below to change the appearance of Alora.</div>
                <select class={styles.select}>
                    <option>Dark (Default)</option>
                    <option>Black / Blue</option>
                </select>
            </div>
            <div class={styles.settingSection}>
                <div class={styles.settingSectionTitle}>Custom Theme Gen</div>
                <div class={styles.settingSectionText}>
                    You can create your own custom theme revolving around a certain color. Just change the color below!
                </div>
                <input type="color" class={styles.settingSectionColorInput} />
            </div>
        </div>
    );
};

export default Themes;
