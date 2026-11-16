import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DEMO_COMMUNITY_POSTS,
  DEMO_COMPANIES,
  DEMO_REVIEWS,
  INITIAL_USER_PROFILE,
} from '../data/demoData';

const STORAGE_KEY = 'corpora_expo_state_v1';
const CorporaContext = createContext(null);

function round1(n) {
  return Math.round(n * 10) / 10;
}

export function CorporaProvider({ children }) {
  const [reviews, setReviews] = useState(DEMO_REVIEWS);
  const [posts, setPosts] = useState(DEMO_COMMUNITY_POSTS);
  const [profile, setProfile] = useState(INITIAL_USER_PROFILE);
  const [compareIds, setCompareIds] = useState(['veltrix-cloud', 'meridian-ledger']);
  const [exploreFilters, setExploreFilters] = useState({
    query: '',
    industry: 'All',
    size: 'All',
    minRating: 0,
    minWlb: 0,
    sortBy: 'highest',
  });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.reviews) setReviews(parsed.reviews);
          if (parsed.posts) setPosts(parsed.posts);
          if (parsed.profile) setProfile(parsed.profile);
          if (parsed.compareIds) setCompareIds(parsed.compareIds);
        }
      })
      .catch(() => {})
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ reviews, posts, profile, compareIds })
    ).catch(() => {});
  }, [reviews, posts, profile, compareIds, hydrated]);

  const companies = useMemo(() => {
    return DEMO_COMPANIES.map((base) => {
      const added = reviews.filter((r) => r.companyId === base.id && r.isUserSubmitted);
      if (added.length === 0) return base;
      const baseWeight = Math.min(base.reviewCount, 24);
      const total = baseWeight + added.length;
      const avg = (key) =>
        round1((base.ratings[key] * baseWeight + added.reduce((s, r) => s + r.ratings[key], 0)) / total);
      return {
        ...base,
        overallRating: round1((base.overallRating * baseWeight + added.reduce((s, r) => s + r.overallRating, 0)) / total),
        reviewCount: base.reviewCount + added.length,
        ratings: {
          workLifeBalance: avg('workLifeBalance'),
          salaryBenefits: avg('salaryBenefits'),
          management: avg('management'),
          careerGrowth: avg('careerGrowth'),
          jobSecurity: avg('jobSecurity'),
          workplaceEnvironment: avg('workplaceEnvironment'),
        },
      };
    });
  }, [reviews]);

  const submitReview = useCallback(
    (input) => {
      const vals = Object.values(input.ratings);
      const overall = round1(vals.reduce((a, b) => a + b, 0) / vals.length);
      const nextReview = {
        id: `rev-user-${Date.now()}`,
        companyId: input.companyId,
        authorAlias: `Anonymous · ${input.role}`,
        verificationBadge: profile.verification.status,
        employmentStatus: input.employmentStatus,
        role: input.role,
        location: profile.privacySettings.suppressLocationOnReviews ? 'Hidden' : input.location || 'US',
        date: 'Nov 16, 2026',
        headline: input.headline,
        shortReview: input.pros,
        pros: input.pros,
        cons: input.cons,
        overallRating: overall,
        ratings: input.ratings,
        helpfulCount: 1,
        isUserSubmitted: true,
      };
      setReviews((prev) => [nextReview, ...prev]);
    },
    [profile]
  );

  const toggleReviewHelpful = useCallback((reviewId) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? {
              ...r,
              isHelpfulByUser: !r.isHelpfulByUser,
              helpfulCount: r.isHelpfulByUser ? Math.max(0, r.helpfulCount - 1) : r.helpfulCount + 1,
            }
          : r
      )
    );
  }, []);

  const toggleSaveCompany = useCallback((companyId) => {
    setProfile((prev) => ({
      ...prev,
      savedCompanyIds: prev.savedCompanyIds.includes(companyId)
        ? prev.savedCompanyIds.filter((id) => id !== companyId)
        : [companyId, ...prev.savedCompanyIds],
    }));
  }, []);

  const toggleFollowCompany = useCallback((companyId) => {
    setProfile((prev) => ({
      ...prev,
      followedCompanyIds: prev.followedCompanyIds.includes(companyId)
        ? prev.followedCompanyIds.filter((id) => id !== companyId)
        : [companyId, ...prev.followedCompanyIds],
    }));
  }, []);

  const toggleLikePost = useCallback((postId) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? Math.max(0, p.likes - 1) : p.likes + 1 }
          : p
      )
    );
  }, []);

  const addCommentToPost = useCallback(
    (postId, text) => {
      if (!text.trim()) return;
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                comments: [
                  ...p.comments,
                  {
                    id: `c-${Date.now()}`,
                    authorAlias: 'Anonymous · Member',
                    verificationBadge: profile.verification.status,
                    timestamp: 'Just now',
                    text: text.trim(),
                  },
                ],
              }
            : p
        )
      );
    },
    [profile.verification.status]
  );

  const createCommunityPost = useCallback(
    ({ category, companyId, title, body }) => {
      const comp = companies.find((c) => c.id === companyId);
      setPosts((prev) => [
        {
          id: `post-${Date.now()}`,
          category,
          companyId: comp?.id,
          companyName: comp?.name,
          authorAlias: 'Anonymous · Member',
          verificationBadge: profile.verification.status,
          timestamp: 'Just now',
          title,
          body,
          likes: 1,
          isLiked: true,
          comments: [],
        },
        ...prev,
      ]);
    },
    [companies, profile.verification.status]
  );

  const reportPost = useCallback((postId, reason) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, reported: true, reportReason: reason } : p))
    );
  }, []);

  const submitVerification = useCallback(
    (input) => {
      const comp = companies.find((c) => c.id === input.companyId);
      setProfile((prev) => ({
        ...prev,
        verification: {
          status: input.status,
          companyId: input.companyId,
          companyName: comp?.name || 'Verified Employer',
          role: input.role,
          method: input.method,
          privateReferenceLabel: `${input.evidenceInput} (Encrypted Vault)`,
        },
      }));
    },
    [companies]
  );

  const updatePrivacySetting = useCallback((key, val) => {
    setProfile((prev) => ({
      ...prev,
      privacySettings: { ...prev.privacySettings, [key]: val },
    }));
  }, []);

  const resetDemoData = useCallback(() => {
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
    setReviews(DEMO_REVIEWS);
    setPosts(DEMO_COMMUNITY_POSTS);
    setProfile(INITIAL_USER_PROFILE);
    setCompareIds(['veltrix-cloud', 'meridian-ledger']);
  }, []);

  return (
    <CorporaContext.Provider
      value={{
        companies,
        reviews,
        posts,
        profile,
        compareIds,
        setCompareIds,
        exploreFilters,
        setExploreFilters,
        submitReview,
        toggleReviewHelpful,
        toggleSaveCompany,
        toggleFollowCompany,
        toggleLikePost,
        addCommentToPost,
        createCommunityPost,
        reportPost,
        submitVerification,
        updatePrivacySetting,
        resetDemoData,
      }}
    >
      {children}
    </CorporaContext.Provider>
  );
}

export function useCorpora() {
  const ctx = useContext(CorporaContext);
  if (!ctx) throw new Error('useCorpora must be used inside CorporaProvider');
  return ctx;
}
