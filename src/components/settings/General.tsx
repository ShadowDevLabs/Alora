import { Component } from 'solid-js';
import styles from '../../assets/css/Settings.module.css';
import Rocket from 'lucide-solid/icons/rocket';

const General: Component = () => {
    return (
        <div class={styles.generalContent}>
            <div class={styles.settingSection}>
                <div class={styles.settingSectionTitle}>Tab Cloaks</div>
                <input type="text" class={styles.input} placeholder='Title' />
                <input type="text" class={styles.input} placeholder='Favicon' />
                <div class={styles.settingSectionText}>PreMade Cloaks</div>
                <select class={styles.select}>
                    <option>Google</option>
                    <option>Google Classroom</option>
                    <option>Canvas</option>
                    <option>Khan Academy</option>
                    <option>Gmail</option>
                    <option>Youtube</option>
                    <option>Zoom</option>
                    <option>Googlemeets</option>
                </select>
            </div>
            <div class={styles.settingSection}>
                <div class={styles.settingSectionTitle}>About:blank</div>
                <div class={styles.settingSectionText}>
                    The button below opens the site as an about:blank, hiding it from your history.
                </div>
                <button class={styles.settingSectionButton}><Rocket class={styles.settingsSectionIcon} />Launch</button>
            </div>
        </div>
    );
};

export default General;
