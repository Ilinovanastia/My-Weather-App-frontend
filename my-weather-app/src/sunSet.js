import { onMounted, ref } from 'vue';
import {localDay} from './WeatherView.vue';

const timeOfDay = ref(0);

onMounted(() => {
   updateSunPosition();
   setInterval(updateSunPosition, 60 * 1000);
});
function updateSunPosition() {
   const now = new Date();
   const totalMinutes = now.getHours() * 60 + now.getMinutes();
   const dayPercentage = (totalMinutes / (24*60))
   timeOfDay.value = dayPercentage;
   const path = document.getElementById('sun-track');
   const sunIcon = document.getElementById('sun-icon');

    if (path && sunIcon) {
        const pathLength = path.getTotalLength();
        const point = path.getPointAtLength(pathLength * dayPercentage);
        sunIcon.setAttribute("cx", point.x);
        sunIcon.setAttribute("cy", point.y);
  }
}