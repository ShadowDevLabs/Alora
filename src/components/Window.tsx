import type { Component } from 'solid-js';
import styles from '../assets/css/Window.module.css';
import Handle from 'lucide-solid/icons/ellipsis';
import Menu from 'lucide-solid/icons/logs';
import Reload from 'lucide-solid/icons/rotate-cw';
import Fullscreen from 'lucide-solid/icons/scan';
import Close from 'lucide-solid/icons/x';
import { createSignal, createEffect, onCleanup } from 'solid-js';
import { createFullscreen } from '@solid-primitives/fullscreen';
import IFrame from './IFrame';
import { init, parse, readable } from '../proxy'

interface WindowProps {
    id: string;
    url: string;
    zIndex: number;
    onFocus: (id: string) => void;
    onClose: (id: string) => void;
    class?: string;
    isClosing?: boolean;
}

const Window: Component<WindowProps> = (props) => {
    const [pos, setPos] = createSignal({ x: 0, y: 0 });
    const [fs, setFs] = createSignal(false);
    let fsRef: HTMLDivElement | undefined;
    createFullscreen(() => fsRef, fs);

    let searchRef: HTMLInputElement | undefined;

    createEffect(() => {
        const onFullscreenChange = () => {
            const isFullscreen = document.fullscreenElement != null;
            setFs(isFullscreen);
        };
        document.addEventListener('fullscreenchange', onFullscreenChange);
        onCleanup(() => {
            document.removeEventListener('fullscreenchange', onFullscreenChange);
        });
    });

    let iframeRef: HTMLIFrameElement | undefined;

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

    const handleIframeLoad = () => {
        try {
            const iframe = iframeRef;
            if (!iframe) return;

            const iframeDoc = iframe.contentWindow?.document;
            iframeDoc?.body.addEventListener('mousedown', () => {
                props.onFocus(props.id);
            });
        } catch (err) {
            console.warn("Couldn't attach listener: " + err);
        }
    };

    async function search(url?: string) {
        const parsed: string = await parse(url || (searchRef as HTMLInputElement).value);
        searchRef!.value = readable(parsed);
        iframeRef!.src = parsed;
    }

    return (
        <div
            ref={fsRef}
            onMouseDown={() => props.onFocus(props.id)}
            class={`${styles.tab} ${props.class || ''}`}
            style={
                !fs() ? {
                    'transform': `translate(${pos().x}px, ${pos().y}px) scale(${props.isClosing ? 0.9 : 1})`,
                    'opacity': props.isClosing ? 0 : 1,
                    'position': 'absolute',
                    'z-index': props.zIndex + 10,
                } : {
                    'position': 'absolute',
                    'top': '0px',
                    'left': '0px',
                    'width': '100%',
                    'height': '100%',
                    'z-index': 100
                }
            }
        >
            <div class={styles.tabBar} onMouseDown={handleMouseDown}>
                <div class={styles.info}>
                    <img src="https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://classroom.google.com&size=16" class={styles.favicon} />
                    <p class={styles.title}>Google</p>
                </div>
                <Handle class={styles.drag} />
                <div class={styles.controls} onMouseDown={(e) => {
                    e.stopPropagation();
                }}>
                    <div class={styles.controlBtn} onClick={() => { setFs(!fs()); }}><Fullscreen class={styles.fullscreen} /></div>
                    <div class={styles.controlBtn} onClick={() => { props.onClose(props.id) }}><Close class={styles.close} /></div>
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
                    <form onSubmit={(e) => { e.preventDefault(); console.log(searchRef?.value); search(); }} >
                        <input ref={searchRef} type="text" class={styles.addressInput} placeholder="Search or enter web address" value="alora://new" id="addressInput" />
                    </form>
                </div>
                <button class={styles.menuBtn} title="More options">
                    <Menu />
                </button>
            </div>
            <IFrame
                ref={(el) => (iframeRef = el)}
                class={styles.tabContent}
                src={props.url}
                onLoad={handleIframeLoad}
            />
        </div>
    );
};

export default Window;