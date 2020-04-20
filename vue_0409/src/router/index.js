import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/user/Users.vue'
import Rights from '../components/power/Rights.vue'
import Roles from '../components/power/Roles.vue'
import Cate from '../components/goods/Cate.vue'

Vue.use(VueRouter)

const router = new VueRouter({
  routes: [
    { path: '/login', component: Login },
    {
      path: '/home',
      component: Home,
      // 重定向到welcome
      redirect: '/welcome',
      // 子路由
      children: [
        { path: '/welcome', component: Welcome },
        { path: '/users', component: Users },
        { path: '/rights', component: Rights },
        { path: '/roles', component: Roles },
        { path: '/categories', component: Cate }
      ]
    }
  ]
})

// 拦截路由导航守卫,next()是放行
router.beforeEach((to, from, next) => {
  // 登录页放行
  if (to.path === '/login') return next()
  // 获取token
  const token = window.sessionStorage.getItem('token')
  // 没有token,强制跳转到登录页
  if (!token) return next('/login')
  next()
})

export default router
