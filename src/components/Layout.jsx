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
        </Toolbar>
      </AppBar>

      <Box p={3}>
        <Outlet />
      </Box>
    </>
  );
}
