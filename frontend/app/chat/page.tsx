'use client';

import {
  useEffect,
  useState,
} from 'react';

import { useRouter } from 'next/navigation';

import { useChatStore } from '@/lib/store';

import { wsManager } from '@/lib/websocket';

import { api } from '@/lib/api';

import { ConversationList } from '@/components/chat/ConversationList';

import { ChatHeader } from '@/components/chat/ChatHeader';

import { MessageList } from '@/components/chat/MessageList';

import { ChatInput } from '@/components/chat/ChatInput';

import { Input } from '@/components/ui/input';

export default function ChatPage() {

  const router = useRouter();

  // =====================================
  // LOCAL STATE
  // =====================================

  const [
    isLoadingMore,
    setIsLoadingMore,
  ] = useState(false);

  const [
    showMobileChat,
    setShowMobileChat,
  ] = useState(false);

  // =====================================
  // SEARCH USERS
  // =====================================

  const [search, setSearch] =
    useState('');

  const [
    searchResults,
    setSearchResults,
  ] = useState<any[]>([]);

  // =====================================
  // STORE
  // =====================================

  const currentUser =
    useChatStore(
      (state) =>
        state.currentUser
    );

  const conversations =
    useChatStore(
      (state) =>
        state.conversations
    );

  const activeConversationId =
    useChatStore(
      (state) =>
        state.activeConversationId
    );

  const isConnected =
    useChatStore(
      (state) =>
        state.isConnected
    );

  const setCurrentUser =
    useChatStore(
      (state) =>
        state.setCurrentUser
    );

  const setActiveConversation =
    useChatStore(
      (state) =>
        state.setActiveConversation
    );

  const setConversations =
    useChatStore(
      (state) =>
        state.setConversations
    );

  const logout =
    useChatStore(
      (state) =>
        state.logout
    );

  // =====================================
  // ACTIVE CONVERSATION
  // =====================================

  const activeConversation =
    conversations.find(
      (c) =>
        String(c.id) ===
        String(
          activeConversationId
        )
    );

  // =====================================
  // FETCH USER
  // =====================================

  useEffect(() => {

    const fetchUser =
      async () => {

        try {

          const token =
            localStorage.getItem(
              'access_token'
            );

          if (!token) {

            router.push(
              '/login'
            );

            return;
          }

          // =====================================
          // CONNECT WEBSOCKET
          // =====================================

          if (
            !wsManager.isConnected()
          ) {

            wsManager.connect(
              token
            );
          }

          // =====================================
          // FETCH USER
          // =====================================

          const user =
            await api.getMe();

          setCurrentUser({
            id: String(
              user.id
            ),

            name:
              user.name,
          });

        } catch (err) {

          console.error(err);

          router.push(
            '/login'
          );
        }
      };

    fetchUser();

  }, []);

  // =====================================
  // FETCH CONVERSATIONS
  // =====================================

  useEffect(() => {

    const fetchConversations =
      async () => {

        try {

          const data =
            await api.getConversations();

          const mapped =
            data.map(
              (c: any) => ({

                id: String(
                  c.conversation_id
                ),

                otherUser: {

                  id: String(
                    c.other_user.id
                  ),

                  name:
                    c.other_user.name,

                  // =====================================
                  // ONLINE STATUS
                  // =====================================

                  isOnline:
                    c.other_user
                      .is_online,

                  lastSeen:
                    c.other_user
                      .last_seen,
                },

                lastMessage:
                  c.last_message,

                unreadCount:
                  c.unread_count,

                lastActivity:
                  c.last_activity,

                messages: [],

                hasMore: true,
              })
            );

          // =====================================
          // PRESERVE REALTIME PRESENCE
          // =====================================

          setConversations(

            mapped.map(
              (newConv: any) => {

                const existing =
                  conversations.find(
                    (c) =>
                      String(c.id) ===
                      String(newConv.id)
                  );

                return {

                  ...newConv,

                  otherUser: {

                    ...newConv.otherUser,

                    isOnline:
                      existing
                        ?.otherUser
                        ?.isOnline ??

                      newConv
                        .otherUser
                        ?.isOnline,

                    lastSeen:
                      existing
                        ?.otherUser
                        ?.lastSeen ??

                      newConv
                        .otherUser
                        ?.lastSeen,
                  },
                };
              }
            )
          );

        } catch (err) {

          console.error(err);
        }
      };

    fetchConversations();

  }, []);

  // =====================================
  // LOAD MESSAGES
  // =====================================

  const loadMessages =
    async (
      conversationId: string
    ) => {

      try {

        setIsLoadingMore(
          true
        );

        const data =
          await api.getMessages(
            Number(
              conversationId
            )
          );

        const mappedMessages =
          data.map(
            (m: any) => ({

              id: String(
                m.id
              ),

              conversationId:
                String(
                  m.conversation_id
                ),

              senderId:
                String(
                  m.sender_id
                ),

              text:
                m.content,

              timestamp:
                new Date(
                  m.created_at
                ),

              read: false,

              status: 'sent',
            })
          );

        const updated =
          conversations.map(
            (c) => {

              if (
                String(c.id) ===
                String(
                  conversationId
                )
              ) {

                return {

                  ...c,

                  messages:
                    mappedMessages,
                };
              }

              return c;
            }
          );

        setConversations(
          updated
        );

      } catch (err) {

        console.error(err);

      } finally {

        setIsLoadingMore(
          false
        );
      }
    };

  // =====================================
  // SEND MESSAGE
  // =====================================

  const handleSendMessage = (
    text: string
  ) => {

    if (
      !activeConversation ||
      !currentUser
    ) {
      return;
    }

    const localMessage = {

      id: crypto.randomUUID(),

      conversationId:
        activeConversation.id,

      senderId:
        currentUser.id,

      text,

      timestamp:
        new Date(),

      read: false,
    };

    useChatStore
      .getState()
      .receiveMessage(
        localMessage
      );

    wsManager.sendMessage(

      Number(
        activeConversation
          .otherUser.id
      ),

      text
    );
  };

  // =====================================
  // SEARCH USERS
  // =====================================

  const handleSearch =
    async (
      value: string
    ) => {

      setSearch(value);

      if (!value.trim()) {

        setSearchResults([]);

        return;
      }

      try {

        const users =
          await api.searchUsers(
            value
          );

        setSearchResults(
          users
        );

      } catch (err) {

        console.error(err);
      }
    };

  // =====================================
  // LOAD MORE
  // =====================================

  const handleLoadMore =
    () => {

      setIsLoadingMore(
        true
      );

      setTimeout(() => {

        setIsLoadingMore(
          false
        );

      }, 500);
    };

  // =====================================
  // LOGOUT
  // =====================================

  const handleLogout =
    () => {

      wsManager.disconnect();

      logout();

      localStorage.removeItem(
        'access_token'
      );

      router.push('/login');
    };

  if (!currentUser) {
    return null;
  }

  return (

    <div className="flex h-screen bg-background">

      {/* SIDEBAR */}

      <div className="hidden md:flex md:w-80 flex-col border-r border-border">

        {/* SEARCH USERS */}

        <div className="p-4 border-b border-border">

          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) =>
              handleSearch(
                e.target.value
              )
            }
          />

          {/* RESULTS */}

          {searchResults.length >
            0 && (

            <div className="mt-3 space-y-2">

              {searchResults.map(
                (user) => (

                  <button
                    key={user.id}
                    onClick={() => {

                      const existing =
                        conversations.find(
                          (c) =>
                            String(
                              c.otherUser.id
                            ) ===
                            String(
                              user.id
                            )
                        );

                      if (
                        existing
                      ) {

                        setActiveConversation(
                          existing.id
                        );

                        setSearch('');

                        setSearchResults([]);

                        return;
                      }

                      const newConversation = {

                        id: crypto.randomUUID(),

                        otherUser: {

                          id: String(
                            user.id
                          ),

                          name:
                            user.name,

                          isOnline:
                            false,

                          lastSeen:
                            null,
                        },

                        lastMessage:
                          '',

                        unreadCount:
                          0,

                        lastActivity:
                          new Date().toISOString(),

                        messages:
                          [],

                        hasMore:
                          false,
                      };

                      setConversations([
                        newConversation,

                        ...conversations,
                      ]);

                      setActiveConversation(
                        newConversation.id
                      );

                      setSearch('');

                      setSearchResults([]);
                    }}
                    className="w-full text-left p-3 rounded-lg hover:bg-muted transition"
                  >

                    <p className="font-medium">
                      {user.name}
                    </p>

                  </button>
                )
              )}

            </div>
          )}
        </div>

        {/* CONVERSATIONS */}

      

<ConversationList
  conversations={
    conversations
  }
  activeConversationId={
    activeConversationId
  }
  onSelectConversation={
  async (id) => {

    setActiveConversation(
      id
    );

    setShowMobileChat(
      true
    );

    await loadMessages(
      id
    );

    // Clear unread locally

    useChatStore
      .getState()
      .markMessagesAsRead(
        id
      );

    // Send read receipt to backend

    const conversation =
      useChatStore
        .getState()
        .conversations
        .find(
          (c) =>
            String(c.id) ===
            String(id)
        );

    const lastMessage =
      conversation?.messages[
        conversation.messages.length - 1
      ];

    if (lastMessage) {

      try {

        await api.markAsRead(
          Number(id),
          Number(lastMessage.id)
        );

        console.log(
          'READ RECEIPT SENT',
          lastMessage.id
        );

      } catch (err) {

        console.error(
          'READ RECEIPT ERROR',
          err
        );
      }
    }
  }
}
  
/>

      
      </div>

      {/* CHAT */}

      {activeConversation ? (

        <div className="flex-1 flex flex-col">

          <ChatHeader
            conversation={
              activeConversation
            }
          />

          <MessageList
            conversation={
              activeConversation
            }
            currentUserId={
              currentUser.id
            }
            onLoadMore={
              handleLoadMore
            }
            isLoadingMore={
              isLoadingMore
            }
          />

          <ChatInput
            onSend={
              handleSendMessage
            }
            disabled={
              !isConnected
            }
            placeholder={
              isConnected
                ? 'Type a message...'
                : 'Connecting...'
            }
          />
        </div>

      ) : (

        <div className="flex-1 flex items-center justify-center text-muted-foreground">

          Select a conversation
          to start chatting

        </div>
      )}
    </div>
  );
}