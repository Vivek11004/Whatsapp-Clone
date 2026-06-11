# message.py

from sqlalchemy import (
    Column,
    Integer,
    ForeignKey,
    DateTime,
    Boolean,
    Text
)
from sqlalchemy.orm import relationship
from datetime import datetime
from db import Base


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)

    conversation_id = Column(
        Integer,
        ForeignKey("conversations.id"),
        nullable=False
    )

    sender_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    content = Column(Text, nullable=False)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    is_deleted = Column(
        Boolean,
        default=False
    )

    deleted_at = Column(
        DateTime,
        nullable=True
    )

    conversation = relationship(
        "Conversation",
        back_populates="messages",
        foreign_keys=[conversation_id]
    )

    sender = relationship(
        "User",
        back_populates="sent_messages"
    )