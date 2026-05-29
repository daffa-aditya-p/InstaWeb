from datetime import datetime

from werkzeug.security import check_password_hash, generate_password_hash

from .extensions import db


def utcnow():
    return datetime.utcnow()


class TimestampMixin:
    created_at = db.Column(db.DateTime, default=utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=utcnow, onupdate=utcnow, nullable=False)


class User(TimestampMixin, db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(255), unique=True, index=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(30), default="user", nullable=False)

    pages = db.relationship("Page", back_populates="user", cascade="all, delete-orphan")

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class Page(TimestampMixin, db.Model):
    __tablename__ = "pages"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = db.Column(db.String(160), nullable=False)
    slug = db.Column(db.String(180), unique=True, index=True, nullable=False)
    summary = db.Column(db.Text, nullable=True)
    is_published = db.Column(db.Boolean, default=False, nullable=False)
    published_at = db.Column(db.DateTime, nullable=True)

    user = db.relationship("User", back_populates="pages")
    sections = db.relationship(
        "PageSection",
        back_populates="page",
        cascade="all, delete-orphan",
        order_by="PageSection.position",
    )


class Template(TimestampMixin, db.Model):
    __tablename__ = "templates"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    slug = db.Column(db.String(120), unique=True, index=True, nullable=False)
    description = db.Column(db.String(255), nullable=True)

    fields = db.relationship(
        "TemplateField",
        back_populates="template",
        cascade="all, delete-orphan",
        order_by="TemplateField.id",
    )
    sections = db.relationship("PageSection", back_populates="template")


class TemplateField(TimestampMixin, db.Model):
    __tablename__ = "template_fields"

    id = db.Column(db.Integer, primary_key=True)
    template_id = db.Column(db.Integer, db.ForeignKey("templates.id", ondelete="CASCADE"), nullable=False)
    name = db.Column(db.String(120), nullable=False)
    slug = db.Column(db.String(120), nullable=False)
    type = db.Column(db.String(40), nullable=False, default="text")

    template = db.relationship("Template", back_populates="fields")
    values = db.relationship("SectionFieldValue", back_populates="template_field")

    __table_args__ = (db.UniqueConstraint("template_id", "slug", name="uq_template_field_slug"),)


class PageSection(TimestampMixin, db.Model):
    __tablename__ = "page_sections"

    id = db.Column(db.Integer, primary_key=True)
    page_id = db.Column(db.Integer, db.ForeignKey("pages.id", ondelete="CASCADE"), nullable=False)
    template_id = db.Column(db.Integer, db.ForeignKey("templates.id"), nullable=False)
    position = db.Column(db.Integer, nullable=False)

    page = db.relationship("Page", back_populates="sections")
    template = db.relationship("Template", back_populates="sections")
    field_values = db.relationship(
        "SectionFieldValue",
        back_populates="page_section",
        cascade="all, delete-orphan",
    )


class SectionFieldValue(TimestampMixin, db.Model):
    __tablename__ = "section_field_values"

    id = db.Column(db.Integer, primary_key=True)
    page_section_id = db.Column(
        db.Integer, db.ForeignKey("page_sections.id", ondelete="CASCADE"), nullable=False
    )
    template_field_id = db.Column(
        db.Integer, db.ForeignKey("template_fields.id", ondelete="CASCADE"), nullable=False
    )
    value = db.Column(db.Text, nullable=True)

    page_section = db.relationship("PageSection", back_populates="field_values")
    template_field = db.relationship("TemplateField", back_populates="values")

    __table_args__ = (
        db.UniqueConstraint("page_section_id", "template_field_id", name="uq_section_field_value"),
    )


class TokenBlocklist(db.Model):
    __tablename__ = "token_blocklist"

    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(64), index=True, unique=True, nullable=False)
    user_id = db.Column(db.Integer, nullable=True)
    created_at = db.Column(db.DateTime, default=utcnow, nullable=False)
