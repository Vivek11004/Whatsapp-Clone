const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:8000';

// =====================================
// GET JWT TOKEN
// =====================================

function getToken() {
  if (typeof window === 'undefined')
    return null;

  return localStorage.getItem(
    'access_token'
  );
}

// =====================================
// REQUEST HELPER
// =====================================

async function request(
  path: string,
  options: RequestInit = {}
) {
  const token = getToken();

  const res = await fetch(
    `${BASE_URL}${path}`,
    {
      ...options,

      headers: {
        'Content-Type':
          'application/json',

        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),

        ...options.headers,
      },
    }
  );

  // =====================================
  // AUTO LOGOUT IF TOKEN INVALID
  // =====================================

  if (res.status === 401) {
    localStorage.removeItem(
      'access_token'
    );

    window.location.href =
      '/login';
  }

  // =====================================
  // HANDLE ERRORS
  // =====================================

  if (!res.ok) {
    const err = await res
      .json()
      .catch(() => ({}));

    throw new Error(
      err.detail ||
        'Request failed'
    );
  }

  // =====================================
  // RETURN JSON
  // =====================================

  const contentType =
    res.headers.get(
      'content-type'
    );

  if (
    contentType?.includes(
      'application/json'
    )
  ) {
    return res.json();
  }

  return null;
}

// =====================================
// API
// =====================================

export const api = {
  // =====================================
  // AUTH
  // =====================================

  register: (
    name: string,

    email: string,

    password: string,

    phoneNumber: string
  ) =>
    request('/auth/register', {
      method: 'POST',

      body: JSON.stringify({
        name,

        email,

        password,

        phone_number:
          phoneNumber,
      }),
    }),

  login: (
    email: string,
    password: string
  ) =>
    request('/auth/login', {
      method: 'POST',

      body: JSON.stringify({
        email,
        password,
      }),
    }),

  getMe: () =>
    request('/auth/me'),

  // =====================================
  // USERS
  // =====================================

  searchUsers: (
    query: string
  ) =>
    request(
      `/users/search?q=${query}`
    ),

  // =====================================
  // CONVERSATIONS
  // =====================================

  getConversations: () =>
    request(
      '/conversations/my'
    ),

  // =====================================
  // MESSAGES
  // =====================================

  getMessages: (
    conversationId: number
  ) =>
    request(
      `/messages/conversation/${conversationId}`
    ),

  // =====================================
  // READ RECEIPTS
  // =====================================

  markAsRead: (
    conversationId: number,

    messageId: number
  ) =>
    request(
      '/read-receipts/mark-read',
      {
        method: 'POST',

        body: JSON.stringify({
          conversation_id:
            conversationId,

          message_id:
            messageId,
        }),
      }
    ),
};