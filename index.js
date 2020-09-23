/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import MapboxGL from "@react-native-mapbox-gl/maps";

MapboxGL.setAccessToken("pk.eyJ1Ijoia2lhbmE3NnIiLCJhIjoiY2tmYXdzdGp1MHd0bTJ5bXJ2cXZoMXV1OSJ9.5p-g_z1bDd6IXcHd5cOLww");

AppRegistry.registerComponent(appName, () => App);
