import { createContext, useContext, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isSeller, setIsSeller] = useState(false);
    const [showUserLogin, setShowUserLogin] = useState(false);

    
    // Memoize the context value to prevent unnecessary re-renders
    const value = useMemo(() => ({
        navigate,
        user,
        setUser,
        isSeller,
        setIsSeller,
        showUserLogin, setShowUserLogin
    }), [navigate, user, isSeller, showUserLogin]);
    
    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    
    if (context === undefined) {
        throw new Error("useAppContext must be used within an AppContextProvider");
    }
    
    return context;
};