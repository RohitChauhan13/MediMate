import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AntDesign from '@react-native-vector-icons/ant-design';
import { loginWithEmail } from '../../Firebase/Login';
import { getUser, saveUser } from '../../AsyncStorage/asyncStorage';
import { Reducers, useDispatch } from '../../redux/Index';
import Toast from '../Components/Toast';
import { getFcmToken } from '../Notification/notificationServise';
import axios from 'axios';

type StackParamList = {
    Login: undefined;
    SignUp: undefined;
    OTP: undefined;
};

type LoginScreenProp = NativeStackNavigationProp<StackParamList, 'Login'>;

const Login = () => {
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [hidePass, setHidePass] = useState(true);
    const passRef = useRef(null);

    const navigation = useNavigation<LoginScreenProp>();
    const dispatch = useDispatch();

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    const handleLogin = async () => {
        if (!email || !pass) {
            Toast('Please enter email and password');
            return;
        }
        if (!emailRegex.test(email)) {
            Toast('Please enter a valid email');
            return;
        }

        dispatch(Reducers.setLoading(true))
        const res = await loginWithEmail(email, pass);
        if (res.success) {
            await saveUser(email);
            await sendTokenToBackend();
            dispatch(Reducers.setUser(true));
        } else {
            Toast('Invalid email or password');
        }
        dispatch(Reducers.setLoading(false))
    };

    const sendTokenToBackend = async () => {
        try {
            const token = await getFcmToken();
            const email = await getUser();
            if (token) {
                const response = await axios.post("https://rohitsbackend.onrender.com/add-token", {
                    email,
                    token,
                });

                console.log("Token saved:", response.data);
            }
        } catch (error: any) {
            console.error("Error saving token:", error.message);
        }
    };

    return (
        <View style={{ flex: 1, padding: 15, backgroundColor: '#9da2a5ff' }}>
            <View style={styles.form}>
                <Text style={styles.header}>Medi Mate</Text>

                <TextInput
                    autoFocus={true}
                    mode='outlined'
                    label="Email"
                    placeholder="Enter your email"
                    value={email}
                    keyboardType='email-address'
                    onChangeText={setEmail}
                    style={{ marginTop: 20, marginHorizontal: 10 }}
                />

                <View>
                    <TextInput
                        ref={passRef}
                        mode='outlined'
                        label="Password"
                        placeholder="Enter your password"
                        value={pass}
                        secureTextEntry={hidePass}
                        onChangeText={setPass}
                        style={{ marginTop: 15, marginHorizontal: 10 }}
                    />

                    <TouchableOpacity
                        style={styles.eye}
                        onPress={() => setHidePass(!hidePass)}
                    >
                        {hidePass ? (
                            <AntDesign name='eye' size={22} color="gray" />
                        ) : (
                            <AntDesign name='eye-invisible' size={22} color="tomato" />
                        )}
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    activeOpacity={0.6}
                    style={styles.btn}
                    onPress={handleLogin}
                >
                    <Text style={styles.btnLabel}>Login</Text>
                </TouchableOpacity>

                <View style={styles.navContainer}>
                    <Text>Don’t have an account?</Text>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => navigation.navigate('SignUp')}
                    >
                        <Text style={styles.signUpBtnLabel}>Sign up</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        fontSize: 30,
        fontWeight: 'bold',
        alignSelf: 'center',
        color: 'blue',
    },
    form: {
        borderRadius: 12,
        width: '100%',
        marginTop: '30%',
        padding: 10,
        backgroundColor: '#fff',
        elevation: 10,
    },
    btn: {
        borderRadius: 12,
        padding: 10,
        width: '95%',
        backgroundColor: 'tomato',
        alignSelf: 'center',
        marginTop: 40,
    },
    btnLabel: {
        fontSize: 20,
        alignSelf: 'center',
        fontWeight: 'bold',
        color: 'black',
    },
    navContainer: {
        flexDirection: 'row',
        alignSelf: 'center',
        marginTop: 10,
    },
    signUpBtnLabel: {
        marginLeft: 5,
        color: 'red',
    },
    eye: {
        position: 'absolute',
        right: 20,
        top: 35,
    },
});

export default Login;
