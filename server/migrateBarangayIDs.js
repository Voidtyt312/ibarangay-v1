/**
 * Migration script to rename all BAR-X format barangay IDs to BARANGAY-X format
 * RUN WITH: node server/migrateBarangayIDs.js
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: './server/.env' });

async function migrateBarangayIDs() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'ibarangay_database',
    });

    try {
        const connection = await pool.getConnection();

        console.log('='.repeat(70));
        console.log('BARANGAY ID MIGRATION - BAR-X to BARANGAY-X');
        console.log('='.repeat(70) + '\n');

        // Get all barangays with BAR- prefix
        const [barangays] = await connection.query(
            "SELECT BarangayID, BarangayName FROM barangay WHERE BarangayID LIKE 'BAR-%' ORDER BY BarangayID"
        );

        if (barangays.length === 0) {
            console.log('No BAR-X format IDs found. Migration not needed.');
            connection.release();
            await pool.end();
            return;
        }

        console.log(`Found ${barangays.length} barangays with BAR-X format\n`);
        console.log('Starting migration...\n');

        let migratedCount = 0;
        const failedMigrations = [];

        for (const barangay of barangays) {
            const oldID = barangay.BarangayID;
            const numberPart = oldID.replace('BAR-', '');
            const newID = `BARANGAY-${numberPart}`;

            try {
                // Check if new ID already exists
                const [existing] = await connection.query(
                    'SELECT BarangayID FROM barangay WHERE BarangayID = ?',
                    [newID]
                );

                if (existing.length > 0) {
                    console.log(`⚠️  Skipped: ${oldID} → ${newID} (already exists)`);
                    continue;
                }

                // Update the ID
                await connection.query(
                    'UPDATE barangay SET BarangayID = ? WHERE BarangayID = ?',
                    [newID, oldID]
                );

                console.log(`✓ Migrated: ${oldID} → ${newID} (${barangay.BarangayName})`);
                migratedCount++;
            } catch (err) {
                console.error(`✗ Failed: ${oldID} → ${newID}`);
                console.error(`  Error: ${err.message}`);
                failedMigrations.push({ oldID, newID, error: err.message });
            }
        }

        console.log('\n' + '='.repeat(70));
        console.log('MIGRATION COMPLETED');
        console.log('='.repeat(70));
        console.log(`\nSummary:`);
        console.log(`  • Migrated: ${migratedCount} barangays`);
        console.log(`  • Failed: ${failedMigrations.length} barangays`);

        if (failedMigrations.length > 0) {
            console.log('\nFailed migrations:');
            failedMigrations.forEach(fail => {
                console.log(`  - ${fail.oldID}: ${fail.error}`);
            });
        }

        console.log('\n');

        connection.release();
        await pool.end();
    } catch (error) {
        console.error('Error during migration:', error);
        process.exit(1);
    }
}

migrateBarangayIDs();
