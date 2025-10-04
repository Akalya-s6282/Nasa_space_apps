import React, { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import "./App.css";

function Asteroid({ asteroid, onHover }) {
  return (
    <mesh
      position={[asteroid.position.x, asteroid.position.y, asteroid.position.z]}
      onPointerOver={(e) => onHover(asteroid)}
      onPointerOut={() => onHover(null)}
    >
      <sphereGeometry args={[0.3, 16, 16]} />
      <meshStandardMaterial color={asteroid.is_hazardous ? "red" : "gray"} />
    </mesh>
  );
}

function App() {
  const [asteroids, setAsteroids] = useState([]);
  const [hoveredAsteroid, setHoveredAsteroid] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/asteroids")
      .then((res) => res.json())
      .then(setAsteroids)
      .catch(console.error);
  }, []);

  return (
    <div className="container">
      <h1>🌍 Asteroid Visualization</h1>
      <div className="canvas-container" style={{ height: "700px" }}>
        <Canvas camera={{ position: [0, 0, 30], fov: 60 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <Stars radius={100} depth={50} count={4000} factor={4} fade />
          <OrbitControls />

          {/* Earth */}
          <mesh>
            <sphereGeometry args={[3, 32, 32]} />
            <meshStandardMaterial color="blue" />
          </mesh>

          {/* Asteroids */}
          {asteroids.map((a, i) => (
            <Asteroid key={i} asteroid={a} onHover={setHoveredAsteroid} />
          ))}
        </Canvas>
      </div>

      {hoveredAsteroid && (
        <div className="info-card">
          <h2>{hoveredAsteroid.name}</h2>
          <p>Diameter: {hoveredAsteroid.diameter_m.toFixed(2)} m</p>
          <p>Speed: {hoveredAsteroid.velocity_km_s.toFixed(2)} km/s</p>
          <p>Miss Distance: {hoveredAsteroid.miss_distance_km.toLocaleString()} km</p>
          <p>Impact Energy: {(hoveredAsteroid.impact_energy_j / 1e15).toFixed(2)} PJ</p>
          <p>Earthquake Mag: {hoveredAsteroid.earthquake_mag}</p>
          <p>
            Status:{" "}
            {hoveredAsteroid.is_hazardous ? "⚠️ Hazardous" : "✅ Safe"}
          </p>
        </div>
      )}
    </div>
  );
}

export default App;