import { createRouter, createWebHashHistory } from 'vue-router'
import login from '../components/login.vue'
import home from '../components/home.vue'
const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: login
  },
  {
    path: '/home',
    component: home
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})
//挂载路由导航守卫
router.beforeEach((to, from, next) => {
  //to 将要访问的路径
  //from 从哪一个路径跳转过来的
  //next 是一个函数 表示放行
  //next() 放行 next('/login')强制跳转

  if (to.path === '/login') return next()
  const tokenSer = window.sessionStorage.getItem('token')
  if (!tokenSer) return next('/login')
  next()
})





export default router
