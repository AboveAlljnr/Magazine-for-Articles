import { useState, useEffect } from 'react';
import { Plus, Pencil, X, Check } from 'lucide-react';
import { getAuthors, createAuthor, updateAuthor } from '../../lib/api';
import type { Author } from '../../lib/types';

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export function AdminAuthors() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  // New author form
  const [newName, setNewName] = useState('');
  const [newBio, setNewBio] = useState('');
  const [newAvatar, setNewAvatar] = useState('');

  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatar, setEditAvatar] = useState('');

  function load() {
    setLoading(true);
    getAuthors().then(setAuthors).catch(() => {}).finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleCreate() {
    if (!newName.trim()) return;
    try {
      await createAuthor({
        name: newName.trim(),
        slug: slugify(newName),
        bio: newBio.trim(),
        avatar_url: newAvatar.trim() || undefined,
      });
      setNewName(''); setNewBio(''); setNewAvatar('');
      setAdding(false);
      load();
    } catch (e) { console.error(e); }
  }

  async function handleUpdate(id: number) {
    if (!editName.trim()) return;
    try {
      await updateAuthor(id, {
        name: editName.trim(),
        bio: editBio.trim(),
        avatar_url: editAvatar.trim() || undefined,
      });
      setEditingId(null);
      load();
    } catch (e) { console.error(e); }
  }

  if (loading) {
    return <div className="text-sm text-muted-foreground py-8 text-center">Loading authors…</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Authors</h3>
        <button onClick={() => setAdding(!adding)} className="flex items-center gap-1 text-sm text-primary hover:underline">
          <Plus className="w-3.5 h-3.5" /> Add Author
        </button>
      </div>

      {/* Add form */}
      {adding && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Author name"
            className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <textarea
            value={newBio}
            onChange={(e) => setNewBio(e.target.value)}
            placeholder="Bio (optional)"
            rows={2}
            className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
          <input
            type="text"
            value={newAvatar}
            onChange={(e) => setNewAvatar(e.target.value)}
            placeholder="Avatar URL (optional)"
            className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <div className="flex gap-2 justify-end">
            <button onClick={() => setAdding(false)} className="px-4 py-2 text-sm rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
            <button onClick={handleCreate} className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity">Create</button>
          </div>
        </div>
      )}

      {/* Author list with inline edit */}
      <div className="grid sm:grid-cols-2 gap-4">
        {authors.map((author) => (
          <div key={author.id} className="bg-card border border-border rounded-xl p-4">
            {editingId === author.id ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
                <input
                  type="text"
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  placeholder="Avatar URL"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setEditingId(null)} className="px-4 py-2 text-sm rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
                  <button onClick={() => handleUpdate(author.id)} className="flex items-center gap-1 px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"><Check className="w-3.5 h-3.5" /> Save</button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium text-sm flex-shrink-0">
                  {author.avatar_url ? (
                    <img src={author.avatar_url} alt={author.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    author.name.charAt(0)
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{author.name}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{author.bio || 'No bio'}</p>
                  {author.slug && <p className="text-xs text-muted-foreground/60 mt-0.5 font-mono">/{author.slug}</p>}
                </div>
                <button
                  onClick={() => { setEditingId(author.id); setEditName(author.name); setEditBio(author.bio); setEditAvatar(author.avatar_url || ''); }}
                  className="p-1.5 text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
                  title="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}