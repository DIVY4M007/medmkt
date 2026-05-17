import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { Stethoscope, ShoppingCart, Package, ClipboardList, Users, LogOut, Store, LayoutDashboard } from 'lucide-react';
import { Button } from './ui/button';

const NavItem = ({ to, icon: Icon, label, testid }) => {
  const loc = useLocation();
  const active = loc.pathname === to || (to !== '/' && loc.pathname.startsWith(to));
  return (
    <Link
      to={to}
      data-testid={testid}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-sm transition-colors
        ${active
          ? 'bg-[#EAE5D9] text-[#1F2321] font-medium'
          : 'text-[#5C635F] hover:bg-[#F4F1EA] hover:text-[#1F2321]'}`}
    >
      <Icon className="h-4 w-4" strokeWidth={1.75} />
      {label}
    </Link>
  );
};

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const org = user?.organization;
  const isSeller = org?.isSeller;
  const isBuyer = org?.isBuyer;

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen flex bg-[#FDFBF7]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[#D5CEBD] bg-[#FDFBF7] flex flex-col" data-testid="app-sidebar">
        <div className="p-6 border-b border-[#D5CEBD]">
          <Link to="/" className="flex items-center gap-2.5" data-testid="brand-link">
            <div className="h-9 w-9 rounded-md bg-[#4A675B] flex items-center justify-center">
              <Stethoscope className="h-5 w-5 text-white" strokeWidth={1.75} />
            </div>
            <div>
              <div className="font-heading font-semibold text-[#1F2321] leading-tight">MedMarket</div>
              <div className="text-[10px] tracking-[0.2em] uppercase text-[#5C635F]">B2B Healthcare</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <div className="label-overline text-[#5C635F] px-4 mb-2">Workspace</div>
          <NavItem to="/" icon={LayoutDashboard} label="Dashboard" testid="nav-dashboard" />
          <NavItem to="/marketplace" icon={Store} label="Marketplace" testid="nav-marketplace" />
          {isBuyer && user?.role === 'requestor' && (
            <NavItem to="/cart" icon={ShoppingCart} label="My Cart" testid="nav-cart" />
          )}
          {isBuyer && (
            <NavItem to="/orders?view=buyer" icon={ClipboardList} label="Purchase Orders" testid="nav-orders-buyer" />
          )}

          {isSeller && (
            <>
              <div className="label-overline text-[#5C635F] px-4 mt-6 mb-2">Selling</div>
              <NavItem to="/seller/products" icon={Package} label="My Products" testid="nav-seller-products" />
              <NavItem to="/orders?view=seller" icon={ClipboardList} label="Sales Orders" testid="nav-orders-seller" />
            </>
          )}

          {user?.role === 'approver' && (
            <>
              <div className="label-overline text-[#5C635F] px-4 mt-6 mb-2">Admin</div>
              <NavItem to="/team" icon={Users} label="Team" testid="nav-team" />
            </>
          )}
        </nav>

        <div className="p-4 border-t border-[#D5CEBD]">
          <div className="px-2 py-2">
            <div className="text-sm font-medium text-[#1F2321]" data-testid="sidebar-user-name">{user?.name}</div>
            <div className="text-xs text-[#5C635F] truncate">{user?.email}</div>
            <div className="mt-1.5 inline-flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#4A675B] font-medium">{user?.role}</span>
              <span className="text-[10px] text-[#5C635F]">·</span>
              <span className="text-[10px] text-[#5C635F] truncate">{org?.name}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start mt-2 text-[#5C635F] hover:text-[#1F2321] hover:bg-[#F4F1EA]"
            onClick={handleLogout}
            data-testid="logout-btn"
          >
            <LogOut className="h-4 w-4 mr-2" strokeWidth={1.75} />
            Sign out
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto" data-testid="app-main">
        {children}
      </main>
    </div>
  );
}
