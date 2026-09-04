from flask import Blueprint

from controllers.auth import login, register

auth_bp = Blueprint("auth", __name__)

auth_bp.post("/auth/register")(register)
auth_bp.post("/auth/login")(login)
