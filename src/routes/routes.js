import React from 'react';
import {createSwitchNavigator, createAppContainer} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import Home from '../components/screens/Home';
import Login from '../components/screens/Login';
import Missions from '../components/screens/missionList';
import MissionDetails from '../components/screens/MissionDetails';
import NewMissionStart from '../components/screens/NewMissionStart';
import FinishMission from "../components/screens/FinishMission";

const SignedIn = createStackNavigator(
  {
    Home: {
      screen: Home,
    },
    Mission: {
      screen: Missions,
    },
    MissionDetail: {
      screen: MissionDetails,
    },
    NewMissionStart: {
      screen: NewMissionStart,
    },
    FinishMission: {
      screen: FinishMission
    }
  },
  {
    headerMode: 'none',
    navigationOptions: {
      headerVisible: false,
    },
  },
);

export const switcher = createSwitchNavigator(
  {
    SignedIn: {
      screen: SignedIn,
    },
    SignedOut: {
      screen: Login,
    },
  },
  {
    initialRouteName: 'SignedOut',
  },
);

export const RootNav = createAppContainer(switcher);
