const db = require('./db');
require('dotenv').config();

async function addDoctorColumns() {
    try {
        console.log("Adding doctor columns to user_profiles...");
        await db.query(`
            ALTER TABLE user_profiles 
            ADD COLUMN IF NOT EXISTS doctor_name VARCHAR(255),
            ADD COLUMN IF NOT EXISTS doctor_contact VARCHAR(50);
        `);
        console.log("Columns added successfully.");
    } catch (err) {
        console.error("Error adding columns:", err);
    } finally {
        process.exit();
    }
}

addDoctorColumns();
