import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowUpRight,
  AtSign,
  CheckCheck,
  Clock3,
  CornerDownLeft,
  Hash,
  Inbox,
  Mail,
  MessageCircle,
  MoreHorizontal,
  Paperclip,
  Send,
  Smile,
  Sparkles,
  UserCheck,
  Wand2,
} from 'lucide-react';
import { useApp } from '../../lib/store';
import { generateQuickReplies } from '../../lib/ai';
import { PLATFORM_ORDER, PLATFORMS, formatCompact } from '../../lib/platforms';
import type { InboxKind } from '../../lib/types';
import { Avatar, Badge, Button, Card, EmptyState, Select, cx } from '../ui/Primitives';
import { PlatformGlyph } from '../icons/PlatformGlyph';

const FILTERS: { id: 'all' | 'unread' | InboxKind; label: string; icon: typeof Inbox }[] = [
  { id: 'all', label: 'All', icon: Inbox },
  { id: 'unread', label: 'Unread', icon: Mail },
  { id: 'comment', label: 'Comments', icon: MessageCircle },
  { id: 'dm', label: 'DMs', icon: Send },
  { id: 'mention', label: 'Mentions', icon: AtSign },
];

const KIND_ICON = { comment: MessageCircle, dm: Send, mention: AtSign };

export function InboxView() {
  const {
    conversations,
    activeConversation,
    activeConversationId,
    selectConversation,
    sendReply,
    markAllRead,
    toggleResolved,
    assignLabel,
    brandVoice,
    unreadCount,
  } = useApp();
  const [filter, setFilter] = useState<'all' | 'unread' | InboxKind>('all');
  const [platform, setPlatform] = useState<'all' | (typeof PLATFORM_ORDER)[number]>('all');
  const [query, setQuery] = useState('');
  const [reply, setReply] = useState('');
  const threadRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return conversations.filter((conversation) => {
      if (filter === 'unread' && !conversation.unread) return false;
      if (filter !== 'all' && filter !== 'unread' && conversation.kind !== filter) return false;
      if (platform !== 'all' && conversation.platform !== platform) return false;
      if (
        q &&
        !conversation.senderName.toLowerCase().includes(q) &&
        !conversation.messages.some((m) => m.text.toLowerCase().includes(q))
      )
        return false;
      return true;
    });
  }, [conversations, filter, platform, query]);

  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [activeConversationId, activeConversation?.messages.length]);

  const quickReplies = generateQuickReplies(activeConversation, brandVoice);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-line/50 px-4 py-2.5">
        <h1 className="text-[13px] font-semibold tracking-tight text-ink">Unified inbox</h1>
        <Badge className="border-indigo-500/25 bg-indigo-500/10 text-indigo-200" dot="bg-indigo-400">
          {unreadCount} unread
        </Badge>
        <span className="hidden text-[10px] text-faint sm:block">Comments, DMs and mentions across all five channels</span>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" icon={<CheckCheck className="h-3.5 w-3.5" />} onClick={markAllRead}>
            Mark all read
          </Button>
          <Button variant="subtle" size="sm" icon={<UserCheck className="h-3.5 w-3.5" />} onClick={() => assignLabel('Assigned to me')}>
            Assign to me
          </Button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Conversation list */}
        <aside className="flex w-[318px] shrink-0 flex-col border-r border-line/50 bg-surface/30 max-lg:w-[280px] max-sm:hidden">
          <div className="border-b border-line/40 px-2.5 py-2">
            <div className="flex items-center gap-0.5 overflow-x-auto no-scrollbar">
              {FILTERS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setFilter(item.id)}
                  className={cx(
                    'flex shrink-0 items-center gap-1 rounded-md border px-1 py-1 text-[9.5px] transition-colors',
                    filter === item.id
                      ? 'border-indigo-400/40 bg-indigo-500/15 text-indigo-100'
                      : 'border-transparent text-muted hover:bg-raised/60 hover:text-ink',
                  )}
                >
                  <item.icon className="h-2.5 w-2.5" />
                  {item.label}
                </button>
              ))}
            </div>
            <div className="mt-1.5 flex items-center gap-1.5">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search conversations…"
                aria-label="Search conversations"
                className="h-7 min-w-0 flex-1 rounded-md border border-line/60 bg-app/40 px-2 text-[10.5px] text-ink outline-none focus:border-indigo-400/50"
              />
              <Select
                value={platform}
                onChange={(event) => setPlatform(event.target.value as typeof platform)}
                className="w-[86px]"
              >
                <option value="all">All apps</option>
                {PLATFORM_ORDER.map((id) => (
                  <option key={id} value={id}>
                    {PLATFORMS[id].short}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {filtered.map((conversation) => {
              const Icon = KIND_ICON[conversation.kind];
              const last = conversation.messages[conversation.messages.length - 1];
              const active = conversation.id === activeConversationId;
              return (
                <button
                  key={conversation.id}
                  onClick={() => {
                    selectConversation(conversation.id);
                    setReply('');
                  }}
                  className={cx(
                    'relative flex w-full gap-2 border-b border-line/30 px-2.5 py-2 text-left transition-colors',
                    active ? 'bg-indigo-500/[0.08]' : 'hover:bg-raised/40',
                  )}
                >
                  {active && <span className="absolute inset-y-0 left-0 w-[2px] bg-gradient-to-b from-indigo-400 to-violet-500" />}
                  <div className="relative shrink-0">
                    <Avatar initials={conversation.initials} tone={conversation.avatarTone} size={32} />
                    <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-app text-ink ring-1 ring-line/60">
                      <PlatformGlyph platform={conversation.platform} className="h-2 w-2" />
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <p className={cx('truncate text-[11.5px]', conversation.unread ? 'font-semibold text-ink' : 'font-medium text-muted')}>
                        {conversation.senderName}
                      </p>
                      <span className="ml-auto shrink-0 text-[9px] text-faint">{conversation.timeAgo}</span>
                    </div>
                    <p className="flex items-center gap-1 text-[9px] text-faint">
                      <Icon className="h-2.5 w-2.5" /> {conversation.kind}
                      {conversation.status === 'resolved' && <span className="ml-1 text-emerald-400">· resolved</span>}
                    </p>
                    <p className={cx('mt-0.5 line-clamp-2 text-[10px] leading-snug', conversation.unread ? 'text-ink/80' : 'text-faint')}>
                      {last?.text}
                    </p>
                    <div className="mt-1 flex items-center gap-1">
                      {conversation.labels.slice(0, 1).map((label) => (
                        <span key={label} className="rounded border border-line/60 px-1 py-0.5 text-[8px] text-faint">
                          {label}
                        </span>
                      ))}
                      {conversation.unread && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-400" />}
                    </div>
                  </div>
                </button>
              );
            })}
            {!filtered.length && (
              <EmptyState icon={<Inbox className="h-4 w-4" />} title="Inbox zero" description="No conversations match this filter right now." />
            )}
          </div>
        </aside>

        {/* Thread */}
        <section className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-2 border-b border-line/50 px-3 py-2">
            <Avatar initials={activeConversation.initials} tone={activeConversation.avatarTone} size={30} />
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 truncate text-[12px] font-semibold text-ink">
                {activeConversation.senderName}
                <span className="flex items-center gap-1 rounded border border-line/60 px-1 py-0.5 text-[8.5px] font-normal text-faint">
                  <PlatformGlyph platform={activeConversation.platform} className="h-2 w-2" />
                  {PLATFORMS[activeConversation.platform].name}
                </span>
              </p>
              <p className="truncate text-[9.5px] text-faint">
                {activeConversation.senderHandle} · replying to “{activeConversation.postTitle}”
              </p>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <Badge className="hidden border-line/60 bg-raised/50 text-faint sm:inline-flex">
                <Clock3 className="h-2.5 w-2.5" /> replies in ~12 min
              </Badge>
              <button
                onClick={toggleResolved}
                className={cx(
                  'rounded-md border px-2 py-1 text-[10px] transition-colors',
                  activeConversation.status === 'resolved'
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                    : 'border-line/60 text-muted hover:text-ink',
                )}
              >
                {activeConversation.status === 'resolved' ? 'Reopen' : 'Mark resolved'}
              </button>
              <button aria-label="More actions" className="flex h-6 w-6 items-center justify-center rounded text-faint hover:text-ink">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div ref={threadRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
            <div className="mx-auto mb-3 flex max-w-md items-center gap-2 rounded-lg border border-line/50 bg-app/40 px-2.5 py-1.5">
              <MessageCircle className="h-3 w-3 shrink-0 text-faint" />
              <p className="min-w-0 flex-1 truncate text-[10px] text-faint">
                In reply to your post: <span className="text-muted">{activeConversation.postExcerpt}</span>
              </p>
              <ArrowUpRight className="h-3 w-3 shrink-0 text-faint" />
            </div>

            <div className="space-y-2.5">
              {activeConversation.messages.map((message) => (
                <div key={message.id} className={cx('flex gap-2', message.from === 'me' ? 'justify-end' : 'justify-start')}>
                  {message.from === 'them' && (
                    <Avatar initials={activeConversation.initials} tone={activeConversation.avatarTone} size={24} className="mt-auto" />
                  )}
                  <div className={cx('max-w-[76%]', message.from === 'me' && 'text-right')}>
                    <div
                      className={cx(
                        'inline-block whitespace-pre-wrap break-words rounded-xl px-2.5 py-1.5 text-left text-[11.5px] leading-relaxed',
                        message.from === 'me'
                          ? 'rounded-br-sm border border-indigo-400/30 bg-gradient-to-br from-indigo-500/25 to-violet-600/20 text-ink'
                          : 'rounded-bl-sm border border-line/60 bg-raised/60 text-muted',
                      )}
                    >
                      {message.text}
                    </div>
                    <p className="mt-0.5 text-[9px] text-faint">
                      {message.from === 'me' ? 'You · ' : ''}
                      {message.at}
                      {message.from === 'me' && <span className="ml-1 text-emerald-400">· delivered</span>}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-line/50 px-3 py-2">
            <div className="mb-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="flex shrink-0 items-center gap-1 text-[9.5px] font-semibold uppercase tracking-[0.1em] text-faint">
                <Sparkles className="h-2.5 w-2.5 text-indigo-300" /> AI quick replies
              </span>
              {quickReplies.map((chip) => (
                <button
                  key={chip.label}
                  onClick={() => setReply(chip.text)}
                  title={chip.text}
                  className="group flex shrink-0 items-center gap-1 rounded-full border border-line/60 bg-app/40 px-2 py-1 text-[10px] text-muted transition-colors hover:border-indigo-400/50 hover:text-indigo-200"
                >
                  <Wand2 className="h-2.5 w-2.5 text-indigo-300" />
                  {chip.label}
                </button>
              ))}
            </div>
            <div className="flex items-end gap-1.5 rounded-xl border border-line/70 bg-app/50 px-2 py-1.5 focus-within:border-indigo-400/50">
              <button aria-label="Attach file" className="mb-1 text-faint hover:text-ink">
                <Paperclip className="h-3.5 w-3.5" />
              </button>
              <textarea
                value={reply}
                onChange={(event) => setReply(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    if (reply.trim()) {
                      sendReply(reply);
                      setReply('');
                    }
                  }
                }}
                rows={1}
                placeholder={`Reply to ${activeConversation.senderName.split(' ')[0]} in your brand voice…`}
                aria-label="Reply"
                className="max-h-24 min-h-[26px] flex-1 resize-none bg-transparent py-1 text-[11.5px] leading-relaxed text-ink outline-none placeholder:text-faint"
              />
              <div className="mb-0.5 flex items-center gap-0.5">
                <button aria-label="Insert emoji" className="p-1 text-faint hover:text-ink">
                  <Smile className="h-3.5 w-3.5" />
                </button>
                <button aria-label="Insert hashtag" className="p-1 text-faint hover:text-ink">
                  <Hash className="h-3.5 w-3.5" />
                </button>
                <Button
                  variant="primary"
                  size="xs"
                  disabled={!reply.trim()}
                  onClick={() => {
                    sendReply(reply);
                    setReply('');
                  }}
                  icon={<Send className="h-3 w-3" />}
                >
                  Send
                </Button>
              </div>
            </div>
            <p className="mt-1 flex items-center gap-1 px-0.5 text-[9px] text-faint">
              <CornerDownLeft className="h-2.5 w-2.5" /> Enter to send · Shift + Enter for a new line · drafts use your brand voice v3
            </p>
          </div>
        </section>

        {/* Context panel */}
        <aside className="hidden w-[286px] shrink-0 flex-col overflow-y-auto border-l border-line/50 bg-surface/30 xl:flex">
          <div className="border-b border-line/40 p-3 text-center">
            <Avatar initials={activeConversation.initials} tone={activeConversation.avatarTone} size={48} ring className="mx-auto" />
            <p className="mt-1.5 text-[12.5px] font-semibold text-ink">{activeConversation.senderName}</p>
            <p className="text-[10px] text-faint">{activeConversation.senderHandle}</p>
            <div className="mt-1.5 flex items-center justify-center gap-2 text-[9.5px] text-faint">
              <span className="font-mono text-muted">{formatCompact(activeConversation.followers)}</span> followers
              <span>·</span>
              <span>{activeConversation.location}</span>
            </div>
            <p className="mt-2 text-left text-[10.5px] leading-relaxed text-muted">{activeConversation.bio}</p>
            <div className="mt-2 flex gap-1">
              <Button variant="subtle" size="xs" block>
                View profile
              </Button>
              <Button variant="outline" size="xs" block onClick={() => assignLabel('Needs follow-up')}>
                Add label
              </Button>
            </div>
          </div>

          <div className="space-y-2.5 p-3">
            <div>
              <p className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-faint">Conversation</p>
              <div className="mt-1.5 space-y-1.5 rounded-lg border border-line/60 bg-app/40 p-2 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-faint">Channel</span>
                  <span className="flex items-center gap-1 text-muted">
                    <PlatformGlyph platform={activeConversation.platform} className="h-2.5 w-2.5" />
                    {PLATFORMS[activeConversation.platform].name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-faint">Type</span>
                  <span className="capitalize text-muted">{activeConversation.kind}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-faint">Sentiment</span>
                  <span className="capitalize text-muted">{activeConversation.sentiment}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-faint">Member since</span>
                  <span className="text-muted">{activeConversation.memberSince}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-faint">Status</span>
                  <span className={activeConversation.status === 'resolved' ? 'text-emerald-300' : 'text-amber-300'}>
                    {activeConversation.status === 'resolved' ? 'Resolved' : 'Open'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-faint">Labels</p>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {activeConversation.labels.map((label) => (
                  <span key={label} className="rounded border border-line/60 bg-raised/50 px-1.5 py-0.5 text-[9.5px] text-muted">
                    {label}
                  </span>
                ))}
                <button
                  onClick={() => assignLabel('Priority')}
                  className="rounded border border-dashed border-line/60 px-1.5 py-0.5 text-[9.5px] text-faint hover:text-ink"
                >
                  + Add
                </button>
              </div>
            </div>

            <Card className="p-2.5">
              <p className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-faint">Post context</p>
              <p className="mt-1 text-[10.5px] font-medium leading-snug text-ink">{activeConversation.postTitle}</p>
              <p className="mt-0.5 line-clamp-3 text-[9.5px] leading-relaxed text-faint">{activeConversation.postExcerpt}</p>
              <div className="mt-1.5 flex items-center gap-1 text-[9px] text-faint">
                <Hash className="h-2.5 w-2.5" /> Engagement 8.2% · 12.4K reach
              </div>
            </Card>

            <div>
              <p className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-faint">Internal notes</p>
              <textarea
                rows={3}
                placeholder="Add context for your team…"
                className="mt-1.5 w-full resize-none rounded-lg border border-line/60 bg-app/40 px-2 py-1.5 text-[10.5px] leading-relaxed text-ink outline-none focus:border-indigo-400/50"
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
