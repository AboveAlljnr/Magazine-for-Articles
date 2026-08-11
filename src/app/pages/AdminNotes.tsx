import { useState, useEffect } from 'react';
import { Trash2, Pencil, Film, Plus } from 'lucide-react';
import { getNotes, createNote, updateNote, deleteNote } from '../../lib/api';

interface Note {
  id: number;
  body: string;
  video_url: string | null;
  created_at: string;
}

export function AdminNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editBody, setEditBody] = useState('');
  const [editVideo, setEditVideo] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  function load() {
    setLoading(true);
    getNotes().then(setNotes).catch(() => setNotes([])).finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleCreate() {
    if (!body.trim()) return;
    setSaving(true);
    try {
      await createNote({ body: body.trim(), video_url: videoUrl.trim() || null });
      setBody('');
      setVideoUrl('');
      load();
    } catch (e) { console.error(e); }
    setSaving(false);
  }

  async function handleUpdate(id: number) {
    if (!editBody.trim()) return;
    setSaving(true);
    try {
      await updateNote(id, { body: editBody.trim(), video_url: editVideo.trim() || null });
      setEditingId(null);
      load();
    } catch (e) { console.error(e); }
    setSaving(false);
  }

  async function handleDelete(id: number) {
    try {
      await deleteNote(id);
      setDeleteId(null);
      load();
    } catch (e) { console.error(e); }
  }

  return (
    <div className="space-y-6">
      {/* Create */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-medium text-foreground mb-4">New note</h3>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          placeholder="Write a note for the community…"
          className="w-full px-3 py-2.5 rounded-lg border border-border bg-input-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
        <div className="flex flex-col sm:flex-row gap-3 mt-3">
          <div className="flex-1 relative">
            <Film className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Optional YouTube / Vimeo link"
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-input-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            onClick={handleCreate}
            disabled={!body.trim() || saving}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            <Plus className="w-3.5 h-3.5" />
            {saving ? 'Adding…' : 'Add note'}
          </button>
        </div>
      </div>

      {/* Delete confirm */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-sm text-foreground font-medium mb-2">Delete note?</h3>
            <p className="text-xs text-muted-foreground mb-5">This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Published notes ({notes.length})</h3>
        {loading ? (
          <p className="text-sm text-muted-foreground py-6 text-center">Loading notes…</p>
        ) : notes.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">No notes yet. Add your first one above.</p>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div key={note.id} className="bg-card border border-border rounded-xl p-4">
                {editingId === note.id ? (
                  <div>
                    <textarea
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-input-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                    <div className="flex flex-col sm:flex-row gap-2 mt-2">
                      <input
                        type="text"
                        value={editVideo}
                        onChange={(e) => setEditVideo(e.target.value)}
                        placeholder="YouTube / Vimeo link"
                        className="flex-1 px-3 py-2 rounded-lg border border-border bg-input-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => handleUpdate(note.id)} disabled={!editBody.trim() || saving} className="px-3 py-2 text-xs rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40">
                          {saving ? 'Saving…' : 'Save'}
                        </button>
                        <button onClick={() => setEditingId(null)} className="px-3 py-2 text-xs rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors">
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start gap-3">
                      <p className="flex-1 text-sm text-foreground/85 leading-relaxed whitespace-pre-line">{note.body}</p>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => { setEditingId(note.id); setEditBody(note.body); setEditVideo(note.video_url || ''); }}
                          className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteId(note.id)} className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span>{new Date(note.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      {note.video_url && (
                        <span className="flex items-center gap-1"><Film className="w-3 h-3" />video</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
