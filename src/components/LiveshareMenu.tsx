import type { Component } from 'solid-js';
import { createSignal } from 'solid-js';
import styles from '../assets/css/App.module.css';
import Close from 'lucide-solid/icons/x';
import Copy from 'lucide-solid/icons/copy';
import Check from 'lucide-solid/icons/check';
import Loader from 'lucide-solid/icons/loader-2';

interface LiveshareProps {
  sessionId?: string;
  close: () => void;
  open: () => void;
  openSession: (id?: string) => string;
  closeSession: () => void;
}

const LiveShareMenu: Component<LiveshareProps> = (props) => {
  const [sessionLink, setSessionLink] = createSignal(props.sessionId ? `${location.href}${props.sessionId}` : "No active session");
  const [notification, setNotification] = createSignal('');
  const [copyState, setCopyState] = createSignal('idle');

  let codeRef: HTMLInputElement | undefined;

  function endSession() {
    props.closeSession();
    setSessionLink('No active session');
    codeRef!.value = '';
  }

  function startSession(id?: string) {
    id = props.openSession(id?.replace(location.href, "") || undefined);
    setSessionLink(`${location.origin}/${id}`);
    codeRef!.value = id;
    setTimeout(props.close, 2000);
  }

  const copyToClipboard = async () => {
    startSession();
    setCopyState('loading');
    await navigator.clipboard.writeText(sessionLink());
    setCopyState('success');
    setNotification('Copied to clipboard! Closing menu...');

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
          <input ref={codeRef} id="join" class={styles.input} placeholder="Enter session code..." />
        </div>
      </div>

      <div class={styles.row}>
        <button class={styles.joinButton} onclick={() => { startSession(codeRef!.value); }}>Join</button>
        <button class={styles.leaveButton} onclick={() => endSession()}>Leave</button>
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
              Start Session
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

      <div class={styles.notification}>{notification()}</div>
    </div>
  );
};

export default LiveShareMenu;