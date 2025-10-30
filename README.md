# Full-stack-developer-project
Backend setup:

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

Frontend Setup:

Step 1: Create React App
npx create-react-app client
cd client

npm install axios socket.io-client: Installs two runtime dependencies
axios	          --  HTTP client for making API requests from the frontend (e.g., to your Express server or external APIs)
socket.io-client  --  Enables real-time communication from the frontend to a Socket.IO server

npm install -D tailwindcss postcss autoprefixer

tailwindcss	    -- Utility-first CSS framework for fast, responsive UI design
postcss	CSS     -- processor that lets you use plugins to transform styles
autoprefixer	-- PostCSS plugin that adds vendor prefixes to CSS (for cross-browser support)

npx tailwindcss init -p



