'use client';

import {
  useEffect,
  useRef,
} from 'react';

import { Conversation } from '@/lib/store';

import { MessageBubble } from './MessageBubble';

interface MessageListProps {
  conversation: Conversation;

  currentUserId: string;

  onLoadMore: () => void;

  isLoadingMore: boolean;
}

export function MessageList({
  conversation,
  currentUserId,
  onLoadMore,
  isLoadingMore,
}: MessageListProps) {
  const messagesEndRef =
    useRef<HTMLDivElement>(null);

  // =====================================
  // AUTO SCROLL
  // =====================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView(
      {
        behavior: 'smooth',
      }
    );
  }, [conversation.messages]);

  // =====================================
  // EMPTY
  // =====================================

  if (
    conversation.messages.length ===
    0
  ) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        No messages yet
      </div>
    );
  }

  // =====================================
  // UI
  // =====================================

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {isLoadingMore && (
        <div className="text-center text-sm text-muted-foreground">
          Loading...
        </div>
      )}

      {conversation.messages.map(
        (message) => (
          <MessageBubble
            key={`${message.id}-${message.timestamp}`}
            message={message}
            isOwn={
              message.senderId ===
              currentUserId
            }
            senderName={
              message.senderId ===
              currentUserId
                ? undefined
                : conversation
                    .otherUser.name
            }
          />
        )
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}