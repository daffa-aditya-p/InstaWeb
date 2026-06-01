from flask import Blueprint, request
from flask_jwt_extended import jwt_required

from ..authz import current_user
from ..extensions import db
from ..models import Invitation, Page, PageCollaborator, Subscription, User
from ..responses import error, forbidden, not_found, success

invitation_bp = Blueprint("invitations", __name__)


# ---------------------------------------------------------------------------
# POST /api/pages/<slug>/invite — Send invitation (Pro+ only, page owner)
# ---------------------------------------------------------------------------

@invitation_bp.route("/pages/<slug>/invite", methods=["POST"])
@jwt_required()
def send_invitation(slug):
    user = current_user()
    if not user:
        return error("Unauthenticated", 401)

    # Check Pro+ plan
    sub = Subscription.query.filter_by(user_id=user.id, status="active").first()
    if not sub or sub.plan != "pro_plus":
        return error("Pro+ plan required to invite collaborators", 403)

    page = Page.query.filter_by(slug=slug).first()
    if not page:
        return not_found()
    if page.user_id != user.id:
        return forbidden()

    # Check max 5 collaborators
    existing_collabs = PageCollaborator.query.filter_by(page_id=page.id).count()
    pending_invites = Invitation.query.filter_by(page_id=page.id, status="pending").count()
    if existing_collabs + pending_invites >= 5:
        return error("Maximum 5 collaborators per page", 400)

    data = request.get_json(silent=True) or {}
    email = data.get("email", "").strip().lower()
    message = data.get("message", "").strip()

    if not email:
        return error("Email is required")

    recipient = User.query.filter_by(email=email).first()
    if not recipient:
        return error("User with that email not found", 404)
    if recipient.id == user.id:
        return error("Cannot invite yourself")

    # Check if already collaborator
    existing = PageCollaborator.query.filter_by(page_id=page.id, user_id=recipient.id).first()
    if existing:
        return error("User is already a collaborator")

    # Check existing pending invite
    existing_invite = Invitation.query.filter_by(
        page_id=page.id, recipient_id=recipient.id, status="pending",
    ).first()
    if existing_invite:
        return error("Invitation already sent to this user")

    invite = Invitation(
        page_id=page.id,
        sender_id=user.id,
        recipient_id=recipient.id,
        message=message or None,
    )
    db.session.add(invite)
    db.session.commit()

    return success("Invitation sent", {
        "id": invite.id,
        "recipient": {"id": recipient.id, "name": recipient.name, "email": recipient.email},
        "status": invite.status,
    }, 201)


# ---------------------------------------------------------------------------
# GET /api/inbox — Get current user's invitations
# ---------------------------------------------------------------------------

@invitation_bp.route("/inbox", methods=["GET"])
@jwt_required()
def get_inbox():
    user = current_user()
    if not user:
        return error("Unauthenticated", 401)

    invitations = (
        Invitation.query
        .filter_by(recipient_id=user.id)
        .order_by(Invitation.created_at.desc())
        .all()
    )
    items = []
    for inv in invitations:
        items.append({
            "id": inv.id,
            "page": (
                {"id": inv.page.id, "title": inv.page.title, "slug": inv.page.slug}
                if inv.page else None
            ),
            "sender": {"id": inv.sender.id, "name": inv.sender.name, "email": inv.sender.email},
            "message": inv.message,
            "status": inv.status,
            "created_at": inv.created_at.isoformat(),
        })

    unread_count = Invitation.query.filter_by(recipient_id=user.id, status="pending").count()
    return success("Inbox", {"invitations": items, "unread_count": unread_count})


# ---------------------------------------------------------------------------
# PUT /api/inbox/<id>/accept
# ---------------------------------------------------------------------------

@invitation_bp.route("/inbox/<int:invite_id>/accept", methods=["PUT"])
@jwt_required()
def accept_invitation(invite_id):
    user = current_user()
    if not user:
        return error("Unauthenticated", 401)

    invite = Invitation.query.get(invite_id)
    if not invite or invite.recipient_id != user.id:
        return not_found()
    if invite.status != "pending":
        return error("Invitation already " + invite.status)

    invite.status = "accepted"

    # Add as collaborator
    existing = PageCollaborator.query.filter_by(page_id=invite.page_id, user_id=user.id).first()
    if not existing:
        collab = PageCollaborator(
            page_id=invite.page_id,
            user_id=user.id,
            permission="editor",
        )
        db.session.add(collab)

    db.session.commit()
    return success("Invitation accepted. You can now edit this page.")


# ---------------------------------------------------------------------------
# PUT /api/inbox/<id>/decline
# ---------------------------------------------------------------------------

@invitation_bp.route("/inbox/<int:invite_id>/decline", methods=["PUT"])
@jwt_required()
def decline_invitation(invite_id):
    user = current_user()
    if not user:
        return error("Unauthenticated", 401)

    invite = Invitation.query.get(invite_id)
    if not invite or invite.recipient_id != user.id:
        return not_found()
    if invite.status != "pending":
        return error("Invitation already " + invite.status)

    invite.status = "declined"
    db.session.commit()
    return success("Invitation declined")


# ---------------------------------------------------------------------------
# GET /api/inbox/count — Quick unread count for badge
# ---------------------------------------------------------------------------

@invitation_bp.route("/inbox/count", methods=["GET"])
@jwt_required()
def inbox_count():
    user = current_user()
    if not user:
        return error("Unauthenticated", 401)
    count = Invitation.query.filter_by(recipient_id=user.id, status="pending").count()
    return success("Unread count", {"count": count})
