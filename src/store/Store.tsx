import { configureStore } from "@reduxjs/toolkit";
import userSlice from "@/store/slice/userSlice"

export const Store = configureStore({
    reducer: {
        userState: userSlice
    }
})

export type RootState = ReturnType<typeof Store.getState>
export type AppDispatch = typeof Store.dispatch;