import React, {
  useEffect,
  useMemo,
  useState,
  useContext,
} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DropDownPicker from 'react-native-dropdown-picker';
import { FontContext } from './context/FontContext';

const BLOOD_TYPES = [
  '0 Rh+',
  '0 Rh-',
  'A Rh+',
  'A Rh-',
  'B Rh+',
  'B Rh-',
  'AB Rh+',
  'AB Rh-',
];

// Yaşlılarda sık görülen kronikler
const ELDERLY_DISEASES = [
  'Hipertansiyon',
  'Tip 2 Diyabet',
  'Koroner Arter Hastalığı',
  'Kalp Yetmezliği',
  'Atrial Fibrilasyon',
  'Hiperkolesterolemi',
  'İnme Sekeli',
  'KOAH',
  'Astım',
  'Kronik Böbrek Hastalığı',
  'Demans / Alzheimer',
  'Parkinson Hastalığı',
  'Osteoporoz',
  'Osteoartrit (Kireçlenme)',
  'Romatoid Artrit',
  'Kronik Karaciğer Hastalığı',
  'Gut',
  'Anemi',
  'Prostat Büyümesi (BPH)',
  'İdrar Kaçırma (İnkontinans)',
  'Depresyon',
  'Anksiyete',
  'Tiroid Hastalığı (Hipo/Hiper)',
  'Kanser (öykü/tedavi)',
];

// Yeşil Temalı Sağlık Uygulaması Renk Paleti
const COLORS = {
  background: '#D3E4DA', // Ana Arka Plan / Yumuşak Sınır
  textPrimary: '#3C3C3C', // Koyu Metin
  buttonPrimary: '#38B07D', // Zümrüt Yeşili (Vurgu)
  white: '#FFFFFF', // Form Alanı Arka Planı
  muted: '#6B7280', // Açıklama Metni (Label)
};

export default function HastaForm({ initialValue, onChange }) {
  const { fontSize } = useContext(FontContext);

  // 🔹 initialValue SADECE ilk mount’ta kullanılır
  const [tcNo, setTcNo] = useState(initialValue?.tcNo ?? '');
  const [bloodType, setBloodType] = useState(initialValue?.bloodType ?? '');
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(
    ELDERLY_DISEASES.map((x) => ({ label: x, value: x }))
  );
  const [selected, setSelected] = useState(
    initialValue?.chronicDiseases ?? []
  );
  const [custom, setCustom] = useState('');

  const chronicDiseases = useMemo(() => {
    const s = new Set(
      (selected || [])
        .map((v) => String(v).trim())
        .filter(Boolean)
    );
    (custom || '')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .forEach((t) => s.add(t));
    return Array.from(s);
  }, [selected, custom]);

  // 🔑 Parent'a sadece değerler değişince haber veriyoruz
  //    onChange'i dependency listesine KOYMADIK → loop olmaz
  useEffect(() => {
    onChange?.({ tcNo, bloodType, chronicDiseases });
  }, [tcNo, bloodType, chronicDiseases]);

  return (
    <KeyboardAvoidingView>
      <View style={styles.group}>
        <Text style={[styles.label, { fontSize: fontSize - 1 }]}>
          TC Kimlik No
        </Text>
        <TextInput
          style={[styles.input, { fontSize }]}
          placeholder="11 hane"
          keyboardType={
            Platform.OS === 'android' ? 'number-pad' : 'numeric'
          }
          value={tcNo}
          onChangeText={setTcNo}
          maxLength={11}
          placeholderTextColor={COLORS.textPrimary + '77'}
        />

        <Text
          style={[
            styles.label,
            { marginTop: 10, fontSize: fontSize - 1 },
          ]}
        >
          Kan Grubu
        </Text>
        <View style={styles.pickerWrap}>
          <Picker
            selectedValue={bloodType}
            onValueChange={setBloodType}
            itemStyle={{ color: COLORS.textPrimary, fontSize }}
            style={{ color: COLORS.textPrimary }}
          >
            <Picker.Item label="Seçiniz" value="" />
            {BLOOD_TYPES.map((bt) => (
              <Picker.Item key={bt} label={bt} value={bt} />
            ))}
          </Picker>
        </View>

        <Text
          style={[
            styles.label,
            { marginTop: 10, fontSize: fontSize - 1 },
          ]}
        >
          Kronik Hastalıklar
        </Text>
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
            placeholderStyle={[
              styles.ddpPlaceholder,
              { fontSize: fontSize - 1 },
            ]}
            labelStyle={[styles.ddpLabel, { fontSize }]}
            selectedItemContainerStyle={styles.ddpSelectedItemContainer}
            selectedItemLabelStyle={[
              styles.ddpSelectedItemLabel,
              { fontSize },
            ]}
            badgeColors={[COLORS.buttonPrimary]}
            badgeTextStyle={{
              color: COLORS.white,
              fontWeight: 'bold',
              fontSize: fontSize - 2,
            }}
          />
        </View>

        <Text
          style={[
            styles.label,
            { marginTop: 10, fontSize: fontSize - 1 },
          ]}
        >
          Diğer (elle ekle)
        </Text>
        <TextInput
          style={[styles.input, { fontSize }]}
          placeholder="Virgülle ayırarak yazabilirsiniz"
          value={custom}
          onChangeText={setCustom}
          placeholderTextColor={COLORS.textPrimary + '77'}
        />
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
    borderColor: COLORS.background, // Yumuşak sınır rengi
    color: COLORS.textPrimary,
  },
  pickerWrap: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.background, // Yumuşak sınır rengi
    overflow: 'hidden',
  },
  ddp: {
    borderColor: COLORS.background,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    minHeight: 50,
  },
  ddpMenu: {
    borderColor: COLORS.background,
    backgroundColor: COLORS.white,
  },
  ddpPlaceholder: {
    color: COLORS.muted,
  },
  ddpLabel: {
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  ddpSelectedItemContainer: {
    backgroundColor: COLORS.buttonPrimary + '20',
  },
  ddpSelectedItemLabel: {
    color: COLORS.buttonPrimary,
  },
});
