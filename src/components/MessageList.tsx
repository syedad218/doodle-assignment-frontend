import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import Message from "@/components/Message";
import { useMessages } from "@/hooks/useMessages";
import { useMessageListScroll } from "@/hooks/useMessageListScroll";
import { useSendMessage } from "@/hooks/useSendMessage";
import styles from "./MessageList.module.css";

const LIST_SPACING = 16; // padding above the first / below the last row
const GAP_SAME_SIDE = 8; // between consecutive messages on the same side
const GAP_SIDE_SWITCH = 16; // when the sender side flips (own ↔ other)
const ESTIMATED_ROW_HEIGHT = 84; // rough bubble height later refined by measureElement.
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
        const isOwn = message.author === currentAuthor;

        let gapTop = 0;
        if (item.index > 0) {
          const prevIsOwn = messages[item.index - 1].author === currentAuthor;
          gapTop = prevIsOwn === isOwn ? GAP_SAME_SIDE : GAP_SIDE_SWITCH;
        }

        return (
          <div
            key={message._id}
            data-index={item.index}
            ref={virtualizer.measureElement}
            className={styles.messageRow}
            style={{
              transform: `translateY(${item.start}px)`,
              paddingTop: gapTop,
            }}
          >
            <Message message={message} isOwn={isOwn} onRetry={retry} />
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
      <section
        ref={scrollRef}
        className={styles.messageScroller}
        onScroll={onScroll}
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
        aria-label="Message history"
      >
        <div
          className={styles.scrollContent}
          style={{ height: hasMessages ? virtualizer.getTotalSize() : "100%" }}
        >
          {renderMessageList()}
        </div>
      </section>

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
