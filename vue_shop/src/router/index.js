import { createRouter, createWebHashHistory } from 'vue-router'
import login from '../components/login.vue'
import home from '../components/home.vue'
import welcome from '../components/welcome.vue'
import users from '../components/user/users.vue'
import roles from '../components/roles/roles.vue'
import rights from '../components/roles/rights.vue'
import goods from '../components/goods/goods.vue'
import add from '../components/goods/add.vue'
import params from '../components/goods/params.vue'
import categories from '../components/goods/categories.vue'
import orders from '../components/orders/orders.vue'
import reports from '../components/reports/reports.vue'
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
    component: home,
    redirect:'/welcome',
    children:[
      {
        path: '/welcome',
        component: welcome
      },
      {
        path: '/users',
        component: users
      },
      {
        path: '/roles',
        component: roles
      },
      {
        path: '/rights',
        component: rights
      },
      {
        path: '/goods',
        component: goods
      },
      {
        path: '/params',
        component: params
      },
      {
        path: '/categories',
        component: categories
      },
      {
        path: '/goods/add',
        component: add
      },
      {
        path: '/orders',
        component: orders
      },
      {
        path: '/reports',
        component: reports
      }
   ]
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
