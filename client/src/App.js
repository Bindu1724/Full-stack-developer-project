import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import WeatherCard from './weathercard';
import 'bootstrap/dist/css/bootstrap.min.css';

const API = 'http://localhost:5001';

function App() {
  const [locations, setLocations] = useState([]);
  const [weatherData, setWeatherData] = useState({});
  const [cityName, setCityName] = useState('');
  const [error, setError] = useState('');
  const socketRef = useRef(null);
  const [loadingAdd, setLoadingAdd] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${API}/api/locations`);
        setLocations(res.data || []);
        (res.data || []).forEach(loc => {
          const name = loc.city ?? loc;
          fetchWeather(name);
        });
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
  const city = cityName.trim();
  if (!city) {
    setError('Please enter a city name');
    return;
  }
  setError('');
  setLoadingAdd(true);
  try {
    // POST to your backend which will call the geocode endpoint
    await axios.post(`${API}/api/locations`, { city });
    setCityName('');
    // optimistic update: add new location and fetch weather
    setLocations(prev => {
      const exists = prev.some(p => (p.city ?? p).toLowerCase() === city.toLowerCase());
      if (exists) return prev;
      fetchWeather(city);
      return [...prev, { city }];
    });
  } catch (err) {
    // show useful message from backend or fallback
    setError(err.response?.data?.error || err.message || 'Failed to add city');
    console.error('Add city error:', err.response?.data || err.message || err);
  } finally {
    setLoadingAdd(false);
  }
};

  return (
    <div className="container">
      <header className="d-flex justify-content-center mb-5 mt-5">
        <span className="display-6 me-3">🌤</span>
        <h1 className="h2">Real-Time Weather Dashboard</h1>
      </header>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="mb-5">
        <div className="row g-4 justify-content-center">
          <div className="col-12 col-md-8">
            <div className="input-group justify-content-center">
              <input
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
                placeholder="Enter a city name"
                className="form-control form-control-lg me-1"
              />
              <button onClick={handleAddCity} className="btn btn-primary">
                Add
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Weather cards grid */}
      <div className="row">
        {locations.length === 0 && (
          <div className="col-12">
            <div className="alert alert-info">No cities saved. Add a city to begin.</div>
          </div>
        )}

        {locations.map((loc) => {
          const name = loc.city ?? loc;
          const key = loc._id ?? name;
          const data = weatherData[name];

          return (
            <div key={key} className="col-12 col-sm-6 col-md-4 mb-3">
              <WeatherCard city={name} data={data} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
