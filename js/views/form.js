import ReservationService from '../services/reservation.js';
import FinancialService from '../services/finance.js';

class FormView {
    constructor() {
        this.container = document.getElementById('app-view');
        this.editingId = null;
    }

    render(reservationId = null) {
        this.editingId = reservationId;
        let reservation = null;

        if (reservationId) {
            reservation = ReservationService.getReservationById(reservationId);
            if (!reservation) {
                alert('Reservation not found!');
                window.dispatchEvent(new CustomEvent('navigate', { detail: 'reservation-list' }));
                return;
            }
        }

        const title = reservationId ? 'Edit Reservation' : 'New Reservation';
        const submitBtnText = reservationId ? 'Update Reservation' : 'Save Reservation';

        // Pre-fill helpers
        const val = (path, defaultVal = '') => {
            if (!reservation) return defaultVal;
            // quick safe traversal
            return path.split('.').reduce((o, i) => (o ? o[i] : undefined), reservation) || defaultVal;
        };

        this.container.innerHTML = `
            <div class="card">
                <h2 class="section-title">${title}</h2>
                <form id="reservation-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">First Name</label>
                            <input type="text" name="firstName" class="form-control" value="${val('customer.firstName')}" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Last Name</label>
                            <input type="text" name="lastName" class="form-control" value="${val('customer.lastName')}" required>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Phone Number</label>
                            <input type="tel" name="phone" class="form-control" value="${val('customer.phone')}" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Number of People</label>
                            <input type="number" name="pax" class="form-control" min="1" value="${val('booking.pax', 1)}" required>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Hotel Name</label>
                            <input type="text" name="hotel" class="form-control" value="${val('booking.hotel')}" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Room Number</label>
                            <input type="text" name="room" class="form-control" value="${val('booking.room')}" required>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Tour Option</label>
                        <select name="tour" class="form-control" required id="tour-select">
                            <option value="">Select a tour...</option>
                            <option value="City Tour">City Tour</option>
                            <option value="Island Hopping">Island Hopping</option>
                            <option value="Sunset Cruise">Sunset Cruise</option>
                            <option value="Safari Adventure">Safari Adventure</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Travel Date</label>
                        <input type="date" name="travelDate" class="form-control" value="${val('booking.date')}" required>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Cost Price ($)</label>
                            <input type="number" name="costPrice" class="form-control" min="0" step="0.01" value="${val('financial.costPrice')}" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Selling Price ($)</label>
                            <input type="number" name="sellingPrice" class="form-control" min="0" step="0.01" value="${val('financial.sellingPrice')}" required>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Payment Status</label>
                            <select name="status" class="form-control" required id="status-select">
                                <option value="NOT_PAID">Not Paid</option>
                                <option value="HALF_PAID">Half Paid</option>
                                <option value="FULLY_PAID">Fully Paid</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Amount Paid ($)</label>
                            <input type="number" name="amountPaid" class="form-control" min="0" step="0.01" value="${val('financial.amountPaid', 0)}">
                        </div>
                    </div>

                    <div style="margin-top: 1.5rem; display: flex; gap: 1rem;">
                        <button type="submit" class="btn btn-primary">${submitBtnText}</button>
                        <button type="button" class="btn btn-danger" id="cancel-btn">Cancel</button>
                    </div>
                </form>
            </div>
        `;

        document.getElementById('page-title').textContent = title;

        // Set select values manually
        if (reservation) {
            document.getElementById('tour-select').value = reservation.booking.tour;
            document.getElementById('status-select').value = reservation.financial.status;
        }

        this.attachEvents();
    }

    attachEvents() {
        const form = document.getElementById('reservation-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit(new FormData(form));
        });

        document.getElementById('cancel-btn').addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('navigate', { detail: 'reservation-list' }));
        });
    }

    handleSubmit(formData) {
        const data = {
            customer: {
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                phone: formData.get('phone')
            },
            booking: {
                hotel: formData.get('hotel'),
                room: formData.get('room'),
                pax: parseInt(formData.get('pax')),
                tour: formData.get('tour'),
                date: formData.get('travelDate')
            },
            financial: {
                costPrice: parseFloat(formData.get('costPrice')),
                sellingPrice: parseFloat(formData.get('sellingPrice')),
                status: formData.get('status'),
                amountPaid: parseFloat(formData.get('amountPaid'))
            }
        };

        if (this.editingId) {
            ReservationService.updateReservation(this.editingId, data);
            alert('Reservation updated successfully!');
        } else {
            ReservationService.addReservation(data);
            alert('Reservation saved successfully!');
        }

        window.dispatchEvent(new CustomEvent('navigate', { detail: 'reservation-list' }));
    }
}

export default new FormView();
