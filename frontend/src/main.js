import { createApp } from 'vue'
import { createWebHistory, createRouter } from 'vue-router';
import axios from 'axios';
import App from './App.vue'
import Login from './components/authentication/Login.vue'
import Register from './components/authentication/Register.vue'
import Home from './components/homepage/Home.vue'
import Event from './components/eventpage/Event'
import Logout from './components/authentication/Logout'
import CreateEvent from './components/createevent/CreateEvent'
import Profile from './components/profile/Profile'
import UserEvents from './components/profile/UserEvents.vue'
import EventNotFound from './components/eventpage/EventNotFound'

const routes = [
    {
        path: "/",
        component: Home
    },
    {
        path: "/login",
        component: Login
    },
    {
        path: "/register",
        component: Register
    },
    {
        path: "/events/:id",
        component: Event
    },
    {
        path: "/logout",
        component: Logout
    },
    {
        path: "/create",
        component: CreateEvent
    },
    {
        path: "/users/:id",
        component: Profile
    },
    {
        path: "/users/:id/events",
        component: UserEvents
    },
    {
        path: "/events/notfound",
        component: EventNotFound
    }
    
];

const router = createRouter({
    routes,
    history: createWebHistory()
});

const axiosConfig = {
    baseURL: 'http://localhost:4941/api/v1',
    timeout: 2000,
}

const app = createApp(App);
app.use(router);
app.config.globalProperties.axios = axios.create(axiosConfig);

app.mount('#app');