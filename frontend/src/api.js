// Use env var REACT_APP_API_BASE when available (CRA). Otherwise construct the base
// from the page hostname so the frontend will call the backend on the same machine
// IP (e.g. http://192.168.1.10:4000) which makes the app usable across the LAN.
// NOTE: for dev you can set HOST=0.0.0.0 (or create a .env with HOST=0.0.0.0)
// and set REACT_APP_API_BASE to your machine IP before starting the dev server.
const API_BASE = process.env.REACT_APP_API_BASE || "http://172.20.10.3:4000";


export async function login(username, password){
const res = await fetch(API_BASE + '/api/login', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ username, password })
});
return res.json();
}


export function getToken(){ return localStorage.getItem('token'); }
export function setToken(t){ localStorage.setItem('token', t); }
export function logout(){ localStorage.removeItem('token'); localStorage.removeItem('user'); }


export async function submitDeliverable(formData){
const token = getToken();
const res = await fetch(API_BASE + '/api/submissions', {
method: 'POST',
headers: { 'Authorization': 'Bearer ' + token },
body: formData
});
return res.json();
}


export async function fetchSubmissions(){
const token = getToken();
const res = await fetch(API_BASE + '/api/submissions', {
headers: { 'Authorization': 'Bearer ' + token }
});
return res.json();
}