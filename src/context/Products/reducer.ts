import { SET_LOADING, type ProductActionTypes, type ProductState } from "@/context/Products/type";


export const intialstate: ProductState = {
    isLoading: false
}

export const reducer = (state : ProductState , action : ProductActionTypes) : ProductState => {
    switch(action.type){
        case SET_LOADING : 
          return {
             ...state,
             isLoading : action.payload
          }
       default : 
         return state 
    }
}
