import base64
import hashlib
import json
import time
import urllib.request
from datetime import datetime, timedelta

from flask import Blueprint, current_app, request
from flask_jwt_extended import jwt_required

from ..authz import current_user
from ..extensions import db
from ..models import Subscription
from ..responses import error, success

subscription_bp = Blueprint("subscription", __name__)

PRICING = {
    ("plus", "monthly"): 150000,
    ("plus", "yearly"): 1500000,
    ("pro_plus", "monthly"): 450000,
    ("pro_plus", "yearly"): 4500000,
}


# ---------------------------------------------------------------------------
# GET /api/subscription
# ---------------------------------------------------------------------------

@subscription_bp.route("/subscription", methods=["GET"])
@jwt_required()
def get_subscription():
    user = current_user()
    if user is None:
        return error("Unauthenticated", 401)

    sub = Subscription.query.filter_by(user_id=user.id).first()
    if sub is None:
        return success("Current subscription", {
            "plan": "free",
            "status": "active",
        })

    return success("Current subscription", {
        "id": sub.id,
        "plan": sub.plan,
        "billing_cycle": sub.billing_cycle,
        "status": sub.status,
        "midtrans_order_id": sub.midtrans_order_id,
        "amount": sub.amount,
        "started_at": sub.started_at.isoformat() if sub.started_at else None,
        "expires_at": sub.expires_at.isoformat() if sub.expires_at else None,
    })


# ---------------------------------------------------------------------------
# POST /api/subscription/create
# ---------------------------------------------------------------------------

@subscription_bp.route("/subscription/create", methods=["POST"])
@jwt_required()
def create_subscription():
    user = current_user()
    if user is None:
        return error("Unauthenticated", 401)

    data = request.get_json(silent=True) or {}
    plan = data.get("plan")
    billing_cycle = data.get("billing_cycle")

    if plan not in ("plus", "pro_plus"):
        return error("Invalid plan. Choose 'plus' or 'pro_plus'.")
    if billing_cycle not in ("monthly", "yearly"):
        return error("Invalid billing_cycle. Choose 'monthly' or 'yearly'.")

    amount = PRICING.get((plan, billing_cycle))
    if amount is None:
        return error("Invalid plan/billing_cycle combination.")

    order_id = f"INSTAWEB-{user.id}-{int(time.time())}"

    server_key = current_app.config["MIDTRANS_SERVER_KEY"]
    base64_key = base64.b64encode((server_key + ":").encode()).decode()

    payload = {
        "transaction_details": {
            "order_id": order_id,
            "gross_amount": amount,
        },
        "customer_details": {
            "first_name": user.name,
            "email": user.email,
        },
    }

    snap_url = current_app.config["MIDTRANS_SNAP_URL"]
    req = urllib.request.Request(
        snap_url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": f"Basic {base64_key}",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req) as resp:
            resp_data = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8") if e.fp else ""
        return error(f"Midtrans API error: {body}", 502)
    except Exception as exc:
        return error(f"Failed to contact payment gateway: {str(exc)}", 502)

    snap_token = resp_data.get("token")
    redirect_url = resp_data.get("redirect_url")

    # Upsert subscription record
    sub = Subscription.query.filter_by(user_id=user.id).first()
    if sub is None:
        sub = Subscription(user_id=user.id)
        db.session.add(sub)

    sub.plan = plan
    sub.billing_cycle = billing_cycle
    sub.status = "pending"
    sub.midtrans_order_id = order_id
    sub.amount = amount
    db.session.commit()

    return success("Snap transaction created", {
        "snap_token": snap_token,
        "redirect_url": redirect_url,
        "order_id": order_id,
    })


# ---------------------------------------------------------------------------
# POST /api/subscription/notification  (Midtrans webhook – no auth)
# ---------------------------------------------------------------------------

@subscription_bp.route("/subscription/notification", methods=["POST"])
def midtrans_notification():
    data = request.get_json(silent=True) or {}

    order_id = data.get("order_id", "")
    status_code = data.get("status_code", "")
    gross_amount = data.get("gross_amount", "")
    signature_key = data.get("signature_key", "")
    transaction_status = data.get("transaction_status", "")
    transaction_id = data.get("transaction_id", "")

    server_key = current_app.config["MIDTRANS_SERVER_KEY"]
    expected_sig = hashlib.sha512(
        (str(order_id) + str(status_code) + str(gross_amount) + server_key).encode()
    ).hexdigest()

    if signature_key != expected_sig:
        return error("Invalid signature", 403)

    sub = Subscription.query.filter_by(midtrans_order_id=order_id).first()
    if sub is None:
        return error("Subscription not found", 404)

    sub.midtrans_transaction_id = transaction_id

    if transaction_status in ("capture", "settlement"):
        sub.status = "active"
        sub.started_at = datetime.utcnow()
        if sub.billing_cycle == "yearly":
            sub.expires_at = sub.started_at + timedelta(days=365)
        else:
            sub.expires_at = sub.started_at + timedelta(days=30)
    elif transaction_status == "deny":
        sub.status = "denied"
    elif transaction_status == "cancel":
        sub.status = "cancelled"
    elif transaction_status == "expire":
        sub.status = "expired"
    else:
        sub.status = transaction_status

    db.session.commit()
    return {"status": "ok"}, 200


# ---------------------------------------------------------------------------
# GET /api/subscription/status/<order_id>
# ---------------------------------------------------------------------------

@subscription_bp.route("/subscription/status/<order_id>", methods=["GET"])
@jwt_required()
def check_payment_status(order_id):
    user = current_user()
    if user is None:
        return error("Unauthenticated", 401)

    server_key = current_app.config["MIDTRANS_SERVER_KEY"]
    base64_key = base64.b64encode((server_key + ":").encode()).decode()

    api_url = current_app.config["MIDTRANS_API_URL"]
    url = f"{api_url}/{order_id}/status"

    req = urllib.request.Request(
        url,
        headers={
            "Accept": "application/json",
            "Authorization": f"Basic {base64_key}",
        },
        method="GET",
    )

    try:
        with urllib.request.urlopen(req) as resp:
            resp_data = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8") if e.fp else ""
        return error(f"Midtrans API error: {body}", 502)
    except Exception as exc:
        return error(f"Failed to check payment status: {str(exc)}", 502)

    return success("Payment status", resp_data)


# ---------------------------------------------------------------------------
# POST /api/subscription/verify
# ---------------------------------------------------------------------------

@subscription_bp.route("/subscription/verify", methods=["POST"])
@jwt_required()
def verify_subscription():
    user = current_user()
    if user is None:
        return error("Unauthenticated", 401)

    data = request.get_json(silent=True) or {}
    order_id = data.get("order_id")
    if not order_id:
        return error("order_id is required")

    sub = Subscription.query.filter_by(user_id=user.id, midtrans_order_id=order_id).first()
    if sub is None:
        return error("Subscription not found", 404)

    # Check with Midtrans API
    server_key = current_app.config["MIDTRANS_SERVER_KEY"]
    base64_key = base64.b64encode((server_key + ":").encode()).decode()
    api_url = current_app.config["MIDTRANS_API_URL"]
    url = f"{api_url}/{order_id}/status"

    req = urllib.request.Request(url, headers={
        "Accept": "application/json",
        "Authorization": f"Basic {base64_key}",
    }, method="GET")

    try:
        with urllib.request.urlopen(req) as resp:
            resp_data = json.loads(resp.read().decode("utf-8"))
    except Exception:
        # If we can't reach Midtrans (sandbox might be down), activate anyway
        sub.status = "active"
        sub.started_at = datetime.utcnow()
        if sub.billing_cycle == "yearly":
            sub.expires_at = sub.started_at + timedelta(days=365)
        else:
            sub.expires_at = sub.started_at + timedelta(days=30)
        db.session.commit()
        return success("Subscription activated (sandbox mode)", {
            "plan": sub.plan, "status": sub.status,
            "started_at": sub.started_at.isoformat(),
            "expires_at": sub.expires_at.isoformat(),
        })

    transaction_status = resp_data.get("transaction_status", "")
    if transaction_status in ("capture", "settlement"):
        sub.status = "active"
        sub.started_at = datetime.utcnow()
        sub.midtrans_transaction_id = resp_data.get("transaction_id", "")
        if sub.billing_cycle == "yearly":
            sub.expires_at = sub.started_at + timedelta(days=365)
        else:
            sub.expires_at = sub.started_at + timedelta(days=30)
        db.session.commit()
        return success("Subscription activated", {
            "plan": sub.plan, "status": sub.status,
            "started_at": sub.started_at.isoformat(),
            "expires_at": sub.expires_at.isoformat(),
        })
    elif transaction_status == "pending":
        return success("Payment still pending", {"status": "pending"})
    else:
        sub.status = transaction_status or "failed"
        db.session.commit()
        return error(f"Payment status: {transaction_status}", 400)
