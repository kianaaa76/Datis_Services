import React, {useState,useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import RNFetchBlob from 'rn-fetch-blob';
import AsyncStorage from '@react-native-community/async-storage';
import {sendServiceData} from '../../actions/api';
import {SET_EDITING_SERVICE} from '../../actions/types';

const SendData = () => {
  const dispatch = useDispatch();
  const selector = useSelector(state => state);
  const [factorImage, setFactorImage] = useState("");
  const [billImage, setBillImage] = useState("");
  const [image, setImage] = useState("");


  const dirs = RNFetchBlob.fs.dirs;
  useEffect(() => {
    setInterval(()=>{
    AsyncStorage.getItem('savedServicesList').then(list => {
      if (!!list) {
        JSON.parse(list).map(item => {
          if (
            item.saveType === 'network' &&
            selector.editingService !== item.projectId
          ) {
            if (!!item.startLatitude && !!item.endLatitude) {
              RNFetchBlob.fs
                .readFile(
                  `${dirs.DownloadDir}/${item.projectId}/1.png`,
                  'base64',
                )
                .then(data => {
                  if (!!data) {
                    setFactorImage(data);
                  }
                });
              RNFetchBlob.fs
                .readFile(
                  `${dirs.DownloadDir}/${item.projectId}/2.png`,
                  'base64',
                )
                .then(data => {
                  if (!!data) {
                    setBillImage(data);
                  }
                });
              RNFetchBlob.fs
                .readFile(
                  `${dirs.DownloadDir}/${item.projectId}/3.png`,
                  'base64',
                )
                .then(data => {
                  if (!!data) {
                    setImage(data);
                  }
                });
                let requestObjectList = [];
                item.objectList.map(I=>{
                  requestObjectList.push({
                    ServiceId: item.projectId,
                    Object_Id: I.partType.value.Id,
                    Direction: I.objectType === 'new' ? '0' : '1',
                    Description: I.failureDescription,
                    Price: parseInt(I.Price.toString().split('.').join("")),
                    Serial: I.serial,
                    VersionId: I.version.Key,
                  });
                })
              sendServiceData(
                selector.token,
                item.projectId,
                item.serviceResult,
                item.serviceType,
                item.factorReceivedPrice,
                item.factorTotalPrice,
                item.toCompanySettlement,
                item.address,
                item.serviceDescription,
                image,
                factorImage,
                requestObjectList,
                item.finalDate,
                item.isRejectedService,
                {
                  Id:!!item.isRejectedService?item.missionId : null,
                  ServiceManId: selector.userId,
                  StartCity: item.startCity,
                  StartLocation: `${item.startLatitude},${item.startLongitude}`,
                  EndCity: item.endCity,
                  EndLocation: `${item.endLatitude},${item.endLongitude}`,
                  Distance: item.distance,
                  Description: item.missionDescription,
                },
                selector.userId,
                billImage,
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
                } else {
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
                .then(data => {
                  if (!!data) {
                    setFactorImage(data);
                  }
                });
              RNFetchBlob.fs
                .readFile(
                  `${dirs.DownloadDir}/${item.projectId}/2.png`,
                  'base64',
                )
                .then(data => {
                  if (!!data) {
                    setBillImage(data);
                  }
                });
              RNFetchBlob.fs
                .readFile(
                  `${dirs.DownloadDir}/${item.projectId}/3.png`,
                  'base64',
                )
                .then(data => {
                  if (!!data) {
                    setImage(data);
                  }
                });
                let requestObjectList = [];
                item.objectList.map(item=>{
                  requestObjectList.push({
                    ServiceId: item.projectId,
                    Object_Id: item.partType.value.Id,
                    Direction: item.objectType === 'new' ? '0' : '1',
                    Description: item.failureDescription,
                    Price: parseInt(item.Price.toString().split('.').join("")),
                    Serial: item.serial,
                    VersionId: item.version.Key,
                  });
                })
              sendServiceData(
                selector.token,
                item.projectId,
                item.serviceResult,
                item.serviceType,
                item.factorReceivedPrice,
                item.factorTotalPrice,
                item.toCompanySettlement,
                item.address,
                item.serviceDescription,
                image,
                factorImage,
                requestObjectList,
                item.finalDate,
                item.isRejectedService,
                null,
                selector.userId,
                billImage,
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
    },[]);
  },3000);
  });

  return <></>;
};
export default SendData;
