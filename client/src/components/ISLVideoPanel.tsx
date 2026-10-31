import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { ISLLessonResource } from '@conceptlens/shared';
import { getAuthenticISLResource } from '../data/islLessons';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  ShieldCheck,
  AlertTriangle,
  Clock,
  VideoOff,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface ISLVideoPanelProps {
  lessonIdOrTopic: string;
  resource?: ISLLessonResource | null;
  onAnnounce?: (msg: string) => void;
  isCompact?: boolean;
}

export const ISLVideoPanel: React.FC<ISLVideoPanelProps> = ({
  lessonIdOrTopic,
  resource: propResource,
  onAnnounce,
  isCompact = false
}) => {
  // Resolve authentic resource
  const resource: ISLLessonResource | null = propResource !== undefined
    ? propResource
    : getAuthenticISLResource(lessonIdOrTopic);

  const videoRef = useRef<HTMLVideoElement>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);

  // UI Tab State: 'video' | 'transcript' | 'provenance'
  const [activeTab, setActiveTab] = useState<'video' | 'transcript' | 'provenance'>('video');
  const [isExpanded, setIsExpanded] = useState(true);

  // Format time (MM:SS)
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Play / Pause toggle
  const handleTogglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused || videoRef.current.ended) {
      videoRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          onAnnounce?.('ISL video playing.');
        })
        .catch((err) => {
          console.warn('Video play prevented:', err);
          setIsPlaying(false);
        });
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      onAnnounce?.('ISL video paused.');
    }
  }, [onAnnounce]);

  // Seek bar handler
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    setCurrentTime(targetTime);
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
    }
  };

  // Seek to cue timestamp
  const handleSeekToCue = (seconds: number, cueText: string) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      setCurrentTime(seconds);
      if (videoRef.current.paused) {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
      onAnnounce?.(`Jumped to: ${cueText}`);
    }
  };

  // Replay
  const handleReplay = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      onAnnounce?.('Replaying ISL video from beginning.');
    }
  };

  // Volume toggle & slider
  const handleToggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
    onAnnounce?.(nextMuted ? 'Video audio muted.' : 'Video audio unmuted.');
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      if (val === 0) {
        setIsMuted(true);
        videoRef.current.muted = true;
      } else if (isMuted) {
        setIsMuted(false);
        videoRef.current.muted = false;
      }
    }
  };

  // Keyboard accessibility on video container
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'k' || e.key === 'K') {
      e.preventDefault();
      handleTogglePlay();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (videoRef.current) {
        const nextTime = Math.min(duration, videoRef.current.currentTime + 5);
        videoRef.current.currentTime = nextTime;
        setCurrentTime(nextTime);
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (videoRef.current) {
        const prevTime = Math.max(0, videoRef.current.currentTime - 5);
        videoRef.current.currentTime = prevTime;
        setCurrentTime(prevTime);
      }
    } else if (e.key === 'm' || e.key === 'M') {
      e.preventDefault();
      handleToggleMute();
    }
  };

  // Video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
    };
    const onWaiting = () => setIsLoading(true);
    const onPlaying = () => {
      setIsLoading(false);
      setIsPlaying(true);
    };
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);
    const onError = () => {
      setIsLoading(false);
      setPlaybackError('Video resource currently buffering or offline. Fallback text transcript active.');
    };

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('pause', onPause);
    video.addEventListener('ended', onEnded);
    video.addEventListener('error', onError);

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('ended', onEnded);
      video.removeEventListener('error', onError);
    };
  }, [resource]);

  return (
    <section
      className="glass-panel"
      style={{
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        border: '1.5px solid var(--border-medium)',
        background: 'var(--surface-bg)'
      }}
      aria-label="Indian Sign Language (ISL) Video Lesson"
    >
      {/* HEADER BAR: Clear ISL Label, Status Badge & Collapse Toggle */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1rem',
          background: 'var(--surface-elevated)',
          borderBottom: isExpanded ? '1px solid var(--border-subtle)' : 'none',
          gap: '0.5rem',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '0.2rem 0.55rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(29, 106, 159, 0.15)',
              color: 'var(--accent-cyan)',
              border: '1px solid rgba(29, 106, 159, 0.35)',
              letterSpacing: '0.04em'
            }}
          >
            ISL VIDEO
          </span>

          <h3 style={{ fontSize: '0.92rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            Indian Sign Language
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Authentic Verification Status Badge */}
          {resource?.reviewStatus === 'verified' ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.72rem',
                fontWeight: 700,
                color: 'var(--state-success-text)',
                background: 'var(--state-success-bg)',
                border: '1px solid var(--state-success-border)',
                padding: '0.15rem 0.55rem',
                borderRadius: 'var(--radius-full)'
              }}
              title={`Reviewed by: ${resource.reviewerMetadata?.reviewerName || 'ISLRTC Certified Reviewer'}`}
            >
              <ShieldCheck size={13} aria-hidden="true" />
              <span>Verified ISL Lesson</span>
            </span>
          ) : resource?.reviewStatus === 'pending_review' ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.72rem',
                fontWeight: 700,
                color: 'var(--state-warning-text)',
                background: 'var(--state-warning-bg)',
                border: '1px solid var(--state-warning-border)',
                padding: '0.15rem 0.55rem',
                borderRadius: 'var(--radius-full)'
              }}
            >
              <AlertTriangle size={13} aria-hidden="true" />
              <span>Under Review</span>
            </span>
          ) : (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.72rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                background: 'var(--surface-bg)',
                border: '1px solid var(--border-subtle)',
                padding: '0.15rem 0.55rem',
                borderRadius: 'var(--radius-full)'
              }}
            >
              <Clock size={12} aria-hidden="true" />
              <span>In Development</span>
            </span>
          )}

          {/* Toggle Expand / Collapse */}
          <button
            type="button"
            className="icon-btn-sm"
            onClick={() => setIsExpanded((v) => !v)}
            title={isExpanded ? 'Collapse ISL Panel' : 'Expand ISL Panel'}
            aria-label={isExpanded ? 'Collapse ISL Panel' : 'Expand ISL Panel'}
            aria-expanded={isExpanded}
          >
            {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div style={{ padding: '1rem' }}>
          {/* CASE 1: NO AUTHENTIC RESOURCE AVAILABLE (HONEST UNAVAILABLE STATE) */}
          {!resource ? (
            <div
              style={{
                padding: '1.75rem 1rem',
                textAlign: 'center',
                borderRadius: 'var(--radius-sm)',
                border: '1px dashed var(--border-medium)',
                background: 'var(--surface-elevated)'
              }}
            >
              <VideoOff size={34} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
              <h4 style={{ fontSize: '0.98rem', fontWeight: 700, margin: '0 0 0.35rem', color: 'var(--text-primary)' }}>
                Authentic ISL Video in Development
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 0.75rem', lineHeight: 1.5 }}>
                ConceptLens only delivers authentic, human-reviewed Indian Sign Language videos created by certified ISL educators.
                We do not substitute fake 3D avatars or unvalidated gesture generation.
              </p>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Please use the standard Read, Step-by-Step, and Visual Model representations while this ISL lesson is being recorded.
              </span>
            </div>
          ) : (
            /* CASE 2: AUTHENTIC ISL RESOURCE EXISTS */
            <div>
              {/* SUB-TABS: Video Player, Synchronized Cues, Provenance & Attribution */}
              <div
                style={{
                  display: 'flex',
                  gap: '0.35rem',
                  marginBottom: '0.85rem',
                  borderBottom: '1px solid var(--border-subtle)',
                  paddingBottom: '0.4rem'
                }}
              >
                <button
                  type="button"
                  className={`tag-btn ${activeTab === 'video' ? 'active' : ''}`}
                  onClick={() => setActiveTab('video')}
                  style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
                >
                  <span>Video Player</span>
                </button>
                <button
                  type="button"
                  className={`tag-btn ${activeTab === 'transcript' ? 'active' : ''}`}
                  onClick={() => setActiveTab('transcript')}
                  style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
                >
                  <span>Transcript & Cues ({resource.cues?.length || 0})</span>
                </button>
                <button
                  type="button"
                  className={`tag-btn ${activeTab === 'provenance' ? 'active' : ''}`}
                  onClick={() => setActiveTab('provenance')}
                  style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
                >
                  <span>Attribution & Licensing</span>
                </button>
              </div>

              {/* TAB 1: ACCESSIBLE VIDEO CONTAINER & CONTROLS */}
              {activeTab === 'video' && (
                <div>
                  <div
                    tabIndex={0}
                    onKeyDown={handleKeyDown}
                    style={{
                      position: 'relative',
                      width: '100%',
                      aspectRatio: '16/9',
                      maxHeight: isCompact ? '240px' : '360px',
                      background: '#000000',
                      borderRadius: 'var(--radius-sm)',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      outline: 'none'
                    }}
                    aria-label="Video player container. Press Space to play or pause, Left/Right arrows to seek, M to mute."
                  >
                    <video
                      ref={videoRef}
                      src={resource.videoUrl}
                      poster={resource.posterUrl}
                      playsInline
                      preload="metadata"
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      aria-label={resource.title}
                    />

                    {/* Loading Spinner */}
                    {isLoading && (
                      <div
                        style={{
                          position: 'absolute',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          background: 'rgba(0, 0, 0, 0.75)',
                          color: '#ffffff',
                          padding: '0.5rem 0.9rem',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.8rem'
                        }}
                      >
                        <RefreshCw size={14} className="spin" />
                        <span>Loading ISL video...</span>
                      </div>
                    )}

                    {/* Playback Error Overlay */}
                    {playbackError && (
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'rgba(0, 0, 0, 0.85)',
                          color: '#ffffff',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '1rem',
                          textAlign: 'center'
                        }}
                      >
                        <AlertTriangle size={28} color="var(--accent-amber)" style={{ marginBottom: '0.4rem' }} />
                        <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>Video Stream Unavailable</div>
                        <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '0.25rem' }}>
                          {playbackError}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ACCESSIBLE CONTROL BAR */}
                  <div
                    style={{
                      marginTop: '0.75rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem'
                    }}
                  >
                    {/* Time Scrubber Slider */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <input
                        type="range"
                        min={0}
                        max={duration || 100}
                        step={0.1}
                        value={currentTime}
                        onChange={handleSeek}
                        aria-label="Video progress slider"
                        style={{ flex: 1, accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
                      />
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--text-secondary)',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>

                    {/* Primary Button Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        {/* Play / Pause */}
                        <button
                          type="button"
                          className="btn-primary"
                          onClick={handleTogglePlay}
                          style={{ padding: '0.4rem 0.85rem', fontSize: '0.82rem' }}
                          aria-label={isPlaying ? 'Pause ISL video' : 'Play ISL video'}
                        >
                          {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                          <span>{isPlaying ? 'Pause' : 'Play'}</span>
                        </button>

                        {/* Replay */}
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={handleReplay}
                          style={{ padding: '0.4rem 0.65rem', fontSize: '0.82rem' }}
                          title="Replay from beginning"
                          aria-label="Replay from beginning"
                        >
                          <RotateCcw size={14} />
                        </button>

                        {/* Mute Toggle */}
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={handleToggleMute}
                          style={{ padding: '0.4rem 0.65rem', fontSize: '0.82rem' }}
                          title={isMuted ? 'Unmute' : 'Mute'}
                          aria-label={isMuted ? 'Unmute' : 'Mute'}
                        >
                          {isMuted || volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
                        </button>

                        {/* Volume Range */}
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.05}
                          value={isMuted ? 0 : volume}
                          onChange={handleVolumeChange}
                          aria-label="Volume level"
                          style={{ width: '60px', accentColor: 'var(--accent-cyan)' }}
                        />
                      </div>

                      {/* Video Topic Title */}
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        {resource.title}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: SYNCHRONIZED TRANSCRIPT CUES (Interactive Keyword Jumping) */}
              {activeTab === 'transcript' && (
                <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                    {resource.description}
                  </p>

                  {resource.cues && resource.cues.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {resource.cues.map((cue) => {
                        const isActive = currentTime >= cue.startTimeSec && currentTime <= cue.endTimeSec;
                        return (
                          <button
                            key={cue.id}
                            type="button"
                            onClick={() => handleSeekToCue(cue.startTimeSec, cue.text)}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '0.6rem',
                              textAlign: 'left',
                              padding: '0.45rem 0.75rem',
                              borderRadius: 'var(--radius-sm)',
                              border: isActive ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                              background: isActive ? 'rgba(29, 106, 159, 0.12)' : 'var(--surface-bg)',
                              cursor: 'pointer',
                              width: '100%'
                            }}
                          >
                            <span
                              style={{
                                fontSize: '0.72rem',
                                fontFamily: 'var(--font-mono)',
                                color: isActive ? 'var(--accent-cyan)' : 'var(--text-muted)',
                                fontWeight: 700,
                                paddingTop: '1px'
                              }}
                            >
                              {cue.timeLabel}
                            </span>
                            <span
                              style={{
                                fontSize: '0.8rem',
                                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                                lineHeight: 1.4
                              }}
                            >
                              {cue.text}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Full transcript: {resource.transcript || 'No extended transcript available.'}
                    </p>
                  )}
                </div>
              )}

              {/* TAB 3: PROVENANCE, REVIEWER METADATA & LICENSING */}
              {activeTab === 'provenance' && (
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                  <div style={{ marginBottom: '0.65rem' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>Source Repository: </strong>
                    <span>{resource.source}</span>
                  </div>

                  <div style={{ marginBottom: '0.65rem' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>Attribution: </strong>
                    <span>{resource.attribution}</span>
                  </div>

                  <div style={{ marginBottom: '0.65rem' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>License: </strong>
                    <span>{resource.license}</span>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {resource.isCommercialAllowed ? 'Permits commercial use' : 'Strictly non-commercial educational use'}
                    </div>
                  </div>

                  {resource.reviewerMetadata && (
                    <div
                      style={{
                        marginTop: '0.75rem',
                        padding: '0.65rem',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--state-success-bg)',
                        border: '1px solid var(--state-success-border)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--state-success-text)', fontWeight: 700, fontSize: '0.78rem' }}>
                        <ShieldCheck size={14} />
                        <span>Reviewer Credentials</span>
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                        <strong>{resource.reviewerMetadata.reviewerName}</strong> ({resource.reviewerMetadata.organization})
                      </div>
                      {resource.reviewerMetadata.certification && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Certification: {resource.reviewerMetadata.certification}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default ISLVideoPanel;
