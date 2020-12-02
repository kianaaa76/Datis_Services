import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import RNFetchBlob from 'rn-fetch-blob';
import AsyncStorage from '@react-native-community/async-storage';
import {sendServiceData} from '../../actions/api';
import {SET_EDITING_SERVICE} from '../../actions/types';

let FACTOR_IMAGE = '';
let BILL_IMAGE = '';
let IMAGE = '';
const SendData = () => {
  const dispatch = useDispatch();
  const selector = useSelector(state => state);
  const convertResultTitleToNum = title => {
    switch (title) {
      case 'موفق':
        return 1;
      case 'موفق مشکوک':
        return 2;
      case 'سرویس جدید - کسری قطعات':
        return 3;
      case 'سرویس جدید - آماده نبودن پروژه':
        return 4;
      case 'سرویس جدید - عدم تسلط':
        return 5;
      case 'لغو موفق':
        return 6;
      default:
        return 0;
    }
  };
  const convertTypeTitleToNum = title => {
    switch (title) {
      case 'خرابی یا تعویض قطعه':
        return 1;
      case 'ایراد نصب و تنظیم روتین':
        return 2;
      case 'تنظیم و عیب غیرروتین':
        return 3;
      default:
        return 0;
    }
  };
  const dirs = RNFetchBlob.fs.dirs;
  useEffect(() => {
    setInterval(() => {
      AsyncStorage.getItem('savedServicesList').then(list => {
        if (!!list) {
          JSON.parse(list).map(item => {
            if (
              item.saveType === 'network' &&
              selector.editingService !== item.projectId
            ) {
              if (!!item.startLatitude) {
                RNFetchBlob.fs
                  .readFile(
                    `${dirs.DownloadDir}/${item.projectId}/1.png`,
                    'base64',
                  )
                  .then(async data => {
                    if (!!data) {
                      FACTOR_IMAGE = await data;
                    }
                  });
                RNFetchBlob.fs
                  .readFile(
                    `${dirs.DownloadDir}/${item.projectId}/2.png`,
                    'base64',
                  )
                  .then(async data => {
                    if (!!data) {
                      BILL_IMAGE = await data;
                    }
                  });
                RNFetchBlob.fs
                  .readFile(
                    `${dirs.DownloadDir}/${item.projectId}/3.png`,
                    'base64',
                  )
                  .then(async data => {
                    if (!!data) {
                      IMAGE = await data;
                    }
                  });
                sendServiceData(
                  selector.token,
                  item.projectId,
                  convertResultTitleToNum(item.serviceResult),
                  convertTypeTitleToNum(item.serviceType),
                  item.factorReceivedPrice,
                  item.factorTotalPrice,
                  item.address,
                  item.serviceDescription,
                  IMAGE,
                  FACTOR_IMAGE,
                  item.objectList,
                  item.finalDate,
                  item.isRejectedService,
                  {
                    ServiceManId: selector.userId,
                    StartCity: item.startCity,
                    StartLocation: `${item.startLatitude},${item.startLongitude}`,
                    EndCity: item.endCity,
                    EndLocation: `${item.endLatitude},${item.endLongitude}`,
                    Distance: item.distance,
                    Description: item.missionDescription,
                  },
                  selector.userId,
                  BILL_IMAGE,
                ).then(data => {
                  if (data.errorCode === 0) {
                    dispatch({
                      type: SET_EDITING_SERVICE,
                      editingService: '',
                    });
                    AsyncStorage.getItem('savedServicesList').then(list => {
                      let tempList = JSON.parse(list).filter(
                        service => service.projectId !== item.projectId,
                      );
                      AsyncStorage.setItem(
                        'savedServicesList',
                        JSON.stringify(tempList),
                      );
                      RNFetchBlob.fs.unlink(
                        `${dirs.DownloadDir}/${item.projectId}`,
                      );
                    });
                  } else if (data.errorCode === -13) {
                    AsyncStorage.getItem('savedServicesList').then(list => {
                      let tempList = JSON.parse(list).filter(
                        service => service.projectId !== item.projectId,
                      );
                      AsyncStorage.setItem(
                        'savedServicesList',
                        JSON.stringify(tempList),
                      );
                      RNFetchBlob.fs.unlink(
                        `${dirs.DownloadDir}/${item.projectId}`,
                      );
                    });
                  }
                });
              } else {
                RNFetchBlob.fs
                  .readFile(
                    `${dirs.DownloadDir}/${item.projectId}/1.png`,
                    'base64',
                  )
                  .then(async data => {
                    if (!!data) {
                      FACTOR_IMAGE = await data;
                    }
                  });
                RNFetchBlob.fs
                  .readFile(
                    `${dirs.DownloadDir}/${item.projectId}/2.png`,
                    'base64',
                  )
                  .then(async data => {
                    if (!!data) {
                      BILL_IMAGE = await data;
                    }
                  });
                RNFetchBlob.fs
                  .readFile(
                    `${dirs.DownloadDir}/${item.projectId}/3.png`,
                    'base64',
                  )
                  .then(async data => {
                    if (!!data) {
                      IMAGE = await data;
                    }
                  });
                sendServiceData(
                  selector.token,
                  item.projectId,
                  convertResultTitleToNum(item.serviceResult),
                  convertTypeTitleToNum(item.serviceType),
                  item.factorReceivedPrice,
                  item.factorTotalPrice,
                  item.address,
                  item.serviceDescription,
                  IMAGE,
                  FACTOR_IMAGE,
                  item.objectList,
                  item.finalDate,
                  item.isRejectedService,
                  {},
                  selector.userId,
                  BILL_IMAGE,
                ).then(data => {
                  if (data.errorCode === 0) {
                    dispatch({
                      type: SET_EDITING_SERVICE,
                      editingService: '',
                    });
                    AsyncStorage.getItem('savedServicesList').then(list => {
                      let tempList = JSON.parse(list).filter(
                        service => service.projectId !== item.projectId,
                      );
                      AsyncStorage.setItem(
                        'savedServicesList',
                        JSON.stringify(tempList),
                      );
                      RNFetchBlob.fs.unlink(
                        `${dirs.DownloadDir}/${item.projectId}`,
                      );
                    });
                  } else if (data.errorCode === -13) {
                    AsyncStorage.getItem('savedServicesList').then(list => {
                      let tempList = JSON.parse(list).filter(
                        service => service.projectId !== item.projectId,
                      );
                      AsyncStorage.setItem(
                        'savedServicesList',
                        JSON.stringify(tempList),
                      );
                      RNFetchBlob.fs.unlink(
                        `${dirs.DownloadDir}/${item.projectId}`,
                      );
                    });
                  }
                });
              }
            }
          });
        }
      });
    }, 3000);
  });

  return <></>;
};
export default SendData;
