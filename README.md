
# WiEmpower Hackathon Portal

Lightweight hackathon portal used for the WiEmpower 2.0 event — contains a simple Node/JSON backend and a React frontend.

## Contents

- `backend/` — small Express server and a JSON database used for demos.
- `frontend/` — React single-page app for participants, jury and login UI.

## Prerequisites

- Node.js (16+ recommended)
- npm (or yarn)

## Setup

1. Install backend dependencies and start the backend:

	```powershell
	cd backend
	npm install
	npm start
	```

2. Install frontend dependencies and start the frontend (in a new terminal):

	```powershell
	cd frontend
	npm install
	npm start
	```

The backend runs by default on a simple port (see `backend/server.js`). The frontend uses the React dev server and proxies requests to the backend.

## Development notes

- Seed data for users is provided in `backend/users_seed.json`. Use the scripts in `backend/scripts/` to re-seed if needed.
- Avoid checking in `node_modules/`. If you accidentally committed `node_modules/`, remove it and add the appropriate `.gitignore` entries.

## Architecture

This repository contains a simple two-tier architecture:

- backend/ — Express.js server that serves a small JSON "database" (`db.json`). It exposes a few REST endpoints used by the frontend for authentication and CRUD operations used in demos.
- frontend/ — React single-page application (Create React App style) that provides the UI for participants, jury and login flows. The dev server proxies API calls to the backend.

Both parts are intentionally lightweight to make the project easy to run locally and explore.

## Key features

- Simple user seeding and authentication demo using `backend/users_seed.json`.
- Roles: participant (hacker) and jury with separate UI components in `frontend/src/components/`.
- File upload endpoint for demo assets (see `backend/uploads/`).
- Minimal dependencies so the project is easy to inspect and extend.

## Backend API (overview)

The backend is intentionally small. Key endpoints include:

- GET /users — list seeded users (for demo)
- POST /login — simple login endpoint that validates against seeded users
- GET/POST /submissions — demo endpoints for submissions (create/list)
- POST /upload — accepts multipart/form-data file uploads to `backend/uploads/`

See `backend/server.js` for the full list and implementations.

## Environment / configuration

- Backend port is set in `backend/server.js` (default visible in the file). No `.env` file is required for the demo, but you can add one and load it in `server.js` if you need custom settings.
- Frontend dev server proxy is configured in `frontend/package.json` to forward API requests to the backend when running `npm start`.


