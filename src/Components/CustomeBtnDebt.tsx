import { TouchableOpacity, StyleSheet, Image } from 'react-native'
import React from 'react'
import { Reducers, useDispatch } from '../../redux/Index'

const CustomeBtnDebt = () => {
    const dispatch = useDispatch();
    return (
        <TouchableOpacity style={styles.btn}
            activeOpacity={0.75}
            onPress={() => dispatch(Reducers.setAddDebtModal(true))}
        >
            <Image source={require('../img/creditor.png')} style={styles.img} />
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    btn: {
        borderRadius: 50,
        padding: 15,
        backgroundColor: '#57d6bbff',
        position: 'absolute',
        bottom: 20,
        right: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    img: {
        width: 25,
        height: 25,
        resizeMode: 'contain',
    }
});

export default CustomeBtnDebt