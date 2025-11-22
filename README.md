## 🌦️ OpenWeather MERN App

A full-stack weather application built with the **MERN stack** (MongoDB, Express.js, React, Node.js) that fetches real-time weather data from the [OpenWeatherMap API](https://openweathermap.org/api).  
This project demonstrates **authentication, CRUD operations, API integration, and deployment** using modern cloud platforms.

## 🚀 Features
- 🌍 **Real-time Weather Data** via OpenWeatherMap API
- 📊 **Dashboard** to view and manage saved cities
- 🗄️ **MongoDB Atlas** for cloud-hosted database
- ⚡ **Express.js Backend** with RESTful APIs
- 🎨 **Responsive UI** built with React + Bootstrap
- ☁️ **Deployed on Vercel (frontend)** and **Render (backend)**

## 📂 Project Structure
# Backend setup:

mkdir server : Creates a new directory named server.
cd server : Changes the current working directory to server.

npm init -y : Initializes a new Node.js project by creating a package.json file. The -y flag automatically fills in default values (like name, version, etc.).

npm install express mongoose axios cors dotenv socket.io

express	 --  Web framework for building APIs and handling HTTP requests
mongoose -- ODM (Object Data Modeling) tool for MongoDB, simplifies database access
axios	 --  Promise-based HTTP client for making API calls (e.g., to external APIs)
cors	--   Middleware to enable Cross-Origin Resource Sharing
dotenv	 --  Loads environment variables from a .env file into process.env
socket.io -- Enables real-time, bi-directional communication (e.g., chat apps)

# Frontend Setup:

Step 1: Create React App
npx create-react-app client
cd client

npm install axios socket.io-client: Installs two runtime dependencies
axios	          --  HTTP client for making API requests from the frontend (e.g., to your Express server or external APIs)
socket.io-client  --  Enables real-time communication from the frontend to a Socket.IO server

npm install bootstrap

## Run Locally (make sure to run server and client separately in different terminals)
# Backend
cd server
npm start
 
# Frontend
cd client
npm start










