import {LOCAL_HOST} from './types';

export const loginUser = phoneNumber => {
  const msg = JSON.stringify({PhoneNumber: phoneNumber});
  return fetch(`${LOCAL_HOST}/Login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: msg,
  }).then(response => response.json());
};

export const loginVerification = (phoneNumber, code) => {
  const msg = JSON.stringify({
    PhoneNumber: phoneNumber,
    Password: code,
  });
  return fetch(`${LOCAL_HOST}/LoginValidation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: msg,
  }).then(response => response.json());
};

export const getMissionList = (id, token) => {
  return fetch(`${LOCAL_HOST}/MissionList?id=${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `bearer ${token}`,
    },
  }).then(response => response.json());
};

export const NewMissionStart = (token, startLocation, serviceManId) => {
  const msg = JSON.stringify({
    ServiceManId: serviceManId,
    StartLocation: startLocation,
  });
  return fetch(`${LOCAL_HOST}/MissionStart`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `bearer ${token}`,
    },
    body: msg,
  }).then(response => response.json());
};

export const MissionFinish = (
  token,
  missionId,
  endLocation,
  serviceManId,
  startCity,
  endCity,
  description,
  distance,
) => {
  const msg = JSON.stringify({
    ServiceManId: serviceManId,
    ID: missionId,
    StartCity: startCity,
    EndCity: endCity,
    Description: description,
    EndLocation: endLocation,
    Distance: distance,
  });
  return fetch(`${LOCAL_HOST}/MissionFinish?id`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `bearer ${token}`,
    },
    body: msg,
  }).then(response => response.json());
};
