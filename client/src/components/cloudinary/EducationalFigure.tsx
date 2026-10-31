import React, { useEffect, useMemo, useState } from 'react';
import { AdvancedImage, lazyload, placeholder, responsive } from '@cloudinary/react';
import { lessonImageWidth } from '@conceptlens/shared';
import { educationalAsset } from '../../data/educationalMedia';
import { buildEducationalImage } from '../../cloudinary/educationalImage';

interface EducationalFigureProps {
  conceptId: string;
  lowData: boolean;
  /** When true, the image request waits for an explicit button press. */
  deferUntilRequested?: boolean;
  /** Skip lazy-load after the learner has asked to see this figure. */
  eager?: boolean;
  /** Increment to request the diagram from a recommendation without autoplay. */
  requestToken?: number;
}

export const EducationalFigure: React.FC<EducationalFigureProps> = ({
  conceptId,
  lowData,
  deferUntilRequested = false,
  eager = false,
  requestToken = 0
}) => {
  const asset = educationalAsset(conceptId);
  const [requested, setRequested] = useState(false);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setRequested(false);
    setFailed(false);
    setLoading(false);
    setAttempt(0);
  }, [conceptId]);

  useEffect(() => {
    if (requestToken > 0) setRequested(true);
  }, [requestToken]);

  const showImage = Boolean(asset) && !failed && (!deferUntilRequested || requested);
  const image = useMemo(
    () => (asset && showImage ? buildEducationalImage(asset.remoteUrl, lowData) : null),
    [asset, showImage, lowData]
  );

  useEffect(() => {
    setLoading(Boolean(showImage && image));
  }, [showImage, image, attempt]);

  if (!asset) {
    return <p>No labeled diagram is stored for this lesson. The written explanation still applies.</p>;
  }

  const displayWidth = lessonImageWidth(lowData);
  const displayHeight = Math.max(1, Math.round((asset.height / asset.width) * displayWidth));
  const plugins = eager || requested
    ? [responsive(), placeholder({ mode: 'blur' })]
    : [responsive(), placeholder({ mode: 'blur' }), lazyload()];

  return (
    <figure className="edu-figure" id="labeled-diagram">
      <figcaption>
        <strong>{asset.caption}</strong>
      </figcaption>
      <details className="edu-source">
        <summary>Image source</summary>
        <p>
          Source: {asset.creator}, {asset.sourceTitle}. License: {asset.license}.{' '}
          <a href={asset.sourceUrl} target="_blank" rel="noreferrer">
            Wikimedia Commons
          </a>
          . Delivered through Cloudinary with a width limit of {displayWidth}px so labels are not cropped, automatic format, and{' '}
          {lowData ? 'low automatic quality' : 'automatic quality'}. This does not make the lesson work offline.
        </p>
      </details>
      {deferUntilRequested && !requested && !failed && (
        <button type="button" className="btn-secondary" onClick={() => setRequested(true)}>
          Show the labeled diagram
        </button>
      )}
      {loading && showImage && <p role="status">Loading the labeled diagram.</p>}
      {showImage && image && (
        <AdvancedImage
          key={`${conceptId}-${displayWidth}-${attempt}`}
          cldImg={image}
          alt={asset.alt}
          width={displayWidth}
          height={displayHeight}
          plugins={plugins}
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setFailed(true);
          }}
        />
      )}
      {failed && (
        <div role="status" className="edu-error">
          <p>The diagram could not be loaded. You can keep going with the written lesson. Nothing essential is only in the picture.</p>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setFailed(false);
              setRequested(true);
              setAttempt((value) => value + 1);
            }}
          >
            Try the diagram again
          </button>
        </div>
      )}
    </figure>
  );
};
