import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import './App.css';

function App() {
  const [asteroids, setAsteroids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/asteroids');
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setAsteroids(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Scale asteroid distance to fit the 3D scene
  const scaleDistance = (km) => (km ? km / 1e6 : 0);

  return (
    <div className="container">
      <h1>Asteroid Impact Simulation</h1>

      {loading && <div className="loading">Loading asteroid data...</div>}
      {error && <div className="error">Error: {error}</div>}

      {!loading && !error && (
        <>
          {/* Asteroid Info Cards */}
          <div className="asteroid-grid">
            {asteroids.map((ast, idx) => (
              <div key={idx} className={`asteroid-card ${ast.is_hazardous ? 'hazardous' : 'safe'}`}>
                <h3>{ast.name}</h3>
                <p>Diameter: {(ast.diameter_m || 0).toFixed(2)} m</p>
                <p>Speed: {(parseFloat(ast.velocity_km_s) || 0).toFixed(2)} km/s</p>
                <p>Miss Distance: {(parseFloat(ast.miss_distance_km) || 0).toLocaleString()} km</p>
                <p>Impact Energy: {((ast.impact_energy_j || 0) / 1e15).toFixed(2)} PJ</p>
                <p>Equivalent EQ Magnitude: {ast.earthquake_mag || 'N/A'}</p>
                <p className={ast.is_hazardous ? 'hazardous-text' : 'safe-text'}>
                  {ast.is_hazardous ? '⚠️ Potentially Hazardous' : '✅ Safe'}
                </p>
              </div>
            ))}
          </div>

          {/* 3D Canvas */}
          <div className="canvas-container" style={{ height: '600px' }}>
            <Canvas camera={{ position: [0, 0, 50], fov: 60 }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} />
              <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />

              {/* Earth */}
              <mesh>
                <sphereGeometry args={[5, 32, 32]} />
                <meshStandardMaterial color="blue" />
              </mesh>

              {/* Asteroids */}
              {asteroids.map((ast, idx) => {
                const distance = scaleDistance(parseFloat(ast.miss_distance_km));
                const angle = (idx / asteroids.length) * Math.PI * 2;
                const x = distance * Math.cos(angle);
                const y = distance * Math.sin(angle);
                const z = (Math.random() - 0.5) * 10;

                return (
                  <mesh key={idx} position={[x, y, z]}>
                    <sphereGeometry args={[0.3, 16, 16]} />
                    <meshStandardMaterial color={ast.is_hazardous ? 'red' : 'gray'} />
                  </mesh>
                );
              })}

              <OrbitControls enableZoom={true} />
            </Canvas>
          </div>
        </>
      )}
    </div>
  );
}

export default App;


