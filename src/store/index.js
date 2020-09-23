import {createStore, applyMiddleware} from 'redux';
import {AsyncStorage} from 'react-native';
import {persistStore, persistReducer} from 'redux-persist';
import {createWhitelistFilter} from 'redux-persist-transform-filter';
import ReduxThunk from 'redux-thunk';
import reducers from '../reducers/reducer';

const persistedStates = createWhitelistFilter('reducers', ['token', 'userId']);

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  transforms: [persistedStates]
};

const persistedReducer = persistReducer(persistConfig, reducers);
const store = createStore(persistedReducer, {}, applyMiddleware(ReduxThunk));
const persistor = persistStore(store);

const getPersistor = () => persistor;
const getStore = () => store;
const getState = () => {
  return store.getState();
};

export {getStore, getState, getPersistor};
export default {
  getStore,
  getState,
  getPersistor,
};
