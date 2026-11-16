import React, {useState} from 'react';
import {
  BarChart2,
  Compass,
  Home,
  MessageSquare,
  Smartphone,
  User,
} from 'lucide-react';
import {CorporaProvider, useCorpora} from './corpora/CorporaContext';
import {
  BottomTabBar,
  ToastBanner,
  TopAppBar,
} from './corpora/components/CommonUI';
import {NotificationsModal, WriteReviewModal} from './corpora/components/Modals';
import {CommunityScreen} from './corpora/screens/CommunityScreen';
import {CompanyDetailsScreen} from './corpora/screens/CompanyDetailsScreen';
import {CompareScreen} from './corpora/screens/CompareScreen';
import {ExploreScreen} from './corpora/screens/ExploreScreen';
import {HomeScreen} from './corpora/screens/HomeScreen';
import {ProfileScreen} from './corpora/screens/ProfileScreen';
import {Colors, Typography} from './corpora/theme';
import {TabKey} from './corpora/types';
import {Image, Pressable, StyleSheet, Text, View} from './rn';

const DESKTOP_NAV: {
  key: TabKey;
  label: string;
  Icon: React.ComponentType<{size?: number; color?: string; strokeWidth?: number}>;
}[] = [
  {key: 'home', label: 'Home', Icon: Home},
  {key: 'explore', label: 'Explore', Icon: Compass},
  {key: 'compare', label: 'Compare', Icon: BarChart2},
  {key: 'community', label: 'Community', Icon: MessageSquare},
  {key: 'profile', label: 'Profile', Icon: User},
];

const TAB_TITLES: Record<TabKey, string> = {
  home: 'CORPORA',
  explore: 'Explore Companies',
  compare: 'Compare',
  community: 'Community',
  profile: 'Profile',
};

const CorporaShell: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    selectedCompanyId,
    unreadNotificationCount,
    profile,
    toastMessage,
  } = useCorpora();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [writeReviewCompanyId, setWriteReviewCompanyId] = useState<string | null>(null);
  const [mobileFramePreview, setMobileFramePreview] = useState(false);

  const renderActiveTabScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'explore':
        return <ExploreScreen />;
      case 'compare':
        return <CompareScreen />;
      case 'community':
        return <CommunityScreen />;
      case 'profile':
        return <ProfileScreen />;
    }
  };

  return (
    <View style={styles.appOuter}>
      {/* Desktop Left Navigation Rail (hidden on mobile and when smartphone preview frame is toggled) */}
      {!mobileFramePreview && (
        <View
          className="hidden lg:flex"
          style={styles.desktopSidebar}
        >
          <View style={styles.sidebarBrand}>
            <View style={styles.brandMark}>
              <View style={styles.brandMarkInner} />
            </View>
            <View>
              <Text style={styles.brandWordmark}>CORPORA</Text>
              <Text style={styles.brandSub}>Workplace Intelligence</Text>
            </View>
          </View>

          <View style={styles.sidebarNavList}>
            {DESKTOP_NAV.map(({key, label, Icon}) => {
              const active = activeTab === key && !selectedCompanyId;
              return (
                <Pressable
                  key={key}
                  onPress={() => setActiveTab(key)}
                  style={[styles.sidebarItem, active && styles.sidebarItemActive]}
                >
                  <Icon
                    size={19}
                    color={active ? Colors.accent : Colors.textMuted}
                    strokeWidth={active ? 2.3 : 1.9}
                  />
                  <Text
                    style={[
                      styles.sidebarItemText,
                      active && styles.sidebarItemTextActive,
                    ]}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.sidebarFooter}>
            <Pressable
              onPress={() => setMobileFramePreview(true)}
              style={styles.deviceToggleBtn}
            >
              <Smartphone size={16} color={Colors.accent} />
              <Text style={styles.deviceToggleText}>Smartphone View</Text>
            </Pressable>

            <Pressable
              onPress={() => setActiveTab('profile')}
              style={styles.sidebarProfileRow}
            >
              <Image
                source={{uri: profile.avatarUri}}
                alt={profile.name}
                style={styles.sidebarAvatar}
              />
              <View style={{flex: 1, minWidth: 0}}>
                <Text style={styles.sidebarUserName} numberOfLines={1}>
                  {profile.name}
                </Text>
                <Text style={styles.sidebarUserStatus} numberOfLines={1}>
                  {profile.verification.status}
                </Text>
              </View>
            </Pressable>
          </View>
        </View>
      )}

      {/* Main Content Stage */}
      <View
        style={[
          styles.mainStage,
          mobileFramePreview && styles.mainStageCenteredFrame,
        ]}
      >
        {mobileFramePreview && (
          <View className="hidden lg:flex" style={styles.frameToolbar}>
            <Text style={styles.frameToolbarLabel}>
              Smartphone Preview (390 × 844) · React Native Web
            </Text>
            <Pressable
              onPress={() => setMobileFramePreview(false)}
              style={styles.frameToolbarBtn}
            >
              <Text style={styles.frameToolbarBtnText}>Expand to Responsive View</Text>
            </Pressable>
          </View>
        )}

        <View
          style={[
            styles.viewportShell,
            mobileFramePreview && styles.phoneBezelShell,
          ]}
        >
          {selectedCompanyId ? (
            <CompanyDetailsScreen
              companyId={selectedCompanyId}
              onOpenWriteReview={(id) => setWriteReviewCompanyId(id)}
            />
          ) : (
            <View style={styles.tabScreenWrap}>
              <TopAppBar
                showBrand={activeTab === 'home'}
                title={TAB_TITLES[activeTab]}
                unreadCount={unreadNotificationCount}
                onOpenNotifications={() => setNotificationsOpen(true)}
                rightAction={
                  <Pressable
                    onPress={() => setActiveTab('profile')}
                    accessibilityLabel="Open profile"
                    style={styles.headerAvatarBtn}
                  >
                    <Image
                      source={{uri: profile.avatarUri}}
                      alt={profile.name}
                      style={styles.headerAvatarImg}
                    />
                  </Pressable>
                }
              />

              <View style={styles.contentArea}>{renderActiveTabScreen()}</View>

              <View className={mobileFramePreview ? 'flex' : 'flex lg:hidden'}>
                <BottomTabBar activeTab={activeTab} onSelectTab={setActiveTab} />
              </View>
            </View>
          )}
        </View>
      </View>

      <NotificationsModal
        visible={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />

      <WriteReviewModal
        companyId={writeReviewCompanyId}
        onClose={() => setWriteReviewCompanyId(null)}
      />

      <ToastBanner message={toastMessage} />
    </View>
  );
};

export default function App() {
  return (
    <CorporaProvider>
      <CorporaShell />
    </CorporaProvider>
  );
}

const styles = StyleSheet.create({
  appOuter: {
    flexDirection: 'row',
    height: '100vh',
    width: '100%',
    backgroundColor: Colors.background,
    overflow: 'hidden',
  },
  desktopSidebar: {
    width: 248,
    backgroundColor: Colors.surface,
    borderRightWidth: 1,
    borderRightStyle: 'solid',
    borderRightColor: Colors.border,
    padding: 16,
    justifyContent: 'space-between',
    flexShrink: 0,
  },
  sidebarBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  brandMark: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: Colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandMarkInner: {
    width: 11,
    height: 11,
    borderRadius: 3,
    borderWidth: 2.5,
    borderStyle: 'solid',
    borderColor: '#818CF8',
  },
  brandWordmark: {
    fontFamily: Typography.displayFont,
    fontSize: 16,
    fontWeight: 800,
    letterSpacing: 1.1,
    color: Colors.textPrimary,
  },
  brandSub: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  sidebarNavList: {
    flex: 1,
    marginTop: 22,
    gap: 4,
  },
  sidebarItem: {
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  sidebarItemActive: {
    backgroundColor: Colors.accentSoft,
  },
  sidebarItemText: {
    fontSize: 14,
    fontWeight: 500,
    color: Colors.textSecondary,
  },
  sidebarItemTextActive: {
    color: Colors.accent,
    fontWeight: 700,
  },
  sidebarFooter: {
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: Colors.surfaceSubtle,
  },
  deviceToggleBtn: {
    minHeight: 40,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: Colors.accentSoft,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  deviceToggleText: {
    fontSize: 12.5,
    fontWeight: 600,
    color: Colors.accent,
  },
  sidebarProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 6,
    borderRadius: 11,
  },
  sidebarAvatar: {
    width: 36,
    height: 36,
    borderRadius: 11,
    flexShrink: 0,
  },
  sidebarUserName: {
    fontSize: 13.5,
    fontWeight: 700,
    color: Colors.textPrimary,
  },
  sidebarUserStatus: {
    fontSize: 11,
    color: Colors.positiveText,
    fontWeight: 500,
  },
  mainStage: {
    flex: 1,
    minWidth: 0,
    height: '100%',
    backgroundColor: Colors.background,
  },
  mainStageCenteredFrame: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2F7',
    padding: 16,
    gap: 12,
  },
  frameToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: Colors.border,
  },
  frameToolbarLabel: {
    fontSize: 12.5,
    fontWeight: 600,
    color: Colors.textSecondary,
  },
  frameToolbarBtn: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  frameToolbarBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 600,
  },
  viewportShell: {
    flex: 1,
    width: '100%',
    maxWidth: 1160,
    alignSelf: 'center',
    minHeight: 0,
    backgroundColor: Colors.background,
  },
  phoneBezelShell: {
    maxWidth: 394,
    maxHeight: 820,
    width: '100%',
    flex: 1,
    borderRadius: 34,
    borderWidth: 8,
    borderStyle: 'solid',
    borderColor: '#0F172A',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 18},
    shadowOpacity: 0.18,
    shadowRadius: 36,
  },
  tabScreenWrap: {
    flex: 1,
    minHeight: 0,
  },
  contentArea: {
    flex: 1,
    minHeight: 0,
  },
  headerAvatarBtn: {
    minWidth: 40,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarImg: {
    width: 30,
    height: 30,
    borderRadius: 9,
  },
});
