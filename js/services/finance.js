/**
 * Service for financial calculations and formatting.
 */
class FinancialService {
    /**
     * Calculate profit from selling price and cost price.
     * @param {number} sellingPrice 
     * @param {number} costPrice 
     * @returns {number} Profit
     */
    static calculateProfit(sellingPrice, costPrice) {
        return (sellingPrice || 0) - (costPrice || 0);
    }

    /**
     * Format a number as currency (USD).
     * @param {number} amount 
     * @returns {string} Formatted currency string
     */
    static formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount || 0);
    }

    /**
     * Calculate total financial stats from a list of reservations.
     * @param {Array} reservations 
     * @returns {Object} { totalRevenue, totalCost, totalProfit, totalPaid }
     */
    static calculateStats(reservations) {
        return reservations.reduce((stats, res) => {
            const sellingPrice = parseFloat(res.financial.sellingPrice) || 0;
            const costPrice = parseFloat(res.financial.costPrice) || 0;
            const amountPaid = parseFloat(res.financial.amountPaid) || 0;

            stats.totalRevenue += sellingPrice;
            stats.totalCost += costPrice;
            stats.totalPaid += amountPaid;
            stats.totalProfit += (sellingPrice - costPrice);

            return stats;
        }, {
            totalRevenue: 0,
            totalCost: 0,
            totalProfit: 0,
            totalPaid: 0
        });
    }

    /**
     * Filter reservations by month and year and calculate stats.
     * @param {Array} reservations 
     * @param {number} month (0-11)
     * @param {number} year 
     * @returns {Object} { stats, count }
     */
    static getMonthlyStats(reservations, month, year) {
        const filtered = reservations.filter(res => {
            // Use createdAt date for reporting, or booking.date if preferred.
            // Usually reports are based on booking creation or travel date. 
            // Let's use travel date if available, fall back to created.
            // Requirement says "monthly total rezervation" - implying when the rez happened OR when the trip is.
            // Standard accounting usually uses "Creation Date" for sales, "Travel Date" for fulfillment.
            // Let's stick to Creation Date (when the sale was made) for simplicity unless requested.
            const date = new Date(res.createdAt);
            // Actually, for a travel agency, it is often useful to see sales vs travel.
            // Let's stick to 'createdAt' as it represents sales made in that month.
            return date.getMonth() === parseInt(month) && date.getFullYear() === parseInt(year);
        });

        return {
            stats: this.calculateStats(filtered),
            count: filtered.length,
            reservations: filtered
        };
    }
}

export default FinancialService;
