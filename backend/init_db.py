import os
from app import create_app, db
from app.models import User
from dotenv import load_dotenv

load_dotenv()
app = create_app()
with app.app_context():
    db.create_all()
    admin_username = os.getenv('ADMIN_USERNAME', 'admin')
    admin_password = os.getenv('ADMIN_PASSWORD', 'admin123')
    if not User.query.filter_by(username=admin_username).first():
        u = User(username=admin_username)
        u.set_password(admin_password)
        db.session.add(u)
        db.session.commit()
        print('Admin user created:', admin_username)
    else:
        print('Admin user already exists')
