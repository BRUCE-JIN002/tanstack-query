import { createContext, useContext } from "react";
import { QueryClient } from "./queryClient";

const QueryClientContext = createContext<QueryClient | undefined>(undefined);

export const useQueryClient = () => {
  const client = useContext(QueryClientContext);

  if (!client) {
    throw new Error("useQueryClient must be used within a QueryClientProvider");
  }

  return client;
};

export type QueryClientProviderProps = {
  children: React.ReactNode;
  client: QueryClient;
};

export const QueryClientProvider = ({
  children,
  client
}: QueryClientProviderProps) => {
  return (
    <QueryClientContext.Provider value={client}>
      {children}
    </QueryClientContext.Provider>
  );
};
