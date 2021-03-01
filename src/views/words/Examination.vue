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
        <el-tab-pane label="英译中" name="english-chinese">
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
                  :page-sizes="[3, 5, 10, 15,50,100,200]"
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
                  <el-button type="success" @click="addWrongBook(wrongList,'已加入错题本1')">加入错题本</el-button>
                  <el-button type="success" @click="verification1(wordList)">校验</el-button>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-tab-pane>
        <el-tab-pane label="中译英" name="chinese-english">
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
                  :page-sizes="[3, 5, 10, 15,50,100,200]"
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
                  <el-button type="success" @click="addWrongBook(wrongList,'已加入错题本2')">加入错题本</el-button>
                  <el-button type="success" @click="verification2(wordList)">校验</el-button>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-tab-pane>
        <el-tab-pane label="错题本1" name="mb1">
          <el-tabs :before-leave="beforeTabLeave" v-model="mb_activeName" :tab-position="tabPosition" style="height:auto;">
            <el-tab-pane label="选择日期" name="chooseDate">
              <el-tag type="success" style="width: 100%;height: 100px;line-height: 100px">
                <div class="block">
                  <span class="demonstration">请选择日期：</span>
                  <el-date-picker
                      v-model="chooseDate"
                      type="date"
                      placeholder="选择日期"
                      @change="PickerChange"
                  >
                  </el-date-picker>
                  <el-button type="primary" @click="NextStep">下一步</el-button>
                  <el-button type="danger" @click="deleteLog">删除记录管理</el-button>
                </div>
              </el-tag>

            </el-tab-pane>
            <el-tab-pane label="开始" name="start" :lazy="true">
              <el-table :data="mb"
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
                <el-table-column label="严重程度">
                  <template #default="scope">
                    <div>
                      <el-tag type="info" v-if="scope.row.level<=2">严重</el-tag>
                      <el-tag type="warning" v-else-if="scope.row.level<=4&&scope.row.level>2">非常严重</el-tag>
                      <el-tag type="danger" v-else>极度严重</el-tag>
                    </div>
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
                      @size-change="W1_handleSizeChange"
                      @current-change="W1_handleCurrentChange"
                      :current-page="parseInt(w_page)"
                      :page-sizes="[3, 5, 10,15,20]"
                      :page-size="parseInt(w_size)"
                      layout="total, sizes, prev, pager, next, jumper"
                      :total="w_total"
                      background
                  >
                  </el-pagination>
                </el-col>
                <el-col :span="9">
                  <div class="footer-box">
                    <div class="btn-vf">
                      <el-button type="success" @click="additionWrongBook(mb,'操作成功','english-chinese')">提交</el-button>
                      <el-button type="success" @click="verification1(mb)">校验</el-button>
                    </div>
                  </div>
                </el-col>
              </el-row>
            </el-tab-pane>
          </el-tabs>
        </el-tab-pane>
        <el-tab-pane label="错题本2" name="mb2">
          <el-tabs :before-leave="beforeTabLeave" v-model="mb_activeName" :tab-position="tabPosition" style="height:auto;">
            <el-tab-pane label="选择日期" name="chooseDate">
              <el-tag type="success" style="width: 100%;height: 100px;line-height: 100px">
                <div class="block">
                  <span class="demonstration">请选择日期：</span>
                  <el-date-picker
                      v-model="chooseDate"
                      type="date"
                      placeholder="选择日期"
                      @change="PickerChange"
                  >
                  </el-date-picker>
                  <el-button type="primary" @click="NextStep">下一步</el-button>
                  <el-button type="danger" @click="deleteLog">删除记录管理</el-button>
                </div>
              </el-tag>
            </el-tab-pane>
            <el-tab-pane label="开始" name="start" :lazy="true">
              <el-table :data="mb"
                        border
                        :highlight-current-row="true"
              >
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column label="中文" prop="chinese" width="350px"></el-table-column>
                <el-table-column label="英文">
                  <template #default="scope">
                    <el-input @blur="v2Blur(scope.row)" v-model="scope.row.verification2" placeholder="请输入内容"></el-input>
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
                <el-table-column label="严重程度">
                  <template #default="scope">
                    <div>
                      <el-tag type="info" v-if="scope.row.level<=2">严重</el-tag>
                      <el-tag type="warning" v-else-if="scope.row.level<=4&&scope.row.level>2">非常严重</el-tag>
                      <el-tag type="danger" v-else>极度严重</el-tag>
                    </div>
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
                      @size-change="W1_handleSizeChange"
                      @current-change="W1_handleCurrentChange"
                      :current-page="parseInt(w_page)"
                      :page-sizes="[3, 5, 10,15,20]"
                      :page-size="parseInt(w_size)"
                      layout="total, sizes, prev, pager, next, jumper"
                      :total="w_total"
                      background
                  >
                  </el-pagination>
                </el-col>
                <el-col :span="9">
                  <div class="footer-box">
                    <div class="btn-vf">
                      <el-button type="success" @click="additionWrongBook(mb,'操作成功','chinese-english')">提交</el-button>
                      <el-button type="success" @click="verification2(mb)">校验</el-button>
                    </div>
                  </div>
                </el-col>
              </el-row>
            </el-tab-pane>
          </el-tabs>

        </el-tab-pane>
      </el-tabs>

    </el-card>

    <el-dialog
        title="记录"
        v-model="LogDialogVisible"
        width="20%"
        :before-close="handleClose">
      <div class="exam-log">
        <div class="block">
          <span class="demonstration">请选择要删除的记录</span>
          <el-cascader
              :options="options"
              :props="props"
              clearable
              v-model="values"
          >
            <template #default="{ node, data }">
              <span>{{ data.label }}</span>
            </template>
          </el-cascader>
        </div>
      </div>
      <template #footer>
    <span class="dialog-footer">
      <el-button @click="LogDialogVisible = false">取 消</el-button>
      <el-button type="danger" @click="DeleteLogDialog">删除</el-button>
    </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import {ref} from "vue";
import moment from 'moment';
import {dateFormat} from '@utils/dataFormat';
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
      wrongList:[],
      AllwordList:[],
      mb:[],
      words:ref([]),
      state1: ref(''),
      moment,
      timers:"",
      currentTime:new Date(),
      activeName: 'english-chinese',
      w_page:"1",
      w_size:"3",
      w_total:0,
      mb_type:"",
      tabPosition: 'left',
      chooseDate:"",
      mb_activeName:'chooseDate',
      LogDialogVisible:false,

      values: [],
      props: {
        expandTrigger: 'hover',
        label:'label',
        value:'id',
        children:'children'
      },
      options:[
        // {id:'1',label:'english-chinese',children:[{id:'2',label:'2010-07-03'}]},
        // {id:'3',label:'bbb',children:[{id:'4',label:'2020-07-03'},{id:'8',label:'2120-07-03'}]},
        // {id:'5',label:'ccc',children:[{id:'6',label:'2030-07-03'}]},
      ]
    }
  },
  mounted() {
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
    // handleIconClick(ev){console.log(ev);},
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
    async handleClick(tab, event) {
      this.wordList.forEach(item=>{
        delete item["isTrue"]
        item["verification1"]=""
        item["verification2"]=""
      })
      this.mb.forEach(item=>{
        delete item["isTrue"]
        item["verification1"]=""
        item["verification2"]=""
      })
      this.activeName=tab.props.name

      if (tab.props.name==="mb1"){
        this.chooseDate=''
        this.mb=[]
        this.mb_activeName='chooseDate'
        this.mb_type="english-chinese"
      }
      if (tab.props.name==="mb2"){
        this.chooseDate=''
        this.mb=[]
        this.mb_activeName='chooseDate'
        this.mb_type="chinese-english"
      }
    },
    beforeTabLeave(activeName,oldActiveName){
      if(oldActiveName === 'chooseDate'&&this.chooseDate.length<=0){
        this.$message.info("请选择日期")
        return false
      }
    },
    NextStep(){
      if (this.chooseDate === "") return this.$message.info("请选择日期")
      this.mb_activeName="start"
      this.getWrongBox()
    },
    async getWrongBox(){
      const {data:res}=await this.$http.post('language/words/wb',{
        "type":this.mb_type,
        "create_time":dateFormat("YYYY-mm-dd",this.chooseDate),
        "page":this.w_page,
        "size":this.w_size
      })
      if(res.meta.status!==200) return this.$message.error("获取数据失败")
      const collections=res.data.collections
      var count=0
      var newArr=[]
      this.AllwordList.forEach(item=>{
        if (item.id === parseInt(collections[count]) && count+1<=collections.length){
          item["level"]=res.data.severity[count]
          newArr.push(item)
          count+=1
        }
        if(count+1>collections.length){
          return false
        }
      })
      this.mb=newArr
      this.w_total=res.data.total
    },

    W1_handleSizeChange(newSize){
      this.w_size=newSize+""
      this.getWrongBox()
    },
    W1_handleCurrentChange(newPage){
      this.w_page=newPage+""
      this.getWrongBox()
    },

    verification1(vlist){
      vlist.forEach((item,index)=>{
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
    verification2(vlist){
      vlist.forEach((item,index)=>{
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
      return row.chinese.split(/([a-z]{1,3}\.)|([a-z]{1,3}\/[a-z]{1,3}.)|[a-zA-Z]{4,100}.+|[\u4e00-\u9fa5]|[【】\- ;；,，（）()…\[\]、]|\n|\.{3,4}|[\/]/).filter(res=>res!==undefined && res!=="")
    },
    getWrongList(){
      const list=[]
      list.push({
        "type":this.activeName,
      })
      this.wordList.forEach(item=>{
        if (item.isTrue === undefined) return
        if(item.isTrue===false){
          list.push({
            "id":item.id,
          })
        }
      })
      return list
    },
    async addWrongBook(targets,msg){
      this.targets=this.getWrongList()
      // console.log(this.targets)
      if (this.targets.length<=1) return this.$message.info("部分题目未答")
      const {data:res}=await this.$http.post("/language/words/addwb",this.targets)
      if(res.meta.status!==200) return this.$message.error("加入失败")
      this.$message.success(msg)
    },
    async additionWrongBook(targets,msg,type){
      this.targets=targets
      // 深拷贝(乞丐版)
      var data_json=JSON.stringify(targets)
      var temp=JSON.parse(data_json)
      // temp.push()
      var arr=[]
      arr.push({"type":type})
      // temp.splice(0,0,{"type":type})
      temp.forEach(item=>{
        console.log(item.isTrue)
        if (item.isTrue === false){
          arr.push(item)
        }
      })
      if (this.targets.length<=1) return this.$message.info("部分题目未答")
      const {data:res}=await this.$http.post("/language/words/addwb",arr)
      if(res.meta.status!==200) return this.$message.error("加入失败")
      this.$message.success(msg)
    },

    // 对话框
    handleClose(){
      this.LogDialogVisible=false
    },
    async deleteLog(){
      const {data:res}=await this.$http.post("/language/words/wbto")
      if (res.meta.status!==200) return this.$message.error("获取失败")
      this.options=res.data
      this.LogDialogVisible=true
    },
    async DeleteLogDialog(){
      const {data:res}=await this.$http.post("/language/words/delwb",{
        "id":this.values[1],
        "wb_id":this.values[0]
      })
      if (res.meta.status!==200) return this.$message.error("删除失败")
      this.$message.success("删除记录成功")
      this.values=[]
      this.LogDialogVisible=false
    },
    PickerChange(){
      if (this.chooseDate === null){
        this.chooseDate=""
        this.mb=[]
      }
    }
  }
}
</script>

<style lang="less" scoped>
  .exam-log{
    padding: 10px 20px !important;

  }
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