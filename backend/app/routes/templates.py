from flask import Blueprint
from flask_jwt_extended import jwt_required

from ..models import Template
from ..responses import not_found, success
from ..serializers import template_to_dict

templates_bp = Blueprint("templates", __name__)


@templates_bp.get("/templates")
@jwt_required()
def index_templates():
    templates = Template.query.order_by(Template.id.asc()).all()
    return success(
        "Get all templates successful",
        {"templates": [template_to_dict(template) for template in templates]},
    )


@templates_bp.get("/templates/<slug>")
@jwt_required()
def show_template(slug):
    template = Template.query.filter_by(slug=slug).first()
    if template is None:
        return not_found()
    return success("Get template successful", template_to_dict(template))

