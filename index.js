/**
 * @format
 */
import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';
import ReduxProvider from './ReduxProvider';
import messaging from '@react-native-firebase/messaging';
import { onDisplayNotification } from './src/Notification/notifee';

messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Background Message:', remoteMessage);
    onDisplayNotification(remoteMessage)
});

AppRegistry.registerComponent(appName, () => ReduxProvider);
