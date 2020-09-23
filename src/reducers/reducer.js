import {
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGIN_VERIFICATION_FAIL,
  LOGIN_VERIFICATION_SUCCESS,
  GET_MISSION_LIST_SUCCESS,
  GET_MISSION_LIST_FAIL,
  START_MISSION_SUCCESS,
  START_MISSION_FAIL,
  FINISH_MISSION_SUCCESS,
  FINISH_MISSION_FAIL,
  LOGOUT,
} from '../actions/types';

const INITIAL_STATE = {
  token: '',
  authError: '',
  userId: '',
  missionList: [],
  MissionsError: '',
  startMissionError: '',
  finishMissionError: '',
  unfinishedMissionId: null,
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case LOGIN_SUCCESS:
      return {...state, authError: action.error};
    case LOGIN_FAIL:
      return {...state, authError: action.error};
    case LOGIN_VERIFICATION_SUCCESS:
      return {
        ...state,
        error: action.error,
        token: action.token,
        userId: action.userId,
      };
    case LOGIN_VERIFICATION_FAIL:
      return {
        ...state,
        MissionsError: action.error,
      };
    case GET_MISSION_LIST_SUCCESS:
      return {...state, missionList: action.missionList};
    case GET_MISSION_LIST_FAIL:
      return {...state, MissionsError: action.error};
    case START_MISSION_SUCCESS:
    console.warn("action", action.unfinishedMissionId);
      return {
        ...state,
        startMissionError: action.startMissionError,
        unfinishedMissionId: action.unfinishedMissionId,
      };
    case START_MISSION_FAIL:
      return {...state, startMissionError: action.startMissionError};
    case FINISH_MISSION_SUCCESS:
      return {
        ...state,
        unfinishedMissionId: action.unfinishedMissionId,
        finishMissionError: action.finishMissionError,
      };
    case FINISH_MISSION_FAIL:
      return {...state, finishMissionError: action.finishMissionError};
    default:
      return state;
  }
};
