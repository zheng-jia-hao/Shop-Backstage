<template>
  <div>
    <div v-show="!showSkuForm && !showSpuForm">
      <AttrSelectOptions :is-show-list="isShowList" @clearAttrList="attrList = []" />
      <el-card style="margin:20px 0">
        <el-button type="primary" :disabled="!attrList.records" icon="el-icon-plus" @click="addSpu">添加SPU
        </el-button>
        <el-table style="margin:20px 0" :data="attrList.records" border>
          <el-table-column type="index" align="center" prop="index" label="序号" width="80" />
          <el-table-column prop="spuName" label="SPU名称" />
          <el-table-column prop="description" label="SPU描述" />
          <el-table-column label="操作">
            <template slot-scope="{row}">
              <HintButton style="margin-right:5px" type="primary" icon="el-icon-plus" size="mini" title="添加SKU属性"
                @click="addSku(row)" />
              <HintButton style="margin-right:5px" type="warning" icon="el-icon-edit" size="mini" title="编辑"
                @click="editSpu(row)" />
              <HintButton style="margin-right:5px" type="info" icon="el-icon-s-operation" size="mini" title="查看sku列表"
                @click="showSkuList(row)" />

              <HintButton style="margin-right:5px" type="danger" icon="el-icon-delete" size="mini" title="删除"
                @click="deleteSpu(row.id)" />
            </template>
          </el-table-column>
        </el-table>
        <el-pagination style="text-align: center;margin-top:20px" :disabled="!attrList.records"
          :current-page.sync="attrList.current" :page-sizes="[3,5,7,10]" :page-size="attrList.size"
          layout="prev, pager, next, jumper,->,total, sizes" :total="attrList.total" @size-change="handleSizeChange"
          @current-change="handleCurrentChange" />
      </el-card>

    </div>
    <!-- 添加spu界面 -->
    <div v-show="showSpuForm" style="margin:20px">
      <el-card shadow="always">
        <!-- .sync 实现的是父子数据同步 子组件通过$emit("update:xxx"，参数)的方式调用 -->
        <spuForm ref="spu" :visible.sync="showSpuForm" @saveSuccess="saveSuccess" />
      </el-card>
    </div>
    <!-- 添加sku界面 -->
    <div v-show="showSkuForm" style="margin:20px">
      <el-card shadow="always">
        <skuForm ref="sku" :visible.sync="showSkuForm" />
      </el-card>
    </div>
    <el-dialog :title="skuTitle" :visible.sync="dialogTableVisible">
      <el-table :data="skuList">
        <el-table-column property="skuName" label="名称" />
        <el-table-column property="price" label="价格(元)" />
        <el-table-column property="weight" label="重量(KG)" />
        <el-table-column label="默认图片">
          <template slot-scope="{row}">
            <img :src="row.skuDefaultImg" style="width:100px;height:100px" alt="">
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

  </div>
</template>

<script>
  import skuForm from "../publicComponents/skuForm.vue";
  import spuForm from "../publicComponents/spuForm.vue";

  export default {
    name: "Spu",
    components: {
      skuForm,
      spuForm
    },
    data() {
      return {
        isShowList: true,
        category3Id: 0,
        Ids: {},
        page: 1,
        limit: 3,
        attrList: {},
        showSkuForm: false,
        showSpuForm: false,
        // sku
        skuList: [],
        skuTitle: "",
        dialogTableVisible: false
      }
    },
    mounted() {
      this.$bus.$on("getAttrInfoList", this.getAttrInfoList)
    },
    methods: {
      deleteSpu(id) {
        this.$confirm('此操作将永久删除该SPU, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          const res = await this.$http.spu.remove(id);
          if (res.code === 200) {
            this.saveSuccess();
          } else {
            this.$message.info("删除失败")
          }
        }).catch(() => {
          return;
        })
      },
      saveSuccess() {
        this.getAttrList();
      },
      // addSpu 和 editSpu 用的是同一个界面
      addSpu() {
        this.showSpuForm = true;
        this.$refs.spu.clearData();
        this.$refs.spu.category3Id = this.category3Id;
        this.$refs.spu.addSpu();
      },
      editSpu(row) {
        // 点击时调用子组件内的方法去发请求
        this.showSpuForm = true;
        this.$refs.spu.clearData();
        this.$refs.spu.category3Id = this.category3Id;
        this.$refs.spu.getEditInfo(row);
      },
      addSku(row) {
        this.showSkuForm = true;
        // this.$refs.sku.reSetData();
        this.$refs.sku.initSkuFormData(row, this.Ids);
      },
      async showSkuList(row) {
        this.skuTitle = row.spuName;
        this.skuList = [];
        const res = await this.$http.sku.getListBySpuId(row.id);
        if (res.code === 200) {
          this.skuList = res.data;
          this.dialogTableVisible = true;
        }
      },
      getAttrList() {
        new Promise((resolve, reject) => {
          this.$http.spu.getList(this.page, this.limit, this.category3Id).then(res => {
            if (res.code === 200) {
              console.log(this.page, this.limit, this.category3Id, res);
              this.attrList = res.data
              resolve()
            } else {
              reject(res.message);
            }
          }).catch(err => {
            reject(err);
          })
        })
      },
      getAttrInfoList(IDs) {
        this.category3Id = IDs.category3Id;
        this.Ids = IDs;
        this.getAttrList();
      },
      handleSizeChange(index) {
        this.limit = index;
        this.getAttrList();
      },
      handleCurrentChange(index) {
        this.page = index;
        this.getAttrList();
      }
    }
  }

</script>

<style lang="sass" scoped>

</style>
