import { createAsyncThunk } from "@reduxjs/toolkit";

export const loginuser = createAsyncThunk("register-user",
    async (creaditional: { email: string, password: string }) => {
        const response = await fetch("http://localhost:4009/userauth/api/register", {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify(creaditional)
        })
        if (!response) {
            console.log("login failed");
        }
        const data = response.json()
        return data
    }
)

