import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, BackHandler, Alert } from 'react-native';
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

            // Use the email from signup process since user just created account
            const res = await axios.post("https://rohitsbackend.onrender.com/add-token", {
                email: email, // Use email from route params since user just signed up
                token: userToken,
            });

            if (!res.data.success) {
                console.error("Failed to save token:", res.data);
                return false;
            }

            console.log("Token saved successfully:", res.data.data);
            return true;
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
            interval = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [timer]);

    // Auto-focus first input on mount
    useEffect(() => {
        setTimeout(() => {
            inputs.current[0]?.focus();
        }, 100);
    }, []);

    const handleChange = (text: string, index: number) => {
        // Only allow single digits
        if (text.length > 1) {
            text = text.slice(-1);
        }

        if (/^\d$/.test(text) || text === '') {
            const newOtp = [...otp];
            newOtp[index] = text;
            setOtp(newOtp);

            // Auto-focus next input
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

    const clearOtpInputs = () => {
        setOtp(['', '', '', '', '', '']);
        setTimeout(() => {
            inputs.current[0]?.focus();
        }, 100);
    };

    const handleResend = async () => {
        if (isResending || timer > 0) return;

        try {
            setIsResending(true);
            clearOtpInputs();
            setTimer(60);

            const res = await axios.post('https://rohitsbackend.onrender.com/send-otp', {
                email,
                name
            });

            if (res.data.success) {
                Toast(res.data.message || 'OTP sent successfully');
            } else {
                Toast(res.data.message || 'Failed to resend OTP');
                setTimer(0); // Reset timer if failed
            }
        } catch (err: any) {
            console.error('Resend OTP error:', err);
            Toast(err?.response?.data?.message || err?.message || 'Error resending OTP');
            setTimer(0); // Reset timer if failed
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

            const res = await axios.post('https://rohitsbackend.onrender.com/verify-otp', {
                email,
                otp: otpCode,
                name
            });

            if (res.data.success) {
                Toast('OTP verified successfully');

                // First complete signup, then store token
                await handleSignUp();
            } else {
                Toast(res.data.message || 'Invalid OTP');
                clearOtpInputs();
            }
        } catch (err: any) {
            console.error('Verify OTP error:', err);

            if (err.response?.status === 400) {
                Toast(err.response.data?.message || 'Invalid OTP');
            } else if (err.response?.status === 429) {
                Toast('Too many attempts. Please try again later.');
            } else {
                Toast(err?.response?.data?.message || err?.message || 'Verification failed');
            }

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

                // Now that signup is successful, try to store the FCM token
                // This happens after user is created and logged in
                const tokenStored = await addTokenToDB();
                if (!tokenStored) {
                    console.warn('Token storage failed, but signup was successful');
                    // Don't show error to user since signup was successful
                }

                Toast('Account created successfully');
                navigation.replace('Login');
            } else {
                // Handle Firebase auth errors
                const errorCode = res.error?.code;

                if (errorCode === 'auth/email-already-in-use') {
                    Toast('Email address is already in use');
                    navigation.replace('Login');
                } else if (errorCode === 'auth/invalid-email') {
                    Toast('Invalid email address');
                } else if (errorCode === 'auth/weak-password') {
                    Toast('Password is too weak');
                } else {
                    Toast(res.error?.message || 'Account creation failed');
                }

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
            <Text style={styles.header}>Enter OTP</Text>
            <Text style={styles.emailText}>Sent to {email}</Text>

            <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                    <TextInput
                        key={index}
                        ref={(ref: any) => (inputs.current[index] = ref)}
                        style={[
                            styles.input,
                            digit !== '' && styles.inputFilled
                        ]}
                        keyboardType="number-pad"
                        maxLength={1}
                        value={digit}
                        onChangeText={(text) => handleChange(text, index)}
                        onKeyPress={(e) => handleKeyPress(e, index)}
                        editable={!isLoading}
                        selectTextOnFocus
                    />
                ))}
            </View>

            <TouchableOpacity
                style={[
                    styles.verifyBtn,
                    (!isOtpComplete || isLoading) && styles.disabledBtn
                ]}
                onPress={handleVerify}
                disabled={!isOtpComplete || isLoading}
            >
                <Text style={styles.verifyText}>
                    {isLoading ? 'Verifying...' : 'Verify OTP'}
                </Text>
            </TouchableOpacity>

            <View style={styles.resendContainer}>
                {timer > 0 ? (
                    <Text style={styles.timerText}>
                        Resend OTP in {timer}s
                    </Text>
                ) : (
                    <TouchableOpacity
                        onPress={handleResend}
                        disabled={isResending}
                        style={styles.resendButton}
                    >
                        <Text style={[
                            styles.resendText,
                            isResending && styles.disabledText
                        ]}>
                            {isResending ? 'Sending...' : 'Resend OTP'}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#e1e3e5ff'
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333'
    },
    emailText: {
        marginBottom: 30,
        color: '#666',
        fontSize: 16,
        textAlign: 'center'
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 40,
        width: '100%',
        maxWidth: 300
    },
    input: {
        borderBottomWidth: 2,
        borderColor: '#ddd',
        fontSize: 22,
        textAlign: 'center',
        marginHorizontal: 5,
        width: 45,
        height: 50,
        color: '#333',
        fontWeight: 'bold'
    },
    inputFilled: {
        borderColor: '#007AFF',
    },
    verifyBtn: {
        backgroundColor: '#007AFF',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 12,
        marginBottom: 20,
        minWidth: 200,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    disabledBtn: {
        backgroundColor: '#ccc',
        elevation: 0,
        shadowOpacity: 0,
    },
    verifyText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    resendContainer: {
        marginTop: 10,
        alignItems: 'center'
    },
    resendButton: {
        padding: 10
    },
    timerText: {
        color: '#666',
        fontSize: 16
    },
    resendText: {
        color: '#007AFF',
        fontSize: 16,
        fontWeight: '600'
    },
    disabledText: {
        color: '#ccc'
    }
});

export default OTP;