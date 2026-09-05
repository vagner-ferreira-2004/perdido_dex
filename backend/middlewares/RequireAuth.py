from functools import wraps
from typing import Callable

import jwt
from flask import g, jsonify, request

from helpers.GenerateToken import decodeToken


def requireAuth() -> Callable:
    def decorator(function: Callable) -> Callable:
        @wraps(function)
        def wrapped(*args, **kwargs):
            authorization = request.headers.get("Authorization", "")
            scheme, _, token = authorization.partition(" ")
            if scheme.lower() != "bearer" or not token:
                return jsonify({"error": "Authentication required"}), 401
            try:
                payload = decodeToken(token)
                user_id = payload.get("sub")
                if user_id is None:
                    raise jwt.InvalidTokenError("Missing subject")
                g.user_id = int(user_id)
                g.role = payload.get("role")
            except (ValueError, jwt.InvalidTokenError, jwt.PyJWTError):
                return jsonify({"error": "Invalid or expired token"}), 401
            return function(*args, **kwargs)

        return wrapped

    return decorator


def requireRole(role_name: str) -> Callable:
    def decorator(function: Callable) -> Callable:
        @wraps(function)
        def wrapped(*args, **kwargs):
            if getattr(g, "role", None) != role_name:
                return jsonify({"error": "Insufficient permissions"}), 403
            return function(*args, **kwargs)

        return wrapped

    return decorator
