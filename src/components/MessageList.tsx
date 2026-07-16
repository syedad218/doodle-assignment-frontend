import { useEffect, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import Message from "@/components/Message";
import { useMessages } from "@/hooks/useMessages";
import { useSendMessage } from "@/hooks/useSendMessage";
import styles from "./MessageList.module.css";

const GAP = 16;

type MessageListProps = {
  currentAuthor: string;
};

function MessageList({ currentAuthor }: MessageListProps) {
  const scrollRef = useRef<HTMLElement>(null);
  const { data: messages, isPending, isError, error } = useMessages();
  const { retry } = useSendMessage();
  const hasMessages = messages && messages.length > 0;
  const messageCount = messages?.length ?? 0;

  const virtualizer = useVirtualizer({
    count: messageCount,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 84, // rough bubble height; refined by measureElement
    overscan: 8,
    gap: GAP,
    paddingStart: GAP,
    paddingEnd: GAP,
  });

  useEffect(() => {
    if (messageCount > 0) {
      virtualizer.scrollToIndex(messageCount - 1, { align: "end" });
    }
  }, [messageCount, virtualizer]);

  const renderMessageList = () => {
    if (isPending) {
      return (
        <div className={styles.placeholder}>
          <p className={styles.placeholderText}>Loading messages…</p>
        </div>
      );
    } else if (isError) {
      return (
        <div className={styles.placeholder}>
          <p className={styles.placeholderText}>
            Failed to load messages: {error?.message}
          </p>
        </div>
      );
    } else if (hasMessages) {
      return virtualizer.getVirtualItems().map((item) => {
        const message = messages[item.index];
        return (
          <div
            key={message._id}
            data-index={item.index}
            ref={virtualizer.measureElement}
            className={styles.messageRow}
            style={{ transform: `translateY(${item.start}px)` }}
          >
            <Message
              message={message}
              isOwn={message.author === currentAuthor}
              onRetry={retry}
            />
          </div>
        );
      });
    } else if (messages) {
      return (
        <div className={styles.placeholder}>
          <p className={styles.placeholderText}>Type your first message 👋</p>
        </div>
      );
    }
  };

  return (
    <main ref={scrollRef} className={styles.messageScroller}>
      <div
        className={styles.scrollContent}
        style={{ height: hasMessages ? virtualizer.getTotalSize() : "100%" }}
      >
        {renderMessageList()}
      </div>
    </main>
  );
}

export default MessageList;
