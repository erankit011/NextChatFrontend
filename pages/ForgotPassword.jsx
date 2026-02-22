import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../src/services/api';
import { Input } from '../src/components/common/Input';
import { Button } from '../src/components/common/Button';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Email is required');
      return;
    }

    setIsSubmitting(true);

    try {
      await authAPI.forgotPassword(email);
      setSuccess('Password reset link has been sent to your email. The link will expire in 15 minutes.');
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send reset link');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 flex items-center justify-center px-4 sm:px-6 py-8">
      <div className="max-w-md w-full">
        {/* Card Container */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-100">
          {/* Header */}
          <div className="mb-6 sm:mb-8 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900">Forgot Password?</h1>
            <p className="text-sm sm:text-base text-gray-600">
              Enter your email and we'll send you a reset link
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
                {success}
              </div>
            )}

            <Input
              label="Email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={setEmail}
              autoComplete="email"
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Reset Link'}
            </Button>

            <p className="text-center text-sm sm:text-base text-gray-600 pt-2">
              Remember your password?{' '}
              <Link to="/login" className="text-black font-semibold hover:text-gray-700 transition-colors cursor-pointer">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
