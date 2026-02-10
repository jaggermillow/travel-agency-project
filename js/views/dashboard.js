import ReservationService from '../services/reservation.js';
import FinancialService from '../services/finance.js';

class DashboardView {
    constructor() {
        this.container = document.getElementById('app-view');
        this.currentMonth = new Date().getMonth();
        this.currentYear = new Date().getFullYear();
    }

    render() {
        this.container.innerHTML = `
            <div class="card" style="margin-bottom: 2rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                    <h3 class="section-title" style="margin:0;">Monthly Overview</h3>
                    <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                         <button id="export-btn" class="btn btn-success" style="background-color: #10b981; color: white;">
                            <i class="fas fa-file-excel"></i> Export Excel
                        </button>
                        <select id="filter-month" class="form-control" style="width: auto;">
                            ${this.getMonthOptions(this.currentMonth)}
                        </select>
                        <select id="filter-year" class="form-control" style="width: auto;">
                            <option value="2024" ${this.currentYear === 2024 ? 'selected' : ''}>2024</option>
                            <option value="2025" ${this.currentYear === 2025 ? 'selected' : ''}>2025</option>
                            <option value="2026" ${this.currentYear === 2026 ? 'selected' : ''}>2026</option>
                        </select>
                    </div>
                </div>
            </div>

            <div id="dashboard-stats">
                <!-- Stats will be injected here -->
            </div>

            <div class="card">
                <h3 class="section-title">Recent Activity</h3>
                <p>Welcome to Daniel Travel. use the filters above to view historical data.</p>
            </div>
        `;

        document.getElementById('page-title').textContent = 'Dashboard';

        this.attachEvents();
        this.updateStats(this.currentMonth, this.currentYear);
    }

    getMonthOptions(selectedMonth) {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return months.map((m, index) =>
            `<option value="${index}" ${index === selectedMonth ? 'selected' : ''}>${m}</option>`
        ).join('');
    }

    attachEvents() {
        const monthSelect = document.getElementById('filter-month');
        const yearSelect = document.getElementById('filter-year');
        const exportBtn = document.getElementById('export-btn');

        const handleChange = () => {
            this.currentMonth = parseInt(monthSelect.value);
            this.currentYear = parseInt(yearSelect.value);
            this.updateStats(this.currentMonth, this.currentYear);
        };

        monthSelect.addEventListener('change', handleChange);
        yearSelect.addEventListener('change', handleChange);

        exportBtn.addEventListener('click', () => {
            this.exportToExcel(this.currentMonth, this.currentYear);
        });
    }

    updateStats(month, year) {
        const allReservations = ReservationService.getAllReservations();
        const { stats, count } = FinancialService.getMonthlyStats(allReservations, month, year);

        const statsHtml = `
            <div class="stats-grid">
                <div class="stat-card">
                    <span class="stat-title">Reservations</span>
                    <span class="stat-value">${count}</span>
                </div>
                <div class="stat-card">
                    <span class="stat-title">Total Revenue</span>
                    <span class="stat-value" style="color: var(--primary-color)">
                        ${FinancialService.formatCurrency(stats.totalRevenue)}
                    </span>
                </div>
                <div class="stat-card">
                    <span class="stat-title">Net Profit</span>
                    <span class="stat-value" style="color: var(--success)">
                        ${FinancialService.formatCurrency(stats.totalProfit)}
                    </span>
                </div>
                <div class="stat-card">
                    <span class="stat-title">Total Cost</span>
                    <span class="stat-value" style="color: var(--danger)">
                        ${FinancialService.formatCurrency(stats.totalCost)}
                    </span>
                </div>
            </div>
        `;

        document.getElementById('dashboard-stats').innerHTML = statsHtml;
    }

    exportToExcel(month, year) {
        const allReservations = ReservationService.getAllReservations();
        const { reservations } = FinancialService.getMonthlyStats(allReservations, month, year);

        if (reservations.length === 0) {
            alert('No data to export for this period.');
            return;
        }

        // Prepare data for Excel
        const data = reservations.map(res => ({
            'Reservation ID': res.id,
            'First Name': res.customer.firstName,
            'Last Name': res.customer.lastName,
            'Phone': res.customer.phone,
            'Tour': res.booking.tour,
            'Booking Date': new Date(res.createdAt).toLocaleDateString(),
            'Travel Date': res.booking.date || 'N/A',
            'People': res.booking.pax,
            'Cost Price': res.financial.costPrice,
            'Selling Price': res.financial.sellingPrice,
            'Profit': res.financial.sellingPrice - res.financial.costPrice,
            'Amount Paid': res.financial.amountPaid,
            'Status': res.financial.status
        }));

        // Create Worksheet
        const ws = XLSX.utils.json_to_sheet(data);

        // Create Workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Monthly Sales");

        // Generate Excel File
        const monthName = new Date(year, month).toLocaleString('default', { month: 'long' });
        XLSX.writeFile(wb, `Sales_${monthName}_${year}.xlsx`);
    }
}

export default new DashboardView();
