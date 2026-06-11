from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    Boolean
)

from sqlalchemy.orm import relationship
from datetime import datetime
from db import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)

    email = Column(String, unique=True, nullable=False)
    phone_number = Column(
        String,
        unique=True,
        nullable=True
    )

    password_hash = Column(String, nullable=False)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    last_seen = Column(
        DateTime,
        default=datetime.utcnow
    )

    is_online = Column(
        Boolean,
        default=False
    )

    sent_messages = relationship(
        "Message",
        back_populates="sender"
    )

    conversations = relationship(
        "ConversationParticipant",
        back_populates="user"
    )
