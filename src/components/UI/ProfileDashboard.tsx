import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Shield,
  Activity,
  HardDrive,
  Award,
  Clock,
  RotateCcw,
  X,
  Edit3,
  Check,
  Cpu,
  Fingerprint,
  Radio,
  Lock,
  Unlock,
  AlertTriangle,
  Heart,
  Video,
  Play,
  Pause,
  Cloud,
  CloudOff,
  LogOut,
  LogIn,
  RefreshCw,
  Trophy,
  Zap,
} from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { useAuthStore } from '../../store/authStore';
import { ACHIEVEMENTS } from '../../data/achievements';
import { TOTAL_LEVELS } from '../../data/levels';
import {
  playTerminalBlip,
  playHeavyDoorSlam,
  playTapeStatic,
  playHeartbeatThump,
  playFootstep,
} from '../../utils/soundEffects';

interface ProfileDashboardProps {
  onClose: () => void;
}

const HAUNTED_TEXTS = [
  'DON’T ANSWER IT.',
  'SHE IS BEHIND YOU.',
  'THE WELL IS NEVER EMPTY.',
  '7 DAYS REMAINING.',
  'PRIMARY BULKHEAD SEALED.',
  'CAN YOU HEAR HER BREATHING?',
];

export const ProfileDashboard: React.FC<ProfileDashboardProps> = ({ onClose }) => {
  const {
    operatorName,
    setOperatorName,
    completedLevels,
    unlockedLevel,
    achievements,
    bestTimes,
    sanity,
    minSanityRecorded,
    score,
    soloSolvesCount,
    setLeaderboardModalOpen,
    resetProgress,
  } = useGameStore();

  const {
    user,
    isSyncing,
    signOut,
    setAuthModalOpen,
    syncProfileToCloud,
    syncProfileFromCloud,
  } = useAuthStore();

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(operatorName);
  const [activeTab, setActiveTab] = useState<'overview' | 'cctv' | 'achievements' | 'speedruns'>('overview');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Psychological Scare States
  const [glitchAvatar, setGlitchAvatar] = useState(false);
  const [cctvGhostVisible, setCctvGhostVisible] = useState(false);
  const [cctvJumpscare, setCctvJumpscare] = useState(false);
  const [hauntedTextOverride, setHauntedTextOverride] = useState<string | null>(null);
  const [isPlayingAudioLog, setIsPlayingAudioLog] = useState(false);
  const [liveTime, setLiveTime] = useState('');
  const audioLogIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Live CCTV timestamp
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      setLiveTime(
        `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(Math.floor(now.getMilliseconds() / 100))}`
      );
    };
    updateTimer();
    const interval = setInterval(updateTimer, 100);
    return () => clearInterval(interval);
  }, []);

  // Periodic Subliminal Avatar Glitch
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      if (Math.random() < 0.35) {
        setGlitchAvatar(true);
        playHeartbeatThump(0.8);
        setTimeout(() => setGlitchAvatar(false), 220);
      }
    }, 5500);
    return () => clearInterval(glitchInterval);
  }, []);

  // Periodic Dossier Text Haunting / Psychological Hallucinations
  useEffect(() => {
    const hauntInterval = setInterval(() => {
      if (Math.random() < 0.4) {
        const randomQuote = HAUNTED_TEXTS[Math.floor(Math.random() * HAUNTED_TEXTS.length)];
        setHauntedTextOverride(randomQuote);
        playTapeStatic(0.4);
        setTimeout(() => {
          setHauntedTextOverride(null);
        }, 2600);
      }
    }, 8000);
    return () => clearInterval(hauntInterval);
  }, []);

  // Periodic CCTV Entity Manifestation (Sadako creeping into frame)
  useEffect(() => {
    const cctvInterval = setInterval(() => {
      if (Math.random() < 0.5) {
        setCctvGhostVisible(true);
        setTimeout(() => {
          setCctvGhostVisible(false);
        }, 4000);
      }
    }, 9000);
    return () => clearInterval(cctvInterval);
  }, []);

  const handleStartEdit = () => {
    setTempName(operatorName);
    setIsEditingName(true);
    playTerminalBlip();
  };

  const handleSaveName = async () => {
    if (tempName.trim()) {
      const formatted = tempName.trim().toUpperCase();
      setOperatorName(formatted);
      playTerminalBlip();
      if (user) {
        await syncProfileToCloud();
      }
    }
    setIsEditingName(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSaveName();
    if (e.key === 'Escape') setIsEditingName(false);
  };

  const handleTabChange = (tab: 'overview' | 'cctv' | 'achievements' | 'speedruns') => {
    playTapeStatic(0.25);
    setActiveTab(tab);
  };

  // Trigger scary camera distortion when user clicks security monitor
  const handleCctvClick = () => {
    playHeartbeatThump(1.8);
    playTapeStatic(0.8);
    setCctvJumpscare(true);
    setTimeout(() => setCctvJumpscare(false), 450);
  };

  // Play creepy recovered cassette audio log
  const handleToggleAudioLog = () => {
    if (isPlayingAudioLog) {
      if (audioLogIntervalRef.current) clearInterval(audioLogIntervalRef.current);
      setIsPlayingAudioLog(false);
      playTerminalBlip();
    } else {
      setIsPlayingAudioLog(true);
      playTapeStatic(2.5);
      playFootstep();
      audioLogIntervalRef.current = setInterval(() => {
        if (Math.random() < 0.4) playHeartbeatThump(1.1);
        if (Math.random() < 0.3) playFootstep();
      }, 1400);

      setTimeout(() => {
        if (audioLogIntervalRef.current) clearInterval(audioLogIntervalRef.current);
        setIsPlayingAudioLog(false);
      }, 12000);
    }
  };

  const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    const millis = Math.floor((ms % 1000) / 10);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${millis.toString().padStart(2, '0')}`;
  };

  const hardDriveProgress = Math.round((completedLevels.length / TOTAL_LEVELS) * 100);

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-dashboard-card horror-scare-card" onClick={(e) => e.stopPropagation()}>
        {/* CRT Scanline & Grain Horror Overlay */}
        <div className="horror-crt-scanlines" />
        <div className="horror-vignette-overlay" />

        {/* Top Header */}
        <div className="profile-header">
          <div className="profile-header-meta">
            <div className="profile-badge-top">
              <span className="profile-pulse-dot" />
              <span>INCIDENT CASE FILE // DEPT. OF SUBTERRANEAN ANOMALIES</span>
            </div>
            <h2 className="profile-title">
              {hauntedTextOverride ? (
                <span className="haunted-glitch-title">{hauntedTextOverride}</span>
              ) : (
                'BIO-METRIC TELEMETRY & DOSSIER'
              )}
            </h2>
          </div>

          <div className="profile-header-right">
            {/* Supabase Cloud Sync Status */}
            {user ? (
              <div className="profile-cloud-badge online">
                <Cloud size={12} color="#10b981" />
                <span>CLOUD SYNC ACTIVE</span>
                <button
                  type="button"
                  onClick={() => syncProfileFromCloud()}
                  disabled={isSyncing}
                  className="profile-cloud-refresh-btn"
                  title="Force Sync with Cloud Database"
                >
                  <RefreshCw size={11} className={isSyncing ? 'spinning' : ''} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playTerminalBlip();
                    signOut();
                  }}
                  className="profile-auth-action-btn"
                  title="Sign Out"
                >
                  <LogOut size={11} />
                  <span>SIGN OUT</span>
                </button>
              </div>
            ) : (
              <div className="profile-cloud-badge offline">
                <CloudOff size={12} color="#94a3b8" />
                <span>OFFLINE DOSSIER</span>
                <button
                  type="button"
                  onClick={() => {
                    playTerminalBlip();
                    setAuthModalOpen(true, 'signin');
                  }}
                  className="profile-auth-action-btn primary"
                  title="Sign In / Register Cloud Dossier"
                >
                  <LogIn size={11} />
                  <span>CONNECT CLOUD</span>
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                playTerminalBlip();
                onClose();
              }}
              className="profile-close-btn"
              title="Seal Dossier"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Operator Identity Banner */}
        <div className="profile-identity-banner">
          <div
            className={`profile-avatar-box ${glitchAvatar ? 'avatar-glitch-active' : ''}`}
            onClick={() => {
              setGlitchAvatar(true);
              playHeartbeatThump(1.4);
              setTimeout(() => setGlitchAvatar(false), 350);
            }}
            title="Optical Feed // Click to Inspect"
          >
            {glitchAvatar ? (
              <img src="/sadako.png" alt="Cursed Apparition" className="avatar-sadako-glitch-img" />
            ) : (
              <User size={34} color="#94a3b8" />
            )}
            <div className="profile-avatar-scanlines" />
            <span className="avatar-rec-dot" />
          </div>

          <div className="profile-identity-info">
            <div className="profile-codename-row">
              {isEditingName ? (
                <div className="profile-name-edit-box">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    maxLength={18}
                    autoFocus
                    className="profile-name-input"
                  />
                  <button type="button" onClick={handleSaveName} className="profile-name-save-btn" title="Confirm Codename">
                    <Check size={14} />
                  </button>
                </div>
              ) : (
                <div className="profile-name-display">
                  <span className="profile-agent-name">{operatorName}</span>
                  <button
                    type="button"
                    onClick={handleStartEdit}
                    className="profile-name-edit-trigger"
                    title="Edit Call-sign"
                  >
                    <Edit3 size={13} />
                  </button>
                </div>
              )}

              <span className="profile-clearance-pill">
                <Shield size={12} />
                CLEARANCE LVL 0{unlockedLevel}
              </span>

              <span className="profile-curse-warning-pill">
                <AlertTriangle size={11} />
                ENTITY TARGETED: SADAKO
              </span>
            </div>

            <div className="profile-meta-tags">
              <span className="profile-tag">
                <Fingerprint size={11} /> ID: {user ? user.email : '#OP-889-ABYSS'}
              </span>
              <span className="profile-tag">
                <Heart size={11} color="#ef4444" className="profile-heart-pulse-icon" /> PULSE:{' '}
                {sanity > 60 ? '76 BPM' : sanity > 30 ? '118 BPM' : sanity > 0 ? '152 BPM (CRITICAL)' : 'FLATLINE (0 BPM)'}
              </span>
              <span className="profile-tag">
                <Radio size={11} /> STATUS: ACTIVE SUBTERRANEAN INTRUSION
              </span>
            </div>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="profile-tabs-bar">
          <button
            type="button"
            className={`profile-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => handleTabChange('overview')}
          >
            <Activity size={14} />
            <span>BIO-VITALS & TARGET</span>
          </button>

          <button
            type="button"
            className={`profile-tab-btn ${activeTab === 'cctv' ? 'active' : ''}`}
            onClick={() => handleTabChange('cctv')}
          >
            <Video size={14} />
            <span>SECTOR 01 CCTV FEED</span>
          </button>

          <button
            type="button"
            className={`profile-tab-btn ${activeTab === 'achievements' ? 'active' : ''}`}
            onClick={() => handleTabChange('achievements')}
          >
            <Award size={14} />
            <span>HONORS & ARCHIVES ({achievements.length}/{ACHIEVEMENTS.length})</span>
          </button>

          <button
            type="button"
            className={`profile-tab-btn ${activeTab === 'speedruns' ? 'active' : ''}`}
            onClick={() => handleTabChange('speedruns')}
          >
            <Clock size={14} />
            <span>SECTOR LOGS</span>
          </button>
        </div>

        {/* Tab Content Panels */}
        <div className="profile-tab-body">
          {activeTab === 'overview' && (
            <div className="profile-overview-pane">
              {/* Telemetry Metric Grid */}
              <div className="profile-stats-grid">
                <div className="profile-stat-card horror-dread-card">
                  <div className="profile-stat-label">
                    <Activity size={14} color={sanity > 50 ? '#10b981' : sanity > 20 ? '#f59e0b' : '#ef4444'} />
                    <span>COGNITIVE STABILITY (0-100)</span>
                  </div>
                  <div className="profile-stat-value" style={{ color: sanity > 50 ? '#f1f3f6' : sanity > 20 ? '#f59e0b' : '#ef4444' }}>
                    {sanity}%
                  </div>
                  <div className="profile-stat-bar-track">
                    <div
                      className="profile-stat-bar-fill"
                      style={{
                        width: `${sanity}%`,
                        backgroundColor: sanity > 50 ? '#10b981' : sanity > 25 ? '#f59e0b' : '#dc2626',
                        boxShadow: `0 0 10px ${sanity > 50 ? '#10b981' : '#dc2626'}`,
                      }}
                    />
                  </div>
                  <span className="profile-stat-sub">
                    {sanity > 75
                      ? 'NOMINAL PSYCHE'
                      : sanity > 40
                      ? 'TRAUMATIC ELEVATION'
                      : sanity > 0
                      ? 'CRITICAL PSYCHOSIS DETECTED'
                      : 'PSYCHOLOGICAL COLLAPSE'}
                    {' '}(LOWEST: {minSanityRecorded}%)
                  </span>
                </div>

                <div className="profile-stat-card horror-dread-card">
                  <div className="profile-stat-label">
                    <Cpu size={14} color="#94a3b8" />
                    <span>INCURSION DEPTH</span>
                  </div>
                  <div className="profile-stat-value">SECTOR 0{unlockedLevel}</div>
                  <div className="profile-stat-bar-track">
                    <div
                      className="profile-stat-bar-fill"
                      style={{ width: `${(unlockedLevel / TOTAL_LEVELS) * 100}%`, backgroundColor: '#64748b' }}
                    />
                  </div>
                  <span className="profile-stat-sub">SUBTERRANEAN DEPTH: -{unlockedLevel * 80} METERS</span>
                </div>

                <div className="profile-stat-card horror-dread-card">
                  <div className="profile-stat-label">
                    <HardDrive size={14} color="#94a3b8" />
                    <span>LOGIC CORES BYPASSED</span>
                  </div>
                  <div className="profile-stat-value">
                    {completedLevels.length} / {TOTAL_LEVELS}
                  </div>
                  <div className="profile-stat-bar-track">
                    <div
                      className="profile-stat-bar-fill"
                      style={{ width: `${(completedLevels.length / TOTAL_LEVELS) * 100}%`, backgroundColor: '#94a3b8' }}
                    />
                  </div>
                  <span className="profile-stat-sub">
                    {completedLevels.length === TOTAL_LEVELS ? 'ALL LOGIC NODES PURGED' : 'MAINFRAME BYPASS PENDING'}
                  </span>
                </div>

                <div className="profile-stat-card horror-dread-card">
                  <div className="profile-stat-label">
                    <Award size={14} color="#f59e0b" />
                    <span>HONORS RECOGNITION</span>
                  </div>
                  <div className="profile-stat-value">
                    {achievements.length} / {ACHIEVEMENTS.length}
                  </div>
                  <div className="profile-stat-bar-track">
                    <div
                      className="profile-stat-bar-fill"
                      style={{
                        width: `${(achievements.length / ACHIEVEMENTS.length) * 100}%`,
                        backgroundColor: '#f59e0b',
                      }}
                    />
                  </div>
                  <span className="profile-stat-sub">
                    {Math.round((achievements.length / ACHIEVEMENTS.length) * 100)}% CLASSIFIED HONORS EARNED
                  </span>
                </div>

                <div className="profile-stat-card horror-dread-card" style={{ border: '1px solid rgba(234, 179, 8, 0.25)' }}>
                  <div className="profile-stat-label">
                    <Trophy size={14} color="#facc15" />
                    <span>OPERATOR SCORE</span>
                  </div>
                  <div className="profile-stat-value" style={{ color: '#fef08a' }}>
                    {score.toLocaleString()} <span style={{ fontSize: '12px', color: '#ca8a04', fontWeight: 600 }}>PTS</span>
                  </div>
                  <div style={{ marginTop: '8px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        playTerminalBlip();
                        setLeaderboardModalOpen(true);
                      }}
                      style={{
                        background: 'rgba(234, 179, 8, 0.15)',
                        border: '1px solid rgba(234, 179, 8, 0.35)',
                        color: '#facc15',
                        padding: '4px 10px',
                        borderRadius: '4px',
                        fontSize: '10.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                      }}
                    >
                      <Trophy size={11} />
                      <span>OPEN LEADERBOARD</span>
                    </button>
                  </div>
                </div>

                <div className="profile-stat-card horror-dread-card" style={{ border: '1px solid rgba(34, 197, 94, 0.25)' }}>
                  <div className="profile-stat-label">
                    <Zap size={14} color="#4ade80" />
                    <span>SOLO SOLVES</span>
                  </div>
                  <div className="profile-stat-value" style={{ color: '#4ade80' }}>
                    {soloSolvesCount} <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600 }}>DECRYPTS</span>
                  </div>
                  <span className="profile-stat-sub">100% UNASSISTED INDEPENDENT SOLVES</span>
                </div>
              </div>

              {/* Primary Incursion Mission Target Banner */}
              <div className="profile-mission-banner horror-dark-banner">
                <div className="profile-mission-icon">
                  <HardDrive size={24} color="#e2e8f0" />
                </div>
                <div className="profile-mission-details">
                  <div className="profile-mission-title-row">
                    <h4 className="profile-mission-title">PRIMARY OBJECTIVE: SENTIENT CORE HARD DRIVE RETRIEVAL</h4>
                    <span className="profile-mission-status-pill">
                      {completedLevels.length === TOTAL_LEVELS ? 'EXTRACTION READY' : 'INCIDENT 04-A ACTIVE'}
                    </span>
                  </div>
                  <p className="profile-mission-desc">
                    "The building has been empty for nine years. You came down here to steal a hard drive. The door locked
                    behind you. Somewhere in the dark, a machine is still running — and it has been waiting a very long time
                    for someone to talk to."
                  </p>
                  <div className="profile-mission-progress-box">
                    <div className="profile-mission-progress-header">
                      <span>HARD DRIVE EXTRACTION PROGRESS</span>
                      <span>{hardDriveProgress}%</span>
                    </div>
                    <div className="profile-stat-bar-track">
                      <div
                        className="profile-stat-bar-fill"
                        style={{ width: `${hardDriveProgress}%`, backgroundColor: '#dc2626', boxShadow: '0 0 10px rgba(220, 38, 38, 0.5)' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Audio Surveillance Cassette Tape Player */}
              <div className="horror-cassette-card">
                <div className="horror-cassette-left">
                  <div className="horror-tape-spool-box">
                    <div className={`horror-tape-spool ${isPlayingAudioLog ? 'spinning' : ''}`} />
                    <div className={`horror-tape-spool ${isPlayingAudioLog ? 'spinning' : ''}`} />
                  </div>
                  <div className="horror-cassette-info">
                    <span className="horror-cassette-tag">[ CLASSIFIED TAPE // INCIDENT 04-A BLACK BOX ]</span>
                    <span className="horror-cassette-name">RECOVERED RECORDING: LAST WORDS OF INVESTIGATOR V</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleToggleAudioLog}
                  className={`horror-cassette-play-btn ${isPlayingAudioLog ? 'playing' : ''}`}
                  title={isPlayingAudioLog ? 'Pause Audio Log' : 'Play Audio Log'}
                >
                  {isPlayingAudioLog ? <Pause size={14} /> : <Play size={14} />}
                  <span>{isPlayingAudioLog ? 'PLAYING AUDIO FEED...' : 'TRANSCRIBE AUDIO LOG'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Dedicated Live CCTV Surveillance Feed with Spooky Jump/Ghost Mechanics */}
          {activeTab === 'cctv' && (
            <div className="profile-cctv-pane">
              <div
                className={`horror-cctv-screen ${cctvJumpscare ? 'cctv-jumpscare-shake' : ''}`}
                onClick={handleCctvClick}
                title="Click feed to amplify optical sensors"
              >
                {/* Background Surveillance Camera Feed */}
                <div className="cctv-bg-layer" />
                <div className="cctv-scanlines" />
                <div className="cctv-noise-jitter" />

                {/* CCTV Top Status Bar */}
                <div className="cctv-header-overlay">
                  <div className="cctv-rec-badge">
                    <span className="cctv-blinking-dot" />
                    <span>CAM 04 [ SECTOR 01 CORRIDOR ]</span>
                  </div>
                  <span className="cctv-live-clock">{liveTime}</span>
                </div>

                {/* Ghost Apparition In CCTV */}
                <div className={`cctv-sadako-apparition ${cctvGhostVisible || cctvJumpscare ? 'visible' : ''}`}>
                  <img src="/sadako.png" alt="Entity in Corridor" className="cctv-sadako-img" />
                </div>

                {/* CCTV Jumpscare Screech Face Flash */}
                {cctvJumpscare && (
                  <div className="cctv-screech-flash">
                    <img src="/sadako.png" alt="Sadako Screech" className="cctv-screech-img" />
                  </div>
                )}

                {/* Bottom Camera Metadata */}
                <div className="cctv-footer-overlay">
                  <span>OPTICAL SENSOR: IR-NIGHTVISION</span>
                  <span className="cctv-warning-text">
                    {cctvGhostVisible ? 'WARNING: UNIDENTIFIED BIOLOGICAL MOTION DETECTED' : 'NO ANOMALIES LOGGED'}
                  </span>
                </div>
              </div>
              <p className="cctv-instruction-hint">
                [ INTERACTIVE SURVEILLANCE FEED: CLICK CAMERA MONITOR TO AMPLIFY OPTICAL SENSORS ]
              </p>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="profile-achievements-pane">
              <div className="profile-achievements-grid">
                {ACHIEVEMENTS.map((ach) => {
                  const isUnlocked = achievements.includes(ach.id);
                  return (
                    <div
                      key={ach.id}
                      className={`profile-achievement-card horror-ach-card ${isUnlocked ? 'unlocked' : 'locked'}`}
                    >
                      <div className="profile-ach-icon-box">
                        <span className="profile-ach-emoji">{ach.icon}</span>
                        {isUnlocked ? (
                          <Unlock size={12} className="profile-ach-lock-icon unlocked" />
                        ) : (
                          <Lock size={12} className="profile-ach-lock-icon locked" />
                        )}
                      </div>
                      <div className="profile-ach-info">
                        <div className="profile-ach-title-row">
                          <span className="profile-ach-title">{ach.title}</span>
                          {isUnlocked ? (
                            <span className="profile-ach-unlocked-tag">[ UNLOCKED ]</span>
                          ) : (
                            <span className="profile-ach-locked-tag">[ CLASSIFIED ]</span>
                          )}
                        </div>
                        <p className="profile-ach-desc">
                          {isUnlocked ? ach.description : '██████████████████████████████████████'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'speedruns' && (
            <div className="profile-speedruns-pane">
              <div className="profile-speedruns-list">
                {Array.from({ length: TOTAL_LEVELS }, (_, idx) => idx + 1).map((lvl) => {
                  const isCleared = completedLevels.includes(lvl);
                  const isUnlocked = lvl <= unlockedLevel;
                  const bestMs = bestTimes[lvl];

                  return (
                    <div
                      key={lvl}
                      className={`profile-sector-row horror-sector-row ${isCleared ? 'cleared' : isUnlocked ? 'unlocked' : 'locked'}`}
                    >
                      <div className="profile-sector-id-box">
                        <span className="profile-sector-num">0{lvl}</span>
                        <span className="profile-sector-tag">SECTOR</span>
                      </div>

                      <div className="profile-sector-details">
                        <div className="profile-sector-name">
                          SECTOR 0{lvl} // {lvl === 1 ? 'BULKHEAD ENTRANCE' : lvl === 2 ? 'CORE LOGIC CORRIDOR' : lvl === 3 ? 'STORAGE VAULT' : lvl === 4 ? 'FACILITY SUB-BASEMENT' : 'ABYSS ZERO MATRIX'}
                        </div>
                        <div className="profile-sector-depth">DEPTH: -{lvl * 80}m BELOW SURFACE // PRESSURE CRITICAL</div>
                      </div>

                      <div className="profile-sector-records">
                        {bestMs ? (
                          <div className="profile-sector-time-box">
                            <span className="profile-sector-time-label">RECORD TIME</span>
                            <span className="profile-sector-time-val">{formatTime(bestMs)}</span>
                          </div>
                        ) : isCleared ? (
                          <span className="profile-sector-status-cleared">DECRYPTED</span>
                        ) : isUnlocked ? (
                          <span className="profile-sector-status-ready">ACTIVE INCURSION</span>
                        ) : (
                          <span className="profile-sector-status-sealed">BULKHEAD SEALED</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions & Data Management */}
        <div className="profile-footer">
          <div className="profile-footer-meta">
            <span className="profile-dot-offline" />
            <span>{user ? `AUTHENTICATED: ${user.email}` : 'FACILITY MAINFRAME RECOVERY ACTIVE // HARDWARE ISOLATED'}</span>
          </div>

          <div className="profile-footer-actions">
            {showResetConfirm ? (
              <div className="profile-reset-confirm-box">
                <span className="profile-reset-warning">CONFIRM PURGE ALL DOSSIER DATA?</span>
                <button
                  type="button"
                  onClick={() => {
                    playHeavyDoorSlam();
                    resetProgress();
                    setShowResetConfirm(false);
                  }}
                  className="profile-btn-danger"
                >
                  YES, PURGE
                </button>
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="profile-btn-secondary"
                >
                  CANCEL
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  playTerminalBlip();
                  setShowResetConfirm(true);
                }}
                className="profile-reset-trigger-btn"
                title="Reset All Local Progress"
              >
                <RotateCcw size={12} />
                <span>PURGE INCURSION DATA</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
