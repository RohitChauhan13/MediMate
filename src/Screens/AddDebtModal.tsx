import { View, Text, Modal, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView } from 'react-native'
import React, { useCallback, useState } from 'react';
import { TextInput } from 'react-native-paper';
import { Reducers, useDispatch, useSelector } from '../../redux/Index';
import { getUser } from '../../AsyncStorage/asyncStorage';
import Toast from '../Components/Toast';
import axios from 'axios';

const AddDebtModal = () => {
    const show = useSelector(state => state.auth.addDebtModal)
    const refresh = useSelector(state => state.auth.refresh);
    const dispatch = useDispatch();
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [mobile, setMobile] = useState('');
    const [products, setProducts] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = useCallback(async () => {
        const email = await getUser();

        if (!name.trim() || !amount.trim()) {
            Toast('Name and amount are required');
            return;
        }

        if (isNaN(Number(amount)) || Number(amount) <= 0) {
            Toast('Please enter a valid amount');
            return;
        }

        if (mobile && (isNaN(Number(mobile)) || mobile.length < 10)) {
            Toast('Please enter a valid mobile number');
            return;
        }

        setIsLoading(true);

        try {
            const result = await axios.post(
                `https://rohitsbackend.onrender.com/add-dept/${email}`,
                {
                    name: name.trim(),
                    amount: Number(amount),
                    mobile: mobile ? Number(mobile) : null,
                    product: products.trim() || null
                }
            );

            if (result.data.success) {
                Toast(result.data.message);
                handleClose();
                dispatch(Reducers.setRefresh(!refresh))
            } else {
                Toast(result.data.message || 'Failed to add debt');
            }
        } catch (error) {
            console.log('Error in handleSave: ', error);
            if (error?.response) {
                Toast(error.response.data.message || 'Server error occurred');
            } else if (error.request) {
                Toast('Network error. Please check your connection');
            } else {
                Toast('Error saving debt');
            }
        } finally {
            setIsLoading(false);
        }
    }, [name, amount, mobile, products, refresh, dispatch]);

    const handleClose = () => {
        if (isLoading) return; // Prevent closing while loading

        setName('');
        setAmount('');
        setMobile('');
        setProducts('');
        dispatch(Reducers.setAddDebtModal(false))
    }

    const validateInput = (text: string, type: 'amount' | 'mobile') => {
        if (type === 'amount') {
            // Allow only numbers and decimal point
            return text.replace(/[^0-9.]/g, '');
        } else if (type === 'mobile') {
            // Allow only numbers for mobile
            return text.replace(/[^0-9]/g, '');
        }
        return text;
    };

    return (
        <Modal visible={show} transparent animationType='slide'>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.overlay}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.form}>
                        <Text style={styles.header}>Add Debt</Text>

                        <TextInput
                            autoFocus={true}
                            mode='outlined'
                            label={'Customer Name *'}
                            placeholder='Enter customer name'
                            value={name}
                            onChangeText={setName}
                            style={styles.input}
                            maxLength={50}
                            disabled={isLoading}
                        />

                        <TextInput
                            mode='outlined'
                            label={'Amount (INR) *'}
                            placeholder='Enter amount in INR'
                            value={amount}
                            onChangeText={(text) => setAmount(validateInput(text, 'amount'))}
                            style={styles.input}
                            keyboardType='decimal-pad'
                            maxLength={10}
                            disabled={isLoading}
                        />

                        <TextInput
                            mode='outlined'
                            label={'Mobile Number (Optional)'}
                            placeholder='Enter mobile number'
                            value={mobile}
                            onChangeText={(text) => setMobile(validateInput(text, 'mobile'))}
                            style={styles.input}
                            keyboardType='number-pad'
                            maxLength={10}
                            disabled={isLoading}
                        />

                        <TextInput
                            mode='outlined'
                            label={'Products (Optional)'}
                            placeholder='Enter product name'
                            value={products}
                            onChangeText={setProducts}
                            style={styles.input}
                            keyboardType='default'
                            maxLength={100}
                            disabled={isLoading}
                            multiline
                            numberOfLines={2}
                        />

                        <View style={styles.btnContainer}>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={[styles.btn, styles.cancelBtn]}
                                onPress={handleClose}
                                disabled={isLoading}
                            >
                                <Text style={styles.btnText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={[styles.btn, styles.saveBtn, isLoading && styles.disabledBtn]}
                                onPress={handleSave}
                                disabled={isLoading}
                            >
                                <Text style={styles.btnText}>
                                    {isLoading ? 'Saving...' : 'Save'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </Modal>
    )
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    scrollContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
    },
    form: {
        width: '90%',
        maxWidth: 400,
        padding: 20,
        borderRadius: 15,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    header: {
        fontSize: 22,
        alignSelf: 'center',
        fontWeight: '600',
        marginBottom: 20,
        color: '#333'
    },
    input: {
        marginBottom: 15,
    },
    btnContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    btn: {
        padding: 12,
        width: '48%',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 3,
    },
    cancelBtn: {
        backgroundColor: '#95a5a6',
    },
    saveBtn: {
        backgroundColor: '#27ae60',
    },
    disabledBtn: {
        backgroundColor: '#bdc3c7',
        opacity: 0.7,
    },
    btnText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white'
    }
})

export default AddDebtModal