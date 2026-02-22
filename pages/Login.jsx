/**
 * Login Page
 * User authentication page
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../src/hooks/useAuth';
import { useForm } from '../src/hooks/useForm';
import { validateLoginForm } from '../src/utils/validators';
import { Input } from '../src/components/common/Input';
import { Button } from '../src/components/common/Button';

export function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [apiError, setApiError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (values) => {
        try {
            setApiError('');
            await login(values.email, values.password);
            toast.success('Login successful! Welcome back.');
            navigate('/home');
        } catch (error) {
            toast.error(error.message || 'Login failed. Please try again.');
            setApiError(error.message);
        }
    };

    const { values, errors, isSubmitting, handleChange, handleSubmit } = useForm({
        initialValues: {
            email: '',
            password: '',
        },
        validate: validateLoginForm,
        onSubmit: handleLogin,
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 flex items-center justify-center px-4 sm:px-6 py-8">
            <div className="max-w-md w-full">
                {/* Card Container */}
                <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-100">
                    {/* Header */}
                    <div className="mb-6 sm:mb-8 text-center">
                        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900">Welcome back</h1>
                        <p className="text-sm sm:text-base text-gray-600">Sign in to continue</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {apiError && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                                {apiError}
                            </div>
                        )}

                        <Input
                            label="Email"
                            type="email"
                            placeholder="Enter your email"
                            value={values.email}
                            onChange={(value) => handleChange('email', value)}
                            error={errors.email}
                            autoComplete="email"
                            required
                        />

                        <div className="relative">
                            <div className="relative">
                                <Input
                                    label="Password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={values.password}
                                    onChange={(value) => handleChange('password', value)}
                                    error={errors.password}
                                    autoComplete="current-password"
                                    required
                                />
                                {values.password && (
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                                        style={{ marginTop: '14px' }}
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm pt-1">
                            <label className="flex items-center cursor-pointer group">
                                <input type="checkbox" className="mr-2 cursor-pointer w-4 h-4 rounded border-gray-300 text-black focus:ring-black" />
                                <span className="text-gray-600 group-hover:text-gray-900 transition-colors">Remember me</span>
                            </label>
                            <Link to="/forgot-password" className="text-black hover:text-gray-700 font-medium transition-colors">
                                Forgot password?
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            fullWidth
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Signing in...' : 'Sign in'}
                        </Button>

                        <p className="text-center text-sm sm:text-base text-gray-600 pt-2">
                            Don't have an account?{' '}
                            <Link to="/signup" className="text-black font-semibold hover:text-gray-700 transition-colors">
                                Sign up
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
