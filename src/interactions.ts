function getElementSelector(el: any): string | null {
    if (!el || !el.tagName) return null;

    if (el.id) {
        return `#${el.id}`;
    }

    let selector = el.tagName.toLowerCase();
    const classNames = el.className.trim();


    if (classNames) {
        selector += `.${classNames.split(' ').join('.')}`;
    }

    return selector;
}

function serializeEvent(e: Event): object | null {
    if (!(e.target instanceof Element)) return null;

    const serialized: any = {
        type: e.type,
        targetSelector: getElementSelector(e.target),
        timeStamp: e.timeStamp,
    };

    if (e instanceof MouseEvent) {
        serialized.x = e.clientX;
        serialized.y = e.clientY;
    } else if (e instanceof KeyboardEvent) {
        serialized.key = e.key;
        serialized.code = e.code;
    } else if (e instanceof InputEvent) {
        serialized.value = (e.target as HTMLInputElement).value;
    } else if (e instanceof Event && e.type === 'scroll') {
        serialized.scrollTop = (e.target as HTMLElement).scrollTop;
        serialized.scrollLeft = (e.target as HTMLElement).scrollLeft;
    }


    return serialized;
}

export function broadcastInteractions(iframe: HTMLIFrameElement, id: string) {
    const eventsToHook = [
        'mousedown', 'mouseup', 'click', 'dblclick', 'mousemove', 'mouseover', 'mouseout',
        'keydown', 'keyup', 'keypress',
        'touchstart', 'touchend', 'touchmove',
        'scroll', 'wheel',
        'focus', 'blur',
        'input', 'change', 'submit',
        'drag', 'dragstart', 'dragend', 'dragenter', 'dragleave', 'dragover', 'drop',
        'select', 'contextmenu', 'toggle'
    ];

    const forwardEvent = (e: Event) => {
        const serialized = serializeEvent(e);
        if (serialized) {
            window.parent.postMessage({
                type: 'interaction',
                id: id,
                event: serialized
            }, '*');
        }
    };

    if (iframe.contentWindow) {
        eventsToHook.forEach(eventType => {
            iframe.contentWindow!.document.body.addEventListener(eventType, forwardEvent, true);
        });
    }
}