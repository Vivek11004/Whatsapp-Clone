# conversation.py

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from db import Base


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)

    conversation_key = Column(
        String,
        unique=True,
        nullable=False
    )

    last_message_id = Column(
        Integer,
        ForeignKey("messages.id"),
        nullable=True
    )

    last_message_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    participants = relationship(
        "ConversationParticipant",
        back_populates="conversation"
    )

    messages = relationship(
        "Message",
        back_populates="conversation",
        foreign_keys="Message.conversation_id"
    )