import { configureStore } from '@reduxjs/toolkit';
import MySlice from './MySlice';
import {
    useDispatch as useAppDispatch,
    useSelector as AppSelector,
    TypedUseSelectorHook,
} from 'react-redux';

export const Store = configureStore({
    reducer: {
        auth: MySlice,
    },
});

export type RootState = ReturnType<typeof Store.getState>;
export type AppDispatch = typeof Store.dispatch;

export const useDispatch = () => useAppDispatch<AppDispatch>();
export const useSelector: TypedUseSelectorHook<RootState> = AppSelector;

