from flask import Blueprint, render_template, redirect, url_for, request, flash, send_file
from .models import User, Reservation
from .forms import LoginForm, ReservationForm, ExportForm
from . import db, login_manager
from flask_login import login_user, login_required, logout_user, current_user
from datetime import datetime
from io import BytesIO
import pandas as pd
from sqlalchemy import extract


bp = Blueprint('main', __name__)


@login_manager.user_loader
def load_user(user_id):
    return db.session.get(User, int(user_id))


@bp.route('/')
def index():
    return redirect(url_for('main.login'))


@bp.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        if user and user.check_password(form.password.data):
            login_user(user)
            return redirect(url_for('main.dashboard'))
        flash('Invalid credentials', 'danger')
    return render_template('login.html', form=form)


@bp.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('main.login'))


@bp.route('/dashboard')
@login_required
def dashboard():
    q = request.args.get('q', '').strip()
    month = request.args.get('month', '')
    year = request.args.get('year', '')
    reservations = Reservation.query
    if q:
        reservations = reservations.filter(
            (Reservation.customer_name.ilike(f"%{q}%")) |
            (Reservation.hotel.ilike(f"%{q}%")) |
            (Reservation.tour_option.ilike(f"%{q}%"))
        )
    if month and year:
        try:
            month_i = int(month)
            year_i = int(year)
            reservations = reservations.filter(extract('month', Reservation.date) == month_i,
                                               extract('year', Reservation.date) == year_i)
        except ValueError:
            pass
    reservations = reservations.order_by(Reservation.date.desc()).all()

    # Export form: populate year choices from reservations
    years = sorted({r.date.year for r in Reservation.query.all()}, reverse=True)
    export_form = ExportForm()
    export_form.year.choices = [(y, y) for y in years] if years else [(datetime.now().year, datetime.now().year)]

    return render_template('dashboard.html', reservations=reservations, export_form=export_form)


@bp.route('/add', methods=['GET', 'POST'])
@login_required
def add_reservation():
    form = ReservationForm()
    if form.validate_on_submit():
        r = Reservation(
            tour_option=form.tour_option.data,
            date=form.date.data,
            hotel=form.hotel.data,
            room_number=form.room_number.data,
            customer_name=form.customer_name.data,
            contact=form.contact.data,
            pax=form.pax.data,
            amount=float(form.amount.data) if form.amount.data is not None else None,
            paid_amount=float(form.paid_amount.data) if form.paid_amount.data is not None else None,
            payment_status=form.payment_status.data,
            payment_method=form.payment_method.data,
        )
        db.session.add(r)
        db.session.commit()
        flash('Reservation saved', 'success')
        return redirect(url_for('main.dashboard'))
    return render_template('add_reservation.html', form=form)


@bp.route('/export', methods=['POST'])
@login_required
def export():
    year = int(request.form.get('year'))
    month = int(request.form.get('month'))
    qs = Reservation.query.filter(extract('year', Reservation.date) == year,
                                  extract('month', Reservation.date) == month).all()
    data = []
    for r in qs:
        data.append({
            'Date': r.date.strftime('%Y-%m-%d'),
            'Tour Option': r.tour_option,
            'Hotel': r.hotel,
            'Room': r.room_number,
            'Customer': r.customer_name,
            'Contact': r.contact,
            'PAX': r.pax,
            'Tour Amount': r.amount,
            'Paid Amount': r.paid_amount,
            'Payment Status': r.payment_status,
            'Payment Method': r.payment_method,
        })
    df = pd.DataFrame(data)
    buffer = BytesIO()
    with pd.ExcelWriter(buffer, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name=f"{year}-{month:02d}")
    buffer.seek(0)
    filename = f"reservations_{year}_{month:02d}.xlsx"
    return send_file(buffer, as_attachment=True, download_name=filename, mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
