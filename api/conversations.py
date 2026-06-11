from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from Depends.auth import get_current_user
from Depends.get_db import get_db

from Models.Users import User
from Models.Conversations import Conversation
from Models.Message import Message
from Models.conversation_participants import (
    ConversationParticipant
)

from schemas.conversation import (
    ConversationListResponse
)

router = APIRouter(
    prefix="/conversations",
    tags=["Conversations"]
)


@router.get(
    "/my",
    response_model=list[ConversationListResponse]
)
def get_my_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    # -----------------------------------
    # Get all conversations of user
    # -----------------------------------

    participant_rows = db.query(
        ConversationParticipant
    ).filter(
        ConversationParticipant.user_id == current_user.id
    ).all()

    result = []

    # -----------------------------------
    # Process each conversation
    # -----------------------------------

    for participant in participant_rows:

        conversation = db.query(Conversation).filter(
            Conversation.id == participant.conversation_id
        ).first()

        if not conversation:
            continue

        # -----------------------------------
        # Find other participant
        # -----------------------------------

        other_participant = db.query(
            ConversationParticipant
        ).filter(
            ConversationParticipant.conversation_id == conversation.id,
            ConversationParticipant.user_id != current_user.id
        ).first()

        # Skip invalid/self conversations
        if not other_participant:
            continue

        # -----------------------------------
        # Get other user details
        # -----------------------------------

        other_user = db.query(User).filter(
            User.id == other_participant.user_id
        ).first()

        if not other_user:
            continue

        # -----------------------------------
        # Last message
        # -----------------------------------

        last_message = None

        if conversation.last_message_id:

            last_message_obj = db.query(Message).filter(
                Message.id == conversation.last_message_id
            ).first()

            if last_message_obj:
                last_message = last_message_obj.content

        # -----------------------------------
        # Unread count
        # -----------------------------------

        unread_count = db.query(Message).filter(
            Message.conversation_id == conversation.id,
            Message.id > (
                participant.last_read_message_id or 0
            ),
            Message.sender_id != current_user.id
        ).count()

        # -----------------------------------
        # Build response
        # -----------------------------------

        result.append({

            "conversation_id": conversation.id,

            "other_user": {
                "id": other_user.id,
                "name": other_user.name
            },

            "last_message": last_message,

            "unread_count": unread_count,

            "last_activity": conversation.last_message_at
        })

    # -----------------------------------
    # Sort latest conversations first
    # -----------------------------------

    return sorted(
        result,
        key=lambda x: x["last_activity"] or "",
        reverse=True
    )