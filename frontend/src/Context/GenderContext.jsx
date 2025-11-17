import { createContext, useContext, useState } from "react";

const GenderContext = createContext();

export const GenderProvider = ({ children }) => {
  const [gender, setGender] = useState("woman"); // default gender

  const changeGender = (value) => {
    setGender(value);
  };

  return (
    <GenderContext.Provider value={{ gender, changeGender }}>
      {children}
    </GenderContext.Provider>
  );
};

export const useGender = () => useContext(GenderContext);
