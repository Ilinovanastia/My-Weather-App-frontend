import { createRouter, createWebHashHistory } from 'vue-router'
import WeatherView from '@/views/WeatherView.vue'
import WeatherInfoView from '@/views/WeatherInfoView.vue'
import sunView from '@/views/sunView.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [{
    path: '/',
    name: 'Weather',
    component: WeatherView
  },

  {
    path: '/',
    name: 'WeatherInfo',
    component: WeatherInfoView
  },
  {
    patha: '/',
    name: 'v',
    component: sunView 
  }
],
})

export default router
