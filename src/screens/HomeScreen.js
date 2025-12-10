import React, { useEffect, useState, useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Button,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import Ionicons from '@expo/vector-icons/Ionicons';

import { auth, db, appId } from '../../firebase';
import { FontContext } from './context/FontContext';
//React Native → (HTTP) → server.js → Twilio → WhatsApp
const sendWhatsapp = async () => {
  try {
const response = await fetch(
  "https://marivel-unframeable-nonhygroscopically.ngrok-free.dev/send-whatsapp",
  {      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: "+905530795838", // kendi numaran
        text: "React Native üzerinden deneme mesajı 📲",
      }),
    });

    const data = await response.json();
    console.log("API yanıtı:", data);
  } catch (err) {
    console.log("Hata:", err);
  }
};

const COLORS = {
  background: '#D3E4DA',
  textPrimary: '#3C3C3C',
  buttonPrimary: '#38B07D',
  white: '#FFFFFF',
  secondary: '#96BFE7',
};

export default function HomeScreen() {
  const navigation = useNavigation();
  const { fontSize } = useContext(FontContext);

  const [loading, setLoading] = useState(true);
  const [userFullName, setUserFullName] = useState('...');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user || user.isAnonymous) {
        setLoading(false);
        navigation.replace('LoginScreen');
        return;
      }

      const fetchProfile = async () => {
        try {
          const userDocRef = doc(
            db,
            'artifacts',
            appId,
            'users',
            user.uid,
            'users',
            user.uid
          );

          const snap = await getDoc(userDocRef);

          if (snap.exists()) {
            const data = snap.data();
            const nameFromDb = data?.fullName;
            const fallbackName =
              nameFromDb ||
              (user.email ? user.email.split('@')[0] : user.uid);

            setUserFullName(fallbackName);
          } else {
            const fallbackName =
              user.email ? user.email.split('@')[0] : user.uid;
            setUserFullName(fallbackName);
          }
        } catch (err) {
          console.error('Kullanıcı profili alınırken hata:', err);
          const fallbackName =
            auth.currentUser?.email
              ? auth.currentUser.email.split('@')[0]
              : auth.currentUser?.uid || 'Kullanıcı';
          setUserFullName(fallbackName);
        } finally {
          setLoading(false);
        }
      };

      fetchProfile();
    });

    return unsubscribe;
  }, [navigation]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigation.replace('LoginScreen');
    } catch (error) {
      console.error('Çıkış yapma hatası:', error);
      Alert.alert('Hata', 'Oturum kapatılamadı. Tekrar deneyin.');
    }
  };

  const goToSettings = () => {
    navigation.navigate('SettingsScreen');
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
    <Button title="WhatsApp Gönder" onPress={sendWhatsapp} />

      {/* Sağ üstte ayarlar simgesi */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }} />
        <TouchableOpacity style={styles.settingsButton} onPress={goToSettings}>
          <Ionicons
            name="settings-outline"
            size={22}
            color={COLORS.textPrimary}
          />
        </TouchableOpacity>
      </View>

      <Text style={[styles.title, { fontSize: fontSize + 12 }]}>
        Hoş Geldiniz!
      </Text>

      <Text style={[styles.subtitle, { fontSize }]}>
        {userFullName} hesabı ile giriş yaptınız.
      </Text>

      <View style={styles.card}>
        <Text style={[styles.cardTitle, { fontSize: fontSize + 4 }]}>
          Sağlık Ajandası
        </Text>
        <Text style={[styles.cardText, { fontSize }]}>
          Kronik hatırlatıcılarınızı yönetmeye hazırsınız.
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.button, styles.signOutButton]}
        onPress={handleSignOut}
      >
        <Text style={[styles.buttonText, { fontSize }]}>Çıkış Yap</Text>
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
  headerRow: {
    position: 'absolute',
    top: 40,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  settingsButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white + '80',
  },
  title: {
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  subtitle: {
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
    fontWeight: 'bold',
    color: COLORS.buttonPrimary,
    marginBottom: 10,
  },
  cardText: {
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
    fontWeight: '700',
  },
});
