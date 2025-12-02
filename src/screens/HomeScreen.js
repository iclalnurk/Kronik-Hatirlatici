import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { signOut, onAuthStateChanged } from 'firebase/auth';

import { auth } from '../../firebase'; 

const COLORS = {
  background: '#D3E4DA', 
  textPrimary: '#3C3C3C', 
  buttonPrimary: '#38B07D', 
  white: '#FFFFFF',
  secondary: '#96BFE7', 
};

export default function HomeScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [currentUserEmail, setCurrentUserEmail] = useState('...');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoading(false);
      if (user && !user.isAnonymous) {
        setCurrentUserEmail(user.email || user.uid);
      } else {
        navigation.replace('LoginScreen');
      }
    });
    return unsubscribe;
  }, [navigation]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigation.replace('LoginScreen');
    } catch (error) {
      console.error("Çıkış yapma hatası:", error);
      Alert.alert("Hata", "Oturum kapatılamadı. Tekrar deneyin.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.buttonPrimary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hoş Geldiniz!</Text>
      <Text style={styles.subtitle}>
        {currentUserEmail} hesabı ile giriş yaptınız.
      </Text>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sağlık Ajandası</Text>
        <Text style={styles.cardText}>
          Kronik hatırlatıcılarınızı yönetmeye hazırsınız.
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.button, styles.signOutButton]}
        onPress={handleSignOut}
      >
        <Text style={styles.buttonText}>Çıkış Yap</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textPrimary,
    marginBottom: 40,
    textAlign: 'center',
  },
  card: {
    backgroundColor: COLORS.white,
    padding: 25,
    borderRadius: 15,
    width: '90%',
    shadowColor: COLORS.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 8,
    marginBottom: 50,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.buttonPrimary,
    marginBottom: 10,
  },
  cardText: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '60%',
  },
  signOutButton: {
    backgroundColor: COLORS.buttonPrimary,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
