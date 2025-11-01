import React, { useEffect, useState } from 'react';
import { fetchSubmissions, API_BASE } from '../api';
import juryImg from '../Assets/14700.png';

export default function Jury() {
	const [subs, setSubs] = useState([]);
	const [loading, setLoading] = useState(false);
	const [err, setErr] = useState(null);
	const [expandedEnv, setExpandedEnv] = useState({});
	const [showReseedDialog, setShowReseedDialog] = useState(false);
	const [reseedJson, setReseedJson] = useState('');
	const [reseedLoading, setReseedLoading] = useState(false);
	const [reseedErr, setReseedErr] = useState(null);
	const [reseedSuccess, setReseedSuccess] = useState(null);

	useEffect(() => {
		async function load() {
			setLoading(true);
			setErr(null);
			try {
				const res = await fetchSubmissions();
				if (Array.isArray(res)) setSubs(res);
				else if (res && res.submissions) setSubs(res.submissions);
				else setErr('Unexpected response');
			} catch (e) { setErr('Failed to fetch submissions'); }
			finally { setLoading(false); }
		}
		load();
	}, []);

	function toggleEnv(id) {
		setExpandedEnv(prev => ({ ...prev, [id]: !prev[id] }));
	}

	async function handleReseed() {
		setReseedErr(null);
		setReseedSuccess(null);

		// Validate JSON
		let parsedJson;
		try {
			parsedJson = JSON.parse(reseedJson);
		} catch (e) {
			setReseedErr('Invalid JSON format: ' + e.message);
			return;
		}

		// Validate structure
		if (!Array.isArray(parsedJson)) {
			setReseedErr('JSON must be an array of users');
			return;
		}

		// Validate each user
		for (let i = 0; i < parsedJson.length; i++) {
			const u = parsedJson[i];
			if (!u.username || !u.password) {
				setReseedErr(`User ${i}: Missing "username" or "password" field`);
				return;
			}
		}

		// Check if jury user exists
		const hasJuryUser = parsedJson.some(u => u.username === 'jury_user');
		if (!hasJuryUser) {
			setReseedErr('⚠️ Warning: No user "jury_user" found. This user is recommended for jury access.');
			return;
		}

		// Send reseed request
		setReseedLoading(true);
		try {
			const token = localStorage.getItem('token');
			if (!token) {
				setReseedErr('Not authenticated. Please login first.');
				setReseedLoading(false);
				return;
			}

			const response = await fetch(`${API_BASE}/api/admin/reseed`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify({ users: parsedJson })
			});

			const data = await response.json();

			if (!response.ok) {
				setReseedErr('Error: ' + (data.error || 'Failed to reseed'));
				setReseedLoading(false);
				return;
			}

			setReseedSuccess(`✅ Database reseeded successfully with ${data.usersCount} users`);
			setReseedJson('');
			setShowReseedDialog(false);

			// Reload submissions
			setTimeout(() => {
				window.location.reload();
			}, 1500);
		} catch (e) {
			setReseedErr('Network error: ' + e.message);
		} finally {
			setReseedLoading(false);
		}
	}

	function openReseedDialog() {
		setShowReseedDialog(true);
		setReseedJson('');
		setReseedErr(null);
		setReseedSuccess(null);
	}

	function closeReseedDialog() {
		setShowReseedDialog(false);
		setReseedJson('');
		setReseedErr(null);
		setReseedSuccess(null);
	}

	function normalizeUrl(url) {
		if (!url) return '#';
		url = url.trim();
		if (url.startsWith('http://') || url.startsWith('https://')) return url;
		return 'https://' + url;
	}

	function renderDesc(d, submissionId) {
		if (!d) return null;
		try {
			const obj = JSON.parse(d);
			return (
				<div style={linksContainerStyle}>
					{obj.presentation && (
						<div style={linkItemStyle}>
							<span style={linkLabelStyle}>📊 Presentation:</span>
							<a href={normalizeUrl(obj.presentation)} target="_blank" rel="noreferrer" style={linkStyle}>
								{obj.presentation}
							</a>
						</div>
					)}
					{obj.github && (
						<div style={linkItemStyle}>
							<span style={linkLabelStyle}>💻 GitHub:</span>
							<a href={normalizeUrl(obj.github)} target="_blank" rel="noreferrer" style={linkStyle}>
								{obj.github}
							</a>
						</div>
					)}
					{obj.envVars && (
						<div style={linkItemStyle}>
							<span style={linkLabelStyle}>🔐 Environment Variables:</span>
							<button
								onClick={() => toggleEnv(submissionId)}
								style={toggleButtonStyle}
							>
								{expandedEnv[submissionId] ? '🙈 Hide' : '👁️ Show'}
							</button>
							{expandedEnv[submissionId] && (
								<pre style={envPreStyle}>{obj.envVars}</pre>
							)}
						</div>
					)}
					{obj.other && (
						<div style={linkItemStyle}>
							<span style={linkLabelStyle}>📎 Other:</span>
							<a href={normalizeUrl(obj.other)} target="_blank" rel="noreferrer" style={linkStyle}>
								{obj.other}
							</a>
						</div>
					)}
				</div>
			);
		} catch (e) {
			return <div style={{ color: '#ad1457' }}>{d}</div>;
		}
	}

	const cardStyle = {
		position: 'relative',
		overflow: 'hidden',
		background: 'linear-gradient(135deg, #fff5f7 0%, #ffe8f0 100%)',
		borderRadius: '16px',
		padding: '32px',
		boxShadow: '0 8px 32px rgba(255, 105, 180, 0.12)',
		border: '1px solid rgba(255, 182, 193, 0.3)'
	};

	const headerStyle = {
		display: 'flex',
		alignItems: 'center',
		gap: '12px',
		color: '#c2185b',
		marginBottom: '8px',
		fontSize: '28px',
		fontWeight: '600'
	};

	const descStyle = {
		color: '#ad1457',
		fontSize: '15px',
		marginBottom: '24px',
		lineHeight: '1.6'
	};

	const submissionStyle = {
		background: '#ffffff',
		borderRadius: '12px',
		padding: '24px',
		marginBottom: '20px',
		minWidth: '500px',
		border: '2px solid rgba(255, 182, 193, 0.3)',
		boxShadow: '0 4px 16px rgba(255, 105, 180, 0.08)',
		transition: 'all 0.3s ease'
	};

	const submissionTitleStyle = {
		color: '#c2185b',
		fontSize: '20px',
		fontWeight: '600',
		marginBottom: '8px'
	};

	const teamNameStyle = {
		color: '#f48fb1',
		fontSize: '14px',
		fontWeight: '500',
		marginLeft: '8px'
	};

	const timestampStyle = {
		color: '#ad1457',
		fontSize: '13px',
		marginBottom: '16px',
		opacity: 0.8
	};

	const linksContainerStyle = {
		marginTop: '12px'
	};

	const linkItemStyle = {
		marginBottom: '12px',
		padding: '10px',
		background: '#fce4ec',
		borderRadius: '8px',
		borderLeft: '4px solid #ec407a'
	};

	const linkLabelStyle = {
		color: '#880e4f',
		fontWeight: '600',
		fontSize: '14px',
		display: 'block',
		marginBottom: '4px'
	};

	const linkStyle = {
		color: '#d81b60',
		textDecoration: 'none',
		wordBreak: 'break-all',
		fontSize: '14px',
		display: 'block',
		marginTop: '4px'
	};

	const toggleButtonStyle = {
		background: 'linear-gradient(135deg, #ec407a 0%, #d81b60 100%)',
		color: 'white',
		border: 'none',
		borderRadius: '6px',
		padding: '6px 14px',
		fontSize: '12px',
		fontWeight: '600',
		cursor: 'pointer',
		marginTop: '6px',
		transition: 'all 0.2s ease'
	};

	const envPreStyle = {
		background: '#263238',
		color: '#aed581',
		padding: '16px',
		borderRadius: '8px',
		fontSize: '12px',
		fontFamily: 'monospace',
		overflow: 'auto',
		marginTop: '10px',
		maxHeight: '300px',
		border: '2px solid #ec407a'
	};

	const errorStyle = {
		background: '#ffebee',
		color: '#c62828',
		padding: '14px 18px',
		borderRadius: '10px',
		border: '1px solid #ef9a9a',
		fontSize: '14px',
		fontWeight: '500'
	};

	const loadingStyle = {
		color: '#ec407a',
		fontSize: '16px',
		textAlign: 'center',
		padding: '20px'
	};

	const emptyStyle = {
		color: '#ad1457',
		fontSize: '15px',
		textAlign: 'center',
		padding: '40px',
		background: '#fce4ec',
		borderRadius: '10px'
	};

	const listStyle = {
		display: 'flex',
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: '16px',
		maxHeight: '500px',
		overflowY: 'auto',
		paddingRight: '8px',
		justifyContent: 'center',
		alignItems: 'flex-start'
	};

	const reseedButtonStyle = {
		background: 'linear-gradient(135deg, #5e35b1 0%, #4527a0 100%)',
		color: 'white',
		border: 'none',
		borderRadius: '8px',
		padding: '10px 18px',
		fontSize: '14px',
		fontWeight: '600',
		cursor: 'pointer',
		marginBottom: '20px',
		transition: 'all 0.2s ease',
		boxShadow: '0 4px 12px rgba(94, 53, 177, 0.3)'
	};

	const dialogOverlayStyle = {
		position: 'fixed',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		background: 'rgba(0, 0, 0, 0.5)',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		zIndex: 1000
	};

	const dialogStyle = {
		background: 'white',
		borderRadius: '12px',
		padding: '24px',
		boxShadow: '0 16px 48px rgba(0, 0, 0, 0.2)',
		maxWidth: '600px',
		width: '90%',
		maxHeight: '80vh',
		overflowY: 'auto',
		zIndex: 1001
	};

	const dialogTitleStyle = {
		color: '#5e35b1',
		fontSize: '22px',
		fontWeight: '600',
		marginBottom: '16px'
	};

	const dialogDescStyle = {
		color: '#666',
		fontSize: '14px',
		marginBottom: '16px',
		lineHeight: '1.6'
	};

	const textareaStyle = {
		width: '100%',
		minHeight: '300px',
		padding: '12px',
		borderRadius: '8px',
		border: '2px solid #e0e0e0',
		fontFamily: 'monospace',
		fontSize: '12px',
		boxSizing: 'border-box',
		marginBottom: '16px',
		transition: 'border-color 0.2s ease'
	};

	const dialogButtonsStyle = {
		display: 'flex',
		gap: '12px',
		justifyContent: 'flex-end',
		marginTop: '20px'
	};

	const cancelButtonStyle = {
		background: '#e0e0e0',
		color: '#333',
		border: 'none',
		borderRadius: '6px',
		padding: '8px 16px',
		fontSize: '14px',
		fontWeight: '600',
		cursor: 'pointer',
		transition: 'all 0.2s ease'
	};

	const submitButtonStyle = {
		background: 'linear-gradient(135deg, #5e35b1 0%, #4527a0 100%)',
		color: 'white',
		border: 'none',
		borderRadius: '6px',
		padding: '8px 16px',
		fontSize: '14px',
		fontWeight: '600',
		cursor: 'pointer',
		transition: 'all 0.2s ease'
	};

	const dialogErrorStyle = {
		background: '#ffebee',
		color: '#c62828',
		padding: '12px',
		borderRadius: '6px',
		border: '1px solid #ef9a9a',
		fontSize: '13px',
		marginBottom: '16px',
		wordBreak: 'break-word'
	};

	const dialogSuccessStyle = {
		background: '#e8f5e9',
		color: '#2e7d32',
		padding: '12px',
		borderRadius: '6px',
		border: '1px solid #81c784',
		fontSize: '13px',
		marginBottom: '16px'
	};

	return (
		<div style={cardStyle}>
			<h2 style={headerStyle}>
				<img src={juryImg} alt="Jury" style={{ height: 36, verticalAlign: 'middle' }} />
				Jury Dashboard
			</h2>
			<p style={descStyle}>All team submissions are listed below for evaluation.</p>

			<button
				onClick={openReseedDialog}
				style={reseedButtonStyle}
				onMouseEnter={e => e.target.style.transform = 'translateY(-2px)'}
				onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
			>
				🔄 Reseed Database
			</button>

			{loading && <div style={loadingStyle}>⏳ Loading submissions...</div>}
			{err && <div style={errorStyle}>❌ {err}</div>}
			{!loading && !err && subs.length === 0 && <div style={emptyStyle}>📭 No submissions yet.</div>}

			<div style={listStyle}>
				{subs.map(s => (
					<div
						key={s.id}
						style={submissionStyle}
						onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
						onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
					>
						<h3 style={submissionTitleStyle}>
							{s.projectName}
							<small style={teamNameStyle}>by {s.teamName}</small>
						</h3>
						<div style={timestampStyle}>
							🕒 Submitted: {s.createdAt ? new Date(s.createdAt).toLocaleString() : 'n/a'}
						</div>
						{renderDesc(s.description, s.id)}
						{s.file && (
							<div style={{ ...linkItemStyle, marginTop: '12px' }}>
								<span style={linkLabelStyle}>📁 Attached File:</span>
								<a href={s.file} target="_blank" rel="noreferrer" style={linkStyle}>
									{s.file}
								</a>
							</div>
						)}
					</div>
				))}
			</div>

			{showReseedDialog && (
				<div style={dialogOverlayStyle} onClick={closeReseedDialog}>
					<div style={dialogStyle} onClick={e => e.stopPropagation()}>
						<h3 style={dialogTitleStyle}>🔄 Reseed Database</h3>
						<p style={dialogDescStyle}>
							Paste a JSON array of users to reseed the database. Each user must have "username", "password", and optionally "role" fields.
						</p>
						<p style={{ ...dialogDescStyle, color: '#5e35b1', fontWeight: '600' }}>
							⚠️ Important: Include a user with username "jury_user"
						</p>

						{reseedErr && <div style={dialogErrorStyle}>{reseedErr}</div>}
						{reseedSuccess && <div style={dialogSuccessStyle}>{reseedSuccess}</div>}

						<textarea
							value={reseedJson}
							onChange={e => setReseedJson(e.target.value)}
							placeholder={JSON.stringify([
								{ "username": "jury_user", "password": "xxxxxxx", "role": "jury" },
								{ "username": "hacker1", "password": "xxxxxx", "role": "hacker" }
							], null, 2)}
							style={textareaStyle}
							disabled={reseedLoading}
						/>

						<div style={dialogButtonsStyle}>
							<button
								onClick={closeReseedDialog}
								style={cancelButtonStyle}
								disabled={reseedLoading}
								onMouseEnter={e => e.target.style.background = '#d0d0d0'}
								onMouseLeave={e => e.target.style.background = '#e0e0e0'}
							>
								Cancel
							</button>
							<button
								onClick={handleReseed}
								style={submitButtonStyle}
								disabled={reseedLoading}
								onMouseEnter={e => !reseedLoading && (e.target.style.transform = 'translateY(-2px)')}
								onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
							>
								{reseedLoading ? '⏳ Processing...' : '✅ Reseed'}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}