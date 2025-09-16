import { View, Text } from 'react-native';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import Router from './src/router';
import LoginStack from './src/Auth/LoginStack';
import { useSelector } from './redux/Store';
import SplashScreen from './src/SplashScreen';

const App = () => {
  const { splashScreenStatus, user } = useSelector(state => state.auth)
  if (splashScreenStatus) {
    return <SplashScreen />
  }
  return (
    <NavigationContainer>
      {user ? <Router /> : <LoginStack />}
    </NavigationContainer>
  )
}

export default App