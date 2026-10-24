import React from 'react';
import { Pressable, Text, View, Modal, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors as c } from '@/theme';
type IconName = React.ComponentProps<typeof Ionicons>['name'];
export function TopBar({ title, subtitle, onBack, action }: {
    title: string;
    subtitle?: string;
    onBack: () => void;
    action?: React.ReactNode;
}) { return <View style={st.top}><Pressable onPress={onBack} style={st.back} accessibilityLabel="Regresar" accessibilityRole="button"><Ionicons name="arrow-back" color={c.deep} size={23}/></Pressable><View style={{ flex: 1 }}><Text numberOfLines={1} style={st.topTitle}>{title}</Text>{subtitle ? <Text style={st.sub}>{subtitle}</Text> : null}</View>{action}</View>;
  }
export function ItemRow({ title, subtitle, icon, onPress, right }: {
    title: string;
    subtitle?: string;
    icon: IconName;
    onPress: () => void;
    right?: React.ReactNode;
}) { return <Pressable style={st.item} onPress={onPress} accessibilityRole="button" accessibilityLabel={title}><View style={st.iconWrap}><Ionicons name={icon} size={23} color={c.blue}/></View><View style={{ flex: 1,
  gap: 3 }}><Text style={st.title} numberOfLines={2}>{title}</Text>{subtitle ? <Text style={st.sub} numberOfLines={2}>{subtitle}</Text> : null}</View>{right ?? <Ionicons name="chevron-forward" color="#9DACBF" size={19}/>}</Pressable>;
  }
export function PillTabs({ options, value, onChange }: {
    options: {
        key: string;
        label: string;
    }[];
    value: string;
    onChange: (key: string) => void;
}) { return <View style={st.tabs}>{options.map(x => <Pressable accessibilityRole="tab" accessibilityState={{ selected: x.key === value }} onPress={() => onChange(x.key)} key={x.key} style={[st.tab,
  x.key === value && st.tabActive]}><Text style={[st.tabText,
  x.key === value && st.tabTextActive]} numberOfLines={1}>{x.label}</Text></Pressable>)}</View>;
  }
export function Sheet({ visible, title, subtitle, onClose, children }: {
    visible: boolean;
    title: string;
    subtitle?: string;
    onClose: () => void;
    children: React.ReactNode;
}) { return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}><View style={st.overlay}><Pressable style={{ flex: 1 }} onPress={onClose} accessibilityLabel="Cerrar"/><View style={st.sheet}><View style={st.handle}/><View style={{ flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingBottom: 12 }}><View style={{ flex: 1 }}><Text style={{ color: c.text,
  fontSize: 21,
  fontWeight: '800' }}>{title}</Text>{subtitle ? <Text style={st.sub}>{subtitle}</Text> : null}</View><Pressable accessibilityLabel="Cerrar" onPress={onClose} style={st.back}><Ionicons name="close" size={22} color={c.deep}/></Pressable></View><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: 10,
  paddingBottom: 18 }}>{children}</ScrollView></View></View></Modal>;
  }
export function TinyAction({ name, onPress, label }: {
    name: IconName;
    onPress: () => void;
    label: string;
}) { return <Pressable onPress={onPress} accessibilityLabel={label} accessibilityRole="button" style={st.back}><Ionicons name={name} size={21} color={c.deep}/></Pressable>;
  }
const st = StyleSheet.create({ top: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }, back: { width: 44,
  height: 44,
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 15,
  backgroundColor: '#E8F3FC' },
  topTitle: { fontWeight: '800',
  color: c.text,
  fontSize: 24 },
  sub: { fontSize: 13,
  color: c.muted,
  lineHeight: 19 },
  item: { minHeight: 72,
  backgroundColor: 'white',
  borderWidth: 1,
  borderColor: '#E5EFF7',
  borderRadius: 19,
  flexDirection: 'row',
  alignItems: 'center',
  padding: 12,
  gap: 12 },
  iconWrap: { height: 49,
  width: 49,
  borderRadius: 16,
  backgroundColor: '#E9F5FF',
  alignItems: 'center',
  justifyContent: 'center' },
  title: { fontSize: 16,
  fontWeight: '700',
  color: c.text },
  tabs: { flexDirection: 'row',
  backgroundColor: '#E5F0FA',
  borderRadius: 16,
  padding: 4,
  gap: 3 },
  tab: { flex: 1,
  minHeight: 41,
  borderRadius: 12,
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: 4 },
  tabActive: { backgroundColor: 'white',
  elevation: 2 },
  tabText: { fontSize: 12,
  color: c.muted,
  fontWeight: '700' },
  tabTextActive: { color: c.deep },
  overlay: { flex: 1,
  backgroundColor: 'rgba(12,29,53,.48)',
  justifyContent: 'flex-end' },
  sheet: { maxHeight: '82%',
  minHeight: 200,
  borderTopLeftRadius: 29,
  borderTopRightRadius: 29,
  backgroundColor: '#F7FBFF',
  padding: 20,
  paddingBottom: 34 },
  handle: { height: 5,
  width: 45,
  backgroundColor: '#C5D4E2',
  borderRadius: 9,
  alignSelf: 'center',
  marginBottom: 18 } });
