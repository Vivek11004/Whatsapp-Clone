from pydantic import BaseModel


class MarkAsReadRequest(BaseModel):

    conversation_id: int

    message_id: int