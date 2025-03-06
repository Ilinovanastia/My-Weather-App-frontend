<script setup>
import { ref, watch, onMounted } from 'vue';
import WeatherInfoView from '@/views/WeatherInfoView.vue';
import axios from 'axios'; 

const weatherData = ref(null);
const lat = ref(0);
const lon = ref(0);
const timezona = ref('');
const tempInputValue = ref('');
const locationData = ref(null);
const loading = ref(false);
const error = ref('');
const modalOpen = ref(false);
const cityValue = ref('');
const countryValue = ref('');
const coordinates = ref([0, 0]);
const flag = ref(false);
const userCity = ref('');

const fetchUserLocation = async () => {
  loading.value = true;
  try {
    const response = await fetch('http://ip-api.com/json/');
    if (!response.ok) {
      throw new Error(`API error! Status: ${response.status}`);
    }
    const data = await response.json();
    locationData.value = data;
    userCity.value = data.city || 'Unknown City';
    loading.value = false;
  } catch (e) {
    error.value = e.message;
    console.error("Error fetching user location:", e);
    loading.value = false;
  }
};
async function fetchWeather(latitude, longitude) {
  loading.value = true;
  error.value = null; // Сброс ошибки перед запросом

  try {
    // Проверяем, что latitude и longitude являются числами
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      console.error('Invalid latitude or longitude:', latitude, longitude);
      error.value = 'Invalid latitude or longitude';
      loading.value = false;
      return;
    }

    // 1. Отправляем запрос к нашему backend
    const response = await axios.get('/api/weather', { // Путь к вашему backend
      params: {
        latitude: latitude,
        longitude: longitude
      }
    });
    console.log(response)
    // 2. Обрабатываем полученные данные
    if (response.data && response.data.list) {
      const timezone = locationData.value?.timezone;
      const forecasts = response.data.list.map((forecast) => {
        const dt = forecast.dt * 1000;
        const date = new Date(dt);
        const options = {
          timeZone: timezone,
          weekday: 'long',
          month: 'numeric',
          day: 'numeric',
          hour: 'numeric',         // Добавляем отображение часов
          minute: 'numeric',       // и минут
        };
        const localDateString = timezone ? new Intl.DateTimeFormat('en-US', options).format(date) : date.toLocaleDateString('en-US');

        return {
          temperature: forecast.main.temp,             // Температура
          feelsLike: forecast.main.feels_like,       // Ощущается как
          description: forecast.weather[0].description, // Описание погоды
          humidity: forecast.main.humidity,           // Влажность
          windSpeed: forecast.wind.speed,               // Скорость ветра
          id: forecast.weather[0].id,                 // ID погоды (для иконок)
          dt: dt,                                     // Дата и время (Unix timestamp)
          dt_txt: forecast.dt_txt,                       // Дата и время в текстовом виде
          cityName: response.data.city?.name || 'Unknown City', // Название города
          localDate: localDateString,                       // Дата в локальном формате
          icon: forecast.weather[0].icon,                  // Код иконки
          pop: forecast.pop,                            // Вероятность осадков
          rain: forecast.rain ? forecast.rain['3h'] : 0,       // Количество осадков (за 3 часа), если есть
        };
      });
     
      weatherData.value = forecasts;
      console.log(forecasts)
      if (timezone) {
        timezona.value = timezone;
      }

    } else {
      error.value = 'No weather data received';
    }

    loading.value = false;

  } catch (err) {
    error.value = err.message;
    console.error("Error fetching weather:", err);
    loading.value = false;
  }
}
const setLatAndLon = () => {
    console.log('setLatAndLon called'); // Добавьте это
    if (locationData.value && locationData.value.lat && locationData.value.lon) { // Added check for lat and lon
        console.log('locationData valid'); // Добавьте это
        lat.value = locationData.value.lat;
        lon.value = locationData.value.lon;
        console.log('Перед fetchWeather: lat=', lat.value, ', lon=', lon.value); // Добавьте это
        fetchWeather(lat.value, lon.value);
    }
};

const openModal = () => {
  modalOpen.value = true;
};

const closeModal = () => {
  modalOpen.value = false;
};

const findCity = () => {
  if (cityValue.value.trim() !== '') {
    cityValue.value = '';
    console.log('Location selected!', { flag: flag.value, coordinates: coordinates.value });
  }
};

const findCityAndCloseModal = () => {
  if (tempInputValue.value && countryValue.value) {
    cityValue.value = tempInputValue.value;
    fetchData(cityValue.value, countryValue.value);
  }
  findCity();
  closeModal();
};
const fetchData = async (city, country) => {
  try {
    const response = await axios.get('/api/geocode', { // Относительный URL (без ключа)
      params: {
        city: city,
        country: country
      }
    });
    const data = response.data;

    if (data.features && data.features.length > 0) {
      const sortedResults = data.features.sort((a, b) => {
        const importanceA = a.properties.rank ? a.properties.rank.importance : 0;
        const importanceB = b.properties.rank ? b.properties.rank.importance : 0;
        return importanceB - importanceA;
      });

      const bestResult = sortedResults[0];
      console.log('Лучший результат:', bestResult);
      flag.value = true;
      cityValue.value = bestResult.properties.city;
      coordinates.value = bestResult.geometry.coordinates;
    } else {
      console.log('Результаты не найдены');
    }
  } catch (error) {
    console.error('Ошибка запроса:', error);
  }
};

  watch(flag, (newFlagValue) => {
  console.log('Flag changed to:', newFlagValue);
});

watch(
  () => locationData.value,
  () => {
    setLatAndLon();
  },
  { deep: true }
);

watch(
  () => [flag?.value, coordinates?.value],
  ([flagValue, coordinatesValue]) => {
    console.log('Watch triggered in WeatherView:', { flagValue, coordinatesValue });
    if (flagValue === true && coordinatesValue && Array.isArray(coordinatesValue) && coordinatesValue.length === 2) {
      const [newLon, newLat] = coordinatesValue;
      if (typeof newLat === 'number' && typeof newLon === 'number') {
        console.log('Calling fetchWeather from Modal coordinates:', { newLat, newLon });
        lat.value = newLat;
        lon.value = newLon;
        fetchWeather(newLat, newLon);
      } else {
        console.warn('Invalid coordinates: Latitude and longitude must be numbers.');
      }
    }
  },
  { deep: true }
);

onMounted(() => {
  fetchUserLocation();
});  

</script>

<template>
  <div class="menu">
        <div v-if="weatherData">
                <ul>
                  <li>  
                    <svg width="43" height="43" viewBox="0 0 23 23" fill="white" xmlns="http://www.w3.org/2000/svg">
                      <g filter="url(#filter0_ii_1_3386)">
                      <g clip-path="url(#clip0_1_3386)">
                      <g filter="url(#filter1_dii_1_3386)">
                      <path d="M11.8671 22.7006L5.96678 16.8002C4.79982 15.6332 4.00511 14.1464 3.68316 12.5278C3.3612 10.9092 3.52645 9.23142 4.15801 7.70671C4.78957 6.18199 5.85908 4.8788 7.23129 3.96192C8.6035 3.04505 10.2168 2.55566 11.8671 2.55566C13.5175 2.55566 15.1307 3.04505 16.5029 3.96192C17.8751 4.8788 18.9447 6.18199 19.5762 7.70671C20.2078 9.23142 20.373 10.9092 20.0511 12.5278C19.7291 14.1464 18.9344 15.6332 17.7675 16.8002L11.8671 22.7006ZM16.4565 15.4892C17.364 14.5816 17.9821 13.4252 18.2325 12.1662C18.4828 10.9073 18.3543 9.60243 17.863 8.41658C17.3718 7.23072 16.54 6.21716 15.4727 5.50406C14.4054 4.79096 13.1507 4.41035 11.8671 4.41035C10.5835 4.41035 9.32879 4.79096 8.26153 5.50406C7.19427 6.21716 6.36243 7.23072 5.8712 8.41658C5.37997 9.60243 5.25141 10.9073 5.50177 12.1662C5.75214 13.4252 6.37018 14.5816 7.27776 15.4892L11.8671 20.0786L16.4565 15.4892ZM11.8671 12.7542C11.3753 12.7542 10.9037 12.5588 10.5559 12.2111C10.2082 11.8633 10.0128 11.3917 10.0128 10.8999C10.0128 10.4081 10.2082 9.93645 10.5559 9.5887C10.9037 9.24095 11.3753 9.04559 11.8671 9.04559C12.3589 9.04559 12.8305 9.24095 13.1783 9.5887C13.526 9.93645 13.7214 10.4081 13.7214 10.8999C13.7214 11.3917 13.526 11.8633 13.1783 12.2111C12.8305 12.5588 12.3589 12.7542 11.8671 12.7542Z" fill="white"/>
                      </g>
                      </g>
                      </g>
                    </svg>
                    <div v-if="weatherData">
                     <div v-if="flag===true">
                      <p>{{ cityValue }}</p>
                     </div>
                     <div v-else >
                      <p>{{ userCity }}</p>
                     </div>
                    </div>
                     <button @click="openModal" class = 'no-style-button'><svg width="53" height="53" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                         <g clip-path="url(#clip0_1_2502)" filter="url(#filter0_di_1_2502)">
                         <path d="M11.2628 14.6086L7.32898 10.6747L8.64089 9.36377L11.2628 11.9867L13.8848 9.36377L15.1967 10.6747L11.2628 14.6086Z" fill="white"/>
                         </g>
                        </svg>
                      </button>
                  </li>
                </ul>
                <div> 
                  <div>
    <div class="modal-overlay" v-if="modalOpen">
      <div class="modal blur-modal">
        <div class="modal-header">
          <button @click="closeModal" class="close-button">&times;</button>
        </div>
        <div class="modal-body">
          <h2>Enter the country</h2>
          <input class = 'input-country' v-model="countryValue">
          <h2>Enter the city</h2>
          <input class = 'input-city' v-model="tempInputValue">
          <button class="find-button" @click="findCityAndCloseModal">Find</button>
        </div>
      </div>
    </div>
  </div>
                </div>
        </div>
 </div>
    <div class="card-wrap">
    <div class = 'card-main'>
       <div class="card mw-270">
    </div>
  </div>
  </div>
  <WeatherInfoView :loading = "loading"
                   :weatherData = "weatherData"
                   :locationData = "locationData"/>
</template>
<style>
@import "@/assets/styles/global.css"; 
@import "@/assets/styles/responsive.css"; 
@import "@/assets/styles/weather.css"; 
</style>