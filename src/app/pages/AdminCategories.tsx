import { useState, useEffect } from 'react';
import { Plus, Trash2, Pencil, Check, X } from 'lucide-react';
import { getCategories, getAllSubcategories, createCategory, updateCategory, deleteCategory, createSubcategory, updateSubcategory, deleteSubcategory } from '../../lib/api';
import type { Category, Subcategory } from '../../lib/types';

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<(Subcategory & { category_name?: string })[]>([]);
  const [loading, setLoading] = useState(true);

  // New category
  const [newCatName, setNewCatName] = useState('');
  const [addingCat, setAddingCat] = useState(false);

  // Editing category name
  const [editingCatId, setEditingCatId] = useState<number | null>(null);
  const [editCatName, setEditCatName] = useState('');

  // New subcategory
  const [newSubName, setNewSubName] = useState('');
  const [newSubCatId, setNewSubCatId] = useState<number>(0);
  const [addingSub, setAddingSub] = useState(false);

  // Delete confirms
  const [deleteCatId, setDeleteCatId] = useState<number | null>(null);
  const [deleteSubId, setDeleteSubId] = useState<number | null>(null);

  function load() {
    setLoading(true);
    Promise.all([
      getCategories(),
      getAllSubcategories(),
    ]).then(([cats, subs]) => {
      setCategories(cats);
      setSubcategories(subs as any);
    }).catch(() => {}).finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleAddCategory() {
    if (!newCatName.trim()) return;
    try {
      await createCategory({ name: newCatName.trim(), slug: slugify(newCatName) });
      setNewCatName('');
      setAddingCat(false);
      load();
    } catch (e) { console.error(e); }
  }

  async function handleRenameCategory(id: number) {
    if (!editCatName.trim()) return;
    try {
      await updateCategory(id, { name: editCatName.trim() });
      setEditingCatId(null);
      load();
    } catch (e) { console.error(e); }
  }

  async function handleDeleteCategory(id: number) {
    try {
      await deleteCategory(id);
      setDeleteCatId(null);
      load();
    } catch (e) { console.error(e); }
  }

  async function handleAddSubcategory() {
    if (!newSubName.trim() || !newSubCatId) return;
    try {
      await createSubcategory({ name: newSubName.trim(), slug: slugify(newSubName), category_id: newSubCatId });
      setNewSubName('');
      setNewSubCatId(0);
      setAddingSub(false);
      load();
    } catch (e) { console.error(e); }
  }

  async function handleDeleteSubcategory(id: number) {
    try {
      await deleteSubcategory(id);
      setDeleteSubId(null);
      load();
    } catch (e) { console.error(e); }
  }

  if (loading) {
    return <div className="text-sm text-muted-foreground py-8 text-center">Loading categories…</div>;
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Categories */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">Categories</h3>
          <button
            onClick={() => setAddingCat(!addingCat)}
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>

        {addingCat && (
          <div className="flex gap-2">
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
              placeholder="Category name"
              className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-input-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
            <button onClick={handleAddCategory} className="p-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90">
              <Check className="w-4 h-4" />
            </button>
            <button onClick={() => setAddingCat(false)} className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="space-y-1.5">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-card border border-border rounded-lg px-4 py-2.5 flex items-center justify-between group">
              {editingCatId === cat.id ? (
                <div className="flex gap-2 flex-1 mr-2">
                  <input
                    type="text"
                    value={editCatName}
                    onChange={(e) => setEditCatName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRenameCategory(cat.id)}
                    className="flex-1 px-2 py-1 rounded border border-border bg-input-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    autoFocus
                  />
                  <button onClick={() => handleRenameCategory(cat.id)} className="p-1 text-primary hover:opacity-80"><Check className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setEditingCatId(null)} className="p-1 text-muted-foreground hover:text-foreground"><X className="w-3.5 h-3.5" /></button>
                </div>
              ) : (
                <>
                  <span className="text-sm text-foreground">{cat.name}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => { setEditingCatId(cat.id); setEditCatName(cat.name); }}
                      className="p-1 text-muted-foreground hover:text-primary transition-colors"
                      title="Rename"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteCatId(cat.id)}
                      className="p-1 text-muted-foreground hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Delete category confirm */}
        {deleteCatId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm">
            <div className="bg-card border border-border rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
              <h3 className="text-sm text-foreground font-medium mb-2">Delete category?</h3>
              <p className="text-xs text-muted-foreground mb-5">All subcategories will also be deleted.</p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setDeleteCatId(null)} className="px-4 py-2 text-sm rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
                <button onClick={() => handleDeleteCategory(deleteCatId)} className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors">Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Subcategories */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">Subcategories</h3>
          <button
            onClick={() => setAddingSub(!addingSub)}
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>

        {addingSub && (
          <div className="flex gap-2 flex-wrap">
            <select
              value={newSubCatId}
              onChange={(e) => setNewSubCatId(Number(e.target.value))}
              className="px-3 py-1.5 rounded-lg border border-border bg-input-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value={0}>Select category</option>
              {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
            <input
              type="text"
              value={newSubName}
              onChange={(e) => setNewSubName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddSubcategory()}
              placeholder="Subcategory name"
              className="flex-1 min-w-[140px] px-3 py-1.5 rounded-lg border border-border bg-input-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button onClick={handleAddSubcategory} className="p-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90"><Check className="w-4 h-4" /></button>
            <button onClick={() => setAddingSub(false)} className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
          </div>
        )}

        <div className="space-y-1.5">
          {subcategories.map((sub) => (
            <div key={sub.id} className="bg-card border border-border rounded-lg px-4 py-2.5 flex items-center justify-between group">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{(sub as any).categories?.name || ''}</span>
                <span className="text-sm text-foreground">{sub.name}</span>
              </div>
              <button
                onClick={() => setDeleteSubId(sub.id)}
                className="p-1 text-muted-foreground hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Delete subcategory confirm */}
        {deleteSubId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm">
            <div className="bg-card border border-border rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
              <h3 className="text-sm text-foreground font-medium mb-2">Delete subcategory?</h3>
              <p className="text-xs text-muted-foreground mb-5">Articles in this subcategory will be set to none.</p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setDeleteSubId(null)} className="px-4 py-2 text-sm rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
                <button onClick={() => handleDeleteSubcategory(deleteSubId)} className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors">Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}