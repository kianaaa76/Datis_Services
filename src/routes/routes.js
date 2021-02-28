import React from 'react';
import {createSwitchNavigator, createAppContainer} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import {createDrawerNavigator} from 'react-navigation-drawer';
import DrawerContent from './DrawerContent';
import Home from '../components/screens/Home';
import Login from '../components/screens/Login';
import Missions from '../components/screens/MyMissions/missionList';
import MissionDetails from '../components/screens/MyMissions/MissionDetails';
import MyServices from '../components/screens/MyServices/MyServices';
import MyServiceDetails from '../components/screens/MyServices/MyServiceDetails';
import NewService from '../components/screens/MyServices/NewService';
import RejectedServiceList from '../components/screens/RejectedServices/RejectedServiceList';
import RejectedServiceDetail from '../components/screens/RejectedServices/RejectedServiceDetail';
import RemainingServiceList from '../components/screens/RemainingServices/RemainingServiceList';
import RemainingServiceDetail from '../components/screens/RemainingServices/RemainingServiceDetail';
import ServiceArchiveList from '../components/screens/ServiceArchive/ServiceArchiveList';
import ServiceArchiveDetail from '../components/screens/ServiceArchive/ArchiveListServiceDetail';
import Splash from '../components/screens/SplashScreen';
import Garantee from '../components/screens/Garantee';
import PriceList from "../components/screens/PriceList";
import UserAddress from "../components/screens/UserAddress";
import WarehouseDetail from "../components/screens/Warehousing/WarehouseDetail";
import SalaryList from "../components/screens/Salary/Salary";
import SalaryData from "../components/screens/Salary/SalaryData";
import SalaryDetail from "../components/screens/Salary/SalaryDetail"

const SalaryStack = createStackNavigator({
    salaryList: {
        screen: SalaryList,
    },
    SalaryData: {
        screen: SalaryData,
    },
    SalaryDetail: {
        screen: SalaryDetail,
    },
},{
    headerMode: 'none',
    navigationOptions: {
        headerVisible: false,
    },
});

export const drawer = createDrawerNavigator(
  {
    Home: {
      screen: Home,
    },
    Garantee: {
      screen: Garantee,
    },
    PriceList:{
      screen: PriceList
    },
    Salary:{
      screen: SalaryStack
    }
  },
  {
    drawerPosition: 'right',
    initialRouteName: 'Home',
    contentComponent: DrawerContent,
  },
);

const SignedIn = createStackNavigator(
  {
    Home: {
      screen: drawer,
    },
      UserAddress: {
          screen: UserAddress
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
    MyServiceDetails: {
      screen: MyServiceDetails,
    },
    NewService: {
      screen: NewService,
    },
    RejectedServices: {
      screen: RejectedServiceList,
    },
    RejectedServiceDetail: {
      screen: RejectedServiceDetail,
    },
    RemainingServices: {
      screen: RemainingServiceList,
    },
    RemainingServiceDetail: {
      screen: RemainingServiceDetail,
    },
    ServiceArchiveList: {
      screen: ServiceArchiveList,
    },
    ServiceArchiveDetail: {
      screen: ServiceArchiveDetail,
    },
      WarehouseDetail:{
        screen: WarehouseDetail
      },
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
    Splash: {
      screen: Splash,
    },
    UserAddress: {
      screen: UserAddress
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
