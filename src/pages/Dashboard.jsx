// Importações do React e hooks
import React, { useEffect, useState } from 'react';

// Importação da instância do Firebase
import { db } from '../firebase/config';

// Importações específicas do Firestore
import {
  collection, addDoc, deleteDoc, doc, onSnapshot,
  query, where, updateDoc, getDocs, writeBatch
} from 'firebase/firestore';

// Contexto de autenticação
import { useAuth } from '../context/AuthContext';

// Componentes da biblioteca MUI
import {
  Container, Typography, TextField, Button, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, IconButton, Box, MenuItem, FormControl,
  InputLabel, Select, Checkbox
} from '@mui/material';

// Ícones de ação
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

export default function Dashboard() {
  const { user } = useAuth(); // Usuário autenticado

  // Estados do componente
  const [transactions, setTransactions] = useState([]); // Transações do Firestore
  const [selectedTransactions, setSelectedTransactions] = useState([]); // Transações selecionadas
  const [allSelected, setAllSelected] = useState(false); // Marcar todos
  const [form, setForm] = useState({
    competenciaMes: '',
    competenciaAno: new Date().getFullYear(),
    amount: '',
    type: 'Receita',
    paymentDate: '',
    dueDate: '',
    detail: '',
    status: 'Pago'
  }); // Dados do formulário

  const [editingId, setEditingId] = useState(null); // ID em edição

  // Carregar transações do Firestore
  useEffect(() => {
    const q = query(collection(db, 'transactions'), where('uid', '==', user.uid));
    const unsubscribe = onSnapshot(q, snapshot => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTransactions(data);
    });
    return unsubscribe; // Cleanup
  }, [user.uid]);

  // Atualiza o estado do formulário conforme o usuário digita
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Adiciona ou atualiza uma transação
  const handleAdd = async () => {
    if (!form.amount.trim()) return;

    if (editingId) {
      // Editar transação existente
      const ref = doc(db, 'transactions', editingId);
      await updateDoc(ref, { ...form, amount: parseFloat(form.amount) || 0 });
      setEditingId(null);
    } else {
      // Adicionar nova transação
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

    // Resetar formulário
    setForm({
      competenciaMes: '',
      competenciaAno: new Date().getFullYear(),
      amount: '',
      type: 'Despesa',
      paymentDate: '',
      dueDate: '',
      detail: '',
      status: 'Pago'
    });
  };

  // Exclui uma transação individual
  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'transactions', id));
  };

  // Preenche o formulário com dados de uma transação para edição
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
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Rolagem para o topo
  };

  // Marca/desmarca transações para ações em lote
  const handleSelect = (id) => {
    setSelectedTransactions(prev =>
      prev.includes(id) ? prev.filter(txId => txId !== id) : [...prev, id]
    );
  };

  // Atualiza em lote o status das transações selecionadas
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

  // Seleciona ou desmarca todas as transações
  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(filteredTransactions.map(tx => tx.id));
    }
    setAllSelected(!allSelected);
  };

  // Filtra transações com base no mês e ano de competência selecionados
  const filteredTransactions = transactions.filter(tx =>
    tx.competenciaMes === form.competenciaMes &&
    Number(tx.competenciaAno) === Number(form.competenciaAno)
  );

  // Calcula o total das transações filtradas
  const total = filteredTransactions.reduce((acc, tx) => {
    const amount = parseFloat(tx.amount) || 0;
    return tx.type === 'Receita' ? acc + amount : acc - amount;
  }, 0);

  // Exclui todas as transações selecionadas
  const handleBulkDelete = async () => {
    if (!selectedTransactions.length) return;
    const confirm = window.confirm(`Tem certeza que deseja excluir ${selectedTransactions.length} transações?`);
    if (!confirm) return;

    const batch = writeBatch(db);
    selectedTransactions.forEach(id => {
      const ref = doc(db, 'transactions', id);
      batch.delete(ref);
    });

    await batch.commit();
    setSelectedTransactions([]);
    setAllSelected(false);
    alert('Transações excluídas com sucesso!');
  };

  // Carrega despesas fixas e adiciona como transações do mês/ano selecionado
  const handleCarregarDespesasFixas = async () => {
    const despesasSnapshot = await getDocs(
      query(collection(db, 'despesasFixas'), where('uid', '==', user.uid))
    );
    const batch = writeBatch(db);
    let inseriuAlguma = false;

    despesasSnapshot.forEach(docSnapshot => {
      const despesa = docSnapshot.data();

      // Pula se a despesa for para outro mês
      if (despesa.mes && despesa.mes !== form.competenciaMes) return;

      const diaVencimento = despesa.dia || 1;
      const meses = {
        Janeiro: 0, Fevereiro: 1, Março: 2, Abril: 3, Maio: 4, Junho: 5,
        Julho: 6, Agosto: 7, Setembro: 8, Outubro: 9, Novembro: 10, Dezembro: 11
      };

      const mesNumero = meses[form.competenciaMes];
      const ano = form.competenciaAno;

      const dataVencimento = new Date(ano, mesNumero, diaVencimento);

      const novaTransacao = {
        uid: user.uid,
        amount: despesa.valor ? parseFloat(despesa.valor) : 0,
        type: despesa.tipo,
        paymentDate: '',
        dueDate: dataVencimento.toISOString().substring(0, 10),
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

  // Interface do usuário
  return (
    <Box sx={{ minHeight: '100vh', width: '97vw', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#1e1e1e' }}>
      <Container maxWidth="false" disableGutters sx={{ padding: 4 }}>
        <Paper elevation={3} sx={{ padding: 2, minHeight: '90vh' }}>
          <Typography variant="h4" gutterBottom>Dashboard Financeiro</Typography>

          {/* Formulário de entrada */}
          <Box display="flex" flexWrap="wrap" gap={2} mb={4}>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Mês de Competência</InputLabel>
              <Select name="competenciaMes" value={form.competenciaMes} onChange={handleChange} label="Mês de Competência">
                {['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
                  .map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
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
            <Button variant="contained" color="primary" onClick={handleBulkUpdate} disabled={!selectedTransactions.length}>Marcar como Pago</Button>
            <Button variant="contained" color="error" onClick={handleBulkDelete} disabled={!selectedTransactions.length}>Excluir Selecionados</Button>
          </Box>

          {/* Tabela de transações */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Checkbox checked={allSelected} onChange={handleSelectAll} />
                    Selecionar Todos
                  </TableCell>
                  <TableCell>Data de Inclusão</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Vencimento</TableCell>
                  <TableCell>Pagamento</TableCell>
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
                      <span style={{ color: tx.status === 'Pago' ? 'green' : 'red', fontWeight: 'bold' }}>{tx.status}</span>
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
                  <TableCell colSpan={3}></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>
    </Box>
  );
}
