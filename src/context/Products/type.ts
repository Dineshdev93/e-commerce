

export const SET_LOADING = "SET_LOADING" ; 


export interface setLoadingAction {
     type : typeof SET_LOADING ; 
     payload : boolean
}

export type ProductActionTypes = 
 | setLoadingAction

 export interface ProductState {
     isLoading : boolean
 }