// import { createRouter, createWebHistory } from 'vue-router';
// import Home from '../components/Home.vue';
// import Dashboard from '../components/Dashboard.vue';
// import Login from '../components/login.vue';
// import Signup from '../components/signup.vue';

// const routes = [
//   { path: '/',name: 'Home', component: Home },
//   { path: '/dash', name: 'Dashboard', component: Dashboard },
//   { path: '/login', name: 'Login', component: Login },
//   { path: '/signup', name: 'SignUp', component: Signup },
// ];

// const router = createRouter({
//   history: createWebHistory(),
//   routes,
// });

// export default router;
import { createRouter, createWebHistory } from 'vue-router';
import Home from '../components/Home.vue';
import Dashboard from '../components/Dashboard.vue';
import Login from '../components/login.vue';
import Signup from '../components/signup.vue';

// Define the routes
const routes = [
  { path: '/', name: 'Home', component: Home },
  {
    path: '/dash', 
    name: 'Dashboard', 
    component: Dashboard,
    beforeEnter: (to, from, next) => {
      // Check if the JWT token exists in localStorage
      const token = localStorage.getItem('authToken');
      if (token) {
        // Token exists, allow access to the dashboard
        next();
      } else {
        // No token, redirect to the login page
        next('/login');
      }
    }
  },
  { path: '/login', name: 'Login', component: Login },
  { path: '/signup', name: 'SignUp', component: Signup },
];

// Create the router instance
const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Export the router
export default router;
