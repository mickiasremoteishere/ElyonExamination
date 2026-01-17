import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { notifyExamAvailable, notifyUpcomingExam } from '@/utils/examNotifications';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Filter, MoreHorizontal, Calendar, Clock, Users, BookOpen } from 'lucide-react';

// Mock data for exams
const mockExams = [
  {
    id: '1',
    title: 'Mathematics Midterm',
    subject: 'Mathematics',
    date: '2024-02-15',
    duration: 120,
    status: 'available',
    totalStudents: 45,
    maxScore: 100
  },
  {
    id: '2',
    title: 'Physics Final',
    subject: 'Physics',
    date: '2024-03-01',
    duration: 90,
    status: 'not_available',
    totalStudents: 38,
    maxScore: 80
  },
  {
    id: '3',
    title: 'Chemistry Quiz',
    subject: 'Chemistry',
    date: '2024-02-20',
    duration: 60,
    status: 'ended',
    totalStudents: 42,
    maxScore: 50
  },
];

const ExamManagement = () => {
  const [exams, setExams] = useState(mockExams);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  const handleStatusChange = (examId: string, newStatus: string) => {
    setExams(exams.map(exam => 
      exam.id === examId ? { ...exam, status: newStatus } : exam
    ));
  };

  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || exam.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string }> = {
      available: { variant: 'default', label: 'Available' },
      not_available: { variant: 'outline', label: 'Not Available' },
      ended: { variant: 'destructive', label: 'Ended' }
    };
    const { variant, label } = statusMap[status] || { variant: 'outline', label: 'Unknown' };
    return <Badge variant={variant}>{label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Exam Management</h2>
          <p className="text-muted-foreground">Manage and configure all exams</p>
        </div>
        <Button onClick={() => navigate('/admin/superadmin/exam-management/configure')}>
          <Plus className="mr-2 h-4 w-4" /> Add New Exam
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search exams..."
                className="w-full pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Select onValueChange={setStatusFilter} defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="not_available">Not Available</SelectItem>
                  <SelectItem value="ended">Ended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Students</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExams.map((exam) => (
                <TableRow key={exam.id}>
                  <TableCell className="font-medium">{exam.title}</TableCell>
                  <TableCell>{exam.subject}</TableCell>
                  <TableCell className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    {new Date(exam.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    {Math.floor(exam.duration / 60)}h {exam.duration % 60}m
                  </TableCell>
                  <TableCell>
                    <Select
                      value={exam.status}
                      onValueChange={(value) => handleStatusChange(exam.id, value)}
                    >
                      <SelectTrigger className="w-[150px]">
                        {getStatusBadge(exam.status)}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="not_available">Not Available</SelectItem>
                        <SelectItem value="ended">Ended</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                      {exam.totalStudents}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">More options</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Outlet />
    </div>
  );
};

export default ExamManagement;
