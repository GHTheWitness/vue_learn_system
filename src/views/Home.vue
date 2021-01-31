<template>
  <div>
    <el-container style="height: 100vh; border: 1px solid #eee">
      <el-aside :width="isCollapse ?'64px':'200px'" style="background-color: #b3c0d1">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <el-menu
          :router="true"
          :collapse="isCollapse"
          :collapse-transition="false"
          background-color="#b3c0d1"
          active-text-color="#993333"
          :default-active="activePath"
        >
          <el-submenu :index="item.id+''" v-for="(item,index) in menuList" :key="item.id">
            <template #title>
              <img v-if="icons1[item.id] !== ''" :src="require('@assets/img/left/'+icons1[item.id])" height="20" width="20" alt="">
              <img v-else :src="require('@assets/img/left/default2.svg')" height="20" width="20" alt="">
              <span class="left_text">{{item.modelName}}</span>
            </template>
            <el-menu-item
                :index="'/'+subItem.path+''"
                :key="subItem.id"
                v-for="subItem in item.children"
                @click="saveNavState('/'+subItem.path+'')"
            >
              <template #title>
                <img v-if="icons2[subItem.id] !== ''" :src="require('@assets/img/left/'+icons2[subItem.id])" height="20" width="20" alt="">
                <img v-else :src="require('@assets/img/left/default.svg')" height="20" width="20" alt="">
                <span class="left_text">{{subItem.modelName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>

      <el-container>
        <el-header style="text-align: right; font-size: 12px">
          <el-alert
              type="info"
              show-icon
              class="alert-home"
              :closable="false"
              @click="ToWelcome"
          >
            <template #title>
              <p>主页面</p>
            </template>
          </el-alert>
          <el-dropdown>
            <i class="el-icon-setting" style="margin-right: 15px"></i>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>查看</el-dropdown-item>
                <el-dropdown-item @click="loginout">注销</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <span>{{username}}</span>
        </el-header>

        <el-main style="background-color: rgb(40,44,52)">
          <router-view v-slot="{ Component }">
            <keep-alive>
              <component :is="Component" />
            </keep-alive>
          </router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
export default {
  name: "Home",
  created() {
    this.getUserInfo()
    this.getMenuList()
    this.activePath=window.sessionStorage.getItem('activePath')
  },
  data() {
    return{
      username:'',
      menuList: [],
      icons1:{
        '1':'language.svg',
        '5':'statistics.svg',
        '9':'',
        '13':''
      },
      icons2:{
        '2':'all.svg',
        '3':'marked.svg',
        '4':'unmarked.svg',
        '6':'study.svg',
        '7':'right.svg',
        '8':'exam.svg',
        '12':'translate.svg',
        '10':'',
        '11':'',
        '14':''
      },
      isCollapse:false,
    }
  },
  methods:{
    async getUserInfo(){
      const {data:res}=await this.$http.post("/users/me")
      if (res.meta.status!==200) return this.$message.error("读取用户信息失败")
      this.username=res.data.uname
    },
    async getMenuList(){
      const {data:res}=await this.$http.get('/menus/a')
      this.menuList=res.data
    },
    toggleCollapse(){
      this.isCollapse=!this.isCollapse
    },
    saveNavState(activePath){
      window.sessionStorage.setItem('activePath',activePath)
    },
    ToWelcome(){
      this.$router.push("/welcome")
    },
    loginout(){
      window.sessionStorage.clear()
      this.$message.info("用户已退出")
      this.$router.push('/login')
    },
  }

}
</script>

<style scoped>
.el-menu{
  border-right: 0;
}
.el-header {
  background-color: #b3c0d1;
  color: #333;
  line-height: 60px;
}

.el-aside {
  color: #333;
}

.left_text{
  margin-left: 20px;
  font-weight: 550;
  letter-spacing: 1px;
}
.toggle-button{
  background-color: #4a5064;
  font-size: 10px;
  line-height: 24px;
  color: white;
  text-align: center;
  cursor: pointer;
  letter-spacing: 0.2em;
}

.alert-home{
  width: 200px;
  height: 40px;
  position: absolute;
  top: 12px;
  cursor: pointer;
}
</style>