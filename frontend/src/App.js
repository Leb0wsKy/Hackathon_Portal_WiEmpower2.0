import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Login from './components/Login';
import Hacker from './components/Hacker';
import Jury from './components/Jury';

import bg from './Assets/bg.jpg';
import logoWiempower from './Assets/logo_wiempower.png';
import logoGMC from './Assets/GMC.png';
import logoIEEE from './Assets/TunisiaSection.png';
import logoIEEE2 from './Assets/logo_ieee_supcom.png';
import logowie from './Assets/logo_wie.png';
import logosupcom from './Assets/supcom.png';



function App(){
	return (
		<div className="app" style={{
			minHeight: '100vh',
			minWidth: '100vw',
			background: `linear-gradient(180deg, #fce4ec 0%, #f8bbd0 100%)`,
			backgroundImage: `url(${bg})`,
			backgroundSize: 'cover',
			backgroundRepeat: 'no-repeat',
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'space-between',
		}}>
			<header style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8,margin:'32px 0 24px 0'}}>
				<img src={logoWiempower} alt="WiEmpower Logo" style={{height:150,marginBottom:8}} />
				<span style={{fontWeight:700,fontSize:40,letterSpacing:1,color:"rgba(82, 16, 78, 1)"}}>WiEmpower Hackathon Portal</span>
			</header>
			<div style={{flex:1,display:'flex',flexDirection:'column'}}>
				<Routes>
					<Route path="/" element={<Navigate to="/login" replace />} />
					<Route path="/login" element={<Login />} />
					<Route path="/hacker" element={<Hacker />} />
					<Route path="/jury" element={<Jury />} />
				</Routes>
			</div>
			<footer style={{display:'flex',justifyContent:'center',alignItems:'center',gap:32,padding:'15px 0 16px 0'}}>
				<img src={logoGMC} alt="GOMYCODE Logo" style={{height:20}} />
				<img src={logoIEEE} alt="IEEE Tunisia Section" style={{height:50}} />
				<img src={logosupcom} alt="IEEE Tunisia Section" style={{height:50}} />
				<img src={logoIEEE2} alt="IEEE Tunisia Section" style={{height:80}} />
				<img src={logowie} alt="IEEE Tunisia Section" style={{height:60}} />
			</footer>
		</div>
	);
}


export default App;