import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet, Text, View, KeyboardAvoidingView,
  TextInput, TouchableOpacity, Alert, Platform, Switch, ScrollView, ActivityIndicator
} from 'react-native';
import { useFocusEffect, useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';

import { auth } from '../../firebase'; 

const COLORS = {
  background: '#D3E4DA',
  textPrimary: '#3C3C3C',
  buttonPrimary: '#38B07D',
  white: '#FFFFFF',
  secondary: '#96BFE7',
};

export default function LoginScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRemember] = useState(false);
  const [busy, setBusy] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsReady(true);
      if (user && !user.isAnonymous) {
        navigation.replace('HomeScreen');
      }
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    const p = route.params || {};
    if (isReady && p?.autoLogin && p?.email && p?.password) {
      setEmail(p.email);
      setPassword(p.password);
      handleSignIn(p.email, p.password);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params, isReady]);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (async () => {
        try {
          const flag = await AsyncStorage.getItem('rememberMe');
          if (!alive) return;
          const isRemembered = flag === 'true';
          setRemember(isRemembered);
          if (!isRemembered) setPassword('');
        } catch (e) {
          console.log('AsyncStorage error:', e);
        }
      })();
      return () => { alive = false; };
    }, [])
  );

  const afterAuthCommon = async () => {
    try {
      if (rememberMe) await AsyncStorage.setItem('rememberMe', 'true');
      else await AsyncStorage.removeItem('rememberMe');
      if (!rememberMe) setPassword('');
    } catch (e) {
      console.log('rememberMe persist error:', e);
    }
  };

  const handleSignIn = async (_email, _pass) => {
    if (!isReady) {
      Alert.alert('Uyarı', 'Lütfen uygulamanın Firebase bağlantısını kurmasını bekleyin.');
      return;
    }

    const E = (_email ?? email).trim();
    const P = _pass ?? password;
    if (!E || !P) return Alert.alert('Uyarı', 'E-posta ve şifre girin.');

    const timeout = new Promise((_, rej) =>
      setTimeout(() => rej(new Error('timeout')), 15000)
    );

    try {
      setBusy(true);
      const attempt = signInWithEmailAndPassword(auth, E, P);
      const cred = await Promise.race([attempt, timeout]);
      console.log('Giriş yapıldı:', cred.user.email);
      await afterAuthCommon();
      navigation.replace('HomeScreen'); 
    } catch (e) {
      console.log('signin error:', e?.code, e?.message);
      if (e?.message === 'timeout') {
        Alert.alert('Ağ Hatası', 'Sunucuya bağlanılamadı (15 sn). İnternet/DNS/VPN/Proxy kontrol et.');
      } else if (e?.code === 'auth/invalid-credential' || e?.code === 'auth/wrong-password') {
        Alert.alert('Hata', 'E-posta veya şifre yanlış.');
      } else if (e?.code === 'auth/user-not-found') {
        Alert.alert('Hata', 'Bu e-posta ile kayıt bulunamadı.');
      } else if (e?.code === 'auth/network-request-failed') {
        Alert.alert('Ağ Hatası', 'İstek gönderilemedi. İnternet/DNS/VPN ayarlarını kontrol edin.');
      } else {
        Alert.alert('Hata', e?.message ?? String(e));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: COLORS.background }]} 
      behavior={Platform.select({ ios: 'padding', android: 'height' })}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.inner}>
          <Text style={styles.title}>Kronik Hatırlatıcı</Text>
          
          {!isReady && (
              <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={COLORS.buttonPrimary} />
                  <Text style={styles.loadingText}>Bağlanılıyor...</Text>
              </View>
          )}

          {isReady && (
            <>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholderTextColor={COLORS.textPrimary + '77'}
                  value={email}
                  onChangeText={setEmail}
                  returnKeyType="next"
                  editable={!busy}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Şifre"
                  secureTextEntry
                  placeholderTextColor={COLORS.textPrimary + '77'}
                  value={password}
                  onChangeText={setPassword}
                  returnKeyType="done"
                  onSubmitEditing={() => handleSignIn()}
                  editable={!busy}
                />
              </View>

              <View style={styles.rememberMe}>
                <Switch
                  value={rememberMe}
                  onValueChange={setRemember}
                  trackColor={{ false: COLORS.background, true: COLORS.buttonPrimary }}
                  thumbColor={COLORS.white}
                  disabled={busy}
                />
                <Text style={styles.rememberText}>Beni Hatırla</Text>
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, busy && styles.buttonDisabled]}
                  onPress={() => handleSignIn()}
                  disabled={busy || !isReady}
                >
                  {busy ? (
                    <ActivityIndicator color={COLORS.white} />
                  ) : (
                    <Text style={styles.buttonText}>Giriş Yap</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => navigation.navigate('RegisterScreen')}
                  style={[styles.button, styles.outlineButton, busy && styles.buttonDisabled]}
                  disabled={busy || !isReady}
                >
                  <Text style={styles.outlineButtonText}>Hesabınız yok mu? Kaydol</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1 },
  inner: { flex: 1, width: '86%', alignSelf: 'center', justifyContent: 'center', paddingVertical: 24 },
  loadingContainer: { 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center',
      minHeight: 150,
  },
  loadingText: {
      color: COLORS.textPrimary,
      marginTop: 10,
  },
  title: { fontSize: 28, color: COLORS.textPrimary, marginBottom: 16, textAlign: 'center', fontWeight: 'bold' },
  inputContainer: { width: '100%' },
  input: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginTop: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.background, 
    color: COLORS.textPrimary
  },
  rememberMe: { width: '100%', flexDirection: 'row', alignItems: 'center', marginTop: 14 },
  rememberText: { marginLeft: 8, color: COLORS.textPrimary },
  buttonContainer: { width: '70%', alignSelf: 'center', marginTop: 28 },
  button: {
    backgroundColor: COLORS.buttonPrimary,
    padding: 15,
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 6
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  outlineButton: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.buttonPrimary, marginTop: 10 },
  outlineButtonText: { color: COLORS.buttonPrimary, fontSize: 16, fontWeight: '700', textAlign: 'center' },
});
