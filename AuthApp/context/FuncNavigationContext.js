import React, { createContext, useState } from 'react';

export const FuncNavigationContext = createContext();

export const FuncNavigationProvider = ({ children }) => {
  const [currentHobbies, setCurrentHobbies] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [filteredUser, setFilteredUser] = useState(null);

  return (
    <FuncNavigationContext.Provider value={{ currentHobbies, setCurrentHobbies, 
        filteredCategories, setFilteredCategories,
         filteredUser, setFilteredUser }}>
      {children}
    </FuncNavigationContext.Provider>
  );
};
