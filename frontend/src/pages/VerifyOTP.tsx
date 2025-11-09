import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { verifyOTP, clearError } from '../store/slices/authSlice';
import api from '../api/client';

const VerifyOTP = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  const email = location.state?.email || '';
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) {
      navigate('/signup');
    }
  }, [email, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const digits = value.slice(0, 6).split('');
      const newOtp = [...otp];
      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);
      
      // Focus last filled input
      const lastIndex = Math.min(index + digits.length, 5);
      inputRefs.current[lastIndex]?.focus();
      return;
    }

    // Handle single digit input
    if (/^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      return;
    }

    dispatch(verifyOTP({ email, otp: otpString }));
  };

  const handleResendOTP = async () => {
    setResending(true);
    setResendMessage('');

    try {
      await api.post('/auth/resend-otp', { email });
      setResendMessage('OTP sent successfully! Check your email.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (error: any) {
      setResendMessage(error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="h-screen bg-yellow-400 flex overflow-hidden">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-black p-8 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400 rounded-full opacity-10 -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-400 rounded-full opacity-10 -ml-48 -mb-48"></div>
        
        <div className="relative z-10">
          <Link to="/" className="flex items-center space-x-3 mb-8">
            <img
              src="/logo.jpeg"
              alt="Clause-IQ Logo"
              className="h-10 w-10 rounded object-cover"
            />
            <span className="text-2xl font-black text-yellow-400">
              CLAUSE-IQ
            </span>
          </Link>
          
          <h1 className="text-4xl font-black text-white mb-4 leading-tight">
            ALMOST THERE!
            <span className="block text-yellow-400">VERIFY YOUR EMAIL</span>
          </h1>
          
          <p className="text-lg text-gray-300 mb-6">
            We've sent a 6-digit verification code to keep your account secure.
          </p>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-yellow-400 rounded flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-white text-sm font-medium">Quick & secure verification</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-yellow-400 rounded flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-white text-sm font-medium">Check your inbox</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-yellow-400 rounded flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-white text-sm font-medium">Code expires in 10 minutes</span>
            </div>
          </div>
        </div>
        
        <div className="relative z-10">
          <p className="text-gray-400 text-xs">
            Secure authentication powered by Clause-IQ
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl border-4 border-black p-8">
            <div className="mb-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-400 rounded-full mb-4">
                <svg className="w-8 h-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-3xl font-black text-black mb-2">
                VERIFY EMAIL
              </h2>
              <p className="text-gray-600 font-medium">
                Code sent to<br />
                <span className="text-black font-bold">{email}</span>
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-100 border-2 border-red-500 text-red-800 px-4 py-3 rounded-lg font-medium text-center">
                  {error}
                </div>
              )}

              {resendMessage && (
                <div className={`${
                  resendMessage.includes('successfully')
                    ? 'bg-green-100 border-2 border-green-500 text-green-800'
                    : 'bg-red-100 border-2 border-red-500 text-red-800'
                } px-4 py-3 rounded-lg font-medium text-center`}>
                  {resendMessage}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-black mb-3 text-center">
                  ENTER 6-DIGIT CODE
                </label>
                <div className="flex justify-center gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-14 text-center text-2xl font-black border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || otp.join('').length !== 6}
                className="w-full bg-black text-yellow-400 px-6 py-3 rounded-lg font-black text-lg hover:bg-gray-900 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
              >
                {loading ? (
                  <svg
                    className="animate-spin h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  "VERIFY EMAIL →"
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resending}
                  className="text-sm text-black font-bold hover:text-yellow-600 underline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resending ? 'SENDING...' : "DIDN'T RECEIVE? RESEND CODE"}
                </button>
              </div>
            </form>
          </div>
          
          {/* Mobile Logo */}
          <div className="lg:hidden mt-6 text-center">
            <Link to="/" className="inline-flex items-center space-x-2">
              <img
                src="/logo.jpeg"
                alt="Clause-IQ"
                className="h-7 w-7 rounded object-cover"
              />
              <span className="text-lg font-black text-black">CLAUSE-IQ</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
