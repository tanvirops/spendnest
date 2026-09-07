import { useContext } from "react";
import { ProfileContext } from "../context/ProfileContext";

export const useProfile = () => {
    const context = useContext(ProfileContext);

    if (!context) {
        return {
            user: { data: { currency: localStorage.getItem('user_currency') || 'BDT' } },
            refetch: async () => undefined,
        };
    }

    return context;
};