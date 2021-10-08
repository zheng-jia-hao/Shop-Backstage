<template>
  <div>
    <el-form :model="skuForm">
      <el-form-item label="SPU名称" label-width="100px">{{ spu.spuName }}</el-form-item>
      <el-form-item label="SKU名称" label-width="100px">
        <el-input v-model="skuForm.skuName" placeholder="SKU名称" />
      </el-form-item>
      <el-form-item label="价格(元)" label-width="100px">
        <el-input v-model="skuForm.price" type="number" />
      </el-form-item>
      <el-form-item label="重量" label-width="100px">
        <el-input v-model="skuForm.weight" type="number" />
      </el-form-item>
      <el-form-item label="规格描述" label-width="100px">
        <el-input v-model="skuForm.skuDesc" type="textarea" rows="4" placeholder="SKU 规格描述" />
      </el-form-item>
      <el-form-item label="平台属性:" label-width="100px">
        <el-form v-if="attrList && attrList.length >0" :inline="true" label-width="80px">
          <el-form-item v-for="(attr,index) in attrList" :key="index" :label="attr.attrName">
            <!-- 收集平台属性的思路：
                                如果使用一个数组去接收v-model的值是不行的，因为v-model后值会被覆盖，
                                所以把他挂载到Attr身上，等最后遍历的时候进行处理
             -->
            <el-select v-model="attr.attrIdAndValueId" placeholder="请选择">
              <!-- v-for="item in options" :key="item.value" -->
              <el-option v-for="(value,vindex) in attr.attrValueList" :key="vindex" :label="value.valueName"
                :value="`${attr.id}:${value.attrId}`" />
            </el-select>
          </el-form-item>
        </el-form>
      </el-form-item>
      <!--

        Duplicate keys detected: '2102'. This may cause an update error
        v-for遍历渲染时出现这个错误是因为 :key=“xxx" 有重复的值导致的
       -->
      <el-form-item label="销售属性:" label-width="100px">
        <el-form v-if="spuSaleAttrList && spuSaleAttrList.length >0" :inline="true" label-width="80px">
          <el-form-item v-for="(saleAttr,index) in spuSaleAttrList" :key="index" :label="saleAttr.saleAttrName">
            <!-- v-model="value" -->
            <el-select v-model="saleAttr.saleAttrIdandValueId" placeholder="请选择">
              <!-- v-for="item in options" :key="item.value" attrValueList -->
              <el-option v-for="(value,vindex) in saleAttr.spuSaleAttrValueList" :key="vindex"
                :label="value.saleAttrValueName" :value="`${saleAttr.id}:${value.spuId}`" />
            </el-select>
          </el-form-item>
        </el-form>
      </el-form-item>
      <el-form-item label="图片列表" label-width="100px">
        <el-table ref="multipleTable" :data="spuImageList" border tooltip-effect="dark" style="margin:20px 0"
          @selection-change="handleSelectionChange">
          <!-- @selection-change="handleSelectionChange" -->
          <el-table-column type="selection" width="55" />
          <el-table-column label="图片">
            <template slot-scope="{row}">
              <img :src="row.imgUrl" alt="" style="height:100px;width:100px">
            </template>
          </el-table-column>
          <el-table-column prop="imgName" label="名称" />
          <el-table-column prop="" label="操作">
            <template slot-scope="{row}">
              <el-button v-if="row.isDefault === '0'" type="primary" size="mini" @click="setDefault(row)">设为默认
              </el-button>
              <el-tag v-else type="success">默认</el-tag>
            </template>
          </el-table-column>
        </el-table>

      </el-form-item>
      <el-form-item label-width="100px">
        <el-button type="primary" style="margin:0" @click="saveSku">保存</el-button>
        <el-button @click="$emit('update:visible',false)">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  export default {
    name: "SkuForm",
    data() {
      return {
        // spuId: 0,
        skuForm: {
          category3Id: 0,
          price: "",
          tmId: 0,
          weight: '',
          skuDefaultImg: '',
          skuName: '',
          skuDesc: '',
          skuAttrValueList: [
            //   {
            //   attrId: 0,
            //   attrName: '',
            //   id: 0,
            //   skuId: 0,
            //   valueId: 0,
            //   valueName: ''
            // }
          ],
          skuImageList: [
            //   {
            //   id: 0,
            //   imgName: '',
            //   imgUrl: '',
            //   isDefault: '',
            //   skuId: 0,
            //   spuImgId: 0
            // }
          ],
          skuSaleAttrValueList: [
            //   {
            //   id: 0,
            //   saleAttrId: 0,
            //   saleAttrName: '',
            //   saleAttrValueId: 0,
            //   saleAttrValueName: '',
            //   skuId: 0,
            //   spuId: 0
            // }
          ]

        },
        spu: {},
        attrList: [],
        spuSaleAttrList: [],
        spuImageList: [],
        checkedImageList: []
      }
    },
    methods: {
      initSkuFormData(row, ids) {
        this.spu = row;
        const {
          category1Id,
          category2Id,
          category3Id
        } = ids;

        // getAttrInfoList ids attr
        // getSpuSaleAttrList spuid sku
        // getSpuImageList spuid sku
        const getAttrInfoList = this.$http.attr.getAttrInfoList(category1Id, category2Id, category3Id)
        const getSpuSaleAttrList = this.$http.sku.getSpuSaleAttrList(row.id);
        const getSpuImageList = this.$http.sku.getSpuImageList(row.id);
        Promise.all([getAttrInfoList, getSpuSaleAttrList, getSpuImageList]).then(res => {
          this.attrList = res[0].data;
          this.spuSaleAttrList = res[1].data;
          const spuImageList = res[2].data;
          spuImageList.forEach(item => {
            item.isDefault = '0';
          });
          this.spuImageList = spuImageList
        })
      },
      handleSelectionChange(val) {
        this.checkedImageList = val;
      },
      setDefault(row) {
        this.spuImageList.forEach(item => item.isDefault = '0');
        row.isDefault = '1';
        this.skuForm.skuDefaultImg = row.imgUrl;
      },
      saveSku() {
        const {
          skuForm,
          spu,
          attrList,
          spuSaleAttrList,
          checkedImageList
        } = this;

        skuForm.category3Id = spu.category3Id;
        skuForm.tmId = spu.tmId;
        skuForm.spuId = spu.id;

        // 图片整理
        skuForm.skuImageList = checkedImageList.map(item => {
          const {
            imgName,
            imgUrl,
            isDefault,
            id
          } = item;
          return ({
            imgName,
            imgUrl,
            isDefault,
            spuImgId: id
          })
        })
        // 销售属性
        skuForm.skuAttrValueList = attrList.reduce((pre, item) => {
          if (item.attrIdAndValueId) {
            const [
              attrId,
              valueId
            ] = item.attrIdAndValueId.split(":");
            pre.push({
              attrId,
              valueId
            })
          }
          return pre;
        }, [])
        // 平台属性
        skuForm.skuSaleAttrValueList = spuSaleAttrList.reduce((pre, item) => {
          if (item.saleAttrIdandValueId) {
            const [
              saleAttrId,
              saleAttrValueId
            ] = item.saleAttrIdandValueId.split(":");
            pre.push({
              saleAttrId,
              saleAttrValueId
            })
          }
          return pre;
        }, [])

        console.log(skuForm);

        new Promise((resolve, reject) => {
          this.$http.sku.addUpdate(skuForm).then(res => {
            if (res.code === 200) {
              this.$message.success("添加成功");
              this.$emit('update:visible', false);
              resolve();
            } else {
              reject(res.message);
            }
          }).catch(err => {
            reject(err);
          })
        })
      },
      reSetData() {
        this.skuForm = {
          category3Id: 0,
          price: "",
          tmId: 0,
          weight: '',
          skuDefaultImg: '',
          skuName: '',
          skuDesc: '',
          skuAttrValueList: [

          ],
          skuImageList: [

          ],
          skuSaleAttrValueList: [

          ]
        }
      }
    }
  }

</script>

<style lang=sass scoped>

</style>
