import os

from database.database import Session
from helpers.GenerateToken import generateToken
from helpers.HashPassword import verifyPassword
from models import User
from services.errors import AuthenticationError


def loginUser(data: dict) -> dict:
    with Session() as session:
        user = session.query(User).filter_by(email=data["email"]).one_or_none()
        if user is None or not verifyPassword(data["password"], user.password_hash):
            raise AuthenticationError("Invalid credentials")

        expires_in = int(os.getenv("JWT_EXPIRATION_MINUTES", "60"))
        token = generateToken(
            {"sub": str(user.id_user), "role": user.role.name}, expires_in
        )
        return {"access_token": token, "token_type": "bearer"}
