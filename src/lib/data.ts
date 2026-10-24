import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';
import { newId } from './uuid';
import { supabase } from './supabase';
import { cacheItems, localItems, queueWrite } from './db';
import type { Subject, Folder, Note, Asset, Flashcard } from '@/types';
const uid = async () => { const { data, error } = await supabase.auth.getUser(); if (error || !data.user)
    throw new Error('Inicia sesión para continuar'); return data.user.id; };
export async function listSubjects(): Promise<Subject[]> { const { data, error } = await supabase.from('subjects').select('*').order('name'); if (error) {
    const local = await localItems<Subject>('subjects');
    if (local.length)
        return local;
    throw error;
} await cacheItems('subjects', data); return data as Subject[]; }
export async function addSubject(name: string) { const user_id = await uid(); const object = { id: newId(), user_id, name: name.trim(), color: '#0876D5', archived: false }; const { error } = await supabase.from('subjects').insert(object); if (error) {
    await queueWrite('subject', object);
    await cacheItems('subjects', [object as Subject]);
    return 'pendiente' as const;
} return 'guardado' as const; }
export async function updateSubject(id: string, patch: Partial<Subject>) { const { error } = await supabase.from('subjects').update(patch).eq('id', id); if (error)
    throw error; }
export async function listFolders(subject_id: string): Promise<Folder[]> { const { data, error } = await supabase.from('folders').select('*').eq('subject_id', subject_id).order('name'); if (error)
    throw error; return data as Folder[]; }
export async function addFolder(subject_id: string, name: string, parent_id: string | null = null) { const user_id = await uid(); const { error } = await supabase.from('folders').insert({ id: newId(), user_id, subject_id, name, parent_id }); if (error)
    throw error; }
export async function listNotes(subject_id?: string, deleted = false): Promise<Note[]> { let q = supabase.from('notes').select('*').order('updated_at', { ascending: false }).limit(100); q = deleted ? q.not('deleted_at', 'is', null) : q.is('deleted_at', null); if (subject_id)
    q = q.eq('subject_id', subject_id); const { data, error } = await q; if (error) {
    const local = await localItems<Note>('notes');
    if (local.length)
        return local.filter(n => (!subject_id || n.subject_id === subject_id) && (deleted ? !!n.deleted_at : !n.deleted_at));
    throw error;
} await cacheItems('notes', data); return data as Note[]; }
export async function getNote(id: string) { const { data, error } = await supabase.from('notes').select('*').eq('id', id).single(); if (error)
    throw error; return data as Note; }
export async function saveNote(note: Partial<Note> & {
    id: string;
}) { const { error } = await supabase.from('notes').update(note).eq('id', note.id); if (error)
    throw error; }
export async function newNote(title: string, subject_id: string | null, folder_id: string | null) { const user_id = await uid(); const id = newId(); const { error } = await supabase.from('notes').insert({ id, user_id, subject_id, folder_id, title, processing_status: 'pendiente' }); if (error)
    throw error; return id; }
export async function noteAssets(note_id: string) { const { data, error } = await supabase.from('note_assets').select('*').eq('note_id', note_id).order('page_order'); if (error)
    throw error; return data as Asset[]; }
export async function addAsset(note_id: string, uri: string, index: number) {
    const user_id = await uid();
    // Leer la fotografía real del dispositivo.
    const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
    });
    if (!base64) {
        throw new Error('No se pudo leer la fotografía.');
    }
    // Convertir Base64 a bytes reales.
    const arrayBuffer = decode(base64);
    const bytes = new Uint8Array(arrayBuffer);
    // Verificar que realmente sea una imagen JPEG.
    const isJPEG = bytes.length >= 3 &&
        bytes[0] === 0xff &&
        bytes[1] === 0xd8 &&
        bytes[2] === 0xff;
    if (!isJPEG) {
        throw new Error('La fotografía no está en formato JPEG válido. ' +
            'Necesita convertirse antes de subirla.');
    }
    if (arrayBuffer.byteLength > 8 * 1024 * 1024) {
        throw new Error('La fotografía supera el límite de 8 MB.');
    }
    const path = `${user_id}/${note_id}/${newId()}.jpg`;
    const { error: uploadError } = await supabase.storage
        .from('note-images')
        .upload(path, arrayBuffer, {
        contentType: 'image/jpeg',
        upsert: false,
    });
    if (uploadError) {
        throw new Error('No se pudo subir la fotografía: ' +
            uploadError.message);
    }
    const { error: dbError } = await supabase
        .from('note_assets')
        .insert({
        id: newId(),
        user_id,
        note_id,
        storage_path: path,
        mime: 'image/jpeg',
        page_order: index,
        size_bytes: arrayBuffer.byteLength,
    });
    if (dbError) {
        // Evitar dejar un archivo sin registro asociado.
        await supabase.storage
            .from('note-images')
            .remove([path]);
        throw new Error('No se pudo registrar la fotografía: ' +
            dbError.message);
    }
}
export async function analyzeNote(note_id: string) {
    const { data, error } = await supabase.functions.invoke('analyze-note', {
        body: { note_id }
    });
    if (error) {
        let message = error.message;
        const context = error.context;
        if (context instanceof Response) {
            try {
                const result: unknown = await context.json();
                if (result &&
                    typeof result === 'object' &&
                    'error' in result &&
                    typeof result.error === 'string') {
                    message = result.error;
                }
            }
            catch {
                // Conservar el mensaje original si la respuesta no es JSON.
            }
        }
        throw new Error(message);
    }
    return data;
}
export async function deleteSubject(id: string) { const { error: moveError } = await supabase.from('notes').update({ subject_id: null, folder_id: null }).eq('subject_id', id); if (moveError)
    throw moveError; const { error } = await supabase.from('subjects').delete().eq('id', id); if (error)
    throw error; }
export async function deleteFolder(id: string) { const { error: moveError } = await supabase.from('notes').update({ folder_id: null }).eq('folder_id', id); if (moveError)
    throw moveError; const { error } = await supabase.from('folders').delete().eq('id', id); if (error)
    throw error; }
export async function moveNote(id: string, subject_id: string | null, folder_id: string | null) { await saveNote({ id, subject_id, folder_id }); }
export async function deleteNoteForever(id: string) { const { data: assets, error: assetError } = await supabase.from('note_assets').select('storage_path').eq('note_id', id); if (assetError)
    throw assetError; const paths = (assets || []).map(a => a.storage_path); if (paths.length) {
    const { error } = await supabase.storage.from('note-images').remove(paths);
    if (error)
        throw error;
} const { error } = await supabase.from('notes').delete().eq('id', id); if (error)
    throw error; }
export async function cards(note_id: string) { const { data, error } = await supabase.from('flashcards').select('*').eq('note_id', note_id).order('created_at'); if (error)
    throw error; return data as Flashcard[]; }
export async function createCard(note_id: string, question: string, answer: string) { const user_id = await uid(); const { error } = await supabase.from('flashcards').insert({ id: newId(), user_id, note_id, question, answer }); if (error)
    throw error; }
export async function gradeCard(card: Flashcard, correct: boolean) { const days = correct ? Math.max(1, Math.round((card.interval_days || 1) * 2.5)) : 1; const due = new Date(Date.now() + days * 86400000).toISOString(); const { error } = await supabase.from('flashcards').update({ interval_days: days, due_at: due }).eq('id', card.id); if (error)
    throw error; }
export async function searchNotes(query: string) { const { data, error } = await supabase.from('notes').select('*').is('deleted_at', null).or(`title.ilike.%${query.replace(/[,()%]/g, '')}%,raw_text.ilike.%${query.replace(/[,()%]/g, '')}%,edited_text.ilike.%${query.replace(/[,()%]/g, '')}%,ai_summary.ilike.%${query.replace(/[,()%]/g, '')}%`).limit(50); if (error)
    throw error; return data as Note[]; }
export async function syncPending() { const { syncQueue } = await import('./sync'); return syncQueue(); }
