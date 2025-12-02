import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DropDownPicker from 'react-native-dropdown-picker';

const BLOOD_TYPES = ['0 Rh+', '0 Rh-', 'A Rh+', 'A Rh-', 'B Rh+', 'B Rh-', 'AB Rh+', 'AB Rh-'];

// Yaşlılarda sık görülen kronikler
const ELDERLY_DISEASES = [
  'Hipertansiyon','Tip 2 Diyabet','Koroner Arter Hastalığı','Kalp Yetmezliği',
  'Atrial Fibrilasyon','Hiperkolesterolemi','İnme Sekeli','KOAH','Astım',
  'Kronik Böbrek Hastalığı','Demans / Alzheimer','Parkinson Hastalığı',
  'Osteoporoz','Osteoartrit (Kireçlenme)','Romatoid Artrit',
  'Kronik Karaciğer Hastalığı','Gut','Anemi','Prostat Büyümesi (BPH)',
  'İdrar Kaçırma (İnkontinans)','Depresyon','Anksiyete',
  'Tiroid Hastalığı (Hipo/Hiper)','Kanser (öykü/tedavi)'
];

// 🌿 Yeşil Temalı Sağlık Uygulaması Renk Paleti (Ana dosyadaki COLORS ile uyumlu)
const COLORS = {
  background: '#D3E4DA', // Ana Arka Plan / Yumuşak Sınır
  textPrimary: '#3C3C3C', // Koyu Metin
  buttonPrimary: '#38B07D', // Zümrüt Yeşili (Vurgu)
  white: '#FFFFFF', // Form Alanı Arka Planı
  muted: '#6B7280', // Açıklama Metni (Label)
};

export default function HastaForm({ initialValue, onChange }) {
  const [tcNo, setTcNo] = useState(initialValue?.tcNo ?? '');
  const [bloodType, setBloodType] = useState(initialValue?.bloodType ?? '');
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(ELDERLY_DISEASES.map(x => ({ label: x, value: x })));
  const [selected, setSelected] = useState(initialValue?.chronicDiseases ?? []);
  const [custom, setCustom] = useState('');

  const chronicDiseases = useMemo(() => {
    const s = new Set(selected.map(v => v.trim()).filter(Boolean));
    (custom || '').split(',').map(t => t.trim()).filter(Boolean).forEach(t => s.add(t));
    return Array.from(s);
  }, [selected, custom]);

 

  useEffect(() => {
    onChange?.({ tcNo, bloodType, chronicDiseases });
  }, [tcNo, bloodType, chronicDiseases, onChange]);

  return (
    <View style={styles.group}>
      <Text style={styles.label}>TC Kimlik No</Text>
      <TextInput
        style={styles.input}
        placeholder="11 hane"
        keyboardType={Platform.OS === 'android' ? 'number-pad' : 'numeric'}
        value={tcNo}
        onChangeText={setTcNo}
        maxLength={11}
        placeholderTextColor={COLORS.textPrimary + '77'}
      />

      <Text style={[styles.label, { marginTop: 10 }]}>Kan Grubu</Text>
      <View style={styles.pickerWrap}>
        <Picker 
          selectedValue={bloodType} 
          onValueChange={setBloodType}
          itemStyle={styles.pickerItem}
          style={styles.picker}
        >
          <Picker.Item label="Seçiniz" value="" />
          {BLOOD_TYPES.map(bt => <Picker.Item key={bt} label={bt} value={bt} />)}
        </Picker>
      </View>

      <Text style={[styles.label, { marginTop: 10 }]}>Kronik Hastalıklar</Text>
      <View style={{ zIndex: 1000 }}>
        <DropDownPicker
          open={open}
          value={selected}
          items={items}
          setOpen={setOpen}
          setValue={setSelected}
          setItems={setItems}
          multiple
          searchable
          mode="BADGE"
          listMode="MODAL"
          modalTitle="Kronik Hastalık Seç"
          placeholder="Seçiniz (birden fazla)"
          style={styles.ddp}
          dropDownContainerStyle={styles.ddpMenu}
          placeholderStyle={styles.ddpPlaceholder}
          labelStyle={styles.ddpLabel}
          selectedItemContainerStyle={styles.ddpSelectedItemContainer}
          selectedItemLabelStyle={styles.ddpSelectedItemLabel} 
          badgeColors={[COLORS.buttonPrimary]}
          badgeTextStyle={{ color: COLORS.white, fontWeight: 'bold' }} 
        />
      </View>

      <Text style={[styles.label, { marginTop: 10 }]}>Diğer (elle ekle)</Text>
      <TextInput
        style={styles.input}
        placeholder="Virgülle ayırarak yazabilirsiniz"
        value={custom}
        onChangeText={setCustom}
        placeholderTextColor={COLORS.textPrimary + '77'}
      />
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
  ddp: { 
    borderColor: COLORS.background, // Yumuşak sınır
    borderRadius: 10, 
    backgroundColor: COLORS.white,
    minHeight: 50,
  },
  ddpMenu: { 
    borderColor: COLORS.background, 
    backgroundColor: COLORS.white 
  },
  ddpPlaceholder: { 
    color: COLORS.muted 
  },
  ddpLabel: { 
    color: COLORS.textPrimary, 
    fontSize: 14 
  },
  ddpSelectedItemContainer: { 
    backgroundColor: COLORS.buttonPrimary + '20', // Açık yeşil vurgu
  },
  ddpSelectedItemLabel: {
    color: COLORS.buttonPrimary, // Zümrüt yeşili metin
  }
});