import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    TouchableOpacity,
    RefreshControl,
    Image,
} from 'react-native';
import { TextInput as TI } from 'react-native';
import CustomeBtn from '../Components/CustomeBtn';
import AddCustomerModal from '../Screens/AddCustomerModal';
import CustomerDetailsModal from '../Screens/CustomerDetailsModal';
import axios from 'axios';
import { useSelector, useDispatch, Reducers } from '../../redux/Index';
import Toast from '../Components/Toast';
import AntDesign from '@react-native-vector-icons/ant-design';
import { requestNotificationPermission, getFcmToken } from '../Notification/notificationServise';
import messaging from '@react-native-firebase/messaging';
import { onDisplayNotification } from '../Notification/notifee';
import { checkAndRequestPermissions } from '../permissions/permissionAsk';
import { getUser } from '../../AsyncStorage/asyncStorage';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation, NavigationContainerProps } from '@react-navigation/native';

interface Customer {
    id: number;
    name: string;
    medicines: string;
    address?: string;
    mobile: string;
    email?: string;
}

const Home: React.FC = () => {
    const [data, setData] = useState<Customer[]>([]);
    const [filteredData, setFilteredData] = useState<Customer[]>([]);
    const [search, setSearch] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const refresh = useSelector((state: any) => state.auth.refresh);
    const [selectedUser, setSelectedUser] = useState<Customer | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const dispatch = useDispatch();
    const navigation = useNavigation();

    // First get username
    useEffect(() => {
        const getUserName = async () => {
            try {
                const email = await getUser();
                console.log('Retrieved email:', email);
                setUsername(email);
            } catch (error) {
                console.error('Error getting user email:', error);
                Toast('Failed to get user email');
            }
        }
        getUserName();
    }, [])

    // Setup permissions and notifications
    useEffect(() => {
        const requestPerms = async () => {
            const granted = await checkAndRequestPermissions();
            if (!granted) {
                console.log("Some permissions not granted. Will ask again next time.");
            }
        };
        requestPerms();
    }, []);

    // Register FCM token for multi-device support
    useEffect(() => {
        const setupNotifications = async () => {
            if (!username) return;

            const hasPermission = await requestNotificationPermission();
            if (hasPermission) {
                try {
                    const token = await getFcmToken();
                    if (token) {
                        // Register this device's token with the user's email
                        const response = await axios.post(
                            'https://rohitsbackend.onrender.com/add-token',
                            {
                                email: username,
                                token: token
                            }
                        );

                        if (response.data.success) {
                            console.log('Token registered successfully');
                        } else {
                            console.log('Token registration failed:', response.data.message);
                        }
                    }
                } catch (error) {
                    console.error('Error registering token:', error);
                }
            }
        };

        setupNotifications();
    }, [username]);

    // Handle token refresh
    useEffect(() => {
        if (!username) return;

        const unsubscribe = messaging().onTokenRefresh(async (newToken) => {
            try {
                // First remove old token if exists
                const oldToken = await getFcmToken();
                if (oldToken && oldToken !== newToken) {
                    await axios.delete('https://rohitsbackend.onrender.com/remove-token', {
                        data: { email: username, token: oldToken }
                    });
                }

                // Add new token
                await axios.post('https://rohitsbackend.onrender.com/add-token', {
                    email: username,
                    token: newToken
                });

                console.log('Token refreshed successfully');
            } catch (error) {
                console.error('Error refreshing token:', error);
            }
        });

        return unsubscribe;
    }, [username]);

    // Clean up token on logout
    useEffect(() => {
        return () => {
            // This cleanup function will run when component unmounts
            const cleanupToken = async () => {
                if (username) {
                    try {
                        const token = await getFcmToken();
                        if (token) {
                            await axios.delete('https://rohitsbackend.onrender.com/remove-token', {
                                data: { email: username, token: token }
                            });
                        }
                    } catch (error) {
                        console.error('Error removing token on cleanup:', error);
                    }
                }
            };

            // Only clean up if user is logging out, not on app background
            // You might want to handle this differently based on your logout flow
        };
    }, [username]);

    useEffect(() => {
        const unsubscribe = messaging().onMessage(async remoteMessage => {
            console.log('Foreground Message:', remoteMessage);
            await saveNotificationIntoDb(remoteMessage?.notification?.title || '', remoteMessage?.notification?.body || '')
            onDisplayNotification(remoteMessage?.notification?.title || '', remoteMessage?.notification?.body || '');
        });

        return unsubscribe;
    }, []);

    const saveNotificationIntoDb = useCallback(async (title: string, body: string) => {
        try {
            const email = await getUser();
            if (!email) {
                console.log('Cannot get email from asyncStorage');
                return;
            }

            const result = await axios.post(
                `https://rohitsbackend.onrender.com/add-notification/${email}`,
                {
                    title,
                    body
                }
            );

            if (result.data.success) {
                console.log('Successfully notification saved');
            } else {
                console.log('Error while storing notification');
            }
        } catch (error) {
            console.log('Error in saveNotificationIntoDb : ', error);
        }
    }, []);

    const fetchUsers = useCallback(async () => {
        if (!username) {
            console.log('No username available, skipping fetch');
            return;
        }

        dispatch(Reducers.setLoading(true));
        try {
            setLoading(true);
            console.log('Fetching users for:', username);

            const res = await axios.get(`https://rohitsbackend.onrender.com/users/${username}`);

            if (res.data.success) {
                // Sort by ID in descending order to show newest first
                const sortedUsers = res.data.users.sort((a: any, b: any) => b.id - a.id);
                setData(sortedUsers);
                setFilteredData(sortedUsers);
                console.log('Users fetched successfully:', sortedUsers.length);
            } else {
                console.log('API returned success false:', res.data.message);
                Toast(res.data.message || 'Failed to fetch users');
            }
        } catch (err: any) {
            console.error('Fetch error:', err);
            if (err.response) {
                console.error('Error response:', err.response.data);
                Toast(err.response.data.message || 'Failed to fetch users');
            } else {
                Toast('Network error. Please check your internet connection.');
            }
        } finally {
            setLoading(false);
            dispatch(Reducers.setLoading(false));
        }
    }, [username, dispatch]);

    // Fetch users only when username is available
    useEffect(() => {
        if (username) {
            fetchUsers();
        }
    }, [username, refresh, fetchUsers]);

    // Search filter
    useEffect(() => {
        if (search.trim() === '') {
            setFilteredData(data);
        } else {
            const lower = search.toLowerCase();
            const filtered = data.filter(
                (item) =>
                    item.name.toLowerCase().includes(lower) ||
                    item.medicines.toLowerCase().includes(lower) ||
                    item.mobile.toLowerCase().includes(lower) ||
                    (item.email && item.email.toLowerCase().includes(lower))
            );
            setFilteredData(filtered);
        }
    }, [data, search]);

    const handleSearch = (text: string) => {
        setSearch(text);
    };

    const renderItem = ({ item }: { item: Customer }) => (
        <TouchableOpacity onPress={() => setSelectedUser(item)}>
            <View style={styles.card}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.sub}>Medicines: {item.medicines}</Text>
                <Text style={styles.sub}>Mobile: {item.mobile}</Text>
                <Text style={styles.sub}>Email: {item.email || 'N/A'}</Text>
                <Text style={styles.sub}>Address: {item.address || 'N/A'}</Text>
            </View>
        </TouchableOpacity>
    );

    // Show loading state while username is being fetched
    if (!username) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={styles.title}>Loading...</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, alignItems: 'center' }}>
                        <View style={{ flexDirection: 'row' }}>
                            <Image source={require('../img/Media2.png')} style={styles.imgLogo} />
                            <Text style={styles.title}>Medimate</Text>
                            <Text style={styles.tagLine}>made with  ♡</Text>
                        </View>
                        <TouchableOpacity activeOpacity={0.7}
                            onPress={() => navigation.navigate('Notification')}
                        >
                            <Ionicons name='notifications-sharp' size={30} style={{ marginRight: 10 }} />
                        </TouchableOpacity>
                    </View>
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginBottom: 10,
                        gap: search ? 10 : 0
                    }}>
                        <TI
                            placeholder="Search customer.."
                            value={search}
                            placeholderTextColor={'black'}
                            onChangeText={handleSearch}
                            style={[styles.search, { width: search ? "85%" : '100%' }]}
                        />
                        <TouchableOpacity activeOpacity={0.7}
                            onPress={() => setSearch('')}
                        >
                            {
                                !search ? null :
                                    <AntDesign name='close-circle' size={35} />
                            }
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={filteredData}
                        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                        renderItem={renderItem}
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={{ paddingBottom: 10 }}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <Text style={styles.empty}>
                                {loading ? 'Loading customers...' : 'No Customers Found'}
                            </Text>
                        }
                        refreshControl={
                            <RefreshControl refreshing={loading} onRefresh={fetchUsers} />
                        }
                    />

                    {/* Floating Action Btns */}
                    <CustomeBtn />
                    <AddCustomerModal />

                    {/* Details Modal with Modify & Delete */}
                    <CustomerDetailsModal
                        user={selectedUser}
                        onClose={() => setSelectedUser(null)}
                        onModify={async (updatedUser) => {
                            dispatch(Reducers.setLoading(true));
                            try {
                                const res = await axios.put(
                                    'https://rohitsbackend.onrender.com/update',
                                    updatedUser
                                );
                                if (res.data.success) {
                                    Toast('Customer updated successfully');
                                    setSelectedUser(null);
                                    dispatch(Reducers.setRefresh(!refresh));
                                } else {
                                    Toast('Update failed');
                                }
                            } catch (err: any) {
                                Toast(err.response?.data?.message || err.message || 'Something went wrong');
                            } finally {
                                dispatch(Reducers.setLoading(false));
                            }
                        }}
                        onDelete={async (id) => {
                            dispatch(Reducers.setLoading(true));
                            try {
                                const res = await axios.delete(
                                    'https://rohitsbackend.onrender.com/delete',
                                    {
                                        data: { id },
                                    }
                                );
                                if (res.data.success) {
                                    Toast('Customer deleted successfully');
                                    setSelectedUser(null);
                                    dispatch(Reducers.setRefresh(!refresh));
                                } else {
                                    Toast('Delete failed');
                                }
                            } catch (err: any) {
                                Toast(err.response?.data?.message || err.message || 'Something went wrong');
                            } finally {
                                dispatch(Reducers.setLoading(false));
                            }
                        }}
                    />
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 10,
        paddingTop: 10,
        backgroundColor: '#e1e3e5ff',
    },
    search: {
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 8,
        fontSize: 18,
        paddingLeft: 25,
        elevation: 8
    },
    card: {
        backgroundColor: 'white',
        padding: 15,
        marginBottom: 10,
        borderRadius: 10,
        elevation: 8,
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    sub: {
        fontSize: 14,
        color: 'black',
    },
    empty: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
        color: 'black',
    },
    imgLogo: {
        width: 50,
        height: 50,
        borderRadius: 50,
        marginRight: 10,
    },
    title: {
        fontSize: 28,
        fontFamily: 'Merienda-Regular',
        fontWeight: '600',
        color: 'black',
    },
    tagLine: {
        marginTop: 18,
        marginLeft: 3,
        fontFamily: 'GreatVibes-Regular',
        fontSize: 20
    }
});

export default Home;