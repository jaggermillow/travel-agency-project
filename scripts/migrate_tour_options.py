from app import create_app, db
from app.models import Reservation

# Mapping from old internal values -> new values used in forms.py
MAPPING = {
    'standard': 'Sapanca tour',
    'premium': 'Red tour',
    'vip': 'vip'
}

app = create_app()
with app.app_context():
    total = 0
    for old, new in MAPPING.items():
        updated = Reservation.query.filter_by(tour_option=old).update({'tour_option': new})
        if updated:
            print(f"Updated {updated} rows: {old} -> {new}")
        total += updated
    db.session.commit()
    print('Migration complete. Total rows updated:', total)
