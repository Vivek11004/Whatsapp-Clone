from fastapi import WebSocket

from db import SessionLocal

from Models.Users import User

from datetime import datetime

import asyncio


class ConnectionManager:

    def __init__(self):

        # -----------------------------------
        # user_id -> websocket
        # -----------------------------------

        self.active_connections = {}

        # -----------------------------------
        # Prevent duplicate Redis subscriptions
        # -----------------------------------

        self.subscribed_users = set()

    # -----------------------------------
    # Connect user
    # -----------------------------------

    async def connect(
        self,
        user_id: int,
        websocket: WebSocket
    ):

        await websocket.accept()

        self.active_connections[user_id] = websocket

        print(
            "ACTIVE USERS:",
            self.active_connections.keys()
        )

        # -----------------------------------
        # Mark user online
        # -----------------------------------

        db = SessionLocal()

        try:

            user = db.query(User).filter(
                User.id == user_id
            ).first()

            print(
                "FOUND USER:",
                user
            )

            if user:

                user.is_online = True

                db.commit()

                db.refresh(user)

                print(
                    "USER ONLINE:",
                    user.id,
                    user.is_online
                )

                # ====================================
                # PRESENCE EVENT
                # ====================================

                from redisc.pubsub import (
                    broadcast_presence
                )

                asyncio.create_task(

                    broadcast_presence(
                        {
                            "type": "presence",

                            "user_id": user_id,

                            "is_online": True,

                            "last_seen": None
                        }
                    )
                )

        except Exception as e:

            print(
                "CONNECT ERROR:",
                e
            )

        finally:

            db.close()

    # -----------------------------------
    # Disconnect user
    # -----------------------------------

    def disconnect(self, user_id: int):

        if user_id in self.active_connections:

            del self.active_connections[user_id]

        # -----------------------------------
        # Mark user offline
        # -----------------------------------

        db = SessionLocal()

        try:

            user = db.query(User).filter(
                User.id == user_id
            ).first()

            if user:

                user.is_online = False

                user.last_seen = datetime.utcnow()

                db.commit()

                db.refresh(user)

                print(
                    "USER OFFLINE:",
                    user.id,
                    user.is_online
                )

                # ====================================
                # PRESENCE EVENT
                # ====================================

                from redisc.pubsub import (
                    broadcast_presence
                )

                asyncio.create_task(

                    broadcast_presence(
                        {
                            "type": "presence",

                            "user_id": user_id,

                            "is_online": False,

                            "last_seen": str(
                                user.last_seen
                            )
                        }
                    )
                )

        except Exception as e:

            print(
                "DISCONNECT ERROR:",
                e
            )

        finally:

            db.close()

        print(
            "DISCONNECTED:",
            user_id
        )

    # -----------------------------------
    # Local websocket send
    # Used by Redis subscriber
    # -----------------------------------

    async def send_personal_message(
        self,
        user_id: int,
        message: dict
    ):

        websocket = self.active_connections.get(
            user_id
        )

        if websocket:

            await websocket.send_json(
                message
            )


manager = ConnectionManager()