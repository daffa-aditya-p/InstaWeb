import re

from email_validator import EmailNotValidError, validate_email

SLUG_PATTERN = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


def add_error(errors, field, message):
    errors.setdefault(field, []).append(message)


def validate_slug(value, errors, field="slug"):
    if not value:
        add_error(errors, field, "The slug field is required.")
        return
    if not isinstance(value, str):
        add_error(errors, field, "The slug must be a string.")
        return
    if not SLUG_PATTERN.match(value):
        add_error(
            errors,
            field,
            "The slug may only contain lowercase letters, numbers, and hyphens.",
        )


def validate_email_field(value, errors, required=True):
    if not value:
        if required:
            add_error(errors, "email", "The email field is required.")
        return
    try:
        validate_email(value, check_deliverability=False)
    except EmailNotValidError:
        add_error(errors, "email", "The email must be a valid email address.")


def validate_required_string(payload, field, errors, min_length=None):
    value = payload.get(field)
    if value is None or value == "":
        add_error(errors, field, f"The {field} field is required.")
        return None
    if not isinstance(value, str):
        add_error(errors, field, f"The {field} must be a string.")
        return None
    if min_length and len(value) < min_length:
        add_error(errors, field, f"The {field} must be at least {min_length} characters.")
    return value

def validate_optional_string(payload, field, errors):
    value = payload.get(field)
    if value is None:
        return None
    if not isinstance(value, str):
        add_error(errors, field, f"The {field} must be a string.")
    return value

