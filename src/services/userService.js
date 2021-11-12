import http from "./httpService";
import auth from './authService'

const apiEndpoint = http.veedUrl + "auth/users/";

export function register(email, password, username) {
  return http.post(apiEndpoint, {
    email, password, username
  });
}

export default {
  register
}
