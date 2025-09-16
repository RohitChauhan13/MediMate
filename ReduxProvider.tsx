import React from 'react'
import { Provider } from 'react-redux'
import { Store } from './redux/Store';
import App from './App';
import Loading from './src/Components/Loading';
import { SafeAreaView } from 'react-native-safe-area-context';

const ReduxProvider = () => {
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Provider store={Store}>
                <App />
                <Loading />
            </Provider>
        </SafeAreaView>
    )
}

export default ReduxProvider