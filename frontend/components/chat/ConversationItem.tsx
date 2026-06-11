'use client';

import { Conversation } from '@/lib/store';

import { cn } from '@/lib/utils';

interface ConversationItemProps {
  conversation: Conversation;

  isActive: boolean;

  onClick: () => void;

  isOnline?: boolean;
}

export function ConversationItem({
  conversation,
  isActive,
  onClick,
  isOnline,
}: ConversationItemProps) {
  const formatTime = (
    date?: string | null
  ) => {
    if (!date) return '';

    const d = new Date(date);

    const now = new Date();

    const diff =
      now.getTime() -
      d.getTime();

    const minutes =
      Math.floor(diff / 60000);

    const hours =
      Math.floor(diff / 3600000);

    const days =
      Math.floor(diff / 86400000);

    if (minutes < 1)
      return 'now';

    if (minutes < 60)
      return `${minutes}m`;

    if (hours < 24)
      return `${hours}h`;

    if (days < 7)
      return `${days}d`;

    return d.toLocaleDateString(
      'en-US',
      {
        month: 'short',
        day: 'numeric',
      }
    );
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 p-3 cursor-pointer transition-colors',

        'hover:bg-muted',

        isActive &&
          'bg-primary/10 border-l-4 border-primary'
      )}
    >
      {/* Avatar */}

      <div className="relative flex-shrink-0">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-foreground font-semibold">
          {conversation.otherUser.name
            .charAt(0)
            .toUpperCase()}
        </div>

        {isOnline && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
        )}
      </div>

      {/* Content */}

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-foreground truncate">
            {
              conversation
                .otherUser.name
            }
          </h3>

          <p className="text-xs text-muted-foreground flex-shrink-0">
            {formatTime(
              conversation.lastActivity
            )}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2 mt-1">
          <p className="text-sm text-muted-foreground truncate">
            {conversation.lastMessage ||
              'No messages yet'}
          </p>

          {conversation.unreadCount >
            0 && (
            <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full">
              {conversation.unreadCount >
              99
                ? '99+'
                : conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}