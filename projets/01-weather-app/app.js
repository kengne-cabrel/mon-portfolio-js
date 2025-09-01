class WeatherApp
{
    constructor()
    {
        this.API_KEY ='895284fb2d2c50a520ea537456963d9c';
        //cle de demonstration
        this.BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

        this.cityInput = document.getElementById('cityInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.loading = document.getElementById('loading');
        this.error = document.getElementById('error');
        this.weatherCard = document.getElementById('weatherCard');

        this.init();
        
    }

    init()
    {
        this.searchBtn.addEventListener('click', () => this.searchWeather());
        this.cityInput.addEventListener('keypress', (e) =>{
            if (e.key === 'Enter')
            {
                this.searchWeather();
            }
        });

        // Meteo par defaut pour Douala
        this.getWeatherByCity('Douala');
    }

    async searchWeather()
    {
        const city = this.cityInput.value.trim();

        if(!city)
        {
            this.showError('Veuillez entrer le nom d\'une ville');
            return;
        }
        await this.getWeatherByCity(city);
    }

    async getWeatherByCity(city)
    {
        try{
            this.showLoading();
            this.hideError();
            this.hideWeatherCard();

            const url = `${this.BASE_URL}?q=${encodeURIComponent(city)}&appid=${this.API_KEY}&units=metric&lang=fr`;
            const response = await fetch(url);

            if(!response.ok)
            {
                throw new Error(response.status === 404 ? 'Ville non trouvée' : 'Erreur de connexion');
            }

            const data = await response.json();
            this.displayWeather(data);
        }catch (error){
            console.error('Erreur', error);
            this.showError(error.message ||  'une erreur est survenue');
        }finally{
            this.hideLoading();
        }
    }
        displayWeather(data)
        {
            //Mise a jour des elements

            document.getElementById('cityName').textContent = `${data.name}, ${data.sys.country}`;
            document.getElementById('temperature').textContent = `${Math.round(data.main.temp)}°C`;
            document.getElementById('description').textContent = data.weather[0].description;
            document.getElementById('feelsLike').textContent = `${Math.round(data.main.feels_like)}°C`;
            document.getElementById('humidity').textContent = `${data.main.humidity}%`;
            document.getElementById('windSpeed').textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
            document.getElementById('pressure').textContent = `${data.main.pressure} hPa`;

            //Icone meteo

            const iconElement = document.getElementById('weatherIcon');
            const weatherIcon = this.getWeatherIcon(data.weather[0].main);
            iconElement.textContent = weatherIcon;

            this.showWeatherCard();
        }

        getWeatherIcon(weatherMain)
        {
            const icons = {
                 'Clear': '☀️',
                    'Clouds': '☁️',
                    'Rain': '🌧️',
                    'Drizzle': '🌦️',
                    'Thunderstorm': '⛈️',
                    'Snow': '❄️',
                    'Mist': '🌫️',
                    'Smoke': '💨',
                    'Haze': '🌫️',
                    'Dust': '💨',
                    'Fog': '🌫️',
                    'Sand': '💨',
                    'Ash': '💨',
                    'Squall': '💨',
                    'Tornado': '🌪️'
            };
            return icons[weatherMain] || '🌤️';
        }

        showLoading()
        {
            this.loading.style.display = 'block';
            this.searchBtn.disabled = true;
            this.searchBtn.textContent = '⏳ Recherche...';
        }
        
        hideLoading()
        {
            this.loading.style.display = 'none';
            this.searchBtn.disabled = false;
            this.searchBtn.textContent = '🔍 Rechercher';
        }

        showError(message)
        {
            this.error.textContent = message;
            this.error.style.display = 'block';
        }

        hideError()
        {
            this.error.style.display = 'none';
        }

        showWeatherCard()
        {
            this.weatherCard.style.display = 'block';
        }

        hideWeatherCard()
        {
            this.weatherCard.style.display = 'none';
        }
}

// Initialisation de l'application

document.addEventListener('DOMContentLoaded', () =>{
    new WeatherApp();
});