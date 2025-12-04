/**
 * Hash existing plaintext passwords in the database
 * 
 * RUN WITH: node server/hashPasswords.js
 * 
 * This script hashes all plaintext passwords in the users, superadmin, and officials tables
 * using bcryptjs with 10 rounds of salting.
 */

import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ path: './server/.env' });

async function hashAllPasswords() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'ibarangay_database',
    });

    try {
        const connection = await pool.getConnection();

        // ============================================
        // Hash passwords in users table
        // ============================================
        console.log('\n🔍 Checking users table for plaintext passwords...');
        const [users] = await connection.query(
            'SELECT UserID, Password FROM users WHERE LENGTH(Password) < 60'
        );

        if (users.length > 0) {
            console.log(`📋 Found ${users.length} user(s) with plaintext passwords\n`);
            for (const user of users) {
                if (user.Password && user.Password.length > 0) {
                    const hashedPassword = await bcrypt.hash(user.Password, 10);
                    await connection.query(
                        'UPDATE users SET Password = ? WHERE UserID = ?',
                        [hashedPassword, user.UserID]
                    );
                    console.log(`✅ Hashed password for user: ${user.UserID}`);
                }
            }
        } else {
            console.log('✅ No plaintext passwords in users table\n');
        }

        // ============================================
        // Hash passwords in superadmin table
        // ============================================
        console.log('\n🔍 Checking superadmin table for plaintext passwords...');
        const [superAdmins] = await connection.query(
            'SELECT SuperAdminID, Password FROM superadmin WHERE LENGTH(Password) < 60'
        );

        if (superAdmins.length > 0) {
            console.log(`📋 Found ${superAdmins.length} superadmin(s) with plaintext passwords\n`);
            for (const admin of superAdmins) {
                if (admin.Password && admin.Password.length > 0) {
                    const hashedPassword = await bcrypt.hash(admin.Password, 10);
                    await connection.query(
                        'UPDATE superadmin SET Password = ? WHERE SuperAdminID = ?',
                        [hashedPassword, admin.SuperAdminID]
                    );
                    console.log(`✅ Hashed password for superadmin: ${admin.SuperAdminID}`);
                }
            }
        } else {
            console.log('✅ No plaintext passwords in superadmin table\n');
        }

        // ============================================
        // Hash passwords in officials table
        // ============================================
        console.log('\n🔍 Checking officials table for plaintext passwords...');
        const [officials] = await connection.query(
            'SELECT OfficialID, Password FROM officials WHERE LENGTH(Password) < 60'
        );

        if (officials.length > 0) {
            console.log(`📋 Found ${officials.length} official(s) with plaintext passwords\n`);
            for (const official of officials) {
                if (official.Password && official.Password.length > 0) {
                    const hashedPassword = await bcrypt.hash(official.Password, 10);
                    await connection.query(
                        'UPDATE officials SET Password = ? WHERE OfficialID = ?',
                        [hashedPassword, official.OfficialID]
                    );
                    console.log(`✅ Hashed password for official: ${official.OfficialID}`);
                }
            }
        } else {
            console.log('✅ No plaintext passwords in officials table\n');
        }

        console.log('\n' + '='.repeat(70));
        console.log('✅ PASSWORD HASHING COMPLETED SUCCESSFULLY!');
        console.log('='.repeat(70) + '\n');

        connection.release();
        await pool.end();
    } catch (error) {
        console.error('❌ Error during password hashing:', error);
        process.exit(1);
    }
}

console.log('='.repeat(70));
console.log('PASSWORD HASHING SCRIPT - All Tables');
console.log('='.repeat(70));

hashAllPasswords();
