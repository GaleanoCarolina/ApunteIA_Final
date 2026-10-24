
import { useCallback, useEffect, useRef, useState } from 'react';
import { errorMessage } from '@/lib/errors';

export function useLoad<T>(
  loader: () => Promise<T>,
  deps: unknown[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loaderRef = useRef(loader);

  useEffect(() => {
    loaderRef.current = loader;
  });

  const sequence = useRef(0);

  const reload = useCallback(async () => {
    const request = ++sequence.current;

    setLoading(true);
    setError('');

    try {
      const result = await loaderRef.current();

      if (request === sequence.current) {
        setData(result);
      }
    } catch (e) {
      if (request === sequence.current) {
        setError(errorMessage(e));
      }
    } finally {
      if (request === sequence.current) {
        setLoading(false);
      }
    }
  }, []);

  const dependencyKey = JSON.stringify(deps);

  useEffect(() => {
    // La ejecución diferida permite iniciar la carga
    // sin actualizar el estado durante el efecto.
    const task = Promise.resolve().then(() => {
      void reload();
    });

    void task;

    return () => {
      sequence.current += 1;
    };
  }, [dependencyKey, reload]);

  return {
    data,
    loading,
    error,
    reload,
  };
}
