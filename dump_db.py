import sqlite3

def dump():
    conn = sqlite3.connect("backend/instance/instaweb.sqlite")
    cursor = conn.cursor()
    
    # Let's see what tables exist
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    print("Tables:", cursor.fetchall())
    
    # Get all templates
    cursor.execute("SELECT id, name, slug, description FROM templates ORDER BY id;")
    templates = cursor.fetchall()
    
    print("\n--- TEMPLATES ---")
    for t_id, name, slug, desc in templates:
        print(f"\nID: {t_id} | Name: {name} | Slug: {slug}")
        print(f"Description: {desc}")
        
        # Get fields for this template
        cursor.execute("SELECT name, slug, type FROM template_fields WHERE template_id = ? ORDER BY id;", (t_id,))
        fields = cursor.fetchall()
        for f_name, f_slug, f_type in fields:
            print(f"  - Field: {f_name} (slug: {f_slug}) [{f_type}]")

if __name__ == "__main__":
    dump()
