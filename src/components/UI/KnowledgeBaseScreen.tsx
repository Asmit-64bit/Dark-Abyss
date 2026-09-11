import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { DOMAIN_KNOWLEDGE_BASES } from '../../data/knowledgeBases';
import { BookOpen, Terminal } from 'lucide-react';

export const KnowledgeBaseScreen: React.FC = () => {
  const { setAppState, selectedDomain } = useGameStore();
  const [knowledgeText, setKnowledgeText] = React.useState('GENERATING DOSSIER FROM MAINFRAME...');

  React.useEffect(() => {
    if (!selectedDomain) {
      setKnowledgeText('NO DATA FOUND FOR DESIGNATED SECTOR.');
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
    .catch(err => {
      setKnowledgeText(DOMAIN_KNOWLEDGE_BASES[selectedDomain] || 'CRITICAL FAILURE: DOSSIER CORRUPTED.');
    });
  }, [selectedDomain]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: '#040507',
        backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(15, 23, 42, 0.9), rgba(4, 5, 7, 1))',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#f4f5f8',
        fontFamily: 'Inter, sans-serif',
        zIndex: 50,
        padding: '40px',
      }}
    >
      <div style={{ position: 'absolute', top: 40, left: 40, color: '#8b929e', fontSize: '11px', letterSpacing: '0.2em' }}>
        SYSTEM DIRECTIVE // DOSSIER REVIEW
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <BookOpen size={32} color="#f472b6" />
        <h1
          style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '2rem',
            letterSpacing: '0.15em',
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
          height: '50vh', 
          overflowY: 'auto',
          background: 'rgba(0, 0, 0, 0.6)',
          border: '1px solid rgba(244, 114, 182, 0.3)',
          borderRadius: '8px',
          padding: '24px',
          boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.8)',
          marginBottom: '32px'
        }}
      >
        <pre
          style={{
            fontFamily: '"Fira Code", "Courier New", monospace',
            fontSize: '0.9rem',
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
          gap: '12px',
          background: 'linear-gradient(90deg, rgba(244, 114, 182, 0.2), rgba(96, 165, 250, 0.2))',
          border: '1px solid rgba(244, 114, 182, 0.5)',
          padding: '16px 32px',
          borderRadius: '4px',
          color: '#f4f5f8',
          fontSize: '1rem',
          fontWeight: 600,
          letterSpacing: '0.1em',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 0 20px rgba(244, 114, 182, 0.2)',
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
        <Terminal size={18} />
        ACKNOWLEDGE & PROCEED TO TESTING
      </button>
    </div>
  );
};
