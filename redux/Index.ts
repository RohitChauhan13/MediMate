import { setAddDebtModal, setWishModal, setRefresh, setAddModal, setLoading, setUser, setSplashScreenStatus, setOtpVerify } from "./MySlice";
import { Store, useDispatch, useSelector } from './Store'

const Reducers = {
    setLoading,
    setUser,
    setSplashScreenStatus,
    setOtpVerify,
    setAddModal,
    setRefresh,
    setWishModal,
    setAddDebtModal
};

export { Reducers, Store, useDispatch, useSelector }