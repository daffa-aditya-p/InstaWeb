from flask import Blueprint, request
from flask_jwt_extended import jwt_required

from ..authz import current_user
from ..extensions import db
from ..models import Page, PageCollaborator, Subscription, User
from ..responses import error, not_found, success

collaborator_bp = Blueprint("collaborators", __name__)


def _has_pro_plus(user_id):
    sub = Subscription.query.filter_by(user_id=user_id, status="active").first()
    return sub is not None and sub.plan == "pro_plus"


# ---------------------------------------------------------------------------
# GET /api/pages/<slug>/collaborators
# ---------------------------------------------------------------------------

@collaborator_bp.route("/pages/<slug>/collaborators", methods=["GET"])
@jwt_required()
def list_collaborators(slug):
    user = current_user()
    if user is None:
        return error("Unauthenticated", 401)

    page = Page.query.filter_by(slug=slug, user_id=user.id).first()
    if page is None:
        return not_found()

    if not _has_pro_plus(user.id):
        return error("Upgrade to Pro+ to manage collaborators", 403)

    collabs = PageCollaborator.query.filter_by(page_id=page.id).all()
    data = [
        {
            "id": c.id,
            "user_id": c.user_id,
            "email": c.user.email if c.user else None,
            "name": c.user.name if c.user else None,
            "permission": c.permission,
            "invited_at": c.invited_at.isoformat() if c.invited_at else None,
        }
        for c in collabs
    ]
    return success("Collaborators list", {"collaborators": data})


# ---------------------------------------------------------------------------
# POST /api/pages/<slug>/collaborators
# ---------------------------------------------------------------------------

@collaborator_bp.route("/pages/<slug>/collaborators", methods=["POST"])
@jwt_required()
def add_collaborator(slug):
    user = current_user()
    if user is None:
        return error("Unauthenticated", 401)

    page = Page.query.filter_by(slug=slug, user_id=user.id).first()
    if page is None:
        return not_found()

    if not _has_pro_plus(user.id):
        return error("Upgrade to Pro+ to manage collaborators", 403)

    data = request.get_json(silent=True) or {}
    email = data.get("email", "").strip()
    if not email:
        return error("email is required")

    target_user = User.query.filter_by(email=email).first()
    if target_user is None:
        return error("User not found with that email", 404)

    if target_user.id == user.id:
        return error("You cannot add yourself as a collaborator")

    existing = PageCollaborator.query.filter_by(page_id=page.id, user_id=target_user.id).first()
    if existing:
        return error("User is already a collaborator")

    count = PageCollaborator.query.filter_by(page_id=page.id).count()
    if count >= 5:
        return error("Maximum 5 collaborators per page")

    collab = PageCollaborator(
        page_id=page.id,
        user_id=target_user.id,
        permission=data.get("permission", "editor"),
    )
    db.session.add(collab)
    db.session.commit()

    return success("Collaborator added", {
        "id": collab.id,
        "user_id": collab.user_id,
        "email": target_user.email,
        "name": target_user.name,
        "permission": collab.permission,
    }, status_code=201)


# ---------------------------------------------------------------------------
# DELETE /api/pages/<slug>/collaborators/<collab_id>
# ---------------------------------------------------------------------------

@collaborator_bp.route("/pages/<slug>/collaborators/<int:collab_id>", methods=["DELETE"])
@jwt_required()
def remove_collaborator(slug, collab_id):
    user = current_user()
    if user is None:
        return error("Unauthenticated", 401)

    page = Page.query.filter_by(slug=slug, user_id=user.id).first()
    if page is None:
        return not_found()

    collab = PageCollaborator.query.filter_by(id=collab_id, page_id=page.id).first()
    if collab is None:
        return not_found()

    db.session.delete(collab)
    db.session.commit()
    return success("Collaborator removed")
