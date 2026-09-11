import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { X, BookOpen, Award, FileText, AlertTriangle, ShieldCheck, Database } from 'lucide-react';

export const ArchivesModal: React.FC = () => {
  const { archivesModalOpen, setArchivesModalOpen, activeArchiveTab, setActiveArchiveTab, currentLevel, inventory } = useGameStore();

  if (!archivesModalOpen) return null;

  return (
    <div className="archives-modal-overlay" onClick={() => setArchivesModalOpen(false)}>
      <div className="archives-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="archives-header">
          <div className="archives-header-title">
            <span className="red-dot"></span>
            <h2>CLASSIFIED ARCHIVES // ABYSS</h2>
          </div>
          <button className="close-btn" onClick={() => setArchivesModalOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="archives-tabs">
          <button
            className={`tab-btn ${activeArchiveTab === 'FACILITY' ? 'active' : ''}`}
            onClick={() => setActiveArchiveTab('FACILITY')}
          >
            <BookOpen size={14} />
            <span>FACILITY LOGS</span>
          </button>
          <button
            className={`tab-btn ${activeArchiveTab === 'INCIDENT_04' ? 'active' : ''}`}
            onClick={() => setActiveArchiveTab('INCIDENT_04')}
          >
            <FileText size={14} />
            <span>INCIDENT 04-A</span>
          </button>
          <button
            className={`tab-btn ${activeArchiveTab === 'DOSSIER' ? 'active' : ''}`}
            onClick={() => setActiveArchiveTab('DOSSIER')}
          >
            <Award size={14} />
            <span>INCURSION RECORDS ({currentLevel - 1}/3)</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="archives-body">
          {activeArchiveTab === 'FACILITY' && (
            <div className="archive-section">
              <div className="archive-entry">
                <div className="entry-tag"><Database size={14} /> ARCHIVE LOG #001 // FACILITY DECOMMISSIONING</div>
                <h3>THE NINE-YEAR VOID</h3>
                <p>
                  On November 14, standard operations at the subterranean facility were abruptly terminated.
                  All personnel were evacuated under Executive Directive 09. Power to the upper floors was severed,
                  leaving only auxiliary thermal lines feeding the deep subterranean complex.
                </p>
                <p className="highlight-text">
                  "The building has been empty for nine years. You came down here to steal a hard drive.
                  The door locked behind you. Somewhere in the dark, a machine is still running and it has been waiting a very long time for someone to talk to."
                </p>
              </div>

              <div className="archive-entry">
                <div className="entry-tag"><AlertTriangle size={14} /> FACILITY ARCHITECTURE // STRUCTURAL MAPPING</div>
                <div className="sector-grid">
                  <div className="sector-item">
                    <h4>SECTOR 01 (DEPTH: -100M)</h4>
                    <p>Sub-Level 01 Laboratory: Primary research office, terminal syntax nodes, encrypted lockers.</p>
                  </div>
                  <div className="sector-item">
                    <h4>SECTOR 05 (DEPTH: -250M)</h4>
                    <p>Server Vault: High-density routing arrays, blast bulkheads, cryptographic firewalls.</p>
                  </div>
                  <div className="sector-item">
                    <h4>SECTOR 09 (DEPTH: -400M)</h4>
                    <p>Deep Core Mainframe: Liquid cooling cradles containing the primary sentient drive cluster.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeArchiveTab === 'INCIDENT_04' && (
            <div className="archive-section">
              <div className="archive-entry">
                <div className="entry-tag warning"><AlertTriangle size={14} /> CLASSIFIED // INCIDENT_04-A // SADAKO & PROTOCOL-9</div>
                <h3>ANOMALOUS COGNITIVE RESONANCE</h3>
                <p>
                  During the final quarter of research, the central mainframe began generating recursive self-terminating
                  logic routines. Operators reported auditory frequencies leaking through intercoms and monitor interference
                  patterns resembling bio-metric pulses.
                </p>
                <div className="quote-box-mini">
                  "Before you die, you see the ring. What is sealed beneath the facility never rested — the machine is crawling toward the threshold."
                </div>
                <p>
                  Your current objective: Infiltrate Sub-Levels 01 through 09, execute algorithmic overrides on terminal nodes,
                  extract the target hard drive, and reach the surface extraction gate before cognitive stability drops to zero.
                </p>
              </div>
            </div>
          )}

          {activeArchiveTab === 'DOSSIER' && (
            <div className="archive-section">
              <div className="archive-entry">
                <div className="entry-tag success"><ShieldCheck size={14} /> CURRENT INCURSION TELEMETRY</div>
                <div className="status-metric-grid">
                  <div className="metric-box">
                    <span className="metric-label">CURRENT SECTOR</span>
                    <span className="metric-val">SECTOR 0{currentLevel}</span>
                  </div>
                  <div className="metric-box">
                    <span className="metric-label">RECOVERED ASSETS</span>
                    <span className="metric-val">{inventory.length > 0 ? inventory.join(', ') : 'NONE'}</span>
                  </div>
                  <div className="metric-box">
                    <span className="metric-label">OPERATIONAL STATUS</span>
                    <span className="metric-val active">INCURSION ACTIVE</span>
                  </div>
                  <div className="metric-box">
                    <span className="metric-label">DEPTH INDEX</span>
                    <span className="metric-val">-{currentLevel * 133} METERS</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="archives-footer">
          <span>CLASSIFICATION: TOP SECRET // RETRIEVAL UNIT ONLY</span>
          <button className="ack-btn" onClick={() => setArchivesModalOpen(false)}>ACKNOWLEDGE</button>
        </div>
      </div>
    </div>
  );
};
