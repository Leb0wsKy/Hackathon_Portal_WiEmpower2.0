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


async function initDb(){
await db.read();
db.data = db.data || { users: [], submissions: [] };
await db.write();
}
initDb();


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
function authenticateToken(req, res, next){
const auth = req.headers['authorization'];
if (!auth) return res.status(401).json({ error: 'Missing authorization header' });
const parts = auth.split(' ');
if (parts.length !== 2) return res.status(401).json({ error: 'Bad authorization header' });
const token = parts[1];
try{
const payload = jwt.verify(token, JWT_SECRET);
req.user = payload;
next();
}catch(err){
return res.status(401).json({ error: 'Invalid token' });
}
}


// POST /api/login { username, password }
app.post('/api/login', async (req, res) => {
const { username, password } = req.body;
await db.read();
const user = db.data.users.find(u => u.username === username);
if (!user) return res.status(401).json({ error: 'Invalid credentials' });
const match = await bcrypt.compare(password, user.hash || '');
if (!match) return res.status(401).json({ error: 'Invalid credentials' });
const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
});


// POST /api/submissions (hacker) - form fields: teamName, projectName, description, file (optional)
app.post('/api/submissions', authenticateToken, upload.single('file'), async (req, res) => {
const { teamName, projectName, description } = req.body;
if (!teamName || !projectName) return res.status(400).json({ error: 'Missing fields' });
await db.read();
const id = nanoid();
const submission = {
id,
teamName,
projectName,
	description,
	file: req.file ? '/uploads/' + req.file.filename : null,
	createdAt: new Date().toISOString(),
	authorId: req.user && req.user.id ? req.user.id : null
};

// persist
db.data.submissions.push(submission);
await db.write();
res.json(submission);
});


// GET /api/submissions (jury) - returns all submissions
app.get('/api/submissions', authenticateToken, async (req, res) => {
	// only jury can fetch all submissions
	if (!req.user || req.user.role !== 'jury') return res.status(403).json({ error: 'Forbidden' });
	await db.read();
	res.json(db.data.submissions || []);
});


// start server
app.listen(PORT, "0.0.0.0", () => {
	console.log(`Backend listening on http://0.0.0.0:${PORT}`);
	console.log(`Access from network at http://172.20.10.3:${PORT}`);
});