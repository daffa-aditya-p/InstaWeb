import hashlib
from datetime import datetime, timedelta

from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from sqlalchemy import func

from ..authz import current_user
from ..extensions import db
from ..models import Page, PageCollaborator, PageView, Subscription
from ..responses import error, forbidden, not_found, success

analytics_bp = Blueprint("analytics", __name__)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _get_user_subscription(user_id):
    """Return active subscription or None."""
    return Subscription.query.filter_by(user_id=user_id, status="active").first()


def _user_plan(user_id):
    sub = _get_user_subscription(user_id)
    if sub is None:
        return "free"
    return sub.plan


# ---------------------------------------------------------------------------
# POST /api/public/track  (no auth)
# ---------------------------------------------------------------------------

@analytics_bp.route("/public/track", methods=["POST"])
def track_page_view():
    data = request.get_json(silent=True) or {}
    slug = data.get("slug")
    if not slug:
        return error("slug is required")

    page = Page.query.filter_by(slug=slug, is_published=True).first()
    if page is None:
        return not_found()

    raw_ip = request.remote_addr or ""
    ip_hash = hashlib.sha256(raw_ip.encode()).hexdigest()

    view = PageView(
        page_id=page.id,
        ip_hash=ip_hash,
        user_agent=request.headers.get("User-Agent", "")[:500],
        referrer=data.get("referrer", "")[:500] if data.get("referrer") else None,
    )
    db.session.add(view)
    db.session.commit()
    return success("Page view recorded")


# ---------------------------------------------------------------------------
# GET /api/analytics/overview  (JWT)
# ---------------------------------------------------------------------------

@analytics_bp.route("/analytics/overview", methods=["GET"])
@jwt_required()
def analytics_overview():
    user = current_user()
    if user is None:
        return error("Unauthenticated", 401)

    page_ids = [p.id for p in Page.query.filter_by(user_id=user.id).all()]
    if not page_ids:
        return success("Analytics overview", {
            "total_views": 0,
            "views_today": 0,
            "views_this_week": 0,
            "views_this_month": 0,
            "top_pages": [],
        })

    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=today_start.weekday())
    month_start = today_start.replace(day=1)

    base = PageView.query.filter(PageView.page_id.in_(page_ids))

    total_views = base.count()
    views_today = base.filter(PageView.created_at >= today_start).count()
    views_this_week = base.filter(PageView.created_at >= week_start).count()
    views_this_month = base.filter(PageView.created_at >= month_start).count()

    top_pages_q = (
        db.session.query(Page.title, Page.slug, func.count(PageView.id).label("views"))
        .join(PageView, PageView.page_id == Page.id)
        .filter(Page.id.in_(page_ids))
        .group_by(Page.id)
        .order_by(func.count(PageView.id).desc())
        .limit(5)
        .all()
    )
    top_pages = [{"title": t, "slug": s, "views": v} for t, s, v in top_pages_q]

    return success("Analytics overview", {
        "total_views": total_views,
        "views_today": views_today,
        "views_this_week": views_this_week,
        "views_this_month": views_this_month,
        "top_pages": top_pages,
    })


# ---------------------------------------------------------------------------
# GET /api/analytics/pages/<slug>/summary  (JWT – free tier)
# ---------------------------------------------------------------------------

@analytics_bp.route("/analytics/pages/<slug>/summary", methods=["GET"])
@jwt_required()
def page_summary(slug):
    user = current_user()
    if user is None:
        return error("Unauthenticated", 401)

    page = Page.query.filter_by(slug=slug).first()
    if page is None:
        return not_found()

    is_owner = page.user_id == user.id
    is_admin = user.role in ("admin", "super_admin")
    is_collaborator = PageCollaborator.query.filter_by(page_id=page.id, user_id=user.id).first() is not None

    if not (is_owner or is_admin or is_collaborator):
        return forbidden()

    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    base = PageView.query.filter_by(page_id=page.id)
    total_views = base.count()
    views_today = base.filter(PageView.created_at >= today_start).count()
    views_7d = base.filter(PageView.created_at >= now - timedelta(days=7)).count()
    views_30d = base.filter(PageView.created_at >= now - timedelta(days=30)).count()

    top_referrers_q = (
        db.session.query(PageView.referrer, func.count(PageView.id).label("count"))
        .filter(PageView.page_id == page.id, PageView.referrer.isnot(None), PageView.referrer != "")
        .group_by(PageView.referrer)
        .order_by(func.count(PageView.id).desc())
        .limit(5)
        .all()
    )
    top_referrers = [{"referrer": r, "count": c} for r, c in top_referrers_q]

    return success("Page summary", {
        "total_views": total_views,
        "views_today": views_today,
        "views_7d": views_7d,
        "views_30d": views_30d,
        "top_referrers": top_referrers,
    })


# ---------------------------------------------------------------------------
# GET /api/analytics/pages/<slug>/details  (JWT – Plus+ tier)
# ---------------------------------------------------------------------------

@analytics_bp.route("/analytics/pages/<slug>/details", methods=["GET"])
@jwt_required()
def page_details(slug):
    user = current_user()
    if user is None:
        return error("Unauthenticated", 401)

    page = Page.query.filter_by(slug=slug).first()
    if page is None:
        return not_found()

    is_owner = page.user_id == user.id
    is_admin = user.role in ("admin", "super_admin")
    is_collaborator = PageCollaborator.query.filter_by(page_id=page.id, user_id=user.id).first() is not None

    if not (is_owner or is_admin or is_collaborator):
        return forbidden()

    owner_plan = _user_plan(page.user_id)
    user_plan = _user_plan(user.id)
    if owner_plan not in ("plus", "pro_plus") and user_plan not in ("plus", "pro_plus"):
        return error("Upgrade to Plus to access detailed analytics", 403)

    now = datetime.utcnow()
    thirty_days_ago = now - timedelta(days=30)

    # Daily views for the last 30 days
    daily_q = (
        db.session.query(
            func.date(PageView.created_at).label("day"),
            func.count(PageView.id).label("count"),
        )
        .filter(PageView.page_id == page.id, PageView.created_at >= thirty_days_ago)
        .group_by(func.date(PageView.created_at))
        .order_by(func.date(PageView.created_at))
        .all()
    )
    daily_views = [{"date": str(d), "count": c} for d, c in daily_q]

    # All referrers with percentages
    total = PageView.query.filter_by(page_id=page.id).count() or 1
    referrers_q = (
        db.session.query(PageView.referrer, func.count(PageView.id).label("count"))
        .filter(PageView.page_id == page.id, PageView.referrer.isnot(None), PageView.referrer != "")
        .group_by(PageView.referrer)
        .order_by(func.count(PageView.id).desc())
        .all()
    )
    all_referrers = [
        {"referrer": r, "count": c, "percentage": round(c / total * 100, 1)}
        for r, c in referrers_q
    ]

    # Unique visitors (by ip_hash)
    unique_visitors = (
        db.session.query(func.count(func.distinct(PageView.ip_hash)))
        .filter(PageView.page_id == page.id)
        .scalar()
    ) or 0

    return success("Page details", {
        "daily_views": daily_views,
        "all_referrers": all_referrers,
        "unique_visitors": unique_visitors,
    })


# ---------------------------------------------------------------------------
# GET /api/analytics/pages/<slug>/visitors  (JWT – Pro+ tier)
# ---------------------------------------------------------------------------

@analytics_bp.route("/analytics/pages/<slug>/visitors", methods=["GET"])
@jwt_required()
def page_visitors(slug):
    user = current_user()
    if user is None:
        return error("Unauthenticated", 401)

    page = Page.query.filter_by(slug=slug).first()
    if page is None:
        return not_found()

    is_owner = page.user_id == user.id
    is_admin = user.role in ("admin", "super_admin")
    is_collaborator = PageCollaborator.query.filter_by(page_id=page.id, user_id=user.id).first() is not None

    if not (is_owner or is_admin or is_collaborator):
        return forbidden()

    owner_plan = _user_plan(page.user_id)
    user_plan = _user_plan(user.id)
    if owner_plan != "pro_plus" and user_plan != "pro_plus":
        return error("Upgrade to Pro+ to access visitor logs", 403)

    visitors = (
        PageView.query
        .filter_by(page_id=page.id)
        .order_by(PageView.created_at.desc())
        .limit(100)
        .all()
    )
    data = [
        {
            "user_agent": v.user_agent,
            "referrer": v.referrer,
            "created_at": v.created_at.isoformat() if v.created_at else None,
        }
        for v in visitors
    ]

    return success("Visitor log", {"visitors": data})
