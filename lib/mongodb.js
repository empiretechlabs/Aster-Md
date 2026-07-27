/**
 * Database connection entry point.
 * Delegates to lib/database which auto-selects MongoDB, PostgreSQL, or JSON.
 */

module.exports = require("./database/index").connectDB;
