import Cookies from "js-cookie"; // 能使cookies变成像本地存储那样简单使用

const TokenKey = "vue_admin_template_token";

export function getToken() {
  return Cookies.get(TokenKey);
}

export function setToken(token) {
  return Cookies.set(TokenKey, token);
}

export function removeToken() {
  return Cookies.remove(TokenKey);
}
