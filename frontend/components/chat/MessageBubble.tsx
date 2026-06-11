'use client';

import { Message } from '@/lib/store';

import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: Message;

  isOwn: boolean;

  senderName?: string;
}

export function MessageBubble({
  message,
  isOwn,
  senderName,
}: MessageBubbleProps) {
  const formatTime = (
    date: Date | string
  ) => {
    const d = new Date(date);

    return d.toLocaleTimeString(
      'en-US',
      {
        hour: '2-digit',
        minute: '2-digit',
      }
    );
  };

  return (
    <div
      className={cn(
        'flex mb-3',

        isOwn
          ? 'justify-end'
          : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-xs px-4 py-2 rounded-lg',

          isOwn
            ? 'bg-primary text-primary-foreground rounded-br-none'
            : 'bg-muted text-foreground rounded-bl-none'
        )}
      >
        {/* Sender Name */}

        {!isOwn &&
          senderName && (
            <p className="text-xs font-semibold mb-1 opacity-75">
              {senderName}
            </p>
          )}

        {/* Message */}

        <p className="text-sm break-words">
          {message.text}
        </p>

        {/* Time + Read Status */}

        <div className="flex items-center justify-end gap-1 mt-1">
          <p className="text-xs opacity-70">
            {formatTime(
              message.timestamp
            )}
          </p>

          {isOwn && (
            <span className="text-xs">
              {message.read
                ? '✓✓'
                : '✓'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}