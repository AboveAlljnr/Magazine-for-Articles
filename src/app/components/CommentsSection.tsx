import { useState, useEffect } from 'react';
import { ThumbsUp, Send } from 'lucide-react';
import { getComments as fetchComments, addComment, likeComment } from '../../lib/api';

interface CommentItem {
  id: number;
  body: string;
  likes_count: number;
  created_at: string;
  parent_id: number | null;
  profiles: { display_name: string; avatar_url: string | null };
}

interface CommentNode extends CommentItem {
  replies: CommentNode[];
}

interface CommentsSectionProps {
  articleId: number;
  userName?: string;
  userId?: string;
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return days === 1 ? '1 day ago' : `${days} days ago`;
}

function buildTree(comments: CommentItem[]): CommentNode[] {
  const nodes = new Map<number, CommentNode>();
  for (const c of comments) nodes.set(c.id, { ...c, replies: [] });
  const roots: CommentNode[] = [];
  for (const c of comments) {
    const node = nodes.get(c.id)!;
    if (c.parent_id && nodes.has(c.parent_id)) nodes.get(c.parent_id)!.replies.push(node);
    else roots.push(node);
  }
  return roots;
}

export function CommentsSection({ articleId, userName = 'Reader', userId }: CommentsSectionProps) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set());
  const [draft, setDraft] = useState('');
  const [replyToId, setReplyToId] = useState<number | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<number, string>>({});
  const [posting, setPosting] = useState(false);
  const [replyPosting, setReplyPosting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments(articleId)
      .then((data) => setComments(data as CommentItem[]))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [articleId]);

  function toggleLike(id: number) {
    if (likedIds.has(id)) return;
    setLikedIds((prev) => new Set(prev).add(id));
    likeComment(id).catch(() => {});
    setComments((cs) => cs.map((c) => c.id === id ? { ...c, likes_count: c.likes_count + 1 } : c));
  }

  async function handlePost(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim() || !userId) return;
    setPosting(true);
    try {
      const newComment = await addComment(articleId, userId, draft.trim());
      setComments((prev) => [...prev, newComment as CommentItem]);
      setDraft('');
    } catch {}
    setPosting(false);
  }

  async function handleReply(commentId: number) {
    const body = (replyDrafts[commentId] || '').trim();
    if (!body || !userId) return;
    setReplyPosting(true);
    try {
      const newComment = await addComment(articleId, userId, body, commentId);
      setComments((prev) => [...prev, newComment as CommentItem]);
      setReplyDrafts((prev) => { const next = { ...prev }; delete next[commentId]; return next; });
      setReplyToId(null);
    } catch {}
    setReplyPosting(false);
  }

  const tree = buildTree(comments);

  function renderComment(comment: CommentNode, depth: number) {
    const replyDraft = replyDrafts[comment.id] || '';
    return (
      <div key={comment.id} className={depth > 0 ? 'mt-4' : ''}>
        <div className={`flex gap-3 ${depth > 0 ? 'pl-4 sm:pl-6 border-l-2 border-border/70 ml-2' : ''}`}>
          <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground text-sm font-medium flex-shrink-0">
            {(comment.profiles?.display_name || '?').charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 mb-1 flex-wrap">
              <span className="text-sm font-medium text-foreground">
                {comment.profiles?.display_name || 'Anonymous'}
              </span>
              <span className="text-xs text-muted-foreground">{timeAgo(comment.created_at)}</span>
            </div>
            <p className="text-sm text-foreground/85 leading-relaxed">{comment.body}</p>
            <div className="flex items-center gap-4 mt-1">
              <button
                onClick={() => toggleLike(comment.id)}
                className={`flex items-center gap-1.5 text-xs transition-colors p-2 -ml-2 ${
                  likedIds.has(comment.id) ? 'text-primary' : 'text-muted-foreground hover:text-primary'
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                {comment.likes_count}
              </button>
              {userId && (
                <button
                  onClick={() => {
                    if (replyToId === comment.id) setReplyToId(null);
                    else setReplyToId(comment.id);
                  }}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  Reply
                </button>
              )}
            </div>

            {replyToId === comment.id && (
              <div className="mt-3 mb-2">
                <textarea
                  value={replyDraft}
                  onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [comment.id]: e.target.value }))}
                  placeholder={`Reply to ${comment.profiles?.display_name || 'comment'}…`}
                  rows={2}
                  autoFocus
                  className="w-full px-3 py-2 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground/60 resize-none text-sm"
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={() => { setReplyToId(null); setReplyDrafts((prev) => { const next = { ...prev }; delete next[comment.id]; return next; }); }}
                    className="px-3 py-1.5 text-xs rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleReply(comment.id)}
                    disabled={!replyDraft.trim() || replyPosting}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40"
                  >
                    <Send className="w-3 h-3" />
                    {replyPosting ? 'Posting…' : 'Reply'}
                  </button>
                </div>
              </div>
            )}

            {comment.replies.length > 0 && (
              <div className="mt-2">
                {comment.replies.map((reply) => renderComment(reply, depth + 1))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="mt-14">
      <h2 className="text-2xl text-foreground mb-8">
        Conversation{' '}
        <span className="text-sm text-muted-foreground font-normal ml-1">
          {comments.length} comment{comments.length !== 1 ? 's' : ''}
        </span>
      </h2>

      {userId && (
        <form onSubmit={handlePost} className="mb-10">
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium flex-shrink-0 mt-1">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Share your thoughts…"
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground/60 resize-none text-sm"
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={!draft.trim() || posting}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
                >
                  <Send className="w-3.5 h-3.5" />
                  {posting ? 'Posting…' : 'Post comment'}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8">No comments yet. Start the conversation.</p>
      ) : (
        <div className="space-y-7">
          {tree.slice().reverse().map((comment) => renderComment(comment, 0))}
        </div>
      )}
    </section>
  );
}
