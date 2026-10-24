import React, { useState } from 'react';
import { Alert, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Button, Heading, Sub } from '@/components/UI';
import { ItemRow, PillTabs, TinyAction } from '@/components/Modern';
import { listNotes, saveNote, deleteNoteForever } from '@/lib/data';
import { useLoad } from '@/hooks/useLoad';
import { useFocusReload } from '@/hooks/useFocusReload';
import { exportNotes } from '@/lib/pdf';
export default function Library() {
    const [filter, setFilter] = useState('todos');
    const { data, loading, error, reload } = useLoad(() => listNotes(undefined, filter === 'papelera'), [filter]);
    useFocusReload(reload);
    const filtered = (data || []).filter(n => filter === 'favoritos' ? n.favorite : filter === 'pendientes' ? n.processing_status !== 'completado' : true);
    async function run(fn: () => Promise<unknown>) { try {
        await fn();
        await reload();
    }
    catch (e) {
        Alert.alert('No se pudo completar', String(e));
    } }
    return <Screen><View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}><View><Heading>Biblioteca</Heading><Sub>Todos tus apuntes en un lugar</Sub></View><TinyAction name="search" label="Buscar apuntes" onPress={() => router.push('/search')}/></View>
 <PillTabs value={filter} onChange={setFilter} options={[{ key: 'todos', label: 'Todos' }, { key: 'favoritos',
   label: 'Favoritos' },
   { key: 'pendientes',
   label: 'Pendientes' },
   { key: 'papelera',
   label: 'Papelera' }]}/>
 {filter === 'todos' && !!filtered.length && <Button secondary title="Exportar biblioteca a PDF" onPress={() => void exportNotes(filtered,
   'Mi biblioteca').catch(e => Alert.alert('PDF',
   String(e)))}/>}
 {loading && <Sub>Cargando apuntes...</Sub>}{error && <Sub>{error}</Sub>}
 {filtered.map(n => <ItemRow key={n.id} title={(n.favorite ? '★ ' : '') + n.title} subtitle={`${n.processing_status} · ${new Date(n.created_at).toLocaleDateString('es-GT')}`} icon={filter === 'papelera' ? 'trash-outline' : 'document-text-outline'} onPress={() => filter === 'papelera' ? Alert.alert('Apunte eliminado', n.title, [{ text: 'Restaurar', onPress: () => void run(() => saveNote({ id: n.id, deleted_at: null })) }, { text: 'Eliminar para siempre', style: 'destructive', onPress: () => Alert.alert('Confirmar', 'Esta operación no se puede deshacer.', [{ text: 'Cancelar' }, { text: 'Eliminar', style: 'destructive', onPress: () => void run(() => deleteNoteForever(n.id)) }]) }, { text: 'Cancelar' }]) : router.push(`/note/${n.id}`)} right={filter === 'papelera' ? <TinyAction name="refresh" label={`Restaurar ${n.title}`} onPress={() => void run(() => saveNote({ id: n.id, deleted_at: null }))}/> : undefined}/>)}
 {!filtered.length && !loading && <View style={{ padding: 24, backgroundColor: '#E8F4FF', borderRadius: 20 }}><Sub>{filter === 'papelera' ? 'Tu papelera está vacía.' : 'No encontramos apuntes en esta sección.'}</Sub></View>}
 </Screen>;
}
