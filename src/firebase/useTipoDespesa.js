// src/hooks/useTiposDespesa.js
import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';

export function useTiposDespesa() {
  const { user } = useAuth();
  const [tipos, setTipos] = useState([]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'tiposDespesa'),
      where('uid', 'in', [user.uid, 'padrao']) // pega personalizados e padrão
    );

    const unsubscribe = onSnapshot(q, snapshot => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        nome: doc.data().nome,
      }));
      setTipos(data);
    });

    return unsubscribe;
  }, [user]);

  return tipos;
}
