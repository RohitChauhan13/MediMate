import React, { useEffect, useRef } from "react";
import { Animated, Image, StyleSheet, Text, View } from "react-native";
import { getUser } from '../AsyncStorage/asyncStorage';
import { Reducers, useDispatch } from "../redux/Index";
import Ionicons from '@react-native-vector-icons/ionicons';

const SplashScreen = () => {
    const dispatch = useDispatch();

    // Animated values
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Run animation
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1.2,
                friction: 3,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 1.2,
                duration: 2000,
                useNativeDriver: true,
            }),
        ]).start();

        const checkUser = async () => {
            const data = await getUser();
            if (data) {
                dispatch(Reducers.setUser(true));
                dispatch(Reducers.setSplashScreenStatus(false));
            } else {
                dispatch(Reducers.setSplashScreenStatus(false));
            }
        };

        const timer = setTimeout(checkUser, 2500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={styles.container}>
            <Animated.View style={{ transform: [{ scale: scaleAnim }], opacity: opacityAnim }}>
                <Image style={styles.img} source={require('./img/Media.jpg')} />
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#ffffff",
    },
    title: {
        fontSize: 40,
        color: "black",
        marginTop: 10,
        fontFamily: 'Merienda-Regular'
    },
    img: {
        width: 250,
        height: 300
    }
});

export default SplashScreen;
