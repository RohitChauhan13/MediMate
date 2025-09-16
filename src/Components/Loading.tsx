import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useSelector } from '../../redux/Store';

const Loading = () => {
    const { loading } = useSelector((state: any) => state.auth);

    if (!loading) return null;

    return (
        <View style={styles.backdrop}>
            <View style={styles.container}>
                <ActivityIndicator size="large" color="tomato" />
                <Text style={styles.text}>Loading...</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(0,0,0,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        paddingVertical: 20,
        paddingHorizontal: 24,
        borderRadius: 12,
        backgroundColor: '#fff',
        alignItems: 'center',
        minWidth: 140,
    },
    text: {
        marginTop: 15,
        fontSize: 18,
        fontWeight: '600',
        color: 'gray',
    },
});

export default Loading;
