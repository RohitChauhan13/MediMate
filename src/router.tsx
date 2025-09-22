import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from './RouteScreens/Home';
import Wishlist from './RouteScreens/Wishlist';
import Profile from './RouteScreens/Profile';
import Ionicons from '@react-native-vector-icons/ionicons';
import FontAwesome from '@react-native-vector-icons/fontawesome';
import HomeStack from './RouteScreens/HomeStack';

const BottomTab = createBottomTabNavigator();

const Router = () => {
    return (
        <BottomTab.Navigator
            initialRouteName='Home'
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color }) => {
                    let iconName: any = '';
                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                        return <Ionicons name={iconName} size={25} color={color} />;
                    } else if (route.name === 'Wishlist') {
                        iconName = focused ? 'cart' : 'cart-outline';
                        return <Ionicons name={iconName} size={30} color={color} />;
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'user-circle' : 'user-circle-o';
                        return <FontAwesome name={iconName} size={25} color={color} />;
                    }
                },
                tabBarActiveTintColor: '#eec841ff',
                tabBarInactiveTintColor: 'gray',
                tabBarLabelStyle: { fontSize: 12 },
                tabBarStyle: {
                    height: 55,
                },
                headerShown: false,
            })}
        >
            <BottomTab.Screen name='Home' component={HomeStack} />
            <BottomTab.Screen name='Wishlist' component={Wishlist} />
            <BottomTab.Screen name='Profile' component={Profile} />
        </BottomTab.Navigator>
    )
}

export default Router;
