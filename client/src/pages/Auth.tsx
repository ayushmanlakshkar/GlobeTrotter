import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/auth.service';
import logoSvg from '../assets/logo';

interface AuthProps {
  isSignUp?: boolean;
}

const Auth: React.FC<AuthProps> = ({ isSignUp = false }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(isSignUp ? 'signup' : 'login');
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // Signup form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [signupError, setSignupError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    if (!loginEmail || !loginPassword) {
      setLoginError('Please fill in all fields');
      return;
    }
    
    try {
      setIsLoading(true);
      await authService.login({ email: loginEmail, password: loginPassword });
      navigate('/dashboard');
    } catch (error: any) {
      setLoginError(error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');
    
    // Basic validations
    if (!firstName || !lastName || !username || !email || !phoneNumber || !city || !country || !password) {
      setSignupError('Please fill in all required fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setSignupError('Passwords do not match');
      return;
    }
    
    try {
      setIsLoading(true);
      await authService.register({
        first_name: firstName,
        last_name: lastName,
        username,
        email,
        phone_number: phoneNumber,
        city,
        country,
        password,
      });
      navigate('/dashboard');
    } catch (error: any) {
      setSignupError(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const switchTab = (tab: 'login' | 'signup') => {
    setActiveTab(tab);
    navigate(tab === 'login' ? '/login' : '/signup');
  };
  
  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Side - Purple section */}
      <div className="flex-1 bg-primary text-white p-10 flex flex-col justify-center items-center relative overflow-hidden">
        <div className="max-w-xl relative z-10">
          <div className="flex items-center mb-5">
            <div className="w-12 h-12 mr-4" dangerouslySetInnerHTML={{ __html: logoSvg }} />
            <h1 className="text-3xl font-bold m-0">GlobeTrotter</h1>
          </div>
          <h2 className="text-4xl font-bold mb-5">One travel app to replace them all</h2>
          <p className="text-lg opacity-90">
            Streamline every aspect of your trip - from itinerary planning and 
            travel budgeting to packing and wanderlust sharing.
          </p>
        </div>
        {/* Background pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%22500%22%20height%3D%22500%22%20viewBox%3D%220%200%20500%20500%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M50%20100%20L100%2050%20L150%20100%20L200%2050%20L250%20100%20L300%2050%20L350%20100%20L400%2050%20L450%20100%22%20stroke%3D%22rgba(255%2C%20255%2C%20255%2C%200.1)%22%20stroke-width%3D%222%22%2F%3E%3Cpath%20d%3D%22M50%20200%20L100%20150%20L150%20200%20L200%20150%20L250%20200%20L300%20150%20L350%20200%20L400%20150%20L450%20200%22%20stroke%3D%22rgba(255%2C%20255%2C%20255%2C%200.1)%22%20stroke-width%3D%222%22%2F%3E%3Cpath%20d%3D%22M50%20300%20L100%20250%20L150%20300%20L200%20250%20L250%20300%20L300%20250%20L350%20300%20L400%20250%20L450%20300%22%20stroke%3D%22rgba(255%2C%20255%2C%20255%2C%200.1)%22%20stroke-width%3D%222%22%2F%3E%3Cpath%20d%3D%22M50%20400%20L100%20350%20L150%20400%20L200%20350%20L250%20400%20L300%20350%20L350%20400%20L400%20350%20L450%20400%22%20stroke%3D%22rgba(255%2C%20255%2C%20255%2C%200.1)%22%20stroke-width%3D%222%22%2F%3E%3C%2Fsvg%3E')] bg-[length:500px_500px]">
        </div>
      </div>
      
      {/* Right Side - Form section */}
      <div className="flex-1 flex justify-center items-center p-10">
        <div className="w-full max-w-md">
          {/* Tabs */}
          <div className="flex border-b-2 border-gray-200 mb-8">
            <button
              className={`flex-1 py-4 text-lg font-semibold relative ${
                activeTab === 'login' 
                  ? 'text-primary after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-0.5 after:bg-primary' 
                  : 'text-gray-500'
              }`}
              onClick={() => switchTab('login')}
            >
              Login
            </button>
            <button
              className={`flex-1 py-4 text-lg font-semibold relative ${
                activeTab === 'signup' 
                  ? 'text-primary after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-0.5 after:bg-primary' 
                  : 'text-gray-500'
              }`}
              onClick={() => switchTab('signup')}
            >
              Sign Up
            </button>
          </div>
          
          {/* Form Container with scrolling fixed on the form side */}
          <div className="overflow-y-auto max-h-[70vh] pr-2 -mr-2">
            {activeTab === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-6">
                <div>
                  <label htmlFor="loginEmail" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    id="loginEmail"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="loginPassword" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    id="loginPassword"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    required
                  />
                </div>
                
                {loginError && (
                  <p className="text-red-600 text-sm">{loginError}</p>
                )}
                
                <div className="flex flex-col items-center">
                  <button 
                    type="submit" 
                    className="w-full bg-primary text-white py-3 rounded-md font-semibold hover:bg-primary-dark transition-colors"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Logging in...' : 'Login'}
                  </button>
                  <p className="mt-4">
                    <a href="/forgot-password" className="text-primary hover:underline">Forgot password?</a>
                  </p>
                </div>
{/*                 
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">or</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 space-y-4">
                    <button type="button" className="w-full border border-gray-300 py-3 rounded-md font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                      Sign in with Google
                    </button>
                    <button type="button" className="w-full border border-gray-300 py-3 rounded-md font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                      Sign in with Apple
                    </button>
                  </div>
                </div> */}
              </form>
            ) : (
              <form onSubmit={handleSignupSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose a username"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Phone number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Your city"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input
                      type="text"
                      id="country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="Your country"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    required
                  />
                </div>
                
                {signupError && (
                  <p className="text-red-600 text-sm">{signupError}</p>
                )}
                
                <button 
                  type="submit" 
                  className="w-full bg-primary text-white py-3 rounded-md font-semibold hover:bg-primary-dark transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>
{/*                 
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">or</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 space-y-4">
                    <button type="button" className="w-full border border-gray-300 py-3 rounded-md font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                      Sign up with Google
                    </button>
                    <button type="button" className="w-full border border-gray-300 py-3 rounded-md font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                      Sign up with Apple
                    </button>
                  </div>
                </div> */}
                
                <p className="text-sm text-center text-gray-600 mt-4">
                  By signing up, you agree to our <a href="/terms" className="text-primary hover:underline">Terms of Service</a> and <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
