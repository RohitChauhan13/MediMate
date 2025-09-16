import { ToastAndroid } from "react-native";

const Toast = (text: string) => {
    return ToastAndroid.showWithGravity(
        text.toString(),
        2000,
        ToastAndroid.TOP,
    );
};
export default Toast;