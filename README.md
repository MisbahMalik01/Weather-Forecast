# 🌦️ Weather Forecast Web Application

A modern, responsive weather forecast application that automatically detects your location and provides comprehensive weather information with a beautiful glass-morphism design.

## 🚀 Features

### 🌍 Automatic Location Detection & Refinement
- **IP-Based Location Detection**: Automatically detects user location on page load using free IP geolocation APIs
- **Iranian Capital Refinement**: Automatically refines location to the closest Iranian provincial capital for users in Iran, Afghanistan, and neighboring regions
- **Distance Calculation**: Uses Haversine formula to calculate precise distances to all 31 Iranian provincial capitals
- **Fallback System**: Uses multiple APIs for reliable location detection:
  - Primary: [IP-API.com](http://ip-api.com/) (1,000 requests/day free)
  - Backup: [ipapi.co](https://ipapi.co/) (additional fallback)
- **Smart Regional Detection**: Works within 1000km radius, covering Iran, Afghanistan, Iraq, Turkey, Pakistan, and neighboring countries
- **Manual Location Override**: Users can search for any city manually

### 📍 Precise GPS Location (Step 4)
- **Browser Geolocation API**: High-precision GPS location with comprehensive error handling
- **Enhanced Accuracy**: Requests GPS with high accuracy settings and 15-second timeout
- **Smart Permissions**: Graceful handling of location permission denial
- **Error Recovery**: Detailed error messages with user-friendly solutions
- **Visual Feedback**: Dynamic button states showing loading, success, and error states
- **GPS Refinement**: Automatically finds closest Iranian capital from precise GPS coordinates
- **Accuracy Display**: Shows GPS accuracy in meters (High/Medium/Low accuracy indicators)
- **Fallback Support**: Works seamlessly with IP-based detection if GPS fails

### 🏛️ Manual Iranian City Selection (Step 5)
- **Complete Dropdown Menu**: All 31 Iranian provincial capitals in an organized dropdown
- **Smart Population Sorting**: Cities ordered by population (largest first) for better user experience
- **Visual Population Indicators**: Different styling for large (>1M), medium (500K-1M), and small (<500K) cities
- **Province Information**: Shows both city name and province in dropdown (e.g., "Tehran (Tehran)")
- **Population Tooltips**: Hover over cities to see detailed population information
- **Synchronized Selection**: Dropdown automatically updates when location is auto-detected or GPS-refined
- **Manual Override**: Users can manually select any Iranian capital to override auto-detection
- **Visual Feedback**: Selected cities are highlighted with special styling and icons
- **Reset Functionality**: Manual search resets dropdown selection automatically

### 🌤️ Real Weather Forecast (Step 6) - **NEW!**
- **OpenWeatherMap API Integration**: Free tier with 1,000 API calls/day
- **Real-Time Weather Data**: Current conditions, temperature, humidity, wind speed, pressure
- **Extended Forecasts**: 
  - **Hourly Forecast**: Next 24 hours with 3-hour intervals
  - **Daily Forecast**: 5-day extended forecast with high/low temperatures
- **Comprehensive Weather Details**: 
  - Current temperature and "feels like" temperature
  - Weather conditions with descriptive text
  - Atmospheric pressure, humidity, and visibility
  - Wind speed and direction
  - Cloud coverage percentage
- **Weather Icons**: Real-time weather icons from OpenWeatherMap
- **Automatic Fallback**: Uses sample data when API key is not configured
- **Error Handling**: Graceful API failure handling with informative messages
- **Data Source Transparency**: Shows whether data is from real API or sample data

### 🏛️ Iranian Provincial Capitals Database
Complete database of all 31 Iranian provincial capitals with:
- **Accurate Coordinates**: Precise latitude and longitude for each capital
- **Province Information**: Full province names and administrative details
- **Population Data**: Current population figures for reference
- **Geographic Coverage**: From Tehran (8.7M) to Yasuj (134K) covering all provinces

### 🎨 User Interface
- **Modern Design**: Glass-morphism effects with beautiful gradients
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile
- **Smooth Animations**: Hover effects and loading animations
- **Weather Icons**: Font Awesome weather icons for visual representation
- **Loading States**: Professional loading indicators
- **Error Handling**: User-friendly error messages
- **Location Transparency**: Shows original IP location, refined capital, and distance

## 📁 Project Structure

```
Weather-Forecast/
├── index.html          # Main HTML structure
├── style.css           # Modern CSS styling with responsive design
├── script.js           # JavaScript functionality and API integration
└── README.md          # Project documentation
```

## 🔧 Technology Stack

- **Frontend**: Pure HTML5, CSS3, JavaScript (ES6+)
- **Styling**: CSS Grid, Flexbox, CSS Variables, Animations
- **APIs Used**:
  - **OpenWeatherMap API** for real weather data (Step 6)
  - Browser Geolocation API for precise GPS coordinates
  - IP-API.com for IP geolocation
  - ipapi.co as backup geolocation service
  - Font Awesome for icons
- **Features**: Responsive design, localStorage, comprehensive error handling
- **Algorithms**: Haversine formula for distance calculation

## 🌐 API Integration & Location Processing

### Step 6: Weather Forecast API Integration ⭐

#### OpenWeatherMap API Setup

**Free Tier Benefits:**
- 1,000 API calls per day
- Current weather data
- 5-day/3-hour forecast
- No credit card required for free tier

**Setup Instructions:**
1. **Get Your Free API Key**:
   ```
   1. Visit: https://openweathermap.org/api
   2. Click "Sign Up" for free account
   3. Verify your email address
   4. Go to "API Keys" tab in your account
   5. Copy your API key
   ```

2. **Configure the Application**:
   ```javascript
   // In script.js, replace YOUR_API_KEY_HERE with your actual API key
   const WEATHER_API_CONFIG = {
       API_KEY: 'your_actual_api_key_here', // Replace this
       // ... rest of config
   };
   ```

3. **Test the Integration**:
   - Open browser developer console
   - Look for "✅ Weather API configured successfully" message
   - Real weather data will now be fetched automatically

#### Weather API Endpoints Used

**Current Weather API:**
```
https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API_KEY}&units=metric
```

**5-Day Forecast API:**
```
https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={API_KEY}&units=metric
```

#### Weather Data Processing

**Current Weather Extraction:**
```javascript
const current = {
    temperature: Math.round(currentData.main.temp),
    condition: currentData.weather[0].description,
    icon: currentData.weather[0].icon,
    feelsLike: Math.round(currentData.main.feels_like),
    humidity: currentData.main.humidity,
    windSpeed: Math.round(currentData.wind.speed * 3.6), // m/s to km/h
    pressure: currentData.main.pressure,
    visibility: Math.round((currentData.visibility || 10000) / 1000),
    clouds: currentData.clouds.all
};
```

**Forecast Data Processing:**
```javascript
// Hourly forecast (next 24 hours)
const hourly = forecastData.list.slice(0, 8).map(item => ({
    time: new Date(item.dt * 1000),
    temperature: Math.round(item.main.temp),
    icon: item.weather[0].icon
}));

// Daily forecast (5 days with high/low temperatures)
const daily = extractDailyForecast(forecastData.list);
```

#### Error Handling & Fallback System

**API Key Validation:**
```javascript
function checkWeatherAPIConfiguration() {
    if (WEATHER_API_CONFIG.API_KEY === 'YOUR_API_KEY_HERE') {
        // Show setup instructions
        // Use sample data until configured
    }
}
```

**Graceful Degradation:**
- **API Not Configured**: Uses realistic sample data
- **API Request Failed**: Falls back to sample data
- **Network Issues**: Displays helpful error messages
- **Rate Limit Exceeded**: Provides clear guidance

### Step 1: IP Geolocation APIs

The application uses free APIs from [publicapis.dev](https://publicapis.dev/) for location detection:

#### Primary API: IP-API.com
```javascript
const IP_API_BASE_URL = 'http://ip-api.com/json';
```
- **Free Tier**: 1,000 requests/day
- **Data Provided**: IP, city, region, country, coordinates, timezone, ISP
- **No API Key Required**

#### Backup API: ipapi.co
```javascript
const BACKUP_IP_API_URL = 'https://ipapi.co/json';
```
- **Free Tier**: 1,000 requests/day
- **Fallback**: Used if primary API fails
- **No API Key Required**

### Step 2: Location Refinement Algorithm

#### Distance Calculation (Haversine Formula)
```javascript
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    // Calculate great-circle distance between two points
    return distance; // in kilometers
}
```

#### Closest Capital Detection
```javascript
function findClosestIranianCapital(lat, lon) {
    // Calculates distance to all 31 Iranian provincial capitals
    // Returns closest capital within 1000km radius
    // Covers Iran, Afghanistan, Iraq, Turkey, Pakistan, etc.
}
```

### Step 3: Smart Location Display
The app shows comprehensive location information:
```
🎯 Tehran (Tehran Province)
🎯 Refined to closest Iranian capital
📍 Original: Karaj, Iran  
📏 Distance: 34km away
🌐 IP: 185.xxx.xxx.xxx
```

### Step 4: Browser Geolocation API with Error Handling

#### Enhanced GPS Location Request
```javascript
function getCurrentLocationWithGeolocation() {
    const geolocationOptions = {
        enableHighAccuracy: true,    // Request GPS if available
        timeout: 15000,              // 15 seconds timeout
        maximumAge: 300000           // Accept cached position up to 5 minutes old
    };
    
    navigator.geolocation.getCurrentPosition(
        handleGeolocationSuccess,
        handleGeolocationError,
        geolocationOptions
    );
}
```

#### Comprehensive Error Handling
```javascript
const GEOLOCATION_ERRORS = {
    1: 'PERMISSION_DENIED',     // User denied location access
    2: 'POSITION_UNAVAILABLE', // Location information unavailable
    3: 'TIMEOUT'                // Location request timed out
};
```

#### GPS Location Display
```
📍 Isfahan (Isfahan Province)
🎯 Refined from precise GPS location
📍 GPS: 32.6546°, 51.6680°
📏 Distance: 0km to capital
🎯 Accuracy: 5m (High accuracy)
```

### Step 5: Manual Iranian City Selection

#### Complete Dropdown Implementation
```javascript
function populateIranianCitySelector() {
    // Sort cities by population (largest first) for better UX
    const sortedCities = [...IRANIAN_PROVINCIAL_CAPITALS].sort((a, b) => b.population - a.population);
    
    // Add cities with population-based styling and tooltips
    sortedCities.forEach(city => {
        const option = document.createElement('option');
        option.value = city.name;
        option.textContent = `${city.name} (${city.province})`;
        option.title = `Population: ${city.population.toLocaleString()}`;
        // Add population-based styling attributes
    });
}
```

#### Smart Selection Synchronization
```javascript
function updateCitySelectorDefault(cityName) {
    // Automatically updates dropdown when location is detected via IP or GPS
    // Maintains consistency between auto-detection and manual selection
}
```

#### Manual Selection Display
```
👉 Mashhad (Razavi Khorasan)
🎯 Manually selected from dropdown
📍 Coordinates: 36.2605°, 59.6168°
👥 Population: 3,001,184
🏛️ Provincial capital of Razavi Khorasan
```

### Error Handling Features

#### Permission Denied (Error Code 1)
- **User Message**: "Please allow location access in your browser settings"
- **Solution**: Step-by-step browser instructions in console
- **Fallback**: Continue with IP-based location

#### Position Unavailable (Error Code 2)
- **User Message**: "Your device location is currently unavailable"
- **Cause**: Poor GPS signal, indoor location
- **Solution**: "Try moving to an area with better signal"

#### Timeout (Error Code 3)
- **User Message**: "Location request took too long"
- **Cause**: GPS taking time to acquire signal
- **Solution**: "Please try again or use manual search"

#### Visual Button States
- **Loading**: 🔄 Spinning icon with orange background
- **Success**: ✅ Check mark with green background
- **Error**: ⚠️ Warning icon with red background
- **Default**: 📍 Location arrow icon

### Iranian Provincial Capitals Database
Complete coverage of all 31 provinces:

#### Major Cities (Population > 1M)
- **Tehran** (Tehran) - 8,694,000
- **Mashhad** (Razavi Khorasan) - 3,001,184  
- **Isfahan** (Isfahan) - 1,961,260
- **Karaj** (Alborz) - 1,592,492
- **Shiraz** (Fars) - 1,565,572
- **Tabriz** (East Azerbaijan) - 1,558,693

#### Regional Centers
All remaining provincial capitals from **Qom** (1.2M) to **Yasuj** (134K)

## 🚀 Getting Started

### Quick Start (Sample Data)
1. **Clone the repository**:
   ```bash
   git clone https://github.com/MisbahMalik01/Weather-Forecast.git
   cd Weather-Forecast
   ```

2. **Open the application**:
   ```bash
   # Simply open index.html in your browser
   open index.html
   # or
   python -m http.server 3000  # For local development server
   ```

3. **The app will work immediately with sample weather data**

### Complete Setup (Real Weather Data)

1. **Get OpenWeatherMap API Key** (Free):
   ```
   1. Go to: https://openweathermap.org/api
   2. Sign up for free account
   3. Verify email and get API key
   4. Copy your API key
   ```

2. **Configure API Key**:
   ```javascript
   // Edit script.js file
   const WEATHER_API_CONFIG = {
       API_KEY: 'paste_your_api_key_here', // Replace this line
       // ... rest of config stays the same
   };
   ```

3. **Verify Setup**:
   ```
   - Open browser developer console
   - Look for "✅ Weather API configured successfully"
   - Real weather data will now be displayed
   ```

4. **Location Detection Options**:
   - **Automatic IP Detection**: Happens automatically on page load
   - **Precise GPS Location**: Click the 📍 location button for GPS coordinates
   - **Manual City Selection**: Choose from dropdown of Iranian provincial capitals
   - **Manual Search**: Enter any city name in the search box

## 📱 How It Works

### Weather Data Flow (Step 6)
1. **Location Finalization**: App determines final coordinates (IP, GPS, or Iranian capital)
2. **API Request**: Calls OpenWeatherMap API with coordinates
3. **Data Processing**: Extracts current weather and forecast data
4. **UI Update**: Displays real weather information
5. **Fallback**: Uses sample data if API unavailable

### Location Detection & Refinement Flow
1. **Page Load**: App automatically calls IP geolocation API
2. **IP Detection**: Detects user's IP address and converts to coordinates
3. **Distance Calculation**: Calculates distance to all 31 Iranian capitals
4. **Capital Selection**: Finds closest capital within 1000km radius
5. **Location Refinement**: Displays refined location with distance info
6. **Dropdown Update**: City selector automatically shows detected capital
7. **Weather Loading**: Automatically loads weather for refined capital
8. **GPS Option**: User can click for precise GPS location
9. **GPS Refinement**: GPS coordinates also refined to closest Iranian capital
10. **Manual Override**: User can select any Iranian capital from dropdown
11. **Fallback**: If no capital within range, uses original location

### Manual City Selection Flow (Step 5)
1. **Dropdown Population**: All 31 Iranian capitals loaded by population
2. **Smart Sorting**: Cities ordered by population (Tehran first, Yasuj last)
3. **Visual Indicators**: Different styling for large/medium/small cities
4. **User Selection**: User clicks dropdown and selects desired city
5. **Data Lookup**: App finds selected city data in capitals database
6. **Location Update**: Location display updated with manual selection icon
7. **Weather Fetch**: Real weather data loaded for manually selected city
8. **State Management**: Selection tracked and synchronized with other features

### GPS Location Flow (Step 4)
1. **Button Click**: User clicks the 📍 GPS location button
2. **Permission Request**: Browser requests location permission
3. **GPS Acquisition**: Device acquires GPS coordinates (up to 15 seconds)
4. **Success Handling**: Coordinates processed and refined to Iranian capital
5. **Error Handling**: Comprehensive error messages for permission/signal issues
6. **Visual Feedback**: Button shows loading/success/error states
7. **Dropdown Sync**: City selector updated to show GPS-refined city
8. **Weather Update**: Loads real weather for GPS-refined location

### Regional Coverage
The 1000km radius covers:
- **🇮🇷 Iran**: All provinces and cities
- **🇦🇫 Afghanistan**: Major cities (Kabul, Herat, Kandahar)
- **🇮🇶 Iraq**: Baghdad, Basra, Erbil
- **🇹🇷 Turkey**: Eastern regions
- **🇵🇰 Pakistan**: Western regions  
- **🇹🇲 Turkmenistan**: All major cities
- **🇦🇿 Azerbaijan**: Baku and surrounding areas

### User Interactions
- **Search**: Enter any city name in the search box
- **GPS Location**: Click location button for precise GPS coordinates (with permission)
- **City Selection**: Choose from 31 Iranian capitals in organized dropdown
- **Unit Toggle**: Switch between Celsius and Fahrenheit
- **Responsive**: Touch-friendly interface on mobile devices
- **Error Recovery**: Clear error messages with solutions

## 🔒 Privacy & Security

- **IP Detection**: Only uses IP for location estimation
- **GPS Permission**: Requests explicit user permission for GPS access
- **No Personal Data**: No personal information is stored or transmitted
- **Client-Side**: All processing happens in the browser
- **Free APIs**: Uses privacy-respecting free APIs without registration
- **Transparent**: Shows original IP location, GPS coordinates, and refinement process
- **API Key Security**: User's own API key, no shared credentials

## 🌟 Features in Detail

### Step 6: Real Weather Data Features
```javascript
// Real-time weather fetching
async function fetchWeatherData(lat, lon, locationName = null) {
    // Parallel API calls for efficiency
    const [currentData, forecastData] = await Promise.all([
        fetchCurrentWeather(lat, lon),
        fetchWeatherForecast(lat, lon)
    ]);
    
    // Process and combine data
    return processWeatherAPIResponse(currentData, forecastData, locationName);
}
```

### Enhanced Geolocation Error Handling
```javascript
// Comprehensive error handling with user-friendly messages
function handleGeolocationError(error) {
    const errorInfo = GEOLOCATION_ERRORS[error.code];
    
    // Log detailed technical information
    console.error('Geolocation failed:', {
        errorCode: error.code,
        errorType: errorInfo.code,
        browserMessage: error.message,
        timestamp: new Date().toLocaleString()
    });
    
    // Show user-friendly error with solutions
    showGeolocationError(errorInfo, error.code);
}
```

### Manual City Selection Features
```javascript
// Smart dropdown with population-based sorting and styling
function handleIranianCitySelection() {
    const selectedCity = IRANIAN_PROVINCIAL_CAPITALS.find(city => city.name === selectedCityName);
    
    if (selectedCity) {
        selectedIranianCity = selectedCity;
        displayManuallySelectedCity(selectedCity);
        searchWeather(selectedCity.name, false, selectedCity);
    }
}
```

### GPS Accuracy Assessment
```javascript
function assessGPSAccuracy(accuracy) {
    return accuracy < 100 ? 'High accuracy' : 
           accuracy < 1000 ? 'Medium accuracy' : 'Low accuracy';
}
```

### Location Refinement Algorithm
```javascript
// Automatic location refinement to Iranian capitals
async function handleGeolocationSuccess(position) {
    // 1. Get GPS coordinates
    const coords = position.coords;
    
    // 2. Find closest Iranian capital
    const refinedCapital = findClosestIranianCapital(coords.latitude, coords.longitude);
    
    // 3. Update city selector and display refined location
    if (refinedCapital) {
        updateCitySelectorDefault(refinedCapital.name);
        displayGPSRefinedLocation(gpsData, refinedCapital);
        // 4. Fetch real weather data
        searchWeather(refinedCapital.name, true, refinedCapital);
    }
}
```

### Climate-Aware Weather Simulation
The app generates realistic weather based on:
- **Geographic Location**: Northern vs Southern Iran
- **Seasonal Adjustments**: Summer/Winter temperature variations
- **City-Specific Climate**: Tehran urban heat, Bandar Abbas humidity, Tabriz altitude
- **Elevation Effects**: Mountain cities vs coastal areas

### Distance Calculation
Uses the **Haversine formula** for precise great-circle distances:
- Accounts for Earth's curvature
- Accurate to within meters
- Essential for finding truly closest capital

## 🎯 Next Steps

To enhance this weather app further:

1. **Extended Weather APIs**: 
   - Add One Call API 3.0 for 7-day + hourly forecasts
   - Integrate UV Index and Air Quality data
   - Add weather alerts and severe weather warnings

2. **Enhanced Geocoding**: 
   - Add OpenWeatherMap Geocoding API for city name searches
   - Support for international cities beyond Iranian capitals
   - Fuzzy search with auto-suggestions

3. **Advanced Features**:
   - Weather maps and radar
   - Historical weather data comparison
   - Weather-based recommendations
   - Push notifications for weather alerts

4. **Regional Enhancements**:
   - Add major Afghan and Iraqi cities
   - Prayer times for Islamic locations
   - Persian calendar integration
   - Local language support (Farsi, Arabic)

5. **Technical Improvements**:
   - Service worker for offline functionality
   - Progressive Web App (PWA) features
   - Local storage for preferences
   - Performance optimizations

## 🏛️ Iranian Provinces Covered

All 31 Iranian provinces with their capitals:

**Northern Iran**: Tehran, Alborz, Gilan, Mazandaran, Golestan, North Khorasan
**Northwestern Iran**: East Azerbaijan, West Azerbaijan, Ardabil, Zanjan, Kurdistan
**Western Iran**: Kermanshah, Ilam, Lorestan, Hamadan, Markazi
**Southwestern Iran**: Khuzestan, Fars, Bushehr, Kohgiluyeh and Boyer-Ahmad, Chaharmahal and Bakhtiari
**Central Iran**: Isfahan, Yazd, Qom, Semnan
**Eastern Iran**: Razavi Khorasan, South Khorasan, Kerman, Sistan and Baluchestan, Hormozgan

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🔗 Links

- **Live Demo**: [Weather Forecast App](https://misbahmalik01.github.io/Weather-Forecast/)
- **Repository**: [GitHub](https://github.com/MisbahMalik01/Weather-Forecast)
- **Weather API**: [OpenWeatherMap](https://openweathermap.org/api)
- **APIs Used**: [Public APIs Directory](https://publicapis.dev/)

## 🙏 Acknowledgments

- [OpenWeatherMap](https://openweathermap.org/) for free weather API
- [Font Awesome](https://fontawesome.com/) for weather icons
- [IP-API.com](http://ip-api.com/) for free IP geolocation
- [publicapis.dev](https://publicapis.dev/) for API discovery
- Iranian Statistical Center for provincial data
- Modern CSS techniques and responsive design patterns
- Browser Geolocation API for precise GPS coordinates

---

**Built with ❤️ for Iranian users and regional weather forecasting**

**New in Step 6**: Real weather data integration with OpenWeatherMap API! 🌦️✨