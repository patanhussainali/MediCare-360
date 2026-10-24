import os

# Prevent Windows Application Control policy / DLL block on SQLAlchemy C-extensions
os.environ.setdefault("DISABLE_SQLALCHEMY_CEXT", "1")
