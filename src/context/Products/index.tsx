import { intialstate, reducer } from "@/context/Products/reducer"
import type { ProductActionTypes, ProductState } from "@/context/Products/type"
import { useReducer, useContext, createContext, type ReactNode } from "react"

export const StateContext = createContext<ProductState | undefined>(undefined)

export const DispatchContext = createContext<React.Dispatch<ProductActionTypes> | undefined>(undefined)


export const ProductContextProvide: React.FC<{ children: ReactNode }> = ({ children }) => {

    const [state, dispatch] = useReducer(reducer, intialstate)

    return (<DispatchContext.Provider value={dispatch}>
        <StateContext.Provider value={state}>
            {children}
        </StateContext.Provider>
    </DispatchContext.Provider>
    )
}

export const useDispatchCustumHook = () => {
    const context = useContext(DispatchContext)

    if (!context) {
        throw new Error("Actions must be used within a StateContextProvider")
    }
    return context
}

export const useStateContextCustumHook = () => {
    const context = useContext(StateContext)
    if (!context) {
        throw new Error("State must be used with in  StatecontextProvider")
    }
    return context
}

