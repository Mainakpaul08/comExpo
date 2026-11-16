import React, {useMemo, useState} from 'react';
import {
  Flag,
  Heart,
  MessageCircle,
  Plus,
  Send,
  ShieldAlert,
  X,
} from 'lucide-react';
import {Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View} from '../../rn';
import {useCorpora} from '../CorporaContext';
import {Colors, Typography} from '../theme';
import {CommunityCategory} from '../types';
import {VerificationBadge} from '../components/CommonUI';

const CATEGORIES: Array<'All' | CommunityCategory> = [
  'All',
  'Workplace Experiences',
  'Recruitment Warnings',
  'Interview Experiences',
  'Salary Discussions',
  'Company Questions',
];

const REPORT_REASONS = [
  'Identifies private individual or confidential PII',
  'Fabricated or unverified spam promotion',
  'Harassment or abusive language',
  'Violates workplace NDA guidelines',
];

export const CommunityScreen: React.FC = () => {
  const {
    posts,
    companies,
    toggleLikePost,
    addCommentToPost,
    createCommunityPost,
    reportPost,
    openCompany,
  } = useCorpora();

  const [selectedCategory, setSelectedCategory] = useState<'All' | CommunityCategory>('All');
  const [expandedPostIds, setExpandedPostIds] = useState<string[]>(['post-1']);
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});

  const [composeOpen, setComposeOpen] = useState(false);
  const [newCategory, setNewCategory] = useState<CommunityCategory>('Workplace Experiences');
  const [newCompanyId, setNewCompanyId] = useState<string>('');
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [composeError, setComposeError] = useState('');

  const [reportingPostId, setReportingPostId] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState<string>(REPORT_REASONS[0]);

  const visiblePosts = useMemo(() => {
    if (selectedCategory === 'All') return posts;
    return posts.filter((p) => p.category === selectedCategory);
  }, [posts, selectedCategory]);

  const toggleExpandComments = (postId: string) => {
    setExpandedPostIds((prev) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId],
    );
  };

  const handleSubmitPost = () => {
    if (newTitle.trim().length < 6 || newBody.trim().length < 15) {
      setComposeError('Please enter a clear headline and at least 15 characters of context.');
      return;
    }
    createCommunityPost({
      category: newCategory,
      companyId: newCompanyId || undefined,
      title: newTitle,
      body: newBody,
    });
    setNewTitle('');
    setNewBody('');
    setNewCompanyId('');
    setComposeError('');
    setComposeOpen(false);
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={{flex: 1, gap: 3}}>
          <Text style={styles.screenTitle}>Employee Community</Text>
          <Text style={styles.screenSubtitle}>
            Anonymous peer discussions, interview notes & recruitment warnings
          </Text>
        </View>
        <Pressable onPress={() => setComposeOpen(true)} style={styles.composeBtn}>
          <Plus size={16} color="#FFFFFF" />
          <Text style={styles.composeBtnText}>New post</Text>
        </Pressable>
      </View>

      {/* Category Filter Strip */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryRow}
      >
        {CATEGORIES.map((cat) => {
          const active = selectedCategory === cat;
          return (
            <Pressable
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={[styles.categoryTab, active && styles.categoryTabActive]}
            >
              <Text style={[styles.categoryTabText, active && styles.categoryTabTextActive]}>
                {cat}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Discussion Feed */}
      {visiblePosts.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No discussions in this topic yet</Text>
          <Text style={styles.emptyBody}>
            Start an anonymous thread to ask peers about compensation, interviews, or culture.
          </Text>
          <Pressable onPress={() => setComposeOpen(true)} style={styles.composeBtn}>
            <Plus size={15} color="#FFFFFF" />
            <Text style={styles.composeBtnText}>Start discussion</Text>
          </Pressable>
        </View>
      ) : (
        <View style={{gap: 12}}>
          {visiblePosts.map((post) => {
            if (post.reported) {
              return (
                <View key={post.id} style={styles.reportedNoticeCard}>
                  <ShieldAlert size={16} color={Colors.warning} />
                  <View style={{flex: 1}}>
                    <Text style={styles.reportedTitle}>Discussion hidden for moderation</Text>
                    <Text style={styles.reportedSub}>
                      Reason: {post.reportReason ?? 'Community guidelines review'}
                    </Text>
                  </View>
                </View>
              );
            }

            const isExpanded = expandedPostIds.includes(post.id);
            const draft = commentDrafts[post.id] ?? '';
            const isWarning = post.category === 'Recruitment Warnings';

            return (
              <View key={post.id} style={styles.postCard}>
                <View style={styles.postTopMeta}>
                  <View style={{flex: 1, gap: 4}}>
                    <View style={styles.postMetaLine}>
                      <Text
                        style={[
                          styles.postCategoryText,
                          isWarning && {color: Colors.negativeText},
                        ]}
                      >
                        {post.category}
                      </Text>
                      <Text style={styles.dotSep}>·</Text>
                      <Text style={styles.postTime}>{post.timestamp}</Text>
                      {post.companyId && post.companyName && (
                        <>
                          <Text style={styles.dotSep}>·</Text>
                          <Pressable onPress={() => openCompany(post.companyId!)}>
                            <Text style={styles.postCompanyLink}>{post.companyName}</Text>
                          </Pressable>
                        </>
                      )}
                    </View>
                    <View style={styles.postAuthorRow}>
                      <VerificationBadge status={post.verificationBadge} compact />
                      <Text style={styles.postAuthorAlias}>{post.authorAlias}</Text>
                    </View>
                  </View>
                </View>

                <Text style={styles.postTitle}>{post.title}</Text>
                <Text style={styles.postBody}>{post.body}</Text>

                {/* Action Bar */}
                <View style={styles.postActions}>
                  <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
                    <Pressable
                      onPress={() => toggleLikePost(post.id)}
                      style={[styles.actionBtn, post.isLiked && styles.actionBtnActive]}
                    >
                      <Heart
                        size={15}
                        color={post.isLiked ? Colors.accent : Colors.textMuted}
                        fill={post.isLiked ? Colors.accent : 'transparent'}
                      />
                      <Text
                        style={[
                          styles.actionText,
                          post.isLiked && {color: Colors.accent},
                        ]}
                      >
                        {post.likes}
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={() => toggleExpandComments(post.id)}
                      style={[styles.actionBtn, isExpanded && styles.actionBtnActive]}
                    >
                      <MessageCircle
                        size={15}
                        color={isExpanded ? Colors.accent : Colors.textMuted}
                      />
                      <Text
                        style={[
                          styles.actionText,
                          isExpanded && {color: Colors.accent},
                        ]}
                      >
                        {post.comments.length}{' '}
                        {post.comments.length === 1 ? 'reply' : 'replies'}
                      </Text>
                    </Pressable>
                  </View>

                  <Pressable
                    onPress={() => setReportingPostId(post.id)}
                    accessibilityLabel="Report inappropriate post"
                    style={styles.reportBtn}
                  >
                    <Flag size={14} color={Colors.textMuted} />
                    <Text style={styles.reportText}>Report</Text>
                  </Pressable>
                </View>

                {/* Comments Drawer */}
                {isExpanded && (
                  <View style={styles.commentsSection}>
                    {post.comments.length === 0 ? (
                      <Text style={styles.noCommentsText}>
                        No replies yet. Add an anonymous perspective below.
                      </Text>
                    ) : (
                      <View style={{gap: 10}}>
                        {post.comments.map((c) => (
                          <View key={c.id} style={styles.commentItem}>
                            <View style={styles.commentHeader}>
                              <VerificationBadge status={c.verificationBadge} compact />
                              <Text style={styles.commentMeta}>
                                {c.authorAlias} · {c.timestamp}
                              </Text>
                            </View>
                            <Text style={styles.commentText}>{c.text}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    <View style={styles.commentComposer}>
                      <TextInput
                        value={draft}
                        onChangeText={(txt) =>
                          setCommentDrafts((prev) => ({...prev, [post.id]: txt}))
                        }
                        placeholder="Add an anonymous reply..."
                        placeholderTextColor={Colors.textSubtle}
                        style={styles.commentInput}
                      />
                      <Pressable
                        onPress={() => {
                          if (!draft.trim()) return;
                          addCommentToPost(post.id, draft);
                          setCommentDrafts((prev) => ({...prev, [post.id]: ''}));
                        }}
                        accessibilityLabel="Send comment"
                        style={styles.sendCommentBtn}
                      >
                        <Send size={15} color="#FFFFFF" />
                      </Pressable>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}

      {/* Compose Anonymous Discussion Modal */}
      <Modal visible={composeOpen} onRequestClose={() => setComposeOpen(false)}>
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Start Anonymous Discussion</Text>
            <Pressable
              onPress={() => setComposeOpen(false)}
              accessibilityLabel="Close composer"
              style={styles.closeBtn}
            >
              <X size={18} color={Colors.textPrimary} />
            </Pressable>
          </View>

          <ScrollView style={{maxHeight: 480}} contentContainerStyle={{gap: 14}}>
            <View style={{gap: 6}}>
              <Text style={styles.fieldLabel}>Topic category</Text>
              <View style={styles.chipWrap}>
                {CATEGORIES.filter((c): c is CommunityCategory => c !== 'All').map((cat) => {
                  const active = newCategory === cat;
                  return (
                    <Pressable
                      key={cat}
                      onPress={() => setNewCategory(cat)}
                      style={[styles.choiceChip, active && styles.choiceChipActive]}
                    >
                      <Text style={[styles.choiceText, active && styles.choiceTextActive]}>
                        {cat}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={{gap: 6}}>
              <Text style={styles.fieldLabel}>Related company (optional)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap: 6}}>
                <Pressable
                  onPress={() => setNewCompanyId('')}
                  style={[styles.choiceChip, newCompanyId === '' && styles.choiceChipActive]}
                >
                  <Text style={[styles.choiceText, newCompanyId === '' && styles.choiceTextActive]}>
                    General
                  </Text>
                </Pressable>
                {companies.map((c) => {
                  const active = newCompanyId === c.id;
                  return (
                    <Pressable
                      key={c.id}
                      onPress={() => setNewCompanyId(c.id)}
                      style={[styles.choiceChip, active && styles.choiceChipActive]}
                    >
                      <Text style={[styles.choiceText, active && styles.choiceTextActive]}>
                        {c.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            <View style={{gap: 6}}>
              <Text style={styles.fieldLabel}>Headline</Text>
              <TextInput
                value={newTitle}
                onChangeText={setNewTitle}
                placeholder="e.g. Clarifying equity refresh cadence at Series D startups"
                placeholderTextColor={Colors.textSubtle}
                style={styles.textField}
              />
            </View>

            <View style={{gap: 6}}>
              <Text style={styles.fieldLabel}>Details</Text>
              <TextInput
                value={newBody}
                onChangeText={setNewBody}
                multiline
                numberOfLines={4}
                placeholder="Share candid, constructive workplace context without naming private individuals..."
                placeholderTextColor={Colors.textSubtle}
                style={styles.textArea}
              />
            </View>

            {composeError !== '' && (
              <Text style={styles.errorText}>{composeError}</Text>
            )}

            <Pressable onPress={handleSubmitPost} style={styles.submitSheetBtn}>
              <Text style={styles.submitSheetText}>Publish anonymously</Text>
            </Pressable>
          </ScrollView>
        </View>
      </Modal>

      {/* Report Post Modal */}
      <Modal
        visible={reportingPostId !== null}
        onRequestClose={() => setReportingPostId(null)}
      >
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Report Discussion</Text>
            <Pressable
              onPress={() => setReportingPostId(null)}
              accessibilityLabel="Close report modal"
              style={styles.closeBtn}
            >
              <X size={18} color={Colors.textPrimary} />
            </Pressable>
          </View>

          <Text style={styles.reportPrompt}>
            Select why this post should be reviewed by moderation:
          </Text>

          <View style={{gap: 8}}>
            {REPORT_REASONS.map((reason) => {
              const active = selectedReason === reason;
              return (
                <Pressable
                  key={reason}
                  onPress={() => setSelectedReason(reason)}
                  style={[styles.reasonRow, active && styles.reasonRowActive]}
                >
                  <Text style={[styles.reasonText, active && {color: Colors.accent, fontWeight: 600}]}>
                    {reason}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            onPress={() => {
              if (reportingPostId) {
                reportPost(reportingPostId, selectedReason);
              }
              setReportingPostId(null);
            }}
            style={styles.reportSubmitBtn}
          >
            <Text style={styles.submitSheetText}>Submit moderation report</Text>
          </Pressable>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    padding: 16,
    paddingBottom: 36,
    gap: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  screenTitle: {
    fontFamily: Typography.displayFont,
    fontSize: 22,
    fontWeight: 700,
    color: Colors.textPrimary,
    letterSpacing: -0.4,
  },
  screenSubtitle: {
    fontSize: 12.5,
    color: Colors.textMuted,
  },
  composeBtn: {
    minHeight: 42,
    paddingHorizontal: 14,
    borderRadius: 11,
    backgroundColor: Colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  composeBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  categoryRow: {
    gap: 8,
    paddingVertical: 2,
  },
  categoryTab: {
    minHeight: 38,
    paddingHorizontal: 13,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.border,
    justifyContent: 'center',
  },
  categoryTabActive: {
    backgroundColor: Colors.navy,
    borderColor: Colors.navy,
  },
  categoryTabText: {
    fontSize: 12.5,
    fontWeight: 600,
    color: Colors.textSecondary,
    whiteSpace: 'nowrap',
  },
  categoryTabTextActive: {
    color: '#FFFFFF',
  },
  postCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.border,
    padding: 15,
    gap: 10,
  },
  postTopMeta: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  postMetaLine: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  postCategoryText: {
    fontSize: 12,
    fontWeight: 700,
    color: Colors.accent,
  },
  dotSep: {
    fontSize: 12,
    color: Colors.textSubtle,
  },
  postTime: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  postCompanyLink: {
    fontSize: 12,
    fontWeight: 600,
    color: Colors.textPrimary,
    textDecoration: 'underline',
  },
  postAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  postAuthorAlias: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  postTitle: {
    fontFamily: Typography.displayFont,
    fontSize: 16,
    fontWeight: 700,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  postBody: {
    fontSize: 13.5,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: Colors.surfaceSubtle,
  },
  actionBtn: {
    minHeight: 38,
    paddingHorizontal: 11,
    borderRadius: 9,
    backgroundColor: Colors.surfaceSubtle,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtnActive: {
    backgroundColor: Colors.accentSoft,
  },
  actionText: {
    fontFamily: Typography.monoFont,
    fontSize: 12,
    fontWeight: 600,
    color: Colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  reportBtn: {
    minHeight: 38,
    paddingHorizontal: 10,
    borderRadius: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  reportText: {
    fontSize: 12,
    fontWeight: 500,
    color: Colors.textMuted,
  },
  commentsSection: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.border,
  },
  noCommentsText: {
    fontSize: 12.5,
    color: Colors.textMuted,
  },
  commentItem: {
    gap: 4,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: Colors.border,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  commentMeta: {
    fontSize: 11.5,
    color: Colors.textMuted,
  },
  commentText: {
    fontSize: 13,
    lineHeight: 18.5,
    color: Colors.textPrimary,
  },
  commentComposer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  commentInput: {
    flex: 1,
    minHeight: 40,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.border,
    paddingHorizontal: 12,
    fontSize: 13,
  },
  sendCommentBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportedNoticeCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.border,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reportedTitle: {
    fontSize: 13.5,
    fontWeight: 600,
    color: Colors.textPrimary,
  },
  reportedSub: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  emptyCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.border,
    padding: 24,
    alignItems: 'center',
    gap: 10,
  },
  emptyTitle: {
    fontFamily: Typography.displayFont,
    fontSize: 16,
    fontWeight: 700,
    color: Colors.textPrimary,
  },
  emptyBody: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  sheet: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderRadius: 20,
    padding: 20,
    gap: 14,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sheetTitle: {
    fontFamily: Typography.displayFont,
    fontSize: 17,
    fontWeight: 700,
    color: Colors.textPrimary,
  },
  closeBtn: {
    minWidth: 40,
    minHeight: 40,
    borderRadius: 10,
    backgroundColor: Colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldLabel: {
    fontSize: 12.5,
    fontWeight: 600,
    color: Colors.textSecondary,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  choiceChip: {
    minHeight: 34,
    paddingHorizontal: 11,
    borderRadius: 9,
    backgroundColor: Colors.surfaceSubtle,
    justifyContent: 'center',
  },
  choiceChipActive: {
    backgroundColor: Colors.accentSoft,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.accentBorder,
  },
  choiceText: {
    fontSize: 12,
    fontWeight: 500,
    color: Colors.textSecondary,
    whiteSpace: 'nowrap',
  },
  choiceTextActive: {
    color: Colors.accent,
    fontWeight: 600,
  },
  textField: {
    minHeight: 42,
    backgroundColor: Colors.background,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.border,
    paddingHorizontal: 12,
    fontSize: 13.5,
  },
  textArea: {
    backgroundColor: Colors.background,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.border,
    padding: 12,
    fontSize: 13.5,
    minHeight: 96,
  },
  errorText: {
    fontSize: 12.5,
    color: Colors.negativeText,
    fontWeight: 500,
  },
  submitSheetBtn: {
    minHeight: 46,
    backgroundColor: Colors.accent,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitSheetText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 600,
  },
  reportPrompt: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  reasonRow: {
    padding: 12,
    borderRadius: 11,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  reasonRowActive: {
    borderColor: Colors.accentBorder,
    backgroundColor: Colors.accentSoft,
  },
  reasonText: {
    fontSize: 13,
    color: Colors.textPrimary,
  },
  reportSubmitBtn: {
    minHeight: 46,
    backgroundColor: Colors.negative,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
