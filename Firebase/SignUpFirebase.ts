import { getAuth, createUserWithEmailAndPassword } from '@react-native-firebase/auth';

export const signUpWithEmail = async (email: string, password: string) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(getAuth(), email, password);
        console.log('User account created & signed in!', userCredential.user);
        return { success: true, user: userCredential.user };
    } catch (error: any) {
        return { success: false, error };
    }
};
