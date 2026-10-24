import React, { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { router } from 'expo-router';
import { supabase, configured } from '@/lib/supabase';
import { Screen } from '@/components/Screen';
import { Button, Card, Field, Heading, Sub } from '@/components/UI';
import { errorMessage } from '@/lib/errors';
export default function Auth() { const [mode, setMode] = useState<'login' | 'register' | 'recover'>('login'), [email, setEmail] = useState(''), [password, setPassword] = useState(''), [name, setName] = useState(''), [busy, setBusy] = useState(false); async function submit() { if (!configured)
    return Alert.alert('Falta configuración', 'Introduce la URL y la clave pública de Supabase en .env'); if (!email.includes('@'))
    return Alert.alert('Correo inválido'); if (mode !== 'recover' && password.length < 8)
    return Alert.alert('Contraseña', 'Debe tener al menos 8 caracteres'); setBusy(true); try {
    if (mode === 'register') {
        const { error } = await supabase.auth.signUp({ email, password, options: { data: { display_name: name }, emailRedirectTo: 'apunteia://auth/callback' } });
        if (error)
            throw error;
        Alert.alert('Revisa tu correo', 'Confirma tu dirección antes de iniciar sesión.');
        setMode('login');
    }
    else if (mode === 'recover') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: 'apunteia://auth/callback' });
        if (error)
            throw error;
        Alert.alert('Correo enviado', 'Abre el enlace de recuperación enviado a tu correo.');
        setMode('login');
    }
    else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error)
            throw error;
        router.replace('/(tabs)');
    }
}
catch (e) {
    Alert.alert('No se pudo continuar', errorMessage(e));
}
finally {
    setBusy(false);
} } return <Screen><View style={{ backgroundColor: '#0876D5', borderRadius: 30, padding: 30, marginTop: 20 }}><Text style={{ color: 'white', fontSize: 38, fontWeight: '900' }}>ApunteIA ✦</Text><Text style={{ color: 'white', fontSize: 17 }}>Tus apuntes, organizados con inteligencia.</Text></View><Card><Heading>{mode === 'login' ? 'Bienvenido' : mode === 'register' ? 'Crea tu cuenta' : 'Recuperar acceso'}</Heading><Sub>Fotografía, organiza y estudia tus clases desde un solo lugar.</Sub>{mode === 'register' && <Field label="Nombre" value={name} onChangeText={setName}/>}<Field label="Correo electrónico" value={email} onChangeText={setEmail} placeholder="correo@ejemplo.com"/>{mode !== 'recover' && <Field label="Contraseña" value={password} onChangeText={setPassword} secureTextEntry/>}<Button title={mode === 'login' ? 'Iniciar sesión' : mode === 'register' ? 'Registrarme' : 'Enviar recuperación'} onPress={submit} busy={busy}/><Button secondary title={mode === 'login' ? 'Crear una cuenta' : 'Volver al inicio'} onPress={() => setMode(mode === 'login' ? 'register' : 'login')}/>{mode === 'login' && <Button secondary title="Olvidé mi contraseña" onPress={() => setMode('recover')}/>}</Card><Sub>La verificación por correo depende de tener configurado un servicio SMTP válido en Supabase.</Sub></Screen>; }
