import React, { useState } from 'react';
import { Button, Input, Alert, LoadingSpinner, Card } from '../components/ui/common';
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
    const handleLoginSubmit = async (event: React.FormEvent) => {
        console.log('=== LOGIN SUBMIT STARTED ===');
        console.log('Event:', event);
        console.log('Event target:', event.target);


        event.preventDefault();

        console.log('Form data:', formData);
        console.log('Validation result:', validateForm());


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

            const result = await authService.authenticate(payload);
            console.log('Auth service result:', result);

            // Login successful
            console.log('Calling onLoginSuccess...');
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
                    title="Καλώς Ήρθατε"
                    icon="🔐"
                    className="mb-6"
                >
                    <form id="login-form" onSubmit={handleLoginSubmit} className="space-y-6">

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
                            type="submit"
                            variant="primary"
                            size="lg"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <LoadingSpinner size="xs" message="Είσοδος στην εφαρμογή..."/>
                                </div>
                            ) : (
                                'Είσοδος'
                            )}
                        </Button>
                    </form>
                </Card>

                {/* Help Card */}
                <Card className="text-center">
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-gray-900">Χρειάζεστε βοήθεια?</h3>
                        <div className="space-y-2 text-sm text-gray-600">
                            <p>
                                <strong>Demo Admin User:</strong><br />
                                Username: admin<br />
                                Password: 12345
                            </p>
                            <p>
                            <strong>Demo Simple User:</strong><br />
                            Username: maria<br />
                            Password: 12345
                            </p>
                            <p className="text-xs">
                                Ο admin μπορεί να διαχειριστεί χρήστες, να δει κέρδη/ζημιίεςcan καθως επίσης και να δει/διαχειριστεί
                                soft-deleted αντικείμενα.
                            </p>

                        </div>
                    </div>
                </Card>

            </div>
        </div>
    );
};

export default Login;