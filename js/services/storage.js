/**
 * Service for handling LocalStorage operations.
 * Wraps the browser's localStorage API with JSON parsing/stringifying.
 */
class StorageService {
    /**
     * @param {string} key - The key to store data under.
     */
    constructor(key) {
        this.key = key;
    }

    /**
     * Retrieve data from storage.
     * @returns {Array|Object|null} Parsed data or null if not found.
     */
    get() {
        const data = localStorage.getItem(this.key);
        return data ? JSON.parse(data) : null;
    }

    /**
     * Save data to storage.
     * @param {Array|Object} data - The data to save.
     */
    save(data) {
        localStorage.setItem(this.key, JSON.stringify(data));
    }

    /**
     * Clear data from storage.
     */
    clear() {
        localStorage.removeItem(this.key);
    }
}

// Export a singleton instance for reservations if needed, 
// or let the consumer instantiate it. 
// For this app, we'll export the class.
export default StorageService;
