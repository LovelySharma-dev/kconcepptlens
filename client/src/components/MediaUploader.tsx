import React, { useState } from 'react';
import {
  UploadCloud,
  Crop,
  AlertTriangle,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface MediaUploaderProps {
  onDiagramInterpreted: (data: any) => void;
  onLoadBenchmarkFixture: (fixtureName: string) => void;
  onSelectPhysicsModel?: (modelType: string) => void;
  onSelectUniversalModel?: (modelId: string) => void;
}

interface DiagramPreset {
  id: string;
  domain: 'physics' | 'biology' | 'chemistry' | 'mathematics' | 'economics' | 'data_structure';
  title: string;
  subtitle: string;
  thumbnail: string;
  badge: string;
}

const universalPresets: DiagramPreset[] = [
  // 1. BIOLOGY
  {
    id: 'heart_circulation',
    domain: 'biology',
    title: 'Heart Blood Circulation',
    subtitle: 'Cardiac cycle & dual flow',
    thumbnail: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=600&q=80',
    badge: 'Biology • Physiology'
  },
  {
    id: 'neuron_action_potential',
    domain: 'biology',
    title: 'Neuron Action Potential',
    subtitle: 'Synaptic firing & ion channels',
    thumbnail: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=600&q=80',
    badge: 'Biology • Neuroscience'
  },
  // 2. CHEMISTRY
  {
    id: 'titration_curve',
    domain: 'chemistry',
    title: 'Acid-Base Titration Curve',
    subtitle: 'Equivalence pH & indicator shift',
    thumbnail: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80',
    badge: 'Chemistry • Titration'
  },
  {
    id: 'bohr_atom',
    domain: 'chemistry',
    title: 'Bohr Planetary Atom',
    subtitle: 'Quantized K, L, M electron shells',
    thumbnail: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=600&q=80',
    badge: 'Chemistry • Quantum'
  },
  // 3. MATHEMATICS
  {
    id: 'trig_unit_circle',
    domain: 'mathematics',
    title: 'Trigonometric Unit Circle',
    subtitle: 'Interactive sin, cos, tan waves',
    thumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80',
    badge: 'Math • Trigonometry'
  },
  // 4. ECONOMICS
  {
    id: 'supply_demand',
    domain: 'economics',
    title: 'Supply & Demand Equilibrium',
    subtitle: 'Market clearing P* & Q* surplus',
    thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=80',
    badge: 'Economics • Market'
  },
  // 5. PHYSICS
  {
    id: 'ray_optics',
    domain: 'physics',
    title: 'Convex Lens Ray Optics',
    subtitle: 'Real & virtual image formation',
    thumbnail: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=600&q=80',
    badge: 'Physics • Optics'
  },
  {
    id: 'pendulum',
    domain: 'physics',
    title: 'Simple Pendulum SHM',
    subtitle: 'Harmonic motion & energy exchange',
    thumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80',
    badge: 'Physics • Mechanics'
  },
  {
    id: 'projectile',
    domain: 'physics',
    title: 'Projectile Trajectory',
    subtitle: 'Parabolic 2D kinematics',
    thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
    badge: 'Physics • Kinematics'
  },
  {
    id: 'circuit',
    domain: 'physics',
    title: 'DC Resistor Network',
    subtitle: 'Ohm’s law & electron drift',
    thumbnail: 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&w=600&q=80',
    badge: 'Physics • Circuits'
  },
  // 6. COMPUTER SCIENCE
  {
    id: 'binary_search_tree',
    domain: 'data_structure',
    title: 'Binary Search Tree (BST)',
    subtitle: 'Hierarchical logarithmic search',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
    badge: 'CS • BST Tree'
  },
  {
    id: 'isc',
    domain: 'data_structure',
    title: 'Singly Linked List (ISC)',
    subtitle: 'Sequential memory allocation',
    thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80',
    badge: 'CS • Linked List'
  },
  {
    id: 'doubly',
    domain: 'data_structure',
    title: 'Doubly Linked List',
    subtitle: 'Next and prev pointer rewiring',
    thumbnail: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
    badge: 'CS • Doubly List'
  }
];

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  onDiagramInterpreted,
  onLoadBenchmarkFixture,
  onSelectPhysicsModel,
  onSelectUniversalModel
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [activePresetId, setActivePresetId] = useState<string>('heart_circulation');
  const [isUploading, setIsUploading] = useState(false);
  const [blurWarning, setBlurWarning] = useState<string | null>(null);

  // Click any picture preset
  const handleClickPicturePreset = async (preset: DiagramPreset) => {
    setActivePresetId(preset.id);
    setPreviewUrl(preset.thumbnail);
    setBlurWarning(null);

    if (preset.id === 'isc' || preset.id === 'anna' || preset.id === 'doubly' || preset.id === 'circular') {
      onLoadBenchmarkFixture(preset.id);
      return;
    }

    if (preset.domain === 'physics' && onSelectPhysicsModel) {
      onSelectPhysicsModel(preset.id);
    }

    if (onSelectUniversalModel) {
      onSelectUniversalModel(preset.id);
    }

    try {
      const res = await fetch('/api/diagrams/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: preset.thumbnail,
          diagramType: preset.id,
          sourceContext: `${preset.domain}: ${preset.title}`
        })
      });
      const json = await res.json();
      if (json.success) {
        onDiagramInterpreted(json.data);
      }
    } catch (err) {
      console.error('Failed to interpret preset:', err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      alert('Accepted formats: PNG, JPG, WEBP, or PDF');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setBlurWarning(null);
    setActivePresetId('custom');
  };

  const handleProcessMedia = async () => {
    setIsUploading(true);
    try {
      const res = await fetch('/api/diagrams/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: previewUrl || 'uploaded_sample.png',
          cropCoordinates: { x: 50, y: 100, width: 600, height: 350 },
          sourceContext: 'Custom diagram upload'
        })
      });
      const json = await res.json();
      if (json.success) {
        onDiagramInterpreted(json.data);
      }
    } catch (err: any) {
      console.error('Error processing media:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const filteredPresets =
    selectedCategory === 'all'
      ? universalPresets
      : universalPresets.filter((p) => p.domain === selectedCategory);

  return (
    <div className="glass-panel" style={{ marginBottom: '1.5rem' }}>
      {/* Header and Subject Filter Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} color="var(--accent-cyan)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
              Universal Multi-Disciplinary Diagram Ingestion
            </h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Click <strong>ANY diagram</strong> (Biology, Physics, Chemistry, Math, CS, Economics) or upload your own to generate an interactive simulation!
          </p>
        </div>

        {/* Subject Filter Pills */}
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Subjects' },
            { id: 'biology', label: '🧬 Biology' },
            { id: 'physics', label: '⚛️ Physics' },
            { id: 'chemistry', label: '🧪 Chemistry' },
            { id: 'mathematics', label: '📐 Mathematics' },
            { id: 'economics', label: '📈 Economics' },
            { id: 'data_structure', label: '💻 Computer Science' }
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`btn-secondary ${selectedCategory === cat.id ? 'active' : ''}`}
              style={{
                fontSize: '0.75rem',
                padding: '0.3rem 0.65rem',
                background: selectedCategory === cat.id ? 'rgba(56, 189, 248, 0.15)' : undefined,
                borderColor: selectedCategory === cat.id ? 'var(--accent-cyan)' : undefined,
                color: selectedCategory === cat.id ? 'var(--accent-cyan)' : undefined
              }}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Picture Preset Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
          gap: '0.75rem',
          marginBottom: '1rem'
        }}
      >
        {filteredPresets.map((preset) => {
          const isSelected = activePresetId === preset.id;
          return (
            <div
              key={preset.id}
              tabIndex={0}
              role="button"
              onClick={() => handleClickPicturePreset(preset)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleClickPicturePreset(preset);
                }
              }}
              style={{
                background: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                border: `1.5px solid ${isSelected ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                boxShadow: isSelected ? '0 0 12px rgba(56, 189, 248, 0.3)' : undefined
              }}
            >
              <div style={{ height: '90px', width: '100%', position: 'relative', overflow: 'hidden' }}>
                <img
                  src={preset.thumbnail}
                  alt={preset.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: '6px',
                    left: '6px',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    background: 'rgba(2, 6, 23, 0.85)',
                    color: 'var(--accent-cyan)',
                    border: '1px solid var(--border-subtle)',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '4px'
                  }}
                >
                  {preset.badge}
                </span>
              </div>
              <div style={{ padding: '0.6rem 0.75rem' }}>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f8fafc', marginBottom: '0.15rem' }}>
                  {preset.title}
                </h4>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  {preset.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom Upload Dropzone */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: previewUrl ? '1fr 1fr' : '1fr',
          gap: '1rem',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '1rem'
        }}
      >
        <label
          style={{
            border: '2px dashed var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            cursor: 'pointer',
            background: 'rgba(2, 6, 23, 0.4)'
          }}
        >
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(56, 189, 248, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-cyan)'
            }}
          >
            <UploadCloud size={20} />
          </div>
          <div>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
              Upload Any Picture (Biology, Physics, Chemistry, Math, CS)
            </span>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              PNG, JPG, or PDF • AI extracts components and generates interactive simulation
            </p>
          </div>
        </label>

        {previewUrl && (
          <div
            style={{
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              background: '#020617',
              padding: '0.65rem 0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <img
                src={previewUrl}
                alt="Diagram Preview"
                style={{ width: '60px', height: '45px', objectFit: 'cover', borderRadius: '4px' }}
              />
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f8fafc' }}>
                  Picture Selected
                </span>
                <p style={{ fontSize: '0.7rem', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <CheckCircle2 size={12} /> Ready for Synthesis
                </p>
              </div>
            </div>

            <button
              type="button"
              className="btn-primary"
              onClick={handleProcessMedia}
              disabled={isUploading}
              style={{ fontSize: '0.8rem', padding: '0.45rem 0.9rem' }}
            >
              <Crop size={14} />
              <span>{isUploading ? 'Synthesizing...' : 'Generate Interactive Diagram'}</span>
            </button>
          </div>
        )}
      </div>

      {blurWarning && (
        <div
          style={{
            marginTop: '0.75rem',
            padding: '0.5rem 0.85rem',
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--accent-amber)',
            fontSize: '0.8rem'
          }}
        >
          <AlertTriangle size={16} />
          <span>{blurWarning}</span>
        </div>
      )}
    </div>
  );
};

export default MediaUploader;
