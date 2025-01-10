import { useState } from 'react';




const FarcasterStats = () => {
  const [fid, setFid] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/handle-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fid }),
      });
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: 'center', fontFamily: 'Arial, sans-serif', padding: '20px' }}>
      <h1>Farcaster Stats</h1>
      <input
        type="text"
        value={fid}
        onChange={(e) => setFid(e.target.value)}
        placeholder="Enter FID"
        style={{ padding: '10px', margin: '10px', borderRadius: '5px' }}
      />
      <button onClick={fetchData} style={{ padding: '10px 20px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '5px' }}>
        Fetch Data
      </button>
      {loading && <p>Loading...</p>}
      {data && (
        <div style={{ marginTop: '20px' }}>
          <h2>Results for {fid}</h2>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default FarcasterStats;
