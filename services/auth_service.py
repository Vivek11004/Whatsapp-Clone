from sqlalchemy.orm import Session

from Models.Users import User

from core.security import (
    hash_password,
    verify_password
)


def create_user(
    db: Session,
    name,
    email,
    password,
    phone_number
):

    user = User(
        name=name,
        email=email,
        password_hash=hash_password(password),
        phone_number=phone_number
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def authenticate_user(
    db: Session,
    email,
    password
):

    user = db.query(User).filter(
        User.email == email
    ).first()

    if not user:
        return None

    if not verify_password(
        password,
        user.password_hash
    ):
        return None

    return user