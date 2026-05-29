from flask import Blueprint, request
from flask_jwt_extended import jwt_required

from ..authz import role_required
from ..extensions import db
from ..models import Page, PageSection, SectionFieldValue, Template, TemplateField, User
from ..responses import forbidden, invalid_field, not_found, success
from ..serializers import page_to_dict, template_to_dict, user_to_dict
from ..validators import add_error, validate_required_string, validate_slug

admin_bp = Blueprint("admin", __name__)


def validate_template_payload(payload, create=True, template=None):
    errors = {}
    name = payload.get("name")
    slug = payload.get("slug")
    fields = payload.get("fields")

    if create:
        validate_required_string(payload, "name", errors)
        validate_slug(slug, errors)
        if not isinstance(fields, list) or not fields:
            add_error(errors, "fields", "The fields field is required.")
    else:
        if "name" in payload and (not isinstance(name, str) or not name.strip()):
            add_error(errors, "name", "The name must be a non-empty string.")
        if "slug" in payload:
            validate_slug(slug, errors)
        if "fields" in payload and (not isinstance(fields, list) or not fields):
            add_error(errors, "fields", "The fields must be a non-empty array.")

    if slug:
        existing = Template.query.filter_by(slug=slug).first()
        if existing and (template is None or existing.id != template.id):
            add_error(errors, "slug", "The slug has already been taken.")

    if isinstance(fields, list):
        seen_slugs = set()
        for index, field in enumerate(fields):
            if not isinstance(field, dict):
                add_error(errors, f"fields.{index}", "Each field must be an object.")
                continue
            field_name = field.get("name")
            field_slug = field.get("slug")
            field_type = field.get("type")
            if not isinstance(field_name, str) or not field_name.strip():
                add_error(errors, f"fields.{index}.name", "The field name is required.")
            field_errors = {}
            validate_slug(field_slug, field_errors, "slug")
            for message in field_errors.get("slug", []):
                add_error(errors, f"fields.{index}.slug", message)
            if field_slug in seen_slugs:
                add_error(errors, f"fields.{index}.slug", "The field slug must be unique.")
            seen_slugs.add(field_slug)
            if field_type not in {"text", "image"}:
                add_error(errors, f"fields.{index}.type", "The type must be text or image.")

    return errors


def sync_template_fields(template, fields):
    existing = {field.slug: field for field in template.fields}
    desired_slugs = {field["slug"] for field in fields}

    for field in list(template.fields):
        if field.slug not in desired_slugs:
            db.session.delete(field)

    for field_payload in fields:
        field = existing.get(field_payload["slug"])
        if field is None:
            db.session.add(
                TemplateField(
                    template_id=template.id,
                    name=field_payload["name"].strip(),
                    slug=field_payload["slug"],
                    type=field_payload["type"],
                )
            )
        else:
            field.name = field_payload["name"].strip()
            field.type = field_payload["type"]


@admin_bp.get("/analytics")
@jwt_required()
@role_required("admin", "super_admin")
def analytics():
    roles = {
        "super_admin": User.query.filter_by(role="super_admin").count(),
        "admin": User.query.filter_by(role="admin").count(),
        "user": User.query.filter_by(role="user").count(),
    }
    return success(
        "Get platform analytics successful",
        {
            "users": User.query.count(),
            "pages": Page.query.count(),
            "published_pages": Page.query.filter_by(is_published=True).count(),
            "sections": PageSection.query.count(),
            "templates": Template.query.count(),
            "roles": roles,
        },
    )


@admin_bp.get("/users")
@jwt_required()
@role_required("super_admin")
def users():
    return success(
        "Get all users successful",
        {"users": [user_to_dict(user) for user in User.query.order_by(User.created_at.desc()).all()]},
    )


@admin_bp.put("/users/<int:user_id>")
@jwt_required()
@role_required("super_admin")
def update_user(user_id):
    user = User.query.get(user_id)
    if user is None:
        return not_found()

    payload = request.get_json(silent=True) or {}
    errors = {}
    if "name" in payload:
        if not isinstance(payload["name"], str) or not payload["name"].strip():
            add_error(errors, "name", "The name must be a non-empty string.")
        else:
            user.name = payload["name"].strip()
    if "role" in payload:
        if payload["role"] not in {"user", "admin", "super_admin"}:
            add_error(errors, "role", "The selected role is invalid.")
        else:
            user.role = payload["role"]

    if errors:
        return invalid_field(errors)

    db.session.commit()
    return success("User updated successful", user_to_dict(user))


@admin_bp.delete("/users/<int:user_id>")
@jwt_required()
@role_required("super_admin")
def delete_user(user_id):
    user = User.query.get(user_id)
    if user is None:
        return not_found()
    if user.role == "super_admin" and User.query.filter_by(role="super_admin").count() <= 1:
        return forbidden()
    db.session.delete(user)
    db.session.commit()
    return success("User deleted successful")


@admin_bp.get("/pages")
@jwt_required()
@role_required("admin", "super_admin")
def pages():
    pages_query = Page.query.order_by(Page.updated_at.desc()).all()
    pages_payload = []
    for page in pages_query:
        data = page_to_dict(page)
        data["owner"] = user_to_dict(page.user)
        pages_payload.append(data)
    return success("Get all platform pages successful", {"pages": pages_payload})


@admin_bp.delete("/pages/<identifier>")
@jwt_required()
@role_required("admin", "super_admin")
def delete_any_page(identifier):
    page = Page.query.get(int(identifier)) if str(identifier).isdigit() else None
    if page is None:
        page = Page.query.filter_by(slug=identifier).first()
    if page is None:
        return not_found()
    db.session.delete(page)
    db.session.commit()
    return success("Page deleted successful")


@admin_bp.post("/templates")
@jwt_required()
@role_required("admin", "super_admin")
def create_template():
    payload = request.get_json(silent=True) or {}
    errors = validate_template_payload(payload, create=True)
    if errors:
        return invalid_field(errors)

    template = Template(
        name=payload["name"].strip(),
        slug=payload["slug"],
        description=payload.get("description"),
    )
    db.session.add(template)
    db.session.flush()
    sync_template_fields(template, payload["fields"])
    db.session.commit()
    return success("Template created successful", template_to_dict(template), 201)


@admin_bp.put("/templates/<slug>")
@jwt_required()
@role_required("admin", "super_admin")
def update_template(slug):
    template = Template.query.filter_by(slug=slug).first()
    if template is None:
        return not_found()

    payload = request.get_json(silent=True) or {}
    errors = validate_template_payload(payload, create=False, template=template)
    if errors:
        return invalid_field(errors)

    if "name" in payload:
        template.name = payload["name"].strip()
    if "slug" in payload:
        template.slug = payload["slug"]
    if "description" in payload:
        template.description = payload.get("description")
    if "fields" in payload:
        sync_template_fields(template, payload["fields"])

    db.session.commit()
    return success("Template updated successful", template_to_dict(template))


@admin_bp.delete("/templates/<slug>")
@jwt_required()
@role_required("admin", "super_admin")
def delete_template(slug):
    template = Template.query.filter_by(slug=slug).first()
    if template is None:
        return not_found()
    if PageSection.query.filter_by(template_id=template.id).first():
        return invalid_field({"template": ["The template is currently used by one or more sections."]})
    db.session.delete(template)
    db.session.commit()
    return success("Template deleted successful")

