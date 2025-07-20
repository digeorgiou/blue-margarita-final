// Simple dashboard to test API connection
import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import { useAuth } from '../hooks/useAuth';

const Dashboard: React.FC = () => {
    const { user, logout, token } = useAuth();
    const [testResult, setTestResult] = useState<string>('Testing...');

    useEffect(() => {
        testConnection();
    }, []);

    const testConnection = async () => {
        try {
            const response = await fetch('/api/auth/validate', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                setTestResult('✅ API Connection: SUCCESS');
            } else {
                setTestResult('❌ API Connection: FAILED');
            }
        } catch (error) {
            setTestResult(`❌ API Connection: ERROR ${error}`);
        }
    };

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom>
                Dashboard
            </Typography>

            <Typography variant="h6" gutterBottom>
                Welcome, {user?.username}!
            </Typography>

            <Alert severity={testResult.includes('✅') ? 'success' : 'error'} sx={{ my: 2 }}>
                {testResult}
            </Alert>

            <Button variant="outlined" onClick={testConnection} sx={{ mr: 2 }}>
                Test Connection
            </Button>

            <Button variant="contained" onClick={logout}>
                Logout
            </Button>
        </Box>
    );
};

export default Dashboard;