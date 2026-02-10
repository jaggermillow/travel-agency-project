import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from dotenv import load_dotenv

load_dotenv()

db = SQLAlchemy()
login_manager = LoginManager()


def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///reservations.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Testing helpers: when running tests set TESTING=1 in env to disable CSRF
    if os.getenv('TESTING') == '1':
        app.config['TESTING'] = True
        app.config['WTF_CSRF_ENABLED'] = False

    db.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = 'main.login'

    from . import routes
    app.register_blueprint(routes.bp)

    return app
