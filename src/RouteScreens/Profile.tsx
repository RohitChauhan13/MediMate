import { View, Text, TouchableOpacity, StyleSheet, Image, Modal, PermissionsAndroid } from 'react-native';
import React, { useState, useEffect } from 'react';
import { getNewName, saveNewName, removeNewName, removeUser, saveProfileImage, getProfileImage, removeProfileImage, getUserFullName, getUser, removeUserFullName } from '../../AsyncStorage/asyncStorage';
import { Reducers, useDispatch } from '../../redux/Index';
import AntDesign from '@react-native-vector-icons/ant-design';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { setUser } from '../../redux/MySlice';
import { TextInput } from 'react-native-paper';
import Toast from '../Components/Toast';
import axios from 'axios';

const Profile = () => {
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [imgUrl, setImgUrl] = useState('');
    const [logoutModalVisible, setLogoutModalVisible] = useState(false);
    const [imageModalVisible, setImageModalVisible] = useState(false);
    const [changeNameModalVisible, setChangeNameModalVisible] = useState(false);
    const [newFullName, setNewFullName] = useState('');

    const dispatch = useDispatch();

    useEffect(() => {
        const loadData = async () => {
            const uri = await getProfileImage();
            if (uri) setImgUrl(uri);

            const name = await getUserFullName();
            if (name) setFullName(name);

            const nm = await getUser();
            if (nm) setUsername(nm);

            const newName = await getNewName();
            if (newName) setNewFullName(newName);
        };
        loadData();
    }, []);

    const removeTokenFromDB = async () => {
        try {
            const userEmail = await getUser();
            if (!userEmail) {
                console.log("User email not found");
                return false;
            }
            const result = await axios.delete("https://rohitsbackend.onrender.com/remove-token", {
                data: { email: userEmail },
            });
            if (result.data.success) {
                console.log("Token removed:", result.data);
                return true;
            } else {
                return false;
            }

        } catch (error: any) {
            console.error("Error in removeTokenFromDB:", error.response?.data || error.message);
            return false;
        }
    };


    const handleLogout = async () => {
        dispatch(Reducers.setLoading(true));
        await removeTokenFromDB();
        await removeUser();
        await removeProfileImage();
        await removeUserFullName();
        await removeNewName();
        dispatch(Reducers.setUser(false));
        dispatch(Reducers.setLoading(false));
        setLogoutModalVisible(false);
    };

    const requestCameraPermission = async () => {
        const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
        return result === PermissionsAndroid.RESULTS.GRANTED;
    };

    const pickImage = async (source: 'camera' | 'gallery') => {
        if (source === 'camera') {
            const hasPermission = await requestCameraPermission();
            if (!hasPermission) return;
            launchCamera({ mediaType: 'photo', quality: 0.7 }, handleImageResponse);
        } else {
            launchImageLibrary({ mediaType: 'photo', quality: 1 }, handleImageResponse);
        }
        setImageModalVisible(false);
    };

    const handleImageResponse = async (response: any) => {
        if (response.assets && response.assets.length > 0) {
            const uri = response.assets[0].uri || '';
            setImgUrl(uri);
            await saveProfileImage(uri);
        }
    };

    const handleRemoveImage = async () => {
        setImgUrl('');
        await removeProfileImage();
        setImageModalVisible(false);
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.header}>Profile</Text>
                <TouchableOpacity
                    onPress={() => setImageModalVisible(true)}
                    style={styles.profileImageContainer}
                >
                    {imgUrl ? (
                        <Image source={{ uri: imgUrl }} style={styles.profileImage} />
                    ) : (
                        <AntDesign name='user' size={120} color="black" />
                    )}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setChangeNameModalVisible(true)} style={{ marginTop: 10 }}>
                    {
                        newFullName ?
                            <Text style={styles.fullNameText}>{newFullName}</Text>
                            :
                            fullName ?
                                <Text style={styles.fullNameText}>{fullName}</Text>
                                :
                                username ?
                                    <Text style={styles.fullNameText}>{username}</Text>
                                    :
                                    null
                    }
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.logoutBtn} onPress={() => setLogoutModalVisible(true)}>
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>

            {/* Logout Modal */}
            <Modal
                transparent
                animationType="fade"
                visible={logoutModalVisible}
                onRequestClose={() => setLogoutModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalText}>Are you sure you want to logout?</Text>
                        <View style={styles.modalButtonsColumn}>
                            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: 'tomato' }]} onPress={handleLogout}>
                                <Text style={styles.modalBtnText}>Yes</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#ccc' }]} onPress={() => setLogoutModalVisible(false)}>
                                <Text style={[styles.modalBtnText, { color: '#333' }]}>No</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Image Modal */}
            <Modal
                transparent
                animationType="fade"
                visible={imageModalVisible}
                onRequestClose={() => setImageModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalText}>Select Image Source</Text>
                        <View style={styles.modalButtonsColumn}>
                            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#4caf50' }]} onPress={() => pickImage('camera')}>
                                <Text style={styles.modalBtnText}>Camera</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#2196f3' }]} onPress={() => pickImage('gallery')}>
                                <Text style={styles.modalBtnText}>Gallery</Text>
                            </TouchableOpacity>
                            {imgUrl ? (
                                <TouchableOpacity style={[styles.modalBtn, { backgroundColor: 'tomato' }]} onPress={handleRemoveImage}>
                                    <Text style={styles.modalBtnText}>Remove</Text>
                                </TouchableOpacity>
                            ) : null}
                            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#ccc' }]} onPress={() => setImageModalVisible(false)}>
                                <Text style={[styles.modalBtnText, { color: '#333' }]}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* change name modal */}
            <Modal
                transparent
                animationType="fade"
                visible={changeNameModalVisible}
                onRequestClose={() => setChangeNameModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalText}>Change Your Name</Text>
                        <TextInput
                            autoFocus={true}
                            mode='outlined'
                            placeholder="Enter new name"
                            value={newFullName}
                            onChangeText={setNewFullName}
                            style={styles.input}
                            placeholderTextColor="black"
                        />
                        <View style={styles.modalButtonsColumn}>
                            <TouchableOpacity
                                style={[styles.modalBtn, { backgroundColor: '#4caf50' }]}
                                onPress={async () => {
                                    if (newFullName.trim() === '') {
                                        Toast('Please provide new name');
                                        return
                                    }
                                    setFullName(newFullName.trim());
                                    await saveNewName(newFullName);
                                    setChangeNameModalVisible(false);
                                }}
                            >
                                <Text style={styles.modalBtnText}>Save</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalBtn, { backgroundColor: '#ccc' }]}
                                onPress={() => setChangeNameModalVisible(false)}
                            >
                                <Text style={[styles.modalBtnText, { color: '#333' }]}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, justifyContent: 'space-between', backgroundColor: '#e1e3e5ff' },
    content: { alignItems: 'center', marginTop: 50 },
    header: { fontSize: 24, fontWeight: 'bold', color: 'black' },
    profileImageContainer: { justifyContent: 'center', alignItems: 'center', marginTop: 20, borderRadius: 100, width: 200, height: 200, overflow: 'hidden', elevation: 10 },
    profileImage: { width: '100%', height: '100%', borderRadius: 100 },
    logoutBtn: { backgroundColor: 'tomato', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
    logoutText: { color: 'black', fontSize: 18, fontWeight: 'bold' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContainer: { width: '80%', backgroundColor: '#fff', borderRadius: 10, padding: 20, alignItems: 'center' },
    modalText: { fontSize: 18, marginBottom: 20, textAlign: 'center' },
    modalButtonsColumn: { flexDirection: 'column', justifyContent: 'center', width: '100%' },
    modalBtn: { width: '100%', marginVertical: 8, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
    modalBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    fullNameText: { marginTop: 15, fontSize: 20, fontWeight: 'bold', color: '#333' },
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        marginBottom: 15,
        fontSize: 16,
        color: '#000',
    },

});

export default Profile;
