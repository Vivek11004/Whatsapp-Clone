from pydantic import BaseModel, EmailStr
from datetime import datetime
class UserCreate(BaseModel):
    
    name:str
    email: EmailStr
    password: str
    phone_number: str 

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone_number: str

class UserSearchResponse(BaseModel):
    id: int
    name: str
    
    class Config:
        from_attributes = True
    

    class Config:
        from_attributes = True