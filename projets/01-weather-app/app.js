
        class WeatherApp {
            constructor() {
                // API gratuite sans clé requise
                this.BASE_URL = 'https://api.open-meteo.com/v1/forecast';
                this.GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
                
                this.cityInput = document.getElementById('cityInput');
                this.searchBtn = document.getElementById('searchBtn');
                this.loading = document.getElementById('loading');
                this.error = document.getElementById('error');
                this.weatherCard = document.getElementById('weatherCard');
                
                this.init();
            }

            init() {
                this.searchBtn.addEventListener('click', () => this.searchWeather());
                this.cityInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.searchWeather();
                    }
                });

                // Météo par défaut pour Douala
                this.getWeatherByCity('Douala');
            }

            async searchWeather() {
                const city = this.cityInput.value.trim();
                
                if (!city) {
                    this.showError('Veuillez entrer le nom d\'une ville');
                    return;
                }

                await this.getWeatherByCity(city);
            }

            async getWeatherByCity(city) {
                try {
                    this.showLoading();
                    this.hideError();
                    this.hideWeatherCard();

                    // Étape 1: Obtenir les coordonnées de la ville
                    const geoUrl = `${this.GEOCODING_URL}?name=${encodeURIComponent(city)}&count=1&language=fr&format=json`;
                    const geoResponse = await fetch(geoUrl);
                    
                    if (!geoResponse.ok) {
                        throw new Error('Erreur de connexion géolocalisation');
                    }

                    const geoData = await geoResponse.json();
                    
                    if (!geoData.results || geoData.results.length === 0) {
                        throw new Error('Ville non trouvée');
                    }

                    const location = geoData.results[0];
                    
                    // Étape 2: Obtenir les données météo
                    const weatherUrl = `${this.BASE_URL}?latitude=${location.latitude}&longitude=${location.longitude}&current_weather=true&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,surface_pressure&timezone=auto`;
                    
                    const weatherResponse = await fetch(weatherUrl);
                    
                    if (!weatherResponse.ok) {
                        throw new Error('Erreur de connexion météo');
                    }

                    const weatherData = await weatherResponse.json();
                    this.displayWeather(weatherData, location);
                    
                } catch (error) {
                    console.error('Erreur:', error);
                    this.showError(error.message || 'Une erreur est survenue');
                } finally {
                    this.hideLoading();
                }
            }

            displayWeather(data, location) {
                // Mise à jour des éléments
                document.getElementById('cityName').textContent = `${location.name}, ${location.country}`;
                document.getElementById('temperature').textContent = `${Math.round(data.current_weather.temperature)}°C`;
                
                // Description basée sur le code météo
                const description = this.getWeatherDescription(data.current_weather.weathercode);
                document.getElementById('description').textContent = description;
                
                // Données actuelles
                const currentTemp = Math.round(data.current_weather.temperature);
                const currentHour = new Date().getHours();
                const hourlyIndex = currentHour;
                
                document.getElementById('feelsLike').textContent = `${currentTemp}°C`; // Approximation
                document.getElementById('humidity').textContent = `${Math.round(data.hourly.relative_humidity_2m[hourlyIndex] || 50)}%`;
                document.getElementById('windSpeed').textContent = `${Math.round(data.current_weather.windspeed)} km/h`;
                document.getElementById('pressure').textContent = `${Math.round(data.hourly.surface_pressure[hourlyIndex] || 1013)} hPa`;

                // Icône météo
                const iconElement = document.getElementById('weatherIcon');
                const weatherIcon = this.getWeatherIconFromCode(data.current_weather.weathercode);
                iconElement.textContent = weatherIcon;

                this.showWeatherCard();
            }

            getWeatherIconFromCode(code) {
                // Codes météo Open-Meteo vers émojis
                if (code === 0) return '☀️'; // Ciel dégagé
                if (code <= 3) return '🌤️'; // Partiellement nuageux
                if (code <= 48) return '🌫️'; // Brouillard
                if (code <= 57) return '🌦️'; // Bruine
                if (code <= 67) return '🌧️'; // Pluie
                if (code <= 77) return '❄️'; // Neige
                if (code <= 82) return '🌦️'; // Averses
                if (code <= 86) return '❄️'; // Averses de neige
                if (code <= 99) return '⛈️'; // Orage
                return '🌤️';
            }

            getWeatherDescription(code) {
                const descriptions = {
                    0: 'Ciel dégagé',
                    1: 'Principalement dégagé',
                    2: 'Partiellement nuageux',
                    3: 'Couvert',
                    45: 'Brouillard',
                    48: 'Brouillard givrant',
                    51: 'Bruine légère',
                    53: 'Bruine modérée',
                    55: 'Bruine intense',
                    61: 'Pluie légère',
                    63: 'Pluie modérée',
                    65: 'Pluie forte',
                    71: 'Neige légère',
                    73: 'Neige modérée',
                    75: 'Neige forte',
                    80: 'Averses légères',
                    81: 'Averses modérées',
                    82: 'Averses violentes',
                    95: 'Orage',
                    96: 'Orage avec grêle légère',
                    99: 'Orage avec grêle forte'
                };
                return descriptions[code] || 'Conditions météo inconnues';
            }

            showLoading() {
                this.loading.style.display = 'block';
                this.searchBtn.disabled = true;
                this.searchBtn.textContent = '⏳ Recherche...';
            }

            hideLoading() {
                this.loading.style.display = 'none';
                this.searchBtn.disabled = false;
                this.searchBtn.textContent = '🔍 Rechercher';
            }

            showError(message) {
                this.error.textContent = message;
                this.error.style.display = 'block';
            }

            hideError() {
                this.error.style.display = 'none';
            }

            showWeatherCard() {
                this.weatherCard.style.display = 'block';
            }

            hideWeatherCard() {
                this.weatherCard.style.display = 'none';
            }
        }

        // Initialisation de l'application
        document.addEventListener('DOMContentLoaded', () => {
            new WeatherApp();
        });