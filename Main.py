from flask import Flask, jsonify
from flask_cors import CORS
import requests
import math
from datetime import datetime, timedelta
from config import API_KEY

app = Flask(__name__)
CORS(app)

NASA_API_KEY = API_KEY

@app.route('/api/asteroids')
def get_asteroids():
    start_date = datetime.now().strftime('%Y-%m-%d')
    end_date = (datetime.now() + timedelta(days=7)).strftime('%Y-%m-%d')

    url = f'https://api.nasa.gov/neo/rest/v1/feed?start_date={start_date}&end_date={end_date}&api_key={NASA_API_KEY}'

    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        neos = []

        for date in data['near_earth_objects']:
            for asteroid in data['near_earth_objects'][date]:
                # Estimate mass from diameter (assuming avg density ~2500 kg/m³)
                diameter_m = asteroid['estimated_diameter']['meters']['estimated_diameter_max']
                volume_m3 = (4/3) * 3.1416 * (diameter_m/2)**3
                mass_kg = 2500 * volume_m3

                # Velocity
                velocity_km_s = float(asteroid['close_approach_data'][0]['relative_velocity']['kilometers_per_second'])
                velocity_m_s = velocity_km_s * 1000

                # Kinetic energy in Joules
                impact_energy_j = 0.5 * mass_kg * velocity_m_s**2
                # Rough estimate of equivalent earthquake magnitude (log scale)
                earthquake_mag = 0.67 * (math.log10(impact_energy_j) - 4.4)

                neos.append({
                    "name": asteroid['name'],
                    "diameter_m": diameter_m,
                    "velocity_km_s": velocity_km_s,
                    "miss_distance_km": float(asteroid['close_approach_data'][0]['miss_distance']['kilometers']),
                    "approach_date": asteroid['close_approach_data'][0]['close_approach_date'],
                    "orbiting_body": asteroid['close_approach_data'][0]['orbiting_body'],
                    "is_hazardous": asteroid['is_potentially_hazardous_asteroid'],
                    "impact_energy_j": impact_energy_j,
                    "earthquake_mag": round(earthquake_mag, 2)
                })

        return jsonify(neos)

    except requests.RequestException as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
