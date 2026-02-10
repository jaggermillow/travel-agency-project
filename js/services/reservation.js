import StorageService from './storage.js';

class ReservationService {
    constructor() {
        this.storage = new StorageService('reservations');
        // Initialize if empty
        if (!this.storage.get()) {
            this.storage.save([]);
        }
    }

    /**
     * Generate a unique reservation ID.
     * Format: RES-{timestamp (last 6 digits)}-{random 3 digits}
     */
    generateId() {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `RES-${timestamp}-${random}`;
    }

    /**
     * Get all reservations.
     * @returns {Array} List of reservations
     */
    getAllReservations() {
        return this.storage.get() || [];
    }

    /**
     * Add a new reservation.
     * @param {Object} reservationData 
     * @returns {Object} The created reservation
     */
    addReservation(reservationData) {
        const reservations = this.getAllReservations();

        const newReservation = {
            id: this.generateId(),
            createdAt: new Date().toISOString(),
            ...reservationData
        };

        reservations.push(newReservation);
        this.storage.save(reservations);
        return newReservation;
    }

    /**
     * Delete a reservation by ID.
     * @param {string} id 
     */
    deleteReservation(id) {
        let reservations = this.getAllReservations();
        reservations = reservations.filter(res => res.id !== id);
        this.storage.save(reservations);
    }

    /**
     * Get reservation by ID.
     * @param {string} id 
     * @returns {Object|undefined}
     */
    getReservationById(id) {
        const reservations = this.getAllReservations();
        return reservations.find(res => res.id === id);
    }

    /**
     * Update an existing reservation.
     * @param {string} id 
     * @param {Object} updatedData 
     * @returns {Object|null} The updated reservation or null if not found
     */
    updateReservation(id, updatedData) {
        let reservations = this.getAllReservations();
        const index = reservations.findIndex(res => res.id === id);

        if (index === -1) return null;

        // Merge existing data with updates, preserving ID and createdAt
        reservations[index] = {
            ...reservations[index],
            ...updatedData,
            id: id,
            createdAt: reservations[index].createdAt
        };

        this.storage.save(reservations);
        return reservations[index];
    }
}

export default new ReservationService();
