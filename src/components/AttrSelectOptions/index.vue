<template>
  <div style="margin-top:10px">
    <el-card shadow="always">
      <!-- inline让表单变成一行显示 -->
      <el-form :inline="true" :model="selectForm" class="demo-form-inline" :disabled="!isShowList">
        <el-form-item label="一级分类">
          <el-select v-model="selectForm.category1Id" placeholder="请选择" @change="getCategory2">
            <el-option v-for="c1 in Category1" :key="c1.id" :label="c1.name" :value="c1.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="二级分类">
          <el-select v-model="selectForm.category2Id" placeholder="请选择" @change="getCategory3">
            <el-option v-for="c2 in Category2" :key="c2.id" :label="c2.name" :value="c2.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="三级分类">
          <el-select v-model="selectForm.category3Id" placeholder="请选择" @change="getAttrInfoList">
            <el-option v-for="c3 in Category3" :key="c3.id" :label="c3.name" :value="c3.id" />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
  export default {
    name: "AttrSelectOptions",
    props: ["isShowList"],
    data() {
      return {
        selectForm: {
          category1Id: "",
          category2Id: "",
          category3Id: ""
        },
        Category1: [],
        Category2: [],
        Category3: []
      }
    },
    mounted() {
      this.getBaseCategoryList();
    },
    methods: {
      getBaseCategoryList() {
        this.$emit("clearAttrList");
        new Promise((resolve, reject) => {
          this.$http.category.getCategory1().then(res => {
            if (res.code === 200) {
              this.Category1 = res.data;
              resolve()
            } else {
              reject()
            }
          }).catch(err => {
            reject(err)
          })
        })
      },
      getCategory2(category1Id) {
        this.$emit("clearAttrList");
        new Promise((resolve, reject) => {
          this.$http.category.getCategory2(category1Id).then(res => {
            if (res.code === 200) {
              this.selectForm.category2Id = "";
              this.selectForm.category3Id = "";
              this.Category2 = [];
              this.Category3 = [];
              this.Category2 = res.data;
              resolve()
            } else {
              reject();
            }
          }).catch(err => {
            reject(err);
          })
        })
      },
      getCategory3(category2Id) {
        this.$emit("clearAttrList");
        new Promise((resolve, reject) => {
          this.$http.category.getCategory3(category2Id).then(res => {
            if (res.code === 200) {
              this.selectForm.category3Id = "";
              this.Category3 = [];
              this.Category3 = res.data;
              resolve()
            } else {
              reject();
            }
          }).catch(err => {
            reject(err);
          })
        })
      },
      getAttrInfoList() {
        this.$bus.$emit("getAttrInfoList", this.selectForm)
      }
    }
  }

</script>

<style lang="sass" scoped>

</style>
