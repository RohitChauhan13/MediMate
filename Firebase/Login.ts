import { getAuth, signInWithEmailAndPassword } from '@react-native-firebase/auth';

export const loginWithEmail = async (email: string, password: string) => {
    try {
        const userCredential = await signInWithEmailAndPassword(getAuth(), email, password);
        return { success: true, user: userCredential.user };
    } catch (error: any) {
        let message = 'Something went wrong';
        if (error.code === 'auth/user-not-found') {
            message = 'No user found with this email';
        } else if (error.code === 'auth/wrong-password') {
            message = 'Incorrect password';
        } else if (error.code === 'auth/invalid-email') {
            message = 'Invalid email format';
        }
        return { success: false, error: { code: error.code, message } };
    }
};
