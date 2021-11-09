import http from "./httpService";
import auth from './authService'

const apiEndpoint = http.veedUrl + "auth/users/";

export function register(user) {
  return http.post(apiEndpoint, {
    email: user.username,
    password: user.password,
    username: user.name
  });
}

export default {
  register
}
