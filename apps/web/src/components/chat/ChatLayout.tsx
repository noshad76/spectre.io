"use client";

import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { TypingIndicator } from "./TypingIndicator";
import { ChatHeader } from "./ChatHeader";
import { DoodlePatternDark } from "../DoodlePatternDark";

export function ChatLayout() {
  return (
    <div className="flex flex-col w-screen h-screen bg-surface overflow-hidden">
      <ChatHeader />
      <div className="flex-1 w-full overflow-hidden ">
        <DoodlePatternDark></DoodlePatternDark>

        <MessageList />
      </div>
      <TypingIndicator />
      <MessageInput />
    </div>
  );
}
