const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { nanoid } = require('nanoid');

const base = path.join(__dirname, '..');
const seedPath = path.join(base, 'users_seed.json');
const dbPath = path.join(base, 'db.json');
const backupPath = path.join(base, `db.json.bak-${Date.now()}`);

async function run() {
  if (!fs.existsSync(seedPath)) {
    console.error('Missing users_seed.json at', seedPath);
    process.exit(1);
  }

  const seedRaw = fs.readFileSync(seedPath, 'utf8');
  const seed = JSON.parse(seedRaw);

  // Backup existing db.json if present
  if (fs.existsSync(dbPath)) {
    fs.copyFileSync(dbPath, backupPath);
    console.log('Backed up existing db.json to', backupPath);
  }

  const users = [];
  for (const u of seed) {
    const password = u.password || '';
    const hash = await bcrypt.hash(password, 10);
    users.push({
      id: nanoid(),
      username: u.username,
      role: u.role || 'hacker',
      hash
    });
  }

  const db = {
    users,
    submissions: []
  };

  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
  console.log('Wrote', dbPath, 'with', users.length, 'users');
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
