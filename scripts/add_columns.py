import os
import sqlite3
from urllib.parse import urlparse

# Determine sqlite DB file path from config or default
# Try to locate the sqlite DB file. Prefer instance/reservations.db if present
import os

db_candidates = ['instance/reservations.db', 'reservations.db']
found = None
for p in db_candidates:
    if os.path.exists(p):
        found = p
        break
if not found:
    raise SystemExit('No reservations.db found in expected locations')

print('DB path:', found)
import sqlite3
conn = sqlite3.connect(found)
cur = conn.cursor()

cur.execute("PRAGMA table_info(reservation);")
cols = [r[1] for r in cur.fetchall()]
print('Existing columns:', cols)

changes = 0
if 'pax' not in cols:
    cur.execute('ALTER TABLE reservation ADD COLUMN pax INTEGER;')
    print('Added column pax')
    changes += 1
if 'amount' not in cols:
    cur.execute('ALTER TABLE reservation ADD COLUMN amount REAL;')
    print('Added column amount')
    changes += 1
if 'paid_amount' not in cols:
    cur.execute('ALTER TABLE reservation ADD COLUMN paid_amount REAL;')
    print('Added column paid_amount')
    changes += 1

if changes:
    conn.commit()
    print('Committed changes')
else:
    print('No changes needed')

conn.close()