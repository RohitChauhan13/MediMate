
import notifee, { AndroidImportance } from '@notifee/react-native';

export const onDisplayNotification = async (title: string, body: string) => {
    // Ensure channel exists
    const channelId = await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
        importance: AndroidImportance.HIGH,
    });

    await notifee.displayNotification({
        title: title,
        body: body,
        android: {
            channelId,
            smallIcon: 'ic_launcher',
            pressAction: {
                id: 'default',
            },
        },
    });
};
