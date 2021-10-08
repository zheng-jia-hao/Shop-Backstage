import request from "../../utils/request";
export default {
  // POST /admin/product/saveAttrInfo
  // saveAttrInfo  既能添加也能修改
  addOrUpdate(data) {
    return request({
      url: "/admin/product/saveAttrInfo",
      method: "post",
      data
    });
  },
  // DELETE /admin/product/deleteAttr/{attrId}
  // deleteAttr
  deleteAttr(attrId) {
    return request.delete(`/admin/product/deleteAttr/${attrId}`);
  },
  // GET /admin/product/attrInfoList/{category1Id}/{category2Id}/{category3Id}
  // attrInfoList
  getAttrInfoList(category1Id, category2Id, category3Id) {
    return request(
      `/admin/product/attrInfoList/${category1Id}/${category2Id}/${category3Id}`
    );
  },

  // GET /admin/product/getAttrValueList/{attrId}
  // getAttrValueList
  getAttrValueList(attrId) {
    return request(`/admin/product/getAttrValueList/${attrId}`);
  }
};
