import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';

const Despesas = () => {
  const [despesas, setDespesas] = useState([
    { id: 1, descricao: 'Supermercado', tipo: 'Gasto', dia: 10, mes: 'Maio', valor: 200 },
    { id: 2, descricao: 'Salário', tipo: 'Receita', dia: 5, mes: 'Maio', valor: 3000 },
  ]);

  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [dia, setDia] = useState('');
  const [mes, setMes] = useState('');
  const [tipo, setTipo] = useState('');
  const [despesaSelecionada, setDespesaSelecionada] = useState(null);



  const handleEditar = (item) => {
    setDespesaSelecionada({ ...item });
  };

  const handleSalvarEdicao = () => {
    const novaLista = despesas.map((d) =>
      d.id === despesaSelecionada.id ? despesaSelecionada : d
    );
    setDespesas(novaLista);
    setDespesaSelecionada(null);
  };

  const handleExcluir = (id) => {
    const novaLista = despesas.filter((d) => d.id !== id);
    setDespesas(novaLista);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const novaDespesa = {
      id: Date.now(),
      descricao,
      valor,
      dia,
      mes,
      tipo,
    };
    
    setDespesas([...despesas, novaDespesa]);
    setDescricao('');
    setValor('');
    setDia('');
    setMes('');
    setTipo('');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        py: 4,
        minHeight: '100vh',
        backgroundColor: '#1e1e1e',
        color: '#fff',
      }}
    >
      {/* Formulário de Cadastro */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          width: '90%',
          maxWidth: 500,
          backgroundColor: '#2c2c2c',
          padding: 3,
          borderRadius: 2,
          boxShadow: 4,
        }}
      >
        <Typography variant="h6" align="center">
          Cadastro de Despesas
        </Typography>

        <TextField
          label="Descrição"
          variant="outlined"
          fullWidth
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          required
          InputLabelProps={{ style: { color: '#ccc' } }}
          InputProps={{ style: { color: '#fff' } }}
        />

        <TextField
          label="Valor"
          type="number"
          variant="outlined"
          fullWidth
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          required
          InputLabelProps={{ style: { color: '#ccc' } }}
          InputProps={{ style: { color: '#fff' } }}
        />

        <TextField
          label="Dia"
          type="number"
          variant="outlined"
          fullWidth
          value={dia}
          onChange={(e) => setDia(e.target.value)}
          required
          InputLabelProps={{ style: { color: '#ccc' } }}
          InputProps={{ style: { color: '#fff' } }}
        />

        <FormControl fullWidth>
          <InputLabel sx={{ color: '#ccc' }}>Mês</InputLabel>
          <Select
            value={mes}
            onChange={(e) => setMes(e.target.value)}
            sx={{ color: '#fff' }}
          >
            {['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'].map((m) => (
              <MenuItem key={m} value={m}>{m}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel sx={{ color: '#ccc' }}>Tipo</InputLabel>
          <Select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            sx={{ color: '#fff' }}
          >
            <MenuItem value="Gasto">Gasto</MenuItem>
            <MenuItem value="Receita">Receita</MenuItem>
          </Select>
        </FormControl>

        <Button type="submit" variant="contained" color="primary">
          Cadastrar
        </Button>
      </Box>

      {/* Lista de Despesas */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'center',
          gap: 2,
          width: '90%',
          maxWidth: 600,
        }}
      >
        {despesas.map((despesa) => (
          <Card key={despesa.id} sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6">{despesa.descricao}</Typography>
              <Typography variant="body2">Tipo: {despesa.tipo}</Typography>
              <Typography variant="body2">
                Dia: {despesa.dia} / Mês: {despesa.mes}
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                Valor: R$ {parseFloat(despesa.valor).toFixed(2)}
              </Typography>
            </CardContent>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                gap: 1,
                px: 2,
                pb: 2,
              }}
            >
              <Button
                variant="outlined"
                color="primary"
                onClick={() => handleEditar(despesa)}
              >
                Editar
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleExcluir(despesa.id)}
              >
                Excluir
              </Button>
            </Box>
          </Card>
        ))}
      </Box>

      {/* Modal de Edição */}
      {despesaSelecionada && (
        <Dialog open onClose={() => setDespesaSelecionada(null)}>
          <DialogTitle>Editar Despesa</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Descrição"
              value={despesaSelecionada.descricao}
              onChange={(e) =>
                setDespesaSelecionada({ ...despesaSelecionada, descricao: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Valor"
              type="number"
              value={despesaSelecionada.valor}
              onChange={(e) =>
                setDespesaSelecionada({ ...despesaSelecionada, valor: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Dia"
              type="number"
              value={despesaSelecionada.dia}
              onChange={(e) =>
                setDespesaSelecionada({ ...despesaSelecionada, dia: e.target.value })
              }
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Mês</InputLabel>
              <Select
                value={despesaSelecionada.mes}
                onChange={(e) =>
                  setDespesaSelecionada({ ...despesaSelecionada, mes: e.target.value })
                }
              >
                {['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'].map((m) => (
                  <MenuItem key={m} value={m}>{m}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Tipo</InputLabel>
              <Select
                value={despesaSelecionada.tipo}
                onChange={(e) =>
                  setDespesaSelecionada({ ...despesaSelecionada, tipo: e.target.value })
                }
              >
                <MenuItem value="Gasto">Gasto</MenuItem>
                <MenuItem value="Receita">Receita</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDespesaSelecionada(null)}>Cancelar</Button>
            <Button onClick={handleSalvarEdicao} variant="contained" color="primary">
              Salvar
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default Despesas;
