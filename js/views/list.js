import ReservationService from '../services/reservation.js';
import FinancialService from '../services/finance.js';

class ListView {
    constructor() {
        this.container = document.getElementById('app-view');
    }

    render() {
        const reservations = ReservationService.getAllReservations();

        let html = `
            <div class="card">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
                    <h2 class="section-title">All Reservations</h2>
                    <input type="text" placeholder="Search..." class="form-control" style="width: 250px;">
                </div>
                
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Customer</th>
                                <th>Tour</th>
                                <th>Travel Date</th>
                                <th>Amount Paid</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
        `;

        if (reservations.length === 0) {
            html += `<tr><td colspan="7" style="text-align:center; padding: 2rem;">No reservations found.</td></tr>`;
        } else {
            reservations.forEach(res => {
                // Defensive check for malformed data
                if (!res.financial || !res.customer || !res.booking) {
                    console.warn('Skipping malformed reservation:', res);
                    return;
                }

                const statusClass = this.getStatusClass(res.financial.status);
                const statusLabel = this.getStatusLabel(res.financial.status);
                const date = new Date(res.createdAt).toLocaleDateString();

                html += `
                    <tr>
                        <td style="font-family: monospace; font-weight: 600;">${res.id}</td>
                        <td>${res.customer.firstName || ''} ${res.customer.lastName || ''}</td>
                        <td>${res.booking.tour || 'N/A'}</td>
                        <td>${res.booking.date ? new Date(res.booking.date).toLocaleDateString() : 'N/A'}</td>
                        <td>${FinancialService.formatCurrency(res.financial.amountPaid)}</td>
                        <td><span class="status-badge ${statusClass}">${statusLabel}</span></td>
                        <td>
                            <button class="btn btn-sm btn-primary view-voucher-btn" data-id="${res.id}">
                                <i class="fas fa-ticket-alt"></i>
                            </button>
                            <button class="btn btn-sm btn-secondary edit-btn" data-id="${res.id}" style="background-color: #f59e0b; color: white;">
                                <i class="fas fa-pen"></i>
                            </button>
                            <button class="btn btn-sm btn-danger delete-btn" data-id="${res.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
        }

        html += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        this.container.innerHTML = html;
        document.getElementById('page-title').textContent = 'Reservations';
        this.attachEvents();
    }

    getStatusClass(status) {
        switch (status) {
            case 'FULLY_PAID': return 'status-paid';
            case 'HALF_PAID': return 'status-partial';
            default: return 'status-unpaid';
        }
    }

    getStatusLabel(status) {
        return status.replace('_', ' ');
    }

    attachEvents() {
        // Voucher buttons
        this.container.querySelectorAll('.view-voucher-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                const event = new CustomEvent('navigate', { detail: 'voucher' });
                event.id = id;
                window.dispatchEvent(event);
            });
        });

        // Edit buttons
        this.container.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                const event = new CustomEvent('navigate', { detail: 'edit-reservation' });
                event.id = id;
                window.dispatchEvent(event);
            });
        });

        // Delete buttons
        this.container.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                if (confirm('Are you sure you want to delete this reservation?')) {
                    ReservationService.deleteReservation(id);
                    this.render(); // Re-render table
                }
            });
        });
    }
}

export default new ListView();
