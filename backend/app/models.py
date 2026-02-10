from . import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin


class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class Reservation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tour_option = db.Column(db.String(100), nullable=False)
    date = db.Column(db.Date, nullable=False)
    hotel = db.Column(db.String(200))
    room_number = db.Column(db.String(50))
    customer_name = db.Column(db.String(200), nullable=False)
    passport_id = db.Column(db.String(100))
    contact = db.Column(db.String(200))
    pax = db.Column(db.Integer)
    amount = db.Column(db.Float)
    paid_amount = db.Column(db.Float)
    payment_status = db.Column(db.String(50))
    payment_method = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.now)
