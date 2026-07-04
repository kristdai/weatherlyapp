const weatherForm = document.getElementById("weather-form");
const apiKeyInput = document.getElementById("apiKey");
const cityInput = document.getElementById("city");
const countryInput = document.getElementById("country");
const submitButton = weatherForm.querySelector("button[type='submit']");
const formMessage = document.getElementById("form-message");
const emptyState = document.getElementById("empty-state");
const weatherCard = document.getElementById("weather-card");
const locationName = document.getElementById("location-name");
const weatherIcon = document.getElementById("weather-icon");
const temperature = document.getElementById("temperature");
const condition = document.getElementById("condition");
const conditionDescription = document.getElementById("condition-description");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("wind-speed");

const WEATHER_ENDPOINT = "https://api.openweathermap.org/data/2.5/weather";

function setMessage(message, type = "") {
  formMessage.textContent = message;
  formMessage.className = "form-message";

  if (type) {
    formMessage.classList.add(type);
  }
}

function showWeatherCard() {
  emptyState.classList.add("hidden");
  weatherCard.classList.remove("hidden");
}

function showEmptyState() {
  weatherCard.classList.add("hidden");
  emptyState.classList.remove("hidden");
}

function capitalizeWords(value) {
  return value.replace(/\b\w/g, (character) => character.toUpperCase());
}

function renderWeather(data) {
  const iconCode = data.weather[0].icon;
  const city = data.name;
  const countryCode = data.sys.country;

  locationName.textContent = `${city}, ${countryCode}`;
  weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  weatherIcon.alt = data.weather[0].description;
  temperature.textContent = `${Math.round(data.main.temp)}°C`;
  condition.textContent = data.weather[0].main;
  conditionDescription.textContent = capitalizeWords(data.weather[0].description);
  humidity.textContent = `${data.main.humidity}%`;
  windSpeed.textContent = `${data.wind.speed.toFixed(1)} m/s`;

  showWeatherCard();
}

async function fetchWeather(apiKey, city, country) {
  const query = `${city},${country}`;
  const requestUrl = `${WEATHER_ENDPOINT}?q=${encodeURIComponent(query)}&appid=${encodeURIComponent(apiKey)}&units=metric`;

  const response = await fetch(requestUrl);
  const data = await response.json();

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("No matching location was found. Check the city and country and try again.");
    }

    if (response.status === 401) {
      throw new Error("The API key was rejected. Confirm your OpenWeatherMap key and try again.");
    }

    throw new Error(data.message ? capitalizeWords(data.message) : "Unable to load weather data right now.");
  }

  return data;
}

weatherForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const apiKey = apiKeyInput.value.trim();
  const city = cityInput.value.trim();
  const country = countryInput.value.trim();

  if (!apiKey || !city || !country) {
    setMessage("Enter an API key, city, and country before requesting weather.", "error");
    showEmptyState();
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Loading...";
  setMessage("Fetching current weather...", "success");

  try {
    const data = await fetchWeather(apiKey, city, country);
    renderWeather(data);
    setMessage(`Updated weather for ${data.name}.`, "success");
  } catch (error) {
    showEmptyState();
    setMessage(
      error instanceof Error ? error.message : "A network error occurred while fetching weather data.",
      "error"
    );
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Get Weather";
  }
});
