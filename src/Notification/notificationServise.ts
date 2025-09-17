import messaging from '@react-native-firebase/messaging';

export async function requestNotificationPermission() {
    try {
        const authStatus = await messaging().requestPermission();
        const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
            console.log('Notification Permission Granted ✅');
            return true;
        } else {
            console.log('Notification Permission Denied ❌');
            return false;
        }
    } catch (error) {
        console.error('Permission request error:', error);
        return false;
    }
}

export async function getFcmToken() {
    try {
        const token = await messaging().getToken();
        console.log('FCM Token:', token);
        return token;
    } catch (error) {
        console.error('Error getting FCM token:', error);
        return null;
    }
}
