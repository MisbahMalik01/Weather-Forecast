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
const iranianCitySelector = document.getElementById('iranian-city-selector');
const autocompleteDropdown = document.getElementById('autocomplete-dropdown');
const themeToggle = document.getElementById('theme-toggle');
const loadingElement = document.getElementById('loading');
const errorElement = document.getElementById('error-message');
const errorText = document.getElementById('error-text');

// Weather detail elements
const detailElements = {
    humidity: document.getElementById('humidity'),
    windSpeed: document.getElementById('wind-speed'),
    windDirection: document.getElementById('wind-direction'),
    pressure: document.getElementById('pressure'),
    visibility: document.getElementById('visibility'),
    uvIndex: document.getElementById('uv-index'),
    sunrise: document.getElementById('sunrise'),
    sunset: document.getElementById('sunset')
};

// Global variables
let currentWeatherData = null;
let currentUnit = 'celsius'; // 'celsius' or 'fahrenheit'
let currentLocation = null;
let userIPLocation = null; // Store IP-based location data
let refinedLocation = null; // Store refined Iranian provincial capital
let geolocationAttempted = false; // Track if geolocation was attempted
let selectedIranianCity = null; // Store manually selected Iranian city
let selectedHourlyIndex = -1; // Track selected hourly item

// Autocomplete variables
let autocompleteTimeout = null;
let selectedSuggestionIndex = -1;
let currentSuggestions = [];
let isAutocompleteVisible = false;

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

// Country flag emojis for autocomplete
const COUNTRY_FLAGS = {
    'IR': '🇮🇷', 'US': '🇺🇸', 'GB': '🇬🇧', 'CA': '🇨🇦', 'AU': '🇦🇺', 'DE': '🇩🇪', 'FR': '🇫🇷', 'IT': '🇮🇹', 'ES': '🇪🇸', 'NL': '🇳🇱',
    'BE': '🇧🇪', 'CH': '🇨🇭', 'AT': '🇦🇹', 'SE': '🇸🇪', 'NO': '🇳🇴', 'DK': '🇩🇰', 'FI': '🇫🇮', 'PL': '🇵🇱', 'CZ': '🇨🇿', 'SK': '🇸🇰',
    'HU': '🇭🇺', 'RO': '🇷🇴', 'BG': '🇧🇬', 'HR': '🇭🇷', 'SI': '🇸🇮', 'RS': '🇷🇸', 'BA': '🇧🇦', 'MK': '🇲🇰', 'AL': '🇦🇱', 'ME': '🇲🇪',
    'GR': '🇬🇷', 'TR': '🇹🇷', 'CY': '🇨🇾', 'MT': '🇲🇹', 'PT': '🇵🇹', 'LU': '🇱🇺', 'IE': '🇮🇪', 'IS': '🇮🇸', 'LI': '🇱🇮', 'MC': '🇲🇨',
    'SM': '🇸🇲', 'VA': '🇻🇦', 'AD': '🇦🇩', 'RU': '🇷🇺', 'UA': '🇺🇦', 'BY': '🇧🇾', 'MD': '🇲🇩', 'LT': '🇱🇹', 'LV': '🇱🇻', 'EE': '🇪🇪',
    'CN': '🇨🇳', 'JP': '🇯🇵', 'KR': '🇰🇷', 'IN': '🇮🇳', 'PK': '🇵🇰', 'AF': '🇦🇫', 'BD': '🇧🇩', 'LK': '🇱🇰', 'MV': '🇲🇻', 'NP': '🇳🇵',
    'BT': '🇧🇹', 'TH': '🇹🇭', 'MY': '🇲🇾', 'SG': '🇸🇬', 'ID': '🇮🇩', 'PH': '🇵🇭', 'VN': '🇻🇳', 'KH': '🇰🇭', 'LA': '🇱🇦', 'MM': '🇲🇲',
    'BR': '🇧🇷', 'AR': '🇦🇷', 'CL': '🇨🇱', 'PE': '🇵🇪', 'CO': '🇨🇴', 'VE': '🇻🇪', 'UY': '🇺🇾', 'PY': '🇵🇾', 'BO': '🇧🇴', 'EC': '🇪🇨',
    'MX': '🇲🇽', 'GT': '🇬🇹', 'BZ': '🇧🇿', 'SV': '🇸🇻', 'HN': '🇭🇳', 'NI': '🇳🇮', 'CR': '🇨🇷', 'PA': '🇵🇦', 'CU': '🇨🇺', 'JM': '🇯🇲',
    'EG': '🇪🇬', 'SA': '🇸🇦', 'AE': '🇦🇪', 'QA': '🇶🇦', 'BH': '🇧🇭', 'KW': '🇰🇼', 'OM': '🇴🇲', 'YE': '🇾🇪', 'JO': '🇯🇴', 'LB': '🇱🇧',
    'SY': '🇸🇾', 'IQ': '🇮🇶', 'IL': '🇮🇱', 'PS': '🇵🇸', 'ZA': '🇿🇦', 'NG': '🇳🇬', 'KE': '🇰🇪', 'ET': '🇪🇹', 'MA': '🇲🇦', 'DZ': '🇩🇿',
    'TN': '🇹🇳', 'LY': '🇱🇾', 'SD': '🇸🇩', 'GH': '🇬🇭', 'CI': '🇨🇮', 'SN': '🇸🇳', 'ML': '🇲🇱', 'BF': '🇧🇫', 'NE': '🇳🇪', 'TD': '🇹🇩'
};

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    updateCurrentDate();
    setupEventListeners();
    initializeTheme(); // Initialize theme
    
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
    
    // Autocomplete event listeners
    locationInput.addEventListener('input', handleAutocompleteInput);
    locationInput.addEventListener('keydown', handleAutocompleteKeydown);
    locationInput.addEventListener('focus', handleAutocompleteFocus);
    
    // Click outside to close autocomplete
    document.addEventListener('click', handleClickOutside);
    
    // Theme toggle event listener
    themeToggle.addEventListener('click', toggleTheme);
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
                <span style="font-size: 1.1em; font-weight: 500;">${cityData.name}</span>
                <span style="opacity: 0.7; margin-left: 5px;">(${cityData.province})</span>
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
                <span style="font-size: 1.1em; font-weight: 500;">${closestCapital.name}</span>
                <span style="opacity: 0.7; margin-left: 5px;">(${closestCapital.province})</span>
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
                <span style="font-size: 1.1em; font-weight: 500;">GPS Location</span>
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
                <span style="font-size: 1.1em; font-weight: 500;">${closestCapital.name}</span>
                <span style="opacity: 0.7; margin-left: 5px;">(${closestCapital.province})</span>
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

// Step 6: Main Weather Data Fetching Function
async function fetchWeatherData(lat, lon, locationName = null) {
    try {
        // Check if API key is configured
        if (WEATHER_API_CONFIG.API_KEY === 'YOUR_API_KEY_HERE') {
            console.log('Using sample data - API key not configured');
            return generateSampleWeatherData(locationName || 'Sample Location');
        }

        console.log(`Fetching weather data for coordinates: ${lat}, ${lon}`);
        
        // Use basic APIs first (these work with free API keys)
        const weatherData = await fetchBasicWeatherData(lat, lon);

        if (weatherData) {
            // Process and format the weather data
            const processedData = weatherData;
            processedData.location = locationName || processedData.location;
            
            console.log('✅ Weather data fetched successfully:', {
                location: processedData.location,
                temperature: `${processedData.current.temperature}°C`,
                condition: processedData.current.condition,
                hourlyForecast: `${processedData.hourly.length} hours`,
                dailyForecast: `${processedData.daily.length} days`,
                source: processedData.source
            });
            return processedData;
        } else {
            throw new Error('Failed to fetch weather data from APIs');
        }

    } catch (error) {
        console.error('Weather API Error:', error);
        
        // Fall back to sample data if API fails
        console.log('Falling back to sample weather data');
        return generateSampleWeatherData(locationName || 'Sample Location');
    }
}

// Step 6: Fetch Weather Data using Basic APIs
async function fetchBasicWeatherData(lat, lon) {
    try {
        console.log('Fetching weather using basic APIs...');
        
        // Fetch current weather and forecast in parallel
        const [currentData, forecastData] = await Promise.all([
            fetchCurrentWeather(lat, lon),
            fetchWeatherForecast(lat, lon)
        ]);

        if (currentData && forecastData) {
            // Process the API responses into our format
            const processedData = processWeatherAPIResponse(currentData, forecastData);
            processedData.source = 'OpenWeatherMap Basic APIs';
            return processedData;
        } else {
            console.error('Failed to fetch from basic APIs');
            return null;
        }
        
    } catch (error) {
        console.error('Error with basic APIs:', error);
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
    detailElements.visibility.textContent = `${data.current.visibility} km`;
    detailElements.humidity.textContent = `${data.current.humidity}%`;
    detailElements.windSpeed.textContent = `${data.current.windSpeed} km/h`;
    detailElements.pressure.textContent = `${data.current.pressure} hPa`;
    detailElements.uvIndex.textContent = data.current.uvIndex;
    document.getElementById('clouds').textContent = `${data.current.clouds}%`;
    
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
    
    // Show next 48 hours for comprehensive forecast
    const hoursToShow = Math.min(48, hourlyData.length);
    const hoursData = hourlyData.slice(0, hoursToShow);
    
    // Add mobile toggle button for hourly details
    const hourlyForecastSection = hourlyContainer.closest('.hourly-forecast');
    const existingHeader = hourlyForecastSection.querySelector('.forecast-header');
    
    if (!existingHeader) {
        const headerDiv = document.createElement('div');
        headerDiv.className = 'forecast-header';
        
        const title = hourlyForecastSection.querySelector('h3');
        headerDiv.appendChild(title);
        
        hourlyForecastSection.insertBefore(headerDiv, hourlyContainer);
    }
    
    hoursData.forEach((hour, index) => {
        const hourElement = document.createElement('div');
        hourElement.className = 'hourly-item enhanced';
        hourElement.dataset.index = index;
        
        // Format time using the location's timezone instead of browser's local time
        const timeString = formatTimeWithTimezone(hour.time, currentWeatherData?.timezone);
        
        const iconClass = weatherIcons[hour.icon] || 'fas fa-question';
        
        // Add enhanced information tooltips
        const windDirection = getWindDirection(hour.windDirection || 0);
        const precipitationInfo = hour.precipitation > 0 ? `💧 ${hour.precipitation}mm` : '';
        const snowInfo = hour.snow > 0 ? `❄️ ${hour.snow}mm` : '';
        const weatherInfo = [precipitationInfo, snowInfo].filter(info => info).join(' ');
        
        // Create detailed tooltip content with timezone-aware formatting
        const tooltipContent = `
        `.trim();
        

        hourElement.innerHTML = `
            <span class="hour">${timeString}</span>
            <i class="${iconClass} weather-icon-small"></i>
            <span class="hourly-temp">${convertTemperature(hour.temperature)}°</span>
        `;
        
        // Add detailed tooltip on hover
        hourElement.title = tooltipContent;
        
        // Add click event listener for showing details at bottom
        hourElement.addEventListener('click', () => showHourlyDetails(hour, index, hourElement));
        
        // Add day separator for better UX using timezone-aware date
        if (index === 0 || !isSameDay(hour.time, hoursData[index - 1].time, currentWeatherData?.timezone)) {
            const dayLabel = document.createElement('div');
            dayLabel.className = 'day-separator';
            const dayString = formatDateWithTimezone(hour.time, currentWeatherData?.timezone);
            dayLabel.innerHTML = `<span>${dayString}</span>`;
            hourlyContainer.appendChild(dayLabel);
        }
        
        hourlyContainer.appendChild(hourElement);
    });
    
    // Create hourly details panel if it doesn't exist
    createHourlyDetailsPanel(hourlyForecastSection);
}

// Create the hourly details panel at the bottom
function createHourlyDetailsPanel(hourlyForecastSection) {
    // Remove existing panel if it exists
    const existingPanel = hourlyForecastSection.querySelector('.hourly-details-panel');
    if (existingPanel) {
        existingPanel.remove();
    }
    
    // Create new panel
    const detailsPanel = document.createElement('div');
    detailsPanel.className = 'hourly-details-panel';
    detailsPanel.innerHTML = `
        <div class="hourly-details-header">
            <div class="hourly-details-title">
                <i class="fas fa-info-circle"></i>
                <span>Hourly Details</span>
            </div>
            <div class="hourly-details-time"></div>
        </div>
        <div class="hourly-details-content"></div>
    `;
    
    hourlyForecastSection.appendChild(detailsPanel);
}

// Show detailed information for selected hourly item
function showHourlyDetails(hourData, index, hourElement) {
    const hourlyForecastSection = hourlyContainer.closest('.hourly-forecast');
    const detailsPanel = hourlyForecastSection.querySelector('.hourly-details-panel');
    const detailsTime = detailsPanel.querySelector('.hourly-details-time');
    const detailsContent = detailsPanel.querySelector('.hourly-details-content');
    
    // Check if this item is already selected - if so, hide the panel
    if (hourElement.classList.contains('selected')) {
        // Hide the panel
        detailsPanel.classList.remove('show');
        // Remove selected state from all items
        document.querySelectorAll('.hourly-item').forEach(item => item.classList.remove('selected'));
        selectedHourlyIndex = -1;
        return;
    }
    
    // Update selected state
    document.querySelectorAll('.hourly-item').forEach(item => item.classList.remove('selected'));
    hourElement.classList.add('selected');
    selectedHourlyIndex = index;
    
    // Update time display using timezone-aware formatting
    detailsTime.textContent = formatDetailedDateTimeWithTimezone(hourData.time, currentWeatherData?.timezone);
    
    // Get wind direction
    const windDirection = getWindDirection(hourData.windDirection || 0);
    
    // Create details content
    const detailsHTML = `
        <div class="hourly-detail-item">
            <i class="fas fa-thermometer-half"></i>
            <div class="hourly-detail-info">
                <div class="hourly-detail-label">Temperature</div>
                <div class="hourly-detail-value">${convertTemperature(hourData.temperature)}°</div>
            </div>
        </div>
        <div class="hourly-detail-item">
            <i class="fas fa-thermometer-quarter"></i>
            <div class="hourly-detail-info">
                <div class="hourly-detail-label">Feels Like</div>
                <div class="hourly-detail-value">${convertTemperature(hourData.feelsLike)}°</div>
            </div>
        </div>
        <div class="hourly-detail-item">
            <i class="fas fa-tint"></i>
            <div class="hourly-detail-info">
                <div class="hourly-detail-label">Humidity</div>
                <div class="hourly-detail-value">${hourData.humidity}%</div>
            </div>
        </div>
        <div class="hourly-detail-item">
            <i class="fas fa-wind"></i>
            <div class="hourly-detail-info">
                <div class="hourly-detail-label">Wind</div>
                <div class="hourly-detail-value">${hourData.windSpeed} km/h ${windDirection}</div>
            </div>
        </div>
        <div class="hourly-detail-item">
            <i class="fas fa-cloud"></i>
            <div class="hourly-detail-info">
                <div class="hourly-detail-label">Clouds</div>
                <div class="hourly-detail-value">${hourData.clouds}%</div>
            </div>
        </div>
        <div class="hourly-detail-item">
            <i class="fas fa-thermometer-half"></i>
            <div class="hourly-detail-info">
                <div class="hourly-detail-label">Pressure</div>
                <div class="hourly-detail-value">${hourData.pressure} hPa</div>
            </div>
        </div>
        ${hourData.precipitation > 0 ? `
        <div class="hourly-detail-item">
            <i class="fas fa-cloud-rain"></i>
            <div class="hourly-detail-info">
                <div class="hourly-detail-label">Precipitation</div>
                <div class="hourly-detail-value">${hourData.precipitation} mm</div>
            </div>
        </div>
        ` : ''}
        ${hourData.snow > 0 ? `
        <div class="hourly-detail-item">
            <i class="fas fa-snowflake"></i>
            <div class="hourly-detail-info">
                <div class="hourly-detail-label">Snow</div>
                <div class="hourly-detail-value">${hourData.snow} mm</div>
            </div>
        </div>
        ` : ''}
        <div class="hourly-detail-item">
            <i class="fas fa-sun"></i>
            <div class="hourly-detail-info">
                <div class="hourly-detail-label">UV Index</div>
                <div class="hourly-detail-value">${hourData.uvIndex}</div>
            </div>
        </div>
    `;
    
    detailsContent.innerHTML = detailsHTML;
    
    // Show the panel with animation
    detailsPanel.classList.add('show');
    
    // Scroll to the panel smoothly
    setTimeout(() => {
        detailsPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 200);
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
            const dailyItems = dailyContainer.querySelectorAll('.daily-item');
            
            if (isExpanded) {
                // Hide details
                dailyDetails.forEach(detail => detail.classList.remove('show-mobile'));
                dailyItems.forEach(item => item.classList.remove('details-shown'));
                this.innerHTML = 'Show Details <i class="fas fa-chevron-down"></i>';
                this.classList.remove('expanded');
                this.setAttribute('data-expanded', 'false');
            } else {
                // Show details
                dailyDetails.forEach(detail => detail.classList.add('show-mobile'));
                dailyItems.forEach(item => item.classList.add('details-shown'));
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
        
        // Add click event listener for individual day toggle
        dayElement.addEventListener('click', () => toggleDailyDetails(dayElement, index));
        
        dailyContainer.appendChild(dayElement);
    });
}

// Toggle details for individual daily forecast item
function toggleDailyDetails(dayElement, dayIndex) {
    const detailsElement = dayElement.querySelector('.daily-details');
    const isCurrentlyShown = detailsElement.classList.contains('show-mobile');
    
    if (isCurrentlyShown) {
        // Hide details for this day
        detailsElement.classList.remove('show-mobile');
        dayElement.classList.remove('details-shown');
    } else {
        // Show details for this day
        detailsElement.classList.add('show-mobile');
        dayElement.classList.add('details-shown');
        
        // Scroll to the element smoothly after a short delay for animation
        setTimeout(() => {
            dayElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'nearest',
                inline: 'nearest'
            });
        }, 200);
    }
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

// Timezone-aware formatting functions for hourly forecast
function formatTimeWithTimezone(date, timezone) {
    if (!timezone) {
        // Fallback to local time if timezone is not available
        return date.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            hour12: true 
        });
    }
    
    try {
        return date.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            hour12: true,
            timeZone: timezone
        });
    } catch (error) {
        console.warn('Invalid timezone:', timezone, 'falling back to local time');
        return date.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            hour12: true 
        });
    }
}

function formatDateWithTimezone(date, timezone) {
    if (!timezone) {
        return date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
        });
    }
    
    try {
        return date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric',
            timeZone: timezone
        });
    } catch (error) {
        console.warn('Invalid timezone:', timezone, 'falling back to local time');
        return date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
        });
    }
}

function formatDateTimeWithTimezone(date, timezone) {
    if (!timezone) {
        return date.toLocaleString('en-US');
    }
    
    try {
        return date.toLocaleString('en-US', {
            timeZone: timezone
        });
    } catch (error) {
        console.warn('Invalid timezone:', timezone, 'falling back to local time');
        return date.toLocaleString('en-US');
    }
}

function formatDetailedDateTimeWithTimezone(date, timezone) {
    if (!timezone) {
        return date.toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }
    
    try {
        return date.toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            timeZone: timezone
        });
    } catch (error) {
        console.warn('Invalid timezone:', timezone, 'falling back to local time');
        return date.toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }
}

function isSameDay(date1, date2, timezone) {
    if (!timezone) {
        return date1.getDate() === date2.getDate() && 
               date1.getMonth() === date2.getMonth() && 
               date1.getFullYear() === date2.getFullYear();
    }
    
    try {
        const date1Str = date1.toLocaleDateString('en-US', { timeZone: timezone });
        const date2Str = date2.toLocaleDateString('en-US', { timeZone: timezone });
        return date1Str === date2Str;
    } catch (error) {
        console.warn('Invalid timezone:', timezone, 'falling back to local comparison');
        return date1.getDate() === date2.getDate() && 
               date1.getMonth() === date2.getMonth() && 
               date1.getFullYear() === date2.getFullYear();
    }
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

// =============================================================================
// AUTOCOMPLETE FUNCTIONALITY
// =============================================================================

// Handle autocomplete input with debouncing
function handleAutocompleteInput(event) {
    const query = event.target.value.trim();
    
    // Clear previous timeout
    if (autocompleteTimeout) {
        clearTimeout(autocompleteTimeout);
    }
    
    // Reset selection index
    selectedSuggestionIndex = -1;
    
    if (query.length < 2) {
        hideAutocomplete();
        return;
    }
    
    // Debounce the search to avoid too many API calls
    autocompleteTimeout = setTimeout(() => {
        searchCities(query);
    }, 300);
}

// Handle keyboard navigation in autocomplete
function handleAutocompleteKeydown(event) {
    if (!isAutocompleteVisible || currentSuggestions.length === 0) {
        return;
    }
    
    switch (event.key) {
        case 'ArrowDown':
            event.preventDefault();
            selectedSuggestionIndex = (selectedSuggestionIndex + 1) % currentSuggestions.length;
            updateSuggestionHighlight();
            break;
            
        case 'ArrowUp':
            event.preventDefault();
            selectedSuggestionIndex = selectedSuggestionIndex <= 0 
                ? currentSuggestions.length - 1 
                : selectedSuggestionIndex - 1;
            updateSuggestionHighlight();
            break;
            
        case 'Enter':
            event.preventDefault();
            if (selectedSuggestionIndex >= 0) {
                selectSuggestion(currentSuggestions[selectedSuggestionIndex]);
            } else {
                handleSearch();
            }
            break;
            
        case 'Escape':
            hideAutocomplete();
            locationInput.blur();
            break;
    }
}

// Handle focus on search input
function handleAutocompleteFocus(event) {
    const query = event.target.value.trim();
    if (query.length >= 2 && currentSuggestions.length > 0) {
        showAutocomplete();
    }
}

// Handle clicks outside autocomplete to close it
function handleClickOutside(event) {
    if (!event.target.closest('.autocomplete-wrapper')) {
        hideAutocomplete();
    }
}

// Search for cities using OpenWeatherMap Geocoding API
async function searchCities(query) {
    try {
        showAutocompleteLoading();
        
        // Check if API key is configured
        if (WEATHER_API_CONFIG.API_KEY === 'YOUR_API_KEY_HERE') {
            console.log('API key not configured, showing sample cities');
            showSampleCities(query);
            return;
        }

        const url = `${WEATHER_API_CONFIG.GEOCODING_URL}${WEATHER_API_CONFIG.ENDPOINTS.GEOCODING}?q=${encodeURIComponent(query)}&limit=8&appid=${WEATHER_API_CONFIG.API_KEY}`;
        
        console.log(`Searching cities for: "${query}"`);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Geocoding API error: ${response.status}`);
        }
        
        const cities = await response.json();
        
        if (cities && cities.length > 0) {
            // Process and format city data
            const processedCities = cities.map(city => ({
                name: city.name,
                country: city.country,
                state: city.state || '',
                lat: city.lat,
                lon: city.lon,
                displayName: `${city.name}${city.state ? `, ${city.state}` : ''}, ${city.country}`
            }));
            
            currentSuggestions = processedCities;
            displaySuggestions(processedCities);
            
            console.log(`Found ${cities.length} cities for "${query}"`);
        } else {
            currentSuggestions = [];
            showNoResults();
        }
        
    } catch (error) {
        console.error('Error searching cities:', error);
        showNoResults();
    }
}

// Show sample cities when API is not configured
function showSampleCities(query) {
    const sampleCities = [
        { name: 'Tehran', country: 'IR', state: 'Tehran', lat: 35.6892, lon: 51.3890, displayName: 'Tehran, Tehran, IR' },
        { name: 'New York', country: 'US', state: 'NY', lat: 40.7128, lon: -74.0060, displayName: 'New York, NY, US' },
        { name: 'London', country: 'GB', state: '', lat: 51.5074, lon: -0.1278, displayName: 'London, GB' },
        { name: 'Paris', country: 'FR', state: '', lat: 48.8566, lon: 2.3522, displayName: 'Paris, FR' },
        { name: 'Tokyo', country: 'JP', state: '', lat: 35.6762, lon: 139.6503, displayName: 'Tokyo, JP' }
    ].filter(city => 
        city.name.toLowerCase().includes(query.toLowerCase()) ||
        city.country.toLowerCase().includes(query.toLowerCase())
    );

    currentSuggestions = sampleCities;
    displaySuggestions(sampleCities);
}

// Display autocomplete suggestions
function displaySuggestions(cities) {
    autocompleteDropdown.innerHTML = '';
    
    cities.forEach((city, index) => {
        const item = document.createElement('div');
        item.className = 'autocomplete-item';
        item.dataset.index = index;
        
        const flag = COUNTRY_FLAGS[city.country] || '🌍';
        
        item.innerHTML = `
            <div class="city-info">
                <div class="city-name">${city.name}</div>
                <div class="city-details">
                    <span class="country-flag">${flag}</span>
                    ${city.state ? `${city.state}, ` : ''}${getCountryName(city.country)}
                </div>
            </div>
            <div class="country-code">${city.country}</div>
        `;
        
        // Add click event listener
        item.addEventListener('click', () => selectSuggestion(city));
        
        autocompleteDropdown.appendChild(item);
    });
    
    showAutocomplete();
    selectedSuggestionIndex = -1;
}

// Show autocomplete loading state
function showAutocompleteLoading() {
    autocompleteDropdown.innerHTML = `
        <div class="autocomplete-loading">
            <i class="fas fa-spinner"></i>
            Searching cities...
        </div>
    `;
    showAutocomplete();
}

// Show no results message
function showNoResults() {
    autocompleteDropdown.innerHTML = `
        <div class="autocomplete-no-results">
            <i class="fas fa-search"></i>
            No cities found. Try a different search term.
        </div>
    `;
    showAutocomplete();
    currentSuggestions = [];
}

// Show autocomplete dropdown
function showAutocomplete() {
    autocompleteDropdown.classList.remove('hidden');
    isAutocompleteVisible = true;
}

// Hide autocomplete dropdown
function hideAutocomplete() {
    autocompleteDropdown.classList.add('hidden');
    isAutocompleteVisible = false;
    selectedSuggestionIndex = -1;
}

// Update visual highlight for keyboard navigation
function updateSuggestionHighlight() {
    const items = autocompleteDropdown.querySelectorAll('.autocomplete-item');
    
    items.forEach((item, index) => {
        if (index === selectedSuggestionIndex) {
            item.classList.add('highlighted');
        } else {
            item.classList.remove('highlighted');
        }
    });
}

// Handle suggestion selection
function selectSuggestion(city) {
    console.log('City selected from autocomplete:', {
        name: city.name,
        country: city.country,
        state: city.state,
        coordinates: `${city.lat}, ${city.lon}`
    });
    
    // Update input field
    locationInput.value = city.displayName;
    
    // Hide autocomplete
    hideAutocomplete();
    
    // Update location and fetch weather
    updateLocationFromAutocomplete(city);
    
    // Clear Iranian city selector since user selected from autocomplete
    iranianCitySelector.value = '';
    iranianCitySelector.classList.remove('selected');
    selectedIranianCity = null;
}

// Update current location based on autocomplete selection
function updateLocationFromAutocomplete(city) {
    // Update current location data
    currentLocation = {
        name: city.displayName,
        lat: city.lat,
        lon: city.lon,
        country: city.country,
        state: city.state,
        source: 'autocomplete'
    };
    
    // Update location display
    cityNameElement.innerHTML = `
        <span>${city.name}${city.state ? `, ${city.state}` : ''}</span>
    `;
    
    // Fetch weather data for selected city
    getWeatherByCoordinates(city.lat, city.lon, {
        name: city.displayName,
        source: 'Autocomplete selection',
        country: city.country
    });
}

// Get country name from country code
function getCountryName(countryCode) {
    const countryNames = {
        'IR': 'Iran', 'US': 'United States', 'GB': 'United Kingdom', 'CA': 'Canada', 'AU': 'Australia',
        'DE': 'Germany', 'FR': 'France', 'IT': 'Italy', 'ES': 'Spain', 'NL': 'Netherlands',
        'BE': 'Belgium', 'CH': 'Switzerland', 'AT': 'Austria', 'SE': 'Sweden', 'NO': 'Norway',
        'DK': 'Denmark', 'FI': 'Finland', 'PL': 'Poland', 'CZ': 'Czech Republic', 'SK': 'Slovakia',
        'HU': 'Hungary', 'RO': 'Romania', 'BG': 'Bulgaria', 'HR': 'Croatia', 'SI': 'Slovenia',
        'RS': 'Serbia', 'BA': 'Bosnia and Herzegovina', 'MK': 'North Macedonia', 'AL': 'Albania',
        'ME': 'Montenegro', 'GR': 'Greece', 'TR': 'Turkey', 'CY': 'Cyprus', 'MT': 'Malta',
        'PT': 'Portugal', 'LU': 'Luxembourg', 'IE': 'Ireland', 'IS': 'Iceland', 'RU': 'Russia',
        'UA': 'Ukraine', 'BY': 'Belarus', 'MD': 'Moldova', 'LT': 'Lithuania', 'LV': 'Latvia',
        'EE': 'Estonia', 'CN': 'China', 'JP': 'Japan', 'KR': 'South Korea', 'IN': 'India',
        'PK': 'Pakistan', 'AF': 'Afghanistan', 'BD': 'Bangladesh', 'LK': 'Sri Lanka', 'TH': 'Thailand',
        'MY': 'Malaysia', 'SG': 'Singapore', 'ID': 'Indonesia', 'PH': 'Philippines', 'VN': 'Vietnam',
        'BR': 'Brazil', 'AR': 'Argentina', 'CL': 'Chile', 'PE': 'Peru', 'CO': 'Colombia',
        'MX': 'Mexico', 'EG': 'Egypt', 'SA': 'Saudi Arabia', 'AE': 'United Arab Emirates',
        'QA': 'Qatar', 'BH': 'Bahrain', 'KW': 'Kuwait', 'OM': 'Oman', 'JO': 'Jordan',
        'LB': 'Lebanon', 'SY': 'Syria', 'IQ': 'Iraq', 'IL': 'Israel', 'ZA': 'South Africa',
        'NG': 'Nigeria', 'KE': 'Kenya', 'ET': 'Ethiopia', 'MA': 'Morocco', 'DZ': 'Algeria',
        'TN': 'Tunisia', 'LY': 'Libya'
    };
    
    return countryNames[countryCode] || countryCode;
}

// =============================================================================
// END AUTOCOMPLETE FUNCTIONALITY
// =============================================================================

// =============================================================================
// THEME FUNCTIONALITY
// =============================================================================

// Initialize theme on page load
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    const body = document.body;
    const themeIcon = themeToggle.querySelector('i');
    const themeText = themeToggle.querySelector('.theme-text');
    
    if (savedTheme === 'light') {
        body.setAttribute('data-theme', 'light');
        themeIcon.className = 'fas fa-sun';
        themeText.textContent = 'Light';
    } else {
        body.removeAttribute('data-theme');
        themeIcon.className = 'fas fa-moon';
        themeText.textContent = 'Dark';
    }
}

// Toggle between light and dark themes
function toggleTheme() {
    const body = document.body;
    const themeIcon = themeToggle.querySelector('i');
    const themeText = themeToggle.querySelector('.theme-text');
    const currentTheme = body.getAttribute('data-theme');
    
    if (currentTheme === 'light') {
        // Switch to dark theme
        body.removeAttribute('data-theme');
        themeIcon.className = 'fas fa-moon';
        themeText.textContent = 'Dark';
        localStorage.setItem('theme', 'dark');
    } else {
        // Switch to light theme
        body.setAttribute('data-theme', 'light');
        themeIcon.className = 'fas fa-sun';
        themeText.textContent = 'Light';
        localStorage.setItem('theme', 'light');
    }
}

// Step 6: Fetch comprehensive weather data using One Call API 3.0 (paid subscription)
async function fetchOneCallWeatherData(lat, lon) {
    try {
        // Use One Call API 3.0 endpoint
        const url = `${WEATHER_API_CONFIG.ONECALL_URL}${WEATHER_API_CONFIG.ENDPOINTS.ONECALL}?lat=${lat}&lon=${lon}&appid=${WEATHER_API_CONFIG.API_KEY}&units=${WEATHER_API_CONFIG.DEFAULT_PARAMS.units}&lang=${WEATHER_API_CONFIG.DEFAULT_PARAMS.lang}`;
        
        console.log('Fetching comprehensive weather data using One Call API 3.0...');
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`One Call API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ One Call API 3.0 data received successfully');
        return data;
        
    } catch (error) {
        console.error('Error fetching One Call API 3.0 data:', error);
        
        // If One Call API fails, fall back to basic APIs
        console.log('Falling back to basic APIs...');
        return await fetchBasicWeatherData(lat, lon);
    }
}

// Step 6: Get Coordinates from Location Name using OpenWeatherMap Geocoding API