import { useState, useEffect } from 'react';
import { Trash2, Eye, EyeOff } from 'lucide-react';
import { getAllComments, adminDeleteComment, updateCommentStatus } from '../../lib/api';

export function AdminComments() {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  function load() {
    setLoading(true);
    getAllComments().then(setComments).catch(() => setComments([])).finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: number) {
    try {
      await adminDeleteComment(id);
      setDeleteId(null);
      load();
    } catch (e) { console.error(e); }
  }

  async function handleToggleStatus(comment: any) {
    try {
      await updateCommentStatus(comment.id, comment.status === 'hidden' ? 'approved' : 'hidden');
      load();
    } catch (e) { console.error(e); }
  }

  if (loading) {
    return <div className="text-sm text-muted-foreground py-8 text-center">Loading comments…</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Comments ({comments.length})</h3>
      </div>

      {/* Delete confirm */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-sm text-foreground font-medium mb-2">Delete comment?</h3>
            <p className="text-xs text-muted-foreground mb-5">This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No comments yet.</p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-card border border-border rounded-xl p-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground text-xs font-medium flex-shrink-0">
                {comment.profiles?.display_name?.charAt(0) || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-foreground">{comment.profiles?.display_name || 'Unknown'}</span>
                  {comment.parent_id && (
                    <span className="text-[10px] uppercase tracking-wider bg-muted text-muted-foreground px-1.5 py-0.5 rounded">reply</span>
                  )}
                  {comment.status === 'hidden' && (
                    <span className="text-[10px] uppercase tracking-wider bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300 px-1.5 py-0.5 rounded">hidden</span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {new Date(comment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  </span>
                  <span className="text-xs text-muted-foreground/60">on</span>
                  <span className="text-xs text-primary">{comment.articles?.title || 'Unknown article'}</span>
                </div>
                <p className={`text-sm mt-1.5 ${comment.status === 'hidden' ? 'text-muted-foreground/60 line-through' : 'text-muted-foreground'}`}>{comment.body}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span>{comment.likes_count} likes</span>
                </div>
              </div>
              <button
                onClick={() => handleToggleStatus(comment)}
                className={`p-1.5 transition-colors flex-shrink-0 ${comment.status === 'hidden' ? 'text-primary hover:text-foreground' : 'text-muted-foreground hover:text-primary'}`}
                title={comment.status === 'hidden' ? 'Show comment' : 'Hide comment'}
              >
                {comment.status === 'hidden' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setDeleteId(comment.id)}
                className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors flex-shrink-0"
                title="Delete comment"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}