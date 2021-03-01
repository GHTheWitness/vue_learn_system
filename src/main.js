import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementPlus from 'element-plus';
import {ElMessage,ElMessageBox} from 'element-plus';
import 'element-plus/lib/theme-chalk/index.css';
import axios from "axios";
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { Button } from 'ant-design-vue';
import Progress from 'ant-design-vue/lib/progress';
import TimePicker from 'ant-design-vue/lib/time-picker';
import 'ant-design-vue/dist/antd.css';

axios.defaults.baseURL='http://127.0.0.1:8088/api/learn/'
axios.interceptors.request.use(config=>{
    NProgress.start()
    config.headers.Authorization=window.sessionStorage.getItem('token')
    return config
})

axios.interceptors.response.use(config=>{
    NProgress.done()
    return config
})

require('default-passive-events');


const app=createApp(App)
app.use(ElementPlus)
app.use(Progress)
app.use(TimePicker)
app.use(store).use(router).mount('#app')

app.config.globalProperties.$http=axios
app.config.globalProperties.$message=ElMessage
app.config.globalProperties.$confirm=ElMessageBox.confirm

