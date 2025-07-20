import React, { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Alert,
    CircularProgress,
    Container,
    Paper,
} from '@mui/material';
import { Lock as LockIcon } from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { AuthenticationRequest } from '../interfaces/auth';

const LoginPage: React.FC = () => {
    const { login, isLoading, error } = useAuth();
    const [formData, setFormData] = useState<AuthenticationRequest>({
        username: '',
        password: '',
    });
    const [formErrors, setFormErrors] = useState<Partial<AuthenticationRequest>>({});

    const validateForm = (): boolean => {
        const errors: Partial<AuthenticationRequest> = {};

        if (!formData.username.trim()) {
            errors.username = 'Username is required';
        } else if (formData.username.length < 4) {
            errors.username = 'Username must be at least 4 characters';
        }

        if (!formData.password.trim()) {
            errors.password = 'Password is required';
        } else if (formData.password.length < 4) {
            errors.password = 'Password must be at least 4 characters';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleInputChange = (field: keyof AuthenticationRequest) => (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setFormData(prev => ({
            ...prev,
            [field]: event.target.value,
        }));

        // Clear field error when user starts typing
        if (formErrors[field]) {
            setFormErrors(prev => ({
                ...prev,
                [field]: undefined,
            }));
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            await login(formData);
            // Navigation to dashboard will be handled by the router
        } catch (error) {
            // Error is handled by the AuthContext
            console.error('Login failed:', error);
        }
    };

    return (
        <Container component="main" maxWidth="sm">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    minHeight: '100vh',
                }}
            >
                <Paper
                    elevation={6}
                    sx={{
                        padding: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: '100%',
                        maxWidth: 400,
                    }}
                >
                    {/* Logo/Icon */}
                    <Box
                        sx={{
                            width: 56,
                            height: 56,
                            borderRadius: '50%',
                            backgroundColor: 'primary.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 2,
                        }}
                    >
                        <LockIcon sx={{ color: 'white', fontSize: 24 }} />
                    </Box>

                    {/* Title */}
                    <Typography component="h1" variant="h4" gutterBottom>
                        Blue Margarita
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={3}>
                        Sign in to your account
                    </Typography>

                    {/* Error Alert */}
                    {error && (
                        <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {/* Login Form */}
                    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="username"
                            label="Username"
                            name="username"
                            autoComplete="username"
                            autoFocus
                            value={formData.username}
                            onChange={handleInputChange('username')}
                            error={!!formErrors.username}
                            helperText={formErrors.username}
                            disabled={isLoading}
                        />

                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            value={formData.password}
                            onChange={handleInputChange('password')}
                            error={!!formErrors.password}
                            helperText={formErrors.password}
                            disabled={isLoading}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2, py: 1.5 }}
                            disabled={isLoading}
                            startIcon={isLoading ? <CircularProgress size={20} /> : null}
                        >
                            {isLoading ? 'Signing In...' : 'Sign In'}
                        </Button>
                    </Box>

                    {/* Test Credentials Info */}
                    <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1, width: '100%' }}>
                        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                            Test the connection with your Spring Boot API
                        </Typography>
                        <Typography variant="body2" color="text.primary">
                            Use any valid credentials from your database
                        </Typography>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default LoginPage;