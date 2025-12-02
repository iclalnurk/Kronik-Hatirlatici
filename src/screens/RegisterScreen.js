import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity, Alert,
  Platform, ScrollView, KeyboardAvoidingView, ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

import { auth, db, appId } from '../../firebase';
import HastaForm from './hasta';
import HastaYakiniForm from './hastayakini';

const COLORS = {
  background: '#D3E4DA',
  textPrimary: '#3C3C3C',
  buttonPrimary: '#38B07D',
  white: '#FFFFFF',
  secondary: '#96BFE7',
};

export default function RegisterScreen() {
  const navigation = useNavigation();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [patientData, setPatientData] = useState({});
  const [relativeData, setRelativeData] = useState({});
  const [isBusy, setIsBusy] = useState(false);
  const [isReady] = useState(true);
  const [showRelativeForm, setShowRelativeForm] = useState(false);

  const validate = () => {
    if (!fullName || !email || !password) {
      Alert.alert('Eksik Bilgi', 'Ad Soyad, E-posta ve şifre zorunludur.');
      return false;
    }
    if (!patientData?.tcNo || patientData.tcNo.length !== 11) {
      Alert.alert('Eksik Bilgi', 'TC Kimlik No 11 hane olmalı.');
      return false;
    }
    if (!patientData?.bloodType) {
      Alert.alert('Eksik Bilgi', 'Kan grubunu seçin.');
      return false;
    }
    if (showRelativeForm) {
      if (!relativeData?.relation) {
        Alert.alert('Eksik Bilgi', 'Yakınlık seçin.');
        return false;
      }
      if (!relativeData?.relativeFullName) {
        Alert.alert('Eksik Bilgi', 'Yakının Ad Soyad bilgisi zorunludur.');
        return false;
      }
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    if (!isReady) {
      Alert.alert('Uyarı', 'Uygulama henüz hazır değil.');
      return;
    }

    setIsBusy(true);
    try {
      const userEmail = (email || '').trim();
      const userPassword = password || '';
      const userFullName = (fullName || '').trim();
      const userPhone = phone ? String(phone).trim() : null;

      if (!userEmail || !userPassword) {
        Alert.alert('Hata', 'Kullanıcı adı veya şifre boş olamaz.');
        setIsBusy(false);
        return;
      }

      const cred = await createUserWithEmailAndPassword(auth, userEmail, userPassword);
      const uid = cred.user.uid;

      const currentPatientData = patientData ?? {};
      const currentRelativeData = relativeData ?? {};
      const patientTc = currentPatientData.tcNo ? String(currentPatientData.tcNo).trim() : '';

      const userDocRef = doc(
        db,
        'artifacts',
        appId,
        'users',
        uid,
        'users',
        uid
      );

      const userProfile = {
        uid,
        role: 'hasta',
        fullName: userFullName,
        phone: userPhone,
        patient: {
          tcNo: patientTc,
          bloodType: currentPatientData.bloodType ?? '',
          chronicDiseases: currentPatientData.chronicDiseases ?? [],
        },
        relative: showRelativeForm && currentRelativeData.relation ? {
          fullName: currentRelativeData.relativeFullName ? String(currentRelativeData.relativeFullName).trim() : '',
          phone: currentRelativeData.relativePhone ? String(currentRelativeData.relativePhone).trim() : null,
          relation: currentRelativeData.relation,
          contactPref: currentRelativeData.contactPref ?? '',
        } : null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(userDocRef, userProfile);
      Alert.alert('Başarılı', 'Kayıt tamamlandı. Şimdi giriş yapabilirsiniz.');
      navigation.navigate('LoginScreen', { autoLogin: true, email: userEmail, password: userPassword });
    } catch (e) {
      if (e?.code === 'auth/email-already-in-use') {
        Alert.alert('Hata', 'Bu e-posta adresi zaten kullanılıyor.');
      } else if (e?.code === 'auth/configuration-not-found') {
        Alert.alert('Hata', 'Firebase yapılandırma hatası: Lütfen konsolda Auth yöntemini etkinleştirin.');
      } else if (e?.code === 'permission-denied') {
        Alert.alert('Hata', 'İzin reddedildi: Firestore güvenlik kurallarınızı kontrol edin.');
      } else {
        Alert.alert('Kritik Hata', e?.message ?? 'Bilinmeyen bir hata oluştu.');
      }
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.fullScreen, { backgroundColor: COLORS.background }]}
      behavior={Platform.select({ ios: 'padding', android: 'padding' })}
      keyboardVerticalOffset={Platform.select({ ios: 0, android: -1000 })}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.innerContent}>
          <Text style={styles.title}>Hasta Kayıt Formu</Text>

          {!isReady && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.buttonPrimary} />
              <Text style={styles.loadingText}>Bağlanılıyor...</Text>
            </View>
          )}

          {isReady && (
            <>
              <View style={styles.group}>
                <Text style={styles.sectionTitle}>1. Hasta Bilgileri (Giriş Hesabı)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Hasta Ad Soyad"
                  value={fullName}
                  onChangeText={setFullName}
                  placeholderTextColor={COLORS.textPrimary + '77'}
                  editable={!isBusy}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Telefon (opsiyonel)"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                  placeholderTextColor={COLORS.textPrimary + '77'}
                  editable={!isBusy}
                />
                <TextInput
                  style={styles.input}
                  placeholder="E-posta Adresi (Giriş için kullanılacak)"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                  placeholderTextColor={COLORS.textPrimary + '77'}
                  editable={!isBusy}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Şifre"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  placeholderTextColor={COLORS.textPrimary + '77'}
                  editable={!isBusy}
                />
              </View>

              <View style={{ marginTop: 20 }}>
                <Text style={styles.sectionTitle}>2. Tıbbi Bilgiler</Text>
                <HastaForm initialValue={null} onChange={setPatientData} />
              </View>

              <View style={styles.divider} />

              {!showRelativeForm && (
                <TouchableOpacity
                  style={[styles.secondaryButton, styles.secondaryOutline]}
                  onPress={() => setShowRelativeForm(true)}
                  disabled={isBusy}
                >
                  <Text style={styles.secondaryOutlineText}>+ Hasta Yakını Bilgisi Ekle (Opsiyonel)</Text>
                </TouchableOpacity>
              )}

              {showRelativeForm && (
                <View style={{ marginTop: 20, borderWidth: 1, borderColor: COLORS.secondary, padding: 15, borderRadius: 10, backgroundColor: COLORS.secondary + '30' }}>
                  <View style={styles.relativeHeader}>
                    <Text style={styles.sectionTitle}>3. Hasta Yakını Bilgileri</Text>
                    <TouchableOpacity onPress={() => { setShowRelativeForm(false); setRelativeData({}); }}>
                      <Text style={{ color: COLORS.textPrimary, fontSize: 14, textDecorationLine: 'underline' }}>Kaldır</Text>
                    </TouchableOpacity>
                  </View>
                  <HastaYakiniForm initialValue={null} onChange={setRelativeData} />
                </View>
              )}

              <TouchableOpacity
                style={[styles.button, isBusy && styles.buttonDisabled]}
                onPress={handleRegister}
                disabled={isBusy || !isReady}
              >
                {isBusy ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.buttonText}>Kaydı Tamamla</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.outlineButton, isBusy && styles.buttonDisabled]}
                onPress={() => navigation.navigate('LoginScreen')}
                disabled={isBusy || !isReady}
              >
                <Text style={styles.outlineButtonText}>Zaten hesabın var mı? Giriş Yap</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fullScreen: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 50 },
  innerContent: { paddingHorizontal: 16, paddingVertical: 24 },
  title: { fontSize: 28, color: COLORS.textPrimary, textAlign: 'center', marginBottom: 16, fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, color: COLORS.textPrimary, marginBottom: 8, fontWeight: '600' },
  relativeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  divider: { height: 1, backgroundColor: COLORS.background, marginVertical: 20 },
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
  group: { marginTop: 8 },
  input: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.background,
    marginTop: 6,
    color: COLORS.textPrimary,
  },
  button: { backgroundColor: COLORS.buttonPrimary, padding: 15, alignItems: 'center', borderRadius: 10, marginTop: 18 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  outlineButton: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.buttonPrimary, marginTop: 8 },
  outlineButtonText: { color: COLORS.buttonPrimary, fontSize: 16, fontWeight: '700', textAlign: 'center' },
  secondaryButton: { padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  secondaryOutline: { borderWidth: 1, borderColor: COLORS.secondary, backgroundColor: COLORS.white },
  secondaryOutlineText: { color: COLORS.secondary, fontSize: 15, fontWeight: '600' },
});
