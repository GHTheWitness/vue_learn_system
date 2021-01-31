<template>
  <div id="examination">
    <el-card :body-style="{backgroundColor:'#404452'}">
      <el-row :gutter="20">
        <el-col :span="8" class="words-head">
          <el-autocomplete
              popper-class="my-autocomplete"
              v-model="state1"
              :fetch-suggestions="querySearch"
              placeholder="请输入内容"
              @select="handleSelect"
              :highlight-first-item="true"
              @change="InputChangeAutocomplete"
              clearable
              @clear="ClearInputAutocomplete"
              :hide-loading="true"
          >
            <template #default="{ item }">
              <div class="name">{{ item.english }}</div>
              <span class="addr">{{ item.chinese }}</span>
            </template>
            <template #append>
              <el-button icon="el-icon-search" @click="btnSearch"></el-button>
            </template>
          </el-autocomplete>
        </el-col>
        <el-col :offset="10" :span="6">
          <div class="top-btn">
            <el-button type="info" class="btn-random" @click="randomClick">随机打乱</el-button>
            <a-time-picker :value="moment(currentTime, 'HH:mm:ss')" disabled />
          </div>
        </el-col>
      </el-row>
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="英译中" name="one">
          <el-table :data="wordList"
                    border
                    :highlight-current-row="true"
          >
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="英文" prop="english" width="280px"></el-table-column>
            <el-table-column label="词性" width="200px">
              <template #default="scope">
                <div v-if="getWordState(scope.row).length>0">{{getWordState(scope.row)}}</div>
                <div v-else></div>
              </template>
            </el-table-column>
            <el-table-column label="中文">
              <template #default="scope">
                <el-input @blur="v1Blur(scope.row)" v-model="scope.row.verification1" placeholder="请输入内容"></el-input>
              </template>
            </el-table-column>
            <el-table-column label="校验结果" width="100px">
              <template #default="scope">
                <div v-if="scope.row.isTrue === true">
                  <img :src="require('@assets/img/common/success.svg')" width="20" height="20" alt="">
                </div>
                <div v-else-if="scope.row.isTrue === false">
                  <img :src="require('@assets/img/common/error.svg')" width="20" height="20" alt="">
                </div>
                <div v-else></div>
              </template>
            </el-table-column>
            <el-table-column label="答案" prop="english">
              <template #default="scope">
                <div>
                  <el-tooltip class="item" effect="dark" :content="scope.row.chinese" placement="right">
                    <i class="el-icon-warning-outline"></i>
                  </el-tooltip>
                </div>
              </template>
            </el-table-column>
          </el-table>
          <el-row>
            <el-col :span="15">
              <el-pagination
                  @size-change="handleSizeChange"
                  @current-change="handleCurrentChange"
                  :current-page="queryInfo.page"
                  :page-sizes="[3, 5, 10, 15,100,200]"
                  :page-size="queryInfo.size"
                  layout="total, sizes, prev, pager, next, jumper"
                  :total="total"
                  background
              >
              </el-pagination>
            </el-col>
            <el-col :span="9">
              <div class="footer-box">
                <div class="btn-vf">
                  <el-button type="success" @click="addWrongBook1">加入错题本</el-button>
                  <el-button type="success" @click="verification1">校验</el-button>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-tab-pane>
        <el-tab-pane label="中译英" name="two">
          <el-table :data="wordList"
                    border
                    :highlight-current-row="true"
          >
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="中文" prop="chinese"></el-table-column>
            <el-table-column label="英文">
              <template #default="scope">
                <el-input @blur="v2Blur(scope.row)" v-model="scope.row.verification2" placeholder="请输入内容"></el-input>
              </template>
            </el-table-column>
            <el-table-column label="校验结果">
              <template #default="scope">
                <div v-if="scope.row.isTrue === true">
                  <img :src="require('@assets/img/common/success.svg')" width="20" height="20" alt="">
                </div>
                <div v-else-if="scope.row.isTrue === false">
                  <img :src="require('@assets/img/common/error.svg')" width="20" height="20" alt="">
                </div>
                <div v-else></div>
              </template>
            </el-table-column>
            <el-table-column label="答案" prop="english">
              <template #default="scope">
                <div>
                  <el-tooltip class="item" effect="dark" :content="scope.row.english" placement="right">
                    <i class="el-icon-warning-outline"></i>
                  </el-tooltip>
                </div>
              </template>
            </el-table-column>
          </el-table>
          <el-row>
            <el-col :span="15">
              <el-pagination
                  @size-change="handleSizeChange"
                  @current-change="handleCurrentChange"
                  :current-page="queryInfo.page"
                  :page-sizes="[3, 5, 10, 15,100,200]"
                  :page-size="queryInfo.size"
                  layout="total, sizes, prev, pager, next, jumper"
                  :total="total"
                  background
              >
              </el-pagination>
            </el-col>
            <el-col :span="9">
              <div class="footer-box">
                <div class="btn-vf">
                  <el-button type="success" @click="addWrongBook2">加入错题本</el-button>
                  <el-button type="success" @click="verification2">校验</el-button>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-tab-pane>
        <el-tab-pane label="错题本1" name="second">错题本1</el-tab-pane>
        <el-tab-pane label="错题本2" name="third">错题本2</el-tab-pane>
      </el-tabs>

    </el-card>
  </div>
</template>

<script>
import {ref} from "vue";
import moment from 'moment';
export default {
  name: "Examination",
  data(){
    return{
      queryInfo:{
        query:'',
        page:1,
        size:5
      },
      total:0,
      wordList:[],
      randomList:[],
      AllwordList:[],
      words:ref([]),
      state1: ref(''),
      moment,
      timers:"",
      currentTime:new Date(),

      activeName: 'one',
    }
  },
  created() {
    this.getWordList()
    this.getAllWordList()
    var _this=this
    this.timers=setInterval(function (){
      _this.currentTime=new Date()
    },1000)
  },
  unmounted() {
    if (this.timer) {
      clearInterval(this.timer); // 在Vue实例销毁前，清除我们的定时器
    }
  },
  methods:{
    // API获取数据
    async getAllWordList(){
      const {data:res}=await this.$http.get("/language/words/",{
        params:{
          page:0,
          size:0
        }
      })
      this.AllwordList=res.data
    },
    async getWordList(){
      const {data:res}=await this.$http.get("/language/words/",{
        params:this.queryInfo
      })
      this.wordList=res.data
      this.total=res.meta.count
    },

    // 分页
    handleSizeChange(newSize){
      this.queryInfo.size=newSize
      this.getWordList()
    },
    handleCurrentChange(newPage){
      this.queryInfo.page=newPage
      this.getWordList()
    },

    // 自动完成搜索
    InputChangeAutocomplete(){
      this.queryInfo.query=this.state1
    },
    ClearInputAutocomplete(){
      this.queryInfo.query=''
      this.getWordList()
    },
    btnSearch(){
      this.getWordList()
    },
    handleSelect(item){
      this.state1=item.english
      this.queryInfo.query=this.state1
      this.getWordList()
    },
    handleIconClick(ev){console.log(ev);},
    querySearch(queryString, cb){
      this.words.value=this.AllwordList
      var results = queryString
          ? this.words.value.filter(this.createFilter(queryString))
          : this.words.value;
      // 调用 callback 返回建议列表的数据
      return cb(results);
    },
    createFilter(queryString){
      return (word)=>{
        return word.english.toLowerCase().indexOf(queryString.toLowerCase())===0
      }
    },

    // 随机按钮
    randomClick(){this.wordList.sort(()=>Math.random()>0.5?1:-1)},

    // 标签页设置
    handleClick(tab, event) {
      this.wordList.forEach(item=>{
        delete item["isTrue"]
        item["verification1"]=""
        item["verification2"]=""
      })
    },
    verification1(){
      this.wordList.forEach((item,index)=>{
        item["isTrue"]=""
        const judge=item["chinese"].split(/[；;,， ]|[a-z]{1,3}\.|\(.*?\)/).filter(res=>res!==undefined && res!=="")
        if (judge.indexOf(item["verification1"])>=0){
          item["isTrue"]=true
        }else {
          item["isTrue"]=false
        }
      })
      this.$message.success("校验成功")
    },
    verification2(){
      this.wordList.forEach((item,index)=>{
        item["isTrue"]=""
        const judge1=item["english"]
        if (judge1 === item["verification2"]){
          item["isTrue"]=true
        }else {
          item["isTrue"]=false
        }
      })
      this.$message.success("校验成功")
    },
    // 失去焦点判断
    v1Blur(row){
      const judge=row.chinese.split(/[；;,， ]|[a-z]{1,3}\.|\(.*?\)/).filter(res=>res!==undefined && res!=="")
      if (judge.indexOf(row.verification1)>=0){
        row.isTrue=true
      }else {
        row.isTrue=false
      }
    },
    v2Blur(row){
      if (row.verification2 === row.english){
        row.isTrue=true
      }else {
        row.isTrue=false
      }
    },
    getWordState(row){
      // console.log(row.chinese.split(/([a-z]{1,3}\.)|([a-z]{1,3}\/[a-z]{1,3}.)|[a-zA-Z]{4,100}.+|[\u4e00-\u9fa5]|[【】\- ;；,，（）()…\[\]、]|\n|\.{3,4}/).filter(res=>res!==undefined && res!==""))
      return row.chinese.split(/([a-z]{1,3}\.)|([a-z]{1,3}\/[a-z]{1,3}.)|[a-zA-Z]{4,100}.+|[\u4e00-\u9fa5]|[【】\- ;；,，（）()…\[\]、]|\n|\.{3,4}|[\/]/).filter(res=>res!==undefined && res!=="")
    },
    addWrongBook1(){
      this.$message.success("已加入错题本1")
    },
    addWrongBook2(){
      this.$message.success("已加入错题本2")
    }
  }
}
</script>

<style lang="less" scoped>
  .special-col{
    font-weight: 500;
    font-size: 80px;
  }
  .top-btn{
    position: absolute;
    right: 0;
    padding: 0 10px;
    .btn-random{
      margin-right: 20px;
    }
  }
  .words-help{
    margin-right: 10px;
    top: 1px;
  }

  .my-autocomplete {
    li {
      line-height: normal;
      padding: 7px;

      .name {
        text-overflow: ellipsis;
        overflow: hidden;
      }

      .addr {
        font-size: 12px;
        color: #b4b4b4;
      }

      .highlighted .addr {
        color: #ddd;
      }
    }
  }

  .upload-demo{
    position: relative;
    display: inline-block;
    margin-right: 10px;
  }
  .footer-box{
    position: relative;
    .btn-vf{
      margin-top: 5px;
      position: absolute;
      right: 0;
    }
  }
</style>