<template>
  <div>
    <el-form :model="spuForm">
      <!-- 名称 -->
      <el-form-item label="SPU名称" label-width="100px">
        <el-input v-model="spuForm.spuName" placeholder="SPU名称" />
      </el-form-item>
      <!-- 品牌 -->
      <el-form-item label="品牌" label-width="100px">
        <el-select v-model="spuForm.tmId" placeholder="请选择">
          <el-option v-for="(tm,index) in trademarkList" :key="tm.id" :label="tm.tmName" :value="tm.id" />
        </el-select>
      </el-form-item>
      <!-- 描述 -->
      <el-form-item label="SPU描述" label-width="100px">
        <el-input v-model="spuForm.description" type="textarea" rows="4" />
      </el-form-item>
      <!-- 图片 -->
      <el-form-item label="SPU图片" label-width="100px">
        <!-- :file-list="spuImageList" 能让上传的图片显示，但是显示的字段必须拥有name和url字段 -->
        <el-upload action="/dev-api/admin/product/fileUpload" list-type="picture-card"
          :on-preview="handlePictureCardPreview" :on-success="handleSuccess" :on-remove="handleRemove"
          :file-list="spuImageList">
          <i class="el-icon-plus" />
        </el-upload>
        <el-dialog :visible.sync="dialogVisible">
          <img width="100%" :src="dialogImageUrl" alt="">
        </el-dialog>
      </el-form-item>
      <!-- 销售属性 -->
      <el-form-item label="销售属性" label-width="100px">
        <el-select v-model="SpuSaleAttrInfo" :placeholder="'还有'+unUseSpuSaleAttrOptions.length+'项属性可选'">
          <!--  v-for="op in unUseSpuSaleAttrOptions" :key="op.id" :label="op.name" :value="op.id" -->
          <el-option v-for="op in unUseSpuSaleAttrOptions" :key="op.id" :label="op.name"
            :value="`${op.id}:${op.name}`" />
        </el-select>
        <el-button :disabled="!SpuSaleAttrInfo" type="primary" icon="el-icon-plus" style="margin-left:10px"
          @click="addSpuSaleAttr">添加销售属性
        </el-button>
        <el-table :data="spuForm.spuSaleAttrList" border style="margin:20px 0">
          <el-table-column label="序号" type="index" width="80px" />
          <el-table-column prop="saleAttrName" label="属性名" width="100px" />
          <el-table-column label="属性名称列表">
            <template slot-scope="{row,$index}">
              <el-tag v-for="(attrtag,aindex) in row.spuSaleAttrValueList" :key="attrtag.id" closable
                :disable-transitions="false" @close="handleClose(row,aindex)">
                {{ attrtag.saleAttrValueName }}
              </el-tag>
              <el-input v-if="row.inputVisible" ref="saveTagInput" v-model="row.inputValue" class="input-new-tag"
                size="small" @change="handleInputConfirm(row)" />
              <el-button v-else class="button-new-tag" size="small" @click="showInput(row)">+ New Tag</el-button>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80px">
            <template slot-scope="{row,$index}">
              <HintButton type="danger" title="删除" icon="el-icon-delete" size="mini"
                @click="deleteCurrentAttr($index)" />
            </template>
          </el-table-column>
        </el-table>
        <el-button type="primary" @click="save">保存</el-button>
        <el-button @click="$emit('update:visible',false)">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  export default {

    /**
     * bug:   当添加时使用 keyup.navtie 时会触发别的组件的事件调用！
     *      所以当element中最好不使用keyup.navtie改为change
     */
    name: "SpuForm",
    data() {
      return {
        SpuSaleAttrInfo: "",
        dialogImageUrl: '',
        dialogVisible: false,
        category3Id: 0,
        spuForm: {
          category3Id: "",
          spuName: "",
          description: "",
          id: "",
          tmId: "",
          spuImageList: [
            //   {
            //   id: 0,
            //   imgName: "string",
            //   imgUrl: "string",
            //   spuId: 0
            // }
          ],
          spuSaleAttrList: [
            //   {
            //   baseSaleAttrId: 0,
            //   id: 0,
            //   saleAttrName: "string",
            //   spuId: 0,
            //   spuSaleAttrValueList: [{
            //     baseSaleAttrId: 0,
            //     id: 0,
            //     isChecked: "string",
            //     saleAttrNam: "string",
            //     saleAttrValueName: "string",
            //     spuId: 0
            //   }]
            // }
          ]
        },
        // 下面的三个数据都是为了修改而初始化的数据，当点击修改后再把spuFrom的内容替换
        trademarkList: [],
        spuImageList: [],
        baseSaleAttrList: []

      }
    },
    computed: {
      unUseSpuSaleAttrOptions() {
        // saleAttrName
        // this.spuForm.spuSaleAttrList
        return this.spuForm.spuSaleAttrList && this.baseSaleAttrList.filter(item => {
          // 思路： 取出某一项进行every判断， 如果名称和这个数组的每一项都不相同就返回true
          // every方法判断this.spuForm.spuSaleAttrList的每一项是否都与item不同，如果是则返回true;
          // every 是全部都符合条件才返回true;
          return this.spuForm.spuSaleAttrList.every(spuSaleAttr => item.name !== spuSaleAttr.saleAttrName)
        }) || []
      }
    },
    methods: {
      save() {
        // 处理图片

        const {
          spuImageList,
          spuForm
        } = this;
        spuForm.category3Id = this.category3Id;
        console.log(spuImageList);
        spuForm.spuImageList = spuImageList.map(item => {
          return {
            // 因为前面展示图片的时候已经把图片列表中的每一项都添加了name和url字段了所以不用怕取不到
            imgName: item.name,
            // item.imgUrl 是原本就有的图片， item.response.data是拿到新添加的图片
            imgUrl: item.imgUrl || item.response.data
          }
        });
        spuForm.spuSaleAttrList.forEach(item => {
          delete item.inputValue;
          delete item.inputVisible;
        });

        new Promise((resolve, reject) => {
          this.$http.spu.addUpdate(spuForm).then(res => {
            if (res.code === 200) {
              this.$message.success("保存成功")
              this.$emit("update:visible", false);
              this.$emit("saveSuccess");
              resolve();
            } else {
              this.$message.error("保存失败");
              reject(res.message);
            }
          }).catch(err => {
            reject(err)
          })
        })
      },
      addSpuSaleAttr() {
        const [baseSaleAttrId, saleAttrName] = this.SpuSaleAttrInfo.split(":");
        const obj = {
          baseSaleAttrId,
          saleAttrName,
          spuSaleAttrValueList: []
        }
        this.spuForm.spuSaleAttrList.push(obj);
        this.SpuSaleAttrInfo = "";
      },
      handleRemove(file, fileList) {
        // console.log(file, fileList);  被删除的对象， 被删除后的数组对象
        this.spuImageList = fileList;
      },
      handlePictureCardPreview(file) {
        // 选中的图片放大
        this.dialogImageUrl = file.url;
        this.dialogVisible = true;
      },
      handleSuccess(res, file, fileList) {
        this.spuImageList = fileList;
      },
      // 修改
      async getEditInfo(spu) {
        // get spu
        // getSpuImageList sku
        // getSaleAttrList spu
        // getTrademarkList trademark
        await this.$http.spu.get(spu.id).then(res => {
          if (res.code === 200) {
            this.spuForm = res.data;
          }
        })
        await this.$http.sku.getSpuImageList(spu.id).then(res => {
          if (res.code === 200) {
            // 处理  upload 组件显示图片列表
            // el-upload的file-list 必须拥有name和url字段不然无法显示图片
            const spuImageList = res.data;
            spuImageList.forEach(item => {
              item.name = item.imgName;
              item.url = item.imgUrl;
            })
            this.spuImageList = spuImageList;
          }
        })

        await this.$http.trademark.getTrademarkList().then(res => {
          if (res.code === 200) {
            this.trademarkList = res.data;
          }
        })

        await this.$http.spu.getSaleAttrList().then(res => {
          if (res.code === 200) {
            this.baseSaleAttrList = res.data
          }
        })
      },
      // 添加
      async addSpu() {
        // getTrademarkList trademark
        // getSaleAttrList spu
        await this.$http.trademark.getTrademarkList().then(res => {
          if (res.code === 200) {
            this.trademarkList = res.data;
          }
        })

        await this.$http.spu.getSaleAttrList().then(res => {
          if (res.code === 200) {
            this.baseSaleAttrList = res.data
          }
        })
      },
      handleClose(row, index) {
        row.spuSaleAttrValueList.splice(index, 1);
      },

      showInput(row) {
        this.$set(row, "inputVisible", true);
        this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus();
        });
      },

      handleInputConfirm(row) {
        const saleAttrValueName = row.inputValue;
        const repeat = row.spuSaleAttrValueList.every(item => item.saleAttrValueName !==
          saleAttrValueName);
        console.log(row);
        if (saleAttrValueName && repeat) {
          // row.push(inputValue);
          row.spuSaleAttrValueList.push({
            baseSaleAttrId: row.baseSaleAttrId,
            saleAttrValueName
          });
        } else {
          this.$message.info("属性值不能为空或重复的内容")
        }
        row.inputVisible = false;
        row.inputValue = '';
      },
      deleteCurrentAttr(row, index) {
        this.$confirm('此操作将永久删除该品牌, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.spuForm.spuSaleAttrList.splice(index, 1)
        }).catch(() => {
          return;
        })
      },
      clearData() {
        this.SpuSaleAttrInfo = ""
        this.dialogImageUrl = ''
        this.dialogVisible = false
        this.category3Id = 0
        this.spuForm = {
          category3Id: "",
          spuName: "",
          description: "",
          id: "",
          tmId: "",
          spuImageList: [

          ],
          spuSaleAttrList: [

          ]
        }
        this.trademarkList = []
        this.spuImageList = []
        this.baseSaleAttrList = []
      }
    }
  }

</script>

<style scoped>
  .el-tag+.el-tag {
    margin-left: 10px;
  }

  .button-new-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }

  .input-new-tag {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
  }

</style>
