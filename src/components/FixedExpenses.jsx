// FixedExpenses.js
import React, { useState, useEffect } from 'react';
import { db } from '../services/firebaseConfig';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { TextField, Button, Typography, List, ListItem, ListItemText } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

export default function FixedExpenses() {
  const { user } = useAuth();
  const [form, setForm] = useState({ detail: '', amount: '', dueDay: '' });
  const [fixedExpenses, setFixedExpenses] = useState([]);

  useEffect(() => {
    fetchFixedExpenses();
  }, []);

  const fetchFixedExpenses = async () => {
    const q = query(collection(db, 'fixedExpenses'), where('uid', '==', user.uid));
    const snapshot = await getDocs(q);
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setFixedExpenses(list);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAdd = async () => {
    if (!form.detail || !form.amount || !form.dueDay) return;
    await addDoc(collection(db, 'fixedExpenses'), {
      uid: user.uid,
      detail: form.detail,
      amount: parseFloat(form.amount),
      dueDay: form.dueDay
    });
    setForm({ detail: '', amount: '', dueDay: '' });
    fetchFixedExpenses();
  };

  return (
    <div style={{ padding: 16 }}>
      <Typography variant="h5">Despesas Fixas</Typography>
      <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
        <TextField label="Descrição" name="detail" value={form.detail} onChange={handleChange} />
        <TextField label="Valor" name="amount" type="number" value={form.amount} onChange={handleChange} />
        <TextField label="Dia de Vencimento" name="dueDay" type="number" inputProps={{ min: 1, max: 31 }} value={form.dueDay} onChange={handleChange} />
        <Button variant="contained" onClick={handleAdd}>Adicionar</Button>
      </div>

      <List>
        {fixedExpenses.map((item) => (
          <ListItem key={item.id}>
            <ListItemText primary={item.detail} secondary={`R$ ${item.amount.toFixed(2)} - Dia ${item.dueDay}`} />
          </ListItem>
        ))}
      </List>
    </div>
  );
}
