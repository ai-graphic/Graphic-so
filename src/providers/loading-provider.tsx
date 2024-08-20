'use client'

import React from "react";

// Define a type for tracking loading states by key
type LoadingState = {
    [key: string]: boolean;
}

// Update LoadingProviderProps to include the new loading state type
type LoadingProviderProps = {
    isLoading: LoadingState; // Changed from boolean to LoadingState
    setIsLoading: (key: string, value: boolean) => void; // Updated to handle key-value pairs
}

// Adjust initialValues to match the updated type
const initialValues: LoadingProviderProps = {
    isLoading: {}, // Changed from boolean to an empty object
    setIsLoading: (key: string, value: boolean) => undefined, // Placeholder function
}

type WithChildProps = {
    children: React.ReactNode;
}

const context = React.createContext(initialValues);
const { Provider } = context;

export const LoadingProvider = ({ children }: WithChildProps) => {
    const [isLoading, setIsLoadingState] = React.useState(initialValues.isLoading);

    // Update setIsLoading to handle a key and value, updating the specific loading state
    const setIsLoading = (key: string, value: boolean) => {
        setIsLoadingState(prevState => ({
            ...prevState,
            [key]: value,
        }));
    };

    const values = {
        isLoading,
        setIsLoading,
    };

    return <Provider value={values}>{children}</Provider>;
}

export const useLoading = () => {
    const state = React.useContext(context);
    return state;
}