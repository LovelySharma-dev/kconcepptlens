import React, { useState } from 'react';
import { ShieldCheck, Search, MessageSquareQuote } from 'lucide-react';

export const ISLPlayer: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

  const transcript = [
    { time: '00:00', text: 'Namaste! Welcome to ConceptLens Inclusive Learning.' },
    { time: '00:05', text: 'Today we learn about Singly Linked Lists in Data Structures.' },
    { time: '00:11', text: 'A Linked List is a series of connected nodes.' },
    { time: '00:17', text: 'Each node contains two components: Data value, and a Next Pointer.' },
    { time: '00:24', text: 'The pointer holds the memory reference of the successor node.' },
    { time: '00:30', text: 'The first node is designated as HEAD.' },
    { time: '00:36', text: 'The terminal node references NULL to indicate the end.' },
    { time: '00:43', text: 'When inserting at Head: allocate node, point next to old head, update head.' }
  ];

  const filteredTranscript = transcript.filter((t) =>
    t.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem' }}>
      {/* Video Player Column */}
      <div className="glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--accent-emerald)',
                  background: 'rgba(16, 185, 129, 0.15)',
                  padding: '0.2rem 0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <ShieldCheck size={14} /> Expert Reviewed ISL
              </span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginTop: '0.25rem' }}>
              Indian Sign Language (ISL): Linked Lists & Pointers
            </h3>
          </div>

          {/* Speed Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Speed:</span>
            {[0.75, 1.0, 1.25].map((s) => (
              <button
                key={s}
                type="button"
                className={`btn-secondary ${playbackSpeed === s ? 'active' : ''}`}
                style={{
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.75rem',
                  background: playbackSpeed === s ? 'var(--accent-cyan)' : undefined,
                  color: playbackSpeed === s ? '#000' : undefined
                }}
                onClick={() => setPlaybackSpeed(s)}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Video Frame */}
        <div
          style={{
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            background: '#020617',
            border: '1px solid var(--border-subtle)',
            position: 'relative'
          }}
        >
          <video
            controls
            style={{ width: '100%', maxHeight: '360px', display: 'block' }}
            poster="https://images.openai.com/static-rsc-4/oOF1abGF7psRXPa83H4p5CKkqR4Oy5oV7Yet0R8O0n4fmAUz__PAZlwzy6whF7CqoJz7TsXq0iXqyXwPy2YA7lzILOynS-Cp9W11Tlt7gvPfTG4_Fa4kl9mQPVU1KVx5iArse5fuiEEzS9Lxz_BMIyTn1O2LGk3VkNpG7K-TTvM?purpose=inline"
          >
            <source
              src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
              type="video/mp4"
            />
            <track
              kind="captions"
              srcLang="en"
              label="English"
              default
            />
            Your browser does not support HTML5 video tags.
          </video>
        </div>

        <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Reviewed in partnership with deaf education mentors. Synchronized with diagram pointer changes.
        </div>
      </div>

      {/* Transcript Column */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '1rem' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageSquareQuote size={18} color="var(--accent-cyan)" />
            Searchable Transcript & Timestamps
          </h4>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#020617',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.4rem 0.75rem'
            }}
          >
            <Search size={14} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Filter transcript keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                fontSize: '0.85rem',
                width: '100%',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Scrollable list */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '340px' }}>
          {filteredTranscript.map((t, idx) => (
            <div
              key={idx}
              tabIndex={0}
              role="button"
              style={{
                padding: '0.6rem 0.8rem',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                cursor: 'pointer',
                display: 'flex',
                gap: '0.75rem',
                fontSize: '0.85rem'
              }}
            >
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', fontWeight: 600, minWidth: '45px' }}>
                {t.time}
              </span>
              <span style={{ color: 'var(--text-primary)' }}>{t.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
