import { TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import AntDesign from '@react-native-vector-icons/ant-design'
import { Reducers, useDispatch } from '../../redux/Index'

const CustomeBtn = () => {
    const dispatch = useDispatch()
    return (
        <TouchableOpacity style={styles.btn}
            activeOpacity={0.75}
            onPress={() => dispatch(Reducers.setAddModal(true))}
        >
            <AntDesign name='user-add' size={25} color={'black'} style={{ fontWeight: 'bold' }} />
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    btn: {
        borderRadius: 50,
        padding: 15,
        backgroundColor: '#eec841ff',
        position: 'absolute',
        bottom: 20,
        right: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
});

export default CustomeBtn