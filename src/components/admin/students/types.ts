
export interface StudentCardProps {
  student: {
    id: string;
    name: string | null;
    email: string | null;
    is_admin: boolean | null;
    role: string | null;
    first_login: boolean | null;
    must_change_password: boolean | null;
    created_at: string;
    progress_count: number;
    total_topics: number;
    last_activity: string | null;
  };
  onToggleAdmin: (userId: string, currentStatus: boolean) => void;
  formatDate: (dateString: string) => string;
  getProgressPercentage: (completed: number, total: number) => number;
}

export interface StudentsOverviewProps {
  students: any[];
}

export interface StudentsFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterRole: 'all' | 'student' | 'professor' | 'admin';
  setFilterRole: (role: 'all' | 'student' | 'professor' | 'admin') => void;
  filteredStudentsCount: number;
}

export interface StudentsAnalyticsProps {
  students: any[];
  getProgressPercentage: (completed: number, total: number) => number;
}
