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
    <div
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        minHeight: '100vh',
        backgroundColor: '#040507',
        backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(15, 23, 42, 0.8), rgba(4, 5, 7, 1))',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        color: '#f4f5f8',
        fontFamily: 'Inter, sans-serif',
        zIndex: 50,
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        paddingTop: 'max(2rem, var(--sat, 0px))',
        paddingBottom: 'max(4.5rem, calc(var(--sab, 0px) + 3rem))',
        paddingLeft: 'max(1.25rem, var(--sal, 0px))',
        paddingRight: 'max(1.25rem, var(--sar, 0px))',
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
          maxWidth: '520px',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div style={{ color: '#8b929e', fontSize: '10px', letterSpacing: '0.2em' }}>
          SYSTEM DIRECTIVE // SELECTION
        </div>

        <button
          onClick={() => setAppState('LANDING')}
          style={{
            background: 'none',
            border: 'none',
            color: '#8b929e',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            fontSize: '10px',
            letterSpacing: '0.12em',
            transition: 'color 0.2s ease',
            padding: '4px',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#f87171'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#8b929e'; }}
        >
          <ArrowLeft size={13} />
          <span>ABORT</span>
        </button>
      </div>

      <h1
        style={{
          fontFamily: 'Cinzel, serif',
          fontSize: 'clamp(1.6rem, 6vw, 2.5rem)',
          letterSpacing: '0.12em',
          marginBottom: '0.75rem',
          color: '#f87171',
          textShadow: '0 0 20px rgba(248, 113, 113, 0.3)',
          textTransform: 'uppercase',
          textAlign: 'center',
        }}
      >
        How would you like to lose?
      </h1>
      <p style={{ color: '#8b929e', fontSize: '0.88rem', marginBottom: '2rem', letterSpacing: '0.04em', textAlign: 'center', maxWidth: '440px' }}>
        Select your neural focus. The facility will adapt its anomalies to your choice.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '500px' }}>
        {DOMAINS.map((domain) => (
          <button
            key={domain.id}
            onClick={() => handleSelect(domain.title)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '16px 24px',
              borderRadius: '6px',
              color: '#cbd5e1',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textAlign: 'left',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(244, 114, 182, 0.4)';
              e.currentTarget.style.transform = 'translateX(10px)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(244, 114, 182, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.transform = 'translateX(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ color: '#f472b6' }}>{domain.icon}</div>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '4px' }}>
                {domain.title}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#8b929e' }}>{domain.desc}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
