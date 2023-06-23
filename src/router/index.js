import { createRouter, createWebHistory } from 'vue-router'
import UploadView from '../views/Upload.vue'
import IndexView from '../views/Index.vue'
import ModuleView from "../views/Modules.vue"
import LoginView from "../views/Login.vue"
const routes = [
  { 
    path: '/', 
    redirect: '/index/upload'
  },
  {
    name: 'index',
    path: '/index',
    component: IndexView,
    children: [
      {
        path: 'upload',
        component: UploadView,
      },
      {
        path: 'modules',
        component: ModuleView,
      },
    ],
  },
  {
    name: 'login',
    path: '/login',
    component: LoginView
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
