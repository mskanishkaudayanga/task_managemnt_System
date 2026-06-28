import * as React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth-context";
import { Button } from "../ui/button";
import { LayoutDashboard, CheckSquare, Kanban, LogOut, Menu, X, User } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const menuItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Tasks List", path: "/tasks", icon: CheckSquare },
    { name: "Kanban Board", path: "/kanban", icon: Kanban },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#f6f8fc] flex flex-col md:flex-row text-[#0f172a]">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 p-6 flex-shrink-0">
        {/* Brand */}
        <div className="flex items-center gap-2 mb-8">
          <div className="bg-[#a6c2fa] text-[#0f172a] h-10 w-10 rounded-xl flex items-center justify-center font-bold text-lg">
            TL
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none">Taskly</h1>
            <span className="text-xs text-[#64748b]">SaaS Management</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1.5">
          {menuItems.map((item) => {
            const Active = isActive(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  Active
                    ? "bg-[#a6c2fa]/20 text-[#0f172a]"
                    : "text-[#64748b] hover:bg-slate-50 hover:text-[#0f172a]"
                }`}
              >
                <Icon className={`h-5 w-5 ${Active ? "text-[#0f172a]" : "text-[#64748b]"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Panel */}
        <div className="pt-6 border-t border-slate-100 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-semibold border border-slate-200">
              <User className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate leading-none mb-1">{user?.name}</p>
              <span className="inline-flex px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 text-[#64748b]">
                {user?.role}
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50/20"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Header and Drawer for Mobile */}
      <div className="md:hidden flex items-center justify-between bg-white border-b border-slate-200 px-6 py-4 w-full z-20">
        <div className="flex items-center gap-2">
          <div className="bg-[#a6c2fa] text-[#0f172a] h-8 w-8 rounded-lg flex items-center justify-center font-bold">
            TL
          </div>
          <span className="font-bold text-base">Taskly</span>
        </div>

        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute inset-0 bg-slate-900/30 backdrop-blur-[1px]"
            />

            {/* Sidebar content */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0.1, duration: 0.3 }}
              className="absolute inset-y-0 left-0 w-64 bg-white border-r border-slate-200 p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <div className="bg-[#a6c2fa] text-[#0f172a] h-8 w-8 rounded-lg flex items-center justify-center font-bold">
                    TL
                  </div>
                  <span className="font-bold text-base">Taskly</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)} className="h-8 w-8">
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 space-y-1.5" onClick={() => setIsMobileMenuOpen(false)}>
                {menuItems.map((item) => {
                  const Active = isActive(item.path);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        Active
                          ? "bg-[#a6c2fa]/20 text-[#0f172a]"
                          : "text-[#64748b] hover:bg-slate-50 hover:text-[#0f172a]"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              {/* User Panel */}
              <div className="pt-6 border-t border-slate-100 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-semibold">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate leading-none mb-1">{user?.name}</p>
                    <span className="inline-flex px-1.5 py-0.5 text-[9px] font-bold rounded bg-slate-100 text-[#64748b]">
                      {user?.role}
                    </span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center justify-center gap-2 border-slate-200 text-slate-600"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Main Page Area */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
