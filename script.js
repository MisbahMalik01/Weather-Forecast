// DOM Elements
const locationInput = document.getElementById('location-input');
const searchBtn = document.getElementById('search-btn');
const currentLocationBtn = document.getElementById('current-location-btn');
const cityNameElement = document.getElementById('city-name');
const currentDateElement = document.getElementById('current-date');
const mainWeatherIcon = document.getElementById('main-weather-icon');
const mainTemperature = document.getElementById('main-temperature');
const weatherCondition = document.getElementById('weather-condition');
const feelsLike = document.getElementById('feels-like');
const celsiusBtn = document.getElementById('celsius-btn');
const fahrenheitBtn = document.getElementById('fahrenheit-btn');
const hourlyContainer = document.getElementById('hourly-container');
const dailyContainer = document.getElementById('daily-container');
const loadingElement = document.getElementById('loading');
const errorElement = document.getElementById('error-message');
const errorText = document.getElementById('error-text');

// Weather details elements
const visibilityElement = document.getElementById('visibility');
const humidityElement = document.getElementById('humidity');
const windSpeedElement = document.getElementById('wind-speed');
const pressureElement = document.getElementById('pressure');
const uvIndexElement = document.getElementById('uv-index');
const cloudsElement = document.getElementById('clouds');

// Global variables
let currentWeatherData = null;
let currentUnit = 'celsius'; // 'celsius' or 'fahrenheit'
let currentLocation = null;

// Weather icon mapping
const weatherIcons = {
    '01d': 'fas fa-sun',
    '01n': 'fas fa-moon',
    '02d': 'fas fa-cloud-sun',
    '02n': 'fas fa-cloud-moon',
    '03d': 'fas fa-cloud',
    '03n': 'fas fa-cloud',
    '04d': 'fas fa-cloud',
    '04n': 'fas fa-cloud',
    '09d': 'fas fa-cloud-rain',
    '09n': 'fas fa-cloud-rain',
    '10d': 'fas fa-cloud-sun-rain',
    '10n': 'fas fa-cloud-moon-rain',
    '11d': 'fas fa-bolt',
    '11n': 'fas fa-bolt',
    '13d': 'fas fa-snowflake',
    '13n': 'fas fa-snowflake',
    '50d': 'fas fa-smog',
    '50n': 'fas fa-smog'
};

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    updateCurrentDate();
    setupEventListeners();
    
    // Set up placeholder data
    displayPlaceholderData();
});

// Event Listeners
function setupEventListeners() {
    searchBtn.addEventListener('click', handleSearch);
    currentLocationBtn.addEventListener('click', getCurrentLocation);
    locationInput.addEventListener('keypress', handleEnterKey);
    celsiusBtn.addEventListener('click', () => switchTemperatureUnit('celsius'));
    fahrenheitBtn.addEventListener('click', () => switchTemperatureUnit('fahrenheit'));
}

// Handle search functionality
function handleSearch() {
    const location = locationInput.value.trim();
    if (location) {
        searchWeather(location);
    } else {
        showError('Please enter a location');
    }
}

// Handle Enter key press in search input
function handleEnterKey(event) {
    if (event.key === 'Enter') {
        handleSearch();
    }
}

// Get current location using geolocation API
function getCurrentLocation() {
    if (navigator.geolocation) {
        showLoading();
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                getWeatherByCoordinates(lat, lon);
            },
            (error) => {
                hideLoading();
                showError('Unable to get your location. Please search manually.');
                console.error('Geolocation error:', error);
            }
        );
    } else {
        showError('Geolocation is not supported by this browser');
    }
}

// Search weather by location name
async function searchWeather(location) {
    try {
        showLoading();
        
        // This is a placeholder - you'll need to implement actual API calls
        // For now, we'll simulate API call with sample data
        setTimeout(() => {
            const sampleData = generateSampleWeatherData(location);
            displayWeatherData(sampleData);
            hideLoading();
        }, 1000);
        
    } catch (error) {
        hideLoading();
        showError('Unable to fetch weather data');
        console.error('Weather search error:', error);
    }
}

// Get weather by coordinates
async function getWeatherByCoordinates(lat, lon) {
    try {
        // This is a placeholder - you'll need to implement actual API calls
        // For now, we'll simulate API call with sample data
        setTimeout(() => {
            const sampleData = generateSampleWeatherData('Current Location');
            displayWeatherData(sampleData);
            hideLoading();
        }, 1000);
        
    } catch (error) {
        hideLoading();
        showError('Unable to fetch weather data');
        console.error('Weather coordinates error:', error);
    }
}

// Generate sample weather data for demonstration
function generateSampleWeatherData(location) {
    return {
        location: location,
        current: {
            temperature: 22,
            condition: 'Partly Cloudy',
            icon: '02d',
            feelsLike: 25,
            humidity: 65,
            windSpeed: 15,
            pressure: 1013,
            visibility: 10,
            uvIndex: 6,
            clouds: 40
        },
        hourly: Array.from({length: 12}, (_, i) => ({
            time: new Date(Date.now() + i * 3600000),
            temperature: Math.round(20 + Math.random() * 10),
            icon: ['01d', '02d', '03d', '04d'][Math.floor(Math.random() * 4)]
        })),
        daily: Array.from({length: 5}, (_, i) => ({
            date: new Date(Date.now() + i * 86400000),
            high: Math.round(25 + Math.random() * 10),
            low: Math.round(15 + Math.random() * 8),
            condition: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy'][Math.floor(Math.random() * 4)],
            icon: ['01d', '02d', '03d', '09d'][Math.floor(Math.random() * 4)]
        }))
    };
}

// Display weather data
function displayWeatherData(data) {
    currentWeatherData = data;
    currentLocation = data.location;
    
    // Update location info
    cityNameElement.textContent = data.location;
    
    // Update current weather
    mainTemperature.textContent = `${convertTemperature(data.current.temperature)}°`;
    weatherCondition.textContent = data.current.condition;
    feelsLike.textContent = `Feels like ${convertTemperature(data.current.feelsLike)}°`;
    
    // Update weather icon
    const iconClass = weatherIcons[data.current.icon] || 'fas fa-question';
    mainWeatherIcon.className = iconClass;
    
    // Update weather details
    visibilityElement.textContent = `${data.current.visibility} km`;
    humidityElement.textContent = `${data.current.humidity}%`;
    windSpeedElement.textContent = `${data.current.windSpeed} km/h`;
    pressureElement.textContent = `${data.current.pressure} hPa`;
    uvIndexElement.textContent = data.current.uvIndex;
    cloudsElement.textContent = `${data.current.clouds}%`;
    
    // Update forecasts
    displayHourlyForecast(data.hourly);
    displayDailyForecast(data.daily);
    
    // Clear search input
    locationInput.value = '';
}

// Display hourly forecast
function displayHourlyForecast(hourlyData) {
    hourlyContainer.innerHTML = '';
    
    hourlyData.forEach(hour => {
        const hourElement = document.createElement('div');
        hourElement.className = 'hourly-item';
        
        const timeString = hour.time.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            hour12: true 
        });
        
        const iconClass = weatherIcons[hour.icon] || 'fas fa-question';
        
        hourElement.innerHTML = `
            <span class="hour">${timeString}</span>
            <i class="${iconClass} weather-icon-small"></i>
            <span class="hourly-temp">${convertTemperature(hour.temperature)}°</span>
        `;
        
        hourlyContainer.appendChild(hourElement);
    });
}

// Display daily forecast
function displayDailyForecast(dailyData) {
    dailyContainer.innerHTML = '';
    
    dailyData.forEach((day, index) => {
        const dayElement = document.createElement('div');
        dayElement.className = 'daily-item';
        
        const dayName = index === 0 ? 'Today' : day.date.toLocaleDateString('en-US', { weekday: 'short' });
        const iconClass = weatherIcons[day.icon] || 'fas fa-question';
        
        dayElement.innerHTML = `
            <span class="day">${dayName}</span>
            <i class="${iconClass} weather-icon-small"></i>
            <span class="daily-desc">${day.condition}</span>
            <span class="daily-temp">
                <span class="high">${convertTemperature(day.high)}°</span>
                <span class="low">${convertTemperature(day.low)}°</span>
            </span>
        `;
        
        dailyContainer.appendChild(dayElement);
    });
}

// Switch temperature unit
function switchTemperatureUnit(unit) {
    currentUnit = unit;
    
    // Update button states
    celsiusBtn.classList.toggle('active', unit === 'celsius');
    fahrenheitBtn.classList.toggle('active', unit === 'fahrenheit');
    
    // Refresh display if we have weather data
    if (currentWeatherData) {
        displayWeatherData(currentWeatherData);
    }
}

// Convert temperature based on current unit
function convertTemperature(celsius) {
    if (currentUnit === 'fahrenheit') {
        return Math.round(celsius * 9/5 + 32);
    }
    return Math.round(celsius);
}

// Update current date
function updateCurrentDate() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    currentDateElement.textContent = now.toLocaleDateString('en-US', options);
}

// Display placeholder data on initial load
function displayPlaceholderData() {
    // Show placeholder hourly forecast
    const placeholderHours = Array.from({length: 4}, (_, i) => ({
        time: new Date(Date.now() + i * 3600000),
        temperature: '--',
        icon: 'question'
    }));
    
    // Show placeholder daily forecast
    const placeholderDays = Array.from({length: 5}, (_, i) => ({
        date: new Date(Date.now() + i * 86400000),
        high: '--',
        low: '--',
        condition: 'Condition',
        icon: 'question'
    }));
    
    // Keep existing placeholder content
}

// Show loading state
function showLoading() {
    loadingElement.classList.remove('hidden');
    errorElement.classList.add('hidden');
}

// Hide loading state
function hideLoading() {
    loadingElement.classList.add('hidden');
}

// Show error message
function showError(message) {
    errorText.textContent = message;
    errorElement.classList.remove('hidden');
    loadingElement.classList.add('hidden');
    
    // Auto-hide error after 5 seconds
    setTimeout(() => {
        errorElement.classList.add('hidden');
    }, 5000);
}

// Utility function to get weather description from condition code
function getWeatherDescription(code) {
    const descriptions = {
        '01d': 'Clear Sky',
        '01n': 'Clear Sky',
        '02d': 'Few Clouds',
        '02n': 'Few Clouds',
        '03d': 'Scattered Clouds',
        '03n': 'Scattered Clouds',
        '04d': 'Broken Clouds',
        '04n': 'Broken Clouds',
        '09d': 'Shower Rain',
        '09n': 'Shower Rain',
        '10d': 'Rain',
        '10n': 'Rain',
        '11d': 'Thunderstorm',
        '11n': 'Thunderstorm',
        '13d': 'Snow',
        '13n': 'Snow',
        '50d': 'Mist',
        '50n': 'Mist'
    };
    
    return descriptions[code] || 'Unknown';
}

// Format time for display
function formatTime(date) {
    return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
    });
}

// Format date for display
function formatDate(date) {
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
    });
} 