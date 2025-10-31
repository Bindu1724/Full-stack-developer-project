import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import WeatherCard from './weathercard';

const API = 'http://localhost:5001';

function App() {
  const [locations, setLocations] = useState([]);
  const [weatherData, setWeatherData] = useState({});
  const [newCity, setNewCity] = useState('');
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
    const city = newCity.trim();
    if (!city) return setError('Enter a city name');
    setError('');
    try {
      const res = await axios.post(`${API}/api/locations`, { city });
      setLocations(prev => [...prev, res.data]);
      await fetchWeather(city);
      setNewCity('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add city');
      console.error('Add city error:', err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🌤️ Real-Time Weather Dashboard</h1>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <div className="mb-4">
        <input value={newCity} onChange={e => setNewCity(e.target.value)} placeholder="Add City" className="border p-2 mr-2" />
        <button onClick={handleAddCity} className="bg-blue-500 text-white px-4 py-2">Add</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {locations.map(loc => {
          const data = weatherData[loc.city];
          // guard: only render WeatherCard when we have valid weather object
          if (!data) return <div key={loc._id || loc.city} className="bg-gray-100 p-4 rounded shadow">Loading {loc.city}...</div>;
          if (data.error) return <div key={loc._id || loc.city} className="bg-red-100 p-4 rounded shadow text-red-700">{loc.city}: {data.error}</div>;
          return <WeatherCard key={loc._id || loc.city} city={loc.city} data={data} />;
        })}
      </div>
    </div>
  );
}

export default App;