import type { Component } from 'solid-js';
import { createSignal, createEffect, For } from 'solid-js';
import Settings from '../settings';
import '../assets/css/themes.css';

const Test: Component = () => {
    const [settings, setSettings] = createSignal(Settings.defaultSettings);
    createEffect(() => {
        Object.entries(settings()).forEach(([key, value]) => {
            Settings.set(key, value);
        });
    });
    return (
        <div style={{ background: 'black', width: '100%', height: '100vh', color: 'white' }}>
            <For each={Object.entries(settings())} fallback={<p>Loading...</p>}>{(item, index) => <p>{item[0]}: {item[1]}</p>}</For>
        </div>
    );
};

export default Test;