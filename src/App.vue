<script setup>
import Navbar from './components/nav.vue'
import Home from './components/Home.vue'
import Dash from './components/Dashboard.vue'
import router from './router/index'
// import login from './components/login'

// import TheWelcome from './components/TheWelcome.vue'
</script>

<template>
  <header>
   
      <Navbar />

      
   <!-- <nav>
    <RouterLink to="/">Home</RouterLink>
    <RouterLink to="/dash">Dashboard</RouterLink>
    <RouterLink to="/login">Login/SignUp</RouterLink> 
  </nav> -->
  </header>

  <main>
    <router-view/>
  </main>
</template>


