import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [platform, setPlatform] = useState('instagram');
  const [tone, setTone] = useState('casual');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!preview) return alert('Please upload an image first');
    setLoading(true);
    try {
      // 1. Generate from Flask AI Server
      const aiRes = await fetch('http://localhost:5005/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          image: preview,
          platform,
          tone
        })
      });
      const aiData = await aiRes.json();
      
      if (aiRes.ok) {
        const generatedCaption = aiData.captions[0];
        setResult(aiData);

        // 2. Save to History (Node.js Backend)
        const token = localStorage.getItem('token');
        await fetch('http://localhost:5001/api/history', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            caption_text: generatedCaption,
            image_url: null // You could store base64 or upload to S3 here
          })
        });
      } else {
        alert(aiData.error || 'AI Generation failed');
      }
    } catch (err) {
      alert('Error connecting to AI server. Make sure Flask app.py is running on port 5000');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', color: 'white', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0 }}>CaptionCraft AI</h1>
          <p style={{ color: '#888' }}>Welcome back, {user?.name}</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/history" style={{ color: '#e50914', textDecoration: 'none', fontWeight: 'bold' }}>History</Link>
          <button onClick={logout} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>Logout</button>
        </div>
      </header>

      <div style={{ background: '#1c1c1e', padding: '2rem', borderRadius: '16px' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Upload Image</label>
          <input type="file" onChange={handleImageChange} accept="image/*" />
        </div>

        {preview && (
          <div style={{ marginBottom: '1.5rem' }}>
            <img src={preview} alt="Preview" style={{ maxWidth: '100%', borderRadius: '8px', maxHeight: '300px' }} />
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Platform</label>
            <select 
              className="form-input" 
              value={platform} 
              onChange={(e) => setPlatform(e.target.value)}
            >
              <option value="instagram">Instagram</option>
              <option value="twitter">Twitter</option>
              <option value="linkedin">LinkedIn</option>
              <option value="tiktok">TikTok</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Tone</label>
            <select 
              className="form-input" 
              value={tone} 
              onChange={(e) => setTone(e.target.value)}
            >
              <option value="casual">Casual</option>
              <option value="funny">Funny</option>
              <option value="professional">Professional</option>
              <option value="aesthetic">Aesthetic</option>
            </select>
          </div>
        </div>

        <button 
          className="btn-primary" 
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate Caption'}
        </button>

        {result && (
          <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#333', borderRadius: '8px' }}>
            <h3 style={{ marginTop: 0 }}>Generated Captions:</h3>
            {result.captions.map((cap, i) => (
              <div key={i} style={{ marginBottom: '1rem', padding: '10px', borderLeft: '4px solid #e50914', background: '#222' }}>
                {cap}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
