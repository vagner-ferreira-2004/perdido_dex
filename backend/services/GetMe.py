from database.database import Session
from helpers.HashPassword import hashPassword, verifyPassword
from models import User
from services.errors import AuthenticationError, ConflictError, NotFoundError


def _getUser(session, user_id: int) -> User:
    user = session.get(User, user_id)
    if user is None:
        raise NotFoundError("User not found")
    return user


def _serializeUser(user: User) -> dict:
    return {
        "id_user": user.id_user,
        "name": user.name,
        "cpf": user.cpf,
        "phone": user.phone,
        "email": user.email,
        "rgm": user.rgm,
        "id_profile": user.id_profile,
        "profile": user.profile.name,
        "role": user.role.name,
    }


def getMe(user_id: int) -> dict:
    with Session() as session:
        return _serializeUser(_getUser(session, user_id))


def updateMe(user_id: int, data: dict) -> dict:
    with Session.begin() as session:
        user = _getUser(session, user_id)
        if data.get("email") and data["email"] != user.email:
            duplicate = session.query(User).filter(
                User.email == data["email"], User.id_user != user_id
            ).first()
            if duplicate:
                raise ConflictError("Email already registered")
        for field in ("name", "phone", "email"):
            if data.get(field) is not None:
                setattr(user, field, data[field])
        session.flush()
        return _serializeUser(user)


def deleteMe(user_id: int) -> None:
    with Session.begin() as session:
        user = _getUser(session, user_id)
        session.delete(user)


def changePassword(user_id: int, data: dict) -> None:
    with Session.begin() as session:
        user = _getUser(session, user_id)
        if not verifyPassword(data["current_password"], user.password_hash):
            raise AuthenticationError("Current password is invalid")
        user.password_hash = hashPassword(data["new_password"])
