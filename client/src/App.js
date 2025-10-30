import { useEffect, useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import WeatherCard from './weathercard';

const socket = io('http://localhost:5001');

function App() {
  const [locations, setLocations] = useState([]);
  const [weatherData, setWeatherData] = useState({});
  const [newCity, setNewCity] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5001/api/locations').then(res => {
      setLocations(res.data);
      res.data.forEach(loc => fetchWeather(loc.city));
    });

    socket.on('weatherUpdate', ({ city, data }) => {
      setWeatherData(prev => ({ ...prev, [city]: data }));
    });
  }, []);

  const fetchWeather = async (city) => {
    try{
      const res = await axios.get(`http://localhost:5001/api/weather?city=${city}`);
      return res.data;
    }catch(err){
      console.error(`Failed to fetch weather for ${city}:`, err.message || err);
    }
  };

  const handleAddCity = async () => {
    await axios.post('http://localhost:5001/api/locations', { city: newCity });
    fetchWeather(newCity);
    setLocations(prev => [...prev, { city: newCity }]);
    setNewCity('');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🌤️ Real-Time Weather Dashboard</h1>
      <input value={newCity} onChange={e => setNewCity(e.target.value)} placeholder="Add City" className="border p-2 mr-2" />
      <button onClick={handleAddCity} className="bg-blue-500 text-white px-4 py-2">Add</button>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {locations.map(loc => (
          <WeatherCard key={loc.city} city={loc.city} data={weatherData[loc.city]} />
        ))}
      </div>
    </div>
  );
}

export default App;