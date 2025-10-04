import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [asteroids, setAsteroids] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching data from backend...');
        const response = await fetch('http://localhost:5000/api/asteroids');
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Received data:', data);
        setAsteroids(data);
        setLoading(false);
      } catch (error) {
        console.error('Error details:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderContent = () => {
    if (loading) return <div className="loading">Loading asteroid data...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    return (
      <div className="asteroid-grid">
        {Object.entries(asteroids).map(([date, asteroidsForDate]) => (
          <div key={date} className="date-section">
            <h2>{new Date(date).toLocaleDateString()}</h2>
            <div className="asteroids-list">
              {asteroidsForDate.map(asteroid => (
                <div key={asteroid.id} className="asteroid-card">
                  <h3>{asteroid.name}</h3>
                  <p>Diameter: {(asteroid.estimated_diameter.meters.estimated_diameter_max).toFixed(2)} meters</p>
                  <p>Speed: {parseFloat(asteroid.close_approach_data[0].relative_velocity.kilometers_per_hour).toFixed(2)} km/h</p>
                  <p>Miss Distance: {parseFloat(asteroid.close_approach_data[0].miss_distance.kilometers).toFixed(2)} km</p>
                  <p className={asteroid.is_potentially_hazardous_asteroid ? 'hazardous' : 'safe'}>
                    {asteroid.is_potentially_hazardous_asteroid ? '⚠️ Potentially Hazardous' : '✅ Safe'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container">
      <h1>Asteroid Impact Simulation</h1>
      {renderContent()}
    </div>
  );
}

export default App;