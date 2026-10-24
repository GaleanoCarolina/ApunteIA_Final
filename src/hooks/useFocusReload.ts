import {useFocusEffect} from 'expo-router';
import {useCallback} from 'react';
export function useFocusReload(reload:()=>Promise<unknown>){
 useFocusEffect(useCallback(()=>{void reload();},[reload]));
}
