import DashboardView from './views/dashboard.js';
import FormView from './views/form.js';
import ListView from './views/list.js';
import VoucherView from './views/voucher.js';
import AuthService from './services/auth.js';

class App {
    constructor() {
        // Strict Auth Check at Start
        if (!AuthService.isLoggedIn()) {
            window.location.href = 'login.html';
            return; // Stop execution
        }

        this.init();
    }

    init() {
        // Initial View
        this.navigateTo('dashboard');

        // Nav Buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Ignore logout button click which is handled by global event or separate listener
                if (e.currentTarget.dataset.view) {
                    const viewName = e.currentTarget.dataset.view;
                    this.navigateTo(viewName);
                }
            });
        });

        // Logout Listener (if not handled by inline onclick in HTML, which it is currently)
        // But let's add a robust listener if we change HTML later
        const logoutBtn = document.querySelector('button[onclick*="logout"]');
        if (logoutBtn) {
            // override the inline onclick for cleaner separation if desired, 
            // but the inline event dispatch is fine for this scale.
        }

        window.addEventListener('logout', () => {
            AuthService.logout();
        });

        // Event Bus for Navigation
        window.addEventListener('navigate', (e) => {
            if (e.detail === 'voucher' && e.id) {
                this.loadVoucher(e.id);
            } else if (e.detail === 'edit-reservation' && e.id) {
                this.loadEditForm(e.id);
            } else {
                this.navigateTo(e.detail);
            }
        });
    }

    navigateTo(viewName) {
        // Update Active Nav
        document.querySelectorAll('.nav-btn').forEach(btn => {
            if (btn.dataset.view === viewName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Render View
        switch (viewName) {
            case 'dashboard':
                DashboardView.render();
                break;
            case 'new-reservation':
                FormView.render();
                break;
            case 'reservation-list':
                ListView.render();
                break;
            default:
                DashboardView.render();
        }
    }

    loadVoucher(id) {
        // Reset Nav Active
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        VoucherView.render(id);
    }

    loadEditForm(id) {
        // Reset Nav Active
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        FormView.render(id);
    }
}

// Start App
document.addEventListener('DOMContentLoaded', () => {
    new App();
});
