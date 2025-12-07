import React, {
  useEffect,
  useState,
  useContext,
} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Slider from '@react-native-community/slider';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

import { auth, db, appId } from '../../firebase';
import HastaForm from './hasta';
import HastaYakiniForm from './hastayakini';
import { FontContext } from './context/FontContext';

const COLORS = {
  background: '#D3E4DA',
  textPrimary: '#3C3C3C',
  buttonPrimary: '#38B07D',
  white: '#FFFFFF',
  secondary: '#96BFE7',
};

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { fontSize, updateFontSize } = useContext(FontContext);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const [patientData, setPatientData] = useState({
    tcNo: '',
    bloodType: '',
    chronicDiseases: [],
  });

  const [relatives, setRelatives] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user || user.isAnonymous) {
        setLoading(false);
        navigation.replace('LoginScreen');
        return;
      }

      setEmail(user.email || '');
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
          setFullName(data.fullName || '');
          setPhone(data.phone || '');

          const p = data.patient || {};
          setPatientData({
            tcNo: p.tcNo || '',
            bloodType: p.bloodType || '',
            chronicDiseases: Array.isArray(p.chronicDiseases)
              ? p.chronicDiseases
              : [],
          });

          const r = data.relatives;
          if (Array.isArray(r)) {
            setRelatives(
              r.map((x) => ({
                relativeFullName: x.fullName || '',
                relativePhone: x.phone || '',
                relation: x.relation || '',
                contactPref: x.contactPref || '',
              }))
            );
          } else if (data.relative) {
            setRelatives([
              {
                relativeFullName: data.relative.fullName || '',
                relativePhone: data.relative.phone || '',
                relation: data.relative.relation || '',
                contactPref: data.relative.contactPref || '',
              },
            ]);
          } else {
            setRelatives([]);
          }
        } else {
          setRelatives([]);
        }
      } catch (e) {
        console.log('Ayarlar yüklenirken hata:', e);
        Alert.alert('Hata', 'Kullanıcı verileri alınamadı.');
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [navigation]);

  const validate = () => {
    if (!fullName) {
      Alert.alert('Eksik Bilgi', 'Ad Soyad zorunludur.');
      return false;
    }
    if (!patientData?.tcNo || String(patientData.tcNo).trim().length !== 11) {
      Alert.alert('Eksik Bilgi', 'TC Kimlik No 11 hane olmalı.');
      return false;
    }
    if (!patientData?.bloodType) {
      Alert.alert('Eksik Bilgi', 'Kan grubunu seçin.');
      return false;
    }

    for (const [index, r] of relatives.entries()) {
      const hasAny =
        (r.relativeFullName && r.relativeFullName.trim() !== '') ||
        (r.relativePhone && String(r.relativePhone).trim() !== '') ||
        (r.relation && r.relation.trim() !== '') ||
        (r.contactPref && r.contactPref.trim() !== '');

      if (hasAny) {
        if (!r.relation) {
          Alert.alert(
            'Eksik Bilgi',
            `Hasta Yakını #${index + 1} için yakınlık seçin.`
          );
          return false;
        }
        if (!r.relativeFullName) {
          Alert.alert(
            'Eksik Bilgi',
            `Hasta Yakını #${index + 1} için Ad Soyad zorunludur.`
          );
          return false;
        }
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;

    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Hata', 'Kullanıcı oturumu bulunamadı.');
      return;
    }

    setSaving(true);
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

      const cleanedRelatives = (relatives ?? [])
        .map((r) => ({
          fullName: (r.relativeFullName || '').trim(),
          phone: r.relativePhone ? String(r.relativePhone).trim() : null,
          relation: r.relation || '',
          contactPref: r.contactPref || '',
        }))
        .filter(
          (r) =>
            r.fullName ||
            (r.phone && r.phone !== '') ||
            r.relation ||
            r.contactPref
        );

      const patientTc = patientData.tcNo
        ? String(patientData.tcNo).trim()
        : '';

      const payload = {
        uid: user.uid,
        role: 'hasta',
        fullName: (fullName || '').trim(),
        phone: phone ? String(phone).trim() : null,
        patient: {
          tcNo: patientTc,
          bloodType: patientData.bloodType || '',
          chronicDiseases: patientData.chronicDiseases || [],
        },
        relatives: cleanedRelatives,
        relative: cleanedRelatives.length > 0 ? cleanedRelatives[0] : null,
        updatedAt: serverTimestamp(),
      };

      await setDoc(userDocRef, payload, { merge: true });
      Alert.alert('Başarılı', 'Ayarlar kaydedildi.');
    } catch (e) {
      console.log('Ayar kaydetme hatası:', e);
      Alert.alert('Hata', e?.message ?? 'Ayarlar kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  };

  const addRelative = () => {
    setRelatives([
      ...relatives,
      {
        relation: '',
        relativeFullName: '',
        relativePhone: '',
        contactPref: '',
      },
    ]);
  };

  const removeRelative = (index) => {
    const arr = [...relatives];
    arr.splice(index, 1);
    setRelatives(arr);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.buttonPrimary} />
        <Text style={[styles.loadingText, { fontSize }]}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.fullScreen, { backgroundColor: COLORS.background }]}
    >
      <KeyboardAvoidingView
        style={styles.fullScreen}
        behavior={Platform.select({ ios: 'padding', android: 'height' })}
        keyboardVerticalOffset={Platform.select({ ios: 0, android: 0 })}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentInsetAdjustmentBehavior="automatic"
        >
          <View style={styles.innerContent}>
            <Text style={[styles.title, { fontSize: fontSize + 8 }]}>
              Ayarlar
            </Text>

            {/* Yazı boyutu ayarı */}
            <View style={{ marginTop: 10, marginBottom: 20 }}>
              <Text
                style={[
                  styles.sectionTitle,
                  { fontSize: fontSize + 2, marginBottom: 6 },
                ]}
              >
                Yazı Boyutu: {fontSize}
              </Text>
              <Slider
                style={{ width: '100%', height: 40 }}
                minimumValue={12}
                maximumValue={28}
                step={1}
                value={fontSize}
                onValueChange={updateFontSize}
                minimumTrackTintColor={COLORS.buttonPrimary}
                maximumTrackTintColor="#999"
              />
            </View>

            {/* 1. Profil Bilgileri */}
            <View style={styles.group}>
              <Text
                style={[styles.sectionTitle, { fontSize: fontSize + 2 }]}
              >
                1. Profil Bilgileri
              </Text>
              <TextInput
                style={[styles.input, { fontSize }]}
                placeholder="Ad Soyad"
                value={fullName}
                onChangeText={setFullName}
                placeholderTextColor={COLORS.textPrimary + '77'}
              />
              <TextInput
                style={[styles.input, { fontSize }]}
                placeholder="Telefon (+90)"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                placeholderTextColor={COLORS.textPrimary + '77'}
              />
              <TextInput
                style={[styles.input, { fontSize }]}
                placeholder="E-posta"
                value={email}
                editable={false}
                placeholderTextColor={COLORS.textPrimary + '77'}
              />
            </View>

            {/* 2. Tıbbi Bilgiler */}
            <View style={{ marginTop: 20 }}>
              <Text
                style={[styles.sectionTitle, { fontSize: fontSize + 2 }]}
              >
                2. Tıbbi Bilgiler
              </Text>
              <HastaForm
                initialValue={patientData}
                onChange={setPatientData}
              />
            </View>

            <View style={styles.divider} />

            {/* 3. Hasta Yakını Bilgileri */}
            <Text
              style={[styles.sectionTitle, { fontSize: fontSize + 2 }]}
            >
              3. Hasta Yakını Bilgileri
            </Text>

            {relatives.map((rel, index) => (
              <View
                key={index}
                style={{
                  marginTop: 20,
                  borderWidth: 1,
                  borderColor: COLORS.secondary,
                  padding: 15,
                  borderRadius: 10,
                  backgroundColor: COLORS.secondary + '30',
                }}
              >
                <View style={styles.relativeHeader}>
                  <Text
                    style={[
                      styles.sectionTitle,
                      { fontSize: fontSize + 1 },
                    ]}
                  >
                    Hasta Yakını #{index + 1}
                  </Text>
                  <TouchableOpacity
                    onPress={() => removeRelative(index)}
                    disabled={saving}
                  >
                    <Text
                      style={{
                        color: COLORS.textPrimary,
                        fontSize: fontSize - 1,
                        textDecorationLine: 'underline',
                      }}
                    >
                      Kaldır
                    </Text>
                  </TouchableOpacity>
                </View>

                <HastaYakiniForm
                  initialValue={rel}
                  onChange={(updated) => {
                    const arr = [...relatives];
                    arr[index] = updated;
                    setRelatives(arr);
                  }}
                />
              </View>
            ))}

            <TouchableOpacity
              style={[styles.secondaryButton, styles.secondaryOutline]}
              onPress={addRelative}
              disabled={saving}
            >
              <Text
                style={[
                  styles.secondaryOutlineText,
                  { fontSize: fontSize - 1 },
                ]}
              >
                + Yeni Hasta Yakını Ekle
              </Text>
            </TouchableOpacity>

            {/* Kaydet */}
            <TouchableOpacity
              style={[styles.button, saving && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={[styles.buttonText, { fontSize }]}>
                  Değişiklikleri Kaydet
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fullScreen: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 50 },
  innerContent: { paddingHorizontal: 16, paddingVertical: 24 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    color: COLORS.textPrimary,
    marginTop: 10,
  },
  title: {
    fontSize: 28,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    color: COLORS.textPrimary,
    marginBottom: 8,
    fontWeight: '600',
  },
  group: { marginTop: 8 },
  divider: { height: 1, backgroundColor: COLORS.background, marginVertical: 20 },
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
  relativeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  button: {
    backgroundColor: COLORS.buttonPrimary,
    padding: 15,
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 18,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  secondaryButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  secondaryOutline: {
    borderWidth: 1,
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.white,
  },
  secondaryOutlineText: {
    color: COLORS.secondary,
    fontSize: 15,
    fontWeight: '600',
  },
});
