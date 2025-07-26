import { For, createSignal } from 'solid-js';
import Chat from '../components/Chat';
import styles from '../assets/css/Ai.module.css';

type ChatType = {
  from: 'user' | 'assistant';
  message: string;
};

const AiPage = () => {
  const [chats, setChats] = createSignal<ChatType[]>([
    { from: 'assistant', message: 'Hello, how may I help you?' }
  ]);
  const [input, setInput] = createSignal('');

  const submission = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const message = input().trim();
      if (message) {
        setChats([...chats(), { from: 'user', message }]);
        setInput('');
        // reply code 
      }
    }
  };

  return (
    <div class={styles.chatPage}>
      <h1 class={styles.title}>AloraAI</h1>
      <div class={styles.chatContainer}>
        <For each={chats()}>
          {(chat) => <Chat from={chat.from} message={chat.message} />}
        </For>
      </div>
      <div class={styles.inputContainer}>
        <textarea
          class={styles.chatInput}
          value={input()}
          placeholder="Ask AloraAI anything."
          rows="1"
          onInput={(e) => setInput(e.currentTarget.value)}
          onKeyDown={submission}
        />
      </div>
    </div>
  );
};

export default AiPage;
