import React, { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '../../store/gameStore';
import { apiClient, type LeaderboardEntry } from '../../lib/apiClient';
import { Trophy, User, X, RefreshCw } from 'lucide-react';
import { playTerminalBlip } from '../../utils/soundEffects';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ isOpen, onClose }) => {
  const { operatorName, score, soloSolvesCount } = useGameStore();

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterMode, setFilterMode] = useState<'score' | 'solo' | 'sanity'>('score');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLeaderboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.getLeaderboard(50);
      if (res?.leaderboard) {
        setLeaderboard(res.leaderboard);
      }
    } catch (err) {
      console.warn('Failed to fetch leaderboard:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchLeaderboard();
    }
  }, [isOpen, fetchLeaderboard]);

  if (!isOpen) return null;

  // Sorting based on active filter
  const sortedEntries = [...leaderboard].sort((a, b) => {
    if (filterMode === 'solo') {
      return (b.solo_solves_count || 0) - (a.solo_solves_count || 0);
    }
    if (filterMode === 'sanity') {
      return (b.min_sanity_recorded ?? 100) - (a.min_sanity_recorded ?? 100);
    }
    return (b.score || 0) - (a.score || 0);
  });

  const filteredEntries = sortedEntries.filter((item) =>
    item.operator_name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  // Find player rank in current view
  const playerRankIndex = sortedEntries.findIndex(
    (e) => e.operator_name.toUpperCase() === operatorName.toUpperCase()
  );
  const playerRank = playerRankIndex !== -1 ? playerRankIndex + 1 : '—';

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
        padding: '1.5rem',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '860px',
          maxHeight: '90vh',
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
        <div
          style={{
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0) 100%)',
          }}
        >
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
              }}
            >
              <Trophy size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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

        {/* Top 3 Podium Cards */}
        {leaderboard.length >= 3 && searchQuery === '' && filterMode === 'score' && (
          <div
            style={{
              padding: '1.25rem 1.75rem 0.5rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1rem',
            }}
          >
            {/* Rank 2 (Silver) */}
            <div
              style={{
                background: 'linear-gradient(180deg, rgba(203, 213, 225, 0.08) 0%, rgba(15, 23, 42, 0.6) 100%)',
                border: '1px solid rgba(203, 213, 225, 0.2)',
                borderRadius: '6px',
                padding: '1rem',
                textAlign: 'center',
                position: 'relative',
              }}
            >
              <div style={{ color: '#94a3b8', fontSize: '10px', fontWeight: 800, letterSpacing: '0.15em', marginBottom: '4px' }}>
                RANK #2 // SILVER
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {leaderboard[1]?.operator_name}
              </div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#e2e8f0', margin: '4px 0 2px' }}>
                {leaderboard[1]?.score?.toLocaleString()} <span style={{ fontSize: '10px', fontWeight: 600, color: '#94a3b8' }}>PTS</span>
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                <span>🎯 {leaderboard[1]?.solo_solves_count} Solos</span>
                <span>•</span>
                <span>⚡ Sec 0{leaderboard[1]?.unlocked_level}</span>
              </div>
            </div>

            {/* Rank 1 (Gold) */}
            <div
              style={{
                background: 'linear-gradient(180deg, rgba(234, 179, 8, 0.14) 0%, rgba(20, 24, 33, 0.8) 100%)',
                border: '1px solid rgba(234, 179, 8, 0.4)',
                boxShadow: '0 0 24px rgba(234, 179, 8, 0.12)',
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
                  background: '#facc15',
                  color: '#000',
                  padding: '1px 8px',
                  borderRadius: '12px',
                  fontSize: '9px',
                  fontWeight: 900,
                  letterSpacing: '0.12em',
                }}
              >
                MAINFRAME LEADER
              </div>
              <div style={{ color: '#facc15', fontSize: '10.5px', fontWeight: 800, letterSpacing: '0.15em', marginBottom: '4px' }}>
                RANK #1 // CHAMPION
              </div>
              <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {leaderboard[0]?.operator_name}
              </div>
              <div style={{ fontSize: '22px', fontWeight: 900, color: '#fef08a', margin: '4px 0 2px' }}>
                {leaderboard[0]?.score?.toLocaleString()} <span style={{ fontSize: '11px', fontWeight: 600, color: '#ca8a04' }}>PTS</span>
              </div>
              <div style={{ fontSize: '11.5px', color: '#fef08a', display: 'flex', justifyContent: 'center', gap: '8px', opacity: 0.9 }}>
                <span>🎯 {leaderboard[0]?.solo_solves_count} Solos</span>
                <span>•</span>
                <span>⚡ Sec 0{leaderboard[0]?.unlocked_level}</span>
              </div>
            </div>

            {/* Rank 3 (Bronze) */}
            <div
              style={{
                background: 'linear-gradient(180deg, rgba(217, 119, 6, 0.08) 0%, rgba(15, 23, 42, 0.6) 100%)',
                border: '1px solid rgba(217, 119, 6, 0.25)',
                borderRadius: '6px',
                padding: '1rem',
                textAlign: 'center',
                position: 'relative',
              }}
            >
              <div style={{ color: '#fb923c', fontSize: '10px', fontWeight: 800, letterSpacing: '0.15em', marginBottom: '4px' }}>
                RANK #3 // BRONZE
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {leaderboard[2]?.operator_name}
              </div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#fdba74', margin: '4px 0 2px' }}>
                {leaderboard[2]?.score?.toLocaleString()} <span style={{ fontSize: '10px', fontWeight: 600, color: '#ea580c' }}>PTS</span>
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                <span>🎯 {leaderboard[2]?.solo_solves_count} Solos</span>
                <span>•</span>
                <span>⚡ Sec 0{leaderboard[2]?.unlocked_level}</span>
              </div>
            </div>
          </div>
        )}

        {/* Filter Pills & Search Bar */}
        <div
          style={{
            padding: '0.85rem 1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            flexWrap: 'wrap',
          }}
        >
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
              }}
            >
              TOP SCORE
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
              }}
            >
              SOLO PURISTS
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
              }}
            >
              SANITY MASTERS
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
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 1.75rem', maxHeight: '420px' }}>
          {filteredEntries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#94a3b8' }}>
              <Trophy size={36} color="#64748b" style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
              <p style={{ fontWeight: 700, fontSize: '13px', color: '#e2e8f0', margin: '0 0 6px', letterSpacing: '0.05em' }}>
                NO OPERATOR RECORDS IN DATABASE YET
              </p>
              <p style={{ fontSize: '11px', margin: 0, opacity: 0.75, maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.5 }}>
                Solve puzzles independently on your own to earn points and claim the #1 spot on the global mainframe!
              </p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ color: '#64748b', fontSize: '10px', letterSpacing: '0.1em', textAlign: 'left', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <th style={{ padding: '8px 6px', width: '50px' }}>RANK</th>
                  <th style={{ padding: '8px 10px' }}>OPERATOR</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>SCORE</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center' }}>SOLO SOLVES</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center' }}>MAX SECTOR</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center' }}>MIN SANITY</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry, idx) => {
                  const isCurrentPlayer = entry.operator_name.toUpperCase() === operatorName.toUpperCase();
                  const rankNum = idx + 1;

                  return (
                    <tr
                      key={entry.operator_name + idx}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                        background: isCurrentPlayer ? 'rgba(56, 189, 248, 0.08)' : 'transparent',
                        transition: 'background 0.1s ease',
                      }}
                    >
                      <td style={{ padding: '10px 6px', fontWeight: 700, color: rankNum <= 3 ? '#facc15' : '#64748b' }}>
                        {rankNum === 1 ? '🥇 1' : rankNum === 2 ? '🥈 2' : rankNum === 3 ? '🥉 3' : `#${rankNum}`}
                      </td>
                      <td style={{ padding: '10px 10px', fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ color: isCurrentPlayer ? '#38bdf8' : '#f1f5f9' }}>
                            {entry.operator_name}
                          </span>
                          {isCurrentPlayer && (
                            <span style={{ fontSize: '9px', background: '#38bdf8', color: '#000', padding: '1px 4px', borderRadius: '3px', fontWeight: 800 }}>
                              YOU
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 800, color: '#f8fafc', fontFamily: 'JetBrains Mono, monospace' }}>
                        {entry.score?.toLocaleString() || 0}
                      </td>
                      <td style={{ padding: '10px 10px', textAlign: 'center', color: '#4ade80', fontWeight: 600 }}>
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
                            background: (entry.min_sanity_recorded ?? 100) > 60 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: (entry.min_sanity_recorded ?? 100) > 60 ? '#4ade80' : '#f87171',
                            border: `1px solid ${(entry.min_sanity_recorded ?? 100) > 60 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
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
