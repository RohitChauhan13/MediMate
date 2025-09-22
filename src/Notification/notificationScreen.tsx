import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import Ionicons from '@react-native-vector-icons/ionicons';
import axios from 'axios';
import { getUser } from '../../AsyncStorage/asyncStorage';
import Toast from '../Components/Toast';

interface NData {
    id: number;
    notificationtitle: string;
    notificationbody: string;
    notificationfor: string;
    createdat: string;
}

const NotificationScreen = () => {
    const [nData, setNData] = useState<NData[]>([])
    const [username, setUsername] = useState('');
    const navigation = useNavigation();

    const getNotifications = async () => {
        try {
            if (!username) {
                console.log('Username not available yet');
                return;
            }

            const result = await axios.get(`https://rohitsbackend.onrender.com/notifications/${username}`);
            if (result.data.success) {
                setNData(result.data.notifications);
            }
            if (result.data.message === 'No notifications available for you') {
                Toast('No notification available for you now')
            }
        } catch (error) {
            console.log("Error in getNotifications : ", error);
        }
    }

    const getUserEmail = async () => {
        try {
            const email = await getUser();
            if (email) {
                setUsername(email);
            } else {
                console.log('No user email found')
            }
        } catch (error) {
            console.log("Error in getUserEmail : ", error)
        }
    }

    useEffect(() => {
        getUserEmail();
    }, [])

    useEffect(() => {
        if (username) {
            getNotifications();
        }
    }, [username])

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid Date';
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    const renderNotification = ({ item }: { item: NData }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.title}>{item.notificationtitle}</Text>
                <Text style={styles.date}>{formatDate(item.createdat)}</Text>
            </View>
            <Text style={styles.body}>{item.notificationbody}</Text>
        </View>
    );

    const renderEmptyComponent = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="notifications-outline" size={50} color="#ccc" />
            <Text style={styles.emptyText}>No notifications yet</Text>
            <Text style={styles.emptySubtext}>You'll see your notifications here when you receive them</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name='arrow-back' size={30} />
                </TouchableOpacity>
                <Text style={styles.headerText}>Notifications</Text>
            </View>
            <FlatList
                data={nData}
                keyExtractor={item => item.id.toString()}
                renderItem={renderNotification}
                ListEmptyComponent={renderEmptyComponent}
                contentContainerStyle={nData.length === 0 ? styles.emptyListContainer : undefined}
                showsVerticalScrollIndicator={false}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#e1e3e5ff',
        padding: 10
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
        marginLeft: 10,
        marginBottom: 20,
        paddingTop: 10
    },
    headerText: {
        fontSize: 22,
        fontWeight: '600',
        color: '#333'
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        marginVertical: 8,
        marginHorizontal: 4,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        flex: 1,
        marginRight: 10
    },
    date: {
        fontSize: 12,
        color: '#666',
        fontWeight: '400'
    },
    body: {
        fontSize: 14,
        color: '#555',
        lineHeight: 20,
        marginBottom: 8
    },
    category: {
        fontSize: 12,
        color: '#888',
        fontStyle: 'italic'
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 50
    },
    emptyListContainer: {
        flex: 1
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#666',
        marginTop: 16
    },
    emptySubtext: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
        marginTop: 8,
        paddingHorizontal: 40
    }
})

export default NotificationScreen
