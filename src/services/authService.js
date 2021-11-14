import jwtDecode from "jwt-decode";
import { toast } from "react-toastify";
import http from "./httpService";

const apiEndpoint = http.veedUrl + "auth/";
const veedKey = "veed";

export async function login(username, password) {
  console.log('logging in:', apiEndpoint, username)
  const { data: jwt } = await http.post(apiEndpoint + 'jwt/create/', { username, password });

  localStorage.setItem(veedKey,
    JSON.stringify({
      'access': jwt.access,
      'refresh': jwt.refresh,
      'username': username
    }));
  console.log('logged in. currentUser is:', getCurrentUser())

  return
}

async function loginWithJwt(username, refresh) {
  console.log('logging in with jwt:', apiEndpoint, username)
  const { data: jwt } = await http.post(apiEndpoint + 'jwt/refresh/', { refresh });
  localStorage.setItem(veedKey,
    JSON.stringify({
      'access': jwt.access,
      'refresh': jwt.refresh,
      'username': username
    }));

}

export function logout() {
  localStorage.removeItem(veedKey);
}

export function getCurrentUserId() {
  const { access } = JSON.parse(localStorage.getItem(veedKey));
  return jwtDecode(access).user_id;
}
export function getCurrentUser() {
  try {
    const { access, refresh, username } = JSON.parse(localStorage.getItem(veedKey));
    if (access && Date.now() < 1000 * jwtDecode(access).exp) {
      return username;
    } else if (refresh && Date.now() < 1000 * jwtDecode(refresh).exp) {
      loginWithJwt(username, refresh)
    } else {
      logout()
    }
    return null;
  } catch (ex) {
    return null;
  }
}

export function getAccessKey() {
  const { access } = JSON.parse(localStorage.getItem(veedKey));
  if (access && Date.now() < 1000 * jwtDecode(access).exp) {
    return access;

  } else if (refresh && Date.now() < 1000 * jwtDecode(refresh).exp) {
    loginWithJwt(username, refresh)
    return JSON.parse(localStorage.getItem(veedKey));
  } else
    return null;
}

export default {
  login,
  loginWithJwt,
  logout,
  getCurrentUser,
  getCurrentUserId,
  getAccessKey
};
