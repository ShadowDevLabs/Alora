import type { Component } from "solid-js";
import styles from "../../assets/css/Settings.module.css";

type ThemesProps = {
  theme: string;
  setTheme: (val: string) => void;
};

const Themes: Component<ThemesProps> = (props) => {
  const onThemeChange = (e: Event) => {
    const selected = (e.target as HTMLSelectElement).value;
    localStorage.setItem("theme", selected);
    props.setTheme(selected);
    document.documentElement.className = selected;
  };

  return (
    <div class={styles.generalContent}>
      <div class={styles.settingSection}>
        <div class={styles.settingSectionTitle}>PreMade Themes</div>
        <div class={styles.settingSectionText}>
          Choose one of the premade themes below to change the appearance of Alora.
        </div>
        <select class={styles.select} onChange={onThemeChange} value={props.theme}>
          <option value="dark">Dark (Default)</option>
           <option value="operaGX">Opera GX</option>
            <option value="spaceBlue">Space Blue</option>
            <option value="royalNight">Royal Night</option>
        </select>
      </div>
      <div class={styles.settingSection}>
        <div class={styles.settingSectionTitle}>Custom Theme Gen</div>
        <div class={styles.settingSectionText}>
          You can create your own custom theme revolving around a certain color. Just change
          the color below!
        </div>
        <input type="color" class={styles.settingSectionColorInput} disabled />
      </div>
    </div>
  );
};

export default Themes;
