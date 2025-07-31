import type { Component } from 'solid-js';
import { createSignal } from 'solid-js';
import styles from '../assets/css/App.module.css';
import Close from 'lucide-solid/icons/x';
import Copy from 'lucide-solid/icons/copy';
import Check from 'lucide-solid/icons/check';
import Loader from 'lucide-solid/icons/loader-2';

interface LiveshareProps {
  sessionId: string;
  close: () => void;
  open: () => void;
}

const LiveShareMenu: Component<LiveshareProps> = (props: LiveshareProps) => {
  const [sessionLink, setSessionLink] = createSignal(`${location.href}${props.sessionId}`);
  const [notification, setNotification] = createSignal('');
  const [copyState, setCopyState] = createSignal('idle');

  const copyToClipboard = async () => {
    setCopyState('loading');
    await new Promise(resolve => setTimeout(resolve, 800));

    await navigator.clipboard.writeText(sessionLink());
    setCopyState('success');
    setNotification('Copied to clipboard!');

    setTimeout(() => {
      setCopyState('idle');
      setNotification('');
    }, 2000);
  };

  const closeModal = () => {
    props.close();
  };

  return (
    <div class={styles.panel}>
      <button class={styles.closeButton} onClick={closeModal}>
        <Close size={20} />
      </button>

      <h1 class={styles.heading}>LiveShare Control Panel</h1>

      <div class={styles.row}>
        <div class={styles.inputGroup}>
          <label for="join">Join Code</label>
          <input id="join" class={styles.input} placeholder="Enter session code..." />
        </div>
      </div>

      <div class={styles.row}>
        <button class={styles.joinButton}>Join</button>
        <button class={styles.leaveButton}>Leave</button>
      </div>

      <div class={styles.row}>
        <button
          class={`${styles.copyButton} ${copyState() !== 'idle' ? styles.copyButtonActive : ''}`}
          onClick={copyToClipboard}
          disabled={copyState() !== 'idle'}
        >
          {copyState() === 'idle' && (
            <>
              <Copy size={16} />
              Copy Session Link
            </>
          )}
          {copyState() === 'loading' && (
            <>
              <Loader size={16} class={styles.spinner} />
              Copying...
            </>
          )}
          {copyState() === 'success' && (
            <>
              <Check size={16} />
              Copied!
            </>
          )}
        </button>
      </div>

      <div class={styles.rowBottom}>
        <button class={styles.startButton}>Start Session</button>
      </div>

      <div class={styles.notification}>{notification()}</div>
    </div>
  );
};

export default LiveShareMenu;