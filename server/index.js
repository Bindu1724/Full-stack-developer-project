const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const http = require('http');
const socketIo = require('socket.io');


const port = process.env.PORT || 5001;

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: 'http://localhost:3000' } });

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/weather_dashboard')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

console.log('OWM_API_KEY present?', !!process.env.OWM_API_KEY);
console.log('OWM_API_KEY preview:', process.env.OWM_API_KEY ? `${process.env.OWM_API_KEY.slice(0,4)}...` : 'missing');

const Location = mongoose.model('Location', new mongoose.Schema({
  city: { type: String, required: true, trim: true },
}));

app.post('/api/locations', async (req, res) => {
  try {
    const city = (req.body.city || '').trim();
    if (!city) return res.status(400).send({ error: 'City is required' });

    // case-insensitive duplicate check
    const exists = await Location.findOne({ city: new RegExp('^' + city + '$', 'i') });
    if (exists) return res.status(409).send({ error: 'City already exists' });

    const loc = new Location({ city });
    await loc.save();
    return res.status(201).send(loc);
  } catch (err) {
    console.error('POST /api/locations error:', err);
    return res.status(500).send({ error: 'Server error' });
  }
  
});


app.get('/api/locations', async (req, res) => {
  const locs = await Location.find();
  res.send(locs);
});

app.get('/api/weather/:city', async (req, res) => {
  try {
    const { city } = req.params.city;
    const apiKey = process.env.OWM_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'OpenWeather API key not configured on server' });

    const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
      params: { q: city, appid: apiKey, units: 'metric' },
      timeout: 10000
    });
    return res.json(response.data);
  } catch (err) {
    console.error('GET /api/weather error:', err.response?.data || err.message || err);
    const status = err.response?.status || 500;
    const message = err.response?.data?.message || 'Failed to fetch weather';
    return res.status(status).json({ error: message });
  }
});

setInterval(async () => {
  try {
    const locations = await Location.find();
    for (const loc of locations) {
      try {
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${loc.city}&appid=${process.env.OWM_API_KEY}&units=metric`, {
          timeout: 10000
        });
        io.emit('weatherUpdate', { city: loc.city, data: response.data });
      } catch (err) {
        console.error(`Failed to fetch weather for ${loc.city}:`, err.response?.data || err.message || err);
      }
    }
  } catch (err) {
    console.error('Weather update interval failed:', err);
  }
}, 60000);

server.listen(port, () => console.log(`Backend running on port ${port}`));
