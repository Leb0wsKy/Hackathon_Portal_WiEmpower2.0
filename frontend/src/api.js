const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:4000';


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