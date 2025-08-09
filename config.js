/**
 * config.js
 * * This file centralizes configuration settings and mock data,
 * making it easier to manage and update the application's parameters.
 */

// Placeholder for a real vendor list. In a production app, this would be
// managed in a database or a secure configuration service.
const VENDOR_LIST = [
    { name: "Acme Corp", address: "sei1...vendor1" },
    { name: "Globex Inc", address: "sei1...vendor2" }
];

// Threshold for treasury optimization.
// Any balance above this amount will be considered 'excess' and
// deposited into the lending pool.
const TREASURY_KEEP_THRESHOLD = 100; // in stablecoins

// The number of days before a due date to schedule a payment.
const PAYMENT_BUFFER_DAYS = 2;

// The port for the API server to listen on.
const API_PORT = 3000;

// Export all configurations for use in other modules.
module.exports = {
    VENDOR_LIST,
    TREASURY_KEEP_THRESHOLD,
    PAYMENT_BUFFER_DAYS,
    API_PORT,
};
