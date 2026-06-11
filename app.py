from fastapi import FastAPI
from api.messages import router as messages_router  
from api.auth import router as auth_router
from websocket.handlers import router as websocket_router
from api.conversations import (
    router as conversations_router
)
from api.read_receipts import (
    router as read_receipt_router
)
from api.search import router as search_router
from fastapi.middleware.cors import CORSMiddleware
from db import Base, engine
from Models import *

app = FastAPI()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(websocket_router)
app.include_router(messages_router)
app.include_router(conversations_router)
app.include_router(read_receipt_router)
app.include_router(search_router)
Base.metadata.create_all(bind=engine)