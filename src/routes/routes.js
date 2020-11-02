import React from 'react';
import {createSwitchNavigator, createAppContainer} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import Home from '../components/screens/Home';
import Login from '../components/screens/Login';
import Missions from '../components/screens/MyMissions/missionList';
import MissionDetails from '../components/screens/MyMissions/MissionDetails';
import MyServices from '../components/screens/MyServices/MyServices';
import MyServiceDetails from "../components/screens/MyServices/MyServiceDetails";
import NewService from "../components/screens/MyServices/NewService";
import RejectedServiceList from "../components/screens/RejectedServices/RejectedServiceList";
import RejectedServiceDetail from "../components/screens/RejectedServices/RejectedServiceDetail";
import RemainingServiceList from "../components/screens/RemainingServices/RemainingServiceList";
import RemainingServiceDetail from "../components/screens/RemainingServices/RemainingServiceDetail";
import ServiceArchiveList from "../components/screens/ServiceArchive/ServiceArchiveList";
import ServiceArchiveDetail from "../components/screens/ServiceArchive/ArchiveListServiceDetail";
import Splash from "../components/screens/SplashScreen";

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
    MyServices: {
      screen: MyServices,
    },
      MyServiceDetails:{
        screen: MyServiceDetails
      },
      NewService:{
        screen: NewService
      },
      RejectedServices:{
        screen: RejectedServiceList
      },
      RejectedServiceDetail:{
        screen: RejectedServiceDetail
      },
      RemainingServices:{
        screen: RemainingServiceList
      },
      RemainingServiceDetail:{
        screen: RemainingServiceDetail
      },
      ServiceArchiveList: {
          screen: ServiceArchiveList
      },
      ServiceArchiveDetail:{
        screen: ServiceArchiveDetail
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
      Splash:{
          screen:Splash
      },
    SignedIn: {
      screen: SignedIn,
    },
    SignedOut: {
      screen: Login,
    },
  },
  {
    initialRouteName: 'Splash',
  },
);

export const RootNav = createAppContainer(switcher);
