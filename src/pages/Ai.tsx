import { For, createSignal, onMount } from 'solid-js';
import Chat from '../components/Chat';
import styles from '../assets/css/Ai.module.css';
import '../assets/css/themes.css';

type ChatType = {
  from: 'user' | 'assistant';
  message: string;
};

const Ai = () => {
  const [chats, setChats] = createSignal<ChatType[]>([
    { from: 'assistant' as const, message: 'Hello, how may I help you?' }
  ]);
  const [input, setInput] = createSignal('');
  const [loading, setLoading] = createSignal(false);

  onMount(() => {
    const onStorage = (e: StorageEvent) => e.key === 'theme' && e.newValue && (document.documentElement.className !== e.newValue) && (document.documentElement.className = e.newValue);
    window.addEventListener('storage', onStorage);
    document.documentElement.className = localStorage.getItem('theme') ?? 'dark';
    return () => window.removeEventListener('storage', onStorage);
  });



  const submission = async (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const message = input().trim();
      if (!message || loading()) return;

      const updatedChats = [...chats(), { from: 'user' as const, message }];
      setChats(updatedChats);
      setInput('');
      setLoading(true);

      try {
        const response = await fetch('/api/ask', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messages: updatedChats.map(chat => ({
              role: chat.from,
              content: chat.message
            })),
            temperature: 0.7,
            max_tokens: 512
          }),
          credentials: 'include'
        });

        const data = await response.json();
        const assistantMessage =
          typeof data === 'string'
            ? data
            : data?.message || data?.choices?.[0]?.message?.content || 'Unexpected response';

        setChats([...updatedChats, { from: 'assistant' as const, message: assistantMessage }]);
      } catch {
        setChats([
          ...updatedChats,
          { from: 'assistant' as const, message: 'Error: Failed to contact AI.' }
        ]);
      } finally {
        setLoading(false);
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
          placeholder={loading() ? 'Waiting for response...' : 'Ask AloraAI anything.'}
          rows="1"
          disabled={loading()}
          onInput={(e) => setInput(e.currentTarget.value)}
          onKeyDown={submission}
        />
      </div>
    </div>
  );
};

export default Ai;
