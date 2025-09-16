import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import React, { useState, useEffect } from 'react';
import { TextInput } from 'react-native-paper';
import axios from 'axios';
import { useDispatch, Reducers } from '../../redux/Index';
import Toast from '../Components/Toast';

type Wishlist = {
    id: number;
    name: string;
    medicines: string;
    mobile: string | null;
    qty: number | null;
    created_at: string;
};

interface Props {
    visible: boolean;
    onClose: () => void;
    item: Wishlist | null;
}

const EditWishlistModal: React.FC<Props> = ({ visible, onClose, item }) => {
    const [name, setName] = useState('');
    const [medicines, setMedicines] = useState('');
    const [qty, setQty] = useState('');
    const [mobile, setMobile] = useState('');
    const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
    const dispatch = useDispatch();

    useEffect(() => {
        if (item) {
            setName(item.name || '');
            setMedicines(item.medicines || '');
            setQty(item.qty !== null ? item.qty.toString() : '');
            setMobile(item.mobile || '');
        }
    }, [item]);

    const resetFields = () => {
        setName('');
        setMedicines('');
        setQty('');
        setMobile('');
    };

    const handleUpdate = async () => {
        if (!item) return;

        if (!name.trim()) {
            Toast('Name is required');
            return;
        }
        if (!medicines.trim()) {
            Toast('Medicines is required');
            return;
        }

        if (mobile && !/^\d{10}$/.test(mobile)) {
            Toast('Mobile number must be exactly 10 digits');
            return;
        }

        dispatch(Reducers.setLoading(true))
        try {
            const res = await axios.put(
                'https://rohitsbackend.onrender.com/update-wishlist',
                {
                    id: item.id,
                    name,
                    medicines,
                    mobile: mobile.trim() === '' ? null : mobile,
                    qty: qty.trim() === '' ? null : Number(qty),
                }
            );

            if (res.data.success) {
                Toast('Item updated successfully');
                dispatch(Reducers.setRefresh(true));
                resetFields();
                onClose();
                dispatch(Reducers.setLoading(false))
            } else {
                Toast('Error while updating item');
                dispatch(Reducers.setLoading(false))
            }
        } catch {
            Toast('Something went wrong while updating');
            dispatch(Reducers.setLoading(false))
        }
    };

    const handleDelete = async () => {
        if (!item) return;
        dispatch(Reducers.setLoading(true))
        try {
            const res = await axios.delete(
                'https://rohitsbackend.onrender.com/delete-wishlist',
                {
                    data: { id: item.id },
                }
            );

            if (res.data.success) {
                Toast('Item deleted successfully');
                dispatch(Reducers.setRefresh(true));
                resetFields();
                setConfirmDeleteVisible(false);
                onClose();
                dispatch(Reducers.setLoading(false))
            } else {
                Toast('Error while deleting item');
                dispatch(Reducers.setLoading(false))
            }
        } catch {
            Toast('Something went wrong while deleting');
            dispatch(Reducers.setLoading(false))
        }
    };

    return (
        <>
            {/* Main Edit Modal */}
            <Modal visible={visible} transparent animationType="slide">
                <View style={styles.overlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.title}>Edit / Delete Wishlist</Text>

                        <TextInput
                            mode="outlined"
                            label="ID"
                            value={item?.id.toString() || ''}
                            disabled
                            style={styles.input}
                        />

                        <TextInput
                            mode="outlined"
                            label="Created At"
                            value={item ? new Date(item.created_at).toDateString() : ''}
                            disabled
                            style={styles.input}
                        />

                        <TextInput
                            mode="outlined"
                            label="Name *"
                            value={name}
                            onChangeText={setName}
                            style={styles.input}
                        />

                        <TextInput
                            mode="outlined"
                            label="Medicines *"
                            value={medicines}
                            onChangeText={setMedicines}
                            style={styles.input}
                        />

                        <TextInput
                            mode="outlined"
                            label="Mobile (Optional)"
                            value={mobile}
                            onChangeText={setMobile}
                            keyboardType="phone-pad"
                            maxLength={10}
                            style={styles.input}
                        />

                        <TextInput
                            mode="outlined"
                            label="Quantity (Optional)"
                            value={qty}
                            onChangeText={setQty}
                            keyboardType="numeric"
                            style={styles.input}
                        />

                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={() => {
                                    resetFields();
                                    onClose();
                                }}
                            >
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.button, styles.updateButton]}
                                onPress={handleUpdate}
                            >
                                <Text style={styles.buttonText}>Update</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.button, styles.deleteButton]}
                                onPress={() => setConfirmDeleteVisible(true)}
                            >
                                <Text style={styles.buttonText}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal visible={confirmDeleteVisible} transparent animationType="fade">
                <View style={styles.overlay}>
                    <View style={styles.confirmBox}>
                        <Text style={styles.confirmText}>
                            Are you sure you want to delete this item?
                        </Text>

                        <View style={styles.confirmRow}>
                            <TouchableOpacity
                                style={[styles.confirmBtn, styles.cancelButton]}
                                onPress={() => setConfirmDeleteVisible(false)}
                            >
                                <Text style={styles.buttonText}>No</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.confirmBtn, styles.deleteButton]}
                                onPress={handleDelete}
                            >
                                <Text style={styles.buttonText}>Yes, Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '85%',
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#333',
    },
    input: {
        marginBottom: 15,
        backgroundColor: '#fff',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        gap: 8,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#ccc',
    },
    updateButton: {
        backgroundColor: '#4CAF50',
    },
    deleteButton: {
        backgroundColor: '#E53935',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    confirmBox: {
        width: '75%',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
    },
    confirmText: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
        color: '#333',
    },
    confirmRow: {
        flexDirection: 'row',
        gap: 10,
    },
    confirmBtn: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 6,
        alignItems: 'center',
    },
});

export default EditWishlistModal;
