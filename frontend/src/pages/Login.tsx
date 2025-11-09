import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { login, clearError } from "../store/slices/authSlice";

const Login = () => {
  console.log("Login component rendering...");

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useAppSelector(
    (state) => state.auth
  );

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Clear errors when component unmounts
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(login(formData));
  };

  return (
    <div className="h-screen bg-yellow-400 flex overflow-hidden">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-black p-8 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400 rounded-full opacity-10 -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-400 rounded-full opacity-10 -ml-48 -mb-48"></div>

        <div className="relative z-10">
          <Link to="/" className="flex items-center space-x-3 mb-12">
            <img
              src="/logo.jpeg"
              alt="Clause-IQ Logo"
              className="h-12 w-12 rounded object-cover"
            />
            <span className="text-3xl font-black text-yellow-400">
              CLAUSE-IQ
            </span>
          </Link>

          <h1 className="text-5xl font-black text-white mb-6 leading-tight">
            WELCOME BACK TO
            <span className="block text-yellow-400">INTELLIGENT</span>
            CONTRACT MANAGEMENT
          </h1>

          <p className="text-xl text-gray-300 mb-8">
            Continue managing your contracts 10x faster with AI-powered
            insights.
          </p>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-yellow-400 rounded flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-black"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span className="text-white font-medium">Secure & encrypted</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-yellow-400 rounded flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-black"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span className="text-white font-medium">
                Real-time collaboration
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-yellow-400 rounded flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-black"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span className="text-white font-medium">24/7 AI assistance</span>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-gray-400 text-sm">
            Trusted by legal teams worldwide
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl border-4 border-black p-8">
            <div className="mb-6">
              <h2 className="text-3xl font-black text-black mb-2">
                WELCOME BACK
              </h2>
              <p className="text-gray-600 font-medium">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-black font-bold hover:text-yellow-600 underline"
                >
                  Sign up
                </Link>
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-100 border-2 border-red-500 text-red-800 px-4 py-3 rounded-lg font-medium">
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-bold text-black mb-2"
                >
                  EMAIL ADDRESS
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 font-medium"
                  placeholder="you@company.com"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-bold text-black mb-2"
                >
                  PASSWORD
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 font-medium"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
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
                  "SIGN IN →"
                )}
              </button>
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

export default Login;
