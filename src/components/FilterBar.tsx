import React from 'react';
import { 
  Trophy, 
  Activity, 
  Shield, 
  Zap, 
  Waves, 
  Sparkles, 
  GraduationCap, 
  Music, 
  Flame, 
  LayoutGrid, 
  Columns,
  FilterX,
  Landmark,
  Vote,
  Radio,
  Scale,
  Users
} from 'lucide-react';
import { CategoryInfo, SupportedLanguage, CreatorProfile } from '../types';

interface FilterBarProps {
  categories: CategoryInfo[];
  selectedCategory: string;
  onSelectCategory: (catId: string) => void;
  creators: CreatorProfile[];
  selectedPhotographer: string;
  onSelectPhotographer: (creatorId: string) => void;
  selectedDateRange: string;
  onSelectDateRange: (range: string) => void;
  selectedTag: string;
  onSelectTag: (tag: string) => void;
  sortBy: 'newest' | 'downloads' | 'likes';
  onSelectSortBy: (sort: 'newest' | 'downloads' | 'likes') => void;
  viewMode: 'masonry' | 'grid';
  onToggleViewMode: (mode: 'masonry' | 'grid') => void;
  availableTags: string[];
  totalResults: number;
  onResetFilters: () => void;
  currentLang: SupportedLanguage;
  onlyFavorites: boolean;
  onToggleOnlyFavorites: () => void;
  onlyCollaborations?: boolean;
  onToggleOnlyCollaborations?: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  sortBy,
  onSelectSortBy,
  viewMode,
  onToggleViewMode,
  totalResults,
  onResetFilters,
  selectedPhotographer,
  onlyCollaborations = false,
  onToggleOnlyCollaborations = () => {}
}) => {
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Landmark': return <Landmark className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
      case 'Sparkles': return <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
      case 'Vote': return <Vote className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
      case 'Radio': return <Radio className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
      case 'Scale': return <Scale className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
      case 'Trophy': return <Trophy className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
      case 'Activity': return <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
      case 'Shield': return <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
      case 'Zap': return <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
      case 'Waves': return <Waves className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
      case 'GraduationCap': return <GraduationCap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
      case 'Music': return <Music className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
      default: return <Flame className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
    }
  };

  const hasActiveFilters = selectedCategory !== 'all' || selectedPhotographer !== 'all' || onlyCollaborations;

  return (
    <div id="gallery-filter-toolbar" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-3">
      
      {/* Category Navigation - Apple Glass Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              id={`filter-category-${cat.id}`}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap transition-all duration-300 shrink-0 active:scale-95 ${
                isSelected
                  ? 'bg-black text-white dark:bg-white dark:text-stone-950 border border-black dark:border-white shadow-md font-semibold'
                  : 'glass-pill text-stone-700 dark:text-stone-300 hover:bg-white/90 dark:hover:bg-stone-800/90 font-medium'
              }`}
            >
              <span className={isSelected ? 'brightness-200 dark:brightness-0' : ''}>
                {getCategoryIcon(cat.icon)}
              </span>
              <span>{cat.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono tabular-nums ${
                isSelected 
                  ? 'bg-white/20 dark:bg-black/20 text-white dark:text-stone-950' 
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400'
              }`}>
                {cat.photoCount}
              </span>
            </button>
          );
        })}
      </div>

      {/* Secondary Controls Bar with Collaborative Shoots Toggle */}
      <div className="flex items-center justify-between gap-3 pt-2 border-t border-stone-200/60 dark:border-white/10 text-xs">
        <div className="flex items-center gap-3">
          <span className="text-stone-500 dark:text-stone-400 text-xs font-mono tabular-nums">
            {totalResults} {totalResults === 1 ? 'capture' : 'captures'}
          </span>

          {/* Quick Toggle for Collaborative Shoots */}
          <button
            onClick={onToggleOnlyCollaborations}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 active:scale-95 ${
              onlyCollaborations
                ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                : 'glass-pill text-stone-600 dark:text-stone-300 hover:text-emerald-700 dark:hover:text-emerald-400'
            }`}
          >
            <Users className="w-3 h-3 text-emerald-500" />
            <span>Collaborations Only</span>
          </button>

          {hasActiveFilters && (
            <button
              id="filter-reset-all-btn"
              onClick={onResetFilters}
              className="flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-300 underline font-medium transition-colors"
            >
              <FilterX className="w-3 h-3" />
              <span>Clear Filter</span>
            </button>
          )}
        </div>

        {/* Right Side: Sort order & Grid / Masonry toggle */}
        <div className="flex items-center gap-2.5">
          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 glass-pill rounded-full px-3 py-1 shadow-2xs">
            <span className="text-stone-400 dark:text-stone-500 text-[11px]">Sort:</span>
            <select
              id="filter-sort-select"
              value={sortBy}
              onChange={(e) => onSelectSortBy(e.target.value as 'newest' | 'downloads' | 'likes')}
              className="bg-transparent text-stone-900 dark:text-stone-100 text-xs font-medium focus:outline-none cursor-pointer"
            >
              <option value="newest" className="dark:bg-stone-900">Latest Uploads</option>
              <option value="downloads" className="dark:bg-stone-900">Most Downloaded</option>
              <option value="likes" className="dark:bg-stone-900">Most Favorited</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="hidden sm:flex items-center p-0.5 rounded-full glass-pill">
            <button
              id="filter-view-masonry-btn"
              onClick={() => onToggleViewMode('masonry')}
              className={`p-1.5 rounded-full transition-all duration-300 ${
                viewMode === 'masonry'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-xs'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
              title="Masonry View"
            >
              <Columns className="w-3.5 h-3.5" />
            </button>
            <button
              id="filter-view-grid-btn"
              onClick={() => onToggleViewMode('grid')}
              className={`p-1.5 rounded-full transition-all duration-300 ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-xs'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
              title="Standard Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
