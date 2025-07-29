import type { Component } from 'solid-js';
import SettingsManager from '../../settings';
import styles from '../../assets/css/Settings.module.css';

const Themes: Component = () => {
    const onThemeChange = async (e: Event) => {
        const select = e.target as HTMLSelectElement;
        await SettingsManager.set('theme', select.value);
        console.log("Theme Set To:", SettingsManager.get('theme'));
        await SettingsManager.applyTheme();
    };

    return (
        <div class={styles.generalContent}>
            <div class={styles.settingSection}>
                <div class={styles.settingSectionTitle}>PreMade Themes</div>
                <div class={styles.settingSectionText}>Choose one of the premade themes below to change the appearance of Alora.</div>
                <select class={styles.select} onChange={onThemeChange}>
                    <option value="dark">Dark (Default)</option>
                    <option value="spaceBlue">Space Blue</option>
                </select>
            </div>
            <div class={styles.settingSection}>
                <div class={styles.settingSectionTitle}>Custom Theme Gen</div>
                <div class={styles.settingSectionText}>
                    You can create your own custom theme revolving around a certain color. Just change the color below!
                </div>
                <input type="color" class={styles.settingSectionColorInput} disabled />
            </div>
        </div>
    );
};

export default Themes;
