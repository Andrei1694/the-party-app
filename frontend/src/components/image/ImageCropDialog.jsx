import { useEffect, useState } from 'react';
import Cropper from 'react-easy-crop';

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.01;

const ImageCropDialog = ({
  open,
  imageSrc,
  aspect = 1,
  isProcessing = false,
  onCancel,
  onConfirm,
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [cropAreaPixels, setCropAreaPixels] = useState(null);

  useEffect(() => {
    if (!open || isProcessing) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onCancel?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isProcessing, onCancel, open]);

  const handleConfirm = () => {
    if (!cropAreaPixels || isProcessing) {
      return;
    }

    onConfirm?.(cropAreaPixels);
  };

  if (!open || !imageSrc) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[1px]" aria-hidden="true" />

      <div className="relative z-10 flex min-h-full items-end justify-center sm:items-center sm:p-6">
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="image-crop-title"
          className="w-full bg-cusens-surface text-cusens-text-primary shadow-2xl sm:max-w-2xl sm:rounded-3xl"
        >
          <header className="flex items-center justify-between border-b border-cusens-border px-4 py-3 sm:px-5">
            <h2 id="image-crop-title" className="text-base font-bold sm:text-lg">
              Crop image
            </h2>
            <button
              type="button"
              onClick={onCancel}
              disabled={isProcessing}
              aria-label="Close crop dialog"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-cusens-border text-cusens-text-primary transition hover:bg-cusens-bg disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="material-icons text-[18px]">close</span>
            </button>
          </header>

          <div className="relative h-[52vh] min-h-[320px] w-full bg-black sm:h-[460px]">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              objectFit="cover"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, areaPixels) => setCropAreaPixels(areaPixels)}
            />
          </div>

          <div className="space-y-4 px-4 pb-5 pt-4 sm:px-5 sm:pb-6">
            <div>
              <label htmlFor="cropZoom" className="mb-2 block text-sm font-semibold text-cusens-text-secondary">
                Zoom
              </label>
              <input
                id="cropZoom"
                type="range"
                min={MIN_ZOOM}
                max={MAX_ZOOM}
                step={ZOOM_STEP}
                value={zoom}
                onChange={(event) => setZoom(Number(event.target.value))}
                disabled={isProcessing}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-cusens-border accent-cusens-primary disabled:cursor-not-allowed"
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onCancel}
                disabled={isProcessing}
                className="rounded-xl border border-cusens-border px-4 py-2 text-sm font-semibold text-cusens-text-primary transition hover:bg-cusens-bg disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isProcessing || !cropAreaPixels}
                className="rounded-xl bg-cusens-primary px-4 py-2 text-sm font-bold text-cusens-text-primary transition hover:bg-cusens-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isProcessing ? 'Processing...' : 'Use image'}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ImageCropDialog;
