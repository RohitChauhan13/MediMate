import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput } from 'react-native-paper';
import { Reducers, useDispatch, useSelector } from '../../redux/Index';
import Toast from '../Components/Toast';
import axios from 'axios';

const AddCustomerModal = () => {
    const show = useSelector(state => state.auth.addModal);
    const refresh = useSelector(state => state.auth.refresh);
    const dispatch = useDispatch();

    const [name, setName] = useState('');
    const [medicines, setMedicines] = useState('');
    const [address, setAddress] = useState('');
    const [mobile, setMobile] = useState('');
    const [email, setEmail] = useState('');
    const [saving, setSaving] = useState(false);

    const resetForm = () => {
        setName('');
        setMedicines('');
        setAddress('');
        setMobile('');
        setEmail('');
    };

    const handleClose = () => {
        resetForm();
        dispatch(Reducers.setAddModal(false));
    };

    const handleSave = async () => {
        if (!name || !medicines || !mobile) {
            return Toast('Name, medicines and mobile number required');
        }
        if (mobile.length !== 10) {
            return Toast('Enter a valid 10-digit mobile number');
        }
        if (email && !/\S+@\S+\.\S+/.test(email)) {
            return Toast('Enter a valid email address');
        }

        try {
            setSaving(true);
            dispatch(Reducers.setLoading(true));

            const res = await axios.post('https://rohitsbackend.onrender.com/adduser', {
                name, email, mobile, medicines, address
            });

            if (res.data.success) {
                Toast(res.data.message);
                // Toggle refresh state to trigger re-fetch
                dispatch(Reducers.setRefresh(!refresh));
                handleClose();
            } else {
                Toast(res.data.message);
            }
        } catch (err) {
            Toast('Something went wrong!');
        } finally {
            setSaving(false);
            dispatch(Reducers.setLoading(false));
        }
    };

    return (
        <Modal visible={show} transparent animationType="slide">
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.overlay}
            >
                <View style={styles.modalBox}>
                    <Text style={styles.title}>Add Customer</Text>

                    <TextInput
                        autoFocus={true}
                        mode="outlined"
                        label="Name *"
                        value={name}
                        onChangeText={setName}
                        style={styles.input}
                    />
                    <TextInput
                        mode="outlined"
                        label="Medicine Names *"
                        value={medicines}
                        onChangeText={setMedicines}
                        style={styles.input}
                    />
                    <TextInput
                        mode="outlined"
                        label="Mobile *"
                        value={mobile}
                        onChangeText={setMobile}
                        keyboardType="phone-pad"
                        maxLength={10}
                        style={styles.input}
                    />
                    <TextInput
                        mode="outlined"
                        label="Address (Optional)"
                        value={address}
                        onChangeText={setAddress}
                        style={styles.input}
                    />
                    <TextInput
                        mode="outlined"
                        label="Email (Optional)"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        style={styles.input}
                    />

                    <View style={styles.btnRow}>
                        <TouchableOpacity style={[styles.btn, { backgroundColor: 'gray' }]} onPress={handleClose}>
                            <Text style={styles.btnText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.btn, { backgroundColor: saving ? 'lightgray' : '#eec841ff' }]}
                            onPress={handleSave}
                            disabled={saving}
                        >
                            <Text style={styles.btnText}>{saving ? 'Saving...' : 'Save'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalBox: {
        width: '85%',
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        elevation: 5,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    input: {
        marginBottom: 12,
        backgroundColor: '#fff',
    },
    btnRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    btn: {
        flex: 1,
        marginHorizontal: 5,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    btnText: {
        color: 'black',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default AddCustomerModal;