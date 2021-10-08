<template>
  <div>
    <AttrSelectOptions :is-show-list="isShowList" @clearAttrList="attrList = []" />
    <el-card v-show="isShowList" style="margin-top:20px">
      <el-button type="primary" icon="el-icon-plus" :disabled="!attrList.length" @click="AddAttr">添加属性
      </el-button>
      <el-table :data="attrList" border style="width: 100%;margin:20px 0">
        <el-table-column type="index" align="center" prop="index" label="序号" width="80" />
        <el-table-column align="center" prop="attrName" label="属性名称" width="300" />
        <el-table-column label="属性值列表">
          <template slot-scope="{row}" align="center">
            <el-tag v-for="attrValue in row.attrValueList" :key="attrValue.id" style="margin-right:5px" type="info"
              effect="plain">
              {{ attrValue.valueName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="date" label="操作" width="300">
          <template slot-scope="{row,$index}">
            <HintButton style="margin-right:10px" type="warning" icon="el-icon-edit" size="mini" title="编辑"
              @click="editAttr(row)">编辑
            </HintButton>
            <el-popconfirm title="确定删除吗？" @onConfirm="deleteAttr(row.id)">
              <HintButton slot="reference" type="danger" icon="el-icon-delete" size="mini" title="删除">删除
              </HintButton>
            </el-popconfirm>
            <!--  -->
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <!-- <el-pagination v-if="trademarkInfo.current" style="text-align:center" :current-page="trademarkInfo.current"
        :page-sizes="[limit,5, 10]" :page-size="trademarkInfo.size" layout="prev, pager, next, jumper,->,total, sizes"
        :total="trademarkInfo.total" @size-change="handleSizeChange" @current-change="handleCurrentChange" /> -->
    </el-card>
    <!-- 添加或修改 -->
    <el-card v-show="!isShowList" style="margin-top:20px">
      <el-form :model="attrFrom" :inline="true">
        <el-form-item label="属性名">
          <el-input v-model="attrFrom.attrName" placeholder="请输入属性名称" />
        </el-form-item>
      </el-form>
      <el-button type="primary" icon="el-icon-plus" :disabled="!attrFrom.attrName" @click="addattrValueItem">添加属性值
      </el-button>
      <el-button>取消</el-button>
      <el-table :data="attrFrom.attrValueList" border style="width: 100%;margin:20px 0">
        <el-table-column type="index" align="center" prop="index" label="序号" width="80" />
        <el-table-column align="center" label="属性名称">
          <template slot-scope="{row,$index}">
            <!-- 这里能直接拿到valueName的原因是因为 attrFrom.attrValueList 就是遍历每一个对象，所以能拿到每个对象中的valueName-->
            <el-input v-if="row.edit" :ref="$index" v-model="row.valueName" size="mini" placeholder="请输入属性值"
              @change="checkRepeat(row)" @blur="row.valueName !==''&&(row.edit=false) " />
            <a v-else href="javascript:;" style="display: block;width:100%;height:100%;"
              @dblclick="ShowInputEdit(row,$index)">{{ row.valueName }}</a>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="{row,$index}" align="center">
            <el-popconfirm title="确定删除吗？" @onConfirm="deleteAttrValue($index)">
              <HintButton slot="reference" type="danger" icon="el-icon-delete" size="mini" title="删除" />
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      <el-button type="primary" :disabled="attrFrom.attrValueList &&attrFrom.attrValueList.length === 0"
        @click="saveNewAttr">保存
      </el-button>
      <el-button @click="isShowList = true">取消</el-button>
    </el-card>
  </div>
</template>

<script>
  import cloneDeep from "lodash/cloneDeep"
  export default {
    name: "Attr",
    data() {
      return {
        IDs: {},
        attrList: [],
        isShowList: true,
        attrFrom: {}
      }
    },

    mounted() {
      this.$bus.$on("getAttrInfoList", this.getAttrInfoList)
    },
    beforeDestroy() {
      this.$bus.$off()
    },
    methods: {
      getAttrInfoList(IDs) {
        this.IDs = IDs
        console.log(this.IDs);
        const {
          category1Id,
          category2Id,
          category3Id
        } = this.IDs;
        this.attrFrom = {
          attrName: "",
          attrValueList: [],
          categoryId: category3Id,
          categoryLevel: 3
        }
        new Promise((resolve, reject) => {
          this.$http.attr.getAttrInfoList(category1Id, category2Id, category3Id).then(res => {
            if (res.code === 200) {
              this.attrList = res.data
              resolve()
            } else {
              reject()
            }
          }).catch(err => {
            reject(err)
          })
        })
      },
      AddAttr() {
        this.attrFrom.attrName = ''
        this.attrFrom.attrValueList = []
        this.isShowList = false;
      },
      checkRepeat(row) {
        if (row.valueName.trim() === '') {
          this.$message.info("内容不能為空");
          return;
        }

        const isRepeat = this.attrFrom.attrValueList.some(item => item !== row && item.valueName === row.valueName);

        if (isRepeat) {
          this.$message.info("内容不能重複");
          row.valueName = '';
          return;
        }
        row.edit = false
      },

      addattrValueItem() {
        /**
         * 思路：
         *      1. 首先在用户没有输入属性名的时候不能点击添加属性值的按钮 既attrName不能为空
         *      2. 当有值时，用户点击按钮时会为他创建一个空的对象进行渲染，
         *         因为table内的数据是依赖attrValueList进行渲染的所以需要向这个数组添内添加一个元素进行占位
         *      3. 当添加完对象后会渲染一个el-input标签并且v-model绑定内容，当用户离开这个表单时将el-input进行v-if的切换
         */
        this.attrFrom.attrValueList.push({
          attrId: this.attrFrom.id, // 这时候没有这个id很正常，所有的id都是后台进行添加的，这里的id是为了修改的操作进行的准备
          valueName: "",
          edit: true
        });
        this.$nextTick(() => {
          this.$refs[this.attrFrom.attrValueList.length - 1].focus();
        })
      },
      editAttr(attr) {
        this.isShowList = false;
        // 注意：这样的拷贝是浅拷贝，浅拷贝只会拷贝基础属性的值，
        // 但是如果里面有数组或者对象存在时它只拷贝地址值不会拷贝整个数组或对象
        // this.attrFrom = { ...attr };
        this.attrFrom = cloneDeep(attr);
        this.attrFrom.attrValueList.forEach(item => {
          // item.edit = false
          // 這裏不能這麽寫，因爲儅數據一渲染的那一刻時，後續添加的數據都將不是相應式的數據
          // 只有在數據初始化的階段生成的數據才是響應式數據
          // 添加是添加上了，但是進行修改時，頁面並不會進行變化   解決方法就是將它變成響應式的數據  $set
          this.$set(item, "edit", false);
        })
      },
      ShowInputEdit(row, index) {
        row.edit = true;

        // 這裏必須要使用$nextTick，因爲使用的是v-if 儅雙擊時才剛創建，input才剛創建ref還沒挂在上所以this.$refs[index]會為undefind
        this.$nextTick(() => {
          this.$refs[index].focus();
        })
      },
      deleteAttrValue(index) {
        this.attrFrom.attrValueList.splice(index, 1);
      },
      deleteAttr(id) {
        new Promise((resolve, reject) => {
          this.$http.attr.deleteAttr(id).then(res => {
            if (res.code === 200) {
              this.getAttrInfoList(this.IDs)
              this.$message.success("刪除成功");
              resolve();
            } else {
              reject(res.message)
            }
          }).catch(err => {
            reject(err)
          })
        })
      },
      async saveNewAttr() {
        // 解決一上來就保存的和沒有名稱的
        if (this.attrFrom.attrValueList.length === 0 || this.attrFrom.attrName === '') {
          this.$message.info("名称或属性值为空时不能添加！");
          return;
        }
        const result = this.attrFrom.attrValueList.reduce((pre, item) => {
          if (item.valueName !== '') {
            delete item.edit
            pre.push(item);
            return pre
          }
        }, []);
        this.attrFrom.attrValueList = result;
        const res = await this.$http.attr.addOrUpdate(this.attrFrom)
        if (res.code === 200) {
          this.$message.success("保持成功!");
          await this.getAttrInfoList(this.IDs)
          this.isShowList = true;
        } else {
          this.$message.error("添加失敗");
        }
      }
    }
  }

</script>
