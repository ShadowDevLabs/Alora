import { createSignal, createEffect, onMount, onCleanup, For, Show, Component } from 'solid-js';
import styles from '../assets/css/Window.module.css';


interface IFrameProps {
    src: string;
    ref: (el: HTMLIFrameElement) => void;
    onLoad: (e: Event) => void;
    class: string;
}

const particles = Array.from({ length: 50 });
const sparks = Array.from({ length: 5 });

const IFrame: Component<IFrameProps> = (props) => {
    const [isLoading, setIsLoading] = createSignal(true);
    const [isFinished, setIsFinished] = createSignal(false);
    const [progress, setProgress] = createSignal(0);

    createEffect(() => {
        if (isLoading()) {
            setIsFinished(false);
        } else {
            setTimeout(() => {
                setIsFinished(true);
            }, 300);
        }
    });

    onMount(() => {
        const interval = setInterval(() => {
            setProgress(p => {
                const nextProgress = p + Math.random() * 3;
                if (nextProgress >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return nextProgress;
            });
        }, 100);

        onCleanup(() => clearInterval(interval));
    });

    const handleLoad = (e: Event) => {
        setIsLoading(false);
        props.onLoad(e);
    };

    return (
        <div class={styles.iframeContainer}>
            <Show when={!isFinished()}>
            {/* <Show when={true}> */}
                <div class={styles.loadingContainer}>
                    <div class={styles.fireBowl}>
                        <div class={styles.flameGlow}></div>
                        <div class={styles.flame}></div>
                        <div class={styles.flame}></div>
                        <div class={styles.flame}></div>
                        <div class={styles.flame}></div>
                        <div class={styles.flame}></div>
                        <div class={styles.bowl}></div>
                        <div class={styles.sparks}>
                            <For each={sparks}>
                                {() => (
                                    <div
                                        class={styles.spark}
                                        style={{
                                            'animation-delay': `${Math.random() * 2}s`,
                                            'animation-duration': `${1.5 + Math.random() * 1}s`,
                                        }}
                                    />
                                )}
                            </For>
                        </div>
                    </div>
                    <div class={styles.loadingBar}>
                        <div class={styles.loadingProgress}
                            classList={{ [styles.finished]: isFinished() }}></div>
                    </div>
                </div>

            </Show>
            {/* <Show when={false}> */}
                <iframe
                    ref={props.ref}
                    class={props.class}
                    src={props.src}
                    onLoad={handleLoad}
                    style={{ display: isLoading() ? 'none' : 'block' }}
                ></iframe>
            {/* </Show> */}
        </div>
    );
}

export default IFrame;