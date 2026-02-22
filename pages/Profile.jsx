import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, LogOut, ArrowLeft } from 'lucide-react';
import { useAuth } from '../src/hooks/useAuth';
import { userAPI, authAPI } from '../src/services/api';
import { Input } from '../src/components/common/Input';
import { Button } from '../src/components/common/Button';

export function Profile() {
  const { user, logout, updateUser: updateAuthUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [oldPassword, setOldPassword] = useState('');
  const [password, setPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const updateData = {};
    if (username.trim() !== user.username) updateData.username = username.trim();
    
    // If user wants to change password
    if (password.trim()) {
      if (!oldPassword.trim()) {
        setError('Please enter your current password to change password');
        return;
      }
      if (password.length < 6) {
        setError('New password must be at least 6 characters');
        return;
      }
      updateData.password = password.trim();
    }

    if (Object.keys(updateData).length === 0) {
      setError('No changes to update');
      return;
    }

    // Show confirmation modal
    setShowSaveModal(true);
  };

  const confirmUpdate = async () => {
    setShowSaveModal(false);
    setIsSubmitting(true);

    // If password is being changed, verify old password first
    if (password.trim()) {
      try {
        await authAPI.login({
          email: user.email,
          password: oldPassword
        });
      } catch (err) {
        setError('Current password is incorrect');
        setIsSubmitting(false);
        return;
      }
    }

    const updateData = {};
    if (username.trim() !== user.username) updateData.username = username.trim();
    if (password.trim()) updateData.password = password.trim();

    try {
      // Get userId from query params or use authenticated user's ID
      const userId = searchParams.get('userId') || user._id;
      const response = await userAPI.updateUser(userId, updateData);
      updateAuthUser(response.data);
      setSuccess('Profile updated successfully');
      setOldPassword('');
      setPassword('');
      setIsEditing(false);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to update profile';
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = () => {
    setDeletePassword('');
    setDeleteError('');
    setShowDeleteModal(true);
  };

  const handlePasswordSubmit = async () => {
    if (!deletePassword.trim()) {
      setDeleteError('Password is required');
      return;
    }

    // Verify password by attempting login
    try {
      const response = await authAPI.login({
        email: user.email,
        password: deletePassword
      });

      if (response.success) {
        // Password is correct, show confirmation modal
        setShowDeleteModal(false);
        setShowDeleteConfirmModal(true);
      }
    } catch (err) {
      setDeleteError('Incorrect password');
    }
  };

  const handleDelete = async () => {
    try {
      // Get userId from query params or use authenticated user's ID
      const userId = searchParams.get('userId') || user._id;
      await userAPI.deleteUser(userId);
      await logout();
      navigate('/signup');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete account');
      setShowDeleteConfirmModal(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      setError('Logout failed. Please try again.');
      console.error('Logout error:', err);
    }
    setShowLogoutModal(false);
  };

  const handleBack = () => {
    // Check if user came from chat (has returnUrl in query params)
    const returnUrl = searchParams.get('returnUrl');
    if (returnUrl) {
      navigate(returnUrl);
    } else {
      navigate('/home');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="mb-4 sm:mb-6 font-medium sm:text-2xl text-gray-600 hover:text-black transition flex items-center cursor-pointer"
        >
          
          <ArrowLeft className="mr-1" size={20} />
          Back
        </button>

        {/* Header */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div className="w-full sm:w-auto">
              <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2 ">My Profile</h1>
              <p className="text-sm sm:text-base text-gray-600">Manage your account settings</p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowLogoutModal(true)}
              className="w-full sm:w-auto flex-shrink-0 justify-center"
            >
              <LogOut size={16} className="sm:w-[18px] sm:h-[18px] mr-2" />
              <span className="text-sm sm:text-base">Logout</span>
            </Button>
          </div>
        </div>

        {/* Profile Form */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
              {success}
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-5">
            <Input
              label="Username"
              type="text"
              value={username}
              onChange={setUsername}
              disabled={!isEditing}
              autoComplete="username"
              required
            />

            <div>
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                disabled={true}
                autoComplete="email"
                required
              />
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Email cannot be changed for security reasons
              </p>
            </div>

            {isEditing && (
              <>
                <div className="relative">
                  <Input
                    label="Current Password"
                    type={showOldPassword ? 'text' : 'password'}
                    placeholder="Enter current password"
                    value={oldPassword}
                    onChange={setOldPassword}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-1/2 translate-y-[4px] text-gray-500 hover:text-gray-700 cursor-pointer transition-colors"
                    aria-label={showOldPassword ? 'Hide password' : 'Show password'}
                  >
                    {showOldPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 -mt-3">
                  Required to update your profile information
                </p>

                <div className="relative">
                  <Input
                    label="New Password (Optional)"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    value={password}
                    onChange={setPassword}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 translate-y-[4px] text-gray-500 hover:text-gray-700 cursor-pointer transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              {!isEditing ? (
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => setIsEditing(true)}
                  fullWidth
                  className="text-sm sm:text-base"
                >
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                    fullWidth
                    className="text-sm sm:text-base"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setIsEditing(false);
                      setUsername(user.username);
                      setEmail(user.email);
                      setOldPassword('');
                      setPassword('');
                      setError('');
                      setSuccess('');
                    }}
                    fullWidth
                    className="text-sm sm:text-base"
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </form>

          <div className="mt-6 sm:mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold text-red-600 mb-2 sm:mb-3">Danger Zone</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4">
              Deleting your account is permanent and cannot be undone.
            </p>
            <Button
              variant="outline"
              onClick={handleDeleteClick}
              className="w-full sm:w-auto text-sm sm:text-base"
            >
              Delete Account
            </Button>
          </div>
        </div>
      </div>

      {/* Save Changes Confirmation Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-4 sm:p-6 animate-fadeIn">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">Save Changes?</h2>
            <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6">
              Are you sure you want to save these changes to your profile?
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="primary"
                onClick={confirmUpdate}
                fullWidth
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Yes, Save'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowSaveModal(false)}
                fullWidth
                disabled={isSubmitting}
              >
                No, Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Password Verification Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-4 sm:p-6 animate-fadeIn">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">Verify Password</h2>
            <p className="text-sm sm:text-base text-gray-700 mb-4">
              Please enter your password to continue with account deletion.
            </p>
            
            {deleteError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg mb-4 text-sm">
                {deleteError}
              </div>
            )}

            <div className="relative mb-6">
              <Input
                label="Password"
                type={showDeletePassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={deletePassword}
                onChange={setDeletePassword}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowDeletePassword(!showDeletePassword)}
                className="absolute right-3 top-1/2 translate-y-[4px] text-gray-500 hover:text-gray-700 cursor-pointer transition-colors"
                aria-label={showDeletePassword ? 'Hide password' : 'Show password'}
              >
                {showDeletePassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="primary"
                onClick={handlePasswordSubmit}
                fullWidth
              >
                Continue
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletePassword('');
                  setDeleteError('');
                }}
                fullWidth
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-4 sm:p-6 animate-fadeIn">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">Delete Account?</h2>
            <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6">
              Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="primary"
                onClick={handleDelete}
                fullWidth
              >
                Yes, Delete
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowDeleteConfirmModal(false);
                  setDeletePassword('');
                  setDeleteError('');
                }}
                fullWidth
              >
                No, Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-4 sm:p-6 animate-fadeIn">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">Logout?</h2>
            <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6">
              Are you sure you want to logout from your account?
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="primary"
                onClick={handleLogout}
                fullWidth
              >
                Yes, Logout
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowLogoutModal(false)}
                fullWidth
              >
                No, Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
