import { useEffect, useRef, useState, type RefObject } from "react";
import type { Virtualizer } from "@tanstack/react-virtual";
import { MESSAGE_STATUS } from "@/lib/constants";
import type { ChatMessage } from "@/types/messages";

const NEAR_BOTTOM_PX = 100; // within this distance the view sticks to new messages

export function useMessageListScroll<TScrollElement extends HTMLElement>(
  scrollRef: RefObject<TScrollElement | null>,
  virtualizer: Virtualizer<TScrollElement, Element>,
  messages: ChatMessage[] | undefined,
) {
  const isNearBottomRef = useRef(true);
  const [hasUnseenMessages, setHasUnseenMessages] = useState(false);
  const prevCountRef = useRef(0);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    isNearBottomRef.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX;
    // Manually scrolling to the bottom also dismisses the pill.
    if (isNearBottomRef.current) setHasUnseenMessages(false);
  };

  useEffect(() => {
    const count = messages?.length ?? 0;
    const grew = count > prevCountRef.current;
    prevCountRef.current = count;

    const last = messages?.at(-1);
    if (!last) return;
    const isOwnSend = last.status === MESSAGE_STATUS.pending;
    if (isOwnSend || isNearBottomRef.current) {
      virtualizer.scrollToIndex(count - 1, { align: "end" });
    } else if (grew) {
      setHasUnseenMessages(true);
    }
  }, [messages, virtualizer]);

  const jumpToLatest = () => {
    const count = messages?.length ?? 0;
    if (count === 0) return;
    setHasUnseenMessages(false);
    virtualizer.scrollToIndex(count - 1, { align: "end", behavior: "smooth" });
  };

  return { onScroll, hasUnseenMessages, jumpToLatest };
}
