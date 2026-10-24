import React, { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Button, Field, Heading, Sub } from '@/components/UI';
import { ItemRow, Sheet, TopBar, TinyAction } from '@/components/Modern';
import { listFolders, addFolder, listNotes, listSubjects, updateSubject, deleteSubject, moveNote } from '@/lib/data';
import { useLoad } from '@/hooks/useLoad';
import { useFocusReload } from '@/hooks/useFocusReload';
import { exportNotes } from '@/lib/pdf';
export default function Subject() {
    const { id } = useLocalSearchParams<{
        id: string;
    }>();
    const folders = useLoad(() => listFolders(id), [id]), notes = useLoad(() => listNotes(id), [id]), subjects = useLoad(listSubjects,
      []);
    useFocusReload(folders.reload);
    useFocusReload(notes.reload);
    useFocusReload(subjects.reload);
    const sub = subjects.data?.find(x => x.id === id), rootFolders = (folders.data || []).filter(x => !x.parent_id),
      rootNotes = (notes.data || []).filter(x => !x.folder_id);
    const [sheet, setSheet] = useState<'folder' | 'edit' | 'move' | null>(null), [name, setName] = useState(''),
      [target,
      setTarget] = useState<string | null>(null),
      [busy,
      setBusy] = useState(false);
    async function action(fn: () => Promise<unknown>, success?: string) { setBusy(true); try {
        await fn();
        await Promise.all([folders.reload(), notes.reload(), subjects.reload()]);
        setSheet(null);
        setTarget(null);
        setName('');
        if (success)
            Alert.alert('Listo', success);
    }
    catch (e) {
        Alert.alert('No se pudo completar', String(e));
    }
    finally {
        setBusy(false);
    } }
    function confirmDelete() { Alert.alert('Eliminar materia', 'Sus apuntes permanecerán en Biblioteca sin materia asignada.',
      [{ text: 'Cancelar',
      style: 'cancel' },
      { text: 'Eliminar',
      style: 'destructive',
      onPress: () => void action(async () => { await deleteSubject(id);
      router.replace('/(tabs)/subjects');
      }) }]);
      }
    return <Screen>
 <TopBar title={sub?.name || 'Materia'} subtitle={`${notes.data?.length || 0} apuntes · ${folders.data?.length || 0} carpetas`} onBack={() => router.replace('/(tabs)/subjects')} action={<TinyAction name="ellipsis-horizontal" label="Opciones de materia" onPress={() => Alert.alert('Materia', sub?.name || '', [{ text: 'Cambiar nombre', onPress: () => { setName(sub?.name || ''); setSheet('edit'); } }, { text: sub?.archived ? 'Desarchivar' : 'Archivar', onPress: () => void action(() => updateSubject(id, { archived: !sub?.archived }), 'Materia actualizada') }, { text: 'Eliminar materia', style: 'destructive', onPress: confirmDelete }, { text: 'Cancelar', style: 'cancel' }])}/>}/>
 <View style={{ backgroundColor: '#0868C4', borderRadius: 23, padding: 20, gap: 7 }}><Text style={{ color: '#DFEEFF', fontSize: 13, fontWeight: '600' }}>TU ESPACIO DE ESTUDIO</Text><Text style={{ color: 'white', fontWeight: '800', fontSize: 23 }}>{sub?.name || 'Materia'}</Text><Text style={{ color: '#DBECFF' }}>{notes.data?.length || 0} apuntes organizados</Text><Button title="Escanear nuevo apunte" onPress={() => router.push({ pathname: '/capture', params: { subject: id } })}/></View>
 <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}><Heading>Carpetas</Heading><TinyAction name="add" label="Crear carpeta" onPress={() => { setName(''); setSheet('folder'); }}/></View>
 {rootFolders.map(f => <ItemRow key={f.id} title={f.name} subtitle={`${(notes.data || []).filter(n => n.folder_id === f.id).length} apuntes · Abrir`} icon="folder-outline" onPress={() => router.push({ pathname: '/folder/[id]', params: { id: f.id, subject: id } })}/>)}
 {rootFolders.length === 0 && <View style={{ backgroundColor: '#E9F4FC', padding: 18, borderRadius: 18 }}><Sub>Todavía no tienes carpetas. Pulsa + para organizar por unidad o tema.</Sub></View>}
 <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}><Heading>Sin carpeta</Heading><TinyAction name="document-text-outline" label="Exportar materia" onPress={() => void exportNotes(notes.data || [], sub?.name || 'Materia').catch(e => Alert.alert('PDF', String(e)))}/></View>
 {rootNotes.map(n => <ItemRow key={n.id} title={n.title} subtitle={n.processing_status === 'completado' ? 'Listo para estudiar' : n.processing_status} icon="document-text-outline" onPress={() => router.push(`/note/${n.id}`)} right={<TinyAction name="ellipsis-vertical" label={`Mover ${n.title}`} onPress={() => { setTarget(n.id); setSheet('move'); }}/>}/>)}
 {rootNotes.length === 0 && <Sub>Los apuntes que no estén en carpetas aparecerán aquí.</Sub>}
 <Sheet visible={sheet === 'folder'} title="Crear carpeta" subtitle="Ponle un nombre corto y descriptivo" onClose={() => setSheet(null)}><Field label="Nombre de carpeta" value={name} onChangeText={setName} placeholder="Ej. Unidad 1"/><Button title="Crear carpeta" disabled={!name.trim()} busy={busy} onPress={() => void action(() => addFolder(id, name.trim()))}/></Sheet>
 <Sheet visible={sheet === 'edit'} title="Cambiar nombre" subtitle="Actualiza el nombre de esta materia" onClose={() => setSheet(null)}><Field label="Nombre de la materia" value={name} onChangeText={setName}/><Button title="Guardar cambios" disabled={!name.trim()} busy={busy} onPress={() => void action(() => updateSubject(id, { name: name.trim() }))}/></Sheet>
 <Sheet visible={sheet === 'move'} title="Mover apunte" subtitle="Selecciona la carpeta de destino" onClose={() => setSheet(null)}><ItemRow title="Sin carpeta" subtitle="En la raíz de la materia" icon="home-outline" onPress={() => target && void action(() => moveNote(target, id, null))}/>{(folders.data || []).map(f => <ItemRow key={f.id} title={f.name} icon="folder-outline" onPress={() => target && void action(() => moveNote(target, id, f.id))}/>)}</Sheet>
 </Screen>;
}
