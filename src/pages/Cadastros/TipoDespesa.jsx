import React, { useEffect, useState } from 'react';
import { db } from '../../firebase/config';
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
import { useAuth } from '../../context/AuthContext';
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
  Box
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

export default function TipoDespesa() {
  const { user } = useAuth();
  const [tipos, setTipos] = useState([]);
  const [form, setForm] = useState({ nome: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (!user) return;

    const tiposCollection = collection(db, 'tiposDespesa');
    const q = query(tiposCollection, where('uid', 'in', [user.uid, 'padrao']));
    const unsubscribe = onSnapshot(q, snapshot => {
      setTipos(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
    });

    return unsubscribe;
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async () => {
    if (!form.nome.trim()) return;

    if (editingId) {
      const ref = doc(db, 'tiposDespesa', editingId);
      await updateDoc(ref, { nome: form.nome });
      setEditingId(null);
    } else {
      await addDoc(collection(db, 'tiposDespesa'), {
        nome: form.nome,
        uid: user.uid // tipos personalizados
      });
    }

    setForm({ nome: '' });
  };

  const handleEdit = (tipo) => {
    setEditingId(tipo.id);
    setForm({ nome: tipo.nome });
  };

  const handleDelete = async (id, uid) => {
    if (uid === 'padrao') {
      alert('Tipos padrão não podem ser excluídos.');
      return;
    }
    await deleteDoc(doc(db, 'tiposDespesa', id));
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
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ padding: 4, marginTop: 8 }}>
          <Typography variant="h4" gutterBottom>Tipos de Despesa</Typography>

          <Box display="flex" gap={2} mb={3}>
            <TextField name="nome" label="Tipo de Despesa" value={form.nome} onChange={handleChange} />
            <Button variant="contained" onClick={handleAdd}>
              {editingId ? 'Salvar Alterações' : 'Cadastrar'}
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tipos.map(t => (
                  <TableRow key={t.id}>
                    <TableCell>{t.nome}</TableCell>
                    <TableCell>{t.uid === 'padrao' ? 'Padrão' : 'Personalizado'}</TableCell>
                    <TableCell>
                      {t.uid !== 'padrao' && (
                        <>
                          <IconButton onClick={() => handleEdit(t)}><EditIcon /></IconButton>
                          <IconButton onClick={() => handleDelete(t.id, t.uid)}><DeleteIcon /></IconButton>
                        </>
                      )}
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
