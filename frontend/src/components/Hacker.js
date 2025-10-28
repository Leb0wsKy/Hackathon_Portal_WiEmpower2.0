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
		const description = JSON.stringify({ presentation, github, other });
		fd.append('description', description);

		try{
			setLoading(true);
			const res = await submitDeliverable(fd);
			if (res && res.id){
				setMsg('Submission successful');
				setPresentation(''); setGithub(''); setOther(''); setProjectName('');
			}else{
				setMsg(res.error || 'Submission failed');
			}
		}catch(err){
			setMsg('Network or server error');
		}finally{ setLoading(false); }
	}

		return (
			<div className="card" style={{position:'relative',overflow:'hidden'}}>
				<img src={logoBlanc} alt="WiEmpower" style={{position:'absolute',top:16,right:16,height:40,opacity:0.12,pointerEvents:'none'}} />
				<h2 style={{display:'flex',alignItems:'center',gap:12}}>
					<img src={hackerImg} alt="Hacker" style={{height:36,verticalAlign:'middle'}} />
					Hacker Dashboard
				</h2>
				<p>Submit your deliverables using the fields below.</p>
				{msg && <div className="notice">{msg}</div>}
				<form onSubmit={handleSubmit}>
					<label>
						Project name (optional — auto-derived from GitHub if left blank)
						<input value={projectName} onChange={e=>setProjectName(e.target.value)} placeholder="Project name" />
					</label>

					<label>
						Presentation link (required if no GitHub)
						<input value={presentation} onChange={e=>setPresentation(e.target.value)} placeholder="https://..." />
					</label>

					<label>
						GitHub repository link
						<input value={github} onChange={e=>setGithub(e.target.value)} placeholder="https://github.com/your/repo" />
					</label>

					<label>
						Other deliverables (optional)
						<input value={other} onChange={e=>setOther(e.target.value)} placeholder="https://..." />
					</label>

					<button type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit'}</button>
				</form>
			</div>
		);
	}
