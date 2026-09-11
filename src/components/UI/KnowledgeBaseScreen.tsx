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
    <main className="luto-atmosphere">
      <div className="knowledge-screen">
        {/* Responsive Top Bar */}
        <div className="knowledge-top-bar">
          <div style={{ color: '#8b929e', fontSize: '10px', letterSpacing: '0.2em' }}>
            SYSTEM DIRECTIVE // DOSSIER REVIEW
          </div>

          <button
            type="button"
            onClick={() => setAppState('DOMAIN_SELECT')}
            className="carousel-nav-link"
            style={{ padding: '6px 12px' }}
          >
            ← CHANGE DOMAIN
          </button>
        </div>

        <div className="knowledge-header-title">
          <BookOpen size={24} color="#f472b6" />
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

        <div className="knowledge-terminal-box">
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
          type="button"
          onClick={() => setAppState('LEVEL_SELECT')}
          className="title-menu-btn primary-btn"
          style={{
            maxWidth: '520px',
            width: '100%',
            justifyContent: 'center',
            padding: '12px 24px',
            gap: '8px',
          }}
        >
          <Terminal size={16} />
          <span>ACKNOWLEDGE & PROCEED</span>
        </button>
      </div>
    </main>
  );
};
