from pathlib import Path

from flask import Flask, jsonify

from .config import Config
from .extensions import cors, db, jwt, migrate
from .models import TokenBlocklist
from .responses import unauthenticated
from .seed import seed_demo_data, seed_templates


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    Path(app.instance_path).mkdir(parents=True, exist_ok=True)

    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(
        app,
        resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"].split(",")}},
        supports_credentials=True,
    )
    migrate.init_app(app, db)

    register_jwt_handlers(jwt)
    register_blueprints(app)
    register_cli(app)

    with app.app_context():
        db.create_all()
        seed_templates()
        seed_demo_data()

    @app.get("/api/health")
    def health():
        return jsonify({"status": "success", "message": "InstaWeb API is healthy"})

    return app


def register_blueprints(app):
    from .routes.admin import admin_bp
    from .routes.analytics import analytics_bp
    from .routes.auth import auth_bp
    from .routes.collaborators import collaborator_bp
    from .routes.invitations import invitation_bp
    from .routes.pages import pages_bp
    from .routes.profile import profile_bp
    from .routes.public import public_bp
    from .routes.subscriptions import subscription_bp
    from .routes.templates import templates_bp

    app.register_blueprint(auth_bp, url_prefix="/api")
    app.register_blueprint(pages_bp, url_prefix="/api")
    app.register_blueprint(templates_bp, url_prefix="/api")
    app.register_blueprint(public_bp, url_prefix="/api")
    app.register_blueprint(profile_bp, url_prefix="/api")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")
    app.register_blueprint(analytics_bp, url_prefix="/api")
    app.register_blueprint(subscription_bp, url_prefix="/api")
    app.register_blueprint(collaborator_bp, url_prefix="/api")
    app.register_blueprint(invitation_bp, url_prefix="/api")


def register_jwt_handlers(jwt_manager):
    @jwt_manager.token_in_blocklist_loader
    def check_if_token_revoked(jwt_header, jwt_payload):
        jti = jwt_payload["jti"]
        return TokenBlocklist.query.filter_by(jti=jti).first() is not None

    @jwt_manager.unauthorized_loader
    def unauthorized_callback(reason):
        return unauthenticated()

    @jwt_manager.invalid_token_loader
    def invalid_token_callback(reason):
        return unauthenticated()

    @jwt_manager.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return unauthenticated()

    @jwt_manager.revoked_token_loader
    def revoked_token_callback(jwt_header, jwt_payload):
        return unauthenticated()


def register_cli(app):
    @app.cli.command("init-db")
    def init_db_command():
        db.drop_all()
        db.create_all()
        seed_templates()
        seed_demo_data()
        print("Initialized InstaWeb database.")
