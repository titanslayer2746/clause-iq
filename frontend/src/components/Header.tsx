import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { logout } from "../store/slices/authSlice";
import NotificationBell from "./NotificationBell";

const Header = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <header className="bg-yellow-400 border-b-4 border-black px-6 py-3 shadow-lg">
      <div className="flex items-center justify-between">
        {/* Left Section - Spacer for balance */}
        <div className="flex items-center gap-4 w-1/3">
          <NotificationBell />
        </div>

        {/* Center Section - Logo */}
        <div className="flex justify-center w-1/3">
          <Link to="/dashboard" className="flex items-center space-x-4 group">
            <img
              src="/logo.jpeg"
              alt="Clause-IQ Logo"
              className="h-16 w-16 rounded object-cover border-2 border-black shadow-lg"
            />
            <h1 className="text-3xl font-black text-black group-hover:text-gray-800 transition hidden sm:block">
              CLAUSE-IQ
            </h1>
          </Link>
        </div>

        {/* Right Section - User Menu */}
        <div className="flex items-center justify-end gap-4 w-1/3">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-3 bg-black px-4 py-2 rounded-lg hover:bg-gray-900 transition transform hover:scale-105 border-2 border-black shadow-md"
            >
              <div className="h-10 w-10 rounded-full bg-yellow-400 flex items-center justify-center text-black font-black border-2 border-black">
                {user?.email.charAt(0).toUpperCase()}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-sm font-bold text-yellow-400 truncate max-w-[150px]">
                  {user?.email}
                </p>
                <p className="text-xs font-medium text-gray-300">{user?.role}</p>
              </div>
              <svg
                className={`h-5 w-5 text-yellow-400 transition-transform ${
                  isDropdownOpen ? "transform rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-2xl py-2 z-50 border-4 border-black">
                <div className="px-4 py-3 border-b-2 border-black">
                  <p className="text-sm font-bold text-black truncate">{user?.email}</p>
                  <p className="text-xs font-medium text-gray-600">{user?.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-3 text-sm font-bold text-black hover:bg-yellow-400 transition"
                >
                  <svg
                    className="h-5 w-5 mr-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  SIGN OUT
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
