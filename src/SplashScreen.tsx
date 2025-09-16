import React, { useEffect } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { getUser } from '../AsyncStorage/asyncStorage';
import { Reducers, useDispatch } from "../redux/Index";
import Ionicons from '@react-native-vector-icons/ionicons';

const SplashScreen = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const checkUser = async () => {
            const data = await getUser();
            if (data) {
                dispatch(Reducers.setUser(true));
                dispatch(Reducers.setSplashScreenStatus(false));
            } else {
                dispatch(Reducers.setSplashScreenStatus(false));
            }
        };
        const timer = setTimeout(checkUser, 1500);
        return () => clearTimeout(timer);
    }, []);
    return (
        <View style={styles.container}>
            <Ionicons name='medkit' size={150} />
            <Text style={{ fontSize: 40, color: 'black' }}>MediMate</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        padding: 20
    },
    img: {
        height: '50%',
        width: '100%'
    }
});

export default SplashScreen;
