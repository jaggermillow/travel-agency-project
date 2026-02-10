import ReservationService from '../services/reservation.js';
import FinancialService from '../services/finance.js';

class VoucherView {
    constructor() {
        this.container = document.getElementById('app-view');
    }

    render(id) {
        const reservation = ReservationService.getReservationById(id);

        if (!reservation) {
            this.container.innerHTML = '<p>Reservation not found.</p>';
            return;
        }

        const dateCreated = new Date(reservation.createdAt).toLocaleDateString();
        const travelDate = reservation.booking.date ? new Date(reservation.booking.date).toLocaleDateString() : 'N/A';

        this.container.innerHTML = `
            <div id="voucher-content" class="voucher-container">
                <div class="voucher-header">
                    <h1>RESERVATION VOUCHER</h1>
                    <p style="color: #666; margin-top: 0.5rem;">DANIEL TRAVEL - Adventure Awaits</p>
                </div>

                <div class="voucher-details">
                    <div>
                        <div class="detail-group">
                            <div class="detail-label">RESERVATION ID</div>
                            <div class="detail-value" style="font-family: monospace;">${reservation.id}</div>
                        </div>
                        <div class="detail-group">
                            <div class="detail-label">CUSTOMER NAME</div>
                            <div class="detail-value">${reservation.customer.firstName} ${reservation.customer.lastName}</div>
                        </div>
                         <div class="detail-group">
                            <div class="detail-label">PHONE</div>
                            <div class="detail-value">${reservation.customer.phone}</div>
                        </div>
                        <div class="detail-group">
                            <div class="detail-label">BOOKING DATE</div>
                            <div class="detail-value">${dateCreated}</div>
                        </div>
                    </div>

                    <div>
                        <div class="detail-group">
                            <div class="detail-label">TOUR OPTION</div>
                            <div class="detail-value">${reservation.booking.tour}</div>
                        </div>
                        <div class="detail-group">
                            <div class="detail-label">TRAVEL DATE</div>
                            <div class="detail-value" style="color: var(--primary-color); font-weight: 700;">${travelDate}</div>
                        </div>
                        <div class="detail-group">
                            <div class="detail-label">HOTEL & ROOM</div>
                            <div class="detail-value">${reservation.booking.hotel}, Room ${reservation.booking.room}</div>
                        </div>
                        <div class="detail-group">
                            <div class="detail-label">NUMBER OF PEOPLE</div>
                            <div class="detail-value">${reservation.booking.pax}</div>
                        </div>
                        <div class="detail-group">
                            <div class="detail-label">PAYMENT STATUS</div>
                            <div class="detail-value">${reservation.financial.status.replace('_', ' ')}</div>
                        </div>
                    </div>
                </div>

                <div style="margin-top: 2rem; border-top: 2px dashed #ddd; padding-top: 2rem; text-align: right;">
                    <div class="detail-label">TOTAL AMOUNT PAID</div>
                    <div class="detail-value" style="font-size: 2rem; color: var(--primary-color);">
                        ${FinancialService.formatCurrency(reservation.financial.amountPaid)}
                    </div>
                </div>
                
                <div style="margin-top: 3rem; text-align: center; color: #888; font-style: italic;">
                    <p>Thank you for choosing DANIEL TRAVEL!</p>
                </div>
            </div>

            <div class="no-print" style="margin-top: 2rem; display: flex; gap: 1rem; justify-content: center;">
                <button class="btn btn-primary" id="download-pdf-btn">
                    <i class="fas fa-file-pdf"></i> Download PDF
                </button>
                <button class="btn btn-secondary" id="back-btn" style="background:#64748b; color:white;">
                    <i class="fas fa-arrow-left"></i> Back to List
                </button>
            </div>
        `;

        document.getElementById('page-title').textContent = 'Voucher';

        this.attachEvents(reservation.id);
    }

    attachEvents(reservationId) {
        document.getElementById('back-btn').addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('navigate', { detail: 'reservation-list' }));
        });

        document.getElementById('download-pdf-btn').addEventListener('click', () => {
            const element = document.getElementById('voucher-content');
            const opt = {
                margin: [10, 10, 10, 10], // top, left, bottom, right
                filename: `Voucher_${reservationId}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            // New Promise-based usage
            html2pdf().set(opt).from(element).save();
        });
    }
}

export default new VoucherView();
