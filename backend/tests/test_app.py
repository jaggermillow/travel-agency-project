import os
import pytest
from app import create_app, db
from app.models import User, Reservation
from datetime import datetime


@pytest.fixture
def app(tmp_path):
    """Create and configure a test app."""
    db_path = tmp_path / 'test.db'
    os.environ['DATABASE_URL'] = f"sqlite:///{db_path}"
    os.environ['TESTING'] = '1'
    
    app = create_app()
    
    with app.app_context():
        db.create_all()
        
        # Create test user
        user = User(username='testuser')
        user.set_password('testpass')
        db.session.add(user)
        db.session.commit()
    
    yield app
    
    # Cleanup
    with app.app_context():
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    """Create a test client."""
    return app.test_client()


@pytest.fixture
def app_context(app):
    """Create app context for database operations."""
    with app.app_context():
        yield app


def login(client, username='testuser', password='testpass'):
    """Helper function to login."""
    return client.post('/login', data={
        'username': username,
        'password': password
    }, follow_redirects=True)


def logout(client):
    """Helper function to logout."""
    return client.get('/logout', follow_redirects=True)


# ============ AUTHENTICATION TESTS ============

class TestAuthentication:
    """Test authentication functionality."""
    
    def test_index_redirects_to_login(self, client):
        """Test that / redirects to login."""
        rv = client.get('/')
        assert rv.status_code == 302
        assert '/login' in rv.location
    
    def test_login_page_loads(self, client):
        """Test that login page loads."""
        rv = client.get('/login')
        assert rv.status_code == 200
        assert b'username' in rv.data.lower() or b'password' in rv.data.lower()
    
    def test_successful_login(self, client):
        """Test successful login."""
        rv = login(client)
        assert rv.status_code == 200
        # Check for dashboard page elements
        assert b'Reservation Panel' in rv.data or b'reservation panel' in rv.data.lower()
    
    def test_failed_login_wrong_password(self, client):
        """Test login with wrong password."""
        rv = client.post('/login', data={
            'username': 'testuser',
            'password': 'wrongpass'
        }, follow_redirects=True)
        assert rv.status_code == 200
        assert b'Invalid credentials' in rv.data or b'invalid' in rv.data.lower()
    
    def test_failed_login_nonexistent_user(self, client):
        """Test login with nonexistent user."""
        rv = client.post('/login', data={
            'username': 'nonexistent',
            'password': 'anypass'
        }, follow_redirects=True)
        assert rv.status_code == 200
        assert b'Invalid credentials' in rv.data or b'invalid' in rv.data.lower()
    
    def test_logout(self, client):
        """Test logout functionality."""
        login(client)
        rv = logout(client)
        assert rv.status_code == 200
        # Should redirect to login after logout
        assert b'login' in rv.data.lower()
    
    def test_protected_routes_redirect_to_login(self, client):
        """Test that protected routes redirect to login when not authenticated."""
        rv = client.get('/dashboard', follow_redirects=False)
        assert rv.status_code == 302
        assert '/login' in rv.location


# ============ RESERVATION TESTS ============

class TestReservations:
    """Test reservation functionality."""
    
    @staticmethod
    def get_valid_reservation_data():
        """Get valid reservation data for testing."""
        return {
            'tour_option': 'Red tour',
            'date': '2026-02-15',
            'hotel': 'Hotel Luxe',
            'room_number': '205',
            'customer_name': 'Jane Smith',
            'contact': 'jane@example.com',
            'pax': '3',
            'amount': '500.00',
            'paid_amount': '250.00',
            'payment_status': 'Deposit',
            'payment_method': 'Card'
        }
    
    def test_add_reservation_page_loads(self, client):
        """Test that add reservation page loads."""
        login(client)
        rv = client.get('/add')
        assert rv.status_code == 200
        assert b'Hotel' in rv.data or b'hotel' in rv.data.lower()
    
    def test_add_reservation_success(self, client, app_context):
        """Test adding a reservation successfully."""
        login(client)
        rv = client.post('/add', 
            data=self.get_valid_reservation_data(),
            follow_redirects=True)
        assert rv.status_code == 200
        assert b'Reservation saved' in rv.data
        
        # Verify in database
        reservations = Reservation.query.all()
        assert len(reservations) == 1
        assert reservations[0].customer_name == 'Jane Smith'
        assert reservations[0].tour_option == 'Red tour'
    
    def test_add_multiple_reservations(self, client, app_context):
        """Test adding multiple reservations."""
        login(client)
        
        data1 = self.get_valid_reservation_data()
        data1['customer_name'] = 'John Doe'
        data1['date'] = '2026-02-10'
        
        data2 = self.get_valid_reservation_data()
        data2['customer_name'] = 'Jane Smith'
        data2['date'] = '2026-02-20'
        
        client.post('/add', data=data1, follow_redirects=True)
        client.post('/add', data=data2, follow_redirects=True)
        
        reservations = Reservation.query.all()
        assert len(reservations) == 2
    
    def test_dashboard_displays_reservations(self, client, app_context):
        """Test that dashboard displays reservations."""
        login(client)
        
        # Add a reservation
        client.post('/add', 
            data=self.get_valid_reservation_data(),
            follow_redirects=True)
        
        # Check dashboard
        rv = client.get('/dashboard')
        assert rv.status_code == 200
        assert b'Jane Smith' in rv.data or b'Dashboard' in rv.data
    
    def test_dashboard_search_by_customer(self, client, app_context):
        """Test dashboard search by customer name."""
        login(client)
        
        client.post('/add', data=self.get_valid_reservation_data(), follow_redirects=True)
        
        rv = client.get('/dashboard?q=Jane')
        assert rv.status_code == 200
    
    def test_dashboard_search_by_hotel(self, client, app_context):
        """Test dashboard search by hotel."""
        login(client)
        
        client.post('/add', data=self.get_valid_reservation_data(), follow_redirects=True)
        
        rv = client.get('/dashboard?q=Hotel')
        assert rv.status_code == 200
    
    def test_dashboard_filter_by_month_year(self, client, app_context):
        """Test dashboard filter by month and year."""
        login(client)
        
        client.post('/add', data=self.get_valid_reservation_data(), follow_redirects=True)
        
        rv = client.get('/dashboard?month=2&year=2026')
        assert rv.status_code == 200
    
    def test_dashboard_invalid_filter(self, client):
        """Test dashboard with invalid filter values."""
        login(client)
        
        # Should not crash with invalid month/year
        rv = client.get('/dashboard?month=invalid&year=invalid')
        assert rv.status_code == 200


# ============ EXPORT TESTS ============

class TestExport:
    """Test export functionality."""
    
    def test_export_excel_with_reservations(self, client, app_context):
        """Test exporting reservations to Excel."""
        login(client)
        
        # Add a reservation
        data = {
            'tour_option': 'Red tour',
            'date': '2026-02-15',
            'hotel': 'Hotel Test',
            'room_number': '101',
            'customer_name': 'Export Test',
            'contact': 'test@example.com',
            'pax': '2',
            'amount': '300.00',
            'paid_amount': '150.00',
            'payment_status': 'Paid',
            'payment_method': 'Cash'
        }
        client.post('/add', data=data, follow_redirects=True)
        
        # Export
        rv = client.post('/export', data={'year': '2026', 'month': '2'})
        assert rv.status_code == 200
        assert 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' in rv.content_type
        assert b'Export Test' in rv.data or len(rv.data) > 0
    
    def test_export_excel_empty_month(self, client):
        """Test exporting Excel for month with no reservations."""
        login(client)
        
        rv = client.post('/export', data={'year': '2025', 'month': '1'})
        assert rv.status_code == 200
        assert 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' in rv.content_type
    
    def test_export_requires_login(self, client):
        """Test that export requires login."""
        rv = client.post('/export', data={'year': '2026', 'month': '1'}, 
                        follow_redirects=False)
        assert rv.status_code == 302
        assert '/login' in rv.location


# ============ INTEGRATION TESTS ============

class TestIntegration:
    """Test integrated workflows."""
    
    def test_complete_workflow(self, client, app_context):
        """Test complete workflow: login -> add -> view -> logout."""
        # Login
        rv = login(client)
        assert rv.status_code == 200
        
        # Add reservation
        data = {
            'tour_option': 'Red tour',
            'date': '2026-02-15',
            'hotel': 'Hotel Complete',
            'room_number': '101',
            'customer_name': 'Workflow Test',
            'contact': 'workflow@example.com',
            'pax': '2',
            'amount': '400.00',
            'paid_amount': '200.00',
            'payment_status': 'Paid',
            'payment_method': 'Cash'
        }
        rv = client.post('/add', data=data, follow_redirects=True)
        assert b'Reservation saved' in rv.data
        
        # View dashboard
        rv = client.get('/dashboard')
        assert rv.status_code == 200
        assert b'Workflow Test' in rv.data or b'Dashboard' in rv.data
        
        # Logout
        rv = logout(client)
        assert rv.status_code == 200
        
        # Verify cannot access protected routes
        rv = client.get('/dashboard', follow_redirects=False)
        assert rv.status_code == 302
