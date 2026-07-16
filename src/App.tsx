import Message from "@/components/Message";
import ChatInput from "@/components/ChatInput";
import { useMessages } from "@/hooks/useMessages";
import styles from "./App.module.css";

// TODO: replace with the generated author name
const CURRENT_AUTHOR = "Luka";

function App() {
  const { data: messages, isPending, isError, error } = useMessages();

  return (
    <div className={styles.app}>
      <main className={styles.messages}>
        <div className={styles.messageList}>
          {isPending && <p className={styles.status}>Loading messages…</p>}
          {isError && (
            <p className={styles.status}>
              Failed to load messages: {error.message}
            </p>
          )}
          {messages?.map((message) => (
            <Message
              key={message._id}
              message={message}
              isOwn={message.author === CURRENT_AUTHOR}
            />
          ))}
        </div>
      </main>
      <ChatInput onSend={(text) => console.log("send:", text)} />
    </div>
  );
}

export default App;
