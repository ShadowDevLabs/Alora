import styles from '../assets/css/Ai.module.css';

type ChatProps = {
  from: 'user' | 'assistant';
  message: string;
};

const Chat = (props: ChatProps) => {
  const isUser = props.from === 'user';
  return (
    <div class={`${styles.chatBubble} ${isUser ? styles.user : styles.assistant}`}>
      <div class={styles.bubbleContent}>{props.message}</div>
    </div>
  );
};

export default Chat;
