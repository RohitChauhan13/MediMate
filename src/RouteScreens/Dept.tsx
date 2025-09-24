import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Modal, KeyboardAvoidingView, Platform } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { TextInput } from 'react-native'
import Ionicons from '@react-native-vector-icons/ionicons'
import AntDesign from '@react-native-vector-icons/ant-design';
import CustomBtnDept from '../Components/CustomeBtnDebt';
import AddDebtModal from '../Screens/AddDebtModal';
import axios from 'axios';
import { getUser } from '../../AsyncStorage/asyncStorage';
import { Reducers, useSelector, useDispatch } from '../../redux/Index';
import { TextInput as TextInputPaper } from 'react-native-paper';
import Toast from '../Components/Toast';
import { Picker } from '@react-native-picker/picker';

interface DeptData {
    id: number;
    name: string;
    amount: number | null;
    mobile: number | null;
    date: string | null;
    status: 'paid' | 'unpaid' | string;
    product: string | null;
}

const Dept = () => {
    const refresh = useSelector(state => state.auth.refresh);
    const dispatch = useDispatch();
    const [searchText, setSearchText] = useState('');
    const searchRef = useRef<TextInput>(null);
    const [paid, setPaid] = useState(false);
    const [unpaid, setUnpaid] = useState(true);
    const [paidData, setPaidData] = useState<DeptData[]>([]);
    const [unpaidData, setUnpaidData] = useState<DeptData[]>([]);
    const [selectedUnpaidDept, setSelectedUnpaidDept] = useState<DeptData | null>(null)
    const [selectedPaidDept, setSelectedPaidDept] = useState<DeptData | null>(null)
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [mobile, setMobile] = useState('');
    const [products, setProducts] = useState('');
    const [showEditUnpaidModal, setShowEditUnpaidModal] = useState(false);
    const [showEditPaidModal, setShowEditPaidModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirmDeletePaidModal, setShowConfirmDeletePaidModal] = useState(false);
    const [showConfirmDeleteUnpaidModal, setShowConfirmDeleteUnpaidModal] = useState(false);


    // Status Modal States
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [selectedStatusDept, setSelectedStatusDept] = useState<DeptData | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<'paid' | 'unpaid'>('unpaid');
    const [isStatusLoading, setIsStatusLoading] = useState(false);

    const fetchPaidCustomers = useCallback(async () => {
        const email = await getUser();
        try {
            const result = await axios.get(`https://rohitsbackend.onrender.com/paid-users/${email}`);
            if (result.data.success) {
                setPaidData(result.data.users || []);
            } else {
                setPaidData([]);
                console.log('no paid users found')
            }
        } catch (error) {
            console.log('error in fetchPaidCustomers: ', error)
        }
    }, [])

    const fetchUnpaidCustomers = useCallback(async () => {
        const email = await getUser();
        try {
            const result = await axios.get(`https://rohitsbackend.onrender.com/unpaid-users/${email}`);
            if (result.data.success) {
                setUnpaidData(result.data.users || []);
            } else {
                setUnpaidData([]);
                console.log('no unpaid users found')
            }
        } catch (error) {
            console.log('error in fetchUnpaidCustomers: ', error)
        }
    }, [])

    useEffect(() => {
        const fetchData = async () => {
            await fetchPaidCustomers();
            await fetchUnpaidCustomers();
        }
        fetchData();
    }, [fetchPaidCustomers, fetchUnpaidCustomers, refresh])

    // Initialize form fields when editing - null safe
    useEffect(() => {
        if (selectedUnpaidDept) {
            setName(selectedUnpaidDept.name || '');
            setAmount(selectedUnpaidDept.amount != null ? String(selectedUnpaidDept.amount) : '');
            setMobile(selectedUnpaidDept.mobile != null ? String(selectedUnpaidDept.mobile) : '');
            setProducts(selectedUnpaidDept.product || '');
        }
    }, [selectedUnpaidDept]);

    useEffect(() => {
        if (selectedPaidDept) {
            setName(selectedPaidDept.name || '');
            setAmount(selectedPaidDept.amount != null ? String(selectedPaidDept.amount) : '');
            setMobile(selectedPaidDept.mobile != null ? String(selectedPaidDept.mobile) : '');
            setProducts(selectedPaidDept.product || '');
        }
    }, [selectedPaidDept]);

    // Clear form fields when modals are closed
    const clearFormFields = () => {
        setName('');
        setAmount('');
        setMobile('');
        setProducts('');
        setSelectedUnpaidDept(null);
        setSelectedPaidDept(null);
    };

    const handleCloseUnpaidModal = () => {
        setShowEditUnpaidModal(false);
        clearFormFields();
    };

    const handleClosePaidModal = () => {
        setShowEditPaidModal(false);
        clearFormFields();
    };

    const handleUpdateUnpaidDept = useCallback(async () => {
        if (!name.trim() || !amount.trim()) {
            Toast('Name and amount are required');
            return;
        }

        if (isNaN(Number(amount)) || Number(amount) <= 0) {
            Toast('Please enter a valid amount');
            return;
        }

        setIsLoading(true);
        const email = await getUser();
        try {
            const result = await axios.put(
                `https://rohitsbackend.onrender.com/update-unpaid-dept/${email}/${selectedUnpaidDept?.id}`,
                {
                    name: name.trim(),
                    amount: Number(amount),
                    mobile: mobile ? Number(mobile) : null,
                    product: products.trim() || null
                }
            );

            if (result.data.success) {
                Toast(result.data.message || 'Debt updated successfully');
                handleCloseUnpaidModal();
                dispatch(Reducers.setRefresh(!refresh));
            } else {
                Toast(result.data.message || 'Failed to update debt');
            }
        } catch (error) {
            console.log('Error updating unpaid debt:', error);
            Toast('Error updating debt');
        } finally {
            setIsLoading(false);
        }
    }, [name, amount, mobile, products, selectedUnpaidDept, refresh, dispatch]);

    const handleUpdatePaidDept = useCallback(async () => {
        if (!name.trim() || !amount.trim()) {
            Toast('Name and amount are required');
            return;
        }

        if (isNaN(Number(amount)) || Number(amount) <= 0) {
            Toast('Please enter a valid amount');
            return;
        }

        setIsLoading(true);
        const email = await getUser();
        try {
            const result = await axios.put(
                `https://rohitsbackend.onrender.com/update-paid-dept/${email}/${selectedPaidDept?.id}`,
                {
                    name: name.trim(),
                    amount: Number(amount),
                    mobile: mobile ? Number(mobile) : null,
                    product: products.trim() || null
                }
            );

            if (result.data.success) {
                Toast(result.data.message || 'Paid debt updated successfully');
                handleClosePaidModal();
                dispatch(Reducers.setRefresh(!refresh));
            } else {
                Toast(result.data.message || 'Failed to update paid debt');
            }
        } catch (error) {
            console.log('Error updating paid debt:', error);
            Toast('Error updating paid debt');
        } finally {
            setIsLoading(false);
        }
    }, [name, amount, mobile, products, selectedPaidDept, refresh, dispatch]);

    // Update status (paid/unpaid)
    const handleUpdateStatus = useCallback(async () => {
        if (!selectedStatusDept) return;

        setIsStatusLoading(true);
        const email = await getUser();

        try {
            const result = await axios.put(
                `https://rohitsbackend.onrender.com/update-dept-status/${email}/${selectedStatusDept.id}`,
                { status: selectedStatus }
            );

            if (result.data.success) {
                Toast(`Status updated to ${selectedStatus}`);
                setShowStatusModal(false);
                setSelectedStatusDept(null);
                dispatch(Reducers.setRefresh(!refresh));
            } else {
                Toast(result.data.message || 'Failed to update status');
            }
        } catch (error) {
            console.log('Error updating status:', error);
            Toast('Error updating status');
        } finally {
            setIsStatusLoading(false);
        }
    }, [selectedStatusDept, selectedStatus, refresh, dispatch]);

    // 🔎 Filtered lists for search
    const filteredPaid = paidData.filter(item =>
        (item.name || '').toLowerCase().includes(searchText.toLowerCase())
    );

    const filteredUnpaid = unpaidData.filter(item =>
        (item.name || '').toLowerCase().includes(searchText.toLowerCase())
    );

    const handlePaidDelete = useCallback(async () => {
        if (!selectedPaidDept) return;

        const email = await getUser();
        try {
            const result = await axios.delete(
                `https://rohitsbackend.onrender.com/delete-paid/${email}/${selectedPaidDept.id}`
            );

            if (result.data.success) {
                Toast('Paid dept deleted successfully');
                setSelectedPaidDept(null);
                fetchPaidCustomers();
                handleClosePaidModal();
                setShowConfirmDeletePaidModal(false);
            } else {
                Toast(result.data.message || 'Failed to delete paid dept');
            }
        } catch (error) {
            console.log('Error in handlePaidDelete : ', error);
            Toast('Error deleting paid dept');
        }
    }, [selectedPaidDept, fetchPaidCustomers]);


    const handleUnpaidDelete = useCallback(async () => {
        if (!selectedUnpaidDept) return;

        const email = await getUser();
        try {
            const result = await axios.delete(
                `https://rohitsbackend.onrender.com/delete-unpaid/${email}/${selectedUnpaidDept.id}`
            );

            if (result.data.success) {
                Toast('Unpaid dept deleted successfully');
                setSelectedUnpaidDept(null);
                fetchUnpaidCustomers();
                handleCloseUnpaidModal()
                setShowConfirmDeleteUnpaidModal(false)
            } else {
                Toast(result.data.message || 'Failed to delete unpaid dept');
            }
        } catch (error) {
            console.log('Error in handleUnpaidDelete : ', error);
            Toast('Error deleting unpaid dept');
        }
    }, [selectedUnpaidDept, fetchUnpaidCustomers]);


    return (
        <View style={styles.container}>
            <View style={styles.SearchCard}>
                <TextInput
                    style={[styles.SearchInput, { width: searchText ? '85%' : '100%' }]}
                    placeholder='Search..'
                    placeholderTextColor={'black'}
                    onChangeText={(text) => setSearchText(text)}
                    ref={searchRef}
                    value={searchText}
                />
                {searchText ? (
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => {
                            searchRef.current?.clear();
                            setSearchText('');
                        }}
                    >
                        <Ionicons name='close-circle-outline' size={25} />
                    </TouchableOpacity>
                ) : null}
            </View>

            <View style={styles.section}>
                <TouchableOpacity
                    style={[styles.btn, { backgroundColor: paid ? '#e1e3e5ff' : 'white' }]}
                    onPress={() => {
                        setUnpaid(false);
                        setPaid(true);
                    }}
                >
                    <Text style={styles.btnText}>Paid</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.btn, { backgroundColor: unpaid ? '#e1e3e5ff' : 'white' }]}
                    onPress={() => {
                        setUnpaid(true);
                        setPaid(false);
                    }}
                >
                    <Text style={styles.btnText}>Unpaid</Text>
                </TouchableOpacity>
            </View>

            {/* Paid List */}
            {paid && (
                <FlatList
                    data={filteredPaid}
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyExtractor={item => item.id?.toString() || Math.random().toString()}
                    ListEmptyComponent={
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={styles.emptyText}>No paid list for now</Text>
                            <Image style={styles.img} source={require('../img/debt-free.png')} />
                        </View>
                    }
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={{ fontSize: 18, color: 'black', fontWeight: '500' }}>{item.name || 'N/A'}</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        onPress={() => {
                                            setSelectedStatusDept(item);
                                            setSelectedStatus((item.status || 'paid').toLowerCase() === 'paid' ? 'paid' : 'unpaid');
                                            setShowStatusModal(true);
                                        }}
                                        style={{ marginRight: 8 }}
                                    >
                                        <Image style={styles.png} source={require('../img/wallet.png')} />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        onPress={() => {
                                            setSelectedPaidDept(item);
                                            setShowEditPaidModal(true);
                                        }}
                                    >
                                        <AntDesign name='edit' size={20} style={{ marginRight: 10 }} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <Text>Amount: {item.amount ?? 'N/A'}</Text>
                            <Text>Mobile: {item.mobile ?? 'N/A'}</Text>
                            <Text>Date: {item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}</Text>
                            <Text>Product: {item.product || 'N/A'}</Text>
                        </View>
                    )}
                />
            )}

            {/* Unpaid List */}
            {unpaid && (
                <FlatList
                    data={filteredUnpaid}
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyExtractor={item => item.id?.toString() || Math.random().toString()}
                    ListEmptyComponent={
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={styles.emptyText}>No unpaid list for now</Text>
                            <Image style={styles.img} source={require('../img/debt-free.png')} />
                        </View>
                    }
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={{ fontSize: 18, color: 'black', fontWeight: '500' }}>{item.name || 'N/A'}</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        onPress={() => {
                                            setSelectedStatusDept(item);
                                            setSelectedStatus((item.status || 'unpaid').toLowerCase() === 'paid' ? 'paid' : 'unpaid');
                                            setShowStatusModal(true);
                                        }}
                                        style={{ marginRight: 8 }}
                                    >
                                        <Image style={styles.png} source={require('../img/wallet.png')} />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        onPress={() => {
                                            setSelectedUnpaidDept(item);
                                            setShowEditUnpaidModal(true);
                                        }}
                                    >
                                        <AntDesign name='edit' size={20} style={{ marginRight: 10 }} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <Text>Amount: {item.amount ?? 'N/A'}</Text>
                            <Text>Mobile: {item.mobile ?? 'N/A'}</Text>
                            <Text>Date: {item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}</Text>
                            <Text>Product: {item.product || 'N/A'}</Text>
                        </View>
                    )}
                />
            )}

            <CustomBtnDept />
            <AddDebtModal />

            {/* Edit Unpaid Modal */}
            <Modal visible={showEditUnpaidModal} transparent animationType='slide'>
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.overlay}>
                    <View style={styles.form}>
                        <Text style={styles.headerText}>Edit Dept</Text>
                        <TextInputPaper mode='outlined' label={'Name *'} value={name} placeholder='Enter name' onChangeText={setName} style={{ marginBottom: 10 }} />
                        <TextInputPaper mode='outlined' label={'Amount *'} value={amount} placeholder='Enter amount' onChangeText={setAmount} keyboardType='number-pad' style={{ marginBottom: 10 }} />
                        <TextInputPaper maxLength={10} mode='outlined' label={'Mobile (Optional)'} value={mobile} placeholder='Enter mobile number' onChangeText={setMobile} keyboardType='number-pad' style={{ marginBottom: 10 }} />
                        <TextInputPaper mode='outlined' label={'Products (Optional)'} value={products} placeholder='Enter products name' onChangeText={setProducts} style={{ marginBottom: 10 }} />
                        <View style={styles.btnContainer}>
                            <TouchableOpacity activeOpacity={0.8} style={[styles.modalBtn, { backgroundColor: '#cab9b9ff' }]} onPress={handleCloseUnpaidModal} disabled={isLoading}>
                                <Text style={styles.modalBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity activeOpacity={0.8} style={[styles.modalBtn, { backgroundColor: 'tomato' }]} disabled={isLoading} onPress={() => setShowConfirmDeleteUnpaidModal(true)}>
                                <Text style={styles.modalBtnText}>Delete</Text>
                            </TouchableOpacity>
                            <TouchableOpacity activeOpacity={0.8} style={[styles.modalBtn, isLoading && { opacity: 0.7 }]} onPress={handleUpdateUnpaidDept} disabled={isLoading}>
                                <Text style={styles.modalBtnText}>{isLoading ? 'Saving...' : 'Save'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* Edit Paid Modal */}
            <Modal visible={showEditPaidModal} transparent animationType='slide'>
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.overlay}>
                    <View style={styles.form}>
                        <Text style={styles.headerText}>Edit Paid Dept</Text>
                        <TextInputPaper mode='outlined' label={'Name *'} value={name} placeholder='Enter name' onChangeText={setName} style={{ marginBottom: 10 }} />
                        <TextInputPaper mode='outlined' label={'Amount *'} value={amount} placeholder='Enter amount' onChangeText={setAmount} keyboardType='number-pad' style={{ marginBottom: 10 }} />
                        <TextInputPaper maxLength={10} mode='outlined' label={'Mobile (Optional)'} value={mobile} placeholder='Enter mobile number' onChangeText={setMobile} keyboardType='number-pad' style={{ marginBottom: 10 }} />
                        <TextInputPaper mode='outlined' label={'Products (Optional)'} value={products} placeholder='Enter products name' onChangeText={setProducts} style={{ marginBottom: 10 }} />
                        <View style={styles.btnContainer}>
                            <TouchableOpacity activeOpacity={0.8} style={[styles.modalBtn, { backgroundColor: '#cab9b9ff' }]} onPress={handleClosePaidModal} disabled={isLoading}>
                                <Text style={styles.modalBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity activeOpacity={0.8} style={[styles.modalBtn, { backgroundColor: 'tomato' }]} disabled={isLoading} onPress={() => setShowConfirmDeletePaidModal(true)}>
                                <Text style={styles.modalBtnText}>Delete</Text>
                            </TouchableOpacity>
                            <TouchableOpacity activeOpacity={0.8} style={[styles.modalBtn, isLoading && { opacity: 0.7 }]} onPress={handleUpdatePaidDept} disabled={isLoading}>
                                <Text style={styles.modalBtnText}>{isLoading ? 'Saving...' : 'Save'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* Status Modal (Paid / Unpaid) */}
            <Modal visible={showStatusModal} transparent animationType='fade' onRequestClose={() => setShowStatusModal(false)}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.overlay}>
                    <View style={styles.form}>
                        <Text style={styles.headerText}>Change Status</Text>
                        <View style={styles.pickerWrapper}>
                            <Picker
                                selectedValue={selectedStatus}
                                onValueChange={(val) => setSelectedStatus(val)}
                                style={styles.picker}
                            >
                                <Picker.Item label='Unpaid' value='unpaid' />
                                <Picker.Item label='Paid' value='paid' />
                            </Picker>
                        </View>

                        <View style={styles.btnContainer}>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={[styles.modalBtn, { backgroundColor: '#cab9b9ff', width: '48%' }]}
                                onPress={() => {
                                    setShowStatusModal(false);
                                    setSelectedStatusDept(null);
                                }}
                                disabled={isStatusLoading}
                            >
                                <Text style={styles.modalBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={[styles.modalBtn, isStatusLoading && { opacity: 0.7 }, { width: '48%' }]}
                                onPress={handleUpdateStatus}
                                disabled={isStatusLoading}
                            >
                                <Text style={styles.modalBtnText}>{isStatusLoading ? 'Saving...' : 'Save'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            <Modal visible={showConfirmDeletePaidModal} transparent animationType='slide'>
                <KeyboardAvoidingView style={styles.overlay}>
                    <View style={styles.form}>
                        <Text style={styles.msg}>Do you really want do delete this paid record?</Text>
                        <View style={styles.btnContainer}>
                            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: 'tomato', width: '48%' }]} onPress={handlePaidDelete}>
                                <Text style={styles.modalBtnText}>Delete</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#b2a0a0ff', width: '48%' }]} onPress={() => setShowConfirmDeletePaidModal(false)}>
                                <Text style={styles.modalBtnText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            <Modal visible={showConfirmDeleteUnpaidModal} transparent animationType='slide'>
                <KeyboardAvoidingView style={styles.overlay}>
                    <View style={styles.form}>
                        <Text style={styles.msg}>Do you really want do delete this unpaid record?</Text>
                        <View style={styles.btnContainer}>
                            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: 'tomato', width: '48%' }]} onPress={handleUnpaidDelete}>
                                <Text style={styles.modalBtnText}>Delete</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#b2a0a0ff', width: '48%' }]} onPress={() => setShowConfirmDeleteUnpaidModal(false)}>
                                <Text style={styles.modalBtnText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#e1e3e5ff'
    },
    SearchInput: {
        borderRadius: 8,
        backgroundColor: 'white',
        paddingLeft: 15,
        height: 40,
    },
    SearchCard: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        marginTop: 10
    },
    card: {
        marginTop: 15,
        borderRadius: 12,
        padding: 10,
        backgroundColor: 'white'
    },
    section: {
        marginTop: 15,
        flexDirection: 'row',
        borderRadius: 12,
        borderWidth: 1,
        padding: 5,
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white'
    },
    btnText: {
        fontSize: 18,
        fontWeight: '500'
    },
    btn: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '50%',
        borderRadius: 13,
        padding: 5
    },
    img: {
        width: 200,
        height: 200,
        resizeMode: 'contain'
    },
    emptyText: {
        marginBottom: 15,
        fontSize: 20,
        fontFamily: 'Merienda-Regular'
    },
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 16
    },
    form: {
        backgroundColor: 'white',
        width: '100%',
        maxWidth: 420,
        borderRadius: 13,
        padding: 20
    },
    headerText: {
        fontSize: 20,
        fontWeight: '500',
        alignSelf: 'center',
        marginBottom: 20
    },
    btnContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10
    },
    modalBtn: {
        backgroundColor: 'lightgreen',
        padding: 12,
        paddingHorizontal: 25,
        borderRadius: 13,
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalBtnText: {
        fontSize: 16,
        fontWeight: 'bold'
    },
    png: {
        width: 20,
        height: 20,
        resizeMode: 'contain',
        marginRight: 10
    },
    pickerWrapper: {
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 12
    },
    picker: {
        height: 60,
        width: '100%',
        backgroundColor: '#f9f9f9'
    },
    msg: {
        fontSize: 20,
        fontWeight: '600',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15
    }
})

export default Dept