import request from "../../utils/request";
export default {
  // DELETE /admin/product/baseTrademark/remove/{id}
  // 删除BaseTrademark
  deleteBaseTrademark: id =>
    request({
      url: `/admin/product/baseTrademark/remove/${id}`,
      method: "delete"
    }),

  addOrUpdateTrademark(Trademark) {
    if (Trademark.id) {
      // PUT /admin/product/baseTrademark/update
      // 修改BaseTrademark
      return request({
        url: "/admin/product/baseTrademark/update",
        method: "put",
        data: Trademark
      });
    } else {
      // POST /admin/product/baseTrademark/save
      // 新增BaseTrademark
      return request({
        url: "/admin/product/baseTrademark/save",
        method: "post",
        data: Trademark
      });
    }
  },

  // GET /admin/product/baseTrademark/{page}/{limit}
  // 分页列表
  getBaseTrademark: (page, limit) =>
    request(`/admin/product/baseTrademark/${page}/${limit}`),

  // GET /admin/product/baseTrademark/getTrademarkList
  getTrademarkList: () =>
    request("/admin/product/baseTrademark/getTrademarkList")
};
