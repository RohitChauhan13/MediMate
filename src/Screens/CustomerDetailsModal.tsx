import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { TextInput } from 'react-native-paper';
import AntDesign from '@react-native-vector-icons/ant-design';
import Toast from '../Components/Toast';

interface Customer {
    id: number;
    name: string;
    medicines: string;
    address?: string | null;
    mobile?: string | null;
    email?: string | null;
}

interface Props {
    user: Customer | null;
    onClose: () => void;
    onModify: (updatedUser: Customer) => void;
    onDelete: (id: number) => void;
}

const CustomerDetailsModal: React.FC<Props> = ({ user, onClose, onModify, onDelete }) => {
    const [form, setForm] = useState<Customer | null>(null);
    const [confirmVisible, setConfirmVisible] = useState(false);

    useEffect(() => {
        if (user) setForm(user);
    }, [user]);

    if (!form) return null;

    const handleModify = () => {
        if (!form.name.trim() || !form.medicines.trim() || !form.mobile?.trim()) {
            Toast('Name , mobile and Medicines are required');
            return;
        }

        onModify({
            ...form,
            mobile: form.mobile?.trim() || null,
            email: form.email?.trim() || null,
            address: form.address?.trim() || null,
        });
    };

    const handleDeleteConfirm = () => {
        setConfirmVisible(false);
        onDelete(form.id);
    };

    return (
        <>
            {/* Main Modal */}
            <Modal visible={!!user} transparent animationType="slide">
                <View style={styles.overlay}>
                    <View style={styles.modal}>
                        {/* Close button */}
                        <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
                            <AntDesign name="close-circle" size={24} color="tomato" />
                        </TouchableOpacity>

                        <Text style={styles.title}>Customer Details</Text>

                        {/* Disabled ID field */}
                        <TextInput
                            mode="outlined"
                            label="ID"
                            value={form.id.toString()}
                            disabled
                            style={styles.input}
                        />

                        <TextInput
                            mode="outlined"
                            label="Name *"
                            value={form.name}
                            onChangeText={(text) => setForm({ ...form, name: text })}
                            style={styles.input}
                        />

                        <TextInput
                            mode="outlined"
                            label="Medicines *"
                            value={form.medicines}
                            onChangeText={(text) => setForm({ ...form, medicines: text })}
                            style={styles.input}
                        />

                        <TextInput
                            mode="outlined"
                            label="Mobile *"
                            value={form.mobile || ''}
                            onChangeText={(text) => setForm({ ...form, mobile: text })}
                            keyboardType="phone-pad"
                            style={styles.input}
                        />

                        <TextInput
                            mode="outlined"
                            label="Email  (Optional)"
                            value={form.email || ''}
                            onChangeText={(text) => setForm({ ...form, email: text })}
                            keyboardType="email-address"
                            style={styles.input}
                        />

                        <TextInput
                            mode="outlined"
                            label="Address (Optional)"
                            value={form.address || ''}
                            onChangeText={(text) => setForm({ ...form, address: text })}
                            style={styles.input}
                        />

                        {/* Buttons */}
                        <View style={styles.btnRow}>
                            <TouchableOpacity
                                style={[styles.btn, { backgroundColor: 'orange' }]}
                                onPress={handleModify}
                            >
                                <Text style={styles.btnText}>Modify</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.btn, { backgroundColor: 'red' }]}
                                onPress={() => setConfirmVisible(true)}
                            >
                                <Text style={styles.btnText}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal visible={confirmVisible} transparent animationType="fade">
                <View style={styles.confirmOverlay}>
                    <View style={styles.confirmBox}>
                        <Text style={styles.confirmTitle}>Confirm Delete</Text>
                        <Text style={styles.confirmText}>
                            Are you sure you want to delete this customer?
                        </Text>

                        <View style={styles.confirmBtnRow}>
                            <TouchableOpacity
                                style={[styles.confirmBtn, { backgroundColor: 'grey' }]}
                                onPress={() => setConfirmVisible(false)}
                            >
                                <Text style={styles.btnText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.confirmBtn, { backgroundColor: 'red' }]}
                                onPress={handleDeleteConfirm}
                            >
                                <Text style={styles.btnText}>Yes, Delete</Text>
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
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modal: {
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        elevation: 5,
        position: 'relative',
    },
    closeIcon: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    input: {
        marginBottom: 10,
        backgroundColor: '#fff',
    },
    btnRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
    },
    btn: {
        flex: 1,
        marginHorizontal: 5,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    btnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },

    // confirm modal
    confirmOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    confirmBox: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    confirmTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    confirmText: {
        fontSize: 14,
        marginBottom: 20,
        textAlign: 'center',
    },
    confirmBtnRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    confirmBtn: {
        flex: 1,
        marginHorizontal: 5,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
});

export default CustomerDetailsModal;
