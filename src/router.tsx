import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Wishlist from './RouteScreens/Wishlist';
import Profile from './RouteScreens/Profile';
import Ionicons from '@react-native-vector-icons/ionicons';
import FontAwesome from '@react-native-vector-icons/fontawesome';
import HomeStack from './RouteScreens/HomeStack';
import Dept from './RouteScreens/Dept';
import { Image, StyleSheet } from 'react-native';

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
                    } else if (route.name === 'Dept') {
                        return focused ? (
                            <Image source={require('./img/debt1.png')} style={[styles.img, { tintColor: focused ? '#20473fff' : 'gray' }]} />
                        ) : (
                            <Image source={require('./img/debt.png')} style={[styles.img, { tintColor: focused ? '#20473fff' : 'gray' }]} />
                        );
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'user-circle-o' : 'user-circle';
                        return <FontAwesome name={iconName} size={25} color={color} />;
                    }
                },
                tabBarActiveTintColor: '#20473fff',
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
            <BottomTab.Screen name='Dept' component={Dept} />
            <BottomTab.Screen name='Profile' component={Profile} />
        </BottomTab.Navigator>
    )
}

const styles = StyleSheet.create({
    img: {
        height: 28,
        width: 28,
        resizeMode: 'contain'
    }
})

export default Router;
