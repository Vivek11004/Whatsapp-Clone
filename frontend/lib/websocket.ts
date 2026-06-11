import { useChatStore } from '@/lib/store';

class WebSocketManager {
  private ws: WebSocket | null = null;

  private reconnectAttempts = 0;

  private maxReconnectAttempts = 10;

  private reconnectTimeout:
    | ReturnType<typeof setTimeout>
    | null = null;

  private token: string | null = null;

  private manuallyClosed = false;

  // =====================================
  // CONNECT
  // =====================================

  connect(token: string) {

    if (
      this.ws?.readyState ===
      WebSocket.OPEN
    ) {
      return;
    }

    this.manuallyClosed = false;

    this.token = token;

    console.log(
      'WS TOKEN:',
      token
    );

    const WS_URL =
      process.env.NEXT_PUBLIC_WS_URL ||
      'ws://localhost:8000';

    const url =
      `${WS_URL}/ws?token=${token}`;

    console.log(
      '[WebSocket] Connecting:',
      url
    );

    try {

      this.ws =
        new WebSocket(url);

      // =====================================
      // OPEN
      // =====================================

      this.ws.onopen = () => {

        console.log(
          '[WebSocket] Connected'
        );

        useChatStore.setState({
          isConnected: true,

          error: null,
        });

        this.reconnectAttempts = 0;
      };

      // =====================================
      // MESSAGE
      // =====================================

      this.ws.onmessage = (
        event
      ) => {

        try {

          const data =
            JSON.parse(
              event.data
            );

          console.log(
            '[WebSocket] Message:',
            data
          );

          this.handleMessage(
            data
          );

        } catch (err) {

          console.error(
            '[WebSocket] Invalid JSON:',
            err
          );
        }
      };

      // =====================================
      // ERROR
      // =====================================

      this.ws.onerror = (
        event
      ) => {

        console.error(
          '[WebSocket] Error Event:',
          event
        );

        console.error(
          '[WebSocket] ReadyState:',
          this.ws?.readyState
        );

        useChatStore.setState({
          error:
            'Connection error. Reconnecting...',
        });
      };

      // =====================================
      // CLOSED
      // =====================================

      this.ws.onclose = (
        event
      ) => {

        console.log(
          '[WebSocket] Closed'
        );

        console.log(
          '[WebSocket] Close Code:',
          event.code
        );

        console.log(
          '[WebSocket] Close Reason:',
          event.reason
        );

        useChatStore.setState({
          isConnected: false,
        });

        if (
          !this.manuallyClosed
        ) {

          this.attemptReconnect();
        }
      };

    } catch (err) {

      console.error(
        '[WebSocket] Connection failed:',
        err
      );

      this.attemptReconnect();
    }
  }

  // =====================================
  // RECONNECT
  // =====================================

  private attemptReconnect() {

    if (
      this.reconnectAttempts >=
      this.maxReconnectAttempts
    ) {

      useChatStore.setState({
        error:
          'Unable to reconnect. Please refresh.',
      });

      return;
    }

    this.reconnectAttempts++;

    console.log(
      `[WebSocket] Reconnecting (${this.reconnectAttempts})`
    );

    this.reconnectTimeout =
      setTimeout(() => {

        if (this.token) {

          this.connect(
            this.token
          );
        }

      }, 3000 * this.reconnectAttempts);
  }

  // =====================================
  // SEND MESSAGE
  // =====================================

  sendMessage(
    receiverId: number,
    content: string
  ) {

    if (
      this.ws?.readyState ===
      WebSocket.OPEN
    ) {

      this.ws.send(
        JSON.stringify({

          receiver_id:
            receiverId,

          message:
            content,
        })
      );

    } else {

      console.warn(
        '[WebSocket] Not connected'
      );
    }
  }

  // =====================================
  // HANDLE MESSAGE
  // =====================================

  private handleMessage(
    data: any
  ) {

    const store =
      useChatStore.getState();

    // =====================================
    // CHAT MESSAGE
    // =====================================

    if (
      data.type === 'chat'
    ) {

      store.receiveMessage({

        id: String(
          data.message_id
        ),

        conversationId:
          String(
            data.conversation_id
          ),

        senderId:
          String(
            data.from
          ),

        text:
          data.message,

        timestamp:
          new Date(
            data.created_at
          ),

        read: false,
      });

      return;
    }

    // =====================================
    // READ RECEIPT
    // =====================================

    if (
      data.type === 'seen'
    ) {

      console.log(
        'MESSAGE SEEN:',
        data.message_id
      );

      store.markMessagesAsRead(
        String(
          data.conversation_id
        )
      );

      return;
    }

    // =====================================
    // USER PRESENCE
    // =====================================

    if (
      data.type === 'presence'
    ) {

      console.log(
        'PRESENCE EVENT:',
        data
      );

      store.updateUserPresence(

        String(
          data.user_id
        ),

        data.is_online,

        data.last_seen
      );

      return;
    }
  }

  // =====================================
  // DISCONNECT
  // =====================================

  disconnect() {

    this.manuallyClosed = true;

    if (
      this.reconnectTimeout
    ) {

      clearTimeout(
        this.reconnectTimeout
      );
    }

    if (this.ws) {

      this.ws.close();

      this.ws = null;
    }
  }

  // =====================================
  // CONNECTION STATUS
  // =====================================

  isConnected() {

    return (
      this.ws?.readyState ===
      WebSocket.OPEN
    );
  }
}

export const wsManager =
  new WebSocketManager();