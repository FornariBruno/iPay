import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Select, MenuItem, FormControl,
  InputLabel, Box, Paper, Table, TableHead, TableRow,
  TableCell, TableBody
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend, CartesianGrid, Cell
} from 'recharts';

import { db } from '../firebase/config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const cores = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8854d0', '#fa8231', '#20bf6b'];

export default function Relatorios() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [tiposDespesa, setTiposDespesa] = useState([]);
  const [filtros, setFiltros] = useState({
    mes: '',
    ano: new Date().getFullYear(),
    tipoDespesa: ''
  });

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'transactions'), where('uid', '==', user.uid)),
      snapshot => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTransactions(data);
      }
    );
    return unsub;
  }, [user.uid]);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'tiposDespesa'), where('uid', 'in', [user.uid, 'padrao'])),
      snapshot => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, nome: doc.data().nome }));
        setTiposDespesa(data);
      }
    );
    return unsub;
  }, [user.uid]);

  const handleFiltroChange = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  const filtradas = transactions.filter(tx => {
    return (
      (tx.type === 'Despesa' || tx.type === 'Gasto') &&
      (filtros.mes ? tx.competenciaMes === filtros.mes : true) &&
      (filtros.ano ? Number(tx.competenciaAno) === Number(filtros.ano) : true) &&
      (filtros.tipoDespesa ? tx.tipoDespesa === filtros.tipoDespesa : true)
    );
  });
  
  
  const totalPorTipo = filtradas.reduce((acc, tx) => {
    const tipo = tx.tipoDespesa || 'Outro'; // ✅ agora usa a categoria
    acc[tipo] = (acc[tipo] || 0) + (parseFloat(tx.amount) || 0);
    return acc;
  }, {});
  
  const dataGrafico = Object.entries(totalPorTipo).map(([nome, valor]) => ({
    name: nome,
    value: valor
  }));

  return (
    <Box sx={{ minHeight: '100vh', width: '97vw', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#1e1e1e'}}>
      <Container maxWidth="lg">
        <Paper sx={{ padding: 4 }}>
          <Typography variant="h4" gutterBottom>Relatório de Gastos</Typography>

          <Box display="flex" gap={2} mb={3} flexWrap="wrap">
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Mês</InputLabel>
              <Select name="mes" value={filtros.mes} onChange={handleFiltroChange} label="Mês">
                <MenuItem value="">Todos</MenuItem>
                {['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
                  .map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Ano</InputLabel>
              <Select name="ano" value={filtros.ano} onChange={handleFiltroChange} label="Ano">
                {[2023, 2024, 2025].map(ano => (
                  <MenuItem key={ano} value={ano}>{ano}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Tipo de Despesa</InputLabel>
              <Select name="tipoDespesa" value={filtros.tipoDespesa} onChange={handleFiltroChange} label="Tipo de Despesa">
                <MenuItem value="">Todos</MenuItem>
                {tiposDespesa.map(t => (
                  <MenuItem key={t.id} value={t.nome}>{t.nome}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box height={300}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataGrafico} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `R$ ${parseFloat(value).toFixed(2)}`} />
                <Legend />
                <Bar dataKey="value" name="Valor (R$)">
                  {dataGrafico.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={cores[index % cores.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>


          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Detalhamento</TableCell>
                <TableCell>Tipo Despesa</TableCell>
                <TableCell>Valor</TableCell>
                <TableCell>Mês</TableCell>
                <TableCell>Ano</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtradas.map(tx => (
                <TableRow key={tx.id}>
                  <TableCell>{tx.detail}</TableCell>
                  <TableCell>{tx.tipoDespesa || tx.detail}</TableCell>
                  <TableCell>R$ {(parseFloat(tx.amount) || 0).toFixed(2)}</TableCell>
                  <TableCell>{tx.competenciaMes}</TableCell>
                  <TableCell>{tx.competenciaAno}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Container>
    </Box>
  );
}
