from database.database import Session
from helpers.HashPassword import hashPassword
from models import Profile, Role, User
from services.errors import ConflictError, ServiceError


def registerUser(data: dict) -> dict:
    with Session.begin() as session:
        if session.query(User).filter_by(email=data["email"]).first():
            raise ConflictError("Email already registered")
        if session.query(User).filter_by(cpf=data["cpf"]).first():
            raise ConflictError("CPF already registered")

        profile = session.get(Profile, data["id_profile"])
        if profile is None:
            raise ServiceError("Profile not found")
        if profile.name == "student" and not data.get("rgm"):
            raise ServiceError("RGM is required for students")
        if data.get("rgm") and session.query(User).filter_by(rgm=data["rgm"]).first():
            raise ConflictError("RGM already registered")

        common_role = session.query(Role).filter_by(name="common").one_or_none()
        if common_role is None:
            raise ServiceError("Common role is not configured")

        user = User(
            name=data["name"],
            cpf=data["cpf"],
            phone=data["phone"],
            email=data["email"],
            rgm=data.get("rgm"),
            password_hash=hashPassword(data["password"]),
            id_profile=profile.id_profile,
            role_id=common_role.id_role,
        )
        session.add(user)
        session.flush()
        return {
            "id_user": user.id_user,
            "name": user.name,
            "cpf": user.cpf,
            "phone": user.phone,
            "email": user.email,
            "rgm": user.rgm,
            "id_profile": user.id_profile,
            "role": common_role.name,
        }
