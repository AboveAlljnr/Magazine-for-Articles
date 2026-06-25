import { useState, useEffect } from 'react';
import { ThumbsUp, Send } from 'lucide-react';
import { getComments as fetchComments, addComment, likeComment } from '../../lib/api';

interface CommentItem {
  id: number;
  body: string;
  likes_count: number;
  created_at: string;
  profiles: { display_name: string; avatar_url: string | null };
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

export function CommentsSection({ articleId, userName = 'Reader', userId }: CommentsSectionProps) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set());
  const [draft, setDraft] = useState('');
  const [posting, setPosting] = useState(false);
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
      setComments((prev) => [newComment as CommentItem, ...prev]);
      setDraft('');
    } catch {}
    setPosting(false);
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
      ) : (
        <div className="space-y-7">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground text-sm font-medium flex-shrink-0">
                {(comment.profiles?.display_name || '?').charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-sm font-medium text-foreground">
                    {comment.profiles?.display_name || 'Anonymous'}
                  </span>
                  <span className="text-xs text-muted-foreground">{timeAgo(comment.created_at)}</span>
                </div>
                <p className="text-sm text-foreground/85 leading-relaxed">{comment.body}</p>
                <button
                  onClick={() => toggleLike(comment.id)}
                  className={`flex items-center gap-1.5 mt-2 text-xs transition-colors ${
                    likedIds.has(comment.id) ? 'text-primary' : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  {comment.likes_count}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
