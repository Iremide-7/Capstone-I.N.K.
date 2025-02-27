<script setup>
import Navbar from './components/nav.vue'
import router from './router/index'
</script>

<template>
  <div class="app-container">
    <!-- Navbar Section -->
    <header>
      <Navbar />
    </header>

    <!-- Main Content -->
    <main>
      <router-view />
    </main>
  </div>
</template>

