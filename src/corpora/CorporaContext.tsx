import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {
  DEMO_COMMUNITY_POSTS,
  DEMO_COMPANIES,
  DEMO_REVIEWS,
  INITIAL_NOTIFICATIONS,
  INITIAL_USER_PROFILE,
} from './demoData';
import {
  AppNotification,
  CommunityCategory,
  CommunityPost,
  Company,
  CompanyRatings,
  CompanySize,
  EmployeeReview,
  Industry,
  TabKey,
  UserProfileState,
  VerificationBadgeType,
} from './types';

const STORAGE_KEY = 'corpora_app_state_v1';

interface PersistedState {
  reviews: EmployeeReview[];
  posts: CommunityPost[];
  notifications: AppNotification[];
  profile: UserProfileState;
  compareIds: string[];
}

export interface ExploreFilters {
  query: string;
  industry: Industry | 'All';
  size: CompanySize | 'All';
  minRating: number;
  minWlb: number;
  sortBy: 'highest' | 'reviewed' | 'recent';
}

const DEFAULT_EXPLORE_FILTERS: ExploreFilters = {
  query: '',
  industry: 'All',
  size: 'All',
  minRating: 0,
  minWlb: 0,
  sortBy: 'highest',
};

interface NewReviewInput {
  companyId: string;
  employmentStatus: 'Current Employee' | 'Former Employee';
  role: string;
  location: string;
  headline: string;
  pros: string;
  cons: string;
  ratings: CompanyRatings;
}

interface VerificationInput {
  status: 'Verified Current Employee' | 'Verified Former Employee';
  companyId: string;
  role: string;
  method: 'Work Email' | 'Private Document';
  evidenceInput: string;
}

interface CorporaContextValue {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  selectedCompanyId: string | null;
  openCompany: (companyId: string) => void;
  closeCompany: () => void;
  isLoadingCompany: boolean;

  exploreFilters: ExploreFilters;
  setExploreFilters: React.Dispatch<React.SetStateAction<ExploreFilters>>;
  navigateToExploreWith: (partial: Partial<ExploreFilters>) => void;
  resetExploreFilters: () => void;

  companies: Company[];
  reviews: EmployeeReview[];
  posts: CommunityPost[];
  notifications: AppNotification[];
  unreadNotificationCount: number;
  profile: UserProfileState;
  compareIds: string[];
  setCompareSlot: (index: number, companyId: string) => void;
  addCompareCompany: (companyId: string) => void;
  removeCompareSlot: (index: number) => void;

  submitReview: (input: NewReviewInput) => void;
  toggleReviewHelpful: (reviewId: string) => void;

  createCommunityPost: (input: {
    category: CommunityCategory;
    companyId?: string;
    title: string;
    body: string;
  }) => void;
  toggleLikePost: (postId: string) => void;
  addCommentToPost: (postId: string, text: string) => void;
  reportPost: (postId: string, reason: string) => void;

  toggleSaveCompany: (companyId: string) => void;
  toggleFollowCompany: (companyId: string) => void;
  submitVerification: (input: VerificationInput) => void;
  clearVerificationToUnverified: () => void;
  updatePrivacySetting: (
    key: keyof UserProfileState['privacySettings'],
    value: boolean,
  ) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  resetDemoData: () => void;

  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const CorporaContext = createContext<CorporaContextValue | null>(null);

function loadPersistedState(): PersistedState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PersistedState>;
      return {
        reviews: parsed.reviews && parsed.reviews.length ? parsed.reviews : DEMO_REVIEWS,
        posts: parsed.posts && parsed.posts.length ? parsed.posts : DEMO_COMMUNITY_POSTS,
        notifications: parsed.notifications ?? INITIAL_NOTIFICATIONS,
        profile: parsed.profile ?? INITIAL_USER_PROFILE,
        compareIds:
          parsed.compareIds && parsed.compareIds.length >= 2
            ? parsed.compareIds
            : ['veltrix-cloud', 'meridian-ledger'],
      };
    }
  } catch {
    // Ignore storage read errors
  }
  return {
    reviews: DEMO_REVIEWS,
    posts: DEMO_COMMUNITY_POSTS,
    notifications: INITIAL_NOTIFICATIONS,
    profile: INITIAL_USER_PROFILE,
    compareIds: ['veltrix-cloud', 'meridian-ledger'],
  };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export const CorporaProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const initial = useMemo(() => loadPersistedState(), []);

  const [activeTab, setActiveTabState] = useState<TabKey>('home');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [isLoadingCompany, setIsLoadingCompany] = useState(false);
  const [exploreFilters, setExploreFilters] = useState<ExploreFilters>(DEFAULT_EXPLORE_FILTERS);

  const [reviews, setReviews] = useState<EmployeeReview[]>(initial.reviews);
  const [posts, setPosts] = useState<CommunityPost[]>(initial.posts);
  const [notifications, setNotifications] = useState<AppNotification[]>(initial.notifications);
  const [profile, setProfile] = useState<UserProfileState>(initial.profile);
  const [compareIds, setCompareIds] = useState<string[]>(initial.compareIds);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const payload: PersistedState = {
        reviews,
        posts,
        notifications,
        profile,
        compareIds,
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage quota errors
    }
  }, [reviews, posts, notifications, profile, compareIds]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => setToastMessage(null), 2800);
    return () => clearTimeout(t);
  }, [toastMessage]);

  const setActiveTab = useCallback((tab: TabKey) => {
    setSelectedCompanyId(null);
    setActiveTabState(tab);
  }, []);

  const openCompany = useCallback((companyId: string) => {
    setIsLoadingCompany(true);
    setSelectedCompanyId(companyId);
    setTimeout(() => {
      setIsLoadingCompany(false);
    }, 220);
  }, []);

  const closeCompany = useCallback(() => {
    setSelectedCompanyId(null);
  }, []);

  const navigateToExploreWith = useCallback((partial: Partial<ExploreFilters>) => {
    setSelectedCompanyId(null);
    setExploreFilters({
      ...DEFAULT_EXPLORE_FILTERS,
      ...partial,
    });
    setActiveTabState('explore');
  }, []);

  const resetExploreFilters = useCallback(() => {
    setExploreFilters(DEFAULT_EXPLORE_FILTERS);
  }, []);

  // Recompute company ratings dynamically when user submits new reviews
  const companies = useMemo<Company[]>(() => {
    return DEMO_COMPANIES.map((baseCompany) => {
      const userSubmitted = reviews.filter(
        (r) => r.companyId === baseCompany.id && r.isUserSubmitted,
      );
      if (userSubmitted.length === 0) {
        return baseCompany;
      }
      // Weight seeded aggregate appropriately alongside newly submitted reviews
      const baseWeight = Math.min(baseCompany.reviewCount, 24);
      const totalWeight = baseWeight + userSubmitted.length;

      const avgDim = (key: keyof CompanyRatings) => {
        const sumNew = userSubmitted.reduce((acc, r) => acc + r.ratings[key], 0);
        return round1((baseCompany.ratings[key] * baseWeight + sumNew) / totalWeight);
      };

      const nextRatings: CompanyRatings = {
        workLifeBalance: avgDim('workLifeBalance'),
        salaryBenefits: avgDim('salaryBenefits'),
        management: avgDim('management'),
        careerGrowth: avgDim('careerGrowth'),
        jobSecurity: avgDim('jobSecurity'),
        workplaceEnvironment: avgDim('workplaceEnvironment'),
      };

      const sumOverallNew = userSubmitted.reduce((acc, r) => acc + r.overallRating, 0);
      const nextOverall = round1(
        (baseCompany.overallRating * baseWeight + sumOverallNew) / totalWeight,
      );

      return {
        ...baseCompany,
        overallRating: nextOverall,
        reviewCount: baseCompany.reviewCount + userSubmitted.length,
        ratings: nextRatings,
      };
    });
  }, [reviews]);

  const submitReview = useCallback(
    (input: NewReviewInput) => {
      const dims = Object.values(input.ratings);
      const overall = round1(dims.reduce((a, b) => a + b, 0) / dims.length);

      const badge: VerificationBadgeType =
        profile.verification.status !== 'Unverified Contributor' &&
        profile.verification.companyId === input.companyId
          ? profile.verification.status
          : profile.verification.status;

      const locationText = profile.privacySettings.suppressLocationOnReviews
        ? 'Location hidden'
        : input.location.trim() || 'United States';

      const newReview: EmployeeReview = {
        id: `rev-user-${Date.now()}`,
        companyId: input.companyId,
        authorAlias: `Anonymous · ${input.role.trim()}`,
        verificationBadge: badge,
        employmentStatus: input.employmentStatus,
        role: input.role.trim(),
        location: locationText,
        date: 'Nov 16, 2026',
        headline: input.headline.trim(),
        shortReview: input.pros.trim(),
        pros: input.pros.trim(),
        cons: input.cons.trim(),
        overallRating: overall,
        ratings: input.ratings,
        helpfulCount: 1,
        isHelpfulByUser: false,
        isUserSubmitted: true,
      };

      setReviews((prev) => [newReview, ...prev]);
      showToast('Review published anonymously');
    },
    [profile.privacySettings.suppressLocationOnReviews, profile.verification, showToast],
  );

  const toggleReviewHelpful = useCallback((reviewId: string) => {
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id !== reviewId) return r;
        const nextFlag = !r.isHelpfulByUser;
        return {
          ...r,
          isHelpfulByUser: nextFlag,
          helpfulCount: nextFlag ? r.helpfulCount + 1 : Math.max(0, r.helpfulCount - 1),
        };
      }),
    );
  }, []);

  const createCommunityPost = useCallback(
    (input: {
      category: CommunityCategory;
      companyId?: string;
      title: string;
      body: string;
    }) => {
      const linkedCompany = companies.find((c) => c.id === input.companyId);
      const badge = profile.privacySettings.hideFormerEmployerInCommunity
        ? profile.verification.status
        : profile.verification.status;

      const newPost: CommunityPost = {
        id: `post-user-${Date.now()}`,
        category: input.category,
        companyId: linkedCompany?.id,
        companyName: linkedCompany?.name,
        authorAlias: `Anonymous · ${
          profile.verification.role && !profile.privacySettings.hideFormerEmployerInCommunity
            ? profile.verification.role
            : 'Community Member'
        }`,
        verificationBadge: badge,
        timestamp: 'Just now',
        title: input.title.trim(),
        body: input.body.trim(),
        likes: 1,
        isLiked: true,
        comments: [],
      };
      setPosts((prev) => [newPost, ...prev]);
      showToast('Anonymous discussion posted');
    },
    [companies, profile.privacySettings.hideFormerEmployerInCommunity, profile.verification, showToast],
  );

  const toggleLikePost = useCallback((postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const nextLiked = !p.isLiked;
        return {
          ...p,
          isLiked: nextLiked,
          likes: nextLiked ? p.likes + 1 : Math.max(0, p.likes - 1),
        };
      }),
    );
  }, []);

  const addCommentToPost = useCallback(
    (postId: string, text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          return {
            ...p,
            comments: [
              ...p.comments,
              {
                id: `comment-${Date.now()}`,
                authorAlias: 'Anonymous · Member',
                verificationBadge: profile.verification.status,
                timestamp: 'Just now',
                text: trimmed,
              },
            ],
          };
        }),
      );
      showToast('Comment added');
    },
    [profile.verification.status, showToast],
  );

  const reportPost = useCallback(
    (postId: string, reason: string) => {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? {...p, reported: true, reportReason: reason} : p,
        ),
      );
      showToast('Report submitted for moderation');
    },
    [showToast],
  );

  const toggleSaveCompany = useCallback(
    (companyId: string) => {
      setProfile((prev) => {
        const exists = prev.savedCompanyIds.includes(companyId);
        const next = exists
          ? prev.savedCompanyIds.filter((id) => id !== companyId)
          : [companyId, ...prev.savedCompanyIds];
        showToast(exists ? 'Removed from saved companies' : 'Saved company');
        return {...prev, savedCompanyIds: next};
      });
    },
    [showToast],
  );

  const toggleFollowCompany = useCallback(
    (companyId: string) => {
      setProfile((prev) => {
        const exists = prev.followedCompanyIds.includes(companyId);
        const next = exists
          ? prev.followedCompanyIds.filter((id) => id !== companyId)
          : [companyId, ...prev.followedCompanyIds];
        showToast(exists ? 'Unfollowed company' : 'Following company updates');
        return {...prev, followedCompanyIds: next};
      });
    },
    [showToast],
  );

  const submitVerification = useCallback(
    (input: VerificationInput) => {
      const comp = companies.find((c) => c.id === input.companyId);
      const masked =
        input.method === 'Work Email'
          ? `${input.evidenceInput.slice(0, 2)}***@${
              input.evidenceInput.split('@')[1] || 'company.com'
            } (Encrypted)`
          : `${input.evidenceInput || 'employment_proof.pdf'} (Encrypted Vault)`;

      setProfile((prev) => ({
        ...prev,
        verification: {
          status: input.status,
          companyId: input.companyId,
          companyName: comp?.name ?? 'Verified Employer',
          role: input.role.trim() || 'Employee',
          method: input.method,
          privateReferenceLabel: masked,
          verifiedAt: 'Nov 16, 2026',
        },
      }));
      showToast(`Verified as ${input.status}`);
    },
    [companies, showToast],
  );

  const clearVerificationToUnverified = useCallback(() => {
    setProfile((prev) => ({
      ...prev,
      verification: {
        status: 'Unverified Contributor',
      },
    }));
    showToast('Verification cleared · Now Unverified Contributor');
  }, [showToast]);

  const updatePrivacySetting = useCallback(
    (key: keyof UserProfileState['privacySettings'], value: boolean) => {
      setProfile((prev) => ({
        ...prev,
        privacySettings: {
          ...prev.privacySettings,
          [key]: value,
        },
      }));
    },
    [],
  );

  const setCompareSlot = useCallback((index: number, companyId: string) => {
    setCompareIds((prev) => {
      const next = [...prev];
      next[index] = companyId;
      return next;
    });
  }, []);

  const addCompareCompany = useCallback(
    (companyId: string) => {
      setCompareIds((prev) => {
        if (prev.includes(companyId)) return prev;
        if (prev.length < 3) return [...prev, companyId];
        return [prev[0], prev[1], companyId];
      });
      setSelectedCompanyId(null);
      setActiveTabState('compare');
      showToast('Added to comparison');
    },
    [showToast],
  );

  const removeCompareSlot = useCallback((index: number) => {
    setCompareIds((prev) => {
      if (prev.length <= 2) return prev;
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? {...n, unread: false} : n)));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({...n, unread: false})));
  }, []);

  const resetDemoData = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setReviews(DEMO_REVIEWS);
    setPosts(DEMO_COMMUNITY_POSTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setProfile(INITIAL_USER_PROFILE);
    setCompareIds(['veltrix-cloud', 'meridian-ledger']);
    setExploreFilters(DEFAULT_EXPLORE_FILTERS);
    showToast('Demo data restored');
  }, [showToast]);

  const unreadNotificationCount = useMemo(
    () => notifications.filter((n) => n.unread).length,
    [notifications],
  );

  const value: CorporaContextValue = {
    activeTab,
    setActiveTab,
    selectedCompanyId,
    openCompany,
    closeCompany,
    isLoadingCompany,
    exploreFilters,
    setExploreFilters,
    navigateToExploreWith,
    resetExploreFilters,
    companies,
    reviews,
    posts,
    notifications,
    unreadNotificationCount,
    profile,
    compareIds,
    setCompareSlot,
    addCompareCompany,
    removeCompareSlot,
    submitReview,
    toggleReviewHelpful,
    createCommunityPost,
    toggleLikePost,
    addCommentToPost,
    reportPost,
    toggleSaveCompany,
    toggleFollowCompany,
    submitVerification,
    clearVerificationToUnverified,
    updatePrivacySetting,
    markNotificationRead,
    markAllNotificationsRead,
    resetDemoData,
    toastMessage,
    showToast,
  };

  return <CorporaContext.Provider value={value}>{children}</CorporaContext.Provider>;
};

export function useCorpora(): CorporaContextValue {
  const ctx = useContext(CorporaContext);
  if (!ctx) throw new Error('useCorpora must be used inside CorporaProvider');
  return ctx;
}
