import { act, renderHook } from "@testing-library/react";
import type { Virtualizer } from "@tanstack/react-virtual";
import { describe, expect, it, vi } from "vitest";
import { useMessageListScroll } from "./useMessageListScroll";
import type { ChatMessage } from "@/types/messages";

const makeMessage = (
  id: string,
  status?: ChatMessage["status"],
): ChatMessage => ({
  _id: id,
  author: "Luka",
  message: `message ${id}`,
  createdAt: "2018-03-10T10:19:00.000Z",
  ...(status ? { status } : {}),
});

const setup = (initialMessages: ChatMessage[]) => {
  const element = {
    scrollHeight: 1000,
    scrollTop: 600,
    clientHeight: 400,
  } as HTMLElement;
  const scrollToIndex = vi.fn();
  const virtualizer = { scrollToIndex } as unknown as Virtualizer<
    HTMLElement,
    Element
  >;

  const view = renderHook(
    ({ messages }) =>
      useMessageListScroll({ current: element }, virtualizer, messages),
    { initialProps: { messages: initialMessages } },
  );

  const scrollTo = (scrollTop: number) => {
    element.scrollTop = scrollTop;
    act(() => view.result.current.onScroll());
  };

  return { ...view, scrollToIndex, scrollTo };
};

describe("useMessageListScroll", () => {
  it("scrolls to the newest message on first load", () => {
    const { scrollToIndex } = setup([makeMessage("1"), makeMessage("2")]);

    expect(scrollToIndex).toHaveBeenCalledWith(1, { align: "end" });
  });

  it("does nothing for an empty list", () => {
    const { result, scrollToIndex } = setup([]);

    expect(scrollToIndex).not.toHaveBeenCalled();

    act(() => result.current.jumpToLatest());
    expect(scrollToIndex).not.toHaveBeenCalled();
  });

  it("follows incoming messages while reading near the bottom", () => {
    const { rerender, scrollToIndex, scrollTo } = setup([makeMessage("1")]);
    scrollTo(550); // 50px from the bottom
    scrollToIndex.mockClear();

    rerender({ messages: [makeMessage("1"), makeMessage("2")] });

    expect(scrollToIndex).toHaveBeenCalledWith(1, { align: "end" });
  });

  it("leaves the scroll position unchanged and displays unseen messages when user is above the bottom scroll threshold", () => {
    const { result, rerender, scrollToIndex, scrollTo } = setup([
      makeMessage("1"),
      makeMessage("2"),
    ]);
    scrollTo(0); // 600px from the bottom > NEAR_BOTTOM_PX
    scrollToIndex.mockClear();

    rerender({
      messages: [makeMessage("1"), makeMessage("2"), makeMessage("3")],
    });

    expect(scrollToIndex).not.toHaveBeenCalled();
    expect(result.current.hasUnseenMessages).toBe(true);
  });

  it("always follows author's new send, even when scroll position is above threshold", () => {
    const { result, rerender, scrollToIndex, scrollTo } = setup([
      makeMessage("1"),
    ]);
    scrollTo(0);
    scrollToIndex.mockClear();

    rerender({
      messages: [makeMessage("1"), makeMessage("temp-2", "pending")],
    });

    expect(scrollToIndex).toHaveBeenCalledWith(1, { align: "end" });
    expect(result.current.hasUnseenMessages).toBe(false);
  });

  it("does not flag unseen when message is already settled", () => {
    const { result, rerender, scrollToIndex, scrollTo } = setup([
      makeMessage("1"),
      makeMessage("temp-2", "pending"),
    ]);
    scrollTo(0);
    scrollToIndex.mockClear();

    // The pending send reconciles: same length, no pending status.
    rerender({ messages: [makeMessage("1"), makeMessage("2")] });

    expect(scrollToIndex).not.toHaveBeenCalled();
    expect(result.current.hasUnseenMessages).toBe(false);
  });

  it("jumpToLatest scrolls smoothly and clears the flag", () => {
    const { result, rerender, scrollToIndex, scrollTo } = setup([
      makeMessage("1"),
    ]);
    scrollTo(0);
    rerender({ messages: [makeMessage("1"), makeMessage("2")] });
    expect(result.current.hasUnseenMessages).toBe(true);
    scrollToIndex.mockClear();

    act(() => result.current.jumpToLatest());

    expect(scrollToIndex).toHaveBeenCalledWith(1, {
      align: "end",
      behavior: "smooth",
    });
    expect(result.current.hasUnseenMessages).toBe(false);
  });

  it("scrolling back to the bottom clears the flag", () => {
    const { result, rerender, scrollTo } = setup([makeMessage("1")]);
    scrollTo(0);
    rerender({ messages: [makeMessage("1"), makeMessage("2")] });
    expect(result.current.hasUnseenMessages).toBe(true);

    scrollTo(550);

    expect(result.current.hasUnseenMessages).toBe(false);
  });
});
