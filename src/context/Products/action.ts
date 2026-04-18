import { type setLoadingAction } from "@/context/Products/type";
import { SET_LOADING } from "@/context/Products/type"

export const setLoading = (value: boolean): setLoadingAction => {
    return {
        type: SET_LOADING,
        payload: value
    }
}