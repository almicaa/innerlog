import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Archive from "./pages/Archive";
import CreatePost from "./pages/CreatePost";

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-[#121212] text-gray-100 font-sans">

        {/* NAVBAR */}
        <nav className="sticky top-0 z-50 bg-[#181818] border-b border-gray-800 px-6 py-4 flex justify-between items-center flex-wrap">

          {/* LOGO */}
          <Link
            to="/"
            className="flex items-center gap-3 text-white no-underline"
          >
            <div className="w-8 h-8 bg-[#1DB954] rounded-full" />
            <span className="font-bold text-xl tracking-tight">
              InnerLog
            </span>
          </Link>

          {/* NAV LINKS */}
          <div className="flex gap-6 mt-2 sm:mt-0">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/write">New Entry</NavLink>
            <NavLink to="/archive">Archive</NavLink>
          </div>
        </nav>

        {/* MAIN */}
        <main className="flex-1 px-6 py-8 max-w-5xl w-full mx-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/write" element={<CreatePost />} />
            <Route path="/archive" element={<Archive />} />
          </Routes>
        </main>

        {/* FOOTER */}
        <footer className="border-t border-gray-800 text-center py-8 text-sm text-gray-500">
          Created by{" "}
          <span className="text-gray-300 font-semibold">
            Palmica
          </span>

          <img
            src="/palmica.png"
            alt="Palmica"
            className="w-6 h-6 rounded-full inline-block ml-2 border border-gray-700"
          />
        </footer>

      </div>
    </Router>
  );
}

function NavLink({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className="text-gray-400 font-medium no-underline transition-colors duration-300 hover:text-[#1DB954]"
    >
      {children}
    </Link>
  );
}

export default App;