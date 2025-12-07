// src/context/FontContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const FontContext = createContext({
  fontSize: 16,
  updateFontSize: () => {},
});

export function FontProvider({ children }) {
  const [fontSize, setFontSize] = useState(16); // Varsayılan yazı boyutu

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('fontSize');
        if (saved) {
          const n = Number(saved);
          if (!Number.isNaN(n)) setFontSize(n);
        }
      } catch (e) {
        console.log('fontSize yüklenemedi:', e);
      }
    })();
  }, []);

  const updateFontSize = async (size) => {
    setFontSize(size);
    try {
      await AsyncStorage.setItem('fontSize', String(size));
    } catch (e) {
      console.log('fontSize kaydedilemedi:', e);
    }
  };

  return (
    <FontContext.Provider value={{ fontSize, updateFontSize }}>
      {children}
    </FontContext.Provider>
  );
}
