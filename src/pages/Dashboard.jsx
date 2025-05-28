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
  updateDoc,
  getDocs,
  writeBatch
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
  FormControl,
  InputLabel,
  Select,
  Checkbox
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

export default function Dashboard() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [allSelected, setAllSelected] = useState(false);
  const [form, setForm] = useState({
    competenciaMes: '',
    competenciaAno: new Date().getFullYear(),
    amount: '',
    type: 'Receita',
    paymentDate: '',
    dueDate: '',
    detail: '',
    status: 'Pago'
  });
  const [editingId, setEditingId] = useState(null);
  const [filterBy, setFilterBy] = useState('date');
  const [filterStart, setFilterStart] = useState('');
  const [filterEnd, setFilterEnd] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'transactions'), where('uid', '==', user.uid));
    const unsubscribe = onSnapshot(q, snapshot => {
      setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, [user.uid]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAdd = async () => {
    if (!form.amount.trim()) return;

    if (editingId) {
      const ref = doc(db, 'transactions', editingId);
      await updateDoc(ref, { ...form, amount: parseFloat(form.amount) || 0 });
      setEditingId(null);
    } else {
      await addDoc(collection(db, 'transactions'), {
        uid: user.uid,
        amount: parseFloat(form.amount) || 0,
        type: form.type,
        paymentDate: form.paymentDate,
        dueDate: form.dueDate,
        detail: form.detail,
        status: form.status,
        competenciaMes: form.competenciaMes,
        competenciaAno: form.competenciaAno,
        date: new Date()
      });
    }
    setForm({ competenciaMes: '', competenciaAno: '', amount: '', type: 'Despesa', paymentDate: '', dueDate: '', detail: '', status: 'Pago' });
  };

  const handleDelete = async (id) => await deleteDoc(doc(db, 'transactions', id));

  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({
      competenciaMes: item.competenciaMes || '',
      competenciaAno: item.competenciaAno || '',
      amount: String(item.amount ?? ''),
      type: item.type || 'Despesa',
      paymentDate: item.paymentDate || '',
      dueDate: item.dueDate || '',
      detail: item.detail || '',
      status: item.status || 'Não Pago'
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelect = (id) => {
    setSelectedTransactions(prev =>
      prev.includes(id) ? prev.filter(txId => txId !== id) : [...prev, id]
    );
  };

  const handleBulkUpdate = async () => {
    const batch = writeBatch(db);
    selectedTransactions.forEach(id => {
      const ref = doc(db, 'transactions', id);
      batch.update(ref, { status: 'Pago' });
    });
    await batch.commit();
    setSelectedTransactions([]);
    alert('Status atualizado para "Pago"!');
  };

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(transactions.map(tx => tx.id));
    }
    setAllSelected(!allSelected);
  };


  const filteredTransactions = transactions.filter(tx => {
    if (!filterStart || !filterEnd) return true;
    const value = tx[filterBy];
    let dateToCompare;
    if (value?.seconds) dateToCompare = new Date(value.seconds * 1000);
    else if (typeof value === 'string') dateToCompare = new Date(value);
    else return false;
    return dateToCompare >= new Date(filterStart) && dateToCompare <= new Date(filterEnd);
  });

  const total = filteredTransactions.reduce((acc, tx) => {
    const amount = parseFloat(tx.amount) || 0;
    return tx.type === 'Receita' ? acc + amount : acc - amount;
  }, 0);

  const handleClearFilters = () => {
    setFilterBy('date');
    setFilterStart('');
    setFilterEnd('');
  };

  const handleCarregarDespesasFixas = async () => {
    const despesasSnapshot = await getDocs(
      query(collection(db, 'despesasFixas'), where('uid', '==', user.uid))
    );
    const batch = writeBatch(db);
    let inseriuAlguma = false;

    despesasSnapshot.forEach(docSnapshot => {
      const despesa = docSnapshot.data();
      if (despesa.mes && despesa.mes !== form.competenciaMes) return;

      const novaTransacao = {
        uid: user.uid,
        amount: despesa.valor ? parseFloat(despesa.valor) : 0,
        type: despesa.tipo,
        paymentDate: '',
        dueDate: '',
        detail: despesa.descricao,
        status: 'Não Pago',
        competenciaMes: form.competenciaMes,
        competenciaAno: form.competenciaAno,
        date: new Date()
      };
      const newDocRef = doc(collection(db, 'transactions'));
      batch.set(newDocRef, novaTransacao);
      inseriuAlguma = true;
    });

    if (inseriuAlguma) {
      await batch.commit();
      alert('Despesas fixas carregadas com sucesso!');
    } else {
      alert('Nenhuma despesa fixa para o mês selecionado.');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', width: '97vw', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#1e1e1e' }}>
      <Container maxWidth="false" disableGutters sx={{ padding: 4 }}>
        <Paper elevation={3} sx={{ padding: 2, marginTop: 0, minHeight: '90vh' }}>
          <Typography variant="h4" gutterBottom>Dashboard Financeiro</Typography>

          <Box display="flex" flexWrap="wrap" gap={2} mb={4}>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Mês de Competência</InputLabel>
              <Select name="competenciaMes" value={form.competenciaMes} onChange={handleChange} label="Mês de Competência">
                {['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'].map(m => (
                  <MenuItem key={m} value={m}>{m}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField name="competenciaAno" label="Ano de Competência" type="number" value={form.competenciaAno} onChange={handleChange} />
            <TextField name="amount" label="Valor" value={form.amount} onChange={handleChange} />
            <TextField select name="type" label="Tipo" value={form.type} onChange={handleChange}>
              <MenuItem value="Despesa">Despesa</MenuItem>
              <MenuItem value="Receita">Receita</MenuItem>
            </TextField>
            <TextField name="dueDate" label="Data de Vencimento" type="date" value={form.dueDate} onChange={handleChange} InputLabelProps={{ shrink: true }} />
            <TextField name="paymentDate" label="Data de Pagamento" type="date" value={form.paymentDate} onChange={handleChange} InputLabelProps={{ shrink: true }} />
            <TextField name="detail" label="Detalhamento" value={form.detail} onChange={handleChange} />
            <TextField select name="status" label="Status" value={form.status} onChange={handleChange}>
              <MenuItem value="Pago">Pago</MenuItem>
              <MenuItem value="Não Pago">Não Pago</MenuItem>
            </TextField>
            <Button variant="contained" onClick={handleAdd}>{editingId ? 'Salvar Alterações' : 'Adicionar'}</Button>
            <Button variant="outlined" onClick={handleCarregarDespesasFixas}>Carregar Despesas Fixas</Button>
            <Button variant="contained" color="primary" onClick={handleBulkUpdate} disabled={!selectedTransactions.length}>
              Marcar Selecionados como Pago
            </Button>
          </Box>

          <Box display="flex" gap={2} mb={2} alignItems="flex-end">
            <TextField select label="Filtrar por" value={filterBy} onChange={e => setFilterBy(e.target.value)}>
              <MenuItem value="date">Data de Inclusão</MenuItem>
              <MenuItem value="dueDate">Data de Vencimento</MenuItem>
              <MenuItem value="paymentDate">Data de Pagamento</MenuItem>
            </TextField>
            <TextField label="De" type="date" value={filterStart} onChange={e => setFilterStart(e.target.value)} InputLabelProps={{ shrink: true }} />
            <TextField label="Até" type="date" value={filterEnd} onChange={e => setFilterEnd(e.target.value)} InputLabelProps={{ shrink: true }} />
            <Button variant="outlined" color="secondary" onClick={handleClearFilters}>Limpar Filtros</Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow >
                  <TableCell>
                    <Checkbox
                      checked={allSelected}
                      onChange={handleSelectAll}
                    />
                    Selecionar Todos
                  </TableCell>
                  <TableCell>Data de Inclusão</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Data Vencimento</TableCell>
                  <TableCell>Data Pagamento</TableCell>
                  <TableCell>Detalhamento</TableCell>
                  <TableCell>Valor</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTransactions.map(tx => (
                  <TableRow key={tx.id}>
                    <TableCell>
                    <Checkbox
                      checked={selectedTransactions.includes(tx.id)}
                      onChange={() => handleSelect(tx.id)}
                    />
                    </TableCell>
                    <TableCell>{tx.date?.seconds ? new Date(tx.date.seconds * 1000).toLocaleDateString() : '-'}</TableCell>
                    <TableCell>{tx.type}</TableCell>
                    <TableCell>{tx.dueDate || '-'}</TableCell>
                    <TableCell>{tx.paymentDate || '-'}</TableCell>
                    <TableCell>{tx.detail}</TableCell>
                    <TableCell>R$ {(parseFloat(tx.amount) || 0).toFixed(2)}</TableCell>
                    <TableCell>
                      <span style={{ color: tx.status === 'Pago' ? 'green' : 'red', fontWeight: 'bold' }}>
                        {tx.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEdit(tx)}><EditIcon /></IconButton>
                      <IconButton onClick={() => handleDelete(tx.id)}><DeleteIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={5} align="right" style={{ fontWeight: 'bold' }}>Total:</TableCell>
                  <TableCell style={{ fontWeight: 'bold', color: total >= 0 ? 'green' : 'red' }}>R$ {total.toFixed(2)}</TableCell>
                  <TableCell colSpan={2}></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>
    </Box>
  );
}
