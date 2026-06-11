from pydantic import BaseModel 
from datetime import datetime
class MessageCreate(BaseModel):
    
    conversation_id:int
    content:str
    

class MessageResponse(BaseModel):
    id: int
    sender_id: int
    conversation_id: int
    content: str
    created_at: datetime
    is_deleted: bool
    deleted_at: datetime = None

    class Config:
        from_attributes = True

