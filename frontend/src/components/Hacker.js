import React, { useState } from 'react';
import logoBlanc from '../Assets/logo_wiempower.png';
import hackerImg from '../Assets/1470.png';
import { submitDeliverable } from '../api';

export default function Hacker(){
	const stored = localStorage.getItem('user');
	const user = stored ? JSON.parse(stored) : null;
	const teamName = user ? user.username : '';

	const [presentation, setPresentation] = useState('');
	const [github, setGithub] = useState('');
	const [envVars, setEnvVars] = useState('');
	const [other, setOther] = useState('');
	const [projectName, setProjectName] = useState('');
	const [loading, setLoading] = useState(false);
	const [msg, setMsg] = useState(null);

	function deriveProjectNameFromGithub(url){
		try{
			const u = url.trim();
			if (!u) return '';
			const parts = u.split('/').filter(Boolean);
			return parts.length ? parts[parts.length-1] : u;
		}catch(e){ return '' }
	}

	async function handleSubmit(e){
		e.preventDefault();
		setMsg(null);

		if (!teamName){
			setMsg('You must be logged in to submit.');
			return;
		}

		if (!presentation && !github){
			setMsg('Please provide at least a presentation or github link.');
			return;
		}

		const derivedProject = projectName || deriveProjectNameFromGithub(github) || `project-${Date.now()}`;

		const fd = new FormData();
		fd.append('teamName', teamName);
		fd.append('projectName', derivedProject);
		const description = JSON.stringify({ presentation, github, envVars, other });
		fd.append('description', description);

		try{
			setLoading(true);
			const res = await submitDeliverable(fd);
			if (res && res.id){
				setMsg('Submission successful!');
				setPresentation(''); 
				setGithub(''); 
				setEnvVars('');
				setOther(''); 
				setProjectName('');
			}else{
				setMsg(res.error || 'Submission failed');
			}
		}catch(err){
			setMsg('Network or server error');
		}finally{ setLoading(false); }
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

	const labelStyle = {
		display: 'block',
		marginBottom: '20px',
		color: '#880e4f',
		fontSize: '14px',
		fontWeight: '500'
	};

	const inputStyle = {
		width: '100%',
		padding: '12px 16px',
		marginTop: '6px',
		border: '2px solid rgba(255, 182, 193, 0.4)',
		borderRadius: '10px',
		fontSize: '15px',
		transition: 'all 0.3s ease',
		background: '#ffffff',
		outline: 'none',
		boxSizing: 'border-box'
	};

	const textareaStyle = {
		...inputStyle,
		minHeight: '120px',
		fontFamily: 'monospace',
		fontSize: '13px',
		resize: 'vertical'
	};

	const buttonStyle = {
		width: '100%',
		padding: '14px 24px',
		background: loading ? '#f8bbd0' : 'linear-gradient(135deg, #ec407a 0%, #d81b60 100%)',
		color: 'white',
		border: 'none',
		borderRadius: '10px',
		fontSize: '16px',
		fontWeight: '600',
		cursor: loading ? 'not-allowed' : 'pointer',
		transition: 'all 0.3s ease',
		boxShadow: loading ? 'none' : '0 4px 16px rgba(236, 64, 122, 0.3)',
		marginTop: '8px'
	};

	const noticeStyle = {
		padding: '14px 18px',
		borderRadius: '10px',
		marginBottom: '20px',
		background: msg?.includes('successful') ? '#e8f5e9' : '#ffebee',
		color: msg?.includes('successful') ? '#2e7d32' : '#c62828',
		border: `1px solid ${msg?.includes('successful') ? '#a5d6a7' : '#ef9a9a'}`,
		fontSize: '14px',
		fontWeight: '500'
	};

	const descStyle = {
		color: '#ad1457',
		fontSize: '15px',
		marginBottom: '24px',
		lineHeight: '1.6'
	};

	return (
		<div style={cardStyle}>
			<img src={logoBlanc} alt="WiEmpower" style={{position:'absolute',top:16,right:16,height:40,opacity:0.08,pointerEvents:'none'}} />
			<h2 style={headerStyle}>
				<img src={hackerImg} alt="Hacker" style={{height:36,verticalAlign:'middle'}} />
				Hacker Dashboard
			</h2>
			<p style={descStyle}>Submit your deliverables using the fields below.</p>
			{msg && <div style={noticeStyle}>{msg}</div>}
			<form onSubmit={handleSubmit}>
				<label style={labelStyle}>
					Project name <span style={{color:'#f48fb1',fontWeight:'400'}}>(optional — auto-derived from GitHub if left blank)</span>
					<input 
						style={inputStyle}
						value={projectName} 
						onChange={e=>setProjectName(e.target.value)} 
						placeholder="My Awesome Project" 
						onFocus={e => e.target.style.borderColor = '#ec407a'}
						onBlur={e => e.target.style.borderColor = 'rgba(255, 182, 193, 0.4)'}
					/>
				</label>

				<label style={labelStyle}>
					Presentation link <span style={{color:'#ec407a',fontWeight:'600'}}>(required if no GitHub)</span>
					<input 
						style={inputStyle}
						value={presentation} 
						onChange={e=>setPresentation(e.target.value)} 
						placeholder="https://docs.google.com/presentation/..." 
						onFocus={e => e.target.style.borderColor = '#ec407a'}
						onBlur={e => e.target.style.borderColor = 'rgba(255, 182, 193, 0.4)'}
					/>
				</label>

				<label style={labelStyle}>
					GitHub repository link
					<input 
						style={inputStyle}
						value={github} 
						onChange={e=>setGithub(e.target.value)} 
						placeholder="https://github.com/username/repository" 
						onFocus={e => e.target.style.borderColor = '#ec407a'}
						onBlur={e => e.target.style.borderColor = 'rgba(255, 182, 193, 0.4)'}
					/>
				</label>

				<label style={labelStyle}>
					Environment variables <span style={{color:'#f48fb1',fontWeight:'400'}}>(optional — .env file contents)</span>
					<textarea 
						style={textareaStyle}
						value={envVars} 
						onChange={e=>setEnvVars(e.target.value)} 
						placeholder={'API_KEY=your_key_here\nDATABASE_URL=postgres://...\nPORT=3000'}
						onFocus={e => e.target.style.borderColor = '#ec407a'}
						onBlur={e => e.target.style.borderColor = 'rgba(255, 182, 193, 0.4)'}
					/>
				</label>

				<label style={labelStyle}>
					Other deliverables <span style={{color:'#f48fb1',fontWeight:'400'}}>(optional)</span>
					<input 
						style={inputStyle}
						value={other} 
						onChange={e=>setOther(e.target.value)} 
						placeholder="https://figma.com/..." 
						onFocus={e => e.target.style.borderColor = '#ec407a'}
						onBlur={e => e.target.style.borderColor = 'rgba(255, 182, 193, 0.4)'}
					/>
				</label>

				<button 
					type="submit" 
					disabled={loading}
					style={buttonStyle}
					onMouseEnter={e => !loading && (e.target.style.transform = 'translateY(-2px)')}
					onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
				>
					{loading ? 'Submitting...' : 'Submit Deliverables'}
				</button>
			</form>
		</div>
	);
}