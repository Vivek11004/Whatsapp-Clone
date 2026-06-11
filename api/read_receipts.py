from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from Depends.auth import get_current_user
from Depends.get_db import get_db

from Models.Users import User

from Models.Conversations import Conversation

from Models.conversation_participants import (
    ConversationParticipant
)

from schemas.read_receipt import (
    MarkAsReadRequest
)

from services.read_receipt_service import (
    mark_as_read
)

from redisc.pubsub import (
    publish_message
)

router = APIRouter(
    prefix="/read-receipts",
    tags=["Read Receipts"]
)


@router.post("/mark-read")
async def mark_message_as_read(

    data: MarkAsReadRequest,

    current_user: User = Depends(get_current_user),

    db: Session = Depends(get_db)
):

    # -----------------------------------
    # Update read state in DB
    # -----------------------------------

    participant = mark_as_read(
        db,
        current_user.id,
        data.conversation_id,
        data.message_id
    )

    if not participant:

        raise HTTPException(
            status_code=404,
            detail="Conversation not found"
        )

    # -----------------------------------
    # Find other participant
    # -----------------------------------

    other_participant = db.query(
        ConversationParticipant
    ).filter(
        ConversationParticipant.conversation_id == data.conversation_id,
        ConversationParticipant.user_id != current_user.id
    ).first()

    # -----------------------------------
    # Publish realtime seen event
    # -----------------------------------

    if other_participant:

        await publish_message(
            other_participant.user_id,
            {
                "type": "seen",

                "conversation_id": data.conversation_id,

                "message_id": data.message_id,

                "seen_by": current_user.id
            }
        )

    return {
        "message": "Marked as read"
    }