import { Link } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Menu, X, CarFront } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="glass sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center gap-3 group">
              <div className="bg-gradient-to-br from-orange-400 to-orange-600 p-2 rounded-xl text-white shadow-lg group-hover:scale-105 transition-transform">
                <CarFront className="h-6 w-6" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-slate-800 font-outfit">RevMarket</span>
            </Link>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-2">
            <Link to="/" className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/50 transition-all">Home</Link>
            
            {!user ? (
              <>
                <Link to="/login" className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/50 transition-all">Login</Link>
                <Link to="/register" className="ml-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">Sign Up</Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/50 transition-all">Dashboard</Link>
                <button 
                  onClick={logout} 
                  className="ml-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-slate-800 hover:bg-slate-900 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Logout
                </button>
              </>
            )}
          </div>
          
          <div className="flex items-center sm:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="inline-flex items-center justify-center p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100/50 focus:outline-none transition-colors">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isOpen && (
        <div className="sm:hidden border-t border-slate-200/50 bg-white/80 backdrop-blur-xl">
          <div className="pt-2 pb-4 space-y-1 px-4">
            <Link to="/" className="block px-4 py-3 rounded-xl text-base font-semibold text-slate-700 hover:bg-slate-50">Home</Link>
            {!user ? (
              <>
                <Link to="/login" className="block px-4 py-3 rounded-xl text-base font-semibold text-slate-700 hover:bg-slate-50">Login</Link>
                <Link to="/register" className="block px-4 py-3 mt-2 rounded-xl text-base font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 text-center">Sign Up</Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className="block px-4 py-3 rounded-xl text-base font-semibold text-slate-700 hover:bg-slate-50">Dashboard</Link>
                <button onClick={logout} className="block w-full text-left px-4 py-3 rounded-xl text-base font-semibold text-slate-700 hover:bg-slate-50 mt-1">Logout</button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
