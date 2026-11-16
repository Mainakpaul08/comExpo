export type Industry =
  | 'Technology'
  | 'Finance'
  | 'Healthcare'
  | 'Education'
  | 'E-commerce'
  | 'Consulting';

export type CompanySize = '1-200' | '201-1,000' | '1,001-5,000' | '5,000+';

export type VerificationBadgeType =
  | 'Verified Current Employee'
  | 'Verified Former Employee'
  | 'Unverified Contributor';

export interface CompanyRatings {
  workLifeBalance: number;
  salaryBenefits: number;
  management: number;
  careerGrowth: number;
  jobSecurity: number;
  workplaceEnvironment: number;
}

export interface SalaryBand {
  role: string;
  level: string;
  baseRange: string;
  totalComp: string;
  reportsCount: number;
}

export interface EmployeeReportItem {
  id: string;
  title: string;
  category: 'Culture Shift' | 'Compensation' | 'Restructuring' | 'Workload';
  severity: 'Positive' | 'Advisory' | 'Warning';
  date: string;
  summary: string;
  verifiedCount: number;
}

export interface CompanyNewsItem {
  id: string;
  title: string;
  source: string;
  date: string;
  summary: string;
}

export interface Company {
  id: string;
  name: string;
  monogram: string;
  brandColor: string;
  brandAccent: string;
  industry: Industry;
  headquarters: string;
  size: CompanySize;
  foundedYear: number;
  website: string;
  tagline: string;
  isDemo: boolean;
  trendingRank?: number;
  recentlyAddedScore?: number;
  overallRating: number;
  reviewCount: number;
  cultureScore: number;
  recommendPercent: number;
  ceoApproval: number;
  employeeSatisfaction: number;
  ratings: CompanyRatings;
  cultureHighlights: {
    workModel: string;
    pillars: string[];
    summary: string;
  };
  salaryInsights: SalaryBand[];
  managementFeedback: {
    transparencyScore: number;
    strengths: string[];
    concerns: string[];
    summary: string;
  };
  background: {
    overview: string;
    stage: string;
    ceo: string;
    milestones: {year: string; event: string}[];
  };
  employeeReports: EmployeeReportItem[];
  news: CompanyNewsItem[];
}

export interface EmployeeReview {
  id: string;
  companyId: string;
  authorAlias: string;
  verificationBadge: VerificationBadgeType;
  employmentStatus: 'Current Employee' | 'Former Employee';
  role: string;
  location: string;
  date: string;
  headline: string;
  shortReview: string;
  pros: string;
  cons: string;
  overallRating: number;
  ratings: CompanyRatings;
  helpfulCount: number;
  isHelpfulByUser?: boolean;
  isUserSubmitted?: boolean;
}

export type CommunityCategory =
  | 'Workplace Experiences'
  | 'Recruitment Warnings'
  | 'Interview Experiences'
  | 'Salary Discussions'
  | 'Company Questions';

export interface CommunityComment {
  id: string;
  authorAlias: string;
  verificationBadge: VerificationBadgeType;
  timestamp: string;
  text: string;
}

export interface CommunityPost {
  id: string;
  category: CommunityCategory;
  companyId?: string;
  companyName?: string;
  authorAlias: string;
  verificationBadge: VerificationBadgeType;
  timestamp: string;
  title: string;
  body: string;
  likes: number;
  isLiked?: boolean;
  comments: CommunityComment[];
  reported?: boolean;
  reportReason?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  time: string;
  unread: boolean;
  companyId?: string;
}

export interface VerificationRecord {
  status: VerificationBadgeType;
  companyId?: string;
  companyName?: string;
  role?: string;
  method?: 'Work Email' | 'Private Document';
  privateReferenceLabel?: string;
  verifiedAt?: string;
}

export interface UserProfileState {
  name: string;
  handle: string;
  avatarUri: string;
  verification: VerificationRecord;
  savedCompanyIds: string[];
  followedCompanyIds: string[];
  privacySettings: {
    defaultAnonymousReviews: boolean;
    hideFormerEmployerInCommunity: boolean;
    suppressLocationOnReviews: boolean;
    notifyReviewReplies: boolean;
    notifySavedCompanyAlerts: boolean;
  };
}

export type TabKey = 'home' | 'explore' | 'compare' | 'community' | 'profile';
