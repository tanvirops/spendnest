import { useQuery } from "@tanstack/react-query";
import { createContext, useEffect } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { getProfile } from "../api/profile";
import SplashScreen from "../components/SplashScreen";

export const ProfileContext = createContext(null);

export const ProfileProvider = ({ children }) => {
    const { data: user, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['user-profile'],
        queryFn: getProfile,
    });

    useEffect(() => {
        if (typeof window !== 'undefined' && user?.data?.currency) {
            localStorage.setItem('user_currency', user.data.currency);
        }
    }, [user]);

    if (isLoading) {
        return <SplashScreen />;
    }

    if (isError) {
      return (
         <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-200 p-4">
        <div className="bg-rose-950/40 border border-rose-900/60 p-6 rounded-2xl max-w-md text-center">
          <FiAlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h2 className="text-base font-semibold text-rose-200 mb-1">Failed to load profile</h2>
          <p className="text-xs text-rose-300/80 mb-4">{error?.response?.data?.message || error.message || "An unknown error occurred"}</p>
          <button 
            onClick={() => refetch()}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div> 
      )
    }

    return (
        <ProfileContext.Provider value={{ user, refetch }}>
            {children}
        </ProfileContext.Provider>
    );
};

