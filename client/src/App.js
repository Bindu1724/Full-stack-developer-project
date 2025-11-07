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
  

  useEffect(() => {
    // only initialize socket — do NOT load saved locations from backend
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
        setWeatherData({[city]: res.data });
      } else {
        setWeatherData({[city]: { error: res.data?.error || 'Invalid weather data' } });
      }
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.error || err.message;
      setWeatherData({ [city]: { error: msg } });
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
  
  try {
      // still save to backend if you want, but replace displayed locations
      await axios.post(`${API}/api/locations`, { city });
      setCityName('');
      // replace the locations array so only the newly searched city is shown
      setLocations([{ city }]);
      // fetch & display weather for the current search
      await fetchWeather(city);
    } catch (err) {
      const resp = err.response;
      const msg = resp?.data?.error || err.message;

      // If backend indicates the city already exists, treat as success:
      // load and display its weather instead of showing an error.
      const isDuplicate =
        resp?.status === 409 ||
        /already exists/i.test(msg) ||
        /duplicate/i.test(msg);

      if (isDuplicate) {
        setError('');
        setCityName('');
        setLocations([{ city }]);
        await fetchWeather(city);
        return;
      }

      setError(msg || 'Failed to add city');
      console.error('Add city error:', resp?.data || err.message || err);
    }
  };


  return (
    <div className="container mt-5" style={{ backgroundColor: '#000080', padding: '2rem', borderRadius: '15px', minHeight: '80vh', color: 'white' }}>
      <header className="d-flex align-items-center justify-content-center mb-5 mt-5" >
        <span className="display-6 me-3">🌤</span>
        <h1 className="h2 mb-0">Real-Time Weather Dashboard</h1>
      </header>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="mb-5">
        <div className="row g-4 justify-content-center">
          <div className="col-12 col-md-4">
            <div className="input-group justify-content-center">
              <input
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
                placeholder="Enter a city name"
                className="form-control form-control-md me-1"
              />
              <button onClick={handleAddCity} className="btn btn-warning btn-md fw-bold">
                Add
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Weather cards grid */}
      <div className="row" style={{ marginTop: '6rem' }}>

        {locations.map((loc) => {
          const name = loc.city ?? loc;
          const key = loc._id ?? name;
          const data = weatherData[name];

          return (
            <div key={key} className="d-flex justify-content-center ">
              <WeatherCard city={name} data={data} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
