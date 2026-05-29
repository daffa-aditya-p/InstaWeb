from flask import Blueprint

from ..models import Page
from ..responses import error, not_found, success
from ..serializers import page_to_dict

public_bp = Blueprint("public", __name__)


@public_bp.get("/public/pages/<slug>")
def public_page(slug):
    page = Page.query.filter_by(slug=slug).first()
    if page is None:
        return not_found()
    if not page.is_published:
        return error("Page is not published", 404)
    return success("Get public page successful", page_to_dict(page, include_sections=True))

