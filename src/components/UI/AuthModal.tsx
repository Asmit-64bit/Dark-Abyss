import React, { useState } from 'react';
import {
  Lock,
  Mail,
  User,
  X,
  AlertTriangle,
  CheckCircle2,
  Terminal,
  Fingerprint,
  Radio,
  ArrowRight,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { playTerminalBlip, playHeavyDoorSlam, playTapeStatic } from '../../utils/soundEffects';

export const AuthModal: React.FC = () => {
  const {
    authModalOpen,
    authModalMode,
    setAuthModalOpen,
    signInWithPassword,
    signUpWithPassword,
    isLoading,
    error,
    setError,
  } = useAuthStore();

  const [mode, setMode] = useState<'signin' | 'signup'>(authModalMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [operatorName, setOperatorName] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!authModalOpen) return null;

  const handleTabSwitch = (newMode: 'signin' | 'signup') => {
    playTerminalBlip();
    setMode(newMode);
    setError(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('ALL CLEARANCE FIELDS ARE MANDATORY');
      return;
    }

    if (mode === 'signup' && password.length < 6) {
      setError('SECURITY ACCESS CODE MUST BE AT LEAST 6 CHARACTERS');
      return;
    }

    playTerminalBlip();
    setError(null);
    setSuccessMessage(null);

    if (mode === 'signin') {
      const res = await signInWithPassword(email, password);
      if (!res.error) {
        playHeavyDoorSlam();
      } else {
        playTapeStatic(0.4);
      }
    } else {
      const res = await signUpWithPassword(email, password, operatorName || 'OPERATOR_09');
      if (res.message) {
        setSuccessMessage(res.message);
        playTerminalBlip();
      } else if (!res.error) {
        playHeavyDoorSlam();
      } else {
        playTapeStatic(0.4);
      }
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={() => setAuthModalOpen(false)}>
      <div className="auth-modal-card horror-auth-card" onClick={(e) => e.stopPropagation()}>
        {/* CRT Scanline & Grain */}
        <div className="horror-crt-scanlines" />
        <div className="horror-vignette-overlay" />

        {/* Top Header */}
        <div className="auth-header">
          <div className="auth-header-left">
            <div className="auth-badge-top">
              <span className="auth-pulse-dot" />
              <span>FACILITY CLEARANCE ACCESS GATE // SECTOR 01</span>
            </div>
            <h2 className="auth-title">
              {mode === 'signin' ? 'OPERATOR AUTHENTICATION' : 'CREATE INTRUSION DOSSIER'}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => {
              playTerminalBlip();
              setAuthModalOpen(false);
            }}
            className="auth-close-btn"
            title="Abort Terminal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Mode Switch Tabs */}
        <div className="auth-tabs-bar">
          <button
            type="button"
            className={`auth-tab-btn ${mode === 'signin' ? 'active' : ''}`}
            onClick={() => handleTabSwitch('signin')}
          >
            <Lock size={13} />
            <span>ACCESS TERMINAL (SIGN IN)</span>
          </button>

          <button
            type="button"
            className={`auth-tab-btn ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => handleTabSwitch('signup')}
          >
            <Fingerprint size={13} />
            <span>REGISTER DOSSIER (SIGN UP)</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="auth-body">
          {error && (
            <div className="auth-error-banner">
              <AlertTriangle size={14} color="#ef4444" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="auth-success-banner">
              <CheckCircle2 size={14} color="#10b981" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {mode === 'signup' && (
              <div className="auth-input-group">
                <label className="auth-label">
                  <User size={12} />
                  <span>OPERATOR CALL-SIGN / CODENAME</span>
                </label>
                <input
                  type="text"
                  placeholder="E.G. SPECTRE_09, ASTRO, CIPHER"
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  maxLength={18}
                  className="auth-input"
                  autoFocus
                />
              </div>
            )}

            <div className="auth-input-group">
              <label className="auth-label">
                <Mail size={12} />
                <span>CLEARANCE ID (EMAIL ADDRESS)</span>
              </label>
              <input
                type="email"
                placeholder="operator@subterranean.net"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="auth-input"
                autoFocus={mode === 'signin'}
              />
            </div>

            <div className="auth-input-group">
              <label className="auth-label">
                <Lock size={12} />
                <span>SECURITY CIPHER (PASSWORD)</span>
              </label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="auth-input"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="auth-submit-btn"
            >
              {isLoading ? (
                <span className="auth-loading-text">TRANSMITTING BIOMETRICS...</span>
              ) : (
                <>
                  <span>{mode === 'signin' ? 'CONFIRM IDENTITY & DECRYPT' : 'REGISTER CLASSIFIED DOSSIER'}</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* Quick Guest Bypass Option */}
          <div className="auth-guest-divider">
            <span>OR CONTINUE UNCLASSIFIED</span>
          </div>

          <button
            type="button"
            onClick={() => {
              playTerminalBlip();
              setAuthModalOpen(false);
            }}
            className="auth-guest-btn"
          >
            <Radio size={13} />
            <span>CONTINUE AS OFFLINE GUEST OPERATOR</span>
          </button>
        </div>

        {/* Footer info */}
        <div className="auth-footer">
          <div className="auth-footer-tag">
            <Terminal size={11} />
            <span>HARDWARE-LEVEL 256-BIT ENCRYPTED SESSION</span>
          </div>
        </div>
      </div>
    </div>
  );
};
