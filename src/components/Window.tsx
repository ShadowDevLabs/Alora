import type { Component } from 'solid-js';
import styles from '../assets/css/Window.module.css';
import { createSignal, createEffect, onCleanup, onMount, Show } from 'solid-js';
import Handle from 'lucide-solid/icons/ellipsis';
import Menu from 'lucide-solid/icons/logs';
import Reload from 'lucide-solid/icons/rotate-cw';
import FullscreenIcon from 'lucide-solid/icons/scan';
import Close from 'lucide-solid/icons/x';
import Plus from 'lucide-solid/icons/plus';
import ArrowLeft from 'lucide-solid/icons/arrow-left';
import ArrowRight from 'lucide-solid/icons/arrow-right';
import Settings from 'lucide-solid/icons/settings';
import Gamepad2 from 'lucide-solid/icons/gamepad-2';
import Sparkles from 'lucide-solid/icons/sparkles';
import AppWindow from 'lucide-solid/icons/app-window';
import Maximize from 'lucide-solid/icons/maximize';

import IFrame from './IFrame';
import { parse, readable, icon } from '../proxy';

interface WindowProps {
    id: string;
    startUrl: string;
    zIndex: number;
    onFocus: (id: string) => void;
    onClose: (id: string) => void;
    class?: string;
    isClosing?: boolean;
}

const Window: Component<WindowProps> = (props) => {
    const [pos, setPos] = createSignal({ x: window.innerWidth / 2 - 475, y: -100 });
    const [fs, setFs] = createSignal(false);
    const [menu, setMenu] = createSignal(false);
    const [href, setHref] = createSignal<string>(props.startUrl);
    const [src, setSrc] = createSignal<string>('/new');
    const [title, setTitle] = createSignal<string>('New Tab');
    const iconUrl = () => icon(href());
    let fsRef: HTMLDivElement | undefined;
    let searchRef: HTMLInputElement | undefined;
    let iframeRef: HTMLIFrameElement | undefined;

    onMount(async () => {
        window.dispatchEvent(new CustomEvent('transport', { detail: { type: 'init' } }));
        if (searchRef) {
            searchRef.value = href();
        }
        setSrc(await parse(href()));
    });

    createEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.source !== iframeRef?.contentWindow || !event.data || typeof event.data !== 'object') {
                return;
            }

            if (event.data.type === 'navigation') {
                const newUrl = readable(new URL(event.data.url.toString()).pathname);
                setHref(newUrl);
                setTitle(event.data.title || 'New Tab');
                if (searchRef) {
                    searchRef.value = newUrl;
                }
            }
        };
        window.addEventListener('message', handleMessage);
        onCleanup(() => window.removeEventListener('message', handleMessage));
    });

    createEffect(() => {
        const onFullscreenChange = () => {
            setFs(document.fullscreenElement != null);
        };
        document.addEventListener('fullscreenchange', onFullscreenChange);
        onCleanup(() => document.removeEventListener('fullscreenchange', onFullscreenChange));
    });

    const handleMouseDown = (e: MouseEvent) => {
        e.preventDefault();
        if (e.button !== 0 || fs()) return;
        const initialPos = pos();
        const initialMousePos = { x: e.clientX, y: e.clientY };
        const handleMouseMove = (e: MouseEvent) => {
            const dx = e.clientX - initialMousePos.x;
            const dy = e.clientY - initialMousePos.y;
            setPos({ x: initialPos.x + dx, y: initialPos.y + dy });
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
            if (!iframeRef?.contentWindow) return;
            const iframeDoc = iframeRef.contentWindow.document;
            iframeDoc.body.addEventListener('mousedown', () => props.onFocus(props.id));
            setTitle(iframeDoc.title || 'New Tab');
        } catch (err) {
            console.warn("Couldn't attach listener: " + err);
        }
    };

    async function search(url?: string) {
        const inputVal = url || (searchRef as HTMLInputElement).value;
        const parsed: string = await parse(inputVal);
        const clean: string = readable(parsed);
        setHref(clean);
        setSrc(parsed);
        if (searchRef) {
            searchRef.value = clean;
        }
    }

    const goBack = () => iframeRef?.contentWindow?.history.back();
    const goForward = () => iframeRef?.contentWindow?.history.forward();
    const reloadFrame = () => iframeRef?.contentWindow?.location.reload();
    const partialFs = () => {
        if (document.fullscreenElement) document.exitFullscreen();
        setFs(!fs());
    }
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            fsRef?.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

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
                    'position': 'fixed',
                    'margin': '0',
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
                    <img src={iconUrl()} class={styles.favicon} />
                    <p class={styles.title}>{title()}</p>
                </div>
                <Handle class={styles.drag} />
                <div class={styles.controls} onMouseDown={(e) => e.stopPropagation()}>
                    <div class={styles.controlBtn} onClick={partialFs}><FullscreenIcon class={styles.fullscreen} /></div>
                    <div class={styles.controlBtn} onClick={() => props.onClose(props.id)}><Close class={styles.close} /></div>
                </div>
            </div>

            <div class={styles.browserContainer}>
                <div class={styles.navControls}>
                    <button class={styles.navBtn} disabled={!iframeRef?.contentWindow?.navigation?.canGoBack} onClick={goBack} id="backBtn" title="Go back"><ArrowLeft /></button>
                    <button class={styles.navBtn} disabled={!iframeRef?.contentWindow?.navigation?.canGoForward} onClick={goForward} id="forwardBtn" title="Go forward"><ArrowRight /></button>
                    <button class={styles.navBtn} onClick={reloadFrame} id="refreshBtn" title="Refresh"><Reload /></button>
                </div>
                <div class={styles.addressBar}>
                    <form onSubmit={(e) => { e.preventDefault(); search(); }} >
                        <input ref={searchRef} type="text" class={styles.addressInput} placeholder="Search or enter web address" id="addressInput" />
                    </form>
                </div>
                <div class={styles.menuWrapper}>
                    <button class={styles.menuBtn} title="More options" onClick={() => setMenu(!menu())}><Menu /></button>
                    <Show when={menu()}>
                        <div class={styles.menuPopup} onMouseDown={(e) => e.stopPropagation()} onClick={() => setMenu(false)}>
                            <div class={styles.menuItem}><Plus class={styles.menuItemIcon} /> New Tab</div>
                            <div class={styles.menuItem}><Settings class={styles.menuItemIcon} /> Settings</div>
                            <div class={styles.menuItem}><Gamepad2 class={styles.menuItemIcon} /> Games</div>
                            <div class={styles.menuItem}><Sparkles class={styles.menuItemIcon} /> Ai</div>
                            <div class={styles.menuDivider}></div>
                            <div class={styles.menuItem}><AppWindow class={styles.menuItemIcon} /> Open Tab Abt:Blnk</div>
                            <div class={styles.menuItem}><AppWindow class={styles.menuItemIcon} /> Open Wnd Abt:Blnk</div>
                            <div class={styles.menuItem} onClick={partialFs}><Maximize class={styles.menuItemIcon} /> Fullscreen Tab</div>
                            <div class={styles.menuItem} onClick={toggleFullscreen}><FullscreenIcon class={styles.menuItemIcon} /> Fullscreen Window</div>
                        </div>
                    </Show>
                </div>
            </div>
            <IFrame
                ref={(el) => (iframeRef = el)}
                class={styles.tabContent}
                src={src()}
                onLoad={handleIframeLoad}
            />
        </div>
    );
};

export default Window;