'use client';

import { Conversation } from '@/lib/store';

import { Button } from '@/components/ui/button';

interface ChatHeaderProps {
  conversation: Conversation;

  onCall?: () => void;

  onInfo?: () => void;
}

export function ChatHeader({
  conversation,

  onCall,

  onInfo,
}: ChatHeaderProps) {
  // =====================================
  // SAFE USERNAME
  // =====================================

  const userName =
    conversation.otherUser
      ?.name || 'Unknown';

  // =====================================
  // ONLINE STATUS
  // =====================================

  const isOnline =
    conversation.otherUser
      ?.isOnline;

  const lastSeen =
    conversation.otherUser
      ?.lastSeen;

  return (
    <div className="border-b border-border bg-card px-4 py-3 flex items-center justify-between">
      {/* LEFT */}

      <div className="flex items-center gap-3">
        {/* AVATAR */}

        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground font-semibold">
          {userName
            .charAt(0)
            .toUpperCase()}
        </div>

        {/* USER INFO */}

        <div>
          <h2 className="font-semibold text-foreground">
            {userName}
          </h2>

          {/* STATUS */}

          <p className="text-xs text-muted-foreground">
            {isOnline
              ? 'Active now'
              : lastSeen
              ? `Last seen ${new Date(
                  lastSeen
                ).toLocaleString()}`
              : 'Offline'}
          </p>
        </div>
      </div>

      {/* ACTIONS */}

      <div className="flex items-center gap-2">
        {onCall && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCall}
          >
            📞
          </Button>
        )}

        {onInfo && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onInfo}
          >
            ℹ️
          </Button>
        )}
      </div>
    </div>
  );
}