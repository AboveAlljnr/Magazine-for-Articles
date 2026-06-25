interface CategoryNavProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  subcategories?: string[];
  activeSubcategory: string;
  onSubcategoryChange: (sub: string) => void;
}

export function CategoryNav({
  categories,
  activeCategory,
  onCategoryChange,
  subcategories,
  activeSubcategory,
  onSubcategoryChange,
}: CategoryNavProps) {
  return (
    <div className="border-b border-border bg-muted/30">
      {/* Main categories */}
      <nav className="overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8 py-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => onCategoryChange(category)}
                className={`whitespace-nowrap text-sm tracking-wide transition-colors ${
                  activeCategory === category
                    ? 'text-primary border-b-2 border-primary pb-1'
                    : 'text-muted-foreground hover:text-primary'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Subcategory pills — visible only when a non-All category is active */}
      {subcategories && subcategories.length > 0 && (
        <div className="overflow-x-auto border-t border-border/50 bg-background/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-3 py-3">
              <button
                onClick={() => onSubcategoryChange('All')}
                className={`whitespace-nowrap text-xs px-3 py-1 rounded-full transition-colors ${
                  activeSubcategory === 'All'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
                }`}
              >
                All
              </button>
              {subcategories.map((sub) => (
                <button
                  key={sub}
                  onClick={() => onSubcategoryChange(sub)}
                  className={`whitespace-nowrap text-xs px-3 py-1 rounded-full transition-colors ${
                    activeSubcategory === sub
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
