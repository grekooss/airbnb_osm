import { createContext, ReactNode, useContext } from "react";

import { getCurrentUser } from "./appwrite";
import { useAppwrite } from "./useAppwrite";

interface User {
    $id: string;
    name: string;
    email: string;
    avatar: string;
}
interface GlobalContextType{
    isLoggedIn: boolean;
    user: User | null;
    loading: boolean;
    refetch: () => Promise<void>;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

interface GlobalProviderProps {
    children: ReactNode;
  }

export const GlobalProvider = ({ children }: GlobalProviderProps) => {
const {
    data: user,
    loading,
    refetch: originalRefetch,
} = useAppwrite({
    fn: getCurrentUser,
});

const isLoggedIn = !!user;

// Wrapper dla funkcji refetch, która nie wymaga parametrów
const refetch = async () => {
  await originalRefetch({} as any);
};

return (
    <GlobalContext.Provider
    value={{
        isLoggedIn,
        user,
        loading,
        refetch,
    }}
    >
    {children}
    </GlobalContext.Provider>
);
};

export const useGlobalContext = (): GlobalContextType => {
    const context = useContext(GlobalContext);
    if (!context)
      throw new Error("useGlobalContext must be used within a GlobalProvider");
  
    return context;
  };
  
  export default GlobalProvider;