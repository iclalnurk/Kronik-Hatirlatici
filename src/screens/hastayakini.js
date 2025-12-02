import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const RELATIONS = ['Anne','Baba','Eş','Kardeş','Çocuk','Diğer'];
const CONTACT_PREFS = ['Arama','WhatsApp','SMS'];

// 🌿 Yeşil Temalı Sağlık Uygulaması Renk Paleti (Ana dosyadaki COLORS ile uyumlu)
const COLORS = {
  background: '#D3E4DA', // Ana Arka Plan / Yumuşak Sınır
  textPrimary: '#3C3C3C', // Koyu Metin
  buttonPrimary: '#38B07D', // Zümrüt Yeşili (Vurgu)
  white: '#FFFFFF', // Form Alanı Arka Planı
  muted: '#6B7280', // Açıklama Metni (Label)
};

export default function HastaYakiniForm({ initialValue, onChange }) {
  // Yeni Alanlar: Yakının kendi bilgileri
  const [relativeFullName, setRelativeFullName] = useState(initialValue?.relativeFullName ?? '');
  const [relativePhone, setRelativePhone] = useState(initialValue?.relativePhone ?? '');
  
  // İlişki Bilgileri
  const [relation, setRelation] = useState(initialValue?.relation ?? '');
  const [contactPref, setContactPref] = useState(initialValue?.contactPref ?? '');

  

  useEffect(() => {
    onChange?.({ 
      relativeFullName,
      relativePhone,
      relation, 
      contactPref 
    });
  }, [relativeFullName, relativePhone, relation, contactPref, onChange]);

  return (
    <View style={styles.group}>
      
      {/* Yakının Kişisel Bilgileri - Ad Soyad Eklendi */}
      <Text style={styles.label}>Yakın Ad Soyad</Text>
      <TextInput
        style={styles.input}
        placeholder="Yakın Ad Soyad (Zorunlu)"
        value={relativeFullName}
        onChangeText={setRelativeFullName}
        placeholderTextColor={COLORS.textPrimary + '77'}
      />
      
      {/* Yakın Telefon */}
      <Text style={[styles.label, { marginTop: 10 }]}>Yakın Telefon</Text>
      <TextInput
        style={styles.input}
        placeholder="Yakın Telefon (Opsiyonel)"
        keyboardType={Platform.OS === 'android' ? 'number-pad' : 'numeric'}
        value={relativePhone}
        onChangeText={setRelativePhone}
        placeholderTextColor={COLORS.textPrimary + '77'}
      />

      {/* İlişki Bilgileri */}
      <Text style={[styles.label, { marginTop: 10 }]}>Yakınlık</Text>
      <View style={styles.pickerWrap}>
        <Picker 
          selectedValue={relation} 
          onValueChange={setRelation}
          itemStyle={styles.pickerItem}
          style={styles.picker}
        >
          <Picker.Item label="Seçiniz" value="" />
          {RELATIONS.map(r => <Picker.Item key={r} label={r} value={r} />)}
        </Picker>
      </View>

      <Text style={[styles.label, { marginTop: 10 }]}>İletişim Tercihi</Text>
      <View style={styles.pickerWrap}>
        <Picker 
          selectedValue={contactPref} 
          onValueChange={setContactPref}
          itemStyle={styles.pickerItem}
          style={styles.picker}
        >
          <Picker.Item label="Seçiniz" value="" />
          {CONTACT_PREFS.map(c => <Picker.Item key={c} label={c} value={c} />)}
        </Picker>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { marginTop: 8 },
  label: { fontSize: 13, color: COLORS.muted, marginBottom: 6 },
  input: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 15, paddingVertical: 12,
    borderRadius: 10, borderWidth: 1, 
    // Yumuşak sınır rengi
    borderColor: COLORS.background, 
    color: COLORS.textPrimary,
  },
  pickerWrap: {
    backgroundColor: COLORS.white, 
    borderRadius: 10, 
    borderWidth: 1, 
    // Yumuşak sınır rengi
    borderColor: COLORS.background, 
    overflow: 'hidden'
  },
  // Android'de Picker metnini kontrol etmek için
  picker: { 
    color: COLORS.textPrimary,
  },
  // iOS'ta Picker metnini kontrol etmek için
  pickerItem: {
    color: COLORS.textPrimary, 
  },
});