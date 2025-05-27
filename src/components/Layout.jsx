import { Outlet, Link, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Button, Box, Menu, MenuItem } from '@mui/material';
import { useState } from 'react';

export default function Layout() {
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Relatórios', path: '/Relatorios' },
  ];

  const cadastroItems = [
    { label: 'Despesas Fixas', path: '/Cadastros/DespesasFixas' },
    { label: 'Produtos', path: '/Cadastros/Produtos' },
    { label: 'Usuários', path: '/Cadastros/Usuarios' },
  ];

  const sair = [
     {label: 'Sair', path: '/login'},
  ]

    const teste = [
     {label: 'Movimentos', path: '/login'},
  ]
     const teste2 = [
     {label: 'teste', path: '/login'},
  ]


  return (
    <>
      <AppBar position="static">
        <Toolbar>
          {navItems.map(item => (
            <Button
              key={item.path}
              color="inherit"
              component={Link}
              to={item.path}
              variant={location.pathname === item.path ? 'outlined' : 'text'}
              sx={{ color: '#fff', mx: 1 }}
            >
              {item.label}
            </Button>
          ))}

          {/* Botão Cadastros com submenu */}
          <Button
            color="inherit"
            onClick={handleOpenMenu}
            variant={location.pathname.startsWith('/Cadastros') ? 'outlined' : 'text'}
            sx={{ color: '#fff', mx: 1 }}
          >
            Cadastros
          </Button>

          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
            {cadastroItems.map((subItem) => (
              <MenuItem
                key={subItem.path}
                component={Link}
                to={subItem.path}
                onClick={handleCloseMenu}
              >
                {subItem.label}
              </MenuItem>
            ))}
          </Menu>

          {sair.map(item => (
            <Button
              key={item.path}
              color="inherit"
              component={Link}
              to={item.path}
              variant={location.pathname === item.path ? 'outlined' : 'text'}
              //ml: 'auto' empurra automaticamente o item para a direita
              sx={{ color: '#fff', mx: 1, ml: 'auto' }}
            >
              {item.label}
            </Button>
          ))}
        </Toolbar>
      </AppBar>

      <Box p={3}>
        <Outlet />
      </Box>
    </>
  );
}
