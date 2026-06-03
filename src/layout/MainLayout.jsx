import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  FaEnvelope,
  FaTachometerAlt,
  FaUser,
  FaBars,
  FaTimes,
  FaSignOutAlt,
} from "react-icons/fa";
import { MdMap } from "react-icons/md";

const MainLayout = ({ user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { path: "/", icon: <FaTachometerAlt />, label: "Dashboard" },
    { path: "/message", icon: <FaEnvelope />, label: "Messages" },
    { path: "/map", icon: <MdMap />, label: "Carte" },
    { path: "/profile", icon: <FaUser />, label: "Profile" },
  ];

  return (
    <div className="flex h-screen bg-slate-50">

      {/* OVERLAY MOBILE */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed lg:relative z-30 w-64 h-full
          bg-white/80 backdrop-blur-xl
          border-r border-slate-100
          transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >

        {/* HEADER SIDEBAR */}
        <div className="px-5 py-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-800">
            Déclinaison
          </h2>

          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-500"
          >
            <FaTimes />
          </button>
        </div>

        {/* NAV */}
        <nav className="px-3 mt-2 space-y-1">

          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `
                flex items-center gap-3 px-4 py-3 rounded-xl
                transition-all duration-200
                ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }
                `
              }
            >
              <span className="text-lg opacity-90">{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </NavLink>
          ))}

        </nav>

        {/* USER FOOTER */}
        <div className="absolute bottom-0 left-0 right-0 p-4">

          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-100/70">

            <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-semibold">
              {user?.username?.charAt(0)?.toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">
                {user?.username}
              </p>
              <p className="text-xs text-slate-500">
                connecté
              </p>
            </div>

          </div>

        </div>

      </aside>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* HEADER */}
        <header className="sticky top-0 z-10 bg-slate-50/70 backdrop-blur-xl">

          <div className="flex items-center justify-between px-4 md:px-6 py-3">

            {/* LEFT */}
            <div className="flex items-center gap-3">

              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-200/60"
              >
                <FaBars size={18} />
              </button>

              <h1 className="text-base md:text-lg font-semibold text-slate-800">
                Bienvenue, {user?.username}
              </h1>

            </div>

            {/* RIGHT */}
            <button
              onClick={onLogout}
              className="
                flex items-center gap-2
                px-3 py-2 rounded-xl
                bg-red-500/90 hover:bg-red-500
                text-white text-sm
                transition
              "
            >
              <FaSignOutAlt />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>

          </div>

        </header>

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto p-1 md:p-2">
          <Outlet />
        </main>

      </div>

    </div>
  );
};

export default MainLayout;