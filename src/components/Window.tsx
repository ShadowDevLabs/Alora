import type { Component } from 'solid-js';
import styles from '../assets/css/Window.module.css';
import { createSignal, createEffect, onCleanup, onMount, Show } from 'solid-js';
import { useParams } from "@solidjs/router";
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
import Maximize from 'lucide-solid/icons/maximize';
import IFrame from './IFrame';
import { parse, readable, icon } from '../proxy';

interface WindowProps {
    id: string;
    startUrl: string;
    zIndex: number;
    onFocus: (id: string) => void;
    onClose: (id: string) => void;
    ws: WebSocket;
    class?: string;
    isClosing?: boolean;
    panOffset: { x: number, y: number };
}

const Window: Component<WindowProps> = (props) => {
    const params = useParams();
    const [pos, setPos] = createSignal({
        x: (window.innerWidth / 2 - 475) - props.panOffset.x,
        y: (window.innerHeight / 2 - 475) - props.panOffset.y
    });
    const [size, setSize] = createSignal({ width: 950, height: 600 });
    const [fs, setFs] = createSignal(false);
    const [menu, setMenu] = createSignal(false);
    const [href, setHref] = createSignal<string>(props.startUrl);
    const [src, setSrc] = createSignal<string>('/new');
    const [title, setTitle] = createSignal<string>('New Tab');
    const iconUrl = () => icon(href());
    let fsRef: HTMLDivElement | undefined;
    let searchRef: HTMLInputElement | undefined;
    let iframeRef: HTMLIFrameElement | undefined;

    const sendUpdate = (type: string, data: object) => {
        if (props.ws && props.ws.readyState === WebSocket.OPEN) {
            props.ws.send(JSON.stringify({
                session: params.sessionId,
                data: { type, id: props.id, ...data }
            }));
        }
    };

    onMount(() => {
        search(props.startUrl, true);
    });

    createEffect(() => {
        const handleWsMessage = (event: MessageEvent) => {
            try {
                const message = JSON.parse(event.data);
                if (message.id !== props.id) return;

                switch (message.type) {
                    case 'move':
                        if (message.pos) setPos(message.pos);
                        break;
                    case 'resize':
                        if (message.size) setSize(message.size);
                        break;
                    case 'navigate':
                        if (message.src) setSrc(message.src);
                        if (message.href) {
                            setHref(message.href);
                            if (searchRef) searchRef.value = message.href;
                        }
                        if (message.title) setTitle(message.title);
                        break;
                }
            } catch (e) {
                console.error("Failed to parse WebSocket message", e);
            }
        };

        if (props.ws) {
            props.ws.addEventListener('message', handleWsMessage);
            onCleanup(() => props.ws.removeEventListener('message', handleWsMessage));
        }
    });

    createEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.source !== iframeRef?.contentWindow || !event.data || event.data.type !== 'navigation') {
                return;
            }
            const newUrl = readable(new URL(event.data.url.toString()).pathname);
            const newTitle = event.data.title || 'New Tab';
            setHref(newUrl);
            setTitle(newTitle);
            if (searchRef) searchRef.value = newUrl;
            sendUpdate('navigate', { href: newUrl, src: event.data.url, title: newTitle });
        };
        window.addEventListener('message', handleMessage);
        onCleanup(() => window.removeEventListener('message', handleMessage));
    });

    createEffect(() => {
        const onFullscreenChange = () => setFs(document.fullscreenElement != null);
        document.addEventListener('fullscreenchange', onFullscreenChange);
        onCleanup(() => document.removeEventListener('fullscreenchange', onFullscreenChange));
    });

    async function search(url?: string, isInitial = false) {
        const inputVal = url || searchRef?.value || 'alora://new';
        const parsedSrc = await parse(inputVal);
        const readableHref = readable(parsedSrc);

        setHref(readableHref);
        setSrc(parsedSrc);
        setTitle('Loading...');
        if (searchRef) searchRef.value = readableHref;

        if (!isInitial) {
            sendUpdate('navigate', { href: readableHref, src: parsedSrc, title: 'Loading...' });
        }
    }

    const handleMouseDown = (e: MouseEvent) => {
        if (e.button !== 0 || fs()) return;
        props.onFocus(props.id);
        const startPos = pos();
        const startMouse = { x: e.clientX, y: e.clientY };

        document.body.style.userSelect = 'none';

        const shield = document.createElement('div');
        shield.style.position = 'fixed';
        shield.style.inset = '0';
        shield.style.zIndex = '99999';
        shield.style.cursor = 'grabbing';
        document.body.appendChild(shield);

        const doDrag = (moveEvent: MouseEvent) => {
            if (moveEvent.buttons !== 1) {
                onDragEnd();
                return;
            }
            const dx = moveEvent.clientX - startMouse.x;
            const dy = moveEvent.clientY - startMouse.y;
            setPos({ x: startPos.x + dx, y: startPos.y + dy });
        };

        const onDragEnd = () => {
            // Re-enable text selection
            document.body.style.userSelect = '';
            shield.remove();
            shield.removeEventListener('mousemove', doDrag);
            shield.removeEventListener('mouseup', onDragEnd);
            sendUpdate('move', { pos: pos() });
        };

        shield.addEventListener('mousemove', doDrag);
        shield.addEventListener('mouseup', onDragEnd, { once: true });
    };

    const handleResizeMouseDown = (e: MouseEvent, direction: string) => {
        e.preventDefault();
        e.stopPropagation();
        props.onFocus(props.id);

        const startSize = size();
        const startPos = pos();
        const startMouse = { x: e.clientX, y: e.clientY };
        const minWidth = 440, minHeight = 220;

        // Prevent text selection during resize
        document.body.style.userSelect = 'none';

        const shield = document.createElement('div');
        shield.style.position = 'fixed';
        shield.style.inset = '0';
        shield.style.zIndex = '99999';
        shield.style.cursor = window.getComputedStyle(e.target as Element).cursor;
        document.body.appendChild(shield);

        const doResize = (moveEvent: MouseEvent) => {
            if (moveEvent.buttons !== 1) {
                onResizeEnd();
                return;
            }
            const dx = moveEvent.clientX - startMouse.x;
            const dy = moveEvent.clientY - startMouse.y;
            let newPos = { ...pos() };
            let newSize = { ...size() };

            if (direction.includes('right')) newSize.width = Math.max(minWidth, startSize.width + dx);
            if (direction.includes('bottom')) newSize.height = Math.max(minHeight, startSize.height + dy);
            if (direction.includes('left')) {
                const updatedWidth = Math.max(minWidth, startSize.width - dx);
                newSize.width = updatedWidth;
                newPos.x = startPos.x + (startSize.width - updatedWidth);
            }
            if (direction.includes('top')) {
                const updatedHeight = Math.max(minHeight, startSize.height - dy);
                newSize.height = updatedHeight;
                newPos.y = startPos.y + (startSize.height - updatedHeight);
            }
            setPos(newPos);
            setSize(newSize);
        };

        const onResizeEnd = () => {
            // Re-enable text selection
            document.body.style.userSelect = '';
            shield.remove();
            shield.removeEventListener('mousemove', doResize);
            shield.removeEventListener('mouseup', onResizeEnd);
            sendUpdate('resize', { size: size() });
            sendUpdate('move', { pos: pos() });
        };

        shield.addEventListener('mousemove', doResize);
        shield.addEventListener('mouseup', onResizeEnd, { once: true });
    };

    const handleIframeLoad = () => {
        try {
            if (!iframeRef?.contentWindow) return;
            const iframeDoc = iframeRef.contentWindow.document;
            iframeDoc.body.addEventListener('mousedown', () => props.onFocus(props.id));
            if (title() === 'Loading...') {
                setTitle(iframeDoc.title || 'New Tab');
                sendUpdate('navigate', { title: iframeDoc.title || 'New Tab' });
            }
        } catch (err) {
            console.warn("Couldn't attach listener: " + err);
        }
    };

    const goBack = () => iframeRef?.contentWindow?.history.back();
    const goForward = () => iframeRef?.contentWindow?.history.forward();
    const reloadFrame = () => iframeRef?.contentWindow?.location.reload();
    const partialFs = () => {
        if (document.fullscreenElement) document.exitFullscreen();
        setFs(!fs());
    }
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) fsRef?.requestFullscreen();
        else document.exitFullscreen();
    };

    return (
        <div
            ref={fsRef}
            onMouseDown={() => props.onFocus(props.id)}
            class={`${styles.tab} ${props.class || ''}`}
            style={
                !fs() ? {
                    'width': `${size().width}px`,
                    'height': `${size().height}px`,
                    'transform': `translate(${pos().x + props.panOffset.x}px, ${pos().y + props.panOffset.y}px) scale(${props.isClosing ? 0.9 : 1})`,
                    'opacity': props.isClosing ? 0 : 1,
                    'position': 'absolute',
                    'z-index': props.zIndex + 10,
                } : {
                    'position': 'fixed', 'margin': '0', 'top': '0px', 'left': '0px',
                    'width': '100%', 'height': '100%', 'z-index': 100
                }
            }
        >
            <div class={`${styles.resizeHandle} ${styles.topLeft}`} onMouseDown={(e) => handleResizeMouseDown(e, 'top-left')}></div>
            <div class={`${styles.resizeHandle} ${styles.top}`} onMouseDown={(e) => handleResizeMouseDown(e, 'top')}></div>
            <div class={`${styles.resizeHandle} ${styles.topRight}`} onMouseDown={(e) => handleResizeMouseDown(e, 'top-right')}></div>
            <div class={`${styles.resizeHandle} ${styles.left}`} onMouseDown={(e) => handleResizeMouseDown(e, 'left')}></div>
            <div class={`${styles.resizeHandle} ${styles.right}`} onMouseDown={(e) => handleResizeMouseDown(e, 'right')}></div>
            <div class={`${styles.resizeHandle} ${styles.bottomLeft}`} onMouseDown={(e) => handleResizeMouseDown(e, 'bottom-left')}></div>
            <div class={`${styles.resizeHandle} ${styles.bottom}`} onMouseDown={(e) => handleResizeMouseDown(e, 'bottom')}></div>
            <div class={`${styles.resizeHandle} ${styles.bottomRight}`} onMouseDown={(e) => handleResizeMouseDown(e, 'bottom-right')}></div>

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
                    <button class={styles.navBtn} disabled={!iframeRef?.contentWindow?.navigation.canGoBack} onClick={goBack} title="Go back"><ArrowLeft /></button>
                    <button class={styles.navBtn} disabled={!iframeRef?.contentWindow?.navigation.canGoForward} onClick={goForward} title="Go forward"><ArrowRight /></button>
                    <button class={styles.navBtn} onClick={reloadFrame} title="Refresh"><Reload /></button>
                </div>
                <div class={styles.addressBar}>
                    <form onSubmit={(e) => { e.preventDefault(); search(); }} >
                        <input ref={searchRef} type="text" class={styles.addressInput} placeholder="Search or enter web address" />
                    </form>
                </div>
                <div class={styles.menuWrapper}>
                    <button class={styles.menuBtn} title="More options" onClick={() => setMenu(!menu())}><Menu /></button>
                    <Show when={menu()}>
                        <div class={styles.menuPopup} onMouseDown={(e) => e.stopPropagation()} onClick={() => setMenu(false)}>
                            <div class={styles.menuItem}><Plus class={styles.menuItemIcon} /> New Tab</div>
                            <div class={styles.menuItem} onclick={() => search("alora://settings")}><Settings class={styles.menuItemIcon} /> Settings</div>
                            <div class={styles.menuItem} onclick={() => search("alora://books")} ><Gamepad2 class={styles.menuItemIcon} /> Games</div>
                            <div class={styles.menuItem} onclick={() => search("alora://ai")}><Sparkles class={styles.menuItemIcon} /> Ai</div>
                            <div class={styles.menuDivider}></div>
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