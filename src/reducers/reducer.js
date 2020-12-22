import {
  LOGIN,
  LOGOUT,
  GET_SERVICE_DETAIL,
  RESTORE_SERVICE_DATA,
  SET_EDITING_SERVICE,
  GET_OBJECTS_LIST,
  SET_USER_LIST,
} from '../actions/types';

const INITIAL_STATE = {
  token: '',
  userId: '',
  constantUserId: '',
  constantToken: '',
  unfinishedMissionId: null,
  selectedService: null,
  objectsList: [],
  savedServiceInfo: {
    projectId: '',
    factorReceivedPrice: 0,
    factorTotalPrice: 0,
    toCompanySettlement: 0,
    factorImage: 0,
    billImage: '',
    image: '',
    serviceDescription: '',
    address: '',
    serviceImage: '',
    finalDate: '',
    serviceResult: '',
    serviceType: '',
    objectList: [],
    startLatitude: '',
    startLongitude: '',
    endLatitude: '',
    endLongitude: '',
    startCity: '',
    endCity: '',
    missionDescription: '',
    missionId: '',
    distance: '',
    saveType: '',
    travel: false,
  },
  editingService: '',
  forceUpdate: false,
  userList: [],
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case LOGIN:
      return {
        ...state,
        constantToken: action.constantToken,
        token: action.token,
        userId: action.userId,
        constantUserId: action.constantUserId,
      };
    case GET_SERVICE_DETAIL:
      return {...state, selectedService: action.selectedService};
    case LOGOUT:
      return {
        ...state,
        token: '',
        userId: '',
        constantUserId: '',
        constantToken: '',
        userList: [],
        unfinishedMissionId: null,
        selectedService: null,
        objectsList: [],
        objectsList: [],
        savedServiceInfo: {
          projectId: '',
          factorReceivedPrice: 0,
          factorTotalPrice: 0,
          toCompanySettlement: 0,
          factorImage: 0,
          billImage: '',
          image: '',
          serviceDescription: '',
          address: '',
          serviceImage: '',
          finalDate: '',
          serviceResult: '',
          serviceType: '',
          objectList: [],
          startLatitude: '',
          startLongitude: '',
          endLatitude: '',
          endLongitude: '',
          startCity: '',
          endCity: '',
          missionDescription: '',
          missionId: '',
          distance: '',
          saveType: '',
          travel: false,
        },
        editingService: '',
        forceUpdate: false,
        userList: [],
      };
    case RESTORE_SERVICE_DATA:
      return {
        ...state,
        savedServiceInfo: {
          projectId: action.savedServiceInfo.projectId,
          factorReceivedPrice: action.savedServiceInfo.factorReceivedPrice,
          factorTotalPrice: action.savedServiceInfo.factorTotalPrice,
          toCompanySettlement: action.savedServiceInfo.toCompanySettlement,
          serviceDescription: action.savedServiceInfo.serviceDescription,
          address: action.savedServiceInfo.address,
          finalDate: action.savedServiceInfo.finalDate,
          serviceResult: action.savedServiceInfo.serviceResult,
          serviceType: action.savedServiceInfo.serviceType,
          objectList: action.savedServiceInfo.objectList,
          startLatitude: action.savedServiceInfo.startLatitude,
          startLongitude: action.savedServiceInfo.startLongitude,
          endLatitude: action.savedServiceInfo.endLatitude,
          endLongitude: action.savedServiceInfo.endLongitude,
          startCity: action.savedServiceInfo.startCity,
          endCity: action.savedServiceInfo.endCity,
          missionDescription: action.savedServiceInfo.missionDescription,
          missionId: action.savedServiceInfo.missionId,
          distance: action.savedServiceInfo.distance,
          saveType: action.savedServiceInfo.saveType,
          travel: action.savedServiceInfo.travel,
        },
      };
    case SET_EDITING_SERVICE:
      return {...state, editingService: action.editingService};
    case GET_OBJECTS_LIST:
      return {...state, objectsList: action.objectsList};
    case SET_USER_LIST:
      return {...state, userList: action.userList};
    default:
      return state;
  }
};
