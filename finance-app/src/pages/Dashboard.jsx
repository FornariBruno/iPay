import React, { useEffect, useState } from 'react';
import { db } from '../firebase/config';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
  updateDoc
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

import {
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Box,
  MenuItem,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

export default function Dashboard() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({
    amount: '',
    type: 'Receita',
    paymentDate: '',
    dueDate: '',
    detail: '',
    status: 'Pago'
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'transactions'), where('uid', '==', user.uid));
    const unsubscribe = onSnapshot(q, snapshot => {
      setTransactions(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
    });
    return unsubscribe;
  }, [user.uid]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async () => {
    if (!form.amount.trim()) return;

    if (editingId) {
      const ref = doc(db, 'transactions', editingId);
      await updateDoc(ref, {
        ...form,
        amount: parseFloat(form.amount),
      });
      setEditingId(null);
    } else {
      await addDoc(collection(db, 'transactions'), {
        uid: user.uid,
        amount: parseFloat(form.amount),
        type: form.type,
        paymentDate: form.paymentDate,
        dueDate: form.dueDate,
        detail: form.detail,
        status: form.status,
        date: new Date()
      });
    }

    setForm({
      amount: '',
      type: 'Receita',
      paymentDate: '',
      dueDate: '',
      detail: '',
      status: 'Pago'
    });
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'transactions', id));
  };

  const handleEdit = (tx) => {
    setForm({
      amount: tx.amount,
      type: tx.type,
      paymentDate: tx.paymentDate || '',
      dueDate: tx.dueDate || '',
      detail: tx.detail || '',
      status: tx.status || 'Pago'
    });
    setEditingId(tx.id);
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#1e1e1e',
    }}> 
      <Container maxWidth="lg">
        <Paper elevation={3} sx={{ padding: 4, marginTop: 8 }}>
          <Typography variant="h4" gutterBottom>Dashboard Financeiro</Typography>

          {/* Formulário */}
          <Box display="flex" flexWrap="wrap" gap={2} mb={3}>
            <TextField name="amount" label="Valor" value={form.amount} onChange={handleChange} />
            <TextField
              select name="type" label="Tipo" value={form.type} onChange={handleChange}
            >
              <MenuItem value="Receita">Receita</MenuItem>
              <MenuItem value="Despesa">Despesa</MenuItem>
            </TextField>
            <TextField
              name="dueDate"
              label="Data de Vencimento"
              type="date"
              value={form.dueDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              name="paymentDate"
              label="Data de Pagamento"
              type="date"
              value={form.paymentDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
            <TextField name="detail" label="Detalhamento" value={form.detail} onChange={handleChange} />
            <TextField
              select name="status" label="Status" value={form.status} onChange={handleChange}
            >
              <MenuItem value="Pago">Pago</MenuItem>
              <MenuItem value="Não Pago">Não Pago</MenuItem>
            </TextField>
            <Button variant="contained" onClick={handleAdd}>
              {editingId ? 'Salvar Alterações' : 'Adicionar'}
            </Button>
          </Box>

          {/* Tabela de Transações */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align='center'>Data de Inclusão</TableCell>
                  <TableCell align='center'>Tipo</TableCell>
                  <TableCell align='center'>Data Vencimento</TableCell>
                  <TableCell align='center'>Data Pagamento</TableCell>
                  <TableCell align='center'>Detalhamento</TableCell>
                  <TableCell align='center'>Valor</TableCell>
                  <TableCell align='center'>Status</TableCell>
                  <TableCell align='center'>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map(tx => (
                  <TableRow key={tx.id}>
                    <TableCell align='center'>{new Date(tx.date.seconds * 1000).toLocaleDateString()}</TableCell>
                    <TableCell align='center'>{tx.type}</TableCell>
                    <TableCell align='center'>{tx.dueDate || '-'}</TableCell>
                    <TableCell align='center'>{tx.paymentDate || '-'}</TableCell>
                    <TableCell align='center'>{tx.detail}</TableCell>
                    <TableCell align='center'>R$ {parseFloat(tx.amount).toFixed(2)}</TableCell>
                    <TableCell align='center'>
                      <span style={{
                        color: tx.status === 'Pago' ? 'green' : 'red',
                        fontWeight: 'bold'
                      }}>
                        {tx.status}
                      </span>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton onClick={() => handleEdit(tx)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(tx.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>
    </Box>
  );
}
