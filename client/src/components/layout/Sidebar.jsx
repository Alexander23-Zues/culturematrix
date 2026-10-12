import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, TrendingUp, Package, ShoppingCart,
  Users, Calendar, MapPin, FileText, Link2, Settings,
  LogOut, Menu, X, Leaf,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/sales', icon: TrendingUp, label: 'Sales Analytics' },
  { to: '/products', icon: Package, label: 'Product & Crafts' },
  { to: '/orders', icon: ShoppingCart, label: 'Order Analytics' },
  { to: '/customers', icon: Users, label: 'Customer Analytics' },
  { to: '/events', icon: Calendar, label: 'Event Analytics' },
  { to: '/destinations', icon: MapPin, label: 'Heritage & Scenic' },
  { to: '/reports', icon: FileText, label: 'Reports' },
  { to: '/integration', icon: Link2, label: 'CultureFrame Link' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-5 border-b border-forest-700">
        <Leaf className="text-gold-300" size={24} />
        <div>
          <div className="text-white font-display font-bold text-base leading-tight">CultureMetrics</div>
          <div className="text-forest-300 text-xs">Analytics Dashboard</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Admin info + Logout */}
      <div className="border-t border-forest-700 px-4 py-4">
        <div className="text-forest-300 text-xs mb-3">
          Logged in as <span className="text-white font-medium">{admin?.username}</span>
          <div className="text-forest-400 capitalize">{admin?.role}</div>
        </div>
        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-left hover:bg-red-900/30 text-forest-200"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 bg-forest-800 text-white p-2 rounded-lg shadow"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle sidebar"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-forest-800 z-40 transition-transform duration-300
          lg:translate-x-0 lg:static lg:z-auto
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
