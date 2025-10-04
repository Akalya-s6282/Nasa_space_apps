from flask import Flask, jsonify, redirect
from flask_cors import CORS  # Add this line
import requests
from datetime import datetime, timedelta
from config import API_KEY
app = Flask(__name__)
CORS(app)
NASA_API_KEY = API_KEY  # Replace with your NASA API key


@app.route('/')
def index():
    return redirect('/api/asteroids')


@app.route('/api/asteroids')
def get_asteroids():
    # Get today's date and 7 days ahead
    start_date = datetime.now().strftime('%Y-%m-%d')
    end_date = (datetime.now() + timedelta(days=7)).strftime('%Y-%m-%d')
    
    # NASA NeoWs API endpoint
    url = f'https://api.nasa.gov/neo/rest/v1/feed?start_date={start_date}&end_date={end_date}&api_key={API_KEY}'
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        return jsonify(data['near_earth_objects'])
    except requests.RequestException as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)