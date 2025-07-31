import type { Component } from 'solid-js';
import { createStore, unwrap } from 'solid-js/store';
import { onMount, For } from 'solid-js';
import Settings from '../../settings';
import styles from '../../assets/css/Settings.module.css';
import Rocket from 'lucide-solid/icons/rocket';

const PREMADE_CLOAKS = {
    'Google': { title: 'Google', icon: 'https://www.google.com/favicon.ico' },
    'Google Classroom': { title: 'Classes', icon: 'https://ssl.gstatic.com/classroom/favicon.ico' },
    'Canvas': { title: 'Dashboard', icon: 'https://canvas.instructure.com/favicon.ico' },
    'Khan Academy': { title: 'Dashboard | Khan Academy', icon: 'https://www.khanacademy.org/favicon.ico' },
    'Gmail': { title: 'Inbox', icon: 'https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico' },
    'Youtube': { title: 'YouTube', icon: 'https://www.youtube.com/favicon.ico' },
    'Zoom': { title: 'Zoom', icon: 'https://st1.zoom.us/zoom.ico' },
    'Google Meets': { title: 'Google Meet', icon: 'https://fonts.gstatic.com/s/i/productlogos/meet_2020q4/v1/favicon.ico' }
};

function abtblank(win: Window = window) {
  const url = win.location.href;
  const width = win.innerWidth;
  const height = win.innerHeight;

  const popup = win.open("about:blank", "", `width=${width},height=${height}`);

  if (!popup || popup.closed) {
    alert("Allow popups and redirects to hide this from showing up in your history.");
    return;
  }

  const doc = popup.document;
  doc.open();
  doc.write('<!DOCTYPE html><html><head><title>Alora Abt:Blank</title></head><body></body></html>');
  doc.close();

  const iframe = doc.createElement("iframe");
  const style = iframe.style;
  iframe.src = url;

  style.position = "fixed";
  style.top = style.bottom = style.left = style.right = "0";
  style.border = style.outline = "none";
  style.width = style.height = "100%";

  doc.body.appendChild(iframe);

  win.location.replace("https://google.com");
}

const General: Component = () => {
    // Use a single store for all settings
    const [settings, setSettings] = createStore<{ cloak: Cloak }>({
        cloak: { title: '', icon: '' },
    });

    const debounceTimers = new Map<string, number>();

    onMount(async () => {
        const cloak = await Settings.get("cloak") || { title: '', icon: '' };
        setSettings('cloak', cloak);
    });

    const saveSettingNow = async (key: string) => {
        if (debounceTimers.has(key)) {
            clearTimeout(debounceTimers.get(key));
            debounceTimers.delete(key);
        }
        console.log(`Saving setting: ${key}`, settings[key as keyof typeof settings]);
        await Settings.set(key, unwrap(settings[key as keyof typeof settings]));
    };

    const handleNestedInput = (parentKey: 'cloak', childKey: 'title' | 'icon', value: string) => {
        setSettings(parentKey, childKey, value);

        if (debounceTimers.has(parentKey)) {
            clearTimeout(debounceTimers.get(parentKey));
        }

        const timerId = setTimeout(() => saveSettingNow(parentKey), 750);
        debounceTimers.set(parentKey, timerId);
    };

    const handleSelectChange = (e: Event) => {
        const selectedName = (e.currentTarget as HTMLSelectElement).value;
        const selectedCloak = PREMADE_CLOAKS[selectedName as keyof typeof PREMADE_CLOAKS];

        if (selectedCloak) {
            setSettings('cloak', selectedCloak);
            saveSettingNow('cloak'); // Save immediately
        }
    };

    return (
        <div class={styles.generalContent}>
            <div class={styles.settingSection}>
                <div class={styles.settingSectionTitle}>Tab Cloaks</div>

                <input
                    type="text"
                    class={styles.input}
                    placeholder='Title'
                    value={settings.cloak.title || ''}
                    onInput={(e) => handleNestedInput('cloak', 'title', e.currentTarget.value)}
                    onBlur={() => saveSettingNow('cloak')}
                />

                <input
                    type="text"
                    class={styles.input}
                    placeholder='Favicon URL'
                    value={settings.cloak.icon || ''}
                    onInput={(e) => handleNestedInput('cloak', 'icon', e.currentTarget.value)}
                    onBlur={() => saveSettingNow('cloak')}
                />

                <div class={styles.settingSectionText}>PreMade Cloaks</div>
                <select class={styles.select} onChange={handleSelectChange}>
                    <option disabled selected>-- Select a Preset --</option>
                    <For each={Object.keys(PREMADE_CLOAKS)}>
                        {(cloakName) => <option>{cloakName}</option>}
                    </For>
                </select>
            </div>

            <div class={styles.settingSection}>
                <div class={styles.settingSectionTitle}>About:blank</div>
                <div class={styles.settingSectionText}>
                    The button below opens the site as an about:blank, hiding it from your history.
                </div>
                <button class={styles.settingSectionButton} onClick={() => abtblank(window.parent)}><Rocket class={styles.settingsSectionIcon} />Launch</button>

            </div>
        </div>
    );
};

export default General;