import React, { useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { BookOpen, X, Sparkles } from 'lucide-react';
import { generateGeminiPuzzle } from '../../services/geminiService';

export const DocumentationViewer: React.FC = () => {
  const {
    activePuzzleId,
    setIsReadingDocumentation,
    adaptiveDifficulty,
    dynamicPuzzles,
    setDynamicPuzzle,
    setPuzzleSource,
  } = useGameStore();

  useEffect(() => {
    let isMounted = true;
    const fetchPuzzle = async () => {
      if (activePuzzleId && !dynamicPuzzles[activePuzzleId]) {
        try {
          const generated = await generateGeminiPuzzle(activePuzzleId, adaptiveDifficulty || undefined);
          if (isMounted) {
            setDynamicPuzzle(activePuzzleId, generated);
            setPuzzleSource(activePuzzleId, 'gemini');
          }
        } catch (err) {
          console.error('Background puzzle fetch error:', err);
        }
      }
    };

    void fetchPuzzle();

    return () => {
      isMounted = false;
    };
  }, [activePuzzleId, adaptiveDifficulty, dynamicPuzzles, setDynamicPuzzle, setPuzzleSource]);

  return (
    <div className="luto-dossier-overlay">
      <div className="luto-dossier-modal" style={{ maxWidth: '600px' }}>
        <div className="dossier-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f4f5f8' }}>
            <BookOpen size={15} />
            <span style={{ fontSize: '11px', letterSpacing: '0.22em', fontWeight: 600 }}>
              TERMINAL DOCUMENTATION // ARCHIVE
            </span>
          </div>
          <button 
            onClick={() => setIsReadingDocumentation(false)}
            style={{
              background: 'none',
              border: 'none',
              color: '#8b929e',
              cursor: 'pointer'
            }}
          >
            <X size={15} />
          </button>
        </div>

        <div className="dossier-content" style={{ padding: '24px', color: '#8b929e', lineHeight: 1.6 }}>
          <h2 style={{ color: '#f4f5f8', marginBottom: '16px', fontSize: '18px' }}>Security Manual: SQL Injection</h2>
          
          <p style={{ marginBottom: '16px' }}>
            When untrusted user input is concatenated directly into a database query string, 
            it creates a severe vulnerability known as <strong>SQL Injection (SQLi)</strong>.
          </p>
          
          <p style={{ marginBottom: '16px' }}>
            Malicious users can inject tautologies like <code>' OR '1'='1</code> into login forms. 
            Because 1 always equals 1, the database evaluates the condition as true and grants 
            unauthorized access to the system.
          </p>

          <p style={{ marginBottom: '24px' }}>
            <strong>Remediation:</strong> Always use Parameterized Queries or Prepared Statements.
          </p>
          
          <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            padding: '16px',
            borderLeft: '2px solid rgba(255, 255, 255, 0.1)',
            marginBottom: '24px',
            fontSize: '13px'
          }}>
            <i>"The anomaly adapts to those who learn from the archives."</i>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#8b929e' }}>
              <Sparkles size={12} />
              <span>Analyzing neural patterns...</span>
            </div>
            <button
              onClick={() => setIsReadingDocumentation(false)}
              className="dossier-submit-btn"
              style={{ padding: '8px 24px' }}
            >
              ACKNOWLEDGE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
