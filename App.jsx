import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [view, setView] = useState('all-trips'); 
  const [data, setData] = useState([]);
  // New state to track which user is logged in
  const [loggedUserId, setLoggedUserId] = useState(null);

  const sections = [
    { id: 'all-trips', title: 'Departures', icon: '🚍' },
    { id: 'routes', title: 'Routes', icon: '📍' },
    { id: 'bookings', title: 'Bookings', icon: '🎟️' },
    { id: 'vehicles', title: 'Vehicles', icon: '🚐' },
    { id: 'trips', title: 'Amenities', icon: '✨' }
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // POST request to verify user
      const response = await axios.post('http://localhost:5000/api/login', { username, password });
      
      // We assume your backend now sends { message: "...", user_id: X }
      const uid = response.data.user_id; 
      setLoggedUserId(uid);
      setIsLoggedIn(true);
      
      // Load the first table using the specific user's ID
      loadTable('all-trips', uid); 
    } catch (err) {
      alert("Login Failed: User not found or incorrect password.");
    }
  };

  const loadTable = async (endpoint, uid = loggedUserId) => {
    try {
      // We pass the userId as a query parameter so the backend can filter the SQL results
      const res = await axios.get(`http://localhost:5000/api/${endpoint}?userId=${uid}`);
      setData(res.data);
      setView(endpoint);
    } catch (err) {
      console.error("Error fetching " + endpoint, err);
      setData([]); 
    }
  };

  if (!isLoggedIn) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#2c3e50' }}>
        <form onSubmit={handleLogin} style={{ background: 'white', padding: '40px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>Transport System Login</h2>
          <input type="text" placeholder="Username" onChange={e => setUsername(e.target.value)} style={{ display: 'block', width: '250px', padding: '12px', margin: '10px auto', borderRadius: '5px', border: '1px solid #ddd' }} required />
          <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} style={{ display: 'block', width: '250px', padding: '12px', margin: '10px auto', borderRadius: '5px', border: '1px solid #ddd' }} required />
          <button type="submit" style={{ width: '100%', padding: '12px', background: '#3498db', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Login</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif', backgroundColor: '#f4f7f6' }}>
      
      {/* SIDEBAR */}
      <div style={{ width: '260px', backgroundColor: '#2c3e50', color: '#ecf0f1', padding: '25px 15px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '0 15px 20px 15px', borderBottom: '1px solid #34495e', marginBottom: '25px' }}>
          <h2 style={{ fontSize: '1.4rem', margin: 0, color: '#3498db' }}>TMS Admin</h2>
        </div>

        {sections.map(s => (
          <div 
            key={s.id} 
            onClick={() => loadTable(s.id)}
            style={{ 
              padding: '15px', cursor: 'pointer', borderRadius: '8px', marginBottom: '10px',
              backgroundColor: view === s.id ? '#3498db' : 'transparent',
              transition: '0.3s', display: 'flex', alignItems: 'center'
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>{s.icon}</span>
            <span style={{ marginLeft: '15px' }}>{s.title}</span>
          </div>
        ))}

        <button onClick={() => {setIsLoggedIn(false); setLoggedUserId(null);}} style={{ marginTop: 'auto', background: '#e74c3c', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer' }}>Sign Out</button>
      </div>

      {/* CONTENT AREA */}
      <div style={{ flex: 1, padding: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '35px' }}>
          <div>
            <h1 style={{ margin: 0, color: '#2c3e50', textTransform: 'capitalize' }}>{view.replace('-', ' ')}</h1>
            <p style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>Showing data specifically for User ID: {loggedUserId}</p>
          </div>
          <span style={{ backgroundColor: '#d1f2eb', color: '#16a085', padding: '5px 15px', borderRadius: '20px', fontWeight: 'bold' }}>
            User: {username}
          </span>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa', color: '#7f8c8d', textAlign: 'left', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                {data.length > 0 && Object.keys(data[0]).map(key => (
                  <th key={key} style={{ padding: '18px 25px', borderBottom: '2px solid #eee' }}>{key.replace('_', ' ')}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f1f1' }}>
                  {Object.values(row).map((val, j) => (
                    <td key={j} style={{ padding: '18px 25px', color: '#333' }}>{val}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {data.length === 0 && <div style={{ padding: '60px', textAlign: 'center', color: '#bdc3c7' }}>No private records found for this section.</div>}
        </div>
      </div>
    </div>
  );
}

export default App;
