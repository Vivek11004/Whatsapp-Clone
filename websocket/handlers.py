from fastapi import (
    APIRouter,
    WebSocket,
    WebSocketDisconnect
)

from jose import jwt, JWTError

import asyncio

from redisc.pubsub import (
    publish_message,
    subscribe_to_user
)

from websocket.manager import manager

from core.security import (
    SECRET_KEY,
    ALGORITHM
)

from db import SessionLocal

from services.conversation_service import (
    get_or_create_conversation
)

from services.message_service import (
    create_message
)

router = APIRouter()


@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket
):

    # -----------------------------------
    # Get JWT token
    # -----------------------------------

    token = websocket.query_params.get(
        "token"
    )

    print("TOKEN:", token)

    if not token:

        await websocket.close()

        return

    # -----------------------------------
    # Decode JWT
    # -----------------------------------

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = int(
            payload.get("sub")
        )

    except JWTError:

        await websocket.close()

        return

    # -----------------------------------
    # Connect user
    # -----------------------------------

    await manager.connect(
        user_id,
        websocket
    )

    # -----------------------------------
    # Subscribe user to Redis channel
    # Prevent duplicate subscriptions
    # -----------------------------------

    if user_id not in manager.subscribed_users:

        manager.subscribed_users.add(
            user_id
        )

        asyncio.create_task(
            subscribe_to_user(user_id)
        )

    print(
        "CONNECTED:",
        user_id
    )

    db = SessionLocal()

    try:

        while True:

            # -----------------------------------
            # Receive websocket message
            # -----------------------------------

            data = await websocket.receive_json()

            print(
                "RECEIVED:",
                data
            )

            receiver_id = data[
                "receiver_id"
            ]

            content = data[
                "message"
            ]

            # -----------------------------------
            # Prevent self chat
            # -----------------------------------

            if receiver_id == user_id:
                continue

            # -----------------------------------
            # Get or create conversation
            # -----------------------------------

            conversation = (
                get_or_create_conversation(
                    db,
                    user_id,
                    receiver_id
                )
            )

            # -----------------------------------
            # Store message in PostgreSQL
            # -----------------------------------

            message = create_message(
                db,
                conversation.id,
                user_id,
                content
            )

            # -----------------------------------
            # Publish message through Redis
            # -----------------------------------

            await publish_message(
                receiver_id,
                {
                    "type": "chat",

                    "message_id":
                        message.id,

                    "conversation_id":
                        conversation.id,

                    "from":
                        user_id,

                    "message":
                        content,

                    "created_at": str(
                        message.created_at
                    )
                }
            )

            print(
                "MESSAGE STORED + PUBLISHED"
            )

    except WebSocketDisconnect:

        print(
            "DISCONNECTED:",
            user_id
        )

        manager.disconnect(
            user_id
        )

    finally:

        db.close()