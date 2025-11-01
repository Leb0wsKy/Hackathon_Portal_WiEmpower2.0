// Simple Express backend with JWT auth, lowdb and multer uploads
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { Low, JSONFile } = require('lowdb');
const { nanoid } = require('nanoid');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'CHANGE_ME_TO_SECURE_VALUE';

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// prepare db
const file = path.join(__dirname, 'db.json');
const adapter = new JSONFile(file);
const db = new Low(adapter);

async function initDb() {
	await db.read();
	db.data = db.data || { users: [], submissions: [] };
	await db.write();
}

// multer storage
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		const uploads = path.join(__dirname, 'uploads');
		if (!fs.existsSync(uploads)) fs.mkdirSync(uploads);
		cb(null, uploads);
	},
	filename: (req, file, cb) => {
		const ext = path.extname(file.originalname);
		cb(null, Date.now() + '-' + nanoid(6) + ext);
	}
});
const upload = multer({ storage });

// helper: authenticate middleware
function authenticateToken(req, res, next) {
	const auth = req.headers['authorization'];
	if (!auth) return res.status(401).json({ error: 'Missing authorization header' });
	const parts = auth.split(' ');
	if (parts.length !== 2) return res.status(401).json({ error: 'Bad authorization header' });
	const token = parts[1];
	try {
		const payload = jwt.verify(token, JWT_SECRET);
		req.user = payload;
		next();
	} catch (err) {
		return res.status(401).json({ error: 'Invalid token' });
	}
}

// POST /api/login { username, password }
app.post('/api/login', async (req, res) => {
	const { username, password } = req.body;
	console.log('Login attempt:', username);
	await db.read();
	const user = db.data.users.find(u => u.username === username);
	if (!user) return res.status(401).json({ error: 'Invalid credentials' });
	const match = await bcrypt.compare(password, user.hash || '');
	if (!match) return res.status(401).json({ error: 'Invalid credentials' });
	const token = jwt.sign(
		{ id: user.id, username: user.username, role: user.role }, 
		JWT_SECRET, 
		{ expiresIn: '8h' }
	);
	res.json({ 
		token, 
		user: { id: user.id, username: user.username, role: user.role } 
	});
});

// POST /api/submissions (hacker) - form fields: teamName, projectName, description, file (optional)
// description is JSON string containing: { presentation, github, envVars (optional), other }
app.post('/api/submissions', authenticateToken, upload.single('file'), async (req, res) => {
	const { teamName, projectName, description } = req.body;
	
	if (!teamName || !projectName) {
		return res.status(400).json({ error: 'Missing required fields: teamName, projectName' });
	}

	// Parse description to validate it contains required fields
	let descObj;
	try {
		descObj = JSON.parse(description || '{}');
	} catch (e) {
		return res.status(400).json({ error: 'Invalid description format' });
	}

	// Validate that at least presentation or github is provided
	if (!descObj.presentation && !descObj.github) {
		return res.status(400).json({ 
			error: 'At least one of presentation or github link is required' 
		});
	}

	await db.read();
	const id = nanoid();
	
	const submission = {
		id,
		teamName,
		projectName,
		description, // Store as JSON string containing presentation, github, envVars, other
		file: req.file ? '/uploads/' + req.file.filename : null,
		createdAt: new Date().toISOString(),
		authorId: req.user && req.user.id ? req.user.id : null
	};

	// Log submission (excluding sensitive envVars)
	console.log('New submission:', {
		id,
		teamName,
		projectName,
		hasEnvVars: !!descObj.envVars,
		hasFile: !!submission.file
	});

	// persist
	db.data.submissions.push(submission);
	await db.write();
	
	res.json(submission);
});

// PUT /api/submissions/:id (hacker) - update own submission
app.put('/api/submissions/:id', authenticateToken, upload.single('file'), async (req, res) => {
	const { id } = req.params;
	const { teamName, projectName, description } = req.body;
	
	if (!teamName || !projectName) {
		return res.status(400).json({ error: 'Missing required fields: teamName, projectName' });
	}

	// Parse description to validate it contains required fields
	let descObj;
	try {
		descObj = JSON.parse(description || '{}');
	} catch (e) {
		return res.status(400).json({ error: 'Invalid description format' });
	}

	// Validate that at least presentation or github is provided
	if (!descObj.presentation && !descObj.github) {
		return res.status(400).json({ 
			error: 'At least one of presentation or github link is required' 
		});
	}

	await db.read();
	const submissionIndex = db.data.submissions.findIndex(s => s.id === id);
	
	if (submissionIndex === -1) {
		return res.status(404).json({ error: 'Submission not found' });
	}

	const submission = db.data.submissions[submissionIndex];

	// Verify ownership
	if (submission.authorId !== req.user.id) {
		return res.status(403).json({ error: 'Forbidden: Can only update your own submission' });
	}

	// Update submission
	submission.teamName = teamName;
	submission.projectName = projectName;
	submission.description = description;
	submission.updatedAt = new Date().toISOString();
	
	// Update file if provided
	if (req.file) {
		submission.file = '/uploads/' + req.file.filename;
	}

	db.data.submissions[submissionIndex] = submission;
	await db.write();

	console.log('Updated submission:', {
		id,
		teamName,
		projectName,
		hasEnvVars: !!descObj.envVars
	});

	res.json(submission);
});

// GET /api/submissions (jury) - returns all submissions
app.get('/api/submissions', authenticateToken, async (req, res) => {
	// only jury can fetch all submissions
	if (!req.user || req.user.role !== 'jury') {
		return res.status(403).json({ error: 'Forbidden: Jury access only' });
	}
	
	await db.read();
	const submissions = db.data.submissions || [];
	
	console.log(`Jury ${req.user.username} accessed ${submissions.length} submissions`);
	
	res.json(submissions);
});

// GET /api/my-submission (hacker) - returns hacker's own submission if exists
app.get('/api/my-submission', authenticateToken, async (req, res) => {
	if (!req.user) {
		return res.status(401).json({ error: 'Not authenticated' });
	}

	await db.read();
	const submissions = db.data.submissions || [];
	
	// Find submission by authorId (hacker's own submission)
	const submission = submissions.find(s => s.authorId === req.user.id);
	
	if (!submission) {
		return res.status(404).json({ submission: null });
	}

	console.log(`Hacker ${req.user.username} fetched their submission ${submission.id}`);
	
	res.json({ submission });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
	res.json({ 
		status: 'ok', 
		timestamp: new Date().toISOString(),
		submissions: db.data?.submissions?.length || 0
	});
});

// POST /api/admin/reseed - Replace entire users_seed.json and reseed db.json
// Requires authorization header with admin token
app.post('/api/admin/reseed', authenticateToken, async (req, res) => {
	// Only allow jury (can extend to true admin role if needed)
	if (!req.user || req.user.role !== 'jury') {
		return res.status(403).json({ error: 'Forbidden: Admin access required' });
	}

	const { users: newUsers } = req.body;
	
	if (!Array.isArray(newUsers)) {
		return res.status(400).json({ error: 'Body must contain "users" array' });
	}

	// Validate seed data structure
	if (!newUsers.every(u => u.username && u.password !== undefined)) {
		return res.status(400).json({ 
			error: 'Each user must have "username" and "password" fields' 
		});
	}

	try {
		const seedPath = path.join(__dirname, 'users_seed.json');
		const dbPath = path.join(__dirname, 'db.json');
		const backupPath = path.join(__dirname, `db.json.bak-${Date.now()}`);

		// Backup existing db.json
		if (fs.existsSync(dbPath)) {
			fs.copyFileSync(dbPath, backupPath);
		}

		// Write new seed file
		fs.writeFileSync(seedPath, JSON.stringify(newUsers, null, 2), 'utf8');

		// Hash passwords and create users
		const users = [];
		for (const u of newUsers) {
			const password = u.password || '';
			const hash = await bcrypt.hash(password, 10);
			users.push({
				id: nanoid(),
				username: u.username,
				role: u.role || 'hacker',
				hash
			});
		}

		// Read existing submissions to preserve them
		await db.read();
		const existingSubmissions = db.data?.submissions || [];

		// Write new db.json with new users but preserved submissions
		const newDb = {
			users,
			submissions: existingSubmissions
		};
		fs.writeFileSync(dbPath, JSON.stringify(newDb, null, 2), 'utf8');

		// Reload db in memory
		await db.read();

		console.log(`Database reseeded by ${req.user.username} with ${users.length} users`);

		res.json({
			status: 'reseeded',
			usersCount: users.length,
			backupPath: backupPath,
			timestamp: new Date().toISOString()
		});
	} catch (err) {
		console.error('Error reseeding database:', err);
		res.status(500).json({ error: 'Failed to reseed database', details: err.message });
	}
});

// start server
initDb().then(() => {
	app.listen(PORT, "0.0.0.0", () => {
		console.log(` Backend listening on http://localhost:${PORT}`);
		console.log(` Access from network at http://172.20.10.3:${PORT}`);
		console.log(` JWT Secret: ${JWT_SECRET.substring(0, 10)}...`);
	});
});