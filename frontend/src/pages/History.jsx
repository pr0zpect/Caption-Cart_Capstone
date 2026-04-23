import { useState, useEffect } from 'react';

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setHistory(data);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const deleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this caption?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5001/api/history/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setHistory(history.filter(item => item.id !== id));
    } catch (err) {
      console.error('Error deleting item:', err);
    }
  };

  if (loading) return <div style={{ color: 'white', padding: '2rem' }}>Loading history...</div>;

  return (
    <div className="history-container">
      <h2 className="auth-title">Your Caption History</h2>
      {history.length === 0 ? (
        <p style={{ color: '#888' }}>No captions generated yet.</p>
      ) : (
        <div className="history-grid">
          {history.map(item => (
            <div key={item.id} className="history-card">
              <div>
                <p className="caption-text">{item.caption_text}</p>
                <p className="timestamp">{new Date(item.created_at).toLocaleString()}</p>
              </div>
              <div style={{ marginTop: '1rem' }}>
                <button className="btn-delete" onClick={() => deleteItem(item.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
