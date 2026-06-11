# conversation_participant.py

from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from db import Base


class ConversationParticipant(Base):
    __tablename__ = "conversation_participants"

    id = Column(Integer, primary_key=True, index=True)

    conversation_id = Column(
        Integer,
        ForeignKey("conversations.id"),
        nullable=False
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    last_read_message_id = Column(
        Integer,
        ForeignKey("messages.id"),
        nullable=True
    )

    joined_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    conversation = relationship(
        "Conversation",
        back_populates="participants"
    )

    user = relationship(
        "User",
        back_populates="conversations"
    )