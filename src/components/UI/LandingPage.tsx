import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useAuthStore } from '../../store/authStore';
import { BgmPlayer } from './BgmPlayer';
import { HorrorPrologue } from './HorrorPrologue';
import { ProfileDashboard } from './ProfileDashboard';
import { AuthModal } from './AuthModal';
import { LeaderboardModal } from './LeaderboardModal';
import { ACHIEVEMENTS } from '../../data/achievements';
import { Trophy, X, ArrowRight, Activity, BookOpen, Eye, User, Cloud, CloudOff, Play, ShieldAlert, Key, AlertTriangle, Maximize, Minimize, Menu } from 'lucide-react';
import { playTerminalBlip } from '../../utils/soundEffects';
import { useFullscreen } from '../../utils/fullscreen';

const SADAKO_WHISPERS = [
  '7 DAYS',
  'SHE IS CLIMBING OUT OF THE WELL',
  'DO NOT LOOK INTO HER EYE',
  'SADAKO IS STANDING BEHIND YOU',
  'YOU WATCHED THE CURSED TAPE',
  'THE WELL IS NEVER EMPTY',
];

export const LandingPage: React.FC = () => {
  const {
    setAppState,
    unlockedLevel,
    completedLevels,
    achievements,
    bestTimes,
    operatorName,
    score,
    profileModalOpen,
    setProfileModalOpen,
    leaderboardModalOpen,
    setLeaderboardModalOpen,
  } = useGameStore();

  const { user, initializeAuth } = useAuthStore();
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen();

  const [showPrologue, setShowPrologue] = useState(true);
  const [showRecords, setShowRecords] = useState(false);
  const [showLoreDossier, setShowLoreDossier] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isGhostManifested, setIsGhostManifested] = useState(false);
  const [isJumpscare, setIsJumpscare] = useState(false);
  const [whisperText, setWhisperText] = useState<string | null>(null);
  const [isHoveringGate, setIsHoveringGate] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const whisperTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasProgress = completedLevels.length > 0 || unlockedLevel > 1;

  // Initialize Supabase Authentication on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const triggerJumpscare = useCallback(() => {
    setIsJumpscare(true);
    setTimeout(() => {
      setIsJumpscare(false);
    }, 600);
  }, []);

  // Periodic Sadako Apparition on the Gate (Occasional spawn: every 18 - 38 seconds)
  useEffect(() => {
    const scheduleNextManifestation = () => {
      const nextDelay = 18000 + Math.random() * 20000;
      timerRef.current = setTimeout(() => {
        setIsGhostManifested(true);

        // Low chance for a brief jumpscare
        if (Math.random() < 0.12) {
          setTimeout(() => {
            triggerJumpscare();
          }, 2000);
        }

        // Disappear after 4.5 seconds
        setTimeout(() => {
          setIsGhostManifested(false);
          scheduleNextManifestation();
        }, 4500);
      }, nextDelay);
    };

    scheduleNextManifestation();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [triggerJumpscare]);

  // Periodic Sadako Whispers (every 35 - 60 seconds)
  useEffect(() => {
    const scheduleNextWhisper = () => {
      const delay = 35000 + Math.random() * 25000;
      whisperTimerRef.current = setTimeout(() => {
        const randomQuote = SADAKO_WHISPERS[Math.floor(Math.random() * SADAKO_WHISPERS.length)];
        setWhisperText(randomQuote);
        setTimeout(() => {
          setWhisperText(null);
          scheduleNextWhisper();
        }, 2800);
      }, delay);
    };

    scheduleNextWhisper();
    return () => {
      if (whisperTimerRef.current) clearTimeout(whisperTimerRef.current);
    };
  }, []);

  const handleButtonClick = (action: () => void) => {
    playTerminalBlip();
    action();
  };

  const ghostActive = isGhostManifested || isHoveringGate || isJumpscare;

  if (showPrologue) {
    return <HorrorPrologue onComplete={() => setShowPrologue(false)} />;
  }

  return (
    <main className="luto-atmosphere">
      {/* Fullscreen Sadako Yamamura Jumpscare Overlay */}
      {isJumpscare && (
        <div className="luto-jumpscare-overlay">
          <img
            src="/sadako.png"
            alt="Sadako Jumpscare"
            className="luto-jumpscare-sadako-img"
          />
        </div>
      )}

      {/* Creepy Whispering Text Overlay */}
      {whisperText && (
        <div className="whisper-warning-toast">
          [ {whisperText} ]
        </div>
      )}

      {/* Sadako Corridor Gate Manifestation */}
      <div
        className="gate-sadako-anchor"
        onMouseEnter={() => setIsHoveringGate(true)}
        onMouseLeave={() => setIsHoveringGate(false)}
        onClick={triggerJumpscare}
        title="Sector 01 Gate Threshold"
      >
        {/* Red Emergency Lamp Backlight */}
        <div className={`gate-door-red-glow ${ghostActive ? 'active' : ''}`} />

        {/* Ghost Apparition */}
        <div className={`gate-sadako-figure ${ghostActive ? 'active' : ''}`}>
          <img
            src="/sadako.png"
            alt="Sadako Yamamura"
            className="gate-sadako-img"
          />
        </div>
      </div>

      {/* Main Title Interface */}
      <div className="title-screen-container">
        {/* Top Status Tag & Navigation */}
        <div className="title-header-bar">
          <div className="title-top-badge">
            <span className="luto-pulse-dot" />
            <span>CASE FILE // INCIDENT_04-A // SADAKO CURSE</span>
          </div>

          {/* Desktop Navigation Bar */}
          <div className="title-nav-actions desktop-nav-actions">
            <button
              type="button"
              onClick={() => handleButtonClick(() => setShowPrologue(true))}
              className="carousel-nav-link"
              title="Replay Horror Narration Prologue"
            >
              <Play size={12} color="#e51d3b" />
              <span>PROLOGUE</span>
            </button>

            <button
              type="button"
              onClick={() => handleButtonClick(() => setShowLoreDossier(true))}
              className="carousel-nav-link"
              title="Read Facility Case Archive"
            >
              <BookOpen size={13} />
              <span><span className="hidden-xs">FACILITY </span>ARCHIVES</span>
            </button>

            <button
              type="button"
              onClick={() => handleButtonClick(() => setLeaderboardModalOpen(true))}
              className="carousel-nav-link"
              style={{ color: '#facc15' }}
              title="Global Operators Leaderboard"
            >
              <Trophy size={13} color="#facc15" />
              <span><span className="hidden-xs">LEADERBOARD</span><span className="visible-xs">RANKS</span>{score > 0 ? <span className="hidden-xs"> ({score.toLocaleString()} PTS)</span> : ''}</span>
            </button>

            <button
              type="button"
              onClick={() => handleButtonClick(() => setShowRecords(true))}
              className="carousel-nav-link"
              title="View Records & Telemetry"
            >
              <Activity size={13} />
              <span>RECORDS<span className="hidden-xs"> ({achievements.length}/{ACHIEVEMENTS.length})</span></span>
            </button>

            <button
              type="button"
              onClick={() => handleButtonClick(() => void toggleFullscreen())}
              className="carousel-nav-link"
              style={{ color: isFullscreen ? '#38bdf8' : 'inherit' }}
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen (Mobile & Tablet Immersion)'}
            >
              {isFullscreen ? <Minimize size={13} color="#38bdf8" /> : <Maximize size={13} />}
              <span><span className="hidden-xs">{isFullscreen ? 'WINDOWED' : 'FULLSCREEN'}</span><span className="visible-xs">{isFullscreen ? 'EXIT' : 'FULL'}</span></span>
            </button>

            <button
              type="button"
              onClick={() => handleButtonClick(() => setProfileModalOpen(true))}
              className="carousel-nav-link profile-header-trigger-btn"
              title="Open Operator Profile & Clearance Dossier"
            >
              <User size={13} color="#ef4444" />
              <span>{operatorName || 'OPERATOR'}</span>
              {user ? (
                <div title="Cloud Sync Active">
                  <Cloud size={12} color="#10b981" className="profile-header-cloud-icon" />
                </div>
              ) : (
                <div title="Offline Mode">
                  <CloudOff size={12} color="#64748b" className="profile-header-cloud-icon" />
                </div>
              )}
            </button>
          </div>

          {/* Mobile Header Quick Actions: Profile & Menu Button */}
          <div className="title-mobile-header-actions">
            <button
              type="button"
              onClick={() => handleButtonClick(() => setProfileModalOpen(true))}
              className="carousel-nav-link profile-header-trigger-btn"
              title="Open Operator Profile"
            >
              <User size={12} color="#ef4444" />
              <span>{operatorName || 'OPERATOR'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playTerminalBlip();
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              className="title-mobile-menu-trigger"
              aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            >
              {mobileMenuOpen ? <X size={14} color="#ef4444" /> : <Menu size={14} color="#f4f5f8" />}
              <span>{mobileMenuOpen ? 'CLOSE' : 'MENU'}</span>
            </button>
          </div>
        </div>

        {/* Hero Title & Lore-Driven Prologue */}
        <div className="title-hero-content">
          <h1 className="title-main-heading">
            ABYSS
          </h1>

          <div className="title-lore-prologue">
            &ldquo;The building has been empty for nine years. You came down here to steal a hard drive. The door locked behind you. Somewhere in the dark, a machine is still running and it has been waiting a very long time for someone to talk to.&rdquo;
          </div>

          <p className="title-sub-heading">
            You did not enter the facility to conduct clinical research. You entered to retrieve what was buried beneath the grief. Decipher the logic nodes before cognitive stability flatlines.
          </p>

          {/* Interactive Menu Group */}
          <div className="title-menu-group">
            <button
              type="button"
              className="title-menu-btn primary-btn"
              onClick={() => handleButtonClick(() => setAppState('DOMAIN_SELECT'))}
            >
              <span>{hasProgress ? 'RESUME THE CONFRONTATION' : 'STEP INTO ABYSS'}</span>
              <ArrowRight size={14} />
            </button>

            <button
              type="button"
              className="title-menu-btn"
              onClick={() => handleButtonClick(() => setAppState('DOMAIN_SELECT'))}
            >
              <span>CHAPTER ARCHIVES</span>
              <span style={{ fontSize: '10px', opacity: 0.6, fontFamily: 'monospace' }}>
                [ 0{unlockedLevel} / 05 ]
              </span>
            </button>

            <button
              type="button"
              className="title-menu-btn"
              onClick={() => handleButtonClick(() => setShowLoreDossier(true))}
            >
              <span>CASE ARCHIVE & LORE</span>
              <span style={{ fontSize: '10px', opacity: 0.6, fontFamily: 'monospace' }}>
                CONFIDENTIAL
              </span>
            </button>
          </div>
        </div>

        {/* Bottom Live Incident Ticker */}
        <div className="title-bottom-ticker">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <Activity size={12} color="#dc2626" />
            <span>PULSE: {ghostActive ? '154 BPM' : '72 BPM'}</span>
            <span style={{ opacity: 0.3 }}>|</span>
            <span style={{ color: ghostActive ? '#ef4444' : 'inherit' }}>
              {ghostActive ? 'CURSE PROXIMITY CRITICAL' : 'DIAGNOSIS: ISOLATED MOURNING'}
            </span>
          </div>
          <div>DEPTH: SECTOR 0{unlockedLevel} (-{unlockedLevel * 80}m)</div>
        </div>
      </div>

      {/* Facility Lore Dossier Modal */}
      {showLoreDossier && (
        <div className="luto-dossier-overlay">
          <div className="lore-dossier-modal">
            <div className="dossier-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f4f5f8' }}>
                <ShieldAlert size={16} color="#dc2626" />
                <span style={{ fontSize: '11px', letterSpacing: '0.2em', fontWeight: 600 }}>
                  CONFIDENTIAL // PSYCHOLOGICAL AUTOPSY #04-A
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowLoreDossier(false)}
                className="carousel-nav-link"
                style={{ padding: '4px' }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Lore Entry 1: The Origin */}
            <div className="lore-section-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f4f5f8', fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', marginBottom: '6px' }}>
                <Eye size={14} color="#f4f5f8" />
                <span>I. THE NATURE OF ABYSS</span>
              </div>
              <p style={{ fontSize: '11px', color: '#cbd5e1', lineHeight: 1.7, margin: 0, fontWeight: 300 }}>
                In 1998, the facility beneath <span className="redacted-bar">█████████</span> reported spatial distortions mirroring the mental breakdown of Chief Investigator <span className="redacted-bar">█████</span>. Corridors began looping indefinitely, doors sealed themselves with algorithmic paradoxes, and the dark began projecting physical manifestations of unexpressed grief.
              </p>
            </div>

            {/* Lore Entry 2: The Five Manifestations */}
            <div className="lore-section-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f4f5f8', fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', marginBottom: '8px' }}>
                <Key size={14} color="#f59e0b" />
                <span>II. THE 5 SUB-LEVEL MANIFESTATIONS</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '10.5px', color: '#9ca3af', lineHeight: 1.6 }}>
                <div>
                  <strong style={{ color: '#f4f5f8' }}>Chapter I: The Clinical Cold (-40m)</strong> — The sterile medical rooms where the loss was first diagnosed. The air still smells of antiseptic and denial.
                </div>
                <div>
                  <strong style={{ color: '#f4f5f8' }}>Chapter II: The Whispering Crates (-120m)</strong> — Storage containers holding possessions that were packed away in boxes, never to be opened again.
                </div>
                <div>
                  <strong style={{ color: '#f4f5f8' }}>Chapter III: The Silicon Tomb (-220m)</strong> — Mainframe archives where corrupted audio logs and AI simulations endlessly replay the final voicemail.
                </div>
                <div>
                  <strong style={{ color: '#f4f5f8' }}>Chapter IV: The Burning Core (-340m)</strong> — The fevered state of guilt and anger, overheating the facility’s cooling manifolds into scorched ash.
                </div>
                <div>
                  <strong style={{ color: '#f4f5f8' }}>Chapter V: The Fractured Nexus (-400m)</strong> — The singularity where memory and reality collapse into a single doorway.
                </div>
              </div>
            </div>

            {/* Lore Entry 3: The Protocol */}
            <div className="lore-section-card" style={{ marginBottom: '1.5rem', borderLeft: '2px solid #dc2626' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#f87171', fontWeight: 600, letterSpacing: '0.1em', marginBottom: '4px' }}>
                <AlertTriangle size={13} color="#f87171" />
                <span>OPERATIONAL MANDATE // PRESERVE STABILITY</span>
              </div>
              <p style={{ fontSize: '10.5px', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
                Every anomaly contains a logic sequence. Solve the code to harmonize the memory. Keep the flashlight illuminated in deep dark corridors to prevent cardiac failure.
              </p>
            </div>

            <button
              type="button"
              className="chapter-action-btn"
              onClick={() => {
                setShowLoreDossier(false);
                setTimeout(() => {
                  setAppState('DOMAIN_SELECT');
                }, 500);
              }}
              style={{ margin: 0 }}
            >
              CONFRONT THE SUB-LEVELS →
            </button>
          </div>
        </div>
      )}

      {/* Incident Records Modal */}
      {showRecords && (
        <div className="luto-dossier-overlay">
          <div className="lore-dossier-modal" style={{ width: '580px' }}>
            <div className="dossier-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f4f5f8' }}>
                <Trophy size={16} />
                <span style={{ fontSize: '11px', letterSpacing: '0.2em', fontWeight: 600 }}>
                  INCIDENT TELEMETRY & RECORDS
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowRecords(false)}
                className="carousel-nav-link"
                style={{ padding: '4px' }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Best Times */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '10px', color: '#8b929e', letterSpacing: '0.15em', fontWeight: 600, marginBottom: '8px' }}>
                SECTOR CLEAR SPEEDRUNS
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
                {[1, 2, 3, 4, 5].map((lvl) => {
                  const timeMs = bestTimes[lvl];
                  const mins = timeMs ? Math.floor(timeMs / 60000) : 0;
                  const secs = timeMs ? Math.floor((timeMs % 60000) / 1000) : 0;
                  return (
                    <div key={lvl} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', padding: '6px', borderRadius: '4px', textAlign: 'center' }}>
                      <div style={{ fontSize: '9px', color: '#8b929e' }}>CH.0{lvl}</div>
                      <div style={{ fontSize: '11px', color: timeMs ? '#f4f5f8' : '#64748b', fontFamily: 'monospace', fontWeight: 600, marginTop: '2px' }}>
                        {timeMs ? `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}` : '--:--'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Badges List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '10px', color: '#8b929e', letterSpacing: '0.15em', fontWeight: 600, marginBottom: '2px' }}>
                RECOLLECTION BADGES
              </div>
              {ACHIEVEMENTS.map((ach) => {
                const isUnlocked = achievements.includes(ach.id);
                return (
                  <div
                    key={ach.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      background: isUnlocked ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.3)',
                      border: isUnlocked ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(255, 255, 255, 0.04)',
                      opacity: isUnlocked ? 1 : 0.4,
                    }}
                  >
                    <span style={{ fontSize: '1.25rem' }}>{ach.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ margin: 0, fontSize: '11.5px', color: isUnlocked ? '#f4f5f8' : '#94a3b8', fontWeight: 600 }}>
                          {ach.title}
                        </h4>
                        <span style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '0.1em', color: isUnlocked ? '#f4f5f8' : '#64748b' }}>
                          {isUnlocked ? '[ UNLOCKED ]' : '[ LOCKED ]'}
                        </span>
                      </div>
                      <p style={{ margin: '2px 0 0', fontSize: '10px', color: 'rgba(255, 255, 255, 0.55)', lineHeight: 1.4 }}>
                        {ach.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          className="title-mobile-drawer-overlay"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="title-mobile-drawer-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="drawer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="luto-pulse-dot" />
                <span style={{ fontSize: '11px', letterSpacing: '0.2em', color: '#cbd5e1', fontWeight: 600 }}>
                  FACILITY MENU // NAVIGATION
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="carousel-nav-link"
                style={{ padding: '6px' }}
                aria-label="Close Menu"
              >
                <X size={16} />
              </button>
            </div>

            <div className="drawer-nav-list">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleButtonClick(() => setShowPrologue(true));
                }}
                className="drawer-nav-item"
              >
                <div className="drawer-nav-icon"><Play size={16} color="#e51d3b" /></div>
                <div className="drawer-nav-content">
                  <span className="drawer-nav-title">REPLAY PROLOGUE</span>
                  <span className="drawer-nav-desc">Psychological horror introduction sequence</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleButtonClick(() => setShowLoreDossier(true));
                }}
                className="drawer-nav-item"
              >
                <div className="drawer-nav-icon"><BookOpen size={16} color="#38bdf8" /></div>
                <div className="drawer-nav-content">
                  <span className="drawer-nav-title">FACILITY ARCHIVES</span>
                  <span className="drawer-nav-desc">Incident 04-A case file and containment logs</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleButtonClick(() => setLeaderboardModalOpen(true));
                }}
                className="drawer-nav-item"
              >
                <div className="drawer-nav-icon"><Trophy size={16} color="#facc15" /></div>
                <div className="drawer-nav-content">
                  <span className="drawer-nav-title">OPERATORS LEADERBOARD</span>
                  <span className="drawer-nav-desc">Global rankings & speedrun records {score > 0 ? `(${score.toLocaleString()} PTS)` : ''}</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleButtonClick(() => setShowRecords(true));
                }}
                className="drawer-nav-item"
              >
                <div className="drawer-nav-icon"><Activity size={16} color="#10b981" /></div>
                <div className="drawer-nav-content">
                  <span className="drawer-nav-title">TELEMETRY & RECORDS</span>
                  <span className="drawer-nav-desc">Clearance achievements ({achievements.length}/{ACHIEVEMENTS.length})</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleButtonClick(() => setProfileModalOpen(true));
                }}
                className="drawer-nav-item"
              >
                <div className="drawer-nav-icon"><User size={16} color="#ef4444" /></div>
                <div className="drawer-nav-content">
                  <span className="drawer-nav-title">OPERATOR IDENTITY</span>
                  <span className="drawer-nav-desc">{operatorName || 'OPERATOR'} {user ? '• Cloud Synced' : '• Offline Mode'}</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleButtonClick(() => void toggleFullscreen());
                }}
                className="drawer-nav-item"
              >
                <div className="drawer-nav-icon">
                  {isFullscreen ? <Minimize size={16} color="#38bdf8" /> : <Maximize size={16} color="#38bdf8" />}
                </div>
                <div className="drawer-nav-content">
                  <span className="drawer-nav-title">{isFullscreen ? 'EXIT FULLSCREEN' : 'FULLSCREEN IMMERSION'}</span>
                  <span className="drawer-nav-desc">{isFullscreen ? 'Switch to windowed mode' : 'Edge-to-edge display on mobile & tablet'}</span>
                </div>
              </button>
            </div>

            <div className="drawer-footer">
              <div style={{ fontSize: '9px', color: '#64748b', letterSpacing: '0.15em' }}>
                CONTAINMENT PROTOCOL // ACTIVE
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Operator Profile & Dossier Dashboard Modal */}
      {profileModalOpen && (
        <ProfileDashboard onClose={() => setProfileModalOpen(false)} />
      )}

      {/* Global Operators Leaderboard Modal */}
      {leaderboardModalOpen && (
        <LeaderboardModal isOpen={leaderboardModalOpen} onClose={() => setLeaderboardModalOpen(false)} />
      )}

      {/* Supabase Authentication & Clearance Gate Modal */}
      <AuthModal />

      {/* Ambient Audio Resonator */}
      <BgmPlayer />
    </main>
  );
};
