import http from "./httpService";
import auth, { getCurrentUserId } from './authService';

import authService from "./authService";
const apiEndpoint = http.veedUrl + "games/";

export function saveDeal(hands, auction) {
  const access = auth.getAccessKey();
  return http.post(apiEndpoint + 'deals/',
    { hands, auction },
    { headers: { Authorization: "JWT " + access }, }
  );
}

export async function getDeals(callback) {
  try {
    const access = auth.getAccessKey();

    const { data: result } = await http.get(
      apiEndpoint + 'deals/',
      { headers: { Authorization: "JWT " + access }, }
    );
    console.log('getDeals before callnack:', result)

    callback(result);
  } catch (ex) {
  }
}
export async function deleteDeal(deal_id) {
  console.log('deleeDeal TBD')
  try {
    const access = auth.getAccessKey();

    const { data: result } = await http.get(
      apiEndpoint + 'deals/',
      { id: deal_id },
      { headers: { Authorization: "JWT " + access }, }
    );
  } catch (ex) {
  }
}


export async function getPlayers(callback) {
  const access = auth.getAccessKey();
  console.log('getPlayers :', access)

  const { data: result } = await http.get(
    apiEndpoint + 'players/',
    { headers: { Authorization: "JWT " + access }, }
  );
  console.log('allPlayers before callnack:', result)
  callback(result);
}


export default {
  saveDeal, getDeals, deleteDeal, getPlayers
}
