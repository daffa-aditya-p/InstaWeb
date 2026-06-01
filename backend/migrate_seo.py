"""Add SEO columns to the pages table before the app boots."""
import sqlite3
import os

# Find the database file - check common locations
db_path = None
for candidate in [
    os.path.join(os.path.dirname(__file__), "instance", "instaweb.db"),
    os.path.join(os.path.dirname(__file__), "instaweb.db"),
    os.path.join(os.path.dirname(__file__), "instance", "app.db"),
    os.path.join(os.path.dirname(__file__), "app.db"),
]:
    if os.path.exists(candidate):
        db_path = candidate
        break

if db_path is None:
    # Try reading from config
    print("Looking for database path in config...")
    import importlib.util, sys
    config_path = os.path.join(os.path.dirname(__file__), "app", "config.py")
    if os.path.exists(config_path):
        spec = importlib.util.spec_from_file_location("config", config_path)
        config = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(config)
        # Try to extract from SQLALCHEMY_DATABASE_URI
        for attr in dir(config):
            obj = getattr(config, attr)
            if isinstance(obj, type):
                uri = getattr(obj, 'SQLALCHEMY_DATABASE_URI', None)
                if uri and 'sqlite' in str(uri):
                    path = str(uri).replace('sqlite:///', '')
                    if os.path.exists(path):
                        db_path = path
                        break

if db_path is None:
    # Search for any .db file
    for root, dirs, files in os.walk(os.path.dirname(__file__)):
        for f in files:
            if f.endswith('.db'):
                db_path = os.path.join(root, f)
                print(f"Found database: {db_path}")
                break
        if db_path:
            break

if db_path is None:
    print("ERROR: Could not find database file. Listing directory contents:")
    for item in os.listdir(os.path.dirname(__file__)):
        print(f"  {item}")
    exit(1)

print(f"Using database: {db_path}")
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Check existing columns
cursor.execute("PRAGMA table_info(pages)")
existing_columns = {row[1] for row in cursor.fetchall()}
print(f"Existing columns: {existing_columns}")

columns_to_add = [
    ("meta_title", "VARCHAR(200)"),
    ("meta_description", "TEXT"),
    ("og_image", "VARCHAR(500)"),
]

for col_name, col_type in columns_to_add:
    if col_name not in existing_columns:
        try:
            cursor.execute(f"ALTER TABLE pages ADD COLUMN {col_name} {col_type}")
            print(f"Added column: {col_name}")
        except Exception as e:
            print(f"Column {col_name} skipped: {e}")
    else:
        print(f"Column {col_name} already exists")

conn.commit()
conn.close()
print("Migration done")
