import { View, Text, Modal, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import React, { useState } from 'react'
import { useSelector, useDispatch, Reducers } from '../../redux/Index';
import { TextInput } from 'react-native-paper';
import axios from 'axios';
import Toast from '../Components/Toast';

const AddItemsToWishlist = () => {
    const [name, setName] = useState('');
    const [medicines, setMedicines] = useState('');
    const [qty, setQty] = useState('');
    const [mobile, setMobile] = useState('');
    const dispatch = useDispatch();
    const show = useSelector((state: any) => state.auth.wishShowModal);

    const resetFields = () => {
        setName('');
        setMedicines('');
        setQty('');
        setMobile('');
    };

    const handleClose = () => {
        resetFields();
        dispatch(Reducers.setWishModal(false));
    };

    const handleSave = async () => {
        if (!name || !medicines) {
            Toast('Name and medicines required')
            return;
        }

        if (mobile && !/^\d{10}$/.test(mobile)) {
            Toast('Mobile number must be exactly 10 digits');
            return;
        }

        try {
            const res = await axios.post('https://rohitsbackend.onrender.com/add-wishlist', {
                name,
                medicines,
                mobile,
                qty: Number(qty),
            });

            if (res.data.success) {
                Toast('Item added successfully');
                handleClose();
                dispatch(Reducers.setRefresh(true));
            } else {
                Toast('Error while adding data');
            }
        } catch (error) {
            Alert.alert(
                'Something went wrong',
                'Please check your internet connection'
            );
        }
    };

    return (
        <Modal visible={show} transparent animationType="slide">
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <Text style={styles.title}>Add medicine to Wishlist</Text>

                    <TextInput
                        mode='outlined'
                        label='Name *'
                        placeholder='Enter customer name...'
                        value={name}
                        onChangeText={setName}
                        style={styles.input}
                        autoFocus={true}
                    />

                    <TextInput
                        mode='outlined'
                        label='Medicines *'
                        placeholder='Enter medicines name...'
                        value={medicines}
                        onChangeText={setMedicines}
                        style={styles.input}
                    />

                    <TextInput
                        mode='outlined'
                        label='Mobile (Optional)'
                        placeholder='Enter mobile number...'
                        keyboardType='phone-pad'
                        value={mobile}
                        maxLength={10}
                        onChangeText={setMobile}
                        style={styles.input}
                    />

                    <TextInput
                        mode='outlined'
                        label='Quantity (Optional)'
                        placeholder='Enter quantity...'
                        keyboardType='numeric'
                        value={qty}
                        onChangeText={setQty}
                        style={styles.input}
                    />

                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={handleClose}
                        >
                            <Text style={[styles.buttonText, { color: '#666' }]}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.saveButton]}
                            onPress={handleSave}
                        >
                            <Text style={styles.buttonText}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '85%',
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#333',
    },
    input: {
        width: '100%',
        backgroundColor: '#fff',
        marginBottom: 20,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        gap: 10,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#f0f0f0',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    saveButton: {
        backgroundColor: '#eec841ff',
    },
    buttonText: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#333',
    },
});

export default AddItemsToWishlist;
