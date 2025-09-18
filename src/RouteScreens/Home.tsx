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
import { Alert } from 'react-native';
import { onDisplayNotification } from '../Notification/notifee';
import { checkAndRequestPermissions } from '../permissions/permissionAsk';

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
    const dispatch = useDispatch();

    useEffect(() => {
        const requestPerms = async () => {
            const granted = await checkAndRequestPermissions();
            if (!granted) {
                console.log("Some permissions not granted. Will ask again next time.");
            }
        };
        requestPerms();
    }, []);

    useEffect(() => {
        const setupNotifications = async () => {
            const hasPermission = await requestNotificationPermission();
            if (hasPermission) {
                const token = await getFcmToken();
            }
        };
        setupNotifications();
    }, []);

    useEffect(() => {
        const unsubscribe = messaging().onMessage(async remoteMessage => {
            console.log('Foreground Message:', remoteMessage);
            onDisplayNotification(remoteMessage?.notification?.title || '', remoteMessage?.notification?.body || '');
        });

        return unsubscribe;
    }, []);

    const fetchUsers = useCallback(async () => {
        dispatch(Reducers.setLoading(true));
        try {
            setLoading(true);
            const res = await axios.get('https://rohitsbackend.onrender.com/users');
            if (res.data.success) {
                // Sort by ID in descending order to show newest first
                const sortedUsers = res.data.users.sort((a: any, b: any) => b.id - a.id);
                setData(sortedUsers);
                setFilteredData(sortedUsers);
            }
        } catch (err: any) {
            console.log('Fetch error:', err.message);
            Toast('Failed to fetch users');
        } finally {
            setLoading(false);
            dispatch(Reducers.setLoading(false));
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers, refresh]);

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

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                        <Image source={require('../img/logo.png')} style={styles.imgLogo} />
                        <Text style={styles.title}>Medimate</Text>
                        <Text style={styles.tagLine}>made with  ♡</Text>
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
                        ListEmptyComponent={<Text style={styles.empty}>No Customers Found</Text>}
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
                                Toast(err.message || 'Something went wrong');
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
                                Toast(err.message || 'Something went wrong');
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