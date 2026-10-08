import React, { useEffect, useState, useMemo } from 'react';
import {
  Clock,
  TrendingUp,
  X,
  Trash2,
  Sparkles,
  Search,
  ArrowRight,
  Flame,
} from 'lucide-react';
import {
  RecentSearchItem,
  getRecentSearches,
  removeRecentSearch,
  clearAllRecentSearches,
  getTopSearches,
  DEFAULT_SUGGESTED_SEARCHES,
  RECENT_SEARCHES_EVENT,
} from '../services/recentSearchesService';
import { useTranslation } from '../i18n/LanguageContext';

interface RecentSearchesDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  currentQuery: string;
  onSelectQuery: (query: string) => void;
}

export const RecentSearchesDropdown: React.FC<RecentSearchesDropdownProps> = ({
  isOpen,
  onClose,
  currentQuery,
  onSelectQuery,
}) => {
  const { t, language } = useTranslation();
  const [searches, setSearches] = useState<RecentSearchItem[]>(() => getRecentSearches());

  // Listen to cross-tab or local updates to recent searches
  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<RecentSearchItem[]>;
      if (customEvent.detail) {
        setSearches(customEvent.detail);
      } else {
        setSearches(getRecentSearches());
      }
    };

    window.addEventListener(RECENT_SEARCHES_EVENT, handleUpdate);
    return () => {
      window.removeEventListener(RECENT_SEARCHES_EVENT, handleUpdate);
    };
  }, []);

  const handleRemove = (e: React.MouseEvent, query: string) => {
    e.stopPropagation();
    const updated = removeRecentSearch(query);
    setSearches(updated);
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearAllRecentSearches();
    setSearches([]);
  };

  // Top searches with count > 1
  const topSearches = useMemo(() => getTopSearches(searches, 4), [searches]);

  // If user is currently typing, filter recent searches and suggestions
  const filterNormalized = currentQuery.trim().toLowerCase();

  const matchingSearches = useMemo(() => {
    if (!filterNormalized) return searches.slice(0, 7);
    return searches
      .filter((s) => s.query.toLowerCase().includes(filterNormalized))
      .slice(0, 6);
  }, [searches, filterNormalized]);

  const matchingSuggestions = useMemo(() => {
    if (!filterNormalized) return DEFAULT_SUGGESTED_SEARCHES;
    return DEFAULT_SUGGESTED_SEARCHES.filter((item) =>
      item.toLowerCase().includes(filterNormalized)
    );
  }, [filterNormalized]);

  if (!isOpen) return null;

  return (
    <div
      id="recent-searches-dropdown"
      className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl border border-white/15 bg-[#2A3042]/95 backdrop-blur-xl shadow-2xl shadow-black/80 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
    >
      <div className="p-3.5 space-y-3.5 max-h-[380px] overflow-y-auto subtle-vertical-scroll">
        
        {/* CASE 1: Filtered matches when typing */}
        {filterNormalized.length > 0 ? (
          <div>
            <div className="flex items-center justify-between pb-1.5 border-b border-white/10 text-[11px] font-bold text-[#A6A7B2]">
              <span className="flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-[#25F4EE]" />
                <span>
                  {language === 'en' ? 'Matching Recent Searches' : 'Correspondências Recentes'}
                </span>
              </span>
              <span className="text-[10px] text-[#757788]">
                {matchingSearches.length} {language === 'en' ? 'found' : 'encontradas'}
              </span>
            </div>

            {matchingSearches.length > 0 ? (
              <div className="mt-2 space-y-1">
                {matchingSearches.map((item) => (
                  <div
                    key={item.query}
                    onClick={() => {
                      onSelectQuery(item.query);
                      onClose();
                    }}
                    className="group flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.03] hover:bg-[#25F4EE]/10 border border-transparent hover:border-[#25F4EE]/30 text-xs text-white transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Clock className="w-3.5 h-3.5 text-[#A6A7B2] group-hover:text-[#25F4EE] shrink-0 transition-colors" />
                      <span className="font-semibold truncate text-white group-hover:text-[#25F4EE]">
                        {item.query}
                      </span>
                      {item.count > 1 && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-full shrink-0">
                          <Flame className="w-2.5 h-2.5" />
                          {item.count}x
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handleRemove(e, item.query)}
                        className="p-1 text-[#757788] hover:text-rose-400 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                        title={t('recent_searches_remove')}
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <ArrowRight className="w-3.5 h-3.5 text-[#A6A7B2] group-hover:text-[#25F4EE] group-hover:translate-x-0.5 transition" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#757788] py-2 px-1">
                {language === 'en'
                  ? `No previous searches match "${currentQuery}". Press Enter to search.`
                  : `Nenhuma busca salva corresponde a "${currentQuery}". Pressione Enter para buscar.`}
              </p>
            )}

            {/* Also show matching suggested terms if available */}
            {matchingSuggestions.length > 0 && (
              <div className="mt-3 pt-2.5 border-t border-white/10">
                <span className="text-[11px] font-bold text-[#A6A7B2] block mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#FE2C55]" />
                  <span>{t('recent_searches_popular_suggestions')}</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {matchingSuggestions.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => {
                        onSelectQuery(sug);
                        onClose();
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#161823] hover:bg-[#202230] text-[#C5C6D0] hover:text-white border border-white/5 hover:border-[#25F4EE]/30 transition cursor-pointer"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* CASE 2: Input is empty, show Top Searches, Recent History & Quick Suggestions */
          <>
            {/* Top / Most Used Searches Section (if any has count > 1) */}
            {topSearches.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-amber-400 uppercase tracking-wider mb-2">
                  <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{t('recent_searches_top')}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {topSearches.map((item) => (
                    <button
                      key={`top-${item.query}`}
                      type="button"
                      onClick={() => {
                        onSelectQuery(item.query);
                        onClose();
                      }}
                      className="group flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-bold text-amber-200 hover:text-white transition cursor-pointer"
                    >
                      <span>{item.query}</span>
                      <span className="text-[10px] font-black text-amber-400 bg-amber-950/80 px-1.5 py-0.2 rounded-full">
                        {item.count}x
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Searches List */}
            <div>
              <div className="flex items-center justify-between pb-1.5 border-b border-white/10 text-[11px] font-bold text-[#A6A7B2]">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#25F4EE]" />
                  <span>{t('recent_searches_title')}</span>
                </span>
                {searches.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="flex items-center gap-1 text-[10px] text-[#757788] hover:text-rose-400 transition cursor-pointer font-medium"
                    title={t('recent_searches_clear')}
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>{t('recent_searches_clear')}</span>
                  </button>
                )}
              </div>

              {searches.length > 0 ? (
                <div className="mt-2 space-y-1">
                  {searches.slice(0, 6).map((item) => (
                    <div
                      key={item.query}
                      onClick={() => {
                        onSelectQuery(item.query);
                        onClose();
                      }}
                      className="group flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.02] hover:bg-[#25F4EE]/10 border border-transparent hover:border-[#25F4EE]/30 text-xs text-white transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Clock className="w-3.5 h-3.5 text-[#A6A7B2] group-hover:text-[#25F4EE] shrink-0 transition-colors" />
                        <span className="font-semibold truncate text-white group-hover:text-[#25F4EE]">
                          {item.query}
                        </span>
                        {item.count > 1 && (
                          <span className="text-[10px] font-bold text-amber-400/90 bg-amber-500/10 px-1.5 py-0.2 rounded shrink-0">
                            {item.count} {t('recent_searches_times')}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => handleRemove(e, item.query)}
                          className="p-1 text-[#757788] hover:text-rose-400 opacity-60 hover:opacity-100 transition cursor-pointer"
                          title={t('recent_searches_remove')}
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <ArrowRight className="w-3.5 h-3.5 text-[#A6A7B2] group-hover:text-[#25F4EE] group-hover:translate-x-0.5 transition" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-2.5 px-1 text-center">
                  <p className="text-xs text-[#757788]">
                    {t('recent_searches_empty')}
                  </p>
                </div>
              )}
            </div>

            {/* Viral Suggestions / Niches Shortcuts */}
            <div className="pt-2 border-t border-white/10">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#A6A7B2] mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#FE2C55]" />
                <span>{t('recent_searches_popular_suggestions')}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {DEFAULT_SUGGESTED_SEARCHES.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      onSelectQuery(term);
                      onClose();
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#161823] hover:bg-[#25F4EE]/15 text-[#C5C6D0] hover:text-[#25F4EE] border border-white/5 hover:border-[#25F4EE]/30 transition cursor-pointer"
                  >
                    <TrendingUp className="w-3 h-3 text-[#25F4EE]" />
                    <span>{term}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
};
