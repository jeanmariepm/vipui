import http from "./httpService";
import { veedUrl } from "../config.json";
import auth from './authService'

const apiEndpoint = veedUrl + "/auth/users/";

export function register(user) {
  return http.post(apiEndpoint, {
    email: user.username,
    password: user.password,
    username: user.name
  });
}
