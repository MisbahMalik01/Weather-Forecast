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

// Step 5: Iranian City Selector DOM Element
const iranianCitySelector = document.getElementById('iranian-city-selector');

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
let userIPLocation = null; // Store IP-based location data
let refinedLocation = null; // Store refined Iranian provincial capital
let geolocationAttempted = false; // Track if geolocation was attempted
let selectedIranianCity = null; // Store manually selected Iranian city

// Step 6: Weather API Configuration
const WEATHER_API_CONFIG = {
    // OpenWeatherMap API configuration
    BASE_URL: 'https://api.openweathermap.org/data/2.5',
    ONECALL_URL: 'https://api.openweathermap.org/data/3.0',
    GEOCODING_URL: 'https://api.openweathermap.org/geo/1.0',
    API_KEY: 'efc055ec60467d63836dca43cc61d624', // User's OpenWeatherMap API key
    ENDPOINTS: {
        CURRENT: '/weather',
        FORECAST: '/forecast',
        ONECALL: '/onecall',
        GEOCODING: '/direct'
    },
    DEFAULT_PARAMS: {
        units: 'metric', // metric for Celsius, imperial for Fahrenheit
        lang: 'en'
    }
};

// API Configuration
const IP_API_BASE_URL = 'http://ip-api.com/json';
const BACKUP_IP_API_URL = 'https://ipapi.co/json';

// Geolocation Error Codes and Messages
const GEOLOCATION_ERRORS = {
    1: {
        code: 'PERMISSION_DENIED',
        message: 'Location access denied by user',
        userMessage: 'Please allow location access in your browser settings to use precise GPS location.',
        suggestion: 'You can still search for locations manually or use the auto-detected IP location.'
    },
    2: {
        code: 'POSITION_UNAVAILABLE',
        message: 'Location information unavailable',
        userMessage: 'Your device location is currently unavailable. This might be due to poor GPS signal.',
        suggestion: 'Try moving to an area with better signal or use manual location search.'
    },
    3: {
        code: 'TIMEOUT',
        message: 'Location request timed out',
        userMessage: 'Location request took too long. Your GPS might be taking time to get a signal.',
        suggestion: 'Please try again or use manual location search.'
    }
};

// Iranian Provincial Capitals with Coordinates
const IRANIAN_PROVINCIAL_CAPITALS = [
    { name: 'Tehran', province: 'Tehran', lat: 35.6892, lon: 51.3890, population: 8694000 },
    { name: 'Mashhad', province: 'Razavi Khorasan', lat: 36.2605, lon: 59.6168, population: 3001184 },
    { name: 'Isfahan', province: 'Isfahan', lat: 32.6546, lon: 51.6680, population: 1961260 },
    { name: 'Karaj', province: 'Alborz', lat: 35.8327, lon: 50.9916, population: 1592492 },
    { name: 'Shiraz', province: 'Fars', lat: 29.5918, lon: 52.5837, population: 1565572 },
    { name: 'Tabriz', province: 'East Azerbaijan', lat: 38.0662, lon: 46.2919, population: 1558693 },
    { name: 'Qom', province: 'Qom', lat: 34.6401, lon: 50.8764, population: 1201158 },
    { name: 'Kermanshah', province: 'Kermanshah', lat: 34.3142, lon: 47.0650, population: 946651 },
    { name: 'Urmia', province: 'West Azerbaijan', lat: 37.5527, lon: 45.0761, population: 736224 },
    { name: 'Zahedan', province: 'Sistan and Baluchestan', lat: 29.4963, lon: 60.8629, population: 694612 },
    { name: 'Rasht', province: 'Gilan', lat: 37.2808, lon: 49.5832, population: 679995 },
    { name: 'Kerman', province: 'Kerman', lat: 30.2839, lon: 57.0834, population: 515114 },
    { name: 'Hamadan', province: 'Hamadan', lat: 34.7992, lon: 48.5146, population: 554406 },
    { name: 'Arak', province: 'Markazi', lat: 34.0917, lon: 49.7014, population: 520944 },
    { name: 'Yazd', province: 'Yazd', lat: 31.8974, lon: 54.3569, population: 529673 },
    { name: 'Ardabil', province: 'Ardabil', lat: 38.2498, lon: 48.2933, population: 529374 },
    { name: 'Bandar Abbas', province: 'Hormozgan', lat: 27.1865, lon: 56.2808, population: 526648 },
    { name: 'Esfahak', province: 'South Khorasan', lat: 32.8749, lon: 59.2183, population: 240696 },
    { name: 'Ilam', province: 'Ilam', lat: 33.6374, lon: 46.4227, population: 193442 },
    { name: 'Bojnord', province: 'North Khorasan', lat: 37.4747, lon: 57.3290, population: 178867 },
    { name: 'Sanandaj', province: 'Kurdistan', lat: 35.3150, lon: 46.9983, population: 412767 },
    { name: 'Yasuj', province: 'Kohgiluyeh and Boyer-Ahmad', lat: 30.6682, lon: 51.5880, population: 134532 },
    { name: 'Gorgan', province: 'Golestan', lat: 36.8427, lon: 54.4439, population: 350676 },
    { name: 'Shahrekord', province: 'Chaharmahal and Bakhtiari', lat: 32.3255, lon: 50.8647, population: 190441 },
    { name: 'Bushehr', province: 'Bushehr', lat: 28.9684, lon: 50.8385, population: 223504 },
    { name: 'Zanjan', province: 'Zanjan', lat: 36.6736, lon: 48.4787, population: 430871 },
    { name: 'Semnan', province: 'Semnan', lat: 35.5769, lon: 53.3923, population: 185129 },
    { name: 'Sari', province: 'Mazandaran', lat: 36.5633, lon: 53.0601, population: 309820 },
    { name: 'Ahvaz', province: 'Khuzestan', lat: 31.3183, lon: 48.6706, population: 1184788 },
    { name: 'Khorramabad', province: 'Lorestan', lat: 33.4877, lon: 48.3558, population: 373416 },
    { name: 'Birjand', province: 'South Khorasan', lat: 32.8749, lon: 59.2183, population: 203636 }
];

// Weather icon mapping (OpenWeatherMap icon codes to Font Awesome)
const weatherIcons = {
    '01d': 'fas fa-sun',           // clear sky day
    '01n': 'fas fa-moon',          // clear sky night
    '02d': 'fas fa-cloud-sun',     // few clouds day
    '02n': 'fas fa-cloud-moon',    // few clouds night
    '03d': 'fas fa-cloud',         // scattered clouds day
    '03n': 'fas fa-cloud',         // scattered clouds night
    '04d': 'fas fa-cloud',         // broken clouds day
    '04n': 'fas fa-cloud',         // broken clouds night
    '09d': 'fas fa-cloud-rain',    // shower rain day
    '09n': 'fas fa-cloud-rain',    // shower rain night
    '10d': 'fas fa-cloud-sun-rain', // rain day
    '10n': 'fas fa-cloud-moon-rain', // rain night
    '11d': 'fas fa-bolt',          // thunderstorm day
    '11n': 'fas fa-bolt',          // thunderstorm night
    '13d': 'fas fa-snowflake',     // snow day
    '13n': 'fas fa-snowflake',     // snow night
    '50d': 'fas fa-smog',          // mist day
    '50n': 'fas fa-smog'           // mist night
};

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    updateCurrentDate();
    setupEventListeners();
    
    // Check API key configuration
    checkWeatherAPIConfiguration();
    
    // Check geolocation support and update button
    updateGeolocationButton();
    
    // Step 5: Populate Iranian city selector
    populateIranianCitySelector();
    
    // Automatically detect user location based on IP
    detectUserLocationByIP();
    
    // Set up placeholder data initially
    displayPlaceholderData();
});

// Step 6: Check Weather API Configuration
function checkWeatherAPIConfiguration() {
    if (WEATHER_API_CONFIG.API_KEY === 'YOUR_API_KEY_HERE') {
        console.warn('⚠️ Weather API Setup Required:');
        console.warn('Please get a free API key from OpenWeatherMap:');
        console.warn('1. Go to https://openweathermap.org/api');
        console.warn('2. Sign up for free account');
        console.warn('3. Get your API key');
        console.warn('4. Replace YOUR_API_KEY_HERE in script.js');
        console.warn('5. The app will use sample data until API key is configured');
        
        // Show user-friendly message
        setTimeout(() => {
            if (errorElement.classList.contains('hidden')) {
                showError('⚙️ Weather API Setup: Get your free API key from OpenWeatherMap to see real weather data');
            }
        }, 3000);
    } else {
        console.log('✅ Weather API configured successfully');
    }
}

// Event Listeners
function setupEventListeners() {
    searchBtn.addEventListener('click', handleSearch);
    currentLocationBtn.addEventListener('click', getCurrentLocationWithGeolocation);
    locationInput.addEventListener('keypress', handleEnterKey);
    celsiusBtn.addEventListener('click', () => switchTemperatureUnit('celsius'));
    fahrenheitBtn.addEventListener('click', () => switchTemperatureUnit('fahrenheit'));
    
    // Step 5: Add event listener for Iranian city selector
    iranianCitySelector.addEventListener('change', handleIranianCitySelection);
}

// Step 5: Populate the Iranian city selector dropdown
function populateIranianCitySelector() {
    // Sort cities by population (largest first) for better UX
    const sortedCities = [...IRANIAN_PROVINCIAL_CAPITALS].sort((a, b) => b.population - a.population);
    
    // Clear existing options (except the default one)
    iranianCitySelector.innerHTML = '<option value="">Choose a city...</option>';
    
    // Add cities to dropdown
    sortedCities.forEach(city => {
        const option = document.createElement('option');
        option.value = city.name;
        option.textContent = `${city.name} (${city.province})`;
        
        // Add population-based styling attributes
        if (city.population > 1000000) {
            option.setAttribute('data-population', 'large');
        } else if (city.population > 500000) {
            option.setAttribute('data-population', 'medium');
        } else {
            option.setAttribute('data-population', 'small');
        }
        
        // Add population info in title for hover
        option.title = `${city.name}, ${city.province} - Population: ${city.population.toLocaleString()}`;
        
        iranianCitySelector.appendChild(option);
    });
    
    console.log('Iranian city selector populated with', sortedCities.length, 'cities');
}

// Step 5: Handle Iranian city selection
function handleIranianCitySelection() {
    const selectedCityName = iranianCitySelector.value;
    
    if (!selectedCityName) {
        // User selected "Choose a city..." option
        iranianCitySelector.classList.remove('selected');
        return;
    }
    
    // Find the selected city data
    const selectedCity = IRANIAN_PROVINCIAL_CAPITALS.find(city => city.name === selectedCityName);
    
    if (selectedCity) {
        selectedIranianCity = selectedCity;
        iranianCitySelector.classList.add('selected');
        
        console.log('Manual city selected:', {
            city: selectedCity.name,
            province: selectedCity.province,
            coordinates: `${selectedCity.lat}, ${selectedCity.lon}`,
            population: selectedCity.population.toLocaleString()
        });
        
        // Update location display for manually selected city
        displayManuallySelectedCity(selectedCity);
        
        // Fetch weather for selected city
        setTimeout(() => {
            searchWeather(selectedCity.name, false, selectedCity); // false = not auto-detected
        }, 500);
        
    } else {
        console.error('Selected city not found in database:', selectedCityName);
    }
}

// Step 5: Display manually selected Iranian city
function displayManuallySelectedCity(cityData) {
    cityNameElement.innerHTML = `
        <div style="text-align: center;">
            <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 8px;">
                <i class="fas fa-hand-pointer" style="color: #00b894; margin-right: 8px;"></i>
                <span style="font-size: 1.1em; font-weight: 500;">${cityData.name}</span>
                <span style="opacity: 0.7; margin-left: 5px;">(${cityData.province})</span>
            </div>
            <div style="font-size: 0.75em; opacity: 0.8; line-height: 1.4;">
                🎯 Manually selected from dropdown<br>
                📍 Coordinates: ${cityData.lat.toFixed(4)}°, ${cityData.lon.toFixed(4)}°<br>
                👥 Population: ${cityData.population.toLocaleString()}<br>
                🏛️ Provincial capital of ${cityData.province}
            </div>
        </div>
    `;
    
    console.log('Displaying manually selected city:', cityData.name);
}

// Step 5: Update city selector to show currently selected city
function updateCitySelectorDefault(cityName) {
    if (cityName && iranianCitySelector) {
        // Find if the current city is in our Iranian capitals list
        const iranianCity = IRANIAN_PROVINCIAL_CAPITALS.find(city => 
            city.name.toLowerCase() === cityName.toLowerCase()
        );
        
        if (iranianCity) {
            iranianCitySelector.value = iranianCity.name;
            iranianCitySelector.classList.add('selected');
            console.log(`City selector updated to show: ${iranianCity.name}`);
        } else {
            // City is not in Iranian capitals list, reset selector
            iranianCitySelector.value = '';
            iranianCitySelector.classList.remove('selected');
        }
    } else {
        // No city or selector not available, reset
        if (iranianCitySelector) {
            iranianCitySelector.value = '';
            iranianCitySelector.classList.remove('selected');
        }
    }
}

// Check geolocation support and update button appearance
function updateGeolocationButton() {
    if (!navigator.geolocation) {
        currentLocationBtn.disabled = true;
        currentLocationBtn.title = 'Geolocation is not supported by this browser';
        currentLocationBtn.style.opacity = '0.5';
        currentLocationBtn.style.cursor = 'not-allowed';
        console.warn('Geolocation API not supported by this browser');
    } else {
        currentLocationBtn.title = 'Get precise GPS location';
        console.log('Geolocation API is supported');
    }
}

// Step 4: Enhanced Browser Geolocation API with comprehensive error handling
function getCurrentLocationWithGeolocation() {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
        showGeolocationError({
            code: 0,
            message: 'Geolocation not supported',
            userMessage: 'Your browser does not support location services.',
            suggestion: 'Please use a modern browser or search for locations manually.'
        });
        return;
    }

    // Mark that geolocation was attempted
    geolocationAttempted = true;
    
    // Show loading state
    showLoading();
    updateGeolocationButtonState('loading');
    
    console.log('Requesting precise GPS location...');
    
    // Enhanced geolocation options for better accuracy
    const geolocationOptions = {
        enableHighAccuracy: true,    // Request GPS if available
        timeout: 15000,              // 15 seconds timeout
        maximumAge: 300000           // Accept cached position up to 5 minutes old
    };
    
    // Request current position with comprehensive error handling
    navigator.geolocation.getCurrentPosition(
        // Success callback
        (position) => {
            console.log('GPS location obtained successfully:', {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy + ' meters',
                timestamp: new Date(position.timestamp).toLocaleString()
            });
            
            handleGeolocationSuccess(position);
        },
        // Error callback with detailed error handling
        (error) => {
            console.error('Geolocation error:', {
                code: error.code,
                message: error.message,
                timestamp: new Date().toLocaleString()
            });
            
            handleGeolocationError(error);
        },
        // Options
        geolocationOptions
    );
}

// Handle successful geolocation
function handleGeolocationSuccess(position) {
    const coords = position.coords;
    const accuracy = Math.round(coords.accuracy);
    
    console.log(`Location accuracy: ${accuracy} meters`);
    
    // Create GPS location data object
    const gpsLocationData = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: accuracy,
        timestamp: position.timestamp,
        source: 'GPS'
    };
    
    // Step 4: Use GPS coordinates to find closest Iranian provincial capital
    const refinedCapital = findClosestIranianCapital(coords.latitude, coords.longitude);
    
    if (refinedCapital) {
        refinedLocation = refinedCapital;
        displayGPSRefinedLocation(gpsLocationData, refinedCapital);
        
        // Step 5: Update city selector to show GPS-refined city
        updateCitySelectorDefault(refinedCapital.name);
        
        // Load weather for refined location
        setTimeout(() => {
            searchWeather(refinedCapital.name, true, refinedCapital);
        }, 1500);
    } else {
        // No Iranian capital within range, show GPS coordinates
        displayGPSLocation(gpsLocationData);
        
        // Step 5: Reset city selector since no Iranian city is nearby
        updateCitySelectorDefault(null);
        
        // Load weather for GPS coordinates (using placeholder data)
        setTimeout(() => {
            getWeatherByCoordinates(coords.latitude, coords.longitude, gpsLocationData);
        }, 1500);
    }
    
    // Update button state
    updateGeolocationButtonState('success');
    hideLoading();
}

// Handle geolocation errors with detailed user feedback
function handleGeolocationError(error) {
    const errorInfo = GEOLOCATION_ERRORS[error.code] || {
        code: 'UNKNOWN_ERROR',
        message: 'Unknown geolocation error',
        userMessage: 'An unexpected error occurred while getting your location.',
        suggestion: 'Please try again or use manual location search.'
    };
    
    // Log detailed error information
    console.error('Geolocation failed:', {
        errorCode: error.code,
        errorType: errorInfo.code,
        browserMessage: error.message,
        userMessage: errorInfo.userMessage,
        timestamp: new Date().toLocaleString()
    });
    
    // Show user-friendly error message
    showGeolocationError(errorInfo, error.code);
    
    // Update button state
    updateGeolocationButtonState('error');
    hideLoading();
}

// Display comprehensive geolocation error message
function showGeolocationError(errorInfo, errorCode = null) {
    const errorMessage = `
        <div style="text-align: center;">
            <div style="margin-bottom: 10px;">
                <strong>Location Error (${errorInfo.code})</strong>
            </div>
            <div style="margin-bottom: 8px;">
                ${errorInfo.userMessage}
            </div>
            <div style="font-size: 0.9em; opacity: 0.8;">
                💡 ${errorInfo.suggestion}
            </div>
        </div>
    `;
    
    errorText.innerHTML = errorMessage;
    errorElement.classList.remove('hidden');
    
    // Auto-hide error after 8 seconds for better UX
    setTimeout(() => {
        errorElement.classList.add('hidden');
    }, 8000);
    
    // Provide helpful guidance based on error type
    if (errorCode === 1) { // Permission denied
        console.log('💡 Help: To enable location access:');
        console.log('  - Chrome: Click the location icon in address bar');
        console.log('  - Firefox: Click the shield icon and allow location');
        console.log('  - Safari: Check Settings > Privacy & Security > Location Services');
    }
}

// Update geolocation button visual state
function updateGeolocationButtonState(state) {
    const button = currentLocationBtn;
    const icon = button.querySelector('i');
    
    // Reset classes
    icon.className = 'fas';
    button.style.backgroundColor = '';
    button.style.transform = '';
    
    switch (state) {
        case 'loading':
            icon.className = 'fas fa-spinner fa-spin';
            button.style.backgroundColor = '#f39c12';
            button.title = 'Getting your precise location...';
            button.disabled = true;
            break;
            
        case 'success':
            icon.className = 'fas fa-check';
            button.style.backgroundColor = '#27ae60';
            button.title = 'GPS location obtained successfully!';
            button.disabled = false;
            // Reset to original icon after 3 seconds
            setTimeout(() => {
                icon.className = 'fas fa-location-arrow';
                button.style.backgroundColor = '';
                button.title = 'Get precise GPS location';
            }, 3000);
            break;
            
        case 'error':
            icon.className = 'fas fa-exclamation-triangle';
            button.style.backgroundColor = '#e74c3c';
            button.title = 'Location access failed - click for details';
            button.disabled = false;
            // Reset to original icon after 5 seconds
            setTimeout(() => {
                icon.className = 'fas fa-location-arrow';
                button.style.backgroundColor = '';
                button.title = 'Get precise GPS location';
            }, 5000);
            break;
            
        default:
            icon.className = 'fas fa-location-arrow';
            button.title = 'Get precise GPS location';
            button.disabled = false;
            break;
    }
}

// Display GPS-refined location (GPS + closest Iranian capital)
function displayGPSRefinedLocation(gpsData, closestCapital) {
    const accuracy = gpsData.accuracy;
    const accuracyText = accuracy < 100 ? 'High accuracy' : 
                        accuracy < 1000 ? 'Medium accuracy' : 'Low accuracy';
    
    cityNameElement.innerHTML = `
        <div style="text-align: center;">
            <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 8px;">
                <i class="fas fa-satellite" style="color: #27ae60; margin-right: 8px;"></i>
                <span style="font-size: 1.1em; font-weight: 500;">${closestCapital.name}</span>
                <span style="opacity: 0.7; margin-left: 5px;">(${closestCapital.province})</span>
            </div>
            <div style="font-size: 0.75em; opacity: 0.8; line-height: 1.4;">
                🎯 Refined from precise GPS location<br>
                📍 GPS: ${gpsData.latitude.toFixed(4)}°, ${gpsData.longitude.toFixed(4)}°<br>
                📏 Distance: ${closestCapital.distanceKm}km to capital<br>
                🎯 Accuracy: ${accuracy}m (${accuracyText})
            </div>
        </div>
    `;
    
    console.log('GPS location refined to Iranian capital:', {
        gpsCoordinates: `${gpsData.latitude}, ${gpsData.longitude}`,
        refinedCapital: `${closestCapital.name}, ${closestCapital.province}`,
        distance: `${closestCapital.distanceKm}km`,
        accuracy: `${accuracy}m`
    });
}

// Display GPS location when no Iranian capital is nearby
function displayGPSLocation(gpsData) {
    const accuracy = gpsData.accuracy;
    const accuracyText = accuracy < 100 ? 'High accuracy' : 
                        accuracy < 1000 ? 'Medium accuracy' : 'Low accuracy';
    
    cityNameElement.innerHTML = `
        <div style="text-align: center;">
            <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 8px;">
                <i class="fas fa-satellite" style="color: #27ae60; margin-right: 8px;"></i>
                <span style="font-size: 1.1em; font-weight: 500;">GPS Location</span>
            </div>
            <div style="font-size: 0.75em; opacity: 0.8; line-height: 1.4;">
                📍 ${gpsData.latitude.toFixed(4)}°N, ${gpsData.longitude.toFixed(4)}°E<br>
                🎯 Accuracy: ${accuracy}m (${accuracyText})<br>
                ⏰ ${new Date(gpsData.timestamp).toLocaleTimeString()}
            </div>
        </div>
    `;
    
    console.log('GPS location displayed (no Iranian capital nearby):', {
        coordinates: `${gpsData.latitude}, ${gpsData.longitude}`,
        accuracy: `${accuracy}m`
    });
}

// Detect user location based on IP address
async function detectUserLocationByIP() {
    try {
        showLoading();
        console.log('Detecting location based on IP address...');
        
        // Try primary IP API first
        let locationData = await fetchIPLocation(IP_API_BASE_URL);
        
        // If primary fails, try backup API
        if (!locationData) {
            console.log('Primary IP API failed, trying backup...');
            locationData = await fetchIPLocationBackup(BACKUP_IP_API_URL);
        }
        
        if (locationData) {
            userIPLocation = locationData;
            console.log('Raw IP location detected:', locationData);
            
            // Step 3: Refine location to closest Iranian provincial capital
            const refinedCapital = findClosestIranianCapital(locationData.latitude, locationData.longitude);
            
            if (refinedCapital) {
                refinedLocation = refinedCapital;
                displayRefinedLocation(locationData, refinedCapital);
                
                // Step 5: Update city selector to show IP-refined city
                updateCitySelectorDefault(refinedCapital.name);
                
                // Automatically get weather for refined location
                setTimeout(() => {
                    searchWeather(refinedCapital.name, true, refinedCapital); 
                }, 2000);
            } else {
                displayIPLocation(locationData);
                
                // Step 5: Reset city selector since no Iranian city is nearby
                updateCitySelectorDefault(null);
                
                // Get weather for original detected location
                const locationName = `${locationData.city}, ${locationData.region || locationData.country}`;
                setTimeout(() => {
                    searchWeather(locationName, true);
                }, 1500);
            }
        } else {
            hideLoading();
            console.log('Could not detect location from IP');
            cityNameElement.textContent = 'Location not detected - Enter manually';
        }
        
    } catch (error) {
        hideLoading();
        console.error('Error detecting IP location:', error);
        cityNameElement.textContent = 'Enter a location to get started';
    }
}

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers
    return distance;
}

// Find the closest Iranian provincial capital to given coordinates
function findClosestIranianCapital(lat, lon) {
    let closestCapital = null;
    let shortestDistance = Infinity;
    
    // Calculate distance to each Iranian provincial capital
    IRANIAN_PROVINCIAL_CAPITALS.forEach(capital => {
        const distance = calculateDistance(lat, lon, capital.lat, capital.lon);
        
        if (distance < shortestDistance) {
            shortestDistance = distance;
            closestCapital = {
                ...capital,
                distanceKm: Math.round(distance)
            };
        }
    });
    
    // Only return closest capital if it's within reasonable distance (e.g., 1000km)
    // This covers Iran, Afghanistan, and neighboring regions
    if (shortestDistance <= 1000) {
        console.log(`Closest Iranian capital: ${closestCapital.name} (${closestCapital.distanceKm}km away)`);
        return closestCapital;
    } else {
        console.log(`No Iranian capital within reasonable distance. Closest would be ${closestCapital.name} at ${closestCapital.distanceKm}km`);
        return null;
    }
}

// Check if location is in target regions (Iran, Afghanistan, neighboring countries)
function isInTargetRegion(countryCode, country) {
    const targetRegions = [
        'IR', // Iran
        'AF', // Afghanistan
        'IQ', // Iraq
        'TR', // Turkey
        'PK', // Pakistan
        'TM', // Turkmenistan
        'UZ', // Uzbekistan
        'TJ', // Tajikistan
        'AZ', // Azerbaijan
        'AM'  // Armenia
    ];
    
    return targetRegions.includes(countryCode) || 
           country.toLowerCase().includes('iran') ||
           country.toLowerCase().includes('afghanistan');
}

// Display refined location with closest Iranian capital
function displayRefinedLocation(originalLocation, closestCapital) {
    const originalText = `${originalLocation.city}, ${originalLocation.country}`;
    
    cityNameElement.innerHTML = `
        <div style="text-align: center;">
            <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 8px;">
                <i class="fas fa-map-marker-alt" style="color: #ffeaa7; margin-right: 8px;"></i>
                <span style="font-size: 1.1em; font-weight: 500;">${closestCapital.name}</span>
                <span style="opacity: 0.7; margin-left: 5px;">(${closestCapital.province})</span>
            </div>
            <div style="font-size: 0.75em; opacity: 0.8; line-height: 1.4;">
                🎯 Refined to closest Iranian capital<br>
                📍 Original: ${originalText}<br>
                📏 Distance: ${closestCapital.distanceKm}km away<br>
                🌐 IP: ${originalLocation.ip}
            </div>
        </div>
    `;
    
    console.log('Location refined:', {
        original: originalText,
        refined: `${closestCapital.name}, ${closestCapital.province}`,
        distance: `${closestCapital.distanceKm}km`,
        coordinates: `${closestCapital.lat}, ${closestCapital.lon}`
    });
}

// Fetch location data from primary IP API (ip-api.com)
async function fetchIPLocation(apiUrl) {
    try {
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Check if the API returned valid location data
        if (data.status === 'success' && data.city) {
            return {
                ip: data.query,
                city: data.city,
                region: data.regionName,
                country: data.country,
                countryCode: data.countryCode,
                latitude: data.lat,
                longitude: data.lon,
                timezone: data.timezone,
                isp: data.isp
            };
        } else {
            console.log('Primary IP API did not return valid location data:', data);
            return null;
        }
        
    } catch (error) {
        console.error('Primary IP API error:', error);
        return null;
    }
}

// Backup IP API (ipapi.co)
async function fetchIPLocationBackup(apiUrl) {
    try {
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Check if the backup API returned valid data
        if (data.city && data.country) {
            return {
                ip: data.ip,
                city: data.city,
                region: data.region,
                country: data.country_name,
                countryCode: data.country_code,
                latitude: data.latitude,
                longitude: data.longitude,
                timezone: data.timezone,
                isp: data.org
            };
        } else {
            console.log('Backup IP API did not return valid location data:', data);
            return null;
        }
        
    } catch (error) {
        console.error('Backup IP API error:', error);
        return null;
    }
}

// Display the detected IP location on the page
function displayIPLocation(locationData) {
    const locationText = `${locationData.city}, ${locationData.region || locationData.country}`;
    cityNameElement.innerHTML = `
        <i class="fas fa-map-marker-alt"></i>
        <span>${locationText}</span>
        <small style="opacity: 0.7; font-size: 0.8em; display: block; margin-top: 5px;">
            📍 Auto-detected from IP: ${locationData.ip}
        </small>
    `;
    
    console.log('Location detected:', {
        location: locationText,
        coordinates: `${locationData.latitude}, ${locationData.longitude}`,
        timezone: locationData.timezone,
        isp: locationData.isp
    });
}

// Handle search functionality
function handleSearch() {
    const location = locationInput.value.trim();
    if (location) {
        // Step 5: Reset manually selected city when user searches manually
        selectedIranianCity = null;
        iranianCitySelector.value = '';
        iranianCitySelector.classList.remove('selected');
        
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

// Legacy getCurrentLocation function - now redirects to enhanced version
function getCurrentLocation() {
    getCurrentLocationWithGeolocation();
}

// Search weather by location name
async function searchWeather(location, isAutoDetected = false, capitalData = null) {
    try {
        showLoading();
        console.log(`Searching weather for: ${location}`);
        
        // Determine coordinates for API call
        let lat, lon, locationName;
        
        if (capitalData && capitalData.lat && capitalData.lon) {
            // Use provided coordinates from Iranian capital data
            lat = capitalData.lat;
            lon = capitalData.lon;
            locationName = `${capitalData.name}, ${capitalData.province}`;
            console.log(`Using Iranian capital coordinates: ${lat}, ${lon}`);
        } else {
            // Step 6: Use OpenWeatherMap Geocoding API to get coordinates for any city
            console.log('Getting coordinates for location:', location);
            const coordinates = await getCoordinatesFromLocationName(location);
            
            if (coordinates) {
                lat = coordinates.lat;
                lon = coordinates.lon;
                locationName = coordinates.name;
                console.log(`Coordinates found: ${lat}, ${lon} for ${locationName}`);
            } else {
                throw new Error('Location not found');
            }
        }
        
        // Step 6: Fetch real weather data using coordinates
        const weatherData = await fetchWeatherData(lat, lon, locationName);
        
        if (weatherData) {
            displayWeatherData(weatherData, isAutoDetected, capitalData);
        } else {
            throw new Error('Failed to fetch weather data');
        }
        
        hideLoading();
        
    } catch (error) {
        hideLoading();
        showError(`Unable to fetch weather data: ${error.message}`);
        console.error('Weather search error:', error);
    }
}

// Get weather by coordinates (enhanced for GPS data)
async function getWeatherByCoordinates(lat, lon, gpsData = null) {
    try {
        showLoading();
        console.log(`Fetching weather for coordinates: ${lat}, ${lon}`);
        
        // Step 6: Fetch real weather data
        const weatherData = await fetchWeatherData(lat, lon, gpsData ? 'GPS Location' : 'Current Location');
        
        if (gpsData) {
            weatherData.coordinates = { lat: lat, lon: lon };
            weatherData.gpsData = gpsData;
        }
        
        displayWeatherData(weatherData, true);
        hideLoading();
        
    } catch (error) {
        hideLoading();
        showError('Unable to fetch weather data');
        console.error('Weather coordinates error:', error);
    }
}

// Step 6: Fetch Comprehensive Weather Data using One Call API 3.0
async function fetchOneCallWeatherData(lat, lon) {
    try {
        // One Call API 3.0 provides:
        // - Current weather
        // - 48-hour hourly forecast  
        // - 8-day daily forecast
        // - Weather alerts
        const url = `${WEATHER_API_CONFIG.ONECALL_URL}${WEATHER_API_CONFIG.ENDPOINTS.ONECALL}?lat=${lat}&lon=${lon}&appid=${WEATHER_API_CONFIG.API_KEY}&units=${WEATHER_API_CONFIG.DEFAULT_PARAMS.units}&lang=${WEATHER_API_CONFIG.DEFAULT_PARAMS.lang}&exclude=minutely,alerts`;
        
        console.log('Calling One Call API for comprehensive weather data...');
        const response = await fetch(url);
        
        if (!response.ok) {
            // If One Call API fails, fall back to the basic APIs
            console.warn(`One Call API error: ${response.status} ${response.statusText}, falling back to basic APIs`);
            return await fetchBasicWeatherData(lat, lon);
        }
        
        const data = await response.json();
        console.log('One Call API response received successfully');
        return data;
        
    } catch (error) {
        console.error('Error with One Call API, falling back to basic APIs:', error);
        return await fetchBasicWeatherData(lat, lon);
    }
}

// Step 6: Fallback to Basic APIs if One Call API fails
async function fetchBasicWeatherData(lat, lon) {
    try {
        console.log('Using basic weather APIs as fallback...');
        
        // Fetch current weather and forecast in parallel
        const [currentData, forecastData] = await Promise.all([
            fetchCurrentWeather(lat, lon),
            fetchWeatherForecast(lat, lon)
        ]);

        if (currentData && forecastData) {
            // Convert basic API data to One Call format for consistency
            return convertBasicToOneCallFormat(currentData, forecastData);
        } else {
            throw new Error('Both One Call API and basic APIs failed');
        }
        
    } catch (error) {
        console.error('Fallback APIs also failed:', error);
        return null;
    }
}

// Step 6: Keep original functions for fallback
async function fetchCurrentWeather(lat, lon) {
    try {
        const url = `${WEATHER_API_CONFIG.BASE_URL}${WEATHER_API_CONFIG.ENDPOINTS.CURRENT}?lat=${lat}&lon=${lon}&appid=${WEATHER_API_CONFIG.API_KEY}&units=${WEATHER_API_CONFIG.DEFAULT_PARAMS.units}&lang=${WEATHER_API_CONFIG.DEFAULT_PARAMS.lang}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Current weather API error: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
        
    } catch (error) {
        console.error('Error fetching current weather:', error);
        return null;
    }
}

async function fetchWeatherForecast(lat, lon) {
    try {
        const url = `${WEATHER_API_CONFIG.BASE_URL}${WEATHER_API_CONFIG.ENDPOINTS.FORECAST}?lat=${lat}&lon=${lon}&appid=${WEATHER_API_CONFIG.API_KEY}&units=${WEATHER_API_CONFIG.DEFAULT_PARAMS.units}&lang=${WEATHER_API_CONFIG.DEFAULT_PARAMS.lang}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Forecast API error: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
        
    } catch (error) {
        console.error('Error fetching weather forecast:', error);
        return null;
    }
}

// Step 6: Process Real Weather API Response
function processWeatherAPIResponse(currentData, forecastData, locationName = null) {
    try {
        // Extract current weather
        const current = {
            temperature: Math.round(currentData.main.temp),
            condition: currentData.weather[0].description,
            icon: currentData.weather[0].icon,
            feelsLike: Math.round(currentData.main.feels_like),
            humidity: currentData.main.humidity,
            windSpeed: Math.round(currentData.wind.speed * 3.6), // Convert m/s to km/h
            pressure: currentData.main.pressure,
            visibility: Math.round((currentData.visibility || 10000) / 1000), // Convert m to km
            uvIndex: 0, // Not available in current weather API
            clouds: currentData.clouds.all
        };

        // Extract hourly forecast (next 24 hours from 5-day/3-hour forecast)
        const hourly = forecastData.list.slice(0, 8).map(item => ({
            time: new Date(item.dt * 1000),
            temperature: Math.round(item.main.temp),
            icon: item.weather[0].icon
        }));

        // Extract daily forecast (group by day)
        const daily = extractDailyForecast(forecastData.list);

        // Determine location name
        const location = locationName || currentData.name || `${currentData.coord.lat}, ${currentData.coord.lon}`;

        return {
            location: location,
            coordinates: { lat: currentData.coord.lat, lon: currentData.coord.lon },
            current: current,
            hourly: hourly,
            daily: daily,
            source: 'OpenWeatherMap API'
        };

    } catch (error) {
        console.error('Error processing weather API response:', error);
        // Fall back to sample data if processing fails
        return generateSampleWeatherData(locationName || 'Sample Location');
    }
}

// Step 6: Extract Daily Forecast from 5-day/3-hour Data
function extractDailyForecast(forecastList) {
    const dailyData = {};
    
    // Group forecast data by date
    forecastList.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dateKey = date.toDateString();
        
        if (!dailyData[dateKey]) {
            dailyData[dateKey] = {
                date: date,
                temps: [],
                conditions: [],
                icons: []
            };
        }
        
        dailyData[dateKey].temps.push(item.main.temp);
        dailyData[dateKey].conditions.push(item.weather[0].description);
        dailyData[dateKey].icons.push(item.weather[0].icon);
    });
    
    // Process grouped data into daily summaries
    return Object.values(dailyData).slice(0, 5).map(day => {
        const temps = day.temps;
        const high = Math.round(Math.max(...temps));
        const low = Math.round(Math.min(...temps));
        
        // Most common condition and icon
        const condition = getMostFrequent(day.conditions);
        const icon = getMostFrequent(day.icons);
        
        return {
            date: day.date,
            high: high,
            low: low,
            condition: condition,
            icon: icon
        };
    });
}

// Step 6: Get Most Frequent Item from Array
function getMostFrequent(arr) {
    const frequency = {};
    let maxCount = 0;
    let mostFrequent = arr[0];
    
    arr.forEach(item => {
        frequency[item] = (frequency[item] || 0) + 1;
        if (frequency[item] > maxCount) {
            maxCount = frequency[item];
            mostFrequent = item;
        }
    });
    
    return mostFrequent;
}

// Step 6: Get Coordinates from Location Name using OpenWeatherMap Geocoding API
async function getCoordinatesFromLocationName(locationName) {
    try {
        // Check if API key is configured
        if (WEATHER_API_CONFIG.API_KEY === 'YOUR_API_KEY_HERE') {
            console.log('Geocoding not available - API key not configured');
            return null;
        }

        const url = `${WEATHER_API_CONFIG.GEOCODING_URL}${WEATHER_API_CONFIG.ENDPOINTS.GEOCODING}?q=${encodeURIComponent(locationName)}&limit=1&appid=${WEATHER_API_CONFIG.API_KEY}`;
        
        console.log('Fetching coordinates for:', locationName);
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Geocoding API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data && data.length > 0) {
            const location = data[0];
            return {
                lat: location.lat,
                lon: location.lon,
                name: location.name,
                country: location.country,
                state: location.state
            };
        } else {
            throw new Error('Location not found');
        }
        
    } catch (error) {
        console.error('Geocoding error:', error);
        return null;
    }
}

// Generate sample weather data for demonstration (fallback when API fails)
function generateSampleWeatherData(location, capitalData = null) {
    // Generate more realistic weather data based on Iranian climate if it's a capital
    let baseTemp = 22;
    let condition = 'Partly Cloudy';
    let icon = '02d';
    
    if (capitalData) {
        // Adjust weather based on geographic location and season
        const now = new Date();
        const month = now.getMonth(); // 0-11
        
        // Seasonal adjustments for Iranian cities
        if (month >= 5 && month <= 8) { // Summer months
            baseTemp = capitalData.lat > 35 ? 28 : 35; // Northern cities cooler
            condition = capitalData.name === 'Bandar Abbas' ? 'Hot and Humid' : 'Sunny';
            icon = '01d';
        } else if (month >= 11 || month <= 2) { // Winter months
            baseTemp = capitalData.lat > 35 ? 5 : 15; // Northern cities colder
            condition = capitalData.lat > 37 ? 'Cold' : 'Cool';
            icon = '03d';
        }
        
        // City-specific adjustments
        if (capitalData.name === 'Tehran') baseTemp += 2; // Urban heat island
        if (capitalData.name === 'Mashhad') baseTemp -= 3; // Continental climate
        if (capitalData.name === 'Bandar Abbas') baseTemp += 8; // Coastal, hot
        if (capitalData.name === 'Tabriz') baseTemp -= 5; // High altitude
    }
    
    return {
        location: location,
        coordinates: capitalData ? { lat: capitalData.lat, lon: capitalData.lon } : null,
        current: {
            temperature: baseTemp,
            condition: condition,
            icon: icon,
            feelsLike: baseTemp + 3,
            humidity: Math.floor(Math.random() * 30) + 40,
            windSpeed: Math.floor(Math.random() * 20) + 5,
            pressure: Math.floor(Math.random() * 50) + 1000,
            visibility: Math.floor(Math.random() * 15) + 5,
            uvIndex: Math.floor(Math.random() * 8) + 2,
            clouds: Math.floor(Math.random() * 60) + 20
        },
        hourly: Array.from({length: 48}, (_, i) => ({
            time: new Date(Date.now() + i * 3600000),
            temperature: Math.round(baseTemp + Math.random() * 8 - 4),
            feelsLike: Math.round(baseTemp + Math.random() * 8 - 2),
            icon: ['01d', '02d', '03d', '04d'][Math.floor(Math.random() * 4)],
            condition: ['Clear', 'Partly Cloudy', 'Cloudy', 'Overcast'][Math.floor(Math.random() * 4)],
            humidity: Math.floor(Math.random() * 30) + 40,
            windSpeed: Math.floor(Math.random() * 20) + 5,
            windDirection: Math.floor(Math.random() * 360),
            pressure: Math.floor(Math.random() * 50) + 1000,
            clouds: Math.floor(Math.random() * 80) + 10,
            precipitation: Math.random() > 0.8 ? Math.random() * 3 : 0,
            snow: Math.random() > 0.95 ? Math.random() * 2 : 0,
            uvIndex: Math.floor(Math.random() * 8) + 1
        })),
        daily: Array.from({length: 7}, (_, i) => ({
            date: new Date(Date.now() + i * 86400000),
            high: Math.round(baseTemp + Math.random() * 10),
            low: Math.round(baseTemp - Math.random() * 8),
            morning: Math.round(baseTemp - 2 + Math.random() * 4),
            evening: Math.round(baseTemp + Math.random() * 6),
            night: Math.round(baseTemp - 5 + Math.random() * 4),
            condition: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Clear'][Math.floor(Math.random() * 4)],
            icon: ['01d', '02d', '03d', '01d'][Math.floor(Math.random() * 4)],
            humidity: Math.floor(Math.random() * 30) + 40,
            windSpeed: Math.floor(Math.random() * 20) + 5,
            windDirection: Math.floor(Math.random() * 360),
            pressure: Math.floor(Math.random() * 50) + 1000,
            clouds: Math.floor(Math.random() * 60) + 20,
            precipitation: Math.random() > 0.7 ? Math.floor(Math.random() * 5) : 0,
            snow: Math.random() > 0.9 ? Math.floor(Math.random() * 3) : 0,
            uvIndex: Math.floor(Math.random() * 8) + 2,
            sunrise: new Date(Date.now() + i * 86400000 + 6 * 3600000),
            sunset: new Date(Date.now() + i * 86400000 + 18 * 3600000),
            moonPhase: Math.random()
        })),
        source: 'Sample Data'
    };
}

// Display weather data
function displayWeatherData(data, isAutoDetected = false, capitalData = null) {
    currentWeatherData = data;
    currentLocation = data.location;
    
    // Step 6: Log weather data source for transparency
    console.log(`Weather data displayed from: ${data.source || 'Unknown source'}`);
    if (data.source === 'OpenWeatherMap API') {
        console.log('✅ Real weather data displayed');
    } else {
        console.log('📊 Sample weather data displayed (API not configured)');
    }
    
    // Step 5: Update location info only if not auto-detected (to preserve refined location display)
    // Exception: Always update for manually selected cities
    if (!isAutoDetected || selectedIranianCity) {
        if (selectedIranianCity && capitalData && selectedIranianCity.name === capitalData.name) {
            // This is a manually selected Iranian city, keep the manual selection display
            // displayManuallySelectedCity is already called from handleIranianCitySelection
        } else if (!capitalData) {
            // Regular search or no capital data
            cityNameElement.innerHTML = `
                <i class="fas fa-map-marker-alt"></i>
                <span>${data.location}</span>
                ${data.source === 'Sample Data' ? '<small style="opacity: 0.7; font-size: 0.8em; display: block; margin-top: 5px;">📊 Sample data - Add API key for real weather</small>' : 
                  data.source === 'OpenWeatherMap API' ? '<small style="opacity: 0.7; font-size: 0.8em; display: block; margin-top: 5px;">🌍 Real weather data</small>' : ''}
            `;
            
            // Step 5: Update city selector if the searched location matches an Iranian capital
            updateCitySelectorDefault(data.location);
        }
    }
    
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
    
    // Log weather data for different types of locations
    if (selectedIranianCity && capitalData && selectedIranianCity.name === capitalData.name) {
        console.log(`Weather loaded for manually selected ${capitalData.name}, ${capitalData.province}:`, {
            temperature: `${data.current.temperature}°C`,
            condition: data.current.condition,
            coordinates: `${capitalData.lat}, ${capitalData.lon}`,
            selectionType: 'Manual dropdown selection',
            dataSource: data.source || 'Unknown'
        });
    } else if (capitalData) {
        console.log(`Weather loaded for auto-detected ${capitalData.name}, ${capitalData.province}:`, {
            temperature: `${data.current.temperature}°C`,
            condition: data.current.condition,
            coordinates: `${capitalData.lat}, ${capitalData.lon}`,
            selectionType: isAutoDetected ? 'Auto-detected and refined' : 'Search result',
            dataSource: data.source || 'Unknown'
        });
    } else {
        console.log(`Weather loaded for ${data.location}:`, {
            temperature: `${data.current.temperature}°C`,
            condition: data.current.condition,
            selectionType: isAutoDetected ? 'Auto-detected' : 'Search result',
            dataSource: data.source || 'Unknown'
        });
    }
}

// Display enhanced hourly forecast (48 hours - today and tomorrow)
function displayHourlyForecast(hourlyData) {
    hourlyContainer.innerHTML = '';
    
    // Show next 24 hours for better UI (can be expanded to show 48)
    const hoursToShow = Math.min(24, hourlyData.length);
    const hoursData = hourlyData.slice(0, hoursToShow);
    
    // Add mobile toggle button for hourly details
    const hourlyForecastSection = hourlyContainer.closest('.hourly-forecast');
    const existingHeader = hourlyForecastSection.querySelector('.forecast-header');
    
    if (!existingHeader) {
        const headerDiv = document.createElement('div');
        headerDiv.className = 'forecast-header';
        
        const title = hourlyForecastSection.querySelector('h3');
        headerDiv.appendChild(title);
        
        const toggleButton = document.createElement('button');
        toggleButton.className = 'mobile-toggle';
        toggleButton.innerHTML = 'Show Details <i class="fas fa-chevron-down"></i>';
        toggleButton.setAttribute('data-expanded', 'false');
        
        toggleButton.addEventListener('click', function() {
            const isExpanded = this.getAttribute('data-expanded') === 'true';
            const hourlyDetails = hourlyContainer.querySelectorAll('.hourly-details');
            
            if (isExpanded) {
                // Hide details
                hourlyDetails.forEach(detail => detail.classList.remove('show-mobile'));
                this.innerHTML = 'Show Details <i class="fas fa-chevron-down"></i>';
                this.classList.remove('expanded');
                this.setAttribute('data-expanded', 'false');
            } else {
                // Show details
                hourlyDetails.forEach(detail => detail.classList.add('show-mobile'));
                this.innerHTML = 'Hide Details <i class="fas fa-chevron-up"></i>';
                this.classList.add('expanded');
                this.setAttribute('data-expanded', 'true');
            }
        });
        
        headerDiv.appendChild(toggleButton);
        hourlyForecastSection.insertBefore(headerDiv, hourlyContainer);
    }
    
    hoursData.forEach((hour, index) => {
        const hourElement = document.createElement('div');
        hourElement.className = 'hourly-item enhanced';
        
        const timeString = hour.time.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            hour12: true 
        });
        
        const iconClass = weatherIcons[hour.icon] || 'fas fa-question';
        
        // Add enhanced information tooltips
        const windDirection = getWindDirection(hour.windDirection || 0);
        const precipitationInfo = hour.precipitation > 0 ? `💧 ${hour.precipitation}mm` : '';
        const snowInfo = hour.snow > 0 ? `❄️ ${hour.snow}mm` : '';
        const weatherInfo = [precipitationInfo, snowInfo].filter(info => info).join(' ');
        
        // Create detailed tooltip content
        const tooltipContent = `
            Time: ${hour.time.toLocaleString()}
            Temperature: ${convertTemperature(hour.temperature)}°
            Feels like: ${convertTemperature(hour.feelsLike)}°
            Condition: ${hour.condition}
            Humidity: ${hour.humidity}%
            Wind: ${hour.windSpeed} km/h ${windDirection}
            Clouds: ${hour.clouds}%
            ${hour.precipitation > 0 ? `Rain: ${hour.precipitation}mm` : ''}
            ${hour.snow > 0 ? `Snow: ${hour.snow}mm` : ''}
            UV Index: ${hour.uvIndex}
        `.trim();
        
        hourElement.innerHTML = `
            <span class="hour">${timeString}</span>
            <i class="${iconClass} weather-icon-small"></i>
            <span class="hourly-temp">${convertTemperature(hour.temperature)}°</span>
            <div class="hourly-details">
                <small style="font-size: 0.7em; opacity: 0.8;">
                    🌬️ ${hour.windSpeed}km/h<br>
                    ☁️ ${hour.clouds}%
                    ${weatherInfo ? `<br>${weatherInfo}` : ''}
                </small>
            </div>
        `;
        
        // Add detailed tooltip on hover
        hourElement.title = tooltipContent;
        
        // Add day separator for better UX
        if (index === 0 || hour.time.getDate() !== hoursData[index - 1].time.getDate()) {
            const dayLabel = document.createElement('div');
            dayLabel.className = 'day-separator';
            dayLabel.innerHTML = `<span>${hour.time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>`;
            hourlyContainer.appendChild(dayLabel);
        }
        
        hourlyContainer.appendChild(hourElement);
    });
}

// Display enhanced daily forecast (7 days)
function displayDailyForecast(dailyData) {
    dailyContainer.innerHTML = '';
    
    // Add or update toggle functionality for daily forecast
    const dailyForecastSection = document.querySelector('.daily-forecast');
    const existingToggle = dailyForecastSection.querySelector('.daily-toggle');
    
    if (existingToggle) {
        // Remove existing event listeners and re-add
        existingToggle.replaceWith(existingToggle.cloneNode(true));
        const newToggle = dailyForecastSection.querySelector('.daily-toggle');
        
        newToggle.addEventListener('click', function() {
            const isExpanded = this.getAttribute('data-expanded') === 'true';
            const dailyDetails = dailyContainer.querySelectorAll('.daily-details');
            
            if (isExpanded) {
                // Hide details
                dailyDetails.forEach(detail => detail.classList.remove('show-mobile'));
                this.innerHTML = 'Show Details <i class="fas fa-chevron-down"></i>';
                this.classList.remove('expanded');
                this.setAttribute('data-expanded', 'false');
            } else {
                // Show details
                dailyDetails.forEach(detail => detail.classList.add('show-mobile'));
                this.innerHTML = 'Hide Details <i class="fas fa-chevron-up"></i>';
                this.classList.add('expanded');
                this.setAttribute('data-expanded', 'true');
            }
        });
    }
    
    // Show all 7 days
    const daysToShow = Math.min(7, dailyData.length);
    const daysData = dailyData.slice(0, daysToShow);
    
    daysData.forEach((day, index) => {
        const dayElement = document.createElement('div');
        dayElement.className = 'daily-item enhanced';
        
        const dayName = index === 0 ? 'Today' : 
                       index === 1 ? 'Tomorrow' : 
                       day.date.toLocaleDateString('en-US', { weekday: 'long' });
        
        const dayShort = index === 0 ? 'Today' : 
                        index === 1 ? 'Tomorrow' : 
                        day.date.toLocaleDateString('en-US', { weekday: 'short' });
        
        const iconClass = weatherIcons[day.icon] || 'fas fa-question';
        
        // Enhanced weather information
        const windDirection = getWindDirection(day.windDirection || 0);
        const precipitationInfo = day.precipitation > 0 ? `💧 ${day.precipitation}mm` : '';
        const snowInfo = day.snow > 0 ? `❄️ ${day.snow}mm` : '';
        const weatherInfo = [precipitationInfo, snowInfo].filter(info => info).join(' ');
        
        // Calculate day/night temperature spread
        const tempSpread = day.high - day.low;
        const tempSpreadText = tempSpread > 15 ? 'High variation' : 
                              tempSpread > 8 ? 'Moderate variation' : 'Low variation';
        
        // Create detailed tooltip content
        const tooltipContent = `
            Date: ${day.date.toLocaleDateString()}
            High: ${convertTemperature(day.high)}° / Low: ${convertTemperature(day.low)}°
            Morning: ${convertTemperature(day.morning)}°
            Evening: ${convertTemperature(day.evening)}°
            Night: ${convertTemperature(day.night)}°
            Condition: ${day.condition}
            Humidity: ${day.humidity}%
            Wind: ${day.windSpeed} km/h ${windDirection}
            Clouds: ${day.clouds}%
            ${day.precipitation > 0 ? `Rain: ${day.precipitation}mm` : ''}
            ${day.snow > 0 ? `Snow: ${day.snow}mm` : ''}
            UV Index: ${day.uvIndex}
            Sunrise: ${day.sunrise.toLocaleTimeString()}
            Sunset: ${day.sunset.toLocaleTimeString()}
            Temperature variation: ${tempSpreadText}
        `.trim();
        
        dayElement.innerHTML = `
            <div class="day-main">
                <span class="day-name">${dayShort}</span>
                <span class="day-date">${day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
            <div class="weather-icon-container">
                <i class="${iconClass} weather-icon-small"></i>
            </div>
            <div class="condition-temp">
                <span class="daily-desc">${day.condition}</span>
                <span class="daily-temp">
                    <span class="high">${convertTemperature(day.high)}°</span>
                    <span class="separator">/</span>
                    <span class="low">${convertTemperature(day.low)}°</span>
                </span>
            </div>
            <div class="daily-details">
                <div class="detail-row">
                    <div class="detail-item-inline">
                        <i class="fas fa-sun"></i>
                        <span>UV ${day.uvIndex}</span>
                    </div>
                    <div class="detail-item-inline">
                        <i class="fas fa-wind"></i>
                        <span>${day.windSpeed}km/h</span>
                    </div>
                </div>
                <div class="detail-row">
                    <div class="detail-item-inline">
                        <i class="fas fa-tint"></i>
                        <span>${day.humidity}%</span>
                    </div>
                    <div class="detail-item-inline">
                        <i class="fas fa-cloud"></i>
                        <span>${day.clouds}%</span>
                    </div>
                </div>
                ${weatherInfo ? `
                    <div class="detail-row weather-events">
                        <span>${weatherInfo}</span>
                    </div>
                ` : ''}
                <div class="detail-row time-temps">
                    <div class="time-temp">
                        <span class="time-label">🌅 Morning</span>
                        <span class="temp-value">${convertTemperature(day.morning)}°</span>
                    </div>
                    <div class="time-temp">
                        <span class="time-label">🌆 Evening</span>
                        <span class="temp-value">${convertTemperature(day.evening)}°</span>
                    </div>
                    <div class="time-temp">
                        <span class="time-label">🌙 Night</span>
                        <span class="temp-value">${convertTemperature(day.night)}°</span>
                    </div>
                </div>
                <div class="detail-row sun-times">
                    <div class="sun-time">
                        <i class="fas fa-sun sunrise"></i>
                        <span>${day.sunrise.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                    </div>
                    <div class="sun-time">
                        <i class="fas fa-moon sunset"></i>
                        <span>${day.sunset.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                    </div>
                </div>
            </div>
        `;
        
        // Add detailed tooltip on hover
        dayElement.title = tooltipContent;
        
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

// Utility function to convert wind direction degrees to compass direction
function getWindDirection(degrees) {
    const directions = [
        'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
        'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'
    ];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
}

// Step 6: Main Weather Data Fetching Function
async function fetchWeatherData(lat, lon, locationName = null) {
    try {
        // Check if API key is configured
        if (WEATHER_API_CONFIG.API_KEY === 'YOUR_API_KEY_HERE') {
            console.log('Using sample data - API key not configured');
            return generateSampleWeatherData(locationName || 'Sample Location');
        }

        console.log(`Fetching comprehensive weather data for coordinates: ${lat}, ${lon}`);
        
        // Use One Call API 3.0 for comprehensive weather data
        const weatherData = await fetchOneCallWeatherData(lat, lon);

        if (weatherData) {
            // Process and format the comprehensive weather data
            const processedData = processOneCallAPIResponse(weatherData, locationName);
            console.log('✅ Comprehensive weather data fetched successfully:', {
                location: processedData.location,
                temperature: `${processedData.current.temperature}°C`,
                condition: processedData.current.condition,
                hourlyForecast: `${processedData.hourly.length} hours`,
                dailyForecast: `${processedData.daily.length} days`
            });
            return processedData;
        } else {
            throw new Error('Failed to fetch weather data from One Call API');
        }

    } catch (error) {
        console.error('Weather API Error:', error);
        
        // Fall back to sample data if API fails
        console.log('Falling back to sample weather data');
        return generateSampleWeatherData(locationName || 'Sample Location');
    }
}

// Step 6: Process One Call API Response (Enhanced with 7-day and 48-hour data)
function processOneCallAPIResponse(data, locationName = null) {
    try {
        // Extract current weather with enhanced details
        const current = {
            temperature: Math.round(data.current.temp),
            condition: data.current.weather[0].description,
            icon: data.current.weather[0].icon,
            feelsLike: Math.round(data.current.feels_like),
            humidity: data.current.humidity,
            windSpeed: Math.round(data.current.wind_speed * 3.6), // Convert m/s to km/h
            windDirection: data.current.wind_deg || 0,
            pressure: data.current.pressure,
            visibility: Math.round((data.current.visibility || 10000) / 1000), // Convert m to km
            uvIndex: Math.round(data.current.uvi || 0),
            clouds: data.current.clouds,
            dewPoint: Math.round(data.current.dew_point),
            sunrise: new Date(data.current.sunrise * 1000),
            sunset: new Date(data.current.sunset * 1000)
        };

        // Extract 48-hour hourly forecast (today and tomorrow)
        const hourly = data.hourly.slice(0, 48).map(hour => ({
            time: new Date(hour.dt * 1000),
            temperature: Math.round(hour.temp),
            feelsLike: Math.round(hour.feels_like),
            icon: hour.weather[0].icon,
            condition: hour.weather[0].description,
            humidity: hour.humidity,
            windSpeed: Math.round(hour.wind_speed * 3.6), // Convert m/s to km/h
            windDirection: hour.wind_deg || 0,
            pressure: hour.pressure,
            clouds: hour.clouds,
            precipitation: hour.rain ? (hour.rain['1h'] || 0) : 0, // Rain in mm
            snow: hour.snow ? (hour.snow['1h'] || 0) : 0, // Snow in mm
            uvIndex: Math.round(hour.uvi || 0)
        }));

        // Extract 7-day daily forecast with comprehensive details
        const daily = data.daily.slice(0, 7).map(day => ({
            date: new Date(day.dt * 1000),
            high: Math.round(day.temp.max),
            low: Math.round(day.temp.min),
            morning: Math.round(day.temp.morn),
            evening: Math.round(day.temp.eve),
            night: Math.round(day.temp.night),
            condition: day.weather[0].description,
            icon: day.weather[0].icon,
            humidity: day.humidity,
            windSpeed: Math.round(day.wind_speed * 3.6), // Convert m/s to km/h
            windDirection: day.wind_deg || 0,
            pressure: day.pressure,
            clouds: day.clouds,
            precipitation: day.rain || 0, // Rain in mm
            snow: day.snow || 0, // Snow in mm
            uvIndex: Math.round(day.uvi || 0),
            sunrise: new Date(day.sunrise * 1000),
            sunset: new Date(day.sunset * 1000),
            moonPhase: day.moon_phase
        }));

        // Determine location name
        const location = locationName || `${data.lat}, ${data.lon}`;

        return {
            location: location,
            coordinates: { lat: data.lat, lon: data.lon },
            timezone: data.timezone,
            current: current,
            hourly: hourly,
            daily: daily,
            source: 'OpenWeatherMap One Call API'
        };

    } catch (error) {
        console.error('Error processing One Call API response:', error);
        // Fall back to sample data if processing fails
        return generateSampleWeatherData(locationName || 'Sample Location');
    }
}

// Step 6: Convert Basic API Data to One Call Format (for fallback)
function convertBasicToOneCallFormat(currentData, forecastData) {
    try {
        // This is a fallback conversion when One Call API is not available
        const data = processWeatherAPIResponse(currentData, forecastData);
        
        // Add One Call API source identifier
        data.source = 'OpenWeatherMap Basic APIs (fallback)';
        data.timezone = currentData.timezone || 'UTC';
        
        return data;
        
    } catch (error) {
        console.error('Error converting basic API data:', error);
        return null;
    }
} 