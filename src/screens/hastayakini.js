import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { FontContext } from './context/FontContext';

const RELATIONS = ['Anne', 'Baba', 'Eş', 'Kardeş', 'Çocuk', 'Diğer'];
const CONTACT_PREFS = ['Arama', 'WhatsApp', 'SMS'];

// Yeşil Temalı Sağlık Uygulaması Renk Paleti
const COLORS = {
  background: '#D3E4DA',
  textPrimary: '#3C3C3C',
  buttonPrimary: '#38B07D',
  white: '#FFFFFF',
  muted: '#6B7280',
};

export default function HastaYakiniForm({ initialValue, onChange }) {
  const { fontSize } = useContext(FontContext);

  // 🔹 initialValue sadece ilk mount’ta kullanılır
  const [relativeFullName, setRelativeFullName] = useState(
    initialValue?.relativeFullName ?? ''
  );
  const [relativePhone, setRelativePhone] = useState(
    initialValue?.relativePhone ?? ''
  );
  const [relation, setRelation] = useState(initialValue?.relation ?? '');
  const [contactPref, setContactPref] = useState(
    initialValue?.contactPref ?? ''
  );

  // Sadece alanlar değişince parent'a haber ver
  useEffect(() => {
    onChange?.({
      relativeFullName,
      relativePhone,
      relation,
      contactPref,
    });
  }, [relativeFullName, relativePhone, relation, contactPref]);

  return (
    <KeyboardAvoidingView>
      <View style={styles.group}>
        {/* Yakının Kişisel Bilgileri */}
        <Text style={[styles.label, { fontSize: fontSize - 1 }]}>
          Yakın Ad Soyad
        </Text>
        <TextInput
          style={[styles.input, { fontSize }]}
          placeholder="Yakın Ad Soyad (Zorunlu)"
          value={relativeFullName}
          onChangeText={setRelativeFullName}
          placeholderTextColor={COLORS.textPrimary + '77'}
        />

        {/* Yakın Telefon */}
        <Text
          style={[
            styles.label,
            { marginTop: 10, fontSize: fontSize - 1 },
          ]}
        >
          Yakın Telefon
        </Text>
        <TextInput
          style={[styles.input, { fontSize }]}
          placeholder="Yakın Telefon (+90)"
          keyboardType={
            Platform.OS === 'android' ? 'number-pad' : 'numeric'
          }
          value={relativePhone}
          onChangeText={setRelativePhone}
          placeholderTextColor={COLORS.textPrimary + '77'}
        />

        {/* Yakınlık */}
        <Text
          style={[
            styles.label,
            { marginTop: 10, fontSize: fontSize - 1 },
          ]}
        >
          Yakınlık
        </Text>
        <View style={styles.pickerWrap}>
          <Picker
            selectedValue={relation}
            onValueChange={setRelation}
            itemStyle={{ color: COLORS.textPrimary, fontSize }}
            style={{ color: COLORS.textPrimary }}
          >
            <Picker.Item label="Seçiniz" value="" />
            {RELATIONS.map((r) => (
              <Picker.Item key={r} label={r} value={r} />
            ))}
          </Picker>
        </View>

        {/* İletişim Tercihi */}
        <Text
          style={[
            styles.label,
            { marginTop: 10, fontSize: fontSize - 1 },
          ]}
        >
          İletişim Tercihi
        </Text>
        <View style={styles.pickerWrap}>
          <Picker
            selectedValue={contactPref}
            onValueChange={setContactPref}
            itemStyle={{ color: COLORS.textPrimary, fontSize }}
            style={{ color: COLORS.textPrimary }}
          >
            <Picker.Item label="Seçiniz" value="" />
            {CONTACT_PREFS.map((c) => (
              <Picker.Item key={c} label={c} value={c} />
            ))}
          </Picker>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  group: { marginTop: 8 },
  label: { fontSize: 13, color: COLORS.muted, marginBottom: 6 },
  input: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.background,
    color: COLORS.textPrimary,
  },
  pickerWrap: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.background,
    overflow: 'hidden',
  },
  picker: {
    color: COLORS.textPrimary,
  },
  pickerItem: {
    color: COLORS.textPrimary,
  },
});
