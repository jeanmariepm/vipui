import jwtDecode from "jwt-decode";
import http from "./httpService";

const apiEndpoint = http.veedUrl + "auth/";
const veedKey = "veed";

export async function login(username, password) {
  console.log('logging in:', apiEndpoint, username)
  const { data: jwt } = await http.post(apiEndpoint + 'jwt/create/', { username, password });
  localStorage.setItem(veedKey,
    JSON.stringify({
      'access': jwt.access,
      'username': username
    }));
}

export function loginWithJwt(jwt) {
  //localStorage.setItem(tokenKey, jwt);
}

export function logout() {
  localStorage.removeItem(veedKey);
}

export function getCurrentUserId() {
  const { access } = JSON.parse(localStorage.getItem(veedKey));
  console.log(jwtDecode(access));
  return jwtDecode(access).user_id;
}
export function getCurrentUser() {
  try {
    const { access, username } = JSON.parse(localStorage.getItem(veedKey));
    console.log(access, username)
    if (access && Date.now() < 1000 * jwtDecode(access).exp) {
      return username;
    }
    return null;
  } catch (ex) {
    return null;
  }
}

/* export function getAccessKey() {
  const { access } = JSON.parse(localStorage.getItem(veedKey));
  if (access && Date.now() < 1000 * jwtDecode(access).exp) {
    return access;
  }
  return null;
}
 */
export default {
  login,
  loginWithJwt,
  logout,
  getCurrentUser,
  getCurrentUserId,
  //getAccessKey
};
