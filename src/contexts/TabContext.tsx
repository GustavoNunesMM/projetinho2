import React, { createContext, useContext, useState } from "react";

const TabContext = createContext<{
  activeTab: string;
  setActiveTab: (tab: string) => void;
}>({ activeTab: "generate", setActiveTab: () => {} });

export const TabProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [activeTab, setActiveTab] = useState("generate");
  return (
    <TabContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabContext.Provider>
  );
};

export const useTab = () => useContext(TabContext);