import React, { useEffect, useState } from 'react';
import { fetchSubmissions } from '../api';
import juryImg from '../Assets/14700.png';

export default function Jury(){
	const [subs, setSubs] = useState([]);
	const [loading, setLoading] = useState(false);
	const [err, setErr] = useState(null);
	const [expandedEnv, setExpandedEnv] = useState({});

	useEffect(()=>{
		async function load(){
			setLoading(true);
			setErr(null);
			try{
				const res = await fetchSubmissions();
				if (Array.isArray(res)) setSubs(res);
				else if (res && res.submissions) setSubs(res.submissions);
				else setErr('Unexpected response');
			}catch(e){ setErr('Failed to fetch submissions'); }
			finally{ setLoading(false); }
		}
		load();
	}, []);

	function toggleEnv(id){
		setExpandedEnv(prev => ({...prev, [id]: !prev[id]}));
	}

	function renderDesc(d, submissionId){
		if (!d) return null;
		try{
			const obj = JSON.parse(d);
			return (
				<div style={linksContainerStyle}>
					{obj.presentation && (
						<div style={linkItemStyle}>
							<span style={linkLabelStyle}>📊 Presentation:</span>
							<a href={obj.presentation} target="_blank" rel="noreferrer" style={linkStyle}>
								{obj.presentation}
							</a>
						</div>
					)}
					{obj.github && (
						<div style={linkItemStyle}>
							<span style={linkLabelStyle}>💻 GitHub:</span>
							<a href={obj.github} target="_blank" rel="noreferrer" style={linkStyle}>
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
							<a href={obj.other} target="_blank" rel="noreferrer" style={linkStyle}>
								{obj.other}
							</a>
						</div>
					)}
				</div>
			);
		}catch(e){
			return <div style={{color:'#ad1457'}}>{d}</div>;
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

	const  listStyle = {
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

	return (
		<div style={cardStyle}>
			<h2 style={headerStyle}>
				<img src={juryImg} alt="Jury" style={{height:36,verticalAlign:'middle'}} />
				Jury Dashboard
			</h2>
			<p style={descStyle}>All team submissions are listed below for evaluation.</p>
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
							<div style={{...linkItemStyle, marginTop: '12px'}}>
								<span style={linkLabelStyle}>📁 Attached File:</span>
								<a href={s.file} target="_blank" rel="noreferrer" style={linkStyle}>
									{s.file}
								</a>
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	);
}