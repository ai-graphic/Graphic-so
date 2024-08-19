'use client'

import React from "react";

type LoadingProviderProps = {
    isLoading: boolean;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const initialValues: LoadingProviderProps = {
    isLoading: false,
    setIsLoading: () => undefined,
}

type WithChildProps = {
    children: React.ReactNode
}

const context = React.createContext(initialValues);
const {Provider} = context

export const LoadingProvider = ({ children }: WithChildProps) => {
    const [isLoading, setIsLoading] = React.useState(initialValues.isLoading)

    const values = {
        isLoading,
        setIsLoading,
    }

    return <Provider value={values}>{children}</Provider>
}

export const useLoading = () => {
    const state = React.useContext(context)
    return state
}
