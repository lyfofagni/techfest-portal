import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, NavLink } from 'react-router-dom';
import Gallery from './Gallery';

const API = import.meta.env.VITE_API_URL;

function Home() {
  return (
    <>
      <section className="hero">
        <span className="badge">MBCET · 14–16 October 2026</span>
        <h1>TechFest 2026</h1>
        <p>Workshops, hackathons and talks, all in one place. Register to take part.</p>
        <div className="actions">
          <Link to="/register" className="btn">Register now</Link>
          <Link to="/gallery" className="btn ghost">View gallery</Link>
        </div>
      </section>
      <div className="grid3">
        <div className="card"><h3>Workshops</h3><p>Hands-on sessions to learn new tools and skills.</p></div>
        <div className="card"><h3>Hackathon</h3><p>Build, test and present your idea with your team.</p></div>
        <div className="card"><h3>Tech Talks</h3><p>Hear from speakers about what is next in tech.</p></div>
      </div>
    </>
  );
}

function Auth({ mode }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [msg, setMsg] = useState({ text: '', ok: true });

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/api/${mode}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      setMsg({ text: res.ok ? (data.message || 'Registered!') : data.error, ok: res.ok });
    } catch {
      setMsg({ text: 'Cannot reach the server', ok: false });
    }
  };

  return (
    <div className="card form-card">
      <h2>{mode === 'login' ? 'Login' : 'Register'}</h2>
      <form onSubmit={submit}>
        {mode === 'register' && (
          <input placeholder="Name" onChange={e => setForm({ ...form, name: e.target.value })} />
        )}
        <input placeholder="Email" onChange={e => setForm({ ...form, email: e.target.value })} />
        <input type="password" placeholder="Password" onChange={e => setForm({ ...form, password: e.target.value })} />
        <button type="submit" className="btn">{mode === 'login' ? 'Login' : 'Register'}</button>
        <p className={`msg ${msg.ok ? 'ok' : 'err'}`}>{msg.text}</p>
      </form>
    </div>
  );
}

function Feedback() {
  const [text, setText] = useState('');
  const [list, setList] = useState([]);

  const load = () =>
    fetch(`${API}/api/feedback`).then(r => r.json()).then(setList);

  useEffect(() => { load(); }, []);

  const send = async (e) => {
    e.preventDefault();
    await fetch(`${API}/api/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    });
    setText('');
    load();
  };

  return (
    <div>
      <h2>Feedback</h2>
      <form onSubmit={send} className="row">
        <input value={text} onChange={e => setText(e.target.value)} placeholder="Your feedback" />
        <button type="submit" className="btn">Send</button>
      </form>
      {list.map(f => (
        // VULNERABLE on purpose: renders user text as HTML
        <p key={f._id} className="feedback-item">{f.message}</p>
      ))}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <nav className="nav">
        <Link to="/" className="brand">Tech<span>Fest</span> 2026</Link>
        <div className="nav-links">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>Home</NavLink>
          <NavLink to="/gallery" className={({ isActive }) => (isActive ? 'active' : '')}>Gallery</NavLink>
          <NavLink to="/feedback" className={({ isActive }) => (isActive ? 'active' : '')}>Feedback</NavLink>
          <NavLink to="/register" className={({ isActive }) => (isActive ? 'active' : '')}>Register</NavLink>
          <NavLink to="/login" className={({ isActive }) => (isActive ? 'active' : '')}>Login</NavLink>
        </div>
      </nav>
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/register" element={<Auth mode="register" />} />
          <Route path="/login" element={<Auth mode="login" />} />
        </Routes>
      </main>
      <footer className="footer">© 2026 TechFest · MBCET</footer>
    </BrowserRouter>
  );
}