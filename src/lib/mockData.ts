export type Candidate = {
  id: string;
  name: string;
  email: string;
  title: string;
  avatar: string;
  skills: string[];
  experience: number; // in years
  matchScore?: number; // AI score 0-100
};

export type Job = {
  id: string;
  companyId: string;
  title: string;
  department: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
  status: 'Draft' | 'Pending' | 'Published' | 'Closed';
  description: string;
  salaryRange: string;
  requirements: string[];
  postedDate: string;
};

export type Match = {
  id: string;
  jobId: string;
  candidateId: string;
  status: 'New' | 'Screening' | 'Interview' | 'Offered' | 'Hired' | 'Rejected';
  appliedDate: string;
  aiScore: number;
};

export const MOCK_CANDIDATES: Candidate[] = [
  {
    id: 'c1',
    name: 'Alex Nguyen',
    email: 'alex.n@example.com',
    title: 'Senior Frontend Developer',
    avatar: 'https://i.pravatar.cc/150?u=c1',
    skills: ['React', 'Next.js', 'TypeScript', 'Tailwind'],
    experience: 5,
    matchScore: 92
  },
  {
    id: 'c2',
    name: 'Mai Tran',
    email: 'mai.t@example.com',
    title: 'UX/UI Designer',
    avatar: 'https://i.pravatar.cc/150?u=c2',
    skills: ['Figma', 'Prototyping', 'User Research'],
    experience: 3,
    matchScore: 85
  },
  {
    id: 'c3',
    name: 'Kevin Le',
    email: 'kevin.le@example.com',
    title: 'Fullstack Engineer',
    avatar: 'https://i.pravatar.cc/150?u=c3',
    skills: ['Node.js', 'React', 'MongoDB', 'AWS'],
    experience: 4,
    matchScore: 78
  }
];

export const MOCK_JOBS: Job[] = [
  {
    id: 'j1',
    companyId: 'comp1',
    title: 'Frontend Engineer',
    department: 'Engineering',
    location: 'Ho Chi Minh / Remote',
    type: 'Full-time',
    status: 'Published',
    description: 'We are looking for a skilled Frontend Engineer to join our core product team.',
    salaryRange: '$1,500 - $2,500',
    requirements: ['3+ years with React', 'Experience with Next.js', 'Strong CSS skills'],
    postedDate: '2026-04-10'
  },
  {
    id: 'j2',
    companyId: 'comp1',
    title: 'Product Designer',
    department: 'Design',
    location: 'Remote',
    type: 'Full-time',
    status: 'Published',
    description: 'Looking for a creative Product Designer to lead our design system initiatives.',
    salaryRange: '$1,200 - $2,000',
    requirements: ['Proficiency in Figma', 'Portfolio required', 'Experience with SaaS products'],
    postedDate: '2026-04-12'
  }
];

export const MOCK_APPLICATIONS: Match[] = [
  {
    id: 'app1',
    jobId: 'j1',
    candidateId: 'c1',
    status: 'Interview',
    appliedDate: '2026-04-15',
    aiScore: 92
  },
  {
    id: 'app2',
    jobId: 'j1',
    candidateId: 'c3',
    status: 'Screening',
    appliedDate: '2026-04-16',
    aiScore: 78
  },
  {
    id: 'app3',
    jobId: 'j2',
    candidateId: 'c2',
    status: 'New',
    appliedDate: '2026-04-18',
    aiScore: 85
  }
];

export const MOCK_STATS = {
  totalJobs: 12,
  activeCandidates: 145,
  interviewsScheduled: 8,
  timeToHire: '14 days'
};
