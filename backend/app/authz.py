from functools import wraps

from flask_jwt_extended import get_jwt_identity

from .models import Page, PageCollaborator, User
from .responses import forbidden, not_found


ADMIN_ROLES = {"admin", "super_admin"}
ALL_ROLES = {"user", "admin", "super_admin"}


def current_user():
    identity = get_jwt_identity()
    if identity is None:
        return None
    return User.query.get(int(identity))


def role_required(*roles):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            user = current_user()
            if not user or user.role not in roles:
                return forbidden()
            return fn(*args, **kwargs)

        return wrapper

    return decorator


def get_page_or_response(identifier, user=None, allow_admin=True):
    page = None
    if str(identifier).isdigit():
        page = Page.query.get(int(identifier))
    if page is None:
        page = Page.query.filter_by(slug=identifier).first()
    if page is None:
        return None, not_found()
    if user:
        is_owner = page.user_id == user.id
        is_admin = allow_admin and user.role in ADMIN_ROLES
        is_collaborator = PageCollaborator.query.filter_by(
            page_id=page.id, user_id=user.id
        ).first() is not None
        if not (is_owner or is_admin or is_collaborator):
            return None, forbidden()
    return page, None

