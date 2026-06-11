from sqlalchemy.orm import Session

from Models.Message import Message
from Models.Conversations import Conversation


def create_message(
    db: Session,
    conversation_id: int,
    sender_id: int,
    content: str
):

    message = Message(
        conversation_id=conversation_id,
        sender_id=sender_id,
        content=content
    )

    db.add(message)

    db.commit()

    db.refresh(message)

    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id
    ).first()

    conversation.last_message_id = message.id
    conversation.last_message_at = message.created_at

    db.commit()

    return message