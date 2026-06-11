import json

from core.redis import redis_client

from websocket.manager import manager


# -----------------------------------
# Publish message
# -----------------------------------

async def publish_message(
    receiver_id: int,
    message: dict
):

    print(
        "REDIS PUBLISH:",
        message
    )

    await redis_client.publish(
        f"user:{receiver_id}",
        json.dumps(message)
    )


# ====================================
# BROADCAST PRESENCE
# ====================================

async def broadcast_presence(
    message: dict
):

    print(
        "BROADCAST PRESENCE:",
        message
    )

    for uid in manager.active_connections.keys():

        await publish_message(
            uid,
            message
        )


# -----------------------------------
# Subscribe to user channel
# -----------------------------------

async def subscribe_to_user(
    user_id: int
):

    pubsub = redis_client.pubsub()

    await pubsub.subscribe(
        f"user:{user_id}"
    )

    print(
        f"SUBSCRIBED: user:{user_id}"
    )

    async for event in pubsub.listen():

        if event["type"] != "message":
            continue

        try:

            message = json.loads(
                event["data"]
            )

            print(
                "REDIS RECEIVED:",
                message
            )

            websocket = manager.active_connections.get(
                user_id
            )

            print(
                "SOCKET FOUND:",
                websocket
            )

            if websocket:

                await websocket.send_json(
                    message
                )

                print(
                    "WEBSOCKET SENT TO:",
                    user_id
                )

        except Exception as e:

            print(
                "REDIS ERROR:",
                e
            )