import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const StudentContext = createContext(null);
const STORAGE_KEY = '@camila_student';

export function StudentProvider({ children }) {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on app launch
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setStudent(JSON.parse(raw));
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (studentObj) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(studentObj));
    setStudent(studentObj);
  };

  const logout = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setStudent(null);
  };

  return (
    <StudentContext.Provider value={{ student, loading, login, logout }}>
      {children}
    </StudentContext.Provider>
  );
}

export const useStudent = () => useContext(StudentContext);
