import { createContext, useContext } from "react";

type SubscriptionContextType = {
  isSubscribed: boolean;
};

const SubscriptionContext = createContext<SubscriptionContextType>({
  isSubscribed: false,
});

export const SubscriptionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {

  const isSubscribed = false; // false → non-subscribed UI

  return (
    <SubscriptionContext.Provider value={{ isSubscribed }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSubscription = () => useContext(SubscriptionContext);
