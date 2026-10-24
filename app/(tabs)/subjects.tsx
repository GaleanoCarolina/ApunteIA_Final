import React, { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Button, Field, Heading, Sub } from '@/components/UI';
import { ItemRow, PillTabs, Sheet, TinyAction } from '@/components/Modern';
import { listSubjects, addSubject } from '@/lib/data';
import { useLoad } from '@/hooks/useLoad';
import { useFocusReload } from '@/hooks/useFocusReload';
export default function Subjects() {
    const { data, error, loading, reload } = useLoad(listSubjects, []);
    useFocusReload(reload);
    const [name, setName] = useState(''), [busy, setBusy] = useState(false), [archived, setArchived] = useState('active'),
      [creating,
      setCreating] = useState(false);
    async function create() { if (!name.trim())
        return; setBusy(true); try {
        const status = await addSubject(name.trim());
        setName('');
        setCreating(false);
        await reload();
        if (status === 'pendiente')
            Alert.alert('Pendiente de sincronización', 'Materia guardada localmente. Sincroniza al recuperar conexión.');
    }
    catch (e) {
        Alert.alert('No se pudo crear', String(e));
    }
    finally {
        setBusy(false);
    } }
    const filtered = (data || []).filter(s => s.archived === (archived === 'archived'));
    return <Screen><View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}><View><Heading>Mis materias</Heading><Sub>Tu espacio de aprendizaje</Sub></View><TinyAction name="add" label="Crear materia" onPress={() => setCreating(true)}/></View>
 <PillTabs value={archived} onChange={setArchived} options={[{ key: 'active', label: 'Activas' }, { key: 'archived',
   label: 'Archivadas' }]}/>
 {filtered.map(item => <ItemRow key={item.id} title={item.name} icon="book-outline" subtitle={item.archived ? 'Archivada · Abrir ajustes' : 'Abrir materia'} onPress={() => router.push(`/subject/${item.id}`)}/>)}
 {loading && <Sub>Cargando materias...</Sub>}{error && <Sub>{error}</Sub>}{filtered.length === 0 && !loading && <View style={{ borderRadius: 20, backgroundColor: '#E8F4FF', padding: 23, gap: 8, alignItems: 'center' }}><Text style={{ fontSize: 36 }}>📚</Text><Text style={{ fontSize: 17, fontWeight: '800', color: '#0752A1' }}>{archived === 'active' ? 'Comienza con tu primera materia' : 'No hay materias archivadas'}</Text><Sub>{archived === 'active' ? 'Toca el símbolo + para crearla.' : 'Aquí aparecerán las materias que archives.'}</Sub></View>}
 <Sheet title="Nueva materia" subtitle="Puedes cambiar su nombre más adelante" visible={creating} onClose={() => setCreating(false)}><Field label="Nombre de la materia" value={name} onChangeText={setName} placeholder="Ej. Programación II"/><Button title="Crear materia" busy={busy} disabled={!name.trim()} onPress={() => void create()}/></Sheet>
 </Screen>;
}
