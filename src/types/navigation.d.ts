interface NavigationDestination {
    readonly url: string;
    readonly key: string | null;
    readonly id: string | null;
    readonly index: number;
    readonly sameDocument: boolean;
    getState(): unknown;
}

interface NavigationHistoryEntry extends EventTarget {
    readonly id: string;
    readonly index: number;
    readonly key: string;
    readonly sameDocument: boolean;
    readonly url: string | null;
    getState(): unknown;
}

interface NavigationActivation extends NavigationHistoryEntry {
    readonly navigationType: NavigationType;
    readonly destination: NavigationDestination;
    readonly from: NavigationHistoryEntry | null;
}

interface NavigationTransition {
    readonly navigationType: NavigationType;
    readonly from: NavigationHistoryEntry;
    readonly finished: Promise<void>;
}

interface NavigationOptions {
    info?: any;
}

interface NavigationNavigateOptions extends NavigationOptions {
    state?: any;
    history?: "auto" | "push" | "replace";
}

interface NavigationUpdateCurrentEntryOptions {
    state: any;
}

interface NavigationResult {
    committed: Promise<NavigationHistoryEntry>;
    finished: Promise<NavigationHistoryEntry>;
}

interface Navigation extends EventTarget {
    readonly activation: NavigationActivation | null;
    readonly canGoBack: boolean;
    readonly canGoForward: boolean;
    readonly currentEntry: NavigationHistoryEntry | null;
    readonly transition: NavigationTransition | null;

    entries(): NavigationHistoryEntry[];
    back(options?: NavigationOptions): NavigationResult;
    forward(options?: NavigationOptions): NavigationResult;
    navigate(url: string, options?: NavigationNavigateOptions): NavigationResult;
    reload(options?: NavigationOptions): NavigationResult;
    traverseTo(key: string, options?: NavigationOptions): NavigationResult;
    updateCurrentEntry(options: NavigationUpdateCurrentEntryOptions): void;
}

/**
 * This declaration merges with the existing `Window` interface
 * to add the `navigation` property, fixing the TS2551 error.
 */
interface Window {
    readonly navigation: Navigation;
}