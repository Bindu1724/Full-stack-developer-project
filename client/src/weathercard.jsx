export default function WeatherCard({ city, data }) {
  if (!data || !data.weather || !data.main) {
    return (
      <div className="bg-red-100 p-4 rounded shadow text-red-700">
        <h2 className="text-xl font-bold">{city}</h2>
        <p>Weather data not available.</p>
      </div>
    );
  }

  return (
    <div className="bg-blue-100 p-4 rounded shadow">
      <h2 className="text-xl font-bold">{city}</h2>
      <p>{data.weather[0].description}</p>
      <p>Temp: {data.main.temp}°C</p>
    </div>
  );
}
