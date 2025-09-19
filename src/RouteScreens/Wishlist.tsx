import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Alert,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    RefreshControl,
    TextInput as TI
} from 'react-native';
import { TextInput } from 'react-native-paper';
import CustomeBtnWishlist from '../Components/CustomeBtnWishlist';
import AddItemsToWishlist from '../Screens/AddItemsToWishlist';
import EditWishlistModal from '../Screens/EditWishlistModal';
import axios from 'axios';
import { useSelector, useDispatch, Reducers } from '../../redux/Index';
import AntDesign from '@react-native-vector-icons/ant-design';
import { getUser } from '../../AsyncStorage/asyncStorage';

type Wishlist = {
    id: number;
    name: string;
    medicines: string;
    mobile: string;
    qty: number;
    created_at: string;
};

const Add = () => {
    const [data, setData] = useState<Wishlist[]>([]);
    const [filteredData, setFilteredData] = useState<Wishlist[]>([]);
    const [selectedItem, setSelectedItem] = useState<Wishlist | null>(null);
    const [editVisible, setEditVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState<string>('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [username, setUsername] = useState<string | null>(null);

    const refresh = useSelector((state: any) => state.auth.refresh);
    const dispatch = useDispatch();

    useEffect(() => {
        const getUserName = async () => {
            const email = await getUser();
            setUsername(email);
        }
        getUserName();
    }, [])

    const fetchWishlist = async () => {
        try {
            if (!refreshing) setRefreshing(true);
            const res = await axios.get(`https://rohitsbackend.onrender.com/show-wishlist/${username}`);
            if (res.data.success) {
                const sorted = res.data.data.sort(
                    (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );
                setData(sorted);
                setFilteredData(sorted);
            }
        } catch (error) {
            Alert.alert('Something went wrong', 'Please check your internet connection');
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
        if (refresh) {
            dispatch(Reducers.setRefresh(false));
        }
    }, [refresh]);

    // search + sort filter logic
    useEffect(() => {
        let temp = [...data];

        // search filter
        if (search.trim() !== '') {
            const lower = search.toLowerCase();
            temp = temp.filter(
                (item) =>
                    item.name.toLowerCase().includes(lower) ||
                    item.medicines.toLowerCase().includes(lower) ||
                    (item.mobile && item.mobile.toLowerCase().includes(lower))
            );
        }

        // sort filter
        temp.sort((a, b) => {
            const dateA = new Date(a.created_at).getTime();
            const dateB = new Date(b.created_at).getTime();
            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });

        setFilteredData(temp);
    }, [data, search, sortOrder]);

    const renderItem = ({ item }: { item: Wishlist }) => {
        const formattedDate = new Date(item.created_at).toDateString();
        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => {
                    setSelectedItem(item);
                    setEditVisible(true);
                }}
            >
                <Text style={styles.title}>{item.name}</Text>
                <Text>Medicines: {item.medicines}</Text>
                <Text>Mobile: {item.mobile || 'not available'}</Text>
                <Text>Quantity: {item.qty || 'not available'}</Text>
                <Text>Date: {formattedDate}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#e1e3e5ff' }}>
            {/* Search + Sort Row */}
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    margin: 10,
                    marginTop: 20,
                    gap: 10
                }}
            >
                <TI
                    placeholder="Search wishlist..."
                    value={search}
                    onChangeText={setSearch}
                    placeholderTextColor={'black'}
                    style={[styles.search, { width: search ? '55%' : '65%' }]}
                />
                {search ? (
                    <TouchableOpacity onPress={() => setSearch('')}>
                        <AntDesign name="close-circle" size={30} />
                    </TouchableOpacity>
                ) : null}
                <TouchableOpacity
                    style={styles.sortBtn}
                    onPress={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                    <AntDesign
                        name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'}
                        size={20}
                        color="black"
                    />
                    <Text style={{ color: 'black', marginLeft: 5 }}>
                        {sortOrder === 'asc' ? 'Oldest' : 'Newest'}
                    </Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={filteredData}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={{ padding: 15 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={fetchWishlist} />
                }
                ListEmptyComponent={
                    <View style={{ flex: 1, marginTop: 50 }}>
                        <Text style={{ alignSelf: 'center', fontSize: 20, color: '#555' }}>
                            No data available
                        </Text>
                    </View>
                }
            />

            <CustomeBtnWishlist />
            <AddItemsToWishlist />

            {/* Edit / Delete Modal */}
            <EditWishlistModal
                visible={editVisible}
                item={selectedItem}
                onClose={() => setEditVisible(false)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        elevation: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#333',
    },
    search: {
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 8,
        fontSize: 18,
        paddingLeft: 25,
        elevation: 8
    },
    sortBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#eec841ff',
        paddingHorizontal: 10,
        paddingVertical: 10,
        borderRadius: 8,
        elevation: 10,
    },
});

export default Add;
