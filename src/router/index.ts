import { createRouter, createWebHistory } from 'vue-router'
import DefaultLayout from '@/layouts/DefaultLayout.vue';
//@ts-ignore
import Home from '@/pages/Home.vue';
import PropertyInfo from '@/pages/PropertyInfo.vue'
import Map from '@/pages/Map.vue'

const routes = [
  {
    path: '/',
    component: DefaultLayout,
    redirect: { name:"Home" },
    children: [
      { path: '/home', name: 'Home', component: Home },
      { path: '/property/:id', name: 'PropertyInfo', component: PropertyInfo },
      { path: '/map', name: 'Map', component: Map }
    ]
  }
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})
