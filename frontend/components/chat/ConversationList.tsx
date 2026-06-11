'use client';

import { Conversation } from '@/lib/store';

import { ConversationItem } from './ConversationItem';

import { Input } from '@/components/ui/input';

import { useState } from 'react';

interface ConversationListProps {
  conversations: Conversation[];

  activeConversationId: string | null;

  onSelectConversation: (
    id: string
  ) => void;
}

export function ConversationList({
  conversations,
  activeConversationId,
  onSelectConversation,
}: ConversationListProps) {

  const [
    searchQuery,
    setSearchQuery
  ] = useState('');

  const filteredConversations =
    conversations.filter((conv) =>
      (
        conv.otherUser?.name ||
        ''
      )
        .toLowerCase()
        .includes(
          searchQuery.toLowerCase()
        )
    );

  return (
    <div className="h-full flex flex-col bg-card border-r border-border">

      {/* HEADER */}

      <div className="border-b border-border p-4 space-y-3">

        <h1 className="text-2xl font-bold text-foreground">
          Messages
        </h1>

        <Input
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) =>
            setSearchQuery(
              e.target.value
            )
          }
          className="bg-muted"
        />

      </div>

      {/* LIST */}

      <div className="flex-1 overflow-y-auto">

        {filteredConversations.length >
        0 ? (

          filteredConversations.map(
            (conversation) => (

              <ConversationItem
                key={
                  conversation.id
                }
                conversation={
                  conversation
                }
                isActive={
                  conversation.id ===
                  activeConversationId
                }
                onClick={() =>
                  onSelectConversation(
                    conversation.id
                  )
                }
              />

            )
          )

        ) : (

          <div className="flex items-center justify-center h-full text-muted-foreground">

            <p>
              No conversations found
            </p>

          </div>

        )}
      </div>
    </div>
  );
}