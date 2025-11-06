import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import WeatherCard from './weathercard';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';


const API = 'http://localhost:5001';

function App() {
  const [locations, setLocations] = useState([]);
  const [weatherData, setWeatherData] = useState({});
  const [cityName, setCityName] = useState('');
  const [error, setError] = useState('');
  const socketRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${API}/api/locations`);
        setLocations(res.data || []);
        (res.data || []).forEach(loc => fetchWeather(loc.city));
      } catch (err) {
        setError('Failed to load locations');
        console.error(err);
      }
    })();

    socketRef.current = io(API);
    socketRef.current.on('weatherUpdate', ({ city, data }) => {
      setWeatherData(prev => ({ ...prev, [city]: data }));
    });

    return () => {
      socketRef.current?.off('weatherUpdate');
      socketRef.current?.disconnect();
    };
  }, []);

  const fetchWeather = async (city) => {
    try {
      const res = await axios.get(`${API}/api/weather/${encodeURIComponent(city)}`);
      // only set state if API returned expected object
      if (res.data && res.data.weather && res.data.main) {
        setWeatherData(prev => ({ ...prev, [city]: res.data }));
      } else {
        setWeatherData(prev => ({ ...prev, [city]: { error: res.data?.error || 'Invalid weather data' } }));
      }
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.error || err.message;
      setWeatherData(prev => ({ ...prev, [city]: { error: msg } }));
      console.error(`Failed to fetch weather for ${city}:`, err.response?.data || err.message || err);
    }
  };

  const handleAddCity = async () => {
    const city = cityName.trim();     //removes extra whitespaces
    if (!city)      //checks if city name is empty
      return setError(' Please enter a city name');
    setError('');   //clears previous error
    try {
      await axios.post(`${API}/api/locations`, { city });
      setCityName('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add city');
      console.error('Add city error:', err);
    }
  };

   return (
    <div className="container py-4">
      <header className="d-flex align-items-center mb-4">
        <span className="display-6 me-3">🌤</span>
        <h1 className="h4 mb-0">Real-Time Weather Dashboard</h1>
      </header>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="mb-4">
        <div className="row g-2 align-items-center">
          <div className="col-12 col-md-8">
            <div className="input-group">
              <input
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
                placeholder="Enter a city name"
                className="form-control"
              />
              <button onClick={handleAddCity} className="btn btn-primary">
                Add
              </button>
            </div>
          </div>
          <div className="col-12 col-md-4 text-md-end mt-2 mt-md-0">
            <small className="text-muted">Add city to track current weather</small>
          </div>
        </div>
      </div>

      <div className="row">
        {locations.length === 0 && (
          <div className="col-12">
            <div className="alert alert-info">No cities saved. Add a city to begin.</div>
          </div>
        )}

        {locations.map(loc => {
          const key = loc._id || loc.city;
          const data = weatherData[loc.city];

          if (!data) {
            return (
              <div key={key} className="col-12 col-sm-6 col-md-4 mb-3">
                <div className="card h-100">
                  <div className="card-body d-flex align-items-center justify-content-center">
                    <div className="spinner-border text-primary me-2" role="status" aria-hidden="true"></div>
                    <div>Loading {loc.city}...</div>
                  </div>
                </div>
              </div>
            );
          }

          if (data.error) {
            return (
              <div key={key} className="col-12 col-sm-6 col-md-4 mb-3">
                <div className="card h-100 border-danger">
                  <div className="card-body">
                    <h5 className="card-title">{loc.city}</h5>
                    <p className="text-danger mb-0">{data.error}</p>
                  </div>
                </div>
              </div>
            );
          }

          // If WeatherCard renders its own card markup, wrap it in a col.
          return (
            <div key={key} className="col-12 col-sm-6 col-md-4 mb-3">
              <WeatherCard city={loc.city} data={data} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;