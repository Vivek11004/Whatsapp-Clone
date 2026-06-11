from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from Depends.auth import get_current_user
from Depends.get_db import get_db

from Models.Users import User
from Models.Conversations import Conversation
from Models.conversation_participants import (
    ConversationParticipant
)

from services.conversation_service import (
    get_or_create_conversation
)

from services.message_service import (
    create_message
)

from Models.Message import Message


router = APIRouter(
    prefix="/messages",
    tags=["Messages"]
)


@router.post("/send")
def send_message(
    receiver_id: int,
    content: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    conversation = get_or_create_conversation(
        db,
        current_user.id,
        receiver_id
    )

    message = create_message(
        db,
        conversation.id,
        current_user.id,
        content
    )

    return {
        "message_id": message.id,
        "conversation_id": conversation.id,
        "content": message.content
    }


@router.get("/conversation/{conversation_id}")
def get_conversation_messages(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    participant = db.query(
        ConversationParticipant
    ).filter(
        ConversationParticipant.conversation_id == conversation_id,
        ConversationParticipant.user_id == current_user.id
    ).first()

    if not participant:

        raise HTTPException(
            status_code=403,
            detail="Not part of conversation"
        )

    messages = db.query(Message).filter(
        Message.conversation_id == conversation_id,
        Message.is_deleted == False
    ).order_by(
        Message.created_at.asc()
    ).all()

    return messages


@router.get("/my-conversations")
def get_my_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    conversations = db.query(
        ConversationParticipant
    ).filter(
        ConversationParticipant.user_id == current_user.id
    ).all()

    return conversations