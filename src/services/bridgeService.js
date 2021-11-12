import http from "./httpService";
import auth, { getCurrentUserId } from './authService';

import authService from "./authService";
const apiEndpoint = http.veedUrl + "games/";

export function saveDeal(hands, auction) {
  //const access = auth.getAccessKey();
  createPlayer();
  const player = getCurrentUserId();
  console.log('Saving deal:', player);
  return http.post(apiEndpoint + 'deals/',
    { hands, auction, player },
    //{ headers: { Authorization: "JWT " + access }, }
  );
}

export async function getDeals(callback) {
  try {
    //const access = auth.getAccessKey();

    const { data: result } = await http.get(
      apiEndpoint + 'deals/',
      {},
      //{ headers: { Authorization: "JWT " + access }, }
    );
    console.log('getDeals before callnack:', result)

    callback(result);
  } catch (ex) {
  }
}
export async function deleteDeal(deal) {
  console.log('deleeDeal TBD')
  try {
    //const access = auth.getAccessKey();

    const { data: result } = await http.get(
      apiEndpoint + 'deals/',
      {},
      //{ headers: { Authorization: "JWT " + access }, }
    );
  } catch (ex) {
  }
}
export async function createPlayer() {
  try {
    // const access = auth.getAccessKey();
    const user_id = getCurrentUserId();
    const { data: result } = await http.post(
      apiEndpoint + 'players/',
      { "user": user_id },
      //{ headers: { Authorization: "JWT " + access }, }
    );
  } catch (ex) {
  }
}

export async function getPlayers(callback) {
  //const access = auth.getAccessKey()

  const { data: result } = await http.get(
    apiEndpoint + 'players/', {},
    //{ headers: { Authorization: "JWT " + access }, }
  );
  console.log('allPlayers before callnack:', result)
  callback(result);
}


export default {
  saveDeal, getDeals, deleteDeal, createPlayer, getPlayers
}
