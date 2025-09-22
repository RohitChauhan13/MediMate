import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, BackHandler, Alert, Image } from 'react-native';
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
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const inputs = useRef<(TextInput | null)[]>([]);
    const navigation = useNavigation<LoginScreenProp>();
    const route = useRoute<OtpRouteProp>();
    const dispatch = useDispatch();
    const { email, password, name } = route.params;

    const addTokenToDB = async (): Promise<boolean> => {
        try {
            const userToken = await getFcmToken();

            if (!userToken) {
                console.warn("FCM token not available");
                return false;
            }

            const res = await axios.post("https://rohitsbackend.onrender.com/add-token", {
                email: email,
                token: userToken,
            });

            if (res.data.success === false && res.data.message === "Token already exists") {
                console.log("Token already exists, continuing signup...");
                return true;
            }

            if (res.data.success) {
                console.log("Token saved:", res.data.data);
                return true;
            }

            return false;
        } catch (error: any) {
            console.error("Error in addTokenToDB:", error.response?.data || error.message);
            return false;
        }
    };

    // Disable hardware back button
    useEffect(() => {
        const backAction = () => {
            Alert.alert(
                "Exit",
                "Are you sure you want to go back? You'll need to start the verification process again.",
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Yes", onPress: () => navigation.goBack() }
                ]
            );
            return true;
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => backHandler.remove();
    }, [navigation]);

    // Timer countdown
    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | null = null;

        if (timer > 0) {
            interval = setInterval(() => setTimer(prev => prev - 1), 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [timer]);

    // Auto-focus first input
    useEffect(() => {
        setTimeout(() => inputs.current[0]?.focus(), 100);
    }, []);

    const handleChange = (text: string, index: number) => {
        if (text.length > 1) text = text.slice(-1);

        if (/^\d$/.test(text) || text === '') {
            const newOtp = [...otp];
            newOtp[index] = text;
            setOtp(newOtp);

            if (text !== '' && index < 5) inputs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    const clearOtpInputs = () => {
        setOtp(['', '', '', '', '', '']);
        setTimeout(() => inputs.current[0]?.focus(), 100);
    };

    const handleResend = async () => {
        if (isResending || timer > 0) return;
        try {
            setIsResending(true);
            clearOtpInputs();
            setTimer(60);

            const res = await axios.post('https://rohitsbackend.onrender.com/send-otp', { email, name });

            if (res.data.success) Toast('OTP sent successfully');
            else {
                Toast(res.data.message || 'Failed to resend OTP');
                setTimer(0);
            }
        } catch (err: any) {
            console.error('Resend OTP error:', err);
            Toast(err?.response?.data?.message || err?.message || 'Error resending OTP');
            setTimer(0);
        } finally {
            setIsResending(false);
        }
    };

    const handleVerify = async () => {
        const otpCode = otp.join('');
        if (otpCode.length !== 6) {
            Toast('Please enter complete OTP');
            return;
        }
        if (isLoading) return;

        try {
            setIsLoading(true);
            dispatch(Reducers.setLoading(true));

            const res = await axios.post('https://rohitsbackend.onrender.com/verify-otp', { email, otp: otpCode, name });

            if (res.data.success) {
                Toast('OTP verified successfully');
                await handleSignUp();
            } else {
                Toast(res.data.message || 'Invalid OTP');
                clearOtpInputs();
            }
        } catch (err: any) {
            console.error('Verify OTP error:', err);
            clearOtpInputs();
        } finally {
            setIsLoading(false);
            dispatch(Reducers.setLoading(false));
        }
    };

    const handleSignUp = async () => {
        try {
            const res = await signUpWithEmail(email, password);

            if (res.success) {
                await saveUser(email);
                dispatch(Reducers.setUser(true));

                const tokenStored = await addTokenToDB();
                if (!tokenStored) console.warn('Token storage failed, but signup was successful');

                Toast('Account created successfully');
                navigation.replace('Login');
            } else {
                Toast(res.error?.message || 'Account creation failed');
                console.error('Firebase signup error:', res.error);
            }
        } catch (err: any) {
            console.error('Signup error:', err);
            Toast(err?.message || 'Account creation failed');
        }
    };

    const isOtpComplete = otp.every(digit => digit !== '');

    return (
        <View style={styles.container}>
            <Image style={styles.img} source={require('../img/Media.jpg')} />
            <Text style={styles.emailText}>Sent to {email}</Text>

            <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                    <View
                        key={index}
                        style={[
                            styles.inputWrapper,
                            digit !== '' && styles.inputWrapperFilled
                        ]}
                    >
                        <TextInput
                            ref={(ref: any) => (inputs.current[index] = ref)}
                            style={styles.input}
                            keyboardType="number-pad"
                            maxLength={1}
                            value={digit}
                            onChangeText={(text) => handleChange(text, index)}
                            onKeyPress={(e) => handleKeyPress(e, index)}
                            editable={!isLoading}
                            selectTextOnFocus
                        />
                    </View>
                ))}
            </View>

            <TouchableOpacity
                style={[styles.verifyBtn, (!isOtpComplete || isLoading) && styles.disabledBtn]}
                onPress={handleVerify}
                disabled={!isOtpComplete || isLoading}
            >
                <Text style={styles.verifyText}>{isLoading ? 'Verifying...' : 'Verify OTP'}</Text>
            </TouchableOpacity>

            <View style={styles.resendContainer}>
                {timer > 0 ? (
                    <Text style={styles.timerText}>Resend OTP in {timer}s</Text>
                ) : (
                    <TouchableOpacity onPress={handleResend} disabled={isResending}>
                        <Text style={[styles.resendText, isResending && styles.disabledText]}>
                            {isResending ? 'Sending...' : 'Resend OTP'}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'flex-start', alignItems: 'center', padding: 20, backgroundColor: 'white', paddingTop: '25%' },
    emailText: { marginBottom: 30, color: 'black', fontSize: 16, textAlign: 'center' },
    otpContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 40, width: '100%', maxWidth: 280 },
    inputWrapper: {
        width: 45,
        height: 45,
        marginHorizontal: 4,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#ddd',
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputWrapperFilled: { borderColor: '#007AFF' },
    input: { fontSize: 20, fontWeight: 'bold', color: '#333', textAlign: 'center', width: '100%', height: '100%', padding: 0 },
    verifyBtn: { backgroundColor: '#007AFF', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 12, marginBottom: 20, minWidth: 200 },
    disabledBtn: { backgroundColor: '#ccc' },
    verifyText: { color: '#fff', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
    resendContainer: { marginTop: 10, alignItems: 'center' },
    timerText: { color: 'black', fontSize: 16 },
    resendText: { color: 'red', fontSize: 16, fontWeight: '600' },
    disabledText: { color: '#ccc' },
    img: { height: 100, width: 150, alignSelf: 'center', marginBottom: 20 },
});

export default OTP;
