from flask import Blueprint, jsonify, request
from pydantic import ValidationError

from services import loginUser, registerUser
from services.errors import ServiceError
from validators.RegisterSchema import LoginSchema, RegisterSchema


def _validationError(error: ValidationError):
    return jsonify({"error": "Invalid request", "details": error.errors()}), 400


def _serviceError(error: ServiceError):
    return jsonify({"error": str(error)}), error.status_code


def register():
    try:
        data = RegisterSchema.model_validate(request.get_json(silent=True) or {})
        return jsonify(registerUser(data.model_dump())), 201
    except ValidationError as error:
        return _validationError(error)
    except ServiceError as error:
        return _serviceError(error)


def login():
    try:
        data = LoginSchema.model_validate(request.get_json(silent=True) or {})
        return jsonify(loginUser(data.model_dump())), 200
    except ValidationError as error:
        return _validationError(error)
    except ServiceError as error:
        return _serviceError(error)
