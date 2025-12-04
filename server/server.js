import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import multer from 'multer';

dotenv.config();

const app = express();

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        // Only allow image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ibarangay_database',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'ibarangay2025@gmail.com',
        pass: process.env.GMAIL_PASSWORD || 'your-app-specific-password'
    }
});

// In-memory OTP storage (for production, use Redis or database)
const otpStorage = new Map();

// Database columns are already set up in XAMPP




// Helper function to get connection with max_allowed_packet set
async function getConnectionWithPacketSize() {
    const connection = await pool.getConnection();
    try {
        await connection.query('SET SESSION max_allowed_packet=67108864');
    } catch (error) {
        console.warn('Could not set max_allowed_packet on connection:', error.message);
    }
    return connection;
}

// Password validation function
function validatePasswordStrength(password) {
    const errors = [];
    
    if (!password) {
        return { isValid: false, errors: ['Password is required'] };
    }

    // Check length
    if (password.length < 8) {
        errors.push('Password must be at least 8 characters');
    }
    if (password.length > 128) {
        errors.push('Password cannot exceed 128 characters');
    }

    // Check for uppercase
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least 1 uppercase letter');
    }

    // Check for lowercase
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least 1 lowercase letter');
    }

    // Check for number
    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least 1 number');
    }

    // Check for special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push('Password must contain at least 1 special character');
    }

    // Check for common weak patterns
    if (/(.)\1{2,}/.test(password)) {
        errors.push('Password contains repeating characters');
    }

    // Check for sequential characters
    if (/(?:012|123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(password)) {
        errors.push('Password contains sequential patterns');
    }

    // Check against common weak passwords
    const commonPasswords = [
        'password', 'password123', '12345678', 'qwerty123',
        'admin', 'admin123', 'welcome', 'letmein',
        'monkey', 'dragon', 'master', 'sunshine',
        'aaaaaa', 'baseball', 'football'
    ];
    if (commonPasswords.includes(password.toLowerCase())) {
        errors.push('This password is too common');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

// Helper function to generate IDs in format PREFIX-NUMBER
async function generateID(connection, tableName, idColumnName, prefix) {
    const upperPrefix = prefix.toUpperCase();
    const query = `SELECT MAX(CAST(SUBSTRING(${idColumnName}, ${prefix.length + 2}) AS UNSIGNED)) as maxNum FROM ${tableName} WHERE ${idColumnName} LIKE '${upperPrefix}-%'`;
    
    const [result] = await connection.query(query);
    
    let nextNumber = 1;
    if (result && result[0] && result[0].maxNum !== null) {
        nextNumber = result[0].maxNum + 1;
    }
    
    return `${upperPrefix}-${nextNumber}`;
}

app.get('/api/posts', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [posts] = await connection.query(`
      SELECT p.*, b.BarangayName, COALESCE(o.Email, 'Barangay Official') AS OfficialName
      FROM post p
      LEFT JOIN officials o ON p.OfficialID = o.OfficialID
      LEFT JOIN barangay b ON p.BarangayID = b.BarangayID
      ORDER BY p.CreatedAt DESC
      LIMIT 50
    `);
        connection.release();
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get posts by barangay (for admin dashboard)
app.get('/api/posts/barangay/:barangayId', async (req, res) => {
    try {
        const { barangayId } = req.params;
        const connection = await pool.getConnection();
        const [posts] = await connection.query(
            `SELECT p.*, b.BarangayName, COALESCE(o.Email, 'Barangay Official') AS OfficialName
             FROM post p
             LEFT JOIN officials o ON p.OfficialID = o.OfficialID
             LEFT JOIN barangay b ON p.BarangayID = b.BarangayID
             WHERE p.BarangayID = ? 
             ORDER BY p.CreatedAt DESC 
             LIMIT 100`,
            [barangayId]
        );
        connection.release();
        res.json(posts);
    } catch (error) {
        console.error('Error fetching posts by barangay:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/posts/:id', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [posts] = await connection.query(
            `SELECT p.*, b.BarangayName, COALESCE(o.Email, 'Barangay Official') AS OfficialName
             FROM post p
             LEFT JOIN officials o ON p.OfficialID = o.OfficialID
             LEFT JOIN barangay b ON p.BarangayID = b.BarangayID
             WHERE p.PostID = ?`,
            [req.params.id]
        );
        connection.release();
        if (posts.length === 0) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.json(posts[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/posts', upload.single('Image'), async (req, res) => {
    let connection;
    try {
        const { OfficialID, BarangayID, Title, Content, Category, Status } = req.body;
        let imageData = null;

        // Validate required fields
        if (!OfficialID || !BarangayID || !Title || !Content || !Category) {
            return res.status(400).json({ 
                error: 'Missing required fields: OfficialID, BarangayID, Title, Content, Category' 
            });
        }

        // Handle image if provided
        if (req.file) {
            // Convert file to base64
            imageData = req.file.buffer.toString('base64');
        }

        connection = await getConnectionWithPacketSize();
        const PostID = await generateID(connection, 'post', 'PostID', 'post');
        
        await connection.query(
            'INSERT INTO post (PostID, OfficialID, BarangayID, Title, Content, Category, Image, CreatedAt, UpdatedAt, Status, ReactionCount, CommentCount) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?, 0, 0)',
            [PostID, OfficialID, BarangayID, Title, Content, Category, imageData, Status || 'published']
        );
        
        const [newPost] = await connection.query(
            `SELECT p.*, COALESCE(o.Email, 'Barangay Official') AS OfficialName
             FROM post p
             LEFT JOIN officials o ON p.OfficialID = o.OfficialID
             WHERE p.PostID = ?`,
            [PostID]
        );
        
        connection.release();
        
        console.log(`✅ Post created successfully: ${PostID}`);
        res.status(201).json(newPost[0]);
    } catch (error) {
        if (connection) connection.release();
        console.error('❌ Error creating post:', error.message);
        res.status(500).json({ error: error.message });
    }
});



app.get('/api/concerns', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [concerns] = await connection.query(
            'SELECT * FROM citizenconcerns ORDER BY DateReported DESC LIMIT 50'
        );
        connection.release();
        res.json(concerns);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get concerns by barangay (for admin dashboard)
app.get('/api/concerns/barangay/:barangayId', async (req, res) => {
    try {
        const { barangayId } = req.params;
        const connection = await pool.getConnection();
        const [concerns] = await connection.query(
            'SELECT * FROM citizenconcerns WHERE BarangayID = ? ORDER BY DateReported DESC LIMIT 100',
            [barangayId]
        );
        connection.release();
        res.json(concerns);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/concerns', async (req, res) => {
    try {
        const { UserID, BarangayID, ConcernType, Description } = req.body;
        const connection = await pool.getConnection();
        const ConcernID = await generateID(connection, 'citizenconcerns', 'ConcernID', 'concern');
        console.log('Generated ConcernID:', ConcernID);
        await connection.query(
            'INSERT INTO citizenconcerns (ConcernID, UserID, BarangayID, ConcernType, Description, Status, DateReported) VALUES (?, ?, ?, ?, ?, ?, NOW())',
            [ConcernID, UserID, BarangayID, ConcernType, Description, 'pending']
        );
        connection.release();
        res.status(201).json({ ConcernID, ...req.body });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update concern status (admin only)
app.put('/api/concerns/:concernId', async (req, res) => {
    let connection;
    try {
        const { concernId } = req.params;
        const { status, remarks } = req.body;

        if (!status) {
            return res.status(400).json({ error: 'Status is required' });
        }

        connection = await pool.getConnection();
        
        const updateQuery = remarks 
            ? 'UPDATE citizenconcerns SET Status = ?, AdminRemarks = ? WHERE ConcernID = ?'
            : 'UPDATE citizenconcerns SET Status = ? WHERE ConcernID = ?';
        
        const updateParams = remarks 
            ? [status, remarks, concernId]
            : [status, concernId];

        await connection.query(updateQuery, updateParams);
        
        const [updatedConcern] = await connection.query(
            'SELECT * FROM citizenconcerns WHERE ConcernID = ?',
            [concernId]
        );
        
        connection.release();
        
        if (updatedConcern.length === 0) {
            return res.status(404).json({ error: 'Concern not found' });
        }
        
        res.json(updatedConcern[0]);
    } catch (error) {
        if (connection) {
            connection.release();
        }
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/emergency-contacts', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [contacts] = await connection.query('SELECT * FROM emergencycontacts');
        connection.release();
        res.json(contacts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/users', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        console.log('📋 Fetching users...');
        
        const [users] = await connection.query(
            `SELECT u.UserID, CONCAT(u.First_Name, ' ', u.Last_Name) as FullName, u.Email, u.Phone_Number as Phone, u.BarangayID, u.DateRegistered,
              b.BarangayName, b.Municipality, b.Province
       FROM users u
       LEFT JOIN barangay b ON u.BarangayID = b.BarangayID
       ORDER BY u.DateRegistered DESC LIMIT 100`
        );
        
        console.log(`✓ Found ${users.length} users`);
        res.json(users);
    } catch (error) {
        console.error('❌ Error fetching users:', error.message);
        res.status(500).json({ error: error.message });
    } finally {
        if (connection) connection.release();
    }
});

app.get('/api/users/:id', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [users] = await connection.query(
            'SELECT UserID, First_Name, Last_Name, Email, Phone_Number, BarangayID, Profile FROM users WHERE UserID = ?',
            [req.params.id]
        );
        connection.release();
        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        const user = users[0];
        const firstName = user.First_Name || '';
        const lastName = user.Last_Name || '';
        res.json({
            UserID: user.UserID,
            FullName: `${firstName} ${lastName}`.trim(),
            Email: user.Email,
            Phone_Number: user.Phone_Number || '',
            BarangayID: user.BarangayID,
            ProfilePicture: user.Profile || null
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/users/:id', async (req, res) => {
    try {
        const { FullName, Email, Phone_Number, ProfilePicture } = req.body;
        const userId = req.params.id;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const connection = await pool.getConnection();

        try {
            // Check if user exists
            const [users] = await connection.query('SELECT UserID FROM users WHERE UserID = ?', [userId]);
            if (users.length === 0) {
                connection.release();
                return res.status(404).json({ error: 'User not found' });
            }

            // Build update query dynamically
            const updateFields = [];
            const updateValues = [];

            if (FullName !== undefined) {
                const [firstName, ...lastNameParts] = FullName.split(' ');
                const lastName = lastNameParts.join(' ') || '';
                updateFields.push('First_Name = ?', 'Last_Name = ?');
                updateValues.push(firstName, lastName);
            }

            if (Email !== undefined) {
                updateFields.push('Email = ?');
                updateValues.push(Email);
            }

            if (Phone_Number !== undefined) {
                updateFields.push('Phone_Number = ?');
                updateValues.push(Phone_Number);
            }

            if (ProfilePicture !== undefined) {
                updateFields.push('Profile = ?');
                updateValues.push(ProfilePicture);
            }

            if (updateFields.length === 0) {
                connection.release();
                return res.status(400).json({ error: 'No fields to update' });
            }

            updateValues.push(userId);

            const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE UserID = ?`;
            await connection.query(updateQuery, updateValues);

            connection.release();

            res.json({
                success: true,
                message: 'User updated successfully',
                userId: userId
            });
        } catch (error) {
            connection.release();
            console.error('Database error:', error);
            throw error;
        }
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: error.message || 'Failed to update profile' });
    }
});

app.post('/api/users/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log('🔓 User login attempt:');
        console.log(`  Email: ${email}`);
        console.log(`  Password length: ${password ? password.length : 0} chars`);

        if (!email || !password) {
            console.log('❌ Missing email or password');
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const connection = await pool.getConnection();
        console.log('✓ Database connection established');

        const [users] = await connection.query(
            'SELECT UserID, First_Name, Last_Name, Email, Password, BarangayID FROM users WHERE Email = ?',
            [email]
        );
        connection.release();

        console.log(`✓ Query executed, found ${users.length} user(s)`);

        if (users.length === 0) {
            console.log(`❌ User not found: ${email}`);
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = users[0];
        console.log(`✓ User found: ${user.UserID} - ${user.First_Name} ${user.Last_Name}`);
        console.log(`✓ Comparing password with hash: ${user.Password.substring(0, 30)}...`);

        const passwordMatch = await bcrypt.compare(password, user.Password);
        console.log(`✓ Password comparison result: ${passwordMatch}`);

        if (!passwordMatch) {
            console.log('❌ Password mismatch');
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const fullName = `${user.First_Name} ${user.Last_Name}`;
        console.log(`✅ Login successful for ${fullName}`);
        
        res.json({
            success: true,
            message: 'Login successful',
            user: {
                userId: user.UserID,
                fullName: fullName,
                email: user.Email,
                barangayId: user.BarangayID,
                userType: 'user'
            }
        });
    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/users/register', async (req, res) => {
     try {
         const { fullName, email, password, phone, address, barangayId } = req.body;

         // Validation
         if (!fullName || !email || !password) {
             return res.status(400).json({ error: 'Full name, email, and password are required' });
         }

         // Validate password strength
         const passwordValidation = validatePasswordStrength(password);
         if (!passwordValidation.isValid) {
             return res.status(400).json({ 
                 error: 'Password does not meet security requirements',
                 details: passwordValidation.errors 
             });
         }

         const connection = await pool.getConnection();

        const [existingUsers] = await connection.query(
            'SELECT UserID FROM users WHERE Email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            connection.release();
            return res.status(409).json({ error: 'Email already registered' });
        }

        const UserID = await generateID(connection, 'users', 'UserID', 'user');

        const [firstNameLastName] = fullName.split(' ');
        const lastName = fullName.split(' ').slice(1).join(' ') || '';

        // Hash password before storing
        const hashedPassword = await bcrypt.hash(password, 10);

        await connection.query(
            'INSERT INTO users (UserID, First_Name, Last_Name, Email, Phone_Number, Password, DateRegistered, BarangayID) VALUES (?, ?, ?, ?, ?, ?, NOW(), ?)',
            [UserID, firstNameLastName, lastName, email, phone, hashedPassword, barangayId || null]
        );

        connection.release();

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            user: {
                userId: UserID,
                fullName: fullName,
                email: email,
                barangayId: barangayId,
                userType: 'user'
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/admin-register', async (req, res) => {
     let connection;
     try {
         const { email, contactNumber, password, barangayId } = req.body;

         console.log('📋 Admin registration attempt:');
         console.log('  Email:', email);
         console.log('  BarangayID:', barangayId);
         console.log('  Contact:', contactNumber);

         if (!email || !contactNumber || !password || !barangayId) {
             return res.status(400).json({ error: 'Email, contact number, password, and barangay are required' });
         }

         // Validate password strength
         const passwordValidation = validatePasswordStrength(password);
         if (!passwordValidation.isValid) {
             return res.status(400).json({ 
                 error: 'Password does not meet security requirements',
                 details: passwordValidation.errors 
             });
         }

         connection = await pool.getConnection();

        // Check if email already exists
        const [existingOfficials] = await connection.query(
            'SELECT OfficialID FROM officials WHERE Email = ?',
            [email]
        );

        if (existingOfficials.length > 0) {
            connection.release();
            return res.status(409).json({ error: 'Email already registered' });
        }

        // Generate OfficialID
        const OfficialID = await generateID(connection, 'officials', 'OfficialID', 'official');

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert into officials table with pending status
        await connection.query(
            'INSERT INTO officials (OfficialID, Email, Password, ContactNumber, BarangayID, Status, DateRegistered) VALUES (?, ?, ?, ?, ?, ?, NOW())',
            [OfficialID, email, hashedPassword, contactNumber, barangayId, 'pending']
        );

        connection.release();

        console.log('✅ Admin application submitted successfully:', OfficialID);

        res.status(201).json({
            success: true,
            message: 'Admin application submitted. Awaiting super admin approval.',
            officialId: OfficialID
        });
    } catch (error) {
        if (connection) {
            connection.release();
        }
        console.error('❌ Error registering admin:', error.message);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/admin/login', async (req, res) => {
    let connection;
    try {
        const { email, password } = req.body;

        console.log('🔓 Admin login attempt:');
        console.log(`  Email: ${email}`);
        console.log(`  Password length: ${password ? password.length : 0} chars`);

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        connection = await pool.getConnection();

        const [superAdmins] = await connection.query(
            'SELECT SuperAdminID, Email, Password FROM superadmin WHERE Email = ?',
            [email]
        );

        if (superAdmins.length > 0) {
            console.log('✓ Super admin found');
            const passwordMatch = await bcrypt.compare(password, superAdmins[0].Password);
            if (passwordMatch) {
                console.log('✅ Super admin login successful');
                return res.json({
                    success: true,
                    message: 'Login successful',
                    user: {
                        userId: superAdmins[0].SuperAdminID,
                        email: superAdmins[0].Email,
                        userType: 'superadmin'
                    }
                });
            } else {
                console.log('❌ Super admin password mismatch');
            }
        }

        const [officials] = await connection.query(
            'SELECT OfficialID, BarangayID, Password, Status FROM officials WHERE Email = ? AND Status = ?',
            [email, 'approved']
        );

        if (officials.length > 0) {
            console.log('✓ Official found and approved');
            const passwordMatch = await bcrypt.compare(password, officials[0].Password);
            if (passwordMatch) {
                console.log('✅ Official login successful');
                return res.json({
                    success: true,
                    message: 'Login successful',
                    user: {
                        userId: officials[0].OfficialID,
                        barangayId: officials[0].BarangayID,
                        userType: 'admin'
                    }
                });
            } else {
                console.log('❌ Official password mismatch');
            }
        } else {
            console.log('❌ No approved official found with this email');
        }

        return res.status(401).json({ error: 'Invalid email or password. Admin must be approved by super admin.' });
    } catch (error) {
        console.error('❌ Admin login error:', error.message);
        res.status(500).json({ error: error.message });
    } finally {
        if (connection) connection.release();
    }
});

app.get('/api/comments/:postId', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [comments] = await connection.query(
            'SELECT c.*, u.FullName FROM comments c LEFT JOIN users u ON c.UserID = u.UserID WHERE c.PostID = ? ORDER BY c.CreatedAt DESC',
            [req.params.postId]
        );
        connection.release();
        res.json(comments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/comments', async (req, res) => {
    let connection;
    try {
        const { PostID, UserID, Content } = req.body;
        
        if (!PostID || !UserID || !Content) {
            return res.status(400).json({ error: 'PostID, UserID, and Content are required' });
        }
        
        connection = await pool.getConnection();
        const CommentID = await generateID(connection, 'comments', 'CommentID', 'comment');
        await connection.query(
            'INSERT INTO comments (CommentID, PostID, UserID, Content, CreatedAt) VALUES (?, ?, ?, ?, NOW())',
            [CommentID, PostID, UserID, Content]
        );
        
        // Update comment count in post
        await connection.query(
            'UPDATE post SET CommentCount = CommentCount + 1 WHERE PostID = ?',
            [PostID]
        );
        
        connection.release();
        res.status(201).json({ CommentID, PostID, UserID, Content, CreatedAt: new Date() });
    } catch (error) {
        if (connection) connection.release();
        res.status(500).json({ error: error.message });
    }
});

// Get reactions for a post
app.get('/api/reactions/:postId', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [reactions] = await connection.query(
            'SELECT * FROM reactions WHERE PostID = ?',
            [req.params.postId]
        );
        connection.release();
        res.json(reactions || []);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add/toggle reaction (like)
app.post('/api/reactions', async (req, res) => {
    let connection;
    try {
        const { PostID, UserID } = req.body;
        
        if (!PostID || !UserID) {
            return res.status(400).json({ error: 'PostID and UserID are required' });
        }
        
        connection = await pool.getConnection();
        
        // Check if user already liked this post
        const [existingReaction] = await connection.query(
            'SELECT * FROM reactions WHERE PostID = ? AND UserID = ?',
            [PostID, UserID]
        );
        
        if (existingReaction && existingReaction.length > 0) {
            // Remove the reaction (unlike)
            await connection.query(
                'DELETE FROM reactions WHERE PostID = ? AND UserID = ?',
                [PostID, UserID]
            );
            
            // Decrease reaction count
            await connection.query(
                'UPDATE post SET ReactionCount = GREATEST(ReactionCount - 1, 0) WHERE PostID = ?',
                [PostID]
            );
            
            connection.release();
            return res.json({ action: 'removed', message: 'Reaction removed' });
        } else {
            // Add the reaction (like)
            const ReactionID = await generateID(connection, 'reactions', 'ReactionID', 'react');
            await connection.query(
                'INSERT INTO reactions (ReactionID, PostID, UserID, CreatedAt) VALUES (?, ?, ?, NOW())',
                [ReactionID, PostID, UserID]
            );
            
            // Increase reaction count
            await connection.query(
                'UPDATE post SET ReactionCount = ReactionCount + 1 WHERE PostID = ?',
                [PostID]
            );
            
            connection.release();
            return res.status(201).json({ ReactionID, PostID, UserID, action: 'added', CreatedAt: new Date() });
        }
    } catch (error) {
        if (connection) connection.release();
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/document-requests', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [requests] = await connection.query(
            'SELECT * FROM documentrequest ORDER BY DateRequested DESC LIMIT 50'
        );
        connection.release();
        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get document requests by barangay (for admin dashboard)
app.get('/api/document-requests/barangay/:barangayId', async (req, res) => {
    try {
        const { barangayId } = req.params;
        const connection = await pool.getConnection();
        const [requests] = await connection.query(
            'SELECT * FROM documentrequest WHERE BarangayID = ? ORDER BY DateRequested DESC LIMIT 100',
            [barangayId]
        );
        connection.release();
        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/document-requests', async (req, res) => {
    let connection;
    try {
        const { UserID, BarangayID, DocumentType, Purpose, ValidID } = req.body;
        
        console.log('📝 Document request submitted:');
        console.log('  UserID:', UserID);
        console.log('  BarangayID:', BarangayID);
        console.log('  DocumentType:', DocumentType);
        console.log('  Purpose length:', Purpose ? Purpose.length : 0, 'chars');
        console.log('  ValidID length:', ValidID ? ValidID.length : 0, 'bytes');
        
        // Validate required fields (ValidID is required - NOT optional)
        if (!UserID || !BarangayID || !DocumentType || !Purpose || !ValidID) {
            console.error('❌ Missing required fields');
            const missingFields = [];
            if (!UserID) missingFields.push('UserID');
            if (!BarangayID) missingFields.push('BarangayID');
            if (!DocumentType) missingFields.push('DocumentType');
            if (!Purpose) missingFields.push('Purpose');
            if (!ValidID) missingFields.push('ValidID');
            return res.status(400).json({ error: `Missing required fields: ${missingFields.join(', ')}` });
        }

        connection = await getConnectionWithPacketSize();
        console.log('✓ Database connection established');

        const DocumentRequestID = await generateID(connection, 'documentrequest', 'DocumentRequestID', 'doc');
        console.log('✓ Generated DocumentRequestID:', DocumentRequestID);

        console.log('📤 Inserting into database...');
        await connection.query(
            'INSERT INTO documentrequest (DocumentRequestID, UserID, BarangayID, DocumentType, Purpose, ValidID, Status, DateRequested) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
            [DocumentRequestID, UserID, BarangayID, DocumentType, Purpose, ValidID, 'pending']
        );
        console.log('✅ Document request created successfully:', DocumentRequestID);

        connection.release();
        
        res.status(201).json({ 
            DocumentRequestID, 
            UserID,
            BarangayID,
            DocumentType,
            Purpose,
            Status: 'pending',
            DateRequested: new Date()
        });
    } catch (error) {
        if (connection) {
            connection.release();
        }
        console.error('❌ Error creating document request:');
        console.error('  Message:', error.message);
        console.error('  Code:', error.code);
        console.error('  Stack:', error.stack);
        res.status(500).json({ error: error.message });
    }
});

// Update document request status (admin only)
app.put('/api/document-requests/:requestId', async (req, res) => {
    let connection;
    try {
        const { requestId } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ error: 'Status is required' });
        }

        connection = await pool.getConnection();
        
        // Get current request to validate status transition
        const [currentRequest] = await connection.query(
            'SELECT Status FROM documentrequest WHERE DocumentRequestID = ?',
            [requestId]
        );
        
        if (currentRequest.length === 0) {
            connection.release();
            return res.status(404).json({ error: 'Document request not found' });
        }
        
        const currentStatus = currentRequest[0].Status;
        
        // Validate status transitions
        if (currentStatus === 'cancelled') {
            connection.release();
            return res.status(400).json({ error: 'Cannot change status of a cancelled request' });
        }
        
        if ((status === 'ready' || status === 'done') && currentStatus !== 'approved') {
            connection.release();
            return res.status(400).json({ error: `Cannot mark as ${status} - request must be approved first` });
        }
        
        if (status === 'approved' && currentStatus === 'cancelled') {
            connection.release();
            return res.status(400).json({ error: 'Cannot approve a cancelled request' });
        }
        
        await connection.query(
            'UPDATE documentrequest SET Status = ? WHERE DocumentRequestID = ?',
            [status, requestId]
        );
        
        const [updatedRequest] = await connection.query(
            'SELECT * FROM documentrequest WHERE DocumentRequestID = ?',
            [requestId]
        );
        
        connection.release();
        res.json(updatedRequest[0]);
    } catch (error) {
        if (connection) {
            connection.release();
        }
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/barangays', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [barangays] = await connection.query('SELECT * FROM barangay');
        connection.release();
        res.json(barangays);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/barangays', async (req, res) => {
    try {
        const { barangayName, municipality, province } = req.body;

        if (!barangayName || !municipality || !province) {
            return res.status(400).json({ error: 'Barangay name, municipality, and province are required' });
        }

        const connection = await pool.getConnection();

        try {
            const BarangayID = await generateID(connection, 'barangay', 'BarangayID', 'barangay');

            await connection.query(
                'INSERT INTO barangay (BarangayID, BarangayName, Municipality, Province) VALUES (?, ?, ?, ?)',
                [BarangayID, barangayName, municipality, province]
            );

            res.status(201).json({
                success: true,
                message: 'Barangay added successfully',
                barangay: { BarangayID, BarangayName: barangayName, Municipality: municipality, Province: province }
            });
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error in POST /api/barangays:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/officials', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [officials] = await connection.query(`
            SELECT o.*, b.BarangayName, b.Municipality, b.Province 
            FROM officials o 
            LEFT JOIN barangay b ON o.BarangayID = b.BarangayID
        `);
        connection.release();
        res.json(officials);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/barangay-admin/:barangayId', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [admin] = await connection.query(
            'SELECT OfficialID, Email, ContactNumber, Status FROM officials WHERE BarangayID = ? AND Status = ?',
            [req.params.barangayId, 'approved']
        );
        connection.release();
        if (admin.length > 0) {
            res.json({ hasAdmin: true, admin: admin[0] });
        } else {
            res.json({ hasAdmin: false });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/officials/:id/status', async (req, res) => {
    let connection;
    try {
        const { status } = req.body;
        connection = await pool.getConnection();
        
        console.log(`📝 Updating official ${req.params.id} status to ${status}`);
        
        const [result] = await connection.query(
            'UPDATE officials SET Status = ? WHERE OfficialID = ?',
            [status, req.params.id]
        );
        
        if (result.affectedRows > 0) {
            console.log(`✅ Official ${req.params.id} status updated to ${status}`);
            res.json({ success: true, message: `Admin status updated to ${status}` });
        } else {
            res.status(404).json({ error: 'Official not found' });
        }
    } catch (error) {
        console.error('❌ Error updating official status:', error.message);
        res.status(500).json({ error: error.message });
    } finally {
        if (connection) connection.release();
    }
});

app.delete('/api/officials/:id', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [result] = await connection.query(
            'DELETE FROM officials WHERE OfficialID = ?',
            [req.params.id]
        );
        connection.release();
        
        if (result.affectedRows > 0) {
            res.json({ success: true, message: 'Admin deleted successfully' });
        } else {
            res.status(404).json({ error: 'Official not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/users/:id', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [result] = await connection.query(
            'DELETE FROM users WHERE UserID = ?',
            [req.params.id]
        );
        connection.release();
        
        if (result.affectedRows > 0) {
            res.json({ success: true, message: 'User deleted successfully' });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/activity-logs', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [logs] = await connection.query(
            'SELECT * FROM activity_log ORDER BY PerformedAt DESC LIMIT 100'
        );
        connection.release();
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Forgot Password - Generate OTP and send email
app.post('/api/forgot-password', async (req, res) => {
    let connection;
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        connection = await pool.getConnection();

        // Check if user exists
        const [users] = await connection.query(
            'SELECT UserID, First_Name, Last_Name FROM users WHERE Email = ?',
            [email]
        );
        connection.release();

        if (users.length === 0) {
            return res.status(404).json({ 
                error: 'Email not found in our database' 
            });
        }

        // Generate 6-digit OTP
        const otp = crypto.randomInt(100000, 999999).toString();
        const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

        // Store OTP
        otpStorage.set(email, { otp, expiresAt, attempts: 0 });

        const user = users[0];
        const fullName = `${user.First_Name} ${user.Last_Name}`;

        // Send email
        const mailOptions = {
            from: 'iBarangay <ibarangay2025@gmail.com>',
            to: email,
            subject: 'Password Reset OTP - iBarangay',
            html: `
                <div style="font-family: Roboto, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #3862ff; margin-bottom: 20px;">Password Reset Request</h2>
                    <p>Hi ${fullName},</p>
                    <p>You requested to reset your password. Use the OTP below to proceed:</p>
                    <div style="background-color: #f0f4ff; padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0;">
                        <p style="font-size: 24px; font-weight: bold; color: #3862ff; letter-spacing: 2px; margin: 0;">${otp}</p>
                    </div>
                    <p style="color: #6b7280;">This OTP will expire in 10 minutes.</p>
                    <p style="color: #6b7280;">If you did not request this, please ignore this email.</p>
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                    <p style="color: #9ca3af; font-size: 0.85rem;">
                        © 2025 iBarangay. All rights reserved.
                    </p>
                </div>
            `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Email sending error:', error);
                res.status(500).json({ error: 'Failed to send OTP. Please try again.' });
            } else {
                console.log('✅ OTP email sent to:', email);
                res.status(200).json({ 
                    message: 'OTP sent to your email' 
                });
            }
        });
    } catch (error) {
        if (connection) connection.release();
        console.error('❌ Forgot password error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Verify OTP
app.post('/api/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ error: 'Email and OTP are required' });
        }

        const storedOtpData = otpStorage.get(email);

        if (!storedOtpData) {
            return res.status(400).json({ error: 'OTP not found. Please request a new one.' });
        }

        // Check if OTP expired
        if (Date.now() > storedOtpData.expiresAt) {
            otpStorage.delete(email);
            return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
        }

        // Check attempt limit (3 attempts)
        if (storedOtpData.attempts >= 3) {
            otpStorage.delete(email);
            return res.status(400).json({ error: 'Too many attempts. Please request a new OTP.' });
        }

        // Verify OTP
        if (storedOtpData.otp !== otp) {
            storedOtpData.attempts += 1;
            return res.status(400).json({ error: 'Invalid OTP' });
        }

        res.status(200).json({ 
            message: 'OTP verified successfully' 
        });
    } catch (error) {
        console.error('❌ OTP verification error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Reset Password
app.post('/api/reset-password', async (req, res) => {
    let connection;
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({ error: 'Email, OTP, and new password are required' });
        }

        // Verify OTP again
        const storedOtpData = otpStorage.get(email);

        if (!storedOtpData) {
            return res.status(400).json({ error: 'Invalid request. Please start over.' });
        }

        if (storedOtpData.otp !== otp) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }

        // Validate password strength
        const passwordValidation = validatePasswordStrength(newPassword);
        if (!passwordValidation.isValid) {
            return res.status(400).json({ 
                error: 'Password does not meet security requirements',
                details: passwordValidation.errors 
            });
        }

        connection = await pool.getConnection();

        // Check if user exists
        const [users] = await connection.query(
            'SELECT UserID FROM users WHERE Email = ?',
            [email]
        );

        if (users.length === 0) {
            connection.release();
            return res.status(404).json({ error: 'User not found' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await connection.query(
            'UPDATE users SET Password = ? WHERE Email = ?',
            [hashedPassword, email]
        );

        connection.release();

        // Clean up OTP
        otpStorage.delete(email);

        console.log('✅ Password reset successfully for:', email);

        res.status(200).json({ 
            success: true,
            message: 'Password reset successfully' 
        });
    } catch (error) {
        if (connection) connection.release();
        console.error('❌ Password reset error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.post('/api/seed-barangays', async (req, res) => {
    try {
        const connection = await pool.getConnection();

        const barangays = [
            'Ablayan', 'Babayongan', 'Balud', 'Banhigan', 'Bulak', 'Caleriohan',
            'Caliongan', 'Casay', 'Catolohan', 'Cawayan', 'Consolacion', 'Coro',
            'Dugyan', 'Dumalan', 'Jolomaynon', 'Lanao', 'Langkas', 'Lumbang',
            'Malones', 'Maloray', 'Mananggal', 'Manlapay', 'Mantalongon', 'Nalhub',
            'Obo', 'Obong', 'Panas', 'Poblacion', 'Sacsac', 'Salug', 'Tabon', 'Tapun', 'Tuba'
        ];

        let addedCount = 0;
        for (let i = 0; i < barangays.length; i++) {
            const BarangayID = `BAR-${i + 1}`; // BAR-1, BAR-2, etc.
            const barangayName = barangays[i];

            const result = await connection.query(
                'INSERT IGNORE INTO barangay (BarangayID, BarangayName, Municipality, Province) VALUES (?, ?, ?, ?)',
                [BarangayID, barangayName, 'Dalaguete', 'Cebu']
            );
            
            if (result[0].affectedRows > 0) {
                addedCount++;
            }
        }

        connection.release();
        res.json({ success: true, message: 'Barangays seeded successfully', barangaysAdded: addedCount });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
