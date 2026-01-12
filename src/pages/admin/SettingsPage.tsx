import { useState, useEffect } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Settings, User, Bell, Shield, Database, Save, X, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';

const SettingsPage = () => {
  const { admin, updateProfile, changePassword, loading, error } = useAdminAuth();
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: ''
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // Initialize form with admin data when it's available
  useEffect(() => {
    if (admin) {
      setProfileForm({
        name: admin.name || '',
        email: admin.email || '',
        phone: admin.phone || ''
      });
    }
  }, [admin]);
  
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!admin) return;
    
    const success = await updateProfile(profileForm);
    if (success) {
      toast.success('Profile updated successfully');
    } else {
      toast.error(error || 'Failed to update profile');
    }
  };
  
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    const result = await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
    
    if (result.success) {
      toast.success(result.message);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordForm(false);
    } else {
      toast.error(result.message);
    }
  };
  
  const handleCancelPassword = () => {
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowPasswordForm(false);
  };

  if (!admin) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your admin preferences and system settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 animate-slide-up">
            <div className="flex items-center gap-3 mb-6">
              <User size={20} className="text-primary" />
              <h2 className="text-lg font-display font-semibold text-foreground">Profile Settings</h2>
            </div>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="text-sm font-medium text-foreground block mb-2">Full Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={profileForm.name}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2.5 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="email" className="text-sm font-medium text-foreground block mb-2">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={profileForm.email}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2.5 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="phone" className="text-sm font-medium text-foreground block mb-2">Phone</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={profileForm.phone}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2.5 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Username</label>
                <input
                  type="text"
                  value={admin.username}
                  className="w-full px-4 py-2.5 bg-secondary border border-input rounded-lg text-muted-foreground"
                  disabled
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Role</label>
                <input
                  type="text"
                  value={admin.role}
                  className="w-full px-4 py-2.5 bg-secondary border border-input rounded-lg text-muted-foreground capitalize"
                  disabled
                />
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={16} />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-3 mb-6">
              <Bell size={20} className="text-primary" />
              <h2 className="text-lg font-display font-semibold text-foreground">Notification Settings</h2>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Email notifications for new violations', enabled: true },
                { label: 'Daily summary reports', enabled: true },
                { label: 'Real-time exam alerts', enabled: false },
                { label: 'Student registration notifications', enabled: true },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <span className="text-foreground">{item.label}</span>
                  <button
                    type="button"
                    className={`w-12 h-6 rounded-full transition-colors ${
                      item.enabled ? 'bg-primary' : 'bg-secondary'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-primary-foreground rounded-full shadow transition-transform ${
                        item.enabled ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center gap-3 mb-4">
              <Shield size={20} className="text-primary" />
              <h2 className="text-lg font-display font-semibold text-foreground">Security</h2>
            </div>
            <div className="space-y-3">
              {!showPasswordForm ? (
                <button 
                  type="button"
                  onClick={() => setShowPasswordForm(true)}
                  className="w-full flex items-center gap-2 px-4 py-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors text-foreground text-sm"
                >
                  <Lock size={16} />
                  Change Password
                </button>
              ) : (
                <div className="bg-secondary/20 p-4 rounded-lg space-y-3">
                  <h3 className="font-medium text-foreground">Change Password</h3>
                  <form onSubmit={handlePasswordSubmit} className="space-y-3">
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Current Password</label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary/30"
                        disabled={loading}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">New Password</label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary/30"
                        disabled={loading}
                        required
                        minLength={6}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary/30"
                        disabled={loading}
                        required
                      />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Updating...' : 'Update'}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelPassword}
                        disabled={loading}
                        className="flex items-center justify-center gap-1 px-3 py-2 bg-secondary text-foreground text-sm rounded-lg hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </form>
                </div>
              )}
              <button 
                type="button"
                className="w-full flex items-center gap-2 px-4 py-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors text-foreground text-sm"
              >
                <Shield size={16} />
                Two-Factor Authentication
              </button>
              <button 
                type="button"
                className="w-full flex items-center gap-2 px-4 py-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors text-foreground text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-history">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                  <path d="M3 3v5h5"/>
                  <path d="M12 7v5l3 3"/>
                </svg>
                Login History
              </button>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center gap-3 mb-4">
              <Database size={20} className="text-primary" />
              <h2 className="text-lg font-display font-semibold text-foreground">System</h2>
            </div>
            <div className="space-y-3">
              <button 
                type="button"
                className="w-full text-left px-4 py-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors text-foreground text-sm"
              >
                Export All Data
              </button>
              <button 
                type="button"
                className="w-full text-left px-4 py-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors text-foreground text-sm"
              >
                System Logs
              </button>
              <button 
                type="button"
                className="w-full text-left px-4 py-3 bg-destructive/10 rounded-lg hover:bg-destructive/20 transition-colors text-destructive text-sm"
              >
                Clear Cache
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
