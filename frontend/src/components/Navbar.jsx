import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Trophy, LogOut, User as UserIcon, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-surface shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <Trophy className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
              <span className="font-bold text-xl text-navy tracking-tight">DebateSys</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/dashboard" className="text-slate-600 hover:text-primary transition-colors flex items-center space-x-1 px-3 py-2 rounded-md hover:bg-primary/5">
                  <LayoutDashboard className="w-5 h-5" />
                  <span className="font-medium">Dashboard</span>
                </Link>
                <div className="h-6 w-px bg-slate-200 mx-2"></div>
                <div className="flex items-center space-x-2 text-sm text-slate-700 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                  <UserIcon className="w-4 h-4 text-secondary" />
                  <span className="font-medium">{user.name}</span>
                  <span className="bg-white text-primary px-2 py-0.5 rounded shadow-sm text-[10px] uppercase font-bold tracking-wider">{user.role}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-4 p-2 text-slate-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-slate-600 hover:text-primary font-medium transition-colors px-3 py-2 rounded-md hover:bg-primary/5">
                  Log in
                </Link>
                <Link to="/register" className="btn-primary">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
