<script setup>
import WeatherView from '@/views/WeatherView.vue'
import { provide } from 'vue';
provide('test', 'Hello from App!');
</script>

<template>
  <div class="main">
    <WeatherView/>
  </div>
</template>
<style>
</style>