import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, AlertTriangle, UserPlus, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SuperadminDashboard = () => {
  const navigate = useNavigate();

  const stats = [
    { title: 'Total Students', value: '1,234', icon: Users, change: '+12% from last month', color: 'bg-blue-100 text-blue-600' },
    { title: 'Exams Conducted', value: '45', icon: FileText, change: '+5 from last month', color: 'bg-green-100 text-green-600' },
    { title: 'Violations Detected', value: '23', icon: AlertTriangle, change: '-3 from last month', color: 'bg-red-100 text-red-600' },
    { title: 'New Users', value: '156', icon: UserPlus, change: '+24% from last month', color: 'bg-purple-100 text-purple-600' },
  ];

  const quickActions = [
    { title: 'Add New Admin', icon: UserPlus, path: '/admin/admins/new' },
    { title: 'Manage Users', icon: Users, path: '/admin/users' },
    { title: 'System Settings', icon: Settings, path: '/admin/settings' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-muted-foreground">Welcome back, Super Admin! Here's what's happening with your platform.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`h-10 w-10 rounded-full ${stat.color} flex items-center justify-center`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action, index) => (
            <Card 
              key={index} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(action.path)}
            >
              <CardContent className="p-6 flex flex-col items-center justify-center h-full">
                <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
                  <action.icon className="h-6 w-6" />
                </div>
                <h4 className="font-medium text-center">{action.title}</h4>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-start pb-4 border-b last:border-0 last:pb-0">
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3 mt-1">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">New student registration</p>
                    <p className="text-sm text-muted-foreground">John Doe registered for the exam</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SuperadminDashboard;
