import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from 'react';
import type {
  Account,
  AdminViewId,
  BrandVoice,
  CalendarMode,
  Conversation,
  ImpersonationWorkspace,
  MediaAsset,
  PlatformId,
  Portal,
  Post,
  ToastMessage,
  Tone,
  ViewId,
  WorkflowStatus,
  WorkspaceProfile,
} from './types';
import {
  defaultAccounts,
  defaultBrandVoice,
  initialDraft,
  mediaAssets,
  seedConversations,
  seedPosts,
} from './mockData';
import { generateDrafts, nextPeakWindow, splitThread } from './ai';
import { composeToDraft } from './compose';
import { api, errorMessage } from './api';
import { PLATFORMS } from './platforms';

interface State {
  view: ViewId;
  portal: Portal;
  adminView: AdminViewId;
  activeWorkspace: WorkspaceProfile;
  sidebarCollapsed: boolean;
  theme: 'dark' | 'light';
  accounts: Account[];
  posts: Post[];
  library: MediaAsset[];
  draft: Post;
  conversations: Conversation[];
  activeConversationId: string;
  brandVoice: BrandVoice;
  calendarMode: CalendarMode;
  toasts: ToastMessage[];
  generation: { running: boolean; step: number };
  remixOf: { id: string; title: string } | null;
  hydrated: boolean;
  apiStatus: 'connecting' | 'online' | 'offline';
}

type Action =
  | { type: 'ui/view'; view: ViewId }
  | { type: 'ui/portal'; portal: Portal }
  | { type: 'ui/adminView'; view: AdminViewId }
  | { type: 'workspace/impersonate'; workspace: ImpersonationWorkspace }
  | { type: 'ui/sidebar' }
  | { type: 'ui/theme'; theme: 'dark' | 'light' }
  | { type: 'ui/calendarMode'; mode: CalendarMode }
  | { type: 'app/hydrate'; accounts: Account[]; posts: Post[]; conversations: Conversation[] }
  | { type: 'app/status'; status: State['apiStatus'] }
  | { type: 'draft/publish'; publishedAt: string; metrics: NonNullable<Post['metrics']> }
  | { type: 'draft/patch'; patch: Partial<Post> }
  | { type: 'draft/override'; platform: PlatformId; text: string }
  | { type: 'draft/resetOverride'; platform: PlatformId }
  | { type: 'draft/togglePlatform'; platform: PlatformId }
  | { type: 'draft/generateStart' }
  | { type: 'draft/generateStep'; step: number }
  | { type: 'draft/generateComplete'; result: ReturnType<typeof generateDrafts>; idea: string; tone: Tone }
  | { type: 'draft/new' }
  | {
      type: 'draft/save';
      status: WorkflowStatus;
      scheduledAt?: string | null;
      peak?: Post['peak'];
    }
  | { type: 'media/add'; asset: MediaAsset }
  | { type: 'posts/upsert'; post: Post }
  | { type: 'posts/status'; id: string; status: WorkflowStatus }
  | { type: 'posts/evergreen'; id: string }
  | { type: 'inbox/select'; id: string }
  | { type: 'inbox/read'; id: string }
  | { type: 'inbox/readAll' }
  | { type: 'inbox/send'; id: string; text: string }
  | { type: 'inbox/resolve'; id: string }
  | { type: 'inbox/assign'; id: string; label: string }
  | { type: 'accounts/toggle'; platform: PlatformId }
  | { type: 'brand/patch'; patch: Partial<BrandVoice> }
  | { type: 'toast/push'; toast: ToastMessage }
  | { type: 'toast/dismiss'; id: number }
  | { type: 'remix'; post: Post }
  | { type: 'remix/clear' };

const defaultWorkspace: WorkspaceProfile = {
  id: 'northwind',
  name: 'Northwind Studio',
  plan: 'Agency',
  ownerName: 'Avery Reid',
  ownerEmail: 'avery@northwind.studio',
  initials: 'NS',
  tone: 'from-sky-400 to-indigo-600',
  brands: 3,
};

const initialState: State = {
  view: 'composer',
  portal: 'workspace',
  adminView: 'executive',
  activeWorkspace: defaultWorkspace,
  sidebarCollapsed: false,
  theme: 'dark',
  accounts: defaultAccounts,
  posts: seedPosts,
  library: mediaAssets,
  draft: initialDraft,
  conversations: seedConversations,
  activeConversationId: 'c-1',
  brandVoice: defaultBrandVoice,
  calendarMode: 'month',
  toasts: [],
  generation: { running: false, step: 0 },
  remixOf: null,
  hydrated: false,
  apiStatus: 'connecting',
};

function upsertPost(posts: Post[], post: Post): Post[] {
  const index = posts.findIndex((p) => p.id === post.id);
  if (index === -1) return [post, ...posts];
  const next = posts.slice();
  next[index] = post;
  return next;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ui/view':
      return { ...state, view: action.view };
    case 'ui/portal':
      return { ...state, portal: action.portal };
    case 'ui/adminView':
      return { ...state, adminView: action.view };
    case 'workspace/impersonate': {
      const workspace = action.workspace;
      const generated = generateDrafts(workspace.sampleIdea, 'thought-leader', state.brandVoice);
      return {
        ...state,
        portal: 'workspace',
        view: 'composer',
        remixOf: null,
        activeWorkspace: {
          id: workspace.id,
          name: workspace.name,
          plan: workspace.plan,
          ownerName: workspace.ownerName,
          ownerEmail: workspace.ownerEmail,
          initials: workspace.initials,
          tone: workspace.tone,
          brands: workspace.brands,
        },
        brandVoice: { ...state.brandVoice, persona: workspace.brandPersona },
        draft: {
          ...state.draft,
          id: `draft-${workspace.id}-${Date.now()}`,
          title: `${workspace.name} · Weekly campaign`,
          idea: workspace.sampleIdea,
          master: generated.master,
          overrides: generated.overrides,
          hashtags: generated.hashtags,
          firstCommentText: generated.firstCommentText,
          status: 'draft',
          scheduledAt: null,
          peak: undefined,
          publishedAt: null,
          metrics: undefined,
        },
      };
    }
    case 'ui/sidebar':
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };
    case 'ui/theme':
      return { ...state, theme: action.theme };
    case 'ui/calendarMode':
      return { ...state, calendarMode: action.mode };
    case 'app/hydrate':
      return {
        ...state,
        hydrated: true,
        accounts: action.accounts.length ? action.accounts : state.accounts,
        posts: action.posts.length ? action.posts : state.posts,
        conversations: action.conversations.length ? action.conversations : state.conversations,
        activeConversationId: action.conversations.some((c) => c.id === state.activeConversationId)
          ? state.activeConversationId
          : (action.conversations[0]?.id ?? state.activeConversationId),
      };
    case 'app/status':
      return { ...state, apiStatus: action.status };
    case 'draft/patch':
      return { ...state, draft: { ...state.draft, ...action.patch } };
    case 'draft/override':
      return {
        ...state,
        draft: {
          ...state.draft,
          overrides: { ...state.draft.overrides, [action.platform]: action.text },
        },
      };
    case 'draft/resetOverride': {
      const overrides = { ...state.draft.overrides };
      delete overrides[action.platform];
      return { ...state, draft: { ...state.draft, overrides } };
    }
    case 'draft/togglePlatform': {
      const active = state.draft.platforms.includes(action.platform);
      const platforms = active
        ? state.draft.platforms.filter((p) => p !== action.platform)
        : [...state.draft.platforms, action.platform];
      return {
        ...state,
        draft: { ...state.draft, platforms: platforms.length ? platforms : [action.platform] },
      };
    }
    case 'draft/generateStart':
      return { ...state, generation: { running: true, step: 0 } };
    case 'draft/generateStep':
      return { ...state, generation: { running: true, step: action.step } };
    case 'draft/generateComplete':
      return {
        ...state,
        generation: { running: false, step: 3 },
        draft: {
          ...state.draft,
          title: action.result.title,
          idea: action.idea,
          tone: action.tone,
          master: action.result.master,
          overrides: action.result.overrides,
          hashtags: action.result.hashtags,
          firstCommentText: action.result.firstCommentText,
          firstComment: state.brandVoice.autoFirstComment,
          status: 'draft',
        },
      };
    case 'draft/new':
      return {
        ...state,
        view: 'composer',
        remixOf: null,
        draft: {
          ...state.draft,
          id: `draft-${Date.now()}`,
          title: 'Untitled post',
          idea: '',
          master: '',
          overrides: {},
          hashtags: [],
          firstCommentText: '',
          status: 'draft',
          scheduledAt: null,
          peak: undefined,
          publishedAt: null,
          metrics: undefined,
        },
      };
    case 'draft/save': {
      const draft: Post = {
        ...state.draft,
        status: action.status,
        scheduledAt: action.scheduledAt ?? state.draft.scheduledAt,
        peak: action.peak ?? state.draft.peak,
        publishedAt: action.status === 'published' ? new Date().toISOString() : state.draft.publishedAt,
      };
      return { ...state, draft, posts: upsertPost(state.posts, draft) };
    }
    case 'draft/publish': {
      const draft: Post = {
        ...state.draft,
        status: 'published',
        scheduledAt: null,
        publishedAt: action.publishedAt,
        metrics: action.metrics,
      };
      return { ...state, draft, posts: upsertPost(state.posts, draft) };
    }
    case 'media/add':
      return { ...state, library: [action.asset, ...state.library] };
    case 'posts/upsert':
      return { ...state, posts: upsertPost(state.posts, action.post) };
    case 'posts/status':
      return {
        ...state,
        posts: state.posts.map((p) => (p.id === action.id ? { ...p, status: action.status } : p)),
      };
    case 'posts/evergreen':
      return {
        ...state,
        posts: state.posts.map((p) => (p.id === action.id ? { ...p, evergreen: !p.evergreen } : p)),
      };
    case 'inbox/select':
      return {
        ...state,
        activeConversationId: action.id,
        conversations: state.conversations.map((c) =>
          c.id === action.id ? { ...c, unread: false } : c,
        ),
      };
    case 'inbox/read':
      return {
        ...state,
        conversations: state.conversations.map((c) => (c.id === action.id ? { ...c, unread: false } : c)),
      };
    case 'inbox/readAll':
      return { ...state, conversations: state.conversations.map((c) => ({ ...c, unread: false })) };
    case 'inbox/send':
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === action.id
            ? {
                ...c,
                unread: false,
                messages: [
                  ...c.messages,
                  {
                    id: `msg-${Date.now()}`,
                    from: 'me',
                    text: action.text,
                    at: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
                  },
                ],
              }
            : c,
        ),
      };
    case 'inbox/resolve':
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === action.id ? { ...c, status: c.status === 'open' ? 'resolved' : 'open' } : c,
        ),
      };
    case 'inbox/assign':
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === action.id
            ? { ...c, labels: c.labels.includes(action.label) ? c.labels : [...c.labels, action.label] }
            : c,
        ),
      };
    case 'accounts/toggle':
      return {
        ...state,
        accounts: state.accounts.map((a) =>
          a.id === action.platform
            ? {
                ...a,
                connected: !a.connected,
                lastSync: !a.connected ? 'Just now' : 'Not connected',
              }
            : a,
        ),
      };
    case 'brand/patch':
      return { ...state, brandVoice: { ...state.brandVoice, ...action.patch } };
    case 'toast/push':
      return { ...state, toasts: [...state.toasts.slice(-2), action.toast] };
    case 'toast/dismiss':
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) };
    case 'remix': {
      const { post } = action;
      return {
        ...state,
        view: 'composer',
        remixOf: { id: post.id, title: post.title },
        draft: {
          ...post,
          id: `draft-${Date.now()}`,
          status: 'draft',
          scheduledAt: null,
          peak: undefined,
          publishedAt: null,
          metrics: undefined,
          firstComment: state.brandVoice.autoFirstComment,
        },
      };
    }
    case 'remix/clear':
      return { ...state, remixOf: null };
    default:
      return state;
  }
}

interface StoreValue extends State {
  setView: (view: ViewId) => void;
  setPortal: (portal: Portal) => void;
  setAdminView: (view: AdminViewId) => void;
  impersonateWorkspace: (workspace: ImpersonationWorkspace) => void;
  toggleSidebar: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setCalendarMode: (mode: CalendarMode) => void;
  updateDraft: (patch: Partial<Post>) => void;
  setOverride: (platform: PlatformId, text: string) => void;
  resetOverride: (platform: PlatformId) => void;
  togglePlatform: (platform: PlatformId) => void;
  runGeneration: (idea: string, tone: Tone) => void;
  newDraft: () => void;
  saveDraft: () => void;
  sendForApproval: () => void;
  scheduleSmart: () => void;
  scheduleAt: (iso: string, label: string, match: number) => void;
  publishNow: () => boolean;
  toggleEvergreen: (id: string) => void;
  setPostStatus: (id: string, status: WorkflowStatus) => void;
  addMedia: (asset: MediaAsset) => void;
  selectConversation: (id: string) => void;
  sendReply: (text: string) => void;
  markAllRead: () => void;
  toggleResolved: () => void;
  assignLabel: (label: string) => void;
  toggleAccount: (platform: PlatformId) => void;
  updateBrandVoice: (patch: Partial<BrandVoice>) => void;
  toast: (message: string, description?: string, tone?: ToastMessage['tone']) => void;
  dismissToast: (id: number) => void;
  remixPost: (post: Post) => void;
  clearRemix: () => void;
  activeConversation: Conversation;
  unreadCount: number;
  hydrated: boolean;
  apiStatus: 'connecting' | 'online' | 'offline';
}

const StoreContext = createContext<StoreValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const timers = useRef<number[]>([]);
  const toastTimers = useRef<number[]>([]);
  const syncFailed = useRef(false);

  useEffect(() => {
    const stored = window.localStorage.getItem('omnipost-theme');
    if (stored === 'light' || stored === 'dark') {
      dispatch({ type: 'ui/theme', theme: stored });
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', state.theme === 'dark');
    root.classList.toggle('light', state.theme === 'light');
    window.localStorage.setItem('omnipost-theme', state.theme);
  }, [state.theme]);

  useEffect(() => {
    api
      .bootstrap()
      .then((payload) => {
        dispatch({
          type: 'app/hydrate',
          accounts: payload.accounts,
          posts: payload.posts,
          conversations: payload.conversations,
        });
        dispatch({ type: 'app/status', status: 'online' });
      })
      .catch((error) => {
        console.warn('bootstrap_failed', error);
        dispatch({ type: 'app/status', status: 'offline' });
      });
  }, []);

  useEffect(() => () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    toastTimers.current.forEach((t) => window.clearTimeout(t));
  }, []);

  const toast = useCallback((message: string, description?: string, tone: ToastMessage['tone'] = 'default') => {
    const id = Date.now() + Math.random();
    dispatch({ type: 'toast/push', toast: { id, message, description, tone } });
    const timer = window.setTimeout(() => dispatch({ type: 'toast/dismiss', id }), 4200);
    toastTimers.current.push(timer);
  }, []);

  const persistPost = useCallback(
    (post: Post) => {
      api
        .upsertPost(post)
        .then(() => {
          syncFailed.current = false;
        })
        .catch((error) => {
          if (syncFailed.current) return;
          syncFailed.current = true;
          toast('Database sync failed', `${errorMessage(error)} · changes are kept locally.`, 'warning');
        });
    },
    [toast],
  );

  const runGeneration = useCallback(
    (idea: string, tone: Tone) => {
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
      dispatch({ type: 'draft/generateStart' });
      [1, 2].forEach((step, index) => {
        timers.current.push(
          window.setTimeout(() => dispatch({ type: 'draft/generateStep', step }), 520 + index * 620),
        );
      });

      const startedAt = Date.now();
      const finish = (
        result: ReturnType<typeof generateDrafts>,
        description: string,
        tone_: ToastMessage['tone'],
      ) => {
        const wait = Math.max(0, 1600 - (Date.now() - startedAt));
        timers.current.push(
          window.setTimeout(() => {
            dispatch({ type: 'draft/generateComplete', result, idea, tone });
            toast('Drafts tailored for 5 channels', description, tone_);
          }, wait),
        );
      };

      api
        .compose({ idea, tone, brandVoice: state.brandVoice })
        .then((result) => {
          finish(
            composeToDraft(result),
            result.engine === 'llm'
              ? `Live model · ${result.provider}${result.model ? ` ${result.model}` : ''} · validated structured JSON.`
              : 'Structured server pipeline · LinkedIn, X, Instagram, TikTok and Shorts.',
            result.warning ? 'warning' : 'success',
          );
        })
        .catch((error) => {
          console.warn('compose_api_failed', error);
          finish(
            generateDrafts(idea, tone, state.brandVoice),
            `API unavailable (${errorMessage(error)}) — generated locally so you kept working.`,
            'warning',
          );
        });
    },
    [state.brandVoice, toast],
  );

  const saveDraft = useCallback(() => {
    const next: Post = { ...state.draft, status: 'draft' };
    dispatch({ type: 'draft/save', status: 'draft' });
    persistPost(next);
    toast('Draft saved', 'Your master copy and per-channel overrides are up to date.');
  }, [persistPost, state.draft, toast]);

  const sendForApproval = useCallback(() => {
    const next: Post = { ...state.draft, status: 'pending' };
    dispatch({ type: 'draft/save', status: 'pending' });
    persistPost(next);
    toast('Sent for client approval', '2 reviewers notified · expected response within 4h.', 'success');
  }, [persistPost, state.draft, toast]);

  const scheduleSmart = useCallback(() => {
    const peak = nextPeakWindow(state.draft.platforms);
    const peakMeta = { label: `${peak.day} ${peak.time}`, match: peak.match, time: `${peak.day} ${peak.time}` };
    const next: Post = { ...state.draft, status: 'scheduled', scheduledAt: peak.iso, peak: peakMeta };
    dispatch({
      type: 'draft/save',
      status: 'scheduled',
      scheduledAt: peak.iso,
      peak: peakMeta,
    });
    persistPost(next);
    toast(
      `Locked in ${peak.day} ${peak.time}`,
      `${peak.match}% engagement match · ${PLATFORMS[peak.platform].name} audience peak.`,
      'success',
    );
  }, [persistPost, state.draft, toast]);

  const scheduleAt = useCallback(
    (iso: string, label: string, match: number) => {
      const peakMeta = { label, match, time: label };
      const next: Post = { ...state.draft, status: 'scheduled', scheduledAt: iso, peak: peakMeta };
      dispatch({
        type: 'draft/save',
        status: 'scheduled',
        scheduledAt: iso,
        peak: peakMeta,
      });
      persistPost(next);
      toast(`Scheduled for ${label}`, `${match}% engagement match · queued across ${state.draft.platforms.length} channels.`, 'success');
    },
    [persistPost, state.draft, state.draft.platforms.length, toast],
  );

  const publishNow = useCallback(() => {
    const overLimit = state.draft.platforms.filter((platform) => {
      if (platform === 'x') return false;
      const text = state.draft.overrides[platform] ?? state.draft.master;
      return text.length > PLATFORMS[platform].limit;
    });
    if (!state.draft.master.trim()) {
      toast('Nothing to publish yet', 'Add a master caption or generate a draft first.', 'warning');
      return false;
    }
    if (overLimit.length) {
      toast(
        'Some channels are over the limit',
        `${overLimit.map((p) => PLATFORMS[p].name).join(', ')} exceed their character limits.`,
        'warning',
      );
      return false;
    }
    const published: Post = {
      ...state.draft,
      status: 'published',
      publishedAt: new Date().toISOString(),
      metrics: {
        impressions: 18_400 + Math.round(Math.random() * 12_000),
        engagement: 4.2 + Math.random() * 3.2,
        likes: 1_240 + Math.round(Math.random() * 800),
        comments: 64 + Math.round(Math.random() * 120),
        shares: 120 + Math.round(Math.random() * 220),
      },
    };
    dispatch({
      type: 'draft/publish',
      publishedAt: published.publishedAt ?? new Date().toISOString(),
      metrics: published.metrics!,
    });
    persistPost(published);
    const threadNote = (published.overrides.x ?? '').length > 280 ? ' · X thread split automatically' : '';
    toast('Published everywhere', `${state.draft.platforms.length} channels live${threadNote}, first comments queued.`, 'success');
    return true;
  }, [persistPost, state.draft, toast]);

  const setPostStatus = useCallback(
    (id: string, status: WorkflowStatus) => {
      const post = state.posts.find((p) => p.id === id);
      dispatch({ type: 'posts/status', id, status });
      if (post) persistPost({ ...post, status });
      toast(`Moved to ${status === 'published' ? 'Published' : status === 'scheduled' ? 'Scheduled' : status === 'pending' ? 'Pending Approval' : 'Draft'}`);
    },
    [persistPost, state.posts, toast],
  );

  const toggleEvergreen = useCallback(
    (id: string) => {
      const post = state.posts.find((p) => p.id === id);
      if (!post) return;
      dispatch({ type: 'posts/evergreen', id });
      persistPost({ ...post, evergreen: !post.evergreen });
    },
    [persistPost, state.posts],
  );

  const activeConversation = useMemo(
    () => state.conversations.find((c) => c.id === state.activeConversationId) ?? state.conversations[0],
    [state.activeConversationId, state.conversations],
  );

  const value: StoreValue = {
    ...state,
    setView: (view) => dispatch({ type: 'ui/view', view }),
    setPortal: (portal) => dispatch({ type: 'ui/portal', portal }),
    setAdminView: (view) => dispatch({ type: 'ui/adminView', view }),
    impersonateWorkspace: (workspace) => {
      dispatch({ type: 'workspace/impersonate', workspace });
      toast(
        `Impersonating ${workspace.name}`,
        `${workspace.plan} workspace · ${workspace.brands} brands · draft pre-loaded from their latest idea.`,
        'success',
      );
    },
    toggleSidebar: () => dispatch({ type: 'ui/sidebar' }),
    setTheme: (theme) => dispatch({ type: 'ui/theme', theme }),
    setCalendarMode: (mode) => dispatch({ type: 'ui/calendarMode', mode }),
    updateDraft: (patch) => dispatch({ type: 'draft/patch', patch }),
    setOverride: (platform, text) => dispatch({ type: 'draft/override', platform, text }),
    resetOverride: (platform) => dispatch({ type: 'draft/resetOverride', platform }),
    togglePlatform: (platform) => dispatch({ type: 'draft/togglePlatform', platform }),
    runGeneration,
    newDraft: () => dispatch({ type: 'draft/new' }),
    saveDraft,
    sendForApproval,
    scheduleSmart,
    scheduleAt,
    publishNow,
    toggleEvergreen,
    setPostStatus,
    addMedia: (asset) => dispatch({ type: 'media/add', asset }),
    selectConversation: (id) => {
      dispatch({ type: 'inbox/select', id });
      api.readThread(id).catch(() => undefined);
    },
    sendReply: (text) => {
      const content = text.trim();
      if (!content) return;
      const conversationId = state.activeConversationId;
      dispatch({ type: 'inbox/send', id: conversationId, text: content });
      api.reply(conversationId, content).catch((error) => {
        toast('Reply saved locally', `${errorMessage(error)} · it will need a resend.`, 'warning');
      });
      toast('Reply sent', `Delivered to ${activeConversation.senderName} on ${PLATFORMS[activeConversation.platform].name}.`, 'success');
    },
    markAllRead: () => {
      dispatch({ type: 'inbox/readAll' });
      api.readAll().catch(() => undefined);
    },
    toggleResolved: () => {
      const nextStatus = activeConversation.status === 'open' ? 'resolved' : 'open';
      dispatch({ type: 'inbox/resolve', id: state.activeConversationId });
      api.patchThread(state.activeConversationId, { status: nextStatus }).catch((error) => {
        toast('Status not synced', errorMessage(error), 'warning');
      });
      toast(activeConversation.status === 'open' ? 'Conversation resolved' : 'Reopened conversation');
    },
    assignLabel: (label) => {
      dispatch({ type: 'inbox/assign', id: state.activeConversationId, label });
      api.patchThread(state.activeConversationId, { label }).catch((error) => {
        toast('Label not synced', errorMessage(error), 'warning');
      });
      toast(`Label added · ${label}`);
    },
    toggleAccount: (platform) => {
      const account = state.accounts.find((a) => a.id === platform);
      dispatch({ type: 'accounts/toggle', platform });
      api.setAccount(platform, !account?.connected).catch((error) => {
        toast('Account status not synced', errorMessage(error), 'warning');
      });
      toast(
        account?.connected ? `${PLATFORMS[platform].name} disconnected` : `${PLATFORMS[platform].name} connected`,
        account?.connected ? 'Scheduling for this channel is paused.' : 'OAuth handshake complete — ready to publish.',
        account?.connected ? 'warning' : 'success',
      );
    },
    updateBrandVoice: (patch) => dispatch({ type: 'brand/patch', patch }),
    toast,
    dismissToast: (id) => dispatch({ type: 'toast/dismiss', id }),
    remixPost: (post) => {
      dispatch({ type: 'remix', post });
      toast('Loaded into the composer', `Winning structure from “${post.title}” · tweak the hook and republish.`, 'success');
    },
    clearRemix: () => dispatch({ type: 'remix/clear' }),
    activeConversation,
    unreadCount: state.conversations.filter((c) => c.unread).length,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useApp(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}

export function threadPreview(text: string): string[] {
  return splitThread(text, 280);
}
