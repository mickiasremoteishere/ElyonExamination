import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  AlertTriangle, 
  LogOut,
  Settings,
  ChevronDown,
  User
} from 'lucide-react';
import { useState } from 'react';
import logo from '@/assets/logo.png';

const menuItems = [
  { 
    path: '/admin/superadmin/performance', 
    label: 'Performance', 
    icon: LayoutDashboard,
    subItems: [
      { path: '/admin/superadmin/performance/overview', label: 'Overview' },
      { path: '/admin/superadmin/performance/analytics', label: 'Analytics' },
      { path: '/admin/superadmin/performance/reports', label: 'Reports' },
    ]
  },
  { 
    path: '/admin/superadmin/exam-management', 
    label: 'Exam Management', 
    icon: FileText,
    subItems: [
      { path: '/admin/superadmin/exam-management/status', label: 'Exam Status' },
      { path: '/admin/superadmin/exam-management/schedule', label: 'Schedule' },
      { path: '/admin/superadmin/exam-management/configure', label: 'Configure' },
    ]
  },
  { 
    path: '/admin/superadmin/user-access', 
    label: 'User Access', 
    icon: Users,
    subItems: [
      { path: '/admin/superadmin/user-access/manage', label: 'Manage Users' },
      { path: '/admin/superadmin/user-access/permissions', label: 'Permissions' },
      { path: '/admin/superadmin/user-access/activity', label: 'Activity Logs' },
    ]
  },
];

const HorizontalNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, logout } = useAdminAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <header className="bg-primary text-primary-foreground w-full shadow-md">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <img src={logo} alt="Logo" className="h-8 w-auto" />
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {menuItems.map((item) => (
              <div key={item.path} className="relative group">
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1 transition-colors ${
                      isActive 
                        ? 'bg-primary-foreground/10 text-white' 
                        : 'text-primary-foreground/80 hover:bg-primary-foreground/5 hover:text-white'
                    }`
                  }
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                  <ChevronDown className="h-3 w-3 ml-1" />
                </NavLink>
                
                {/* Dropdown Menu */}
                <div className="absolute left-0 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-1">
                    {item.subItems.map((subItem) => (
                      <NavLink
                        key={subItem.path}
                        to={subItem.path}
                        className={({ isActive }) =>
                          `block px-4 py-2 text-sm ${
                            isActive 
                              ? 'bg-gray-100 text-gray-900' 
                              : 'text-gray-700 hover:bg-gray-50'
                          }`
                        }
                      >
                        {subItem.label}
                      </NavLink>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </nav>

          {/* Right side items */}
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-white">
              <span className="sr-only">Notifications</span>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            
            {/* Profile dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 focus:outline-none"
              >
                <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
                <span className="hidden md:inline-block text-sm font-medium">
                  {admin?.name || 'Admin'}
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showDropdown ? 'transform rotate-180' : ''}`} />
              </button>
              
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      role="menuitem"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className="md:hidden bg-primary-800">
        <div className="px-2 pt-2 pb-3 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `group flex items-center px-3 py-2 rounded-md text-base font-medium ${
                  isActive 
                    ? 'bg-primary-900 text-white' 
                    : 'text-primary-100 hover:bg-primary-700 hover:text-white'
                }`
              }
            >
              <item.icon className="mr-3 h-5 w-5 text-primary-300 group-hover:text-primary-100" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
    </header>
  );
};

export default HorizontalNavbar;
