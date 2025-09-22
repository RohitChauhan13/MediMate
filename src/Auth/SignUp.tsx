import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import React, { useRef, useState } from 'react';
import { TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Reducers, useDispatch } from '../../redux/Index';
import axios from 'axios';
import Toast from '../Components/Toast';
import AntDesign from '@react-native-vector-icons/ant-design';
import { saveUserFullName } from '../../AsyncStorage/asyncStorage';

type StackParamList = {
    Login: undefined;
    SignUp: undefined;
    OTP: {
        email: string;
        password: string;
        name: string;
    };
};

type LoginScreenProp = NativeStackNavigationProp<StackParamList, 'Login'>;

const SignUp = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [hidePass, setHidePass] = useState(true);

    const nameRef = useRef(null);
    const emailRef = useRef(null);
    const passRef = useRef(null);

    const dispatch = useDispatch();
    const navigation = useNavigation<LoginScreenProp>();

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    const sendOTP = async () => {
        dispatch(Reducers.setLoading(true));
        try {
            const res = await axios.post(
                'https://rohitsbackend.onrender.com/send-otp',
                { email, name }
            );

            if (res.data.success) {
                Toast("OTP sent successfully");
                navigation.replace('OTP', { email, password, name });
            } else {
                Toast(res.data.message);
            }
        } catch (err: any) {
            Toast(err?.message || 'Something went wrong');
        } finally {
            dispatch(Reducers.setLoading(false));
        }
    };

    return (
        <View style={{ flex: 1, padding: 15, backgroundColor: '#e1e3e5ff' }}>
            <View style={styles.form}>
                <Image style={styles.img} source={require('../img/Media.jpg')} />
                <TextInput
                    autoFocus={true}
                    ref={nameRef}
                    mode="outlined"
                    label="Full Name"
                    placeholder="enter your full name"
                    value={name}
                    keyboardType="default"
                    onChangeText={setName}
                    style={{ marginTop: 15, marginHorizontal: 10 }}
                />

                <TextInput
                    mode="outlined"
                    ref={emailRef}
                    label="Email"
                    placeholder="enter your email"
                    value={email}
                    keyboardType="email-address"
                    onChangeText={setEmail}
                    style={{ marginTop: 20, marginHorizontal: 10 }}
                />

                <TextInput
                    mode="outlined"
                    ref={passRef}
                    label="Password"
                    placeholder="enter your password"
                    value={password}
                    secureTextEntry={hidePass}
                    onChangeText={setPassword}
                    style={{ marginTop: 20, marginHorizontal: 10 }}
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

                <TouchableOpacity
                    activeOpacity={0.6}
                    style={styles.btn}
                    onPress={async () => {
                        if (name === '') {
                            Toast('Please provide your name');
                        } else if (email === '') {
                            Toast('Please provide email');
                        } else if (!emailRegex.test(email)) {
                            Toast('Please enter a valid email');
                        } else if (password === '') {
                            Toast('Please provide password');
                        } else if (password.length < 8) {
                            Toast('Minimum 8 characters required in the password');
                        } else {
                            await saveUserFullName(name);
                            sendOTP();
                        }
                    }}
                >
                    <Text style={styles.btnLabel}>Sign Up</Text>
                </TouchableOpacity>

                <View style={styles.navContainer}>
                    <Text>Already have an account?</Text>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => {
                            navigation.navigate('Login');
                        }}
                    >
                        <Text style={styles.signUpBtnLabel}>Login</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        fontSize: 30,
        alignSelf: 'center',
        color: 'blue',
        fontFamily: 'Merienda-Regular',
    },
    form: {
        borderRadius: 12,
        width: '100%',
        marginTop: '15%',
        padding: 10,
        backgroundColor: '#fff',
        elevation: 8,
    },
    btn: {
        borderRadius: 12,
        padding: 10,
        width: '95%',
        backgroundColor: 'tomato',
        alignSelf: 'center',
        marginTop: 15,
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
        right: 32,
        top: 295,
    },
    img: {
        height: 100,
        width: 150,
        alignSelf: 'center',
    }
});

export default SignUp;
