from datetime import datetime


def format_datetime(value):
    if not value:
        return None
    if isinstance(value, str):
        return value
    return value.isoformat(timespec="microseconds") + "Z"


def user_to_dict(user, token=None):
    data = {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "created_at": format_datetime(user.created_at),
        "updated_at": format_datetime(user.updated_at),
    }
    if token is not None:
        data["token"] = token
    return data


def template_field_to_dict(field):
    return {
        "id": field.id,
        "template_id": field.template_id,
        "name": field.name,
        "slug": field.slug,
        "type": field.type,
    }


def template_to_dict(template, include_fields=True):
    data = {
        "id": template.id,
        "name": template.name,
        "slug": template.slug,
    }
    if template.description:
        data["description"] = template.description
    if include_fields:
        data["fields"] = [template_field_to_dict(field) for field in template.fields]
    return data


def section_to_dict(section, include_template=True, include_timestamps=True):
    values_by_field_id = {
        value.template_field_id: value.value for value in section.field_values
    }
    data = {
        "id": section.id,
        "page_id": section.page_id,
        "template_id": section.template_id,
        "position": section.position,
    }
    if include_template:
        data["template"] = template_to_dict(section.template, include_fields=False)
    data["fields"] = [
        {
            "id": field.id,
            "name": field.name,
            "slug": field.slug,
            "type": field.type,
            "value": values_by_field_id.get(field.id),
        }
        for field in section.template.fields
    ]
    if include_timestamps:
        data["created_at"] = format_datetime(section.created_at)
        data["updated_at"] = format_datetime(section.updated_at)
    return data


def page_to_dict(page, include_sections=False):
    data = {
        "id": page.id,
        "user_id": page.user_id,
        "title": page.title,
        "slug": page.slug,
        "summary": page.summary,
        "is_published": page.is_published,
        "published_at": format_datetime(page.published_at),
        "created_at": format_datetime(page.created_at),
        "updated_at": format_datetime(page.updated_at),
    }
    if include_sections:
        data["sections"] = [section_to_dict(section) for section in page.sections]
    return data

