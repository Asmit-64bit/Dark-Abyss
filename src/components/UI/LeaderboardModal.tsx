import React, { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '../../store/gameStore';
import { apiClient, type LeaderboardEntry } from '../../lib/apiClient';
import { Trophy, User, X, RefreshCw, Target, ShieldCheck, Flame } from 'lucide-react';
import { playTerminalBlip } from '../../utils/soundEffects';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LOCAL_LEADERBOARD_KEY = 'abyss-leaderboard-cache-v1';

export const DEFAULT_BASELINE_OPERATORS: LeaderboardEntry[] = [
  {
    rank: 1,
    operator_name: 'DR_ARIS_THORNE',
    points: 14850,
    score: 14850,
    solo_solves_count: 14,
    unlocked_level: 5,
    completed_levels: [1, 2, 3, 4, 5],
    achievements_count: 8,
    min_sanity_recorded: 92,
  },
  {
    rank: 2,
    operator_name: 'CIPHER_NEXUS',
    points: 12400,
    score: 12400,
    solo_solves_count: 12,
    unlocked_level: 5,
    completed_levels: [1, 2, 3, 4, 5],
    achievements_count: 7,
    min_sanity_recorded: 85,
  },
  {
    rank: 3,
    operator_name: 'OPERATOR_VANCE',
    points: 9850,
    score: 9850,
    solo_solves_count: 9,
    unlocked_level: 4,
    completed_levels: [1, 2, 3, 4],
    achievements_count: 6,
    min_sanity_recorded: 78,
  },
  {
    rank: 4,
    operator_name: 'NULL_POINTER_07',
    points: 8200,
    score: 8200,
    solo_solves_count: 8,
    unlocked_level: 4,
    completed_levels: [1, 2, 3, 4],
    achievements_count: 5,
    min_sanity_recorded: 96,
  },
  {
    rank: 5,
    operator_name: 'SECTOR_ARCHIVIST',
    points: 6450,
    score: 6450,
    solo_solves_count: 6,
    unlocked_level: 3,
    completed_levels: [1, 2, 3],
    achievements_count: 4,
    min_sanity_recorded: 88,
  },
  {
    rank: 6,
    operator_name: 'SYNTAX_SHADOW',
    points: 5100,
    score: 5100,
    solo_solves_count: 5,
    unlocked_level: 3,
    completed_levels: [1, 2, 3],
    achievements_count: 4,
    min_sanity_recorded: 71,
  },
  {
    rank: 7,
    operator_name: 'GHOST_PROTOCOL',
    points: 3900,
    score: 3900,
    solo_solves_count: 4,
    unlocked_level: 2,
    completed_levels: [1, 2],
    achievements_count: 3,
    min_sanity_recorded: 82,
  },
  {
    rank: 8,
    operator_name: 'ECHO_RUNNER_99',
    points: 2750,
    score: 2750,
    solo_solves_count: 3,
    unlocked_level: 2,
    completed_levels: [1, 2],
    achievements_count: 2,
    min_sanity_recorded: 90,
  },
  {
    rank: 9,
    operator_name: 'RECON_SENTRY',
    points: 1600,
    score: 1600,
    solo_solves_count: 2,
    unlocked_level: 1,
    completed_levels: [1],
    achievements_count: 1,
    min_sanity_recorded: 65,
  },
  {
    rank: 10,
    operator_name: 'INIT_RUNNER_01',
    points: 850,
    score: 850,
    solo_solves_count: 1,
    unlocked_level: 1,
    completed_levels: [1],
    achievements_count: 1,
    min_sanity_recorded: 100,
  },
];

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ isOpen, onClose }) => {
  const {
    operatorName,
    score,
    soloSolvesCount,
    unlockedLevel,
    completedLevels,
    achievements,
    minSanityRecorded,
  } = useGameStore();

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterMode, setFilterMode] = useState<'score' | 'solo' | 'sanity'>('score');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLeaderboard = useCallback(async () => {
    setIsLoading(true);
    try {
      let apiEntries: LeaderboardEntry[] = [];

      // 1. Fetch from server API
      try {
        const res = await apiClient.getLeaderboard(50);
        if (res?.leaderboard && Array.isArray(res.leaderboard) && res.leaderboard.length > 0) {
          apiEntries = res.leaderboard;
        }
      } catch (netErr) {
        console.warn('[Leaderboard] Network fetch notice, attempting cache/baseline:', netErr);
      }

      // 2. Fallback to localStorage cache (ignore single-entry poisoned caches)
      if (apiEntries.length === 0) {
        try {
          const cached = localStorage.getItem(LOCAL_LEADERBOARD_KEY);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 1) {
              apiEntries = parsed;
            } else {
              localStorage.removeItem(LOCAL_LEADERBOARD_KEY);
            }
          }
        } catch {}
      }

      // 3. Fallback to baseline roster if server and local cache are both unavailable
      if (apiEntries.length === 0) {
        apiEntries = [...DEFAULT_BASELINE_OPERATORS];
      }

      // 4. Merge current player's live gameplay stats
      const currentOperator = (operatorName || 'OPERATOR_09').trim().toUpperCase();
      const playerEntry: LeaderboardEntry = {
        rank: 0,
        operator_name: currentOperator,
        score: score || 0,
        points: score || 0,
        solo_solves_count: soloSolvesCount || 0,
        unlocked_level: unlockedLevel || 1,
        completed_levels: completedLevels || [],
        achievements_count: achievements?.length || 0,
        min_sanity_recorded: minSanityRecorded ?? 100,
        is_current_user: true,
      };

      const existingIdx = apiEntries.findIndex(
        (e) => (e.operator_name || '').toUpperCase() === currentOperator
      );

      let merged: LeaderboardEntry[];
      if (existingIdx !== -1) {
        const existing = apiEntries[existingIdx];
        merged = [...apiEntries];
        merged[existingIdx] = {
          ...existing,
          operator_name: currentOperator,
          score: Math.max(existing.score || 0, score || 0),
          points: Math.max(existing.points || 0, score || 0),
          solo_solves_count: Math.max(existing.solo_solves_count || 0, soloSolvesCount || 0),
          unlocked_level: Math.max(existing.unlocked_level || 1, unlockedLevel || 1),
          completed_levels:
            completedLevels && completedLevels.length >= (existing.completed_levels?.length || 0)
              ? completedLevels
              : existing.completed_levels || [],
          achievements_count: Math.max(existing.achievements_count || 0, achievements?.length || 0),
          min_sanity_recorded: Math.min(existing.min_sanity_recorded ?? 100, minSanityRecorded ?? 100),
          is_current_user: true,
        };
      } else {
        merged = [playerEntry, ...apiEntries];
      }

      // 5. Save merged roster to local cache (only if valid roster with > 1 entry)
      if (merged.length > 1) {
        try {
          localStorage.setItem(LOCAL_LEADERBOARD_KEY, JSON.stringify(merged));
        } catch {}
      }

      setLeaderboard(merged);
    } catch (err) {
      console.warn('Failed to fetch/merge leaderboard:', err);
    } finally {
      setIsLoading(false);
    }
  }, [operatorName, score, soloSolvesCount, unlockedLevel, completedLevels, achievements, minSanityRecorded]);

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    queueMicrotask(() => {
      if (isMounted) {
        void fetchLeaderboard();
      }
    });
    return () => {
      isMounted = false;
    };
  }, [isOpen, fetchLeaderboard]);

  if (!isOpen) return null;

  // Multi-attribute sorting based on active filter
  const sortedEntries = [...leaderboard].sort((a, b) => {
    if (filterMode === 'solo') {
      const soloDiff = (b.solo_solves_count || 0) - (a.solo_solves_count || 0);
      if (soloDiff !== 0) return soloDiff;
      return (b.score || 0) - (a.score || 0);
    }
    if (filterMode === 'sanity') {
      const sanityDiff = (b.min_sanity_recorded ?? 100) - (a.min_sanity_recorded ?? 100);
      if (sanityDiff !== 0) return sanityDiff;
      return (b.score || 0) - (a.score || 0);
    }
    const scoreDiff = (b.score || 0) - (a.score || 0);
    if (scoreDiff !== 0) return scoreDiff;
    return (b.solo_solves_count || 0) - (a.solo_solves_count || 0);
  });

  const filteredEntries = sortedEntries.filter((item) =>
    (item.operator_name || '').toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  // Find player rank in current view
  const currentOperatorUpper = (operatorName || 'OPERATOR_09').trim().toUpperCase();
  const playerRankIndex = sortedEntries.findIndex(
    (e) => (e.operator_name || '').toUpperCase() === currentOperatorUpper
  );
  const playerRank = playerRankIndex !== -1 ? playerRankIndex + 1 : '—';

  // Helper for rendering category-specific metrics in podium
  const renderPodiumScore = (entry?: LeaderboardEntry, isGold = false) => {
    if (!entry) return null;

    if (filterMode === 'solo') {
      return (
        <>
          <div
            style={{
              fontSize: isGold ? '22px' : '18px',
              fontWeight: 900,
              color: '#4ade80',
              margin: '4px 0 2px',
            }}
          >
            {entry.solo_solves_count || 0}{' '}
            <span style={{ fontSize: isGold ? '11px' : '10px', fontWeight: 700, color: '#86efac' }}>
              SOLOS
            </span>
          </div>
          <div
            style={{
              fontSize: isGold ? '11.5px' : '11px',
              color: '#94a3b8',
              display: 'flex',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <span>🏆 {entry.score?.toLocaleString()} PTS</span>
            <span>•</span>
            <span>⚡ Sec 0{entry.unlocked_level || 1}</span>
          </div>
        </>
      );
    }

    if (filterMode === 'sanity') {
      const sanVal = entry.min_sanity_recorded ?? 100;
      return (
        <>
          <div
            style={{
              fontSize: isGold ? '22px' : '18px',
              fontWeight: 900,
              color: '#c084fc',
              margin: '4px 0 2px',
            }}
          >
            {sanVal}%{' '}
            <span style={{ fontSize: isGold ? '11px' : '10px', fontWeight: 700, color: '#d8b4fe' }}>
              SANITY
            </span>
          </div>
          <div
            style={{
              fontSize: isGold ? '11.5px' : '11px',
              color: '#94a3b8',
              display: 'flex',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <span>🏆 {entry.score?.toLocaleString()} PTS</span>
            <span>•</span>
            <span>🎯 {entry.solo_solves_count || 0} Solos</span>
          </div>
        </>
      );
    }

    // Default: Top Score
    return (
      <>
        <div
          style={{
            fontSize: isGold ? '22px' : '18px',
            fontWeight: 900,
            color: isGold ? '#fef08a' : '#e2e8f0',
            margin: '4px 0 2px',
          }}
        >
          {entry.score?.toLocaleString() || 0}{' '}
          <span
            style={{
              fontSize: isGold ? '11px' : '10px',
              fontWeight: 600,
              color: isGold ? '#ca8a04' : '#94a3b8',
            }}
          >
            PTS
          </span>
        </div>
        <div
          style={{
            fontSize: isGold ? '11.5px' : '11px',
            color: isGold ? '#fef08a' : '#94a3b8',
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            opacity: 0.9,
          }}
        >
          <span>🎯 {entry.solo_solves_count || 0} Solos</span>
          <span>•</span>
          <span>⚡ Sec 0{entry.unlocked_level || 1}</span>
        </div>
      </>
    );
  };

  const championBadge =
    filterMode === 'solo'
      ? 'UNASSISTED APEX'
      : filterMode === 'sanity'
      ? 'IRON MIND REIGN'
      : 'MAINFRAME LEADER';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(2, 4, 8, 0.88)',
        backdropFilter: 'blur(16px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.75rem',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '860px',
          maxHeight: '92vh',
          background: 'rgba(10, 13, 20, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.8), 0 0 40px rgba(56, 189, 248, 0.06)',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          color: '#e2e8f0',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="leaderboard-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '6px',
                background: 'rgba(234, 179, 8, 0.12)',
                border: '1px solid rgba(234, 179, 8, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#facc15',
                flexShrink: 0,
              }}
            >
              <Trophy size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, letterSpacing: '0.08em', color: '#f8fafc' }}>
                  GLOBAL OPERATOR LEADERBOARD
                </h2>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: 'rgba(56, 189, 248, 0.15)',
                    color: '#38bdf8',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                  }}
                >
                  LIVE // INDEPENDENT SOLVES
                </span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '11.5px', color: '#94a3b8' }}>
                Points earned through unassisted decrypts, high precision, speed, and sanity preservation
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => {
                playTerminalBlip();
                fetchLeaderboard();
              }}
              disabled={isLoading}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#cbd5e1',
                padding: '6px 12px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.15s ease',
              }}
            >
              <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
              <span>SYNC</span>
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Top 3 Podium Cards across all filters */}
        {sortedEntries.length >= 3 && searchQuery === '' && (
          <div className="leaderboard-podium-grid">
            {/* Rank 2 (Silver) */}
            {(() => {
              const rank2 = sortedEntries[1];
              const isUser =
                (rank2?.operator_name || '').toUpperCase() === currentOperatorUpper;

              return (
                <div
                  style={{
                    background: isUser
                      ? 'linear-gradient(180deg, rgba(56, 189, 248, 0.12) 0%, rgba(15, 23, 42, 0.7) 100%)'
                      : 'linear-gradient(180deg, rgba(203, 213, 225, 0.08) 0%, rgba(15, 23, 42, 0.6) 100%)',
                    border: isUser
                      ? '1px solid rgba(56, 189, 248, 0.4)'
                      : '1px solid rgba(203, 213, 225, 0.2)',
                    borderRadius: '6px',
                    padding: '1rem',
                    textAlign: 'center',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      color: '#94a3b8',
                      fontSize: '10px',
                      fontWeight: 800,
                      letterSpacing: '0.15em',
                      marginBottom: '4px',
                    }}
                  >
                    RANK #2 // SILVER
                  </div>
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: 700,
                      color: isUser ? '#38bdf8' : '#f8fafc',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                    }}
                  >
                    <span>{rank2?.operator_name}</span>
                    {isUser && (
                      <span
                        style={{
                          fontSize: '8.5px',
                          background: '#38bdf8',
                          color: '#000',
                          padding: '1px 4px',
                          borderRadius: '3px',
                          fontWeight: 800,
                        }}
                      >
                        YOU
                      </span>
                    )}
                  </div>
                  {renderPodiumScore(rank2, false)}
                </div>
              );
            })()}

            {/* Rank 1 (Gold) */}
            {(() => {
              const rank1 = sortedEntries[0];
              const isUser =
                (rank1?.operator_name || '').toUpperCase() === currentOperatorUpper;

              return (
                <div
                  style={{
                    background: isUser
                      ? 'linear-gradient(180deg, rgba(56, 189, 248, 0.2) 0%, rgba(20, 24, 33, 0.85) 100%)'
                      : 'linear-gradient(180deg, rgba(234, 179, 8, 0.14) 0%, rgba(20, 24, 33, 0.8) 100%)',
                    border: isUser
                      ? '1px solid rgba(56, 189, 248, 0.6)'
                      : '1px solid rgba(234, 179, 8, 0.4)',
                    boxShadow: isUser
                      ? '0 0 28px rgba(56, 189, 248, 0.25)'
                      : '0 0 24px rgba(234, 179, 8, 0.12)',
                    borderRadius: '6px',
                    padding: '1.15rem 1rem',
                    textAlign: 'center',
                    position: 'relative',
                    transform: 'translateY(-4px)',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '-10px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: isUser ? '#38bdf8' : '#facc15',
                      color: '#000',
                      padding: '1px 8px',
                      borderRadius: '12px',
                      fontSize: '9px',
                      fontWeight: 900,
                      letterSpacing: '0.12em',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {championBadge}
                  </div>
                  <div
                    style={{
                      color: isUser ? '#38bdf8' : '#facc15',
                      fontSize: '10.5px',
                      fontWeight: 800,
                      letterSpacing: '0.15em',
                      marginBottom: '4px',
                    }}
                  >
                    RANK #1 // CHAMPION
                  </div>
                  <div
                    style={{
                      fontSize: '14.5px',
                      fontWeight: 800,
                      color: '#ffffff',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                    }}
                  >
                    <span>{rank1?.operator_name}</span>
                    {isUser && (
                      <span
                        style={{
                          fontSize: '8.5px',
                          background: '#38bdf8',
                          color: '#000',
                          padding: '1px 4px',
                          borderRadius: '3px',
                          fontWeight: 800,
                        }}
                      >
                        YOU
                      </span>
                    )}
                  </div>
                  {renderPodiumScore(rank1, true)}
                </div>
              );
            })()}

            {/* Rank 3 (Bronze) */}
            {(() => {
              const rank3 = sortedEntries[2];
              const isUser =
                (rank3?.operator_name || '').toUpperCase() === currentOperatorUpper;

              return (
                <div
                  style={{
                    background: isUser
                      ? 'linear-gradient(180deg, rgba(56, 189, 248, 0.12) 0%, rgba(15, 23, 42, 0.7) 100%)'
                      : 'linear-gradient(180deg, rgba(217, 119, 6, 0.08) 0%, rgba(15, 23, 42, 0.6) 100%)',
                    border: isUser
                      ? '1px solid rgba(56, 189, 248, 0.4)'
                      : '1px solid rgba(217, 119, 6, 0.25)',
                    borderRadius: '6px',
                    padding: '1rem',
                    textAlign: 'center',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      color: '#fb923c',
                      fontSize: '10px',
                      fontWeight: 800,
                      letterSpacing: '0.15em',
                      marginBottom: '4px',
                    }}
                  >
                    RANK #3 // BRONZE
                  </div>
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: 700,
                      color: isUser ? '#38bdf8' : '#f8fafc',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                    }}
                  >
                    <span>{rank3?.operator_name}</span>
                    {isUser && (
                      <span
                        style={{
                          fontSize: '8.5px',
                          background: '#38bdf8',
                          color: '#000',
                          padding: '1px 4px',
                          borderRadius: '3px',
                          fontWeight: 800,
                        }}
                      >
                        YOU
                      </span>
                    )}
                  </div>
                  {renderPodiumScore(rank3, false)}
                </div>
              );
            })()}
          </div>
        )}

        {/* Filter Pills & Search Bar */}
        <div className="leaderboard-filter-bar">
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => {
                playTerminalBlip();
                setFilterMode('score');
              }}
              style={{
                background: filterMode === 'score' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                border: `1px solid ${filterMode === 'score' ? 'rgba(56, 189, 248, 0.4)' : 'rgba(255, 255, 255, 0.08)'}`,
                color: filterMode === 'score' ? '#38bdf8' : '#94a3b8',
                padding: '5px 12px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <Flame size={12} />
              <span>TOP SCORE</span>
            </button>
            <button
              onClick={() => {
                playTerminalBlip();
                setFilterMode('solo');
              }}
              style={{
                background: filterMode === 'solo' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                border: `1px solid ${filterMode === 'solo' ? 'rgba(34, 197, 94, 0.4)' : 'rgba(255, 255, 255, 0.08)'}`,
                color: filterMode === 'solo' ? '#4ade80' : '#94a3b8',
                padding: '5px 12px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <Target size={12} />
              <span>SOLO PURISTS</span>
            </button>
            <button
              onClick={() => {
                playTerminalBlip();
                setFilterMode('sanity');
              }}
              style={{
                background: filterMode === 'sanity' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                border: `1px solid ${filterMode === 'sanity' ? 'rgba(168, 85, 247, 0.4)' : 'rgba(255, 255, 255, 0.08)'}`,
                color: filterMode === 'sanity' ? '#c084fc' : '#94a3b8',
                padding: '5px 12px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <ShieldCheck size={12} />
              <span>SANITY MASTERS</span>
            </button>
          </div>

          <input
            type="text"
            placeholder="Search operator..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'rgba(0, 0, 0, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '4px',
              padding: '5px 10px',
              fontSize: '11.5px',
              color: '#f8fafc',
              outline: 'none',
              width: '180px',
              fontFamily: 'JetBrains Mono, monospace',
            }}
          />
        </div>

        {/* Leaderboard Table List */}
        <div className="leaderboard-table-container">
          {filteredEntries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#94a3b8' }}>
              <Trophy size={36} color="#64748b" style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
              <p style={{ fontWeight: 700, fontSize: '13px', color: '#e2e8f0', margin: '0 0 6px', letterSpacing: '0.05em' }}>
                NO MATCHING OPERATOR RECORDS FOUND
              </p>
              <p style={{ fontSize: '11px', margin: 0, opacity: 0.75, maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.5 }}>
                Try adjusting your search criteria or solve puzzles independently to climb the rankings.
              </p>
            </div>
          ) : (
            <table className="leaderboard-table">
              <thead>
                <tr
                  style={{
                    color: '#64748b',
                    fontSize: '10px',
                    letterSpacing: '0.1em',
                    textAlign: 'left',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <th style={{ padding: '8px 6px', width: '50px' }}>RANK</th>
                  <th style={{ padding: '8px 10px' }}>OPERATOR</th>
                  <th
                    style={{
                      padding: '8px 10px',
                      textAlign: 'right',
                      color: filterMode === 'score' ? '#38bdf8' : '#64748b',
                    }}
                  >
                    SCORE
                  </th>
                  <th
                    style={{
                      padding: '8px 10px',
                      textAlign: 'center',
                      color: filterMode === 'solo' ? '#4ade80' : '#64748b',
                    }}
                  >
                    SOLO SOLVES
                  </th>
                  <th style={{ padding: '8px 10px', textAlign: 'center' }}>MAX SECTOR</th>
                  <th
                    style={{
                      padding: '8px 10px',
                      textAlign: 'center',
                      color: filterMode === 'sanity' ? '#c084fc' : '#64748b',
                    }}
                  >
                    MIN SANITY
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry) => {
                  const isCurrentPlayer =
                    (entry.operator_name || '').toUpperCase() === currentOperatorUpper;
                  const rankNum =
                    sortedEntries.findIndex(
                      (e) => (e.operator_name || '').toUpperCase() === (entry.operator_name || '').toUpperCase()
                    ) + 1;

                  return (
                    <tr
                      key={entry.operator_name}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                        background: isCurrentPlayer ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                        borderLeft: isCurrentPlayer ? '3px solid #38bdf8' : '3px solid transparent',
                        transition: 'background 0.1s ease',
                      }}
                    >
                      <td
                        style={{
                          padding: '10px 6px',
                          fontWeight: 700,
                          color: rankNum <= 3 ? '#facc15' : '#64748b',
                        }}
                      >
                        {rankNum === 1 ? '🥇 1' : rankNum === 2 ? '🥈 2' : rankNum === 3 ? '🥉 3' : `#${rankNum}`}
                      </td>
                      <td style={{ padding: '10px 10px', fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ color: isCurrentPlayer ? '#38bdf8' : '#f1f5f9' }}>
                            {entry.operator_name}
                          </span>
                          {isCurrentPlayer && (
                            <span
                              style={{
                                fontSize: '9px',
                                background: '#38bdf8',
                                color: '#000',
                                padding: '1px 4px',
                                borderRadius: '3px',
                                fontWeight: 800,
                              }}
                            >
                              YOU
                            </span>
                          )}
                        </div>
                      </td>
                      <td
                        style={{
                          padding: '10px 10px',
                          textAlign: 'right',
                          fontWeight: 800,
                          color: filterMode === 'score' ? '#fef08a' : '#f8fafc',
                          fontFamily: 'JetBrains Mono, monospace',
                        }}
                      >
                        {entry.score?.toLocaleString() || 0}
                      </td>
                      <td
                        style={{
                          padding: '10px 10px',
                          textAlign: 'center',
                          color: '#4ade80',
                          fontWeight: filterMode === 'solo' ? 800 : 600,
                        }}
                      >
                        🎯 {entry.solo_solves_count || 0}
                      </td>
                      <td style={{ padding: '10px 10px', textAlign: 'center', color: '#94a3b8' }}>
                        Sector 0{entry.unlocked_level || 1}
                      </td>
                      <td style={{ padding: '10px 10px', textAlign: 'center' }}>
                        <span
                          style={{
                            padding: '2px 6px',
                            borderRadius: '3px',
                            fontSize: '10px',
                            fontWeight: 700,
                            background:
                              (entry.min_sanity_recorded ?? 100) > 70
                                ? 'rgba(34, 197, 94, 0.12)'
                                : (entry.min_sanity_recorded ?? 100) > 40
                                ? 'rgba(234, 179, 8, 0.12)'
                                : 'rgba(239, 68, 68, 0.12)',
                            color:
                              (entry.min_sanity_recorded ?? 100) > 70
                                ? '#4ade80'
                                : (entry.min_sanity_recorded ?? 100) > 40
                                ? '#facc15'
                                : '#f87171',
                            border: `1px solid ${
                              (entry.min_sanity_recorded ?? 100) > 70
                                ? 'rgba(34, 197, 94, 0.25)'
                                : (entry.min_sanity_recorded ?? 100) > 40
                                ? 'rgba(234, 179, 8, 0.25)'
                                : 'rgba(239, 68, 68, 0.25)'
                            }`,
                          }}
                        >
                          {entry.min_sanity_recorded ?? 100}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer: Player Status Banner */}
        <div
          style={{
            padding: '1rem 1.75rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(4, 7, 14, 0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={16} color="#38bdf8" />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#f8fafc' }}>
                {operatorName}
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
              CURRENT RANK: <strong style={{ color: '#facc15' }}>#{playerRank}</strong>
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
              TOTAL POINTS: <strong style={{ color: '#38bdf8' }}>{score.toLocaleString()} PTS</strong>
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
              SOLO SOLVES: <strong style={{ color: '#4ade80' }}>{soloSolvesCount}</strong>
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
              MAX SECTOR: <strong style={{ color: '#e2e8f0' }}>0{unlockedLevel || 1}</strong>
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
              MIN SANITY: <strong style={{ color: '#c084fc' }}>{minSanityRecorded ?? 100}%</strong>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: '#f4f5f8',
              color: '#090a0d',
              border: 'none',
              padding: '6px 16px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '0.05em',
            }}
          >
            DISMISS
          </button>
        </div>
      </div>
    </div>
  );
};
