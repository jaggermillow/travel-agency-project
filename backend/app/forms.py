from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SelectField, DateField, SubmitField, DecimalField, IntegerField
from wtforms.validators import DataRequired


class LoginForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired()])
    password = PasswordField('Password', validators=[DataRequired()])
    submit = SubmitField('Login')


class ReservationForm(FlaskForm):
    tour_option = SelectField('Tour Option', choices=[('Red tour','Red tour'),('Sapanca tour','Sapanca tour'),('Green tour','Green tour'),('Dinner cruise','Dinner cruise'),('Bursa tour','Bursa tour'),('IST airport transfer','IST airport transfer'),('SAW airport transfer','SAW airport transfer')], validators=[DataRequired()])
    date = DateField('Date', format='%Y-%m-%d', validators=[DataRequired()])
    hotel = StringField('Hotel Name', validators=[DataRequired()])
    room_number = StringField('Room Number')
    customer_name = StringField('Full Name', validators=[DataRequired()])
    contact = StringField('Contact Details')
    pax = IntegerField('PAX')
    amount = DecimalField('Tour Amount', places=2)
    paid_amount = DecimalField('Paid Amount', places=2)
    payment_status = SelectField('Payment Status', choices=[('Paid','Paid'),('Deposit','Deposit Received'),('Pending','Pending')])
    payment_method = SelectField('Payment Method', choices=[('Cash','Cash'),('Card','Credit Card'),('Bank','Bank Transfer')])
    submit = SubmitField('Save')


class ExportForm(FlaskForm):
    year = SelectField('Year', choices=[], coerce=int, validators=[DataRequired()])
    month = SelectField('Month', choices=[(1,'January'),(2,'February'),(3,'March'),(4,'April'),(5,'May'),(6,'June'),(7,'July'),(8,'August'),(9,'September'),(10,'October'),(11,'November'),(12,'December')], coerce=int, validators=[DataRequired()])
    submit = SubmitField('Generate Report')
