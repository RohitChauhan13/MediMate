import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthSliceProp {
    loading: boolean;
    user: boolean;
    splashScreenStatus: boolean;
    otpVerify: boolean;
    addModal: boolean;
    refresh: boolean;
    wishShowModal: boolean;
    addDebtModal: boolean;
}

const initialState: AuthSliceProp = {
    loading: false,
    user: false,
    splashScreenStatus: true,
    otpVerify: false,
    addModal: false,
    refresh: false,
    wishShowModal: false,
    addDebtModal: false,
};

const AuthSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setUser: (state, action: PayloadAction<boolean>) => {
            state.user = action.payload
        },
        setSplashScreenStatus: (state, action: PayloadAction<boolean>) => {
            state.splashScreenStatus = action.payload
        },
        setOtpVerify: (state, action: PayloadAction<boolean>) => {
            state.otpVerify = action.payload;
        },
        setAddModal: (state, action: PayloadAction<boolean>) => {
            state.addModal = action.payload
        },
        setRefresh: (state, action: PayloadAction<boolean>) => {
            state.refresh = action.payload
        },
        setWishModal: (state, action: PayloadAction<boolean>) => {
            state.wishShowModal = action.payload
        },
        setAddDebtModal: (state, action: PayloadAction<boolean>) => {
            state.addDebtModal = action.payload
        },
    },
});

export const { setAddDebtModal, setWishModal, setRefresh, setAddModal, setLoading, setUser, setSplashScreenStatus, setOtpVerify } = AuthSlice.actions;
export default AuthSlice.reducer;
