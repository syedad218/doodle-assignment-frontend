import ChatHeader from "@/components/ChatHeader";
import ChatInput from "@/components/ChatInput";
import MessageList from "@/components/MessageList";
import { useSendMessage } from "@/hooks/useSendMessage";
import { useAuthor } from "@/hooks/useAuthor";
import styles from "./App.module.css";

function App() {
  const author = useAuthor();
  const { mutate: sendMessage } = useSendMessage();

  return (
    <div className={styles.app}>
      <ChatHeader />
      <MessageList currentAuthor={author} />
      <ChatInput
        author={author}
        onSend={(text) => sendMessage({ author, message: text })}
      />
    </div>
  );
}

export default App;
