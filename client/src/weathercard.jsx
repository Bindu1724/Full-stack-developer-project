export default function WeatherCard({ city, data }) {
  return (
    <div className="bg-blue-100 p-4 rounded shadow">
      <h2 className="text-xl font-bold">{city}</h2>
      <p>{data.weather[0].description}</p>
      <p>Temp: {data.main.temp}°C</p>
    </div>
  );
}

 
