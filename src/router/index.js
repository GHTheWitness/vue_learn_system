import { createRouter, createWebHistory } from 'vue-router'
import Home from "@views/Home";

const Login=()=>import("@views/login/Login")
const Welcome=()=>import("@views/welcome/Welcome")

const Words=()=>import("@views/words/Words")
const Marked=()=>import("@views/words/Marked")
const UnMarked=()=>import("@views/words/UnMarked")
const Examination=()=>import("@views/words/Examination")
const Translate=()=>import("@views/words/Translate")

const StudyVolume=()=>import("@views/statistics/StudyVolume")
const RightVolume=()=>import("@views/statistics/RightVolume")

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home,
    redirect:'/welcome',
    children:[
      {path:'/welcome',component:Welcome},
      {path:'/words',component:Words},
      {path:'/marked',component:Marked},
      {path:'/unmarked',component:UnMarked},
      {path:'/studyvolume',component:StudyVolume},
      {path:'/perfect',component:RightVolume},
      {path:'/examination',component:Examination},
      {path:'/translate',component:Translate},
    ]
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// 导航守位,to将要访问的路径，from代表从哪个路径跳转而来,next是一个函数表示放行
router.beforeEach((to,from,next)=>{
  if (to.path === '/login') return next()
  // 获取登录后存放的token值
  const tokenStr=window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
