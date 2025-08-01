const injectable = `
(function () {
    if ((typeof window !== "object" || self.constructor !== Window) || window.parent === window) {
        return;
    }

    const notifyParentOfNavigation = (url) => {
    console.log(\`Notifying parent of navigation to $\{url\}\`)
        window.parent.postMessage({
            type: 'navigation',
            url: url,
            title: document.title || 'Loading...',
        }, window.location.origin);
    };

    if (window.navigation) {
        console.log('Using Navigation API.');
        window.navigation.addEventListener('navigate', (event) => {
            if (event.destination) {
                notifyParentOfNavigation(event.destination.url);
            }
        });
    }
    else {
        console.log('Using fallback for older browser.');
        const { pushState, replaceState } = history;

        history.pushState = function (state, title, url, ...rest) {
            if (url) {
                notifyParentOfNavigation(new URL(url, window.location.href).href);
            }
            return pushState.apply(history, [state, title, url, ...rest]);
        };

        history.replaceState = function (state, title, url, ...rest) {
            if (url) {
                notifyParentOfNavigation(new URL(url, window.location.href).href);
            }
            return replaceState.apply(history, [state, title, url, ...rest]);
        };

        window.addEventListener('popstate', () => {
            notifyParentOfNavigation(window.location.href);
        });

        window.addEventListener('hashchange', (event) => {
            notifyParentOfNavigation(event.newURL);
        });

        document.addEventListener('click', (event) => {
            const link = event.target.closest('a');
            if (link && link.href && link.getAttribute('href') && !link.href.startsWith('javascript:')) {
                if (link.target !== '_blank') {
                    notifyParentOfNavigation(link.href);
                }
            }
        }, true);

        document.addEventListener('submit', (event) => {
            const form = event.target.closest('form');
            if (form && form.action) {
                if (form.target !== '_blank') {
                    notifyParentOfNavigation(form.action);
                }
            }
        }, true);

        notifyParentOfNavigation(window.location.href);
    }
})();
`

export default injectable