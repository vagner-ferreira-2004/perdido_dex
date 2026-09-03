from functools import wraps
from typing import Callable

from flask import abort, g


def requireRole(*role_names: str) -> Callable:
    if not role_names:
        raise ValueError("At least one role is required")

    def decorator(route_handler: Callable) -> Callable:
        @wraps(route_handler)
        def wrapped(*args, **kwargs):
            current_user = getattr(g, "current_user", None)
            if current_user is None:
                abort(401)

            current_role = getattr(getattr(current_user, "role", None), "name", None)
            if current_role not in role_names:
                abort(403)

            return route_handler(*args, **kwargs)

        return wrapped

    return decorator