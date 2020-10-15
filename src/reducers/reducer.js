import {
  LOGIN,
  LOGIN_VERIFICATION,
  LOGOUT,
  GET_MY_SERVICES_LIST,
  GET_SERVICE_DETAIL,
  RESTORE_SERVICE_DATA,
} from '../actions/types';

const INITIAL_STATE = {
  token: '',
  authError: '',
  userId: '',
  unfinishedMissionId: null,
  selectedService:null,
  selectServiceError:"",
  savedServiceInfo:{
    projectId:"",
    factorReceivedPrice: 0 ,
    factorTotalPrice:"",
    factorImage:0,
    billImage:"",
    serviceDescription:"",
    address:"",
    serviceImage:"",
    date:"",
    serviceResult:"",
    serviceType:"",
    objectList:[],
    startLatitude: "",
    startLongitude: "",
    endLatitude: "",
    endLongitude: "",
    startCity: "",
    endCity: "",
    missionDescription: ""
  }
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case LOGIN:
      return {...state, authError: action.error };
    case LOGIN_VERIFICATION:
      return {
        ...state,
        error: action.error,
        token: action.token,
        userId: action.userId,
        MissionsError: action.error,
      };
    case GET_MY_SERVICES_LIST:
      return {
        ...state,
        myServiceList: action.myServiceList,
        getMyServicesError: action.error,
      };
    case GET_SERVICE_DETAIL:
      return {...state, selectedService: action.selectedService, selectServiceError: action.selectServiceError};
    case LOGOUT:
      return {...state, token:'', userId: ''}
    case RESTORE_SERVICE_DATA:
      return {...state, savedServiceInfo: {
          projectId: action.savedServiceInfo.projectId,
          factorReceivedPrice:action.savedServiceInfo.factorReceivedPrice,
          factorTotalPrice:action.savedServiceInfo.factorTotalPrice,
          serviceDescription:action.savedServiceInfo.serviceDescription,
          address:action.savedServiceInfo.address,
          finalDate:action.savedServiceInfo.finalDate,
          serviceResult:action.savedServiceInfo.serviceResult,
          serviceType:action.savedServiceInfo.serviceType,
          objectList:action.savedServiceInfo.objectList,
          startLatitude: action.savedServiceInfo.startLatitude,
          startLongitude: action.savedServiceInfo.startLongitude,
          endLatitude: action.savedServiceInfo.endLatitude,
          endLongitude: action.savedServiceInfo.endLongitude,
          startCity: action.savedServiceInfo.startCity,
          endCity: action.savedServiceInfo.endCity,
          missionDescription: action.savedServiceInfo.missionDescription
        }}
    default:
      return state;
  }
};
