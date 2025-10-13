import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/Input';
import Button from '../components/Button';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error khi user nhập
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.phoneNumber && !/^\+?[0-9]{10,15}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await register(formData);
      
      if (response.success) {
        navigate('/dashboard');
      } else {
        setError(response.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during registration');
      
      // Xử lý validation errors từ API
      if (err.errors && Array.isArray(err.errors)) {
        const apiErrors = {};
        err.errors.forEach(error => {
          apiErrors[error.field.toLowerCase()] = error.message;
        });
        setErrors(apiErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-blue-50 to-indigo-100 px-4 py-12">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            CarbonTC
          </h1>
          <p className="text-gray-600">Create your account</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Global Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <Input
              label="Full Name"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              error={errors.fullName}
              placeholder="John Doe"
              autoFocus
            />

            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="john@example.com"
            />

            <Input
              label="Phone Number (Optional)"
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              error={errors.phoneNumber}
              placeholder="+84912345678"
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="••••••••"
            />

            <Button 
              type="submit" 
              loading={loading} 
              className="w-full mt-2"
            >
              Create Account
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="text-primary-600 hover:text-primary-700 font-medium hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <p className="mt-8 text-center text-sm text-gray-500">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}