import { createRouter, createWebHistory } from 'vue-router';
import Home from '../components/Home.vue';
import Dashboard from '../components/Dashboard.vue';
import Login from '../components/login.vue';
import Signup from '../components/signup.vue';

const routes = [
  { path: '/',name: 'Home', component: Home },
  { path: '/dash', name: 'Dashboard', component: Dashboard },
  { path: '/login', name: 'Login', component: Login },
  { path: '/signup', name: 'SignUp', component: Signup },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;