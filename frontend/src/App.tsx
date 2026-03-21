import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import { useState, createContext, useContext } from "react";
import Home from "./pages/Home";
import Archive from "./pages/Archive";
import CreatePost from "./pages/CreatePost";
import Login from "./pages/Login";
import PostDetail from "./pages/PostDetail";
import MoodDashboard from "./pages/MoodDashboard";

// Auth Context
interface AuthContextType {
  token: string | null;
  isAdmin: boolean;
  login: (token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  token: null,
  isAdmin: false,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [menuOpen, setMenuOpen] = useState(false);

  const login = (t: string) => {
    localStorage.setItem("token", t);
    setToken(t);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, isAdmin: !!token, login, logout }}>
      <Router>
        <div className="min-h-screen flex flex-col bg-[#121212] text-gray-100 font-sans">
          {/* NAVBAR */}
          <nav className="sticky top-0 z-50 bg-[#181818] border-b border-gray-800 px-6 py-4 flex justify-between items-center">
            <Link to="/" className="flex items-center gap-3 text-white no-underline" onClick={() => setMenuOpen(false)}>
              <div className="w-8 h-8 bg-[#1DB954] rounded-full" />
              <span className="font-bold text-xl tracking-tight">InnerLog</span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden sm:flex gap-6 items-center">
              <NavLink to="/">Home</NavLink>
              {token && <NavLink to="/write">New Entry</NavLink>}
              <NavLink to="/archive">Archive</NavLink>
              {token && <NavLink to="/mood">Mood</NavLink>}
              {token ? (
                <button
                  onClick={logout}
                  className="text-sm text-[#888] hover:text-red-400 transition-colors font-medium"
                >
                  Logout
                </button>
              ) : (
                <NavLink to="/login">Login</NavLink>
              )}
            </div>

            {/* Hamburger button */}
            <button
              className="sm:hidden flex flex-col gap-[5px] p-2"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
              <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
            </button>
          </nav>

          {/* Mobile menu */}
          <div className={`sm:hidden bg-[#181818] border-b border-gray-800 overflow-hidden transition-all duration-300 ${menuOpen ? "max-h-64 py-4" : "max-h-0"}`}>
            <div className="flex flex-col gap-4 px-6">
              <MobileNavLink to="/" onClick={() => setMenuOpen(false)}>Home</MobileNavLink>
              {token && <MobileNavLink to="/write" onClick={() => setMenuOpen(false)}>New Entry</MobileNavLink>}
              <MobileNavLink to="/archive" onClick={() => setMenuOpen(false)}>Archive</MobileNavLink>
              {token && <MobileNavLink to="/mood" onClick={() => setMenuOpen(false)}>Mood</MobileNavLink>}
              {token ? (
                <button
                  onClick={() => { logout(); setMenuOpen(false); }}
                  className="text-left text-red-400 font-medium py-1"
                >
                  Logout
                </button>
              ) : (
                <MobileNavLink to="/login" onClick={() => setMenuOpen(false)}>Login</MobileNavLink>
              )}
            </div>
          </div>

          {/* MAIN */}
          <main className="flex-1 px-6 py-8 max-w-5xl w-full mx-auto">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/write" element={token ? <CreatePost /> : <Navigate to="/login" />} />
              <Route path="/archive" element={<Archive />} />
              <Route path="/post/:id" element={<PostDetail />} />
              <Route path="/mood" element={token ? <MoodDashboard /> : <Navigate to="/login" />} />
            </Routes>
          </main>

          {/* FOOTER */}
          <footer className="border-t border-gray-800 text-center py-8 text-sm text-gray-500">
            Created by{" "}
            <span className="text-gray-300 font-semibold">Palmica</span>
            <img src="/palmica.png" alt="Palmica" className="w-6 h-6 rounded-full inline-block ml-2 border border-gray-700" />
          </footer>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} className="text-gray-400 font-medium no-underline transition-colors duration-300 hover:text-[#1DB954]">
      {children}
    </Link>
  );
}

function MobileNavLink({ to, children, onClick }: { to: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <Link to={to} onClick={onClick} className="text-gray-300 font-medium no-underline text-lg hover:text-[#1DB954] transition-colors py-1">
      {children}
    </Link>
  );
}

export default App;