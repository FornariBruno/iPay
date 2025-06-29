import React, { useEffect, useState, useRef } from 'react';
import { db } from '../../firebase/config';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
  query,
  where
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
  Box,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

export default function DespesasFixas() {
  const { user } = useAuth();
  const [despesas, setDespesas] = useState([]);
  const formRef = useRef(null);


  const [form, setForm] = useState({
    descricao: '',
    tipo: 'Despesa',
    tipoDespesa: '',
    dia: '',
    mes: '',
    valor: ''
  });

  const [editingId, setEditingId] = useState(null);
  const [tiposDespesa, setTiposDespesa] = useState([]);


  useEffect(() => {
    if (!user) return;
    const despesasCollection = collection(db, 'despesasFixas');
    const q = query(despesasCollection, where('uid', '==', user.uid));
    const unsubscribe = onSnapshot(q, snapshot => {
      setDespesas(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
    });
    return unsubscribe;
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const fetchTiposDespesa = async () => {
      const q = query(collection(db, 'tiposDespesa'), where('uid', 'in', [user.uid, 'padrao']));
      const unsubscribe = onSnapshot(q, snapshot => {
        const tipos = snapshot.docs.map(doc => ({
          id: doc.id,
          nome: doc.data().nome
        }));
        setTiposDespesa(tipos);
      });
      return unsubscribe;
    };
  
    fetchTiposDespesa();
  }, [user.uid]);
  

  const handleAdd = async () => {
    if (!form.descricao.trim() || !form.dia) return;

    if (editingId) {
      const ref = doc(db, 'despesasFixas', editingId);
      await updateDoc(ref, {
        ...form,
        valor: form.valor ? parseFloat(form.valor) : 0,
      });
      setEditingId(null);
    } else {
      await addDoc(collection(db, 'despesasFixas'), {
        ...form,
        valor: form.valor ? parseFloat(form.valor) : 0,
        uid: user.uid
      });
    }

    setForm({
      descricao: '',
      tipo: 'Despesa',
      tipoDespesa: '',
      dia: '',
      mes: '',
      valor: ''
    });
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'despesasFixas', id));
  };

  const handleEdit = (item) => {
    setForm({
      descricao: item.descricao || '',
      tipo: item.tipo || 'Despesa',
      tipoDespesa: item.tipoDespesa || '',
      dia: item.dia || '',
      mes: item.mes || '',
      valor: item.valor || ''
    });
    setEditingId(item.id);
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
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
          <Typography variant="h4" gutterBottom>Despesas Fixas</Typography>

          <Box ref={formRef} display="flex" flexWrap="wrap" gap={2} mb={3}>
            <TextField name="descricao" label="Descrição" value={form.descricao} onChange={handleChange} />
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Tipo</InputLabel>
              <Select name="tipo" value={form.tipo} onChange={handleChange} label="Tipo">
                <MenuItem value="Despesa">Despesa</MenuItem>
                <MenuItem value="Receita">Receita</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Tipo de Despesa</InputLabel>
                <Select
                  name="tipoDespesa"
                  value={form.tipoDespesa}
                  onChange={handleChange}
                  label="Tipo de Despesa"
                >
                  {tiposDespesa.length === 0 ? (
                    <MenuItem disabled>Carregando...</MenuItem>
                  ) : (
                    tiposDespesa.map(tipo => (
                      <MenuItem key={tipo.id} value={tipo.nome}>{tipo.nome}</MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            <TextField name="dia" label="Dia" type="number" value={form.dia} onChange={handleChange} />
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Mês</InputLabel>
              <Select name="mes" value={form.mes} onChange={handleChange} label="Mês">
                <MenuItem value="">Mensal</MenuItem>
                {['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'].map(m => (
                  <MenuItem key={m} value={m}>{m}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField name="valor" label="Valor" type="number" value={form.valor} onChange={handleChange} />
            <Button variant="contained" onClick={handleAdd}>
              {editingId ? 'Salvar Alterações' : 'Cadastrar'}
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Descrição</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Tipo de Despesa</TableCell>
                  <TableCell>Dia</TableCell>
                  <TableCell>Mês</TableCell>
                  <TableCell>Valor</TableCell>
                  <TableCell>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {despesas.map(d => (
                  <TableRow key={d.id}>
                    <TableCell>{d.descricao}</TableCell>
                    <TableCell>{d.tipo}</TableCell>
                    <TableCell>{d.tipoDespesa}</TableCell>
                    <TableCell>{d.dia}</TableCell>
                    <TableCell>{d.mes || 'Mensal'}</TableCell>
                    <TableCell>R$ {(parseFloat(d.valor) || 0).toFixed(2)}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEdit(d)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(d.id)}>
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
