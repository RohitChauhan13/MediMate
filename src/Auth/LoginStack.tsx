import { View, Text } from 'react-native'
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import Login from './Login';
import SignUp from './SignUp';
import OTP from './OTP';

type StackProps = {
    Login: undefined;
    SignUp: undefined;
    OTP: undefined;
}

const Stack = createNativeStackNavigator<StackProps>();

const LoginStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name='Login' component={Login} />
            <Stack.Screen name='SignUp' component={SignUp} />
            <Stack.Screen name='OTP' component={OTP} />
        </Stack.Navigator>
    )
}

export default LoginStack