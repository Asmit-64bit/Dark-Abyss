import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { Code2, Server, Shield, Database, Cloud, ArrowLeft } from 'lucide-react';

const DOMAINS = [
  { id: 'dsa', title: 'Data Structures & Algorithms', icon: <Database size={24} />, desc: 'Graphs, Trees, and the logic of the abyss.' },
  { id: 'frontend', title: 'React & Frontend Architecture', icon: <Code2 size={24} />, desc: 'State machines, lifecycles, and visual deception.' },
  { id: 'security', title: 'Cybersecurity & Cryptography', icon: <Shield size={24} />, desc: 'Zero-knowledge proofs, hashing, and containment breaches.' },
  { id: 'backend', title: 'Python & Backend Systems', icon: <Server size={24} />, desc: 'APIs, concurrency, and systemic failure.' },
  { id: 'cloud', title: 'DevOps & Cloud Infrastructure', icon: <Cloud size={24} />, desc: 'Container orchestration, CI/CD pipelines, and network anomalies.' },
];

export const DomainSelect: React.FC = () => {
  const { setAppState, setSelectedDomain } = useGameStore();

  const handleSelect = (domainTitle: string) => {
    setSelectedDomain(domainTitle);
    setAppState('KNOWLEDGE_BASE');
  };

  return (
    <main className="luto-atmosphere">
      <div className="domain-select-screen">
        {/* Responsive Top Bar */}
        <div className="domain-select-top-bar">
          <div style={{ color: '#8b929e', fontSize: '10px', letterSpacing: '0.2em' }}>
            SYSTEM DIRECTIVE // SELECTION
          </div>

          <button
            type="button"
            onClick={() => setAppState('LANDING')}
            className="carousel-nav-link"
            style={{ padding: '6px 12px' }}
          >
            <ArrowLeft size={13} />
            <span>ABORT</span>
          </button>
        </div>

        <div className="domain-select-header-box">
          <h1 className="domain-select-title">
            How would you like to lose?
          </h1>
          <p className="domain-select-desc">
            Select your neural focus. The facility will adapt its anomalies to your choice.
          </p>
        </div>

        <div className="domain-grid">
          {DOMAINS.map((domain) => (
            <button
              key={domain.id}
              type="button"
              onClick={() => handleSelect(domain.title)}
              className="domain-card-btn"
            >
              <div className="domain-card-icon">{domain.icon}</div>
              <div>
                <div className="domain-card-name">{domain.title}</div>
                <div className="domain-card-desc">{domain.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
};
