from pydantic import BaseModel

from datetime import datetime


class ConversationCreate(BaseModel):
    user_id: int


class ConversationResponse(BaseModel):
    id: int

    conversation_key: str

    last_message_at: datetime = None


# =====================================
# OTHER USER
# =====================================

class OtherUserSchema(BaseModel):
    id: int

    name: str

    # ONLINE STATUS

    is_online: bool | None = False

    last_seen: datetime | None = None


# =====================================
# CONVERSATION LIST
# =====================================

class ConversationListResponse(BaseModel):

    conversation_id: int

    other_user: OtherUserSchema

    last_message: str | None

    unread_count: int

    last_activity: datetime | None

    class Config:
        from_attributes = True