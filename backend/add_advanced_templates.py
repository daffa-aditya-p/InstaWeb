from app import create_app
from app.extensions import db
from app.models import Template, TemplateField

app = create_app()

templates_to_add = [
    {
        "name": "Custom HTML",
        "slug": "custom_html",
        "description": "Inject custom HTML, CSS, and JS blocks (Plus plan required).",
        "fields": [
            ("HTML Code", "html_code", "text"),
        ],
    },
    {
        "name": "Iframe Embed",
        "slug": "iframe_embed",
        "description": "Embed external content like maps, videos, or tools (Pro+ plan required).",
        "fields": [
            ("Iframe URL", "iframe_url", "text"),
            ("Height (px)", "iframe_height", "text"),
        ],
    },
]

with app.app_context():
    for tpl_data in templates_to_add:
        tpl = Template.query.filter_by(slug=tpl_data["slug"]).first()
        if not tpl:
            tpl = Template(name=tpl_data["name"], slug=tpl_data["slug"], description=tpl_data["description"])
            db.session.add(tpl)
            db.session.flush()
            for name, slug, ftype in tpl_data["fields"]:
                db.session.add(TemplateField(template_id=tpl.id, name=name, slug=slug, type=ftype))
            print(f"Added {tpl.slug}")
    db.session.commit()
    print("Done")
