import type { Component } from 'solid-js';
import styles from '../assets/css/Window.module.css';
import Handle from 'lucide-solid/icons/ellipsis';
import Menu from 'lucide-solid/icons/logs';
import Reload from 'lucide-solid/icons/rotate-cw';
import { createSignal } from 'solid-js';

const Window: Component = () => {
    const [pos, setPos] = createSignal({ x: 0, y: 0 });

    const handleMouseDown = (e: MouseEvent) => {
        e.preventDefault();
        if (e.button !== 0) return;

        const initialPos = pos();
        const initialMousePos = { x: e.clientX, y: e.clientY };

        const handleMouseMove = (e: MouseEvent) => {
            const dx = e.clientX - initialMousePos.x;
            const dy = e.clientY - initialMousePos.y;

            setPos({
                x: initialPos.x + dx,
                y: initialPos.y + dy,
            });
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };


    return (
        <div class={styles.tab} style={{ transform: `translate(${pos().x}px, ${pos().y}px)`, position: 'absolute' }}
        >
            <div class={styles.tabBar} onMouseDown={handleMouseDown}>
                <div class={styles.info}>
                    <img src="https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://classroom.google.com&size=16" class={styles.favicon} />
                    <p class={styles.title}>Google</p>
                </div>

                <Handle class={styles.drag} />

                <div class={styles.controls} onMouseDown={(e) => e.stopPropagation()}>
                    <button class={styles.fullscreen}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-maximize-icon lucide-maximize"><path d="M8 3H5a2 2 0 0 0-2 2v3"></path><path d="M21 8V5a2 2 0 0 0-2-2h-3"></path><path d="M3 16v3a2 2 0 0 0 2 2h3"></path><path d="M16 21h3a2 2 0 0 0 2-2v-3"></path></svg></button>
                    <button class={styles.close}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg></button>
                </div>
            </div>

            <div class={styles.browserContainer}>
                <div class={styles.navControls}>
                    <button class={styles.navBtn} id="backBtn" title="Go back">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-left-icon lucide-arrow-left"><path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path></svg>
                    </button>
                    <button class={styles.navBtn} id="forwardBtn" title="Go forward">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right-icon lucide-arrow-right"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                    </button>
                    <button class={styles.navBtn} id="refreshBtn" title="Refresh">
                        <Reload />
                    </button>
                </div>

                <div class={styles.addressBar}>
                    <input type="text" class={styles.addressInput} placeholder="Search or enter web address" value="https://alora.app" id="addressInput" />
                </div>

                <button class={styles.menuBtn} title="More options">
                    <Menu />
                </button>
            </div>
            <iframe class={styles.tabContent} src="/new"></iframe>
        </div>
    );
};

export default Window;