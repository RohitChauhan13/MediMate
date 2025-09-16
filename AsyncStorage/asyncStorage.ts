import AsyncStorage from '@react-native-async-storage/async-storage';

// ------------------ USERNAME ------------------
export const saveUser = async (username: string) => {
    try {
        await AsyncStorage.setItem('Username', username);
    } catch (error) {
        console.error("Error saving user:", error);
    }
};

export const getUser = async (): Promise<string | null> => {
    try {
        const user = await AsyncStorage.getItem('Username');
        return user;
    } catch (error) {
        return null;
    }
};

export const removeUser = async () => {
    try {
        await AsyncStorage.removeItem('Username');
    } catch (error) {
        console.error("Error removing user:", error);
    }
};

// ------------------ PROFILE IMAGE ------------------
export const saveProfileImage = async (uri: string) => {
    try {
        await AsyncStorage.setItem('ProfileImage', uri);
    } catch (error) {
        console.error("Error saving profile image:", error);
    }
};

export const getProfileImage = async (): Promise<string | null> => {
    try {
        const uri = await AsyncStorage.getItem('ProfileImage');
        return uri;
    } catch (error) {
        console.error("Error getting profile image:", error);
        return null;
    }
};

export const removeProfileImage = async () => {
    try {
        await AsyncStorage.removeItem('ProfileImage');
    } catch (error) {
        console.error("Error removing profile image:", error);
    }
};

// ------------------ USER FULL NAME ------------------
export const saveUserFullName = async (fullName: string) => {
    try {
        await AsyncStorage.setItem('UserFullName', fullName);
    } catch (error) {
        console.error("Error saving user full name:", error);
    }
};

export const getUserFullName = async (): Promise<string | null> => {
    try {
        const fullName = await AsyncStorage.getItem('UserFullName');
        return fullName;
    } catch (error) {
        console.error("Error getting user full name:", error);
        return null;
    }
};

export const removeUserFullName = async () => {
    try {
        await AsyncStorage.removeItem('UserFullName');
    } catch (error) {
        console.error("Error removing user full name:", error);
    }
};


export const saveNewName = async (newName: string) => {
    try {
        await AsyncStorage.setItem('newName', newName);
    } catch (error) {
        console.error("Error saving user:", error);
    }
};

export const getNewName = async (): Promise<string | null> => {
    try {
        const user = await AsyncStorage.getItem('newName');
        return user;
    } catch (error) {
        return null;
    }
};

export const removeNewName = async () => {
    try {
        await AsyncStorage.removeItem('newName');
    } catch (error) {
        console.error("Error removing user:", error);
    }
};