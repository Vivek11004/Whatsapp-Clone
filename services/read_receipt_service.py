from sqlalchemy.orm import Session

from Models.conversation_participants import (
    ConversationParticipant
)


def mark_as_read(
    db: Session,
    user_id: int,
    conversation_id: int,
    message_id: int
):

    participant = db.query(
        ConversationParticipant
    ).filter(
        ConversationParticipant.user_id == user_id,
        ConversationParticipant.conversation_id == conversation_id
    ).first()

    if not participant:
        return None

    participant.last_read_message_id = message_id

    db.commit()

    db.refresh(participant)

    return participant