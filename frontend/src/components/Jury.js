import React, { useEffect, useState } from 'react';
import { fetchSubmissions } from '../api';
import logoIEEEVert from '../Assets/TunisiaSection.png';
import juryImg from '../Assets/14700.png';

export default function Jury(){
	const [subs, setSubs] = useState([]);
	const [loading, setLoading] = useState(false);
	const [err, setErr] = useState(null);

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

	function renderDesc(d){
		if (!d) return null;
		try{
			const obj = JSON.parse(d);
			return (
				<div className="links">
					{obj.presentation && <div>Presentation: <a href={obj.presentation} target="_blank" rel="noreferrer">{obj.presentation}</a></div>}
					{obj.github && <div>GitHub: <a href={obj.github} target="_blank" rel="noreferrer">{obj.github}</a></div>}
					{obj.other && <div>Other: <a href={obj.other} target="_blank" rel="noreferrer">{obj.other}</a></div>}
				</div>
			);
		}catch(e){
			return <div>{d}</div>;
		}
	}

		return (
			<div className="card" style={{position:'relative',overflow:'hidden'}}>
				<img src={logoIEEEVert} alt="IEEE Jury" style={{position:'absolute',top:16,right:16,height:40,opacity:0.10,pointerEvents:'none'}} />
				<h2 style={{display:'flex',alignItems:'center',gap:12}}>
					<img src={juryImg} alt="Jury" style={{height:36,verticalAlign:'middle'}} />
					Jury Dashboard
				</h2>
				<p>All team submissions are listed below.</p>
				{loading && <div>Loading...</div>}
				{err && <div className="error">{err}</div>}
				{!loading && !err && subs.length === 0 && <div>No submissions yet.</div>}

				<div className="submissions">
					{subs.map(s => (
						<div key={s.id} className="submission">
							<h3>{s.projectName} <small>by {s.teamName}</small></h3>
							<div>Submitted: {s.createdAt ? new Date(s.createdAt).toLocaleString() : 'n/a'}</div>
							{renderDesc(s.description)}
							{s.file && <div>File: <a href={s.file} target="_blank" rel="noreferrer">{s.file}</a></div>}
						</div>
					))}
				</div>
			</div>
		);
	}
