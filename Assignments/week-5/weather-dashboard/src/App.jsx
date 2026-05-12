import { useState } from 'react';
import "./App.css";
import bgImage from "./assets/weather.jpg";

function App() {

  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getWeather = async () => {

    setLoading(true);
    setError("");

    try {

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${import.meta.env.VITE_API_KEY}&units=metric`
      );

      console.log(response);

      if (!response.ok) {
        throw new Error("City not found");
      }

      const data = await response.json();

      setWeather(data);

    } catch (err) {

      setError(err.message);

    }

    setLoading(false);
  };

  return (

    <div
      className="app"
      style={{
        backgroundImage: `url(${bgImage})`
      }}
    >

      <div className="container">

        <h1>Weather Dashboard</h1>

        <input
          type="text"
          placeholder="Enter city name"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />

        <button onClick={getWeather}>
          Search
        </button>

        {loading && (
          <p className="loading">
            Loading...
          </p>
        )}

        {error && (
          <p className="error">
            {error}
          </p>
        )}

        {weather && (
          <div className="weather-box">

            <h2>{weather.name}</h2>

            <p>
              🌡 Temperature: {weather.main.temp}°C
            </p>

            <p>
              ☁ Weather: {weather.weather[0].main}
            </p>

            <p>
              💧 Humidity: {weather.main.humidity}%
            </p>

            <p>
              🌬 Wind Speed: {weather.wind.speed} m/s
            </p>

          </div>
        )}

      </div>

    </div>
  );
}

export default App;