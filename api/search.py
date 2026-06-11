from fastapi import (
    APIRouter,
    Depends,
    Query
)

from sqlalchemy.orm import Session

from sqlalchemy import or_

from Depends.get_db import get_db

from Models.Users import User 
from schemas.user import UserSearchResponse

from Depends.auth import (
    get_current_user
)

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

@router.get("/search" , response_model=list[UserSearchResponse])
def search_users(
    q: str = Query(...),

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    )
):

    users = db.query(User).filter(
        User.id != current_user.id,

        or_(
            User.name.ilike(
                f"%{q}%"
            ),

            User.email.ilike(
                f"%{q}%"
            ),

            User.phone_number.ilike(
                f"%{q}%"
            )
        )
    ).all()

    return [
        {
            "id": user.id,

            "name": user.name,

           
        }
        for user in users
    ]