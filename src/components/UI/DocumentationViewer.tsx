import React, { useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { BookOpen, X, Sparkles } from 'lucide-react';
import { generateAiPuzzle } from '../../services/aiService';

export const DocumentationViewer: React.FC = () => {
  const {
    activePuzzleId,
    setIsReadingDocumentation,
    adaptiveDifficulty,
    dynamicPuzzles,
    setDynamicPuzzle,
    setPuzzleSource,
    selectedDomain,
  } = useGameStore();

  const getDomainManual = (domain: string | null) => {
    switch (domain) {
      case 'DevOps & Cloud Infrastructure':
        return {
          title: 'Infrastructure Manual: Multi-Stage Container Builds',
          description:
            'Packing compilers, SDKs, and build dependencies into production container images inflates size and creates massive vulnerability attack surfaces.',
          details:
            'Multi-stage Dockerfiles define a build stage with compilers (e.g. AS builder) and copy only the compiled binary into a lightweight minimal runner image (like Alpine or Distroless).',
          remediation: 'Always use multi-stage Docker builds and minimal non-root base images for production.',
        };
      case 'React & Frontend Architecture':
        return {
          title: 'Architecture Manual: useEffect Lifecycles & Memory Leaks',
          description:
            'Attaching event listeners, intervals, or WebSocket subscriptions inside useEffect without cleanup creates persistent zombie closures.',
          details:
            'When components unmount or re-render, uncleaned listeners retain memory references in closures, leading to duplicate triggers and runaway RAM leaks.',
          remediation: 'Always return a cleanup closure: return () => window.removeEventListener(...);',
        };
      case 'Data Structures & Algorithms':
        return {
          title: 'Algorithms Manual: Recursion Bounds & Stack Overflow',
          description:
            'Recursive procedures allocate a new stack frame on the call stack for every invocation.',
          details:
            'If the recursion lacks a deterministic base condition or fails to advance state toward termination, the call stack exceeds limits and crashes the runtime.',
          remediation: 'Ensure every recursive path starts with an unconditional base case check (if (!node) return;).',
        };
      case 'Python & Backend Systems':
        return {
          title: 'Systems Manual: Resource Management with Context Managers',
          description:
            'Leaving open file descriptors, database connections, or socket handles exhausts system operating limits under high concurrent load.',
          details:
            'The Python "with" statement guarantees invocation of the __exit__ dunder method on context managers, cleanly closing handles even upon unhandled exceptions.',
          remediation: 'Always wrap file handles and connection pools in "with" statements (e.g., with open(...) as f:).',
        };
      case 'Cybersecurity & Cryptography':
      default:
        return {
          title: 'Security Manual: SQL Injection & Query Parameterization',
          description:
            'When untrusted user input is concatenated directly into a database query string, it creates a severe SQL Injection (SQLi) vulnerability.',
          details:
            'Malicious inputs can inject tautologies like \' OR \'1\'=\'1 into query forms to bypass authentication and dump table contents.',
          remediation: 'Always use Parameterized Queries or Prepared Statements to separate query code from user data.',
        };
    }
  };

  const manual = getDomainManual(selectedDomain);

  useEffect(() => {
    let isMounted = true;
    const fetchPuzzle = async () => {
      if (activePuzzleId && !dynamicPuzzles[activePuzzleId]) {
        try {
          const generated = await generateAiPuzzle(activePuzzleId, adaptiveDifficulty || undefined);
          if (isMounted) {
            setDynamicPuzzle(activePuzzleId, generated);
            setPuzzleSource(activePuzzleId, 'groq');
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
      <div className="luto-dossier-modal" style={{ maxWidth: '600px', width: '100%' }}>
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
          <h2 style={{ color: '#f4f5f8', marginBottom: '16px', fontSize: '18px' }}>{manual.title}</h2>
          
          <p style={{ marginBottom: '16px' }}>
            {manual.description}
          </p>
          
          <p style={{ marginBottom: '16px' }}>
            {manual.details}
          </p>

          <p style={{ marginBottom: '24px' }}>
            <strong>Remediation:</strong> {manual.remediation}
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
