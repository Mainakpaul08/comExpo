import React, { useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Flag, Heart, MessageCircle, Send } from 'lucide-react-native';
import { VerificationBadge } from '../../src/components/CommonUI';
import { useCorpora } from '../../src/context/CorporaContext';
import { Colors } from '../../src/theme/tokens';

export default function CommunityScreen() {
  const { posts, toggleLikePost, addCommentToPost, reportPost } = useCorpora();
  const [drafts, setDrafts] = useState({});

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Employee Community</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        {posts.map((post) => {
          if (post.reported) {
            return (
              <View key={post.id} style={styles.reportedBox}>
                <Text style={styles.reportedText}>Post hidden for moderation review.</Text>
              </View>
            );
          }

          return (
            <View key={post.id} style={styles.postCard}>
              <Text style={styles.category}>
                {post.category} · {post.timestamp}
              </Text>
              <VerificationBadge status={post.verificationBadge} />
              <Text style={styles.postTitle}>{post.title}</Text>
              <Text style={styles.postBody}>{post.body}</Text>

              <View style={styles.actionsRow}>
                <Pressable onPress={() => toggleLikePost(post.id)} style={styles.actionBtn}>
                  <Heart size={15} color={post.isLiked ? Colors.accent : Colors.textMuted} />
                  <Text style={styles.actionText}>{post.likes}</Text>
                </Pressable>
                <View style={styles.actionBtn}>
                  <MessageCircle size={15} color={Colors.textMuted} />
                  <Text style={styles.actionText}>{post.comments.length} replies</Text>
                </View>
                <Pressable
                  onPress={() => reportPost(post.id, 'Flagged by user')}
                  style={styles.actionBtn}
                >
                  <Flag size={14} color={Colors.textMuted} />
                  <Text style={styles.actionText}>Report</Text>
                </Pressable>
              </View>

              <View style={styles.commentBox}>
                <TextInput
                  value={drafts[post.id] || ''}
                  onChangeText={(txt) => setDrafts((p) => ({ ...p, [post.id]: txt }))}
                  placeholder="Add anonymous reply..."
                  placeholderTextColor={Colors.textSubtle}
                  style={styles.commentInput}
                />
                <Pressable
                  onPress={() => {
                    addCommentToPost(post.id, drafts[post.id] || '');
                    setDrafts((p) => ({ ...p, [post.id]: '' }));
                  }}
                  style={styles.sendBtn}
                >
                  <Send size={14} color="#FFFFFF" />
                </Pressable>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    height: 54,
    paddingHorizontal: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    justifyContent: 'center',
  },
  title: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  scroll: { flex: 1 },
  container: { padding: 16, gap: 12, paddingBottom: 32 },
  postCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    gap: 8,
  },
  category: { fontSize: 12, fontWeight: '700', color: Colors.accent },
  postTitle: { fontSize: 15.5, fontWeight: '700', color: Colors.textPrimary },
  postBody: { fontSize: 13.5, lineHeight: 19, color: Colors.textSecondary },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8, borderTopWidth: 1, borderTopColor: Colors.surfaceSubtle },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, padding: 6 },
  actionText: { fontSize: 12.5, fontWeight: '600', color: Colors.textSecondary },
  commentBox: { flexDirection: 'row', gap: 8, marginTop: 4 },
  commentInput: {
    flex: 1,
    height: 38,
    backgroundColor: Colors.background,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 10,
    fontSize: 13,
  },
  sendBtn: { width: 38, height: 38, borderRadius: 9, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center' },
  reportedBox: { padding: 14, borderRadius: 12, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  reportedText: { fontSize: 13, color: Colors.textMuted },
});
