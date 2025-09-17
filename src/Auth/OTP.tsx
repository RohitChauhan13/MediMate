import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, BackHandler } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import axios from 'axios';
import { Reducers, useDispatch } from '../../redux/Index';
import { signUpWithEmail } from '../../Firebase/SignUpFirebase';
import Toast from '../Components/Toast';
import { getUser, saveUser } from '../../AsyncStorage/asyncStorage';
import { getFcmToken } from '../Notification/notificationServise';

type StackParamList = {
    Login: undefined;
    SignUp: undefined;
    OTP: {
        email: string;
        password: string;
        name: string;
    };
};

type OtpRouteProp = RouteProp<StackParamList, 'OTP'>;
type LoginScreenProp = NativeStackNavigationProp<StackParamList, 'Login'>;

const OTP = () => {
    const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(60);
    const inputs = useRef<TextInput[]>([]);
    const navigation = useNavigation<LoginScreenProp>();
    const route = useRoute<OtpRouteProp>();
    const dispatch = useDispatch();
    const { email, password, name } = route.params;

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

    // Disable hardware back
    useEffect(() => {
        const backAction = () => true;
        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => backHandler.remove();
    }, []);

    // Timer
    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | null = null;
        if (timer > 0) {
            interval = setInterval(() => setTimer(prev => prev - 1), 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [timer]);

    const handleChange = (text: string, index: number) => {
        if (/^\d$/.test(text) || text === '') {
            const newOtp = [...otp];
            newOtp[index] = text;
            setOtp(newOtp);

            if (text !== '' && index < 5) {
                inputs.current[index + 1]?.focus();
            }
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    const handleResend = async () => {
        try {
            setOtp(['', '', '', '', '', '']);
            setTimer(60);
            inputs.current[0]?.focus();
            const res = await axios.post('https://rohitsbackend.onrender.com/send-otp', { email, name });
            if (res.data.success) {
                Toast(res.data.message);
            } else {
                Toast('Failed to resend OTP');
            }
        } catch (err: any) {
            Toast(err?.message || 'Error resending OTP');
        }
    };

    const handleVerify = async () => {
        dispatch(Reducers.setLoading(true));
        const otpCode = otp.join('');
        try {
            const res = await axios.post('https://rohitsbackend.onrender.com/verify-otp', {
                email,
                otp: otpCode,
                name
            });
            if (res.data.success) {
                await handleSignUp();
                await sendTokenToBackend();
            }
            else {
                Toast(res.data.message || 'Invalid OTP');
            }
        } catch (err: any) {
            if (err.response) {
                Toast(err.response.data?.message || 'Invalid OTP');
            } else {
                Toast(err?.message || 'Something went wrong');
            }
        } finally {
            dispatch(Reducers.setLoading(false));
        }
    };

    const handleSignUp = async () => {
        try {
            const res = await signUpWithEmail(email, password);
            if (res.success) {
                dispatch(Reducers.setUser(true));
                Toast('Account created successfully');
                navigation.replace('Login');
                await saveUser(email);
            } else if (res.error.code === 'auth/email-already-in-use') {
                console.log('That email address is already in use!');
            } else if (res.error.code === 'auth/invalid-email') {
                console.log('That email address is invalid!');
            }
        } catch (err: any) {
            Toast(err?.message || 'Signup failed');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Enter OTP</Text>
            <Text style={{ marginBottom: 15, color: 'black' }}>Sent to {email}</Text>

            <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                    <TextInput
                        key={index}
                        ref={(ref: any) => (inputs.current[index] = ref!)}
                        style={styles.input}
                        keyboardType="number-pad"
                        maxLength={1}
                        value={digit}
                        onChangeText={(text) => handleChange(text, index)}
                        onKeyPress={(e) => handleKeyPress(e, index)}
                    />
                ))}
            </View>

            <TouchableOpacity style={styles.verifyBtn} onPress={handleVerify}>
                <Text style={styles.verifyText}>Verify OTP</Text>
            </TouchableOpacity>

            <View style={styles.resendContainer}>
                {timer > 0 ? (
                    <Text style={styles.timerText}>Resend OTP in {timer}s</Text>
                ) : (
                    <TouchableOpacity onPress={handleResend}>
                        <Text style={styles.resendText}>Resend OTP</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#9da2a5ff' },
    header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: 'blue' },
    otpContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
    input: {
        borderBottomWidth: 2,
        borderColor: 'gray',
        fontSize: 22,
        textAlign: 'center',
        marginHorizontal: 5,
        width: 45,
        height: 50,
    },
    verifyBtn: {
        backgroundColor: 'tomato',
        paddingVertical: 12,
        paddingHorizontal: 40,
        borderRadius: 10,
        marginBottom: 15,
    },
    verifyText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    resendContainer: { marginTop: 10 },
    timerText: { color: 'black', fontSize: 16 },
    resendText: { color: 'red', fontSize: 16, fontWeight: 'bold' },
});

export default OTP;
