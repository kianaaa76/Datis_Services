import {LOCAL_HOST} from './types';

export const loginUser = (phoneNumber) => {
  const msg = JSON.stringify({PhoneNumber: phoneNumber});
  return fetch(`${LOCAL_HOST}/Login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: msg,
  }).then((response) => response.json());
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
  }).then((response) => response.json());
};

export const getMissionList = (id, token) => {
  return fetch(`${LOCAL_HOST}/MissionList?id=${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `bearer ${token}`,
    },
  }).then((response) => response.json());
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
  }).then((response) => response.json());
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
  }).then((response) => response.json());
};

export const getMyServicesList = (id, token) => {
  return fetch(`${LOCAL_HOST}/GetAllMyDocuments?ServiceManId=${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `bearer ${token}`,
    },
  }).then((response) => response.json());
};

export const getServiceDetails = (serviceId , token) => {
  return fetch(`${LOCAL_HOST}/GetDocumentText?id=${serviceId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `bearer ${token}`,
    },
  }).then((response) => response.json());
}

export const getObjects = (token) => {
  return fetch(`${LOCAL_HOST}/GetObjects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `bearer ${token}`,
    },
  }).then((response) => response.json());
}

export const getObjBySerial = (token, serialCode, objectId) => {
  const msg = JSON.stringify({
    Serial: serialCode,
    Object_Id: objectId
  });
  return fetch(`${LOCAL_HOST}/GetObjectVersionBySerial`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `bearer ${token}`,
    },
    body: msg,
  }).then((response) => response.json());
}

export const submitNewService = (token, servicemanId , name, phone, address, serial) =>{
  const msg = JSON.stringify({
    name:name,
    cell:phone,
    Serial:serial,
    ServiceMan:servicemanId,
    Address:address,
    Details:"A"
  });
  return fetch(`${LOCAL_HOST}/NewServiceDocument`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `bearer ${token}`,
    },
    body: msg,
  }).then((response) => response.json());
}

export const rejectedServiceList = (id, token)=>{
  return fetch(`${LOCAL_HOST}/GetRejectServiceList?ServiceManId=${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `bearer ${token}`,
    },
  }).then((response) => response.json());
}

export const rejectedServiceDetail = (serviceId, token) => {
  return fetch(`${LOCAL_HOST}/GetRejectServiceInfo?id=${serviceId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `bearer ${token}`,
    },
  }).then((response) => response.json());
}

export const unsettledServiceList = (servicemanId, token) => {
  return fetch(`${LOCAL_HOST}/GetAllSettlementDocuments?ServiceManId=${servicemanId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `bearer ${token}`,
    },
  }).then((response) => response.json());
}

export const unsettledServiceDetail = (serviceId, token) => {
  return fetch(`${LOCAL_HOST}/GetDocumentDoneDetails?id=${serviceId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `bearer ${token}`,
    },
  }).then((response) => response.json());
}

export const personalPayment = (serviceId, token) => {
  return fetch(`${LOCAL_HOST}/FullPayment?id=${serviceId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `bearer ${token}`,
    },
  }).then((response) => response.json());
}

export const companyPayment = (serviceId, servicemanId, image, token) => {
  const msg = JSON.stringify({
    ID:serviceId,
    ServiceManId: servicemanId,
    PaymentImage: image
  });
  return fetch(`${LOCAL_HOST}/FullPaymentCompany`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `bearer ${token}`,
    },
    body: msg
  }).then((response) => response.json());
}

export const serviceArchiveListWithSerial = (servicemanId, token, serial)=>{
  const msg = JSON.stringify({
    ServiceManId: servicemanId,
    Serial: serial
  });
  return fetch(`${LOCAL_HOST}/GetDoneService`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `bearer ${token}`,
    },
    body: msg
  }).then((response) => response.json());
}

export const serviceArchiveListWithoutSerial = (servicemanId, token)=>{
  const msg = JSON.stringify({
    ServiceManId: servicemanId,
  });
  return fetch(`${LOCAL_HOST}/GetDoneService`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `bearer ${token}`,
    },
    body: msg
  }).then((response) => response.json());
}

export const updateService = (serviceId, servicemanId, token, address, description, factorImage, image)=>{
  const msg = JSON.stringify({
    ServiceManId: servicemanId,
    projectID: serviceId,
    Image: image,
    FactorImage: factorImage,
    Location: address,
    Details:"a"
  });
  return fetch(`${LOCAL_HOST}/UpdateServiceDocument`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `bearer ${token}`,
    },
    body: msg
  }).then((response) => response.json());
}

export const sendServiceData = (
    token,
    serviceId,
    serviceResult,
    serviceType,
    receivedAmount,
    invoiceAmount,
    location,
    serviceDetail,
    image,
    factorImage,
    objectList,
    doneTime,
    reconfirm,
    mission,
    serviceManId,
    billImage,
)=>{
  const msg = JSON.stringify({
    ServiceManId: serviceManId,
    projectID: serviceId,
    Image: image,
    FactorImage: factorImage,
    Location: location,
    RecivedAmount: receivedAmount,
    InvoiceAmount: invoiceAmount,
    ObjectList: objectList,
    DoneTime: doneTime,
    Reconfirm: reconfirm,
    Details: serviceDetail,
    Result: serviceResult,
    ServiceType: serviceType,
    BillImage: billImage,
    Mission: mission
  });
  return fetch(`${LOCAL_HOST}/ServiceDocumentResult`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `bearer ${token}`,
    },
    body: msg
  }).then((response) => response.json());
}

export const getUsers = ()=>{
  return fetch(`${LOCAL_HOST}/GetAllUser`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((response) => response.json());
}

export const call = (token)=>{
  return fetch(`${LOCAL_HOST}/CallWithMe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `bearer ${token}`,
    },
  }).then((response) => response.json());
}

export const checkUpdate = (version) => {
  return fetch(`${LOCAL_HOST}/GetVersion?versionName=${version}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((response) => response.json());
}

