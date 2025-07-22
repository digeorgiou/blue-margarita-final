// pages/Login/Login.tsx
import React, { useState } from 'react';
import { Button, Input, Alert, LoadingSpinner, Card } from '../components/ui';
import { authService } from '../services/authService';

interface LoginFormData {
    username: string;
    password: string;
}

interface LoginPageProps {
    onLoginSuccess: () => void;
}

const Login: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
    // Form state
    const [formData, setFormData] = useState<LoginFormData>({
        username: '',
        password: ''
    });

    // UI state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form validation errors
    const [formErrors, setFormErrors] = useState<Partial<LoginFormData>>({});

    // Handle input changes
    const handleInputChange = (field: keyof LoginFormData) => (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setFormData(prev => ({
            ...prev,
            [field]: event.target.value
        }));

        // Clear field error when user starts typing
        if (formErrors[field]) {
            setFormErrors(prev => ({
                ...prev,
                [field]: undefined
            }));
        }

        // Clear general error
        if (error) {
            setError(null);
        }
    };

    // Validate form
    const validateForm = (): boolean => {
        const errors: Partial<LoginFormData> = {};

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

    // Handle form submission
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const payload = {
                username: formData.username,
                password: formData.password
            };
            console.log("Sending auth payload:", payload); // Debug
            await authService.authenticate(payload);

            // Login successful
            onLoginSuccess();

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Login failed';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">

                {/* Login Card */}
                <Card
                    title="Welcome Back"
                    icon="🔐"
                    className="mb-6"
                >
                    <form id="login-form" onSubmit={handleSubmit} className="space-y-6">

                        {/* Error Alert */}
                        {error && (
                            <Alert variant="error">
                                {error}
                            </Alert>
                        )}

                        {/* Username Input */}
                        <Input
                            label="Username"
                            type="text"
                            placeholder="Enter your username"
                            value={formData.username}
                            onChange={handleInputChange('username')}
                            error={formErrors.username}
                            required
                            disabled={loading}
                        />

                        {/* Password Input */}
                        <Input
                            label="Password"
                            type="password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleInputChange('password')}
                            error={formErrors.password}
                            required
                            disabled={loading}
                        />

                        {/* Login Button */}
                        <Button
                            variant="primary"
                            size="lg"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <LoadingSpinner />
                                    <span className="ml-2">Signing in...</span>
                                </div>
                            ) : (
                                'Sign In'
                            )}
                        </Button>
                    </form>
                </Card>

                {/* Help Card */}
                <Card className="text-center">
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-gray-900">Need Help?</h3>
                        <div className="space-y-2 text-sm text-gray-600">
                            <p>
                                <strong>Demo Credentials:</strong><br />
                                Username: demo<br />
                                Password: demo123
                            </p>
                            <p className="text-xs">
                                Contact your administrator if you need access to the system.
                            </p>
                        </div>
                    </div>
                </Card>

            </div>
        </div>
    );
};

export default Login;