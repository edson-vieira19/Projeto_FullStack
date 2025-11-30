import React from 'react';
import { Box, Typography } from '@mui/material';

const Login = ({ onNavigate }) => {
    return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom>
                Página de Login
            </Typography>
            <Typography variant="body1">
                Aqui você poderá se autenticar para acessar o CRUD.
            </Typography>
            {/* O formulário de login real será construído aqui */}
        </Box>
    );
}

export default Login;