import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { signup, clearError } from "../store/slices/authSlice";

const Signup = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    organizationName: "",
  });

  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear validation error for this field
    if (validationErrors[e.target.name]) {
      setValidationErrors({
        ...validationErrors,
        [e.target.name]: "",
      });
    }
  };

  const validate = () => {
    const errors: { [key: string]: string } = {};

    if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (formData.organizationName.length < 2) {
      errors.organizationName =
        "Organization name must be at least 2 characters";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const result = await dispatch(
      signup({
        email: formData.email,
        password: formData.password,
        organizationName: formData.organizationName,
      })
    );

    if (signup.fulfilled.match(result)) {
      // Navigate to OTP verification with email in state
      navigate("/verify-otp", { state: { email: formData.email } });
    }
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
            START YOUR
            <span className="block text-yellow-400">AI-POWERED</span>
            CONTRACT JOURNEY
          </h1>

          <p className="text-xl text-gray-300 mb-8">
            Join forward-thinking legal teams managing contracts 10x faster with
            AI.
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
              <span className="text-white font-medium">
                Instant AI extraction
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
              <span className="text-white font-medium">
                Automated risk detection
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
              <span className="text-white font-medium">
                Never miss a deadline
              </span>
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
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl border-4 border-black p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-black text-black mb-2">
                CREATE ACCOUNT
              </h2>
              <p className="text-gray-600 font-medium">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-black font-bold hover:text-yellow-600 underline"
                >
                  Sign in
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
                  htmlFor="organizationName"
                  className="block text-sm font-bold text-black mb-2"
                >
                  ORGANIZATION NAME
                </label>
                <input
                  id="organizationName"
                  name="organizationName"
                  type="text"
                  required
                  value={formData.organizationName}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 ${
                    validationErrors.organizationName
                      ? "border-red-500"
                      : "border-black"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 font-medium`}
                  placeholder="Your Company Inc."
                />
                {validationErrors.organizationName && (
                  <p className="mt-2 text-sm text-red-600 font-medium">
                    {validationErrors.organizationName}
                  </p>
                )}
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
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 ${
                    validationErrors.password
                      ? "border-red-500"
                      : "border-black"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 font-medium`}
                  placeholder="••••••••"
                />
                {validationErrors.password && (
                  <p className="mt-2 text-sm text-red-600 font-medium">
                    {validationErrors.password}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-bold text-black mb-2"
                >
                  CONFIRM PASSWORD
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 ${
                    validationErrors.confirmPassword
                      ? "border-red-500"
                      : "border-black"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 font-medium`}
                  placeholder="••••••••"
                />
                {validationErrors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600 font-medium">
                    {validationErrors.confirmPassword}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-yellow-400 px-6 py-4 rounded-lg font-black text-lg hover:bg-gray-900 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
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
                  "CREATE ACCOUNT →"
                )}
              </button>

              <p className="text-xs text-gray-600 text-center mt-4 font-medium">
                By creating an account, you agree to our Terms & Privacy Policy
              </p>
            </form>
          </div>

          {/* Mobile Logo */}
          <div className="lg:hidden mt-8 text-center">
            <Link to="/" className="inline-flex items-center space-x-2">
              <img
                src="/logo.jpeg"
                alt="Clause-IQ"
                className="h-8 w-8 rounded object-cover"
              />
              <span className="text-xl font-black text-black">CLAUSE-IQ</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
