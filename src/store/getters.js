const getters = {
  // 获取公共的内容并且添加为getters
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name
};
export default getters;
