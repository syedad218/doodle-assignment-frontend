import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import Message from "@/components/Message";
import { useMessages } from "@/hooks/useMessages";
import { useMessageListScroll } from "@/hooks/useMessageListScroll";
import { useSendMessage } from "@/hooks/useSendMessage";
import styles from "./MessageList.module.css";

const LIST_SPACING = 16;
const ESTIMATED_ROW_HEIGHT = 84; // rough bubble height; refined by measureElement
const OVERSCAN_ROWS = 8; // rows rendered beyond the visible edge for smoother scrolling

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
    estimateSize: () => ESTIMATED_ROW_HEIGHT,
    overscan: OVERSCAN_ROWS,
    gap: LIST_SPACING,
    paddingStart: LIST_SPACING,
    paddingEnd: LIST_SPACING,
  });

  const { onScroll, hasUnseenMessages, jumpToLatest } = useMessageListScroll(
    scrollRef,
    virtualizer,
    messages,
  );

  const placeholderText = () => {
    if (isPending) return "Loading messages…";
    if (isError) return `Failed to load messages: ${error?.message ?? ""}`;
    return "Type your first message 👋";
  };

  const renderMessageList = () => {
    if (hasMessages) {
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
    }

    return (
      <div className={styles.placeholder}>
        <p className={styles.placeholderText}>{placeholderText()}</p>
      </div>
    );
  };

  return (
    <div className={styles.messagePane}>
      <main
        ref={scrollRef}
        className={styles.messageScroller}
        onScroll={onScroll}
        tabIndex={0}
        aria-label="Message history"
      >
        <div
          className={styles.scrollContent}
          style={{ height: hasMessages ? virtualizer.getTotalSize() : "100%" }}
        >
          {renderMessageList()}
        </div>
      </main>

      {hasUnseenMessages && (
        <button
          type="button"
          className={styles.jumpToLatest}
          onClick={jumpToLatest}
        >
          New messages <span aria-hidden="true">↓</span>
        </button>
      )}
    </div>
  );
}

export default MessageList;
