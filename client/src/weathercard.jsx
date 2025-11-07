export default function WeatherCard({ city, data }) {
  // show loading state while data is being fetched
  if (!data) {
    return (
      <div className="card h-100">
        <div className="card-body d-flex align-items-center justify-content-center">
          <div className="spinner-border text-primary me-2" role="status" aria-hidden="true"></div>
          <div>Loading {city}…</div>
        </div>
      </div>
    );
  }

  // show API error if present
  if (data.error) {
    return (
      <div className="card h-100 border-danger">
        <div className="card-body">
          <h5 className="card-title">{city}</h5>
          <p className="text-danger mb-0">{data.error}</p>
        </div>
      </div>
    );
  }

  // safe access using optional chaining and fallbacks
  const description = data?.weather?.[0]?.description ?? 'N/A';
  const temp = data?.main?.temp ?? 'N/A';

  return (
    <div className="card h-100 shadow-sm">
      <div className="card-body">
        <h5 className="card-title mb-2">{city}</h5>
        <p className="card-text text-capitalize mb-1">{description}</p>
        <p className="card-text mb-0">Temp: <strong>{temp}°C</strong></p>
      </div>
    </div>
  );
}

 
