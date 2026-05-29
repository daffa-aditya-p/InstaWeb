from flask import Blueprint, request
from flask_jwt_extended import jwt_required

from ..authz import current_user
from ..extensions import db
from ..models import User
from ..responses import invalid_field, success
from ..serializers import user_to_dict
from ..validators import add_error, validate_email_field

profile_bp = Blueprint("profile", __name__)


@profile_bp.get("/me")
@jwt_required()
def me():
    return success("Get profile successful", user_to_dict(current_user()))


@profile_bp.put("/me")
@jwt_required()
def update_me():
    user = current_user()
    payload = request.get_json(silent=True) or {}
    errors = {}

    name = payload.get("name")
    email = payload.get("email")
    password = payload.get("password")

    if name is not None:
        if not isinstance(name, str) or not name.strip():
            add_error(errors, "name", "The name must be a non-empty string.")
        else:
            user.name = name.strip()

    if email is not None:
        validate_email_field(email, errors)
        existing = User.query.filter_by(email=email.lower().strip()).first()
        if existing and existing.id != user.id:
            add_error(errors, "email", "The email has already been taken.")
        if "email" not in errors:
            user.email = email.lower().strip()

    if password is not None:
        if not isinstance(password, str) or len(password) < 6:
            add_error(errors, "password", "The password must be at least 6 characters.")
        else:
            user.set_password(password)

    if errors:
        return invalid_field(errors)

    db.session.commit()
    return success("Profile updated successful", user_to_dict(user))
