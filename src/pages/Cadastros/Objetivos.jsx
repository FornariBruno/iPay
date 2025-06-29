import React, { useEffect, useState, useRef } from 'react';
import {
  Container, Typography, TextField, Button, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, IconButton, Box
} from '@mui/material';
import { db } from '../../firebase/config';
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, query, where } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function Objetivos() {
  const { user } = useAuth();
  const [objetivos, setObjetivos] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const formRef = useRef();

  const [form, setForm] = useState({
    titulo: '',
    valorEstimado: '',
    valorAtual: '',
    dataExpectativa: ''
  });

  useEffect(() => {
    const q = query(collection(db, 'objetivos'), where('uid', '==', user.uid));
    const unsubscribe = onSnapshot(q, snapshot => {
      setObjetivos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, [user.uid]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async () => {
    const novo = {
      ...form,
      valorEstimado: parseFloat(form.valorEstimado) || 0,
      valorAtual: parseFloat(form.valorAtual) || 0,
      uid: user.uid
    };

    if (editingId) {
      await updateDoc(doc(db, 'objetivos', editingId), novo);
      setEditingId(null);
    } else {
      await addDoc(collection(db, 'objetivos'), novo);
    }

    setForm({
      titulo: '',
      valorEstimado: '',
      valorAtual: '',
      dataExpectativa: ''
    });
  };

  const handleEdit = (item) => {
    setForm({
      titulo: item.titulo,
      valorEstimado: item.valorEstimado,
      valorAtual: item.valorAtual,
      dataExpectativa: item.dataExpectativa
    });
    setEditingId(item.id);
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'objetivos', id));
  };

  return (
    <Box sx={{ minHeight: '100vh', width: '97vw', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#1e1e1e' }}>
      <Container maxWidth="md">
        <Paper sx={{ padding: 4 }}>
          <Typography variant="h4" gutterBottom>Objetivos</Typography>

          <Box ref={formRef} display="flex" flexWrap="wrap" gap={2} mb={3}>
            <TextField name="titulo" label="Título" value={form.titulo} onChange={handleChange} />
            <TextField name="valorEstimado" label="Valor Estimado" type="number" value={form.valorEstimado} onChange={handleChange} />
            <TextField name="valorAtual" label="Valor Atual Guardado" type="number" value={form.valorAtual} onChange={handleChange} />
            <TextField name="dataExpectativa" label="Data de Expectativa" type="date" value={form.dataExpectativa} onChange={handleChange} InputLabelProps={{ shrink: true }} />
            <Button variant="contained" onClick={handleAdd}>{editingId ? 'Salvar' : 'Adicionar'}</Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Título</TableCell>
                  <TableCell>Valor Estimado</TableCell>
                  <TableCell>Valor Atual</TableCell>
                  <TableCell>Expectativa</TableCell>
                  <TableCell>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {objetivos.map(obj => (
                  <TableRow key={obj.id}>
                    <TableCell>{obj.titulo}</TableCell>
                    <TableCell>R$ {obj.valorEstimado.toFixed(2)}</TableCell>
                    <TableCell>R$ {obj.valorAtual.toFixed(2)}</TableCell>
                    <TableCell>{obj.dataExpectativa}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEdit(obj)}><EditIcon /></IconButton>
                      <IconButton onClick={() => handleDelete(obj.id)}><DeleteIcon /></IconButton>
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
