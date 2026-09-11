import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { BookOpen, X } from 'lucide-react';

const COMPLEXITY_ROWS: [string, string, string][] = [
  ['O(1)', 'Constant', 'Array index, hash map get/set'],
  ['O(log n)', 'Logarithmic', 'Binary search, balanced BST ops'],
  ['O(n)', 'Linear', 'Single pass / linear scan'],
  ['O(n log n)', 'Linearithmic', 'Merge sort, heap sort, sort + scan'],
  ['O(n²)', 'Quadratic', 'Nested loops, naive pair comparison'],
  ['O(2ⁿ)', 'Exponential', 'Brute-force subsets, unmemoized recursion'],
];

const STRUCTURE_ROWS: [string, string, string][] = [
  ['Array', 'O(1) access', 'O(n) insert/delete (shift required)'],
  ['Linked List', 'O(n) access', 'O(1) insert/delete at a known node'],
  ['Stack / Queue', 'O(1) push/pop', 'LIFO / FIFO order only'],
  ['Hash Map', 'O(1) avg lookup', 'No ordering guarantee'],
  ['Binary Search Tree', 'O(log n) avg', 'O(n) worst case if unbalanced'],
  ['Heap', 'O(log n) insert', 'O(1) peek min/max'],
  ['Graph (adj. list)', 'O(V+E) traversal', 'BFS = shortest path (unweighted)'],
];

const PATTERN_NOTES: { title: string; note: string }[] = [
  { title: 'Two Pointers', note: 'Sorted array, pair/triplet sums — walk from both ends inward.' },
  { title: 'Sliding Window', note: 'Contiguous subarray/substring problems — expand right, shrink left.' },
  { title: 'Binary Search', note: 'Sorted or monotonic search space — halve it every step.' },
  { title: 'BFS / DFS', note: 'BFS = shortest path, level order. DFS = full exploration, backtracking, cycles.' },
  { title: 'Dynamic Programming', note: 'Overlapping subproblems + optimal substructure — cache what you’ve already solved.' },
  { title: 'Greedy', note: 'Locally optimal choice, never revisited — only correct when the problem proves it holds.' },
  { title: 'Backtracking', note: 'Build a solution incrementally, undo the moment a constraint breaks.' },
];

export const StudyNotesModal: React.FC = () => {
  const { bookModalOpen, setBookModalOpen } = useGameStore();

  if (!bookModalOpen) return null;

  return (
    <div className="luto-dossier-overlay" onClick={() => setBookModalOpen(false)}>
      <div className="luto-dossier-modal" style={{ width: '620px' }} onClick={(e) => e.stopPropagation()}>
        <div className="dossier-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f4f5f8' }}>
            <BookOpen size={15} />
            <span style={{ fontSize: '11px', letterSpacing: '0.22em', fontWeight: 600 }}>
              MARGIN NOTES // LEFT BEHIND
            </span>
          </div>
          <button
            type="button"
            onClick={() => setBookModalOpen(false)}
            style={{ background: 'none', border: 'none', color: '#8b929e', cursor: 'pointer', padding: '4px' }}
          >
            <X size={16} />
          </button>
        </div>

        <p className="dossier-scenario">
          Someone sat at this desk long enough to fill the margins of every textbook they could find.
          Not homework — a survival guide. Whoever they were, they seemed to believe the way out was buried
          somewhere in here.
        </p>

        <div className="lore-section-card">
          <div style={{ fontSize: '11px', letterSpacing: '0.12em', color: '#f4f5f8', fontWeight: 600, marginBottom: '10px' }}>
            COMPLEXITY CHEAT SHEET
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {COMPLEXITY_ROWS.map(([big, name, example]) => (
              <div key={big} style={{ display: 'grid', gridTemplateColumns: '90px 120px 1fr', gap: '10px', fontSize: '11px' }}>
                <span style={{ color: '#fbbf24', fontFamily: 'monospace', fontWeight: 600 }}>{big}</span>
                <span style={{ color: '#cbd5e1' }}>{name}</span>
                <span style={{ color: '#8b929e' }}>{example}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lore-section-card">
          <div style={{ fontSize: '11px', letterSpacing: '0.12em', color: '#f4f5f8', fontWeight: 600, marginBottom: '10px' }}>
            DATA STRUCTURE QUICK REFERENCE
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {STRUCTURE_ROWS.map(([name, best, note]) => (
              <div key={name} style={{ display: 'grid', gridTemplateColumns: '130px 110px 1fr', gap: '10px', fontSize: '11px' }}>
                <span style={{ color: '#00e5ff', fontWeight: 600 }}>{name}</span>
                <span style={{ color: '#cbd5e1', fontFamily: 'monospace' }}>{best}</span>
                <span style={{ color: '#8b929e' }}>{note}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lore-section-card" style={{ marginBottom: 0 }}>
          <div style={{ fontSize: '11px', letterSpacing: '0.12em', color: '#f4f5f8', fontWeight: 600, marginBottom: '10px' }}>
            PATTERNS WORTH RECOGNIZING
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {PATTERN_NOTES.map((p) => (
              <div key={p.title} style={{ fontSize: '11px', lineHeight: 1.6 }}>
                <span style={{ color: '#a855f7', fontWeight: 600 }}>{p.title}</span>
                <span style={{ color: '#8b929e' }}> — {p.note}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="chapter-action-btn"
          style={{ marginTop: '1.5rem' }}
          onClick={() => setBookModalOpen(false)}
        >
          CLOSE NOTES
        </button>
      </div>
    </div>
  );
};
