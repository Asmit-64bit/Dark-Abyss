import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { DOMAIN_KNOWLEDGE_BASES } from '../../data/knowledgeBases';
import { BookOpen, Terminal } from 'lucide-react';

export const KnowledgeBaseScreen: React.FC = () => {
  const { setAppState, selectedDomain } = useGameStore();
  const [knowledgeText, setKnowledgeText] = React.useState(() =>
    selectedDomain ? 'GENERATING DOSSIER FROM MAINFRAME...' : 'NO DATA FOUND FOR DESIGNATED SECTOR.'
  );

  React.useEffect(() => {
    if (!selectedDomain) {
      return;
    }
    
    // First, try to see if it's already generated or fetch it
    fetch('/api/ai/knowledge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain: selectedDomain })
    })
    .then(res => res.json())
    .then(data => {
      if (data.text) {
        setKnowledgeText(data.text);
      } else {
        setKnowledgeText(DOMAIN_KNOWLEDGE_BASES[selectedDomain] || 'ERROR: FALLBACK DATA USED.\\n\\n' + data.error);
      }
    })
    .catch((_err) => {
      setKnowledgeText(DOMAIN_KNOWLEDGE_BASES[selectedDomain] || 'CRITICAL FAILURE: DOSSIER CORRUPTED.');
    });
  }, [selectedDomain]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        minHeight: '100vh',
        backgroundColor: '#040507',
        backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(15, 23, 42, 0.9), rgba(4, 5, 7, 1))',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        color: '#f4f5f8',
        fontFamily: 'Inter, sans-serif',
        zIndex: 50,
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        paddingTop: 'max(1.75rem, var(--sat, 0px))',
        paddingBottom: 'max(4.5rem, calc(var(--sab, 0px) + 3rem))',
        paddingLeft: 'max(1rem, var(--sal, 0px))',
        paddingRight: 'max(1rem, var(--sar, 0px))',
        boxSizing: 'border-box',
      }}
    >
      {/* Responsive Top Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          maxWidth: '800px',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div style={{ color: '#8b929e', fontSize: '10px', letterSpacing: '0.2em' }}>
          SYSTEM DIRECTIVE // DOSSIER REVIEW
        </div>

        <button
          onClick={() => setAppState('DOMAIN_SELECT')}
          style={{
            background: 'none',
            border: 'none',
            color: '#8b929e',
            fontSize: '10px',
            letterSpacing: '0.12em',
            cursor: 'pointer',
            padding: '4px',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#f87171'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#8b929e'; }}
        >
          ← CHANGE DOMAIN
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.25rem', textAlign: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
        <BookOpen size={26} color="#f472b6" />
        <h1
          style={{
            fontFamily: 'Cinzel, serif',
            fontSize: 'clamp(1.3rem, 5vw, 2rem)',
            letterSpacing: '0.12em',
            color: '#f87171',
            textShadow: '0 0 20px rgba(248, 113, 113, 0.3)',
            textTransform: 'uppercase',
            margin: 0,
          }}
        >
          {selectedDomain} - Dossier
        </h1>
      </div>

      <div 
        style={{ 
          width: '100%', 
          maxWidth: '800px', 
          maxHeight: '46vh', 
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          background: 'rgba(0, 0, 0, 0.65)',
          border: '1px solid rgba(244, 114, 182, 0.3)',
          borderRadius: '8px',
          padding: '16px 20px',
          boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.8)',
          marginBottom: '1.75rem'
        }}
      >
        <pre
          style={{
            fontFamily: '"Fira Code", "Courier New", monospace',
            fontSize: '0.82rem',
            lineHeight: '1.6',
            color: '#cbd5e1',
            whiteSpace: 'pre-wrap',
            margin: 0,
          }}
        >
          {knowledgeText}
        </pre>
      </div>

      <button
        onClick={() => setAppState('LEVEL_SELECT')}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          background: 'linear-gradient(90deg, rgba(244, 114, 182, 0.2), rgba(96, 165, 250, 0.2))',
          border: '1px solid rgba(244, 114, 182, 0.5)',
          padding: '14px 28px',
          borderRadius: '4px',
          color: '#f4f5f8',
          fontSize: '0.88rem',
          fontWeight: 600,
          letterSpacing: '0.1em',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 0 20px rgba(244, 114, 182, 0.2)',
          maxWidth: '520px',
          width: '100%',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 0 30px rgba(244, 114, 182, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 0 20px rgba(244, 114, 182, 0.2)';
        }}
      >
        <Terminal size={16} />
        <span>ACKNOWLEDGE & PROCEED</span>
      </button>
    </div>
  );
};
