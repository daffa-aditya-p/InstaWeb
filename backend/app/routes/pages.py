import os
import time
from datetime import datetime

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required
from werkzeug.utils import secure_filename

from ..authz import current_user, get_page_or_response
from ..extensions import db
from ..models import Page, PageSection, SectionFieldValue, Template
from ..responses import forbidden, invalid_field, not_found, success
from ..serializers import page_to_dict, section_to_dict
from ..validators import add_error, validate_optional_string, validate_required_string, validate_slug

pages_bp = Blueprint("pages", __name__)


def validate_page_payload(payload, create=True, page=None):
    errors = {}

    title = payload.get("title")
    slug = payload.get("slug")
    summary = payload.get("summary")

    if create:
        title = validate_required_string(payload, "title", errors)
        validate_slug(slug, errors)
    else:
        if "title" in payload:
            validate_optional_string(payload, "title", errors)
            if title == "":
                add_error(errors, "title", "The title field is required.")
        if "slug" in payload:
            validate_slug(slug, errors)

    if "summary" in payload:
        validate_optional_string(payload, "summary", errors)

    if slug:
        existing = Page.query.filter_by(slug=slug).first()
        if existing and (page is None or existing.id != page.id):
            add_error(errors, "slug", "The slug has already been taken.")

    return errors


def own_page(slug):
    user = current_user()
    page = Page.query.filter_by(slug=slug).first()
    if page is None:
        return None, not_found()
    if page.user_id != user.id and user.role not in {"admin", "super_admin"}:
        return None, forbidden()
    return page, None


def normalize_positions(page):
    for index, section in enumerate(sorted(page.sections, key=lambda item: item.position), start=1):
        section.position = index


@pages_bp.post("/pages")
@jwt_required()
def create_page():
    payload = request.get_json(silent=True) or {}
    errors = validate_page_payload(payload, create=True)
    if errors:
        return invalid_field(errors)

    user = current_user()
    page = Page(
        user_id=user.id,
        title=payload["title"].strip(),
        slug=payload["slug"].strip(),
        summary=payload.get("summary"),
    )
    db.session.add(page)
    db.session.commit()
    return success("Page created successful", page_to_dict(page), 201)


@pages_bp.get("/pages")
@jwt_required()
def index_pages():
    user = current_user()
    pages = Page.query.filter_by(user_id=user.id).order_by(Page.updated_at.desc()).all()
    return success(
        "Get all pages successful",
        {"pages": [page_to_dict(page) for page in pages]},
    )


@pages_bp.get("/pages/<identifier>")
@jwt_required()
def show_page(identifier):
    page, response = get_page_or_response(identifier, current_user(), allow_admin=True)
    if response:
        return response
    return success("Get page successful", page_to_dict(page, include_sections=True))


@pages_bp.put("/pages/<slug>")
@jwt_required()
def update_page(slug):
    page, response = own_page(slug)
    if response:
        return response

    payload = request.get_json(silent=True) or {}
    errors = validate_page_payload(payload, create=False, page=page)
    if errors:
        return invalid_field(errors)

    if "title" in payload:
        page.title = payload["title"].strip()
    if "slug" in payload:
        page.slug = payload["slug"].strip()
    if "summary" in payload:
        page.summary = payload.get("summary")

    db.session.commit()
    return success("Page updated successful", page_to_dict(page))


@pages_bp.delete("/pages/<slug>")
@jwt_required()
def delete_page(slug):
    page, response = own_page(slug)
    if response:
        return response
    db.session.delete(page)
    db.session.commit()
    return success("Page deleted successful")


@pages_bp.put("/pages/<slug>/publish")
@jwt_required()
def publish_page(slug):
    page, response = own_page(slug)
    if response:
        return response

    payload = request.get_json(silent=True) or {}
    is_published = bool(payload.get("is_published", True))
    page.is_published = is_published
    page.published_at = datetime.utcnow() if is_published else None
    db.session.commit()

    return success(
        "Page published successful" if is_published else "Page unpublished successful",
        page_to_dict(page),
    )


@pages_bp.post("/pages/<slug>/sections")
@jwt_required()
def add_section(slug):
    page, response = own_page(slug)
    if response:
        return response

    payload = request.get_json(silent=True) or {}
    errors = {}
    template_id = payload.get("template_id")
    position = payload.get("position")

    if not isinstance(template_id, int):
        add_error(errors, "template_id", "The template_id field is required.")
    template = Template.query.get(template_id) if isinstance(template_id, int) else None
    if isinstance(template_id, int) and template is None:
        add_error(errors, "template_id", "The selected template_id is invalid.")

    if not isinstance(position, int) or position < 1:
        add_error(errors, "position", "The position must be an integer starting from 1.")

    if errors:
        return invalid_field(errors)

    max_position = len(page.sections) + 1
    target_position = min(position, max_position)
    for section in sorted(page.sections, key=lambda item: item.position, reverse=True):
        if section.position >= target_position:
            section.position += 1

    section = PageSection(page_id=page.id, template_id=template.id, position=target_position)
    db.session.add(section)
    db.session.flush()

    for field in template.fields:
        db.session.add(
            SectionFieldValue(
                page_section_id=section.id,
                template_field_id=field.id,
                value=None,
            )
        )

    db.session.commit()
    return success("Section added successful", section_to_dict(section), 201)


@pages_bp.put("/pages/<slug>/sections/<int:section_id>/fields")
@jwt_required()
def update_section_fields(slug, section_id):
    page, response = own_page(slug)
    if response:
        return response

    section = PageSection.query.filter_by(id=section_id, page_id=page.id).first()
    if section is None:
        return not_found()

    payload = request.get_json(silent=True) or {}
    errors = {}
    fields_payload = payload.get("fields")
    if not isinstance(fields_payload, list):
        add_error(errors, "fields", "The fields field is required.")
        return invalid_field(errors)

    valid_fields = {field.id: field for field in section.template.fields}
    values_by_field = {value.template_field_id: value for value in section.field_values}

    for index, item in enumerate(fields_payload):
        field_key = f"fields.{index}.field_id"
        value_key = f"fields.{index}.value"
        if not isinstance(item, dict):
            add_error(errors, f"fields.{index}", "Each field value must be an object.")
            continue
        field_id = item.get("field_id")
        value = item.get("value")
        if field_id not in valid_fields:
            add_error(errors, field_key, "The selected field_id is invalid.")
        if value is not None and not isinstance(value, str):
            add_error(errors, value_key, "The value must be a string.")

    if errors:
        return invalid_field(errors)

    for item in fields_payload:
        field_id = item["field_id"]
        value = item.get("value")
        existing = values_by_field.get(field_id)
        if existing is None:
            db.session.add(
                SectionFieldValue(
                    page_section_id=section.id,
                    template_field_id=field_id,
                    value=value,
                )
            )
        else:
            existing.value = value

    db.session.commit()
    return success(
        "Section fields updated successful",
        section_to_dict(section, include_template=False, include_timestamps=False),
    )


@pages_bp.put("/pages/<slug>/sections/reorder")
@jwt_required()
def reorder_sections(slug):
    page, response = own_page(slug)
    if response:
        return response

    payload = request.get_json(silent=True) or {}
    errors = {}
    section_ids = payload.get("sections")
    owned_sections = {section.id: section for section in page.sections}

    if not isinstance(section_ids, list) or not section_ids:
        add_error(errors, "sections", "The sections field is required.")
    elif sorted(section_ids) != sorted(owned_sections.keys()):
        add_error(errors, "sections", "The sections must contain all section IDs in this page.")

    if errors:
        return invalid_field(errors)

    for section in owned_sections.values():
        section.position += 1000
    db.session.flush()
    for position, section_id in enumerate(section_ids, start=1):
        owned_sections[section_id].position = position

    db.session.commit()
    return success("Sections reordered successful")


@pages_bp.delete("/pages/<slug>/sections/<int:section_id>")
@jwt_required()
def remove_section(slug, section_id):
    page, response = own_page(slug)
    if response:
        return response

    section = PageSection.query.filter_by(id=section_id, page_id=page.id).first()
    if section is None:
        return not_found()

    db.session.delete(section)
    db.session.flush()
    normalize_positions(page)
    db.session.commit()
    return success("Section removed successful")


@pages_bp.post("/upload")
@jwt_required()
def upload_file():
    if "file" not in request.files:
        return jsonify({"status": "error", "message": "No file part in the request"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"status": "error", "message": "No file selected for uploading"}), 400

    # Only standard image extensions allowed
    allowed_extensions = {"png", "jpg", "jpeg", "gif", "webp", "svg", "bmp"}
    filename = file.filename
    if not ("." in filename and filename.rsplit(".", 1)[1].lower() in allowed_extensions):
        return jsonify({
            "status": "error",
            "message": f"Invalid file extension. Allowed extensions are: {', '.join(sorted(allowed_extensions))}"
        }), 400

    # Sanitize the filename and prefix a timestamp to prevent collision
    safe_name = secure_filename(filename)
    if not safe_name or "." not in safe_name:
        ext = filename.rsplit(".", 1)[1].lower() if "." in filename else "png"
        safe_name = f"image.{ext}"

    timestamp = int(time.time())
    unique_filename = f"{timestamp}_{safe_name}"

    # Storage: Save the file under backend/app/static/uploads/
    upload_dir = os.path.join(current_app.root_path, "static", "uploads")
    os.makedirs(upload_dir, exist_ok=True)

    file_path = os.path.join(upload_dir, unique_filename)
    file.save(file_path)

    # Return Value: A JSON with status success and the absolute file URL built dynamically
    file_url = request.host_url + "static/uploads/" + unique_filename
    return jsonify({
        "status": "success",
        "url": file_url
    }), 200


