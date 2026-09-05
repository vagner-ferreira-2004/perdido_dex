from flask import Blueprint

from controllers.auth import login, register
from middlewares.CreateLimiter import limiter

auth_bp = Blueprint("auth", __name__)

auth_bp.post("/auth/register")(limiter.limit("5 per hour")(register))
auth_bp.post("/auth/login")(limiter.limit("5 per minute")(login))
