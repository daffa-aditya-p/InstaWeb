from flask import jsonify


def success(message, data=None, status_code=200):
    body = {"status": "success", "message": message}
    if data is not None:
        body["data"] = data
    return jsonify(body), status_code


def error(message, status_code=400, errors=None):
    body = {"status": "error", "message": message}
    if errors is not None:
        body["errors"] = errors
    return jsonify(body), status_code


def invalid_field(errors):
    return error("Invalid field", 422, errors)


def not_found():
    return error("Not found", 404)


def forbidden():
    return error("Forbidden access", 403)


def unauthenticated():
    return error("Unauthenticated.", 401)

