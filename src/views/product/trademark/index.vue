<template>
  <div>
    <el-button type="primary" icon="el-icon-plus" style="margin-top:10px" @click="addTrademark">添加品牌</el-button>
    <!-- 列表展示 -->
    <el-table :data="trademarkInfo.records" index border style="width: 100%;margin:20px 0">
      <el-table-column type="index" align="center" prop="index" label="序号" width="80" />
      <el-table-column align="center" prop="tmName" label="品牌名称" />
      <el-table-column align="center" label="品牌LOGO">
        <template slot-scope="scope">
          <img :src="scope.row.logoUrl" alt="" style="width:100px;height:60px">
        </template>
      </el-table-column>
      <el-table-column align="center" prop="date" label="操作" width="300">
        <template slot-scope="{row}">
          <el-button type="warning" icon="el-icon-edit" size="mini" @click="editTrademark(row)">编辑</el-button>
          <el-button type="danger" icon="el-icon-close" size="mini" @click="deleteTrademark(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <el-pagination v-if="trademarkInfo.current" style="text-align:center" :current-page="trademarkInfo.current"
      :page-sizes="[limit,5, 10]" :page-size="trademarkInfo.size" layout="prev, pager, next, jumper,->,total, sizes"
      :total="trademarkInfo.total" @size-change="handleSizeChange" @current-change="handleCurrentChange" />

    <!-- 对话框 -->
    <el-dialog :title="trademarkForm.id?'修改品牌':'添加品牌'" :visible.sync="dialogVisible">
      <el-form ref="trademarkform" :rules="rules" :model="trademarkForm" style="width:80%!important">
        <el-form-item label="品牌名称" prop="tmName" label-width="100px">
          <el-input v-model="trademarkForm.tmName" autocomplete="off" />
        </el-form-item>
        <el-form-item label="品牌LOGO" label-width="100px" prop="logoUrl">
          <!-- action="http://39.98.153.211/admin/product/fileUpload" 这样可以但是很容易让人看出来后台地址 -->
          <!-- el-upload文件上传的过程：
                          1. 点击或拖拽文件时上传时是先触发before-upload="beforeAvatarUpload" 判断文件的类型
                          2. 文件类型符合后会通过action去发请求将图片存储到服务器中
                          3. 当服务器响应后拦截下来，触发on-success="handleAvatarSuccess" 将返回值传递到handleAvatarSuccess
             -->
          <el-upload class="upload-demo" drag action="/dev-api/admin/product/fileUpload" multiple
            :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload" :show-file-list="false">
            <img v-if="trademarkForm.logoUrl" style="width:360px;height:180px" :src="trademarkForm.logoUrl"
              class="avatar">
            <i v-else class="el-icon-upload" />
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addOrUpdateTrademark">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: "Trademark",
    data() {
      return {
        page: (sessionStorage.getItem("SAVE_PAGE") * 1) || 1,
        limit: (sessionStorage.getItem("SAVE_LIMIT") * 1) || 3,
        trademarkInfo: {},
        // 对话框
        dialogVisible: false,
        trademarkForm: {
          id: "",
          tmName: "",
          logoUrl: ""
        },
        rules: {
          tmName: [{
            required: true,
            message: '请输入品牌名称',
            trigger: 'blur'
          }],
          logoUrl: [{
            required: true,
            message: '请选择LOGO上传',
            trigger: 'blur'
          }]
        }
      }
    },
    mounted() {
      this.initTrademarkInfo();
    },
    methods: {
      addOrUpdateTrademark() {
        this.$refs.trademarkform.validate((val) => {
          if (val) {
            new Promise((resolve, reject) => {
              // 这里判断了是否有id而决定发起不同的请求

              this.$http.trademark.addOrUpdateTrademark(this.trademarkForm).then(res => {
                if (res.code === 200) {
                  this.$message.success(this.trademarkForm.id ? "修改成功" : "添加成功");
                  this.dialogVisible = false;
                  this.initTrademarkInfo();
                  resolve()
                }
              }).catch(err => {
                this.$message.error(err.message)
                reject()
              })
            })
          } else {
            this.$message.error("必须有名称和图片");
          }
        })
      },
      addTrademark() {
        this.trademarkForm = {
          id: "",
          tmName: "",
          logoUrl: ""
        }
        this.dialogVisible = true;
        console.log(this.trademarkForm, "add");
      },
      editTrademark(trademark) {
        // this.trademarkForm = trademark;
        // 注意！ 添加时是直接传递的地址值，如果改修任意一项就会修改table内的数据
        // 深拷贝/浅拷贝
        this.trademarkForm = {
          ...trademark
        };
        // console.log(a);
        this.dialogVisible = true
        console.log(this.trademarkForm, "edit");
      },
      deleteTrademark(id) {
        this.$confirm('此操作将永久删除该品牌, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          new Promise((resolve, reject) => {
            this.$http.trademark.deleteBaseTrademark(id).then(res => {
              if (res.code === 200) {
                this.$message.success("删除成功");
                if (this.trademarkInfo.records.length === 0 && this.page !== 1) {
                  // 是否是最后一页的最后一个品牌删除
                  this.page--;
                  this.savePage();
                  this.initTrademarkInfo();
                  resolve();
                  return;
                }
                this.initTrademarkInfo();
                resolve();
              }
            }).catch(err => {
              this.$message.error(err.message)
              reject(err);
            })
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        });
      },
      initTrademarkInfo() {
        new Promise((resolve, reject) => {
          this.$http.trademark.getBaseTrademark(this.page, this.limit).then(res => {
            if (res.code === 200) {
              this.trademarkInfo = res.data;
              resolve();
            }
          }).catch(error => {
            reject(error);
          });
        })
      },
      handleSizeChange(val) {
        this.limit = val;
        this.initTrademarkInfo();
        this.savePage();
      },
      handleCurrentChange(val) {
        this.page = val;
        this.initTrademarkInfo();
        this.savePage();
      },
      handleAvatarSuccess(res) {
        // res能拿到请求的respones
        if (res.code === 200) {
          this.trademarkForm.logoUrl = res.data;
        }
        // this.imageUrl = URL.createObjectURL(file.raw); //这里生产的路径是根据本地地址生成的路径，不是从服务器端拿来的
      },
      beforeAvatarUpload(file) {
        const isJPG = file.type === 'image/jpeg';
        const isLt2M = file.size / 1024 / 1024 < 2;

        if (!isJPG) {
          this.$message.error('上传头像图片只能是 JPG 格式!');
        }
        if (!isLt2M) {
          this.$message.error('上传头像图片大小不能超过 2MB!');
        }
        return isJPG && isLt2M;
      },
      savePage() {
        // 刷新时页数不变
        sessionStorage.setItem("SAVE_PAGE", this.page)
        sessionStorage.setItem("SAVE_LIMIT", this.limit)
      }

    }
  }

</script>

<style>
</style>
