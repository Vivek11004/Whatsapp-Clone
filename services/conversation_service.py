from sqlalchemy.orm import Session

from Models.Conversations import Conversation
from Models.conversation_participants import (
    ConversationParticipant
)

from utils.conversation import (
    generate_conversation_key
)


def get_or_create_conversation(
    db: Session,
    user1_id: int,
    user2_id: int
):

    key = generate_conversation_key(
        user1_id,
        user2_id
    )

    conversation = db.query(Conversation).filter(
        Conversation.conversation_key == key
    ).first()

    if conversation:
        return conversation

    conversation = Conversation(
        conversation_key=key
    )

    db.add(conversation)

    db.commit()

    db.refresh(conversation)

    participant1 = ConversationParticipant(
        conversation_id=conversation.id,
        user_id=user1_id
    )

    participant2 = ConversationParticipant(
        conversation_id=conversation.id,
        user_id=user2_id
    )

    db.add(participant1)
    db.add(participant2)

    db.commit()

    return conversation