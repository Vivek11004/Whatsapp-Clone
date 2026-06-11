'use client';

import { create } from 'zustand';

// =====================================
// TYPES
// =====================================

export interface Message {
  id: string;

  conversationId: string;

  senderId: string;

  text: string;

  timestamp: Date;

  read: boolean;
}

export interface Conversation {
  id: string;

  otherUser: {
    id: string;

    name: string;

    // =====================================
    // ONLINE STATUS
    // =====================================

    isOnline?: boolean;

    lastSeen?: string | null;
  };

  lastMessage: string;

  unreadCount: number;

  lastActivity: string;

  messages: Message[];

  hasMore: boolean;
}

export interface User {
  id: string;

  name: string;
}

interface ChatState {
  // =====================================
  // STATE
  // =====================================

  currentUser: User | null;

  conversations: Conversation[];

  activeConversationId: string | null;

  isConnected: boolean;

  error: string | null;

  // =====================================
  // ACTIONS
  // =====================================

  setCurrentUser: (
    user: User | null
  ) => void;

  setConversations: (
    conversations: Conversation[]
  ) => void;

  setActiveConversation: (
    id: string | null
  ) => void;

  setConnectionStatus: (
    status: boolean
  ) => void;

  setError: (
    error: string | null
  ) => void;

  receiveMessage: (
    message: Message
  ) => void;

  markMessagesAsRead: (
    conversationId: string
  ) => void;

  // =====================================
  // REALTIME PRESENCE
  // =====================================

  updateUserPresence: (
    userId: string,
    isOnline: boolean,
    lastSeen?: string | null
  ) => void;

  logout: () => void;
}

// =====================================
// STORE
// =====================================

export const useChatStore =
  create<ChatState>(
    (set) => ({
      // =====================================
      // INITIAL STATE
      // =====================================

      currentUser: null,

      conversations: [],

      activeConversationId:
        null,

      isConnected: false,

      error: null,

      // =====================================
      // ACTIONS
      // =====================================

      setCurrentUser: (
        user
      ) =>
        set({
          currentUser: user,
        }),

      setConversations: (
        conversations
      ) =>
        set({
          conversations,
        }),

      setActiveConversation: (
        id
      ) =>
        set({
          activeConversationId:
            id,
        }),

      setConnectionStatus: (
        status
      ) =>
        set({
          isConnected:
            status,
        }),

      setError: (error) =>
        set({
          error,
        }),

      // =====================================
      // RECEIVE MESSAGE
      // =====================================

      receiveMessage: (
        message
      ) =>
        set((state) => {

          const updated =
            state.conversations.map(
              (
                conversation
              ) => {

                // MATCH CONVERSATION

                if (
                  String(
                    conversation.id
                  ) !==
                  String(
                    message.conversationId
                  )
                ) {
                  return conversation;
                }

                // =====================================
                // REMOVE DUPLICATES
                // =====================================

                const filteredMessages =
                  conversation.messages.filter(
                    (m) =>
                      String(m.id) !==
                      String(message.id)
                  );

                // =====================================
                // ADD NEW MESSAGE
                // =====================================

                return {
                  ...conversation,

                  lastMessage:
                    message.text,

                  lastActivity:
                    new Date().toISOString(),

                  unreadCount:
                    conversation.id ===
                    state.activeConversationId
                      ? 0
                      : conversation.unreadCount +
                        1,

                  messages: [
                    ...filteredMessages,
                    message,
                  ],
                };
              }
            );

          // =====================================
          // SORT BY LATEST
          // =====================================

          updated.sort((a, b) => {

            return (
              new Date(
                b.lastActivity
              ).getTime() -

              new Date(
                a.lastActivity
              ).getTime()
            );
          });

          return {
            conversations:
              updated,
          };
        }),

      // =====================================
      // MARK READ
      // =====================================

      markMessagesAsRead:
        (
          conversationId
        ) =>
          set((state) => ({
            conversations:
              state.conversations.map(
                (
                  conversation
                ) => {

                  if (

                    String(
                      conversation.id
                    ) ===
                    String(
                      conversationId
                    )

                  ) {

                    return {
                      ...conversation,

                      unreadCount: 0,

                      messages:
                        conversation.messages.map(
                          (
                            message
                          ) => ({
                            ...message,

                            read: true,
                          })
                        ),
                    };
                  }

                  return conversation;
                }
              ),
          })),

      // =====================================
      // UPDATE USER PRESENCE
      // =====================================

      updateUserPresence:
        (
          userId,
          isOnline,
          lastSeen
        ) =>
          set((state) => ({
            conversations:
              state.conversations.map(
                (
                  conversation
                ) => {

                  // FIX TYPE MISMATCH

                  if (

                    String(
                      conversation.otherUser.id
                    ) ===
                    String(userId)

                  ) {

                    console.log(
                      'UPDATING USER:',
                      userId,
                      isOnline
                    );

                    return {
                      ...conversation,

                      otherUser: {
                        ...conversation.otherUser,

                        isOnline,

                        lastSeen,
                      },
                    };
                  }

                  return conversation;
                }
              ),
          })),

      // =====================================
      // LOGOUT
      // =====================================

      logout: () =>
        set({
          currentUser: null,

          conversations: [],

          activeConversationId:
            null,

          isConnected: false,

          error: null,
        }),
    })
  );