import { createSlice } from "@reduxjs/toolkit";
import { loginuser } from "../services/loginservice";


interface response {
    id: number
    user: string,
    password: string
}

interface intialState {
    name: string,
    response: response | null,
    isLoggedin: boolean,
    isLoading: boolean,
    error: string | null
}

const initialState: intialState = {
    name: "",
    isLoading: false,
    isLoggedin: false,
    error: null,
    response: null
}

export const userSlice = createSlice({
    name: " user-slice",
    initialState,
    reducers: {

    },
    extraReducers: (builder) => {
        builder.addCase(loginuser.pending, (state) => {
            state.isLoading = true
        })
            .addCase(loginuser.fulfilled, (state, action) => {
                state.isLoading = false,
                state.response = action.payload
                state.isLoggedin = true
            })
        builder.addCase(loginuser.rejected, (state , action) => {
            state.isLoading = false
            state.isLoggedin = false
            state.error = action.error.message || "Something went wrong"
        })
    }
})

export default userSlice.reducer