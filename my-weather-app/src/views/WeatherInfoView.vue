<script setup>
import sunView from '@/views/sunView.vue';
import { defineProps } from 'vue';
import { weatherIcons } from '../WeatherData';
const props = defineProps({
 loading: {
    type: Boolean,
    required: true,
  },
  weatherData: {
    type: Array,
    required: true,
  },
  locationData: {
    type: Array,
    required: true,
  }
});
function getFormattedDate(dt, index) {
  if (dt && typeof index === 'number') {
    const date = new Date(dt);
    date.setDate(date.getDate() + index);

    return new Intl.DateTimeFormat("en-US", {
      weekday: 'long',
      day: 'numeric',
      timeZone: props.locationData.value?.timezone,
    }).format(date);
  } else {
    return "Date, timezone, or index not available/valid";
  }
}

const getWeatherIcon = (id) => {
     const data = id ? {weather: [{id: id}]} : props.weatherData.value;
     if (!data || !data.weather || !data.weather[0]) {
         return null;
     }

     const weatherCode = String(data.weather[0].id);

     if(Object.hasOwn(weatherIcons, weatherCode)) {
        return `/icon/${weatherIcons[weatherCode]}`
     } else {
        return `/icon/clear.png`
     }
}
</script>
<template>
<div class="card-wrap">
    <div class = 'card-main'>
       <div class="card mw-1340-mh-380 blur">
        <div class = 'weatherinfo'>
        <div v-if="props.loading">
        <h2>Loading...</h2>
        </div>
        <div v-if="props.weatherData">
                <img :src="getWeatherIcon(props.weatherData[0].id)" alt="Weather Icon" style="width: 110px; height: 100px;">
          <p class = 'no-margin'>Today, {{ getFormattedDate(props.weatherData[0].dt, 0) }}</p>
          <h1 class = "number-glow"> {{  parseInt(props.weatherData[0].temperature) }}°</h1>
          <h2>{{ props.weatherData[0].description }}</h2>
        </div>
        <div v-else-if="error">
          <p>An error occurred: {{ error }}</p>
       </div>
       <ul >
        <div v-if="props.weatherData">
          <li><svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clip-path="url(#clip0_1_2489)" filter="url(#filter0_di_1_2489)">
<path d="M11.5949 16.0473H5.56846V14.193H11.5949C12.1871 14.1932 12.768 14.3555 13.2745 14.6622C13.7811 14.969 14.1941 15.4085 14.4687 15.9332C14.7433 16.4579 14.8692 17.0477 14.8325 17.6388C14.7959 18.2298 14.5982 18.7996 14.2608 19.2864C13.9235 19.7731 13.4594 20.1583 12.9188 20.4001C12.3783 20.6419 11.7818 20.7312 11.1941 20.6583C10.6064 20.5854 10.0499 20.353 9.58478 19.9864C9.11971 19.6197 8.76383 19.1328 8.55571 18.5784L10.2923 17.9266C10.3814 18.1642 10.5339 18.3729 10.7332 18.5301C10.9325 18.6872 11.171 18.7868 11.4229 18.8181C11.6748 18.8494 11.9304 18.8111 12.1621 18.7075C12.3938 18.6039 12.5927 18.4388 12.7373 18.2302C12.8819 18.0217 12.9666 17.7775 12.9824 17.5241C12.9981 17.2708 12.9442 17.018 12.8265 16.7932C12.7088 16.5683 12.5318 16.3799 12.3147 16.2484C12.0976 16.1169 11.8487 16.0474 11.5949 16.0473ZM6.4956 10.4844H19.012C19.6042 10.4846 20.1851 10.6469 20.6917 10.9536C21.1983 11.2604 21.6112 11.6999 21.8859 12.2246C22.1605 12.7493 22.2863 13.3391 22.2497 13.9302C22.213 14.5213 22.0153 15.0911 21.678 15.5778C21.3407 16.0645 20.8766 16.4497 20.336 16.6915C19.7954 16.9334 19.1989 17.0227 18.6112 16.9497C18.0235 16.8768 17.467 16.6444 17.0019 16.2778C16.5369 15.9112 16.181 15.4242 15.9729 14.8698L17.7094 14.218C17.7986 14.4557 17.9511 14.6643 18.1504 14.8215C18.3497 14.9786 18.5882 15.0783 18.8401 15.1095C19.0919 15.1408 19.3476 15.1026 19.5792 14.9989C19.8109 14.8953 20.0099 14.7303 20.1544 14.5217C20.299 14.3131 20.3838 14.0689 20.3995 13.8156C20.4152 13.5623 20.3613 13.3095 20.2436 13.0846C20.1259 12.8597 19.949 12.6713 19.7319 12.5399C19.5148 12.4084 19.2658 12.3388 19.012 12.3387H6.4956C5.75792 12.3387 5.05045 12.0457 4.52883 11.524C4.00721 11.0024 3.71417 10.295 3.71417 9.55728C3.71417 8.8196 4.00721 8.11213 4.52883 7.59051C5.05045 7.06889 5.75792 6.77585 6.4956 6.77585H14.3763C14.6301 6.77575 14.8791 6.70619 15.0962 6.57471C15.3133 6.44323 15.4902 6.25485 15.6079 6.02997C15.7256 5.8051 15.7795 5.55231 15.7638 5.29899C15.7481 5.04567 15.6633 4.80148 15.5187 4.59288C15.3741 4.38429 15.1752 4.21924 14.9435 4.11561C14.7118 4.01199 14.4562 3.97375 14.2043 4.00503C13.9525 4.03631 13.714 4.13592 13.5147 4.29306C13.3154 4.45021 13.1629 4.65891 13.0737 4.89653L11.3371 4.24568C11.6046 3.53438 12.1131 2.93947 12.7742 2.56459C13.4352 2.18972 14.2068 2.05866 14.9545 2.19424C15.7022 2.32981 16.3787 2.72344 16.866 3.30654C17.3533 3.88963 17.6206 4.62522 17.6213 5.38514C17.6213 6.24577 17.2794 7.07114 16.6709 7.6797C16.0623 8.28825 15.2369 8.63014 14.3763 8.63014H6.4956C6.24971 8.63014 6.01389 8.72782 5.84001 8.90169C5.66614 9.07556 5.56846 9.31139 5.56846 9.55728C5.56846 9.80317 5.66614 10.039 5.84001 10.2129C6.01389 10.3867 6.24971 10.4844 6.4956 10.4844Z" fill="white"/>
</g>
     </svg>
     <p> Wind: {{ props.weatherData[0].windSpeed}} km/h</p></li>
          <li><svg width="20" height="20" viewBox="0 0 23 23" fill="white" xmlns="http://www.w3.org/2000/svg">
            <g clip-path="url(#clip0_1_2492)" filter="url(#filter0_di_1_2492)">
<path d="M11.9856 2.95491L7.39623 7.54426C6.48865 8.45193 5.87061 9.60834 5.62024 10.8673C5.36988 12.1262 5.49844 13.4311 5.98967 14.6169C6.4809 15.8028 7.31274 16.8163 8.38 17.5294C9.44726 18.2425 10.702 18.6232 11.9856 18.6232C13.2692 18.6232 14.5239 18.2425 15.5912 17.5294C16.6584 16.8163 17.4903 15.8028 17.9815 14.6169C18.4727 13.4311 18.6013 12.1262 18.3509 10.8673C18.1006 9.60834 17.4825 8.45193 16.5749 7.54426L11.9856 2.95491ZM11.9856 0.332947L17.8859 6.23328C19.0529 7.40026 19.8476 8.88707 20.1695 10.5057C20.4915 12.1243 20.3263 13.8021 19.6947 15.3268C19.0631 16.8515 17.9936 18.1547 16.6214 19.0716C15.2492 19.9885 13.6359 20.4778 11.9856 20.4778C10.3352 20.4778 8.72197 19.9885 7.34976 19.0716C5.97755 18.1547 4.90804 16.8515 4.27648 15.3268C3.64492 13.8021 3.47967 12.1243 3.80163 10.5057C4.12358 8.88707 4.91829 7.40026 6.08525 6.23328L11.9856 0.332947Z" fill="white"/>
</g>
     </svg>
     <p style="margin-left: 5px;"> Hum: {{ props.weatherData[0].humidity }} %</p></li>
          </div>
      </ul>
    </div>
    <div v-if="props.weatherData" class = 'sun-position'>
    <sunView/>
    </div>
        </div>
       </div>
    </div>
    <div class="card-wrap">
      <div v-if="props.weatherData" class = 'card-main'>
        <div v-for="(forecast, index) in props.weatherData.slice(1,8)" :key="index">
          <div class="card mw-130-mh-145 blur">
            <img :src="getWeatherIcon(forecast.id)" alt="Weather Icon" style="width: 50px; height: 50px;"/>
            <p>{{ getFormattedDate(props.weatherData[0].dt,index + 1) }}</p>
            <p>{{ parseInt(forecast.temperature) }}°C</p>
          </div>
        </div>
      </div>
    </div>
</template>
