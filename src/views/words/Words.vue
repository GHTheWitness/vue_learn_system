<template>
  <div id="words">
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
        <el-col :span="4">
          <el-button type="primary" @click="AddDialogVisible = true">添加单词</el-button>
        </el-col>
        <el-col :span="6" >
<!--          ['active'].indexOf(progressStatus)!==-1?progressStatus:-->
          <div v-show="progressIsFinish">
            <a-progress :percent="progressing" size="small" :status="progressStatus" />
          </div>
        </el-col>
        <el-col :span="6">
          <div class="top-btn">
            <el-tooltip class="item" effect="dark" content="可以进行 文件 方式批量添加" placement="top">
              <img class="words-help" :src="require('@assets/img/common/question.svg')" alt="" width="20" height="20">
            </el-tooltip>

            <el-upload
                class="upload-demo"
                action="http://127.0.0.1:8088/api/learn/files/upload"
                :headers="headerObj"
                :on-success="handleSuccess"
                :show-file-list="false"
                :on-progress="handleProgress"
            >
              <el-tooltip class="item" effect="dark" content="格式：XLSX 批量添加" placement="top">
                <el-button type="warning" plain>点击上传</el-button>
              </el-tooltip>

              <template #tip>
<!--                <div class="el-upload__tip">只能上传 jpg/png 文件，且不超过 500kb</div>-->
              </template>
            </el-upload>
            <el-tooltip class="item" effect="dark" content="上传文件 格式查看" placement="top">
              <el-button type="info" plain @click="downloadFile(1)">模板</el-button>
            </el-tooltip>
            <el-button type="success" plain @click="downloadWord">下载词库</el-button>
          </div>
        </el-col>
      </el-row>
      <el-table :data="wordList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="英文" prop="english"></el-table-column>
        <el-table-column label="中文" prop="chinese"></el-table-column>
        <el-table-column label="例句" prop="sentence"></el-table-column>
        <el-table-column label="收藏" prop="collect" width="80px">
          <template #default="scope">
            <el-switch
                v-model="scope.row.collect"
                active-color="#13ce66"
                inactive-color="#ff4949"
                @change="switchChange(scope.row)"
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200px">
          <template #default="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="getWordById(scope.row.id)">编辑</el-button>
            <el-popconfirm
                confirmButtonText='是的'
                cancelButtonText='算了'
                icon="el-icon-info"
                iconColor="red"
                title="确定要删除这个单词吗"
                @confirm="removeWord(scope.row.id)"
            >
              <template #reference>
                <el-button size="mini" icon="el-icon-delete" type="danger">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

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
    </el-card>

    <el-dialog
        title="添加单词"
        v-model="AddDialogVisible"
        width="50%"
        >
      <el-form ref="AddWordFormRef" :model="AddWordForm" :rules="AddWordFormRule" label-width="80px">
        <el-form-item label="英文" prop="english">
          <el-input v-model="AddWordForm.english"></el-input>
        </el-form-item>
        <el-form-item label="中文" prop="chinese">
          <el-input v-model="AddWordForm.chinese"></el-input>
        </el-form-item>
        <el-form-item label="例句" prop="sentence">
          <el-input v-model="AddWordForm.sentence"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="AddDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addWord">确 定</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog
        title="编辑数据"
        v-model="EditDialogVisible"
        width="50%"
        @close="EditDialogClose"
    >
      <el-form ref="EditWordFormRef" :model="EditWordForm" :rules="EditWordFormRule" label-width="80px">
        <el-form-item label="英文" prop="english">
          <el-input v-model="EditWordForm.english"></el-input>
        </el-form-item>
        <el-form-item label="中文" prop="chinese">
          <el-input v-model="EditWordForm.chinese"></el-input>
        </el-form-item>
        <el-form-item label="例句" prop="sentence">
          <el-input v-model="EditWordForm.sentence"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="EditDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editWord">修 改</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
export default {
  name: "Words",
  created() {
    this.getWordList()
    this.getAllWordList()
  },
  data(){
    return{
      progressing:0,
      progressStatus:'active',
      progressIsFinish:false,
      uploadURL:'http://127.0.0.1:8088/api/learn/files/upload',
      headerObj:{
        Authorization:window.sessionStorage.getItem('token')
      },
      queryInfo:{
        query:'',
        page:1,
        size:5
      },
      total:0,
      wordList:[],
      AllwordList:[],
      AddDialogVisible:false,
      AddWordForm:{
        english:'',
        chinese:'',
        sentence:''
      },
      AddWordFormRule:{
        english:[
          { required: true, message: '请输入添加英文单词', trigger: 'blur' },
        ],
        chinese:[
          { required: true, message: '请输入对应中文意思', trigger: 'blur' },
        ],
        sentence:[
          { required: true, message: '请输入相应的例句', trigger: 'blur' },
        ]
      },
      words:ref([]),
      state1: ref(''),
      EditWordForm:{},
      EditWordFormRule:{
        english:[
          { required: true, message: '输入框不能为空', trigger: 'blur' },
        ],
        chinese:[
          { required: true, message: '输入框不能为空', trigger: 'blur' },
        ],
        sentence:[
          { required: true, message: '输入框不能为空', trigger: 'blur' },
        ]
      },
      EditDialogVisible:false,
      userInfo:{}
    }
  },
  methods:{
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
    async getWordById(id){
      const {data:res}=await this.$http.get("/language/words/one",{
        params:{id:id}
      })
      if (res.meta.status!==200) return this.$message.error("获取数据失败")
      this.EditWordForm={
        id:id,
        english:res.data.english,
        chinese:res.data.chinese,
        sentence:res.data.sentence
      }
      this.EditDialogVisible=true
    },
    downloadFile(type){
      this.$http.get("/files/download",{
        params:{type:type},responseType:'blob'
      }).then(res=>{
        const {data}=res
        const blob=new Blob([data])
        let disposition = decodeURI(res.headers['content-disposition'])
        // 从响应头中获取文件名称
        let fileName = disposition.split("=")[1]
        if ('download' in document.createElement('a')) {
          // 非IE下载
          const elink = document.createElement('a')
          elink.download = fileName
          elink.style.display = 'none'
          elink.href = URL.createObjectURL(blob)
          document.body.appendChild(elink)
          elink.click()
          URL.revokeObjectURL(elink.href) // 释放URL 对象
          document.body.removeChild(elink)
        } else {
          // IE10+下载
          navigator.msSaveBlob(blob, fileName)
        }
      }).catch((error) => {
        console.log(error)
      })
    },
    async downloadWord(){
      const {data:resf}=await this.$http.post("/files/cfile")
      if (resf.meta.status!==200) return this.$message.error("创建数据源文件失败")
      const {data:res}=await this.$http.post("/language/words/loadable")
      if (res.meta.status!==200) return this.$message.error("获取数据源失败")
      this.downloadFile(2)
      const {data:resm}=await this.$http.post("/files/rmfile")
      if (resm!=="1") return this.$message.info("错误代码 101")
    },

    handleSizeChange(newSize){
      this.queryInfo.size=newSize
      this.getWordList()
    },
    handleCurrentChange(newPage){
      this.queryInfo.page=newPage
      this.getWordList()
    },
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
    handleClose(){
      this.AddDialogVisible=false
      this.$refs.AddWordFormRef.resetFields()
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
    addWord(){
      this.$refs.AddWordFormRef.validate(async valid=>{
        if (!valid) return
        const {data:res}=await this.$http.post('/language/words/add',this.AddWordForm)
        if (res.meta.status!==200) return this.$message.error("添加单词失败")
        this.$message.success("添加单词成功")
        this.AddDialogVisible=false
        this.$refs.AddWordFormRef.resetFields()
        await this.getWordList()
      })
    },
    editWord(){
      this.$refs.EditWordFormRef.validate(async valid=>{
        if (!valid) return
        const {data:res}=await this.$http.post('/language/words/update',this.EditWordForm)
        if (res.meta.status!==200) return this.$message.error("修改单词失败")
        this.$message.success("修改单词成功")
        this.EditDialogVisible=false
        this.$refs.EditWordFormRef.resetFields()
        await this.getWordList()
      })
    },
    async removeWord(id){
      const {data:res}=await this.$http.get("/language/words/delete",{
        params:{id:id}
      })
      if(res.meta.status!==200) return this.$message.error("删除数据失败")
      this.$message.success("删除数据成功")
      await this.getWordList()
    },
    EditDialogClose(){
      this.EditWordForm={}
      this.$refs.EditWordFormRef.resetFields()
      this.EditDialogVisible=false
    },
    async handleSuccess(){
      // this.$message.info("正在努力读取数据....")
      this.progressing=40
      const {data:res}=await this.$http.post('/language/words/adds')
      if (res.meta.status!==200){
        this.progressing=70
        this.progressStatus='exception'
        this.$message.error("读取失败,请重试")
      }
      // this.$message.success("批量添加成功")
      this.progressing=90
      const {data:resrm}=await this.$http.post('/files/rmfile')
      if (resrm !== "1") return this.$message.info("错误代码 101")
      await this.getWordList()
      this.progressing=100
      this.progressStatus='success'
      this.$message.success("批量添加数据完毕")
      setInterval(()=>{
        this.progressIsFinish=false
      },1000)
    },
    async switchChange(userInfo){
      const {data:res}=await this.$http.post("/language/words/update",{
        "id":userInfo.id,
        "collect":userInfo.collect
      })
      if (res.meta.status!==200){
        userInfo.collect=!userInfo.collect
        return this.$message.error("收藏失败")
      }
      if (userInfo.collect)
        this.$message.success("收藏成功")
      else
        this.$message.info("收藏取消")
    },
    handleProgress(even,file,fileList){
      if(even.percent === 100){
        this.progressIsFinish=true
        this.progressStatus='active'
        this.progressing=10
      }
    }
  }
}
</script>

<style lang="less" scoped>
  .top-btn{
    position: absolute;
    right: 0;
    padding: 0 10px;
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

</style>