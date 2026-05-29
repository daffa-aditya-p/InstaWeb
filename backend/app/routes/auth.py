from flask import Blueprint, request
from flask_jwt_extended import create_access_token, get_jwt, get_jwt_identity, jwt_required

from ..extensions import db
from ..models import TokenBlocklist, User
from ..responses import error, invalid_field, success
from ..serializers import user_to_dict
from ..validators import add_error, validate_email_field, validate_required_string

auth_bp = Blueprint("auth", __name__)


@auth_bp.post("/register")
def register():
    payload = request.get_json(silent=True) or {}
    errors = {}

    name = validate_required_string(payload, "name", errors)
    email = payload.get("email")
    password = validate_required_string(payload, "password", errors, min_length=6)
    validate_email_field(email, errors)

    if email and User.query.filter_by(email=email.lower()).first():
        add_error(errors, "email", "The email has already been taken.")

    if errors:
        return invalid_field(errors)

    user = User(name=name.strip(), email=email.lower().strip(), role="user")
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=str(user.id), additional_claims={"role": user.role})
    return success("Registration successful", user_to_dict(user, token), 201)


@auth_bp.post("/login")
def login():
    payload = request.get_json(silent=True) or {}
    errors = {}

    email = payload.get("email")
    password = payload.get("password")
    validate_email_field(email, errors)
    if not password:
        add_error(errors, "password", "The password field is required.")

    if errors:
        return invalid_field(errors)

    user = User.query.filter_by(email=email.lower().strip()).first()
    if not user or not user.check_password(password):
        return error("Username or password incorrect", 401)

    token = create_access_token(identity=str(user.id), additional_claims={"role": user.role})
    return success("Login successful", user_to_dict(user, token))


@auth_bp.post("/logout")
@jwt_required()
def logout():
    jwt_payload = get_jwt()
    db.session.add(
        TokenBlocklist(jti=jwt_payload["jti"], user_id=int(get_jwt_identity()))
    )
    db.session.commit()
    return success("Logout successful")

