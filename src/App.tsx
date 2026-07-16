import Message from "@/components/Message";
import ChatHeader from "@/components/ChatHeader";
import ChatInput from "@/components/ChatInput";
import { useMessages } from "@/hooks/useMessages";
import { useAuthor } from "@/hooks/useAuthor";
import styles from "./App.module.css";

function App() {
  const author = useAuthor();
  const { data: messages, isPending, isError, error } = useMessages();

  return (
    <div className={styles.app}>
      <ChatHeader />
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
              isOwn={message.author === author}
            />
          ))}
        </div>
      </main>
      <ChatInput
        author={author}
        onSend={(text) => console.log("send:", text)}
      />
    </div>
  );
}

export default App;
