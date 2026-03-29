import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface UploadedFile {
  file: File;
  id: string;
  preview: string | null;
  pages: number;
  status: 'uploading' | 'done' | 'error';
  progress: number;
}

export default function UploadPDF() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);
  const [topic, setTopic] = useState('');

  const processFile = useCallback((file: File) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const entry: UploadedFile = {
      file,
      id,
      preview: null,
      pages: 0,
      status: 'uploading',
      progress: 0,
    };

    // Create a URL for PDF preview
    entry.preview = URL.createObjectURL(file);

    setFiles((prev) => [...prev, entry]);

    // Simulate upload progress
    let prog = 0;
    const interval = setInterval(() => {
      prog += Math.random() * 25 + 10;
      if (prog >= 100) {
        prog = 100;
        clearInterval(interval);
        setFiles((prev) =>
          prev.map((f) => (f.id === id ? { ...f, progress: 100, status: 'done', pages: Math.floor(Math.random() * 20) + 1 } : f))
        );
      } else {
        setFiles((prev) =>
          prev.map((f) => (f.id === id ? { ...f, progress: Math.min(prog, 99) } : f))
        );
      }
    }, 300);
  }, []);

  const handleFiles = useCallback(
    (incoming: FileList | null) => {
      if (!incoming) return;
      Array.from(incoming).forEach((f) => {
        if (f.type === 'application/pdf') processFile(f);
      });
    },
    [processFile]
  );

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const f = prev.find((x) => x.id === id);
      if (f?.preview) URL.revokeObjectURL(f.preview);
      return prev.filter((x) => x.id !== id);
    });
    if (previewFile?.id === id) setPreviewFile(null);
  };

  const hasFiles = files.length > 0;
  const isUploadPending = files.some((f) => f.status !== 'done');
  const hasTopic = topic.trim().length > 0;
  const canContinue = (hasFiles || hasTopic) && !isUploadPending;

  const handleContinue = () => {
    navigate('/video');
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <motion.div
      className="upload-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div className={`upload-layout ${previewFile ? 'upload-layout--preview' : ''}`}>
        {/* ── Left: Upload area + file list ──────────────────────── */}
        <div className="upload-left">
          {/* Drop Zone */}
          <div
            className={`upload-drop ${isDragging ? 'upload-drop--active' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="upload-drop__icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="12" y2="12" />
                <line x1="15" y1="15" x2="12" y2="12" />
              </svg>
            </div>
            <p className="upload-drop__title">
              {isDragging ? 'Drop PDF here' : 'Drag & drop your PDF files here'}
            </p>
            <p className="upload-drop__sub">or click to browse</p>
            <span className="upload-drop__badge">PDF only • Max 50 MB</span>
          </div>

          {/* Topic Input */}
          <div className="upload-topic">
            <label className="upload-topic__label" htmlFor="upload-topic">
              What would you like to study?
            </label>
            <textarea
              id="upload-topic"
              className="upload-topic__input"
              placeholder="e.g. Neural Networks, Projectile Motion, Organic Chemistry..."
              rows={3}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          {/* File List & Continue Button */}
          {(hasFiles || hasTopic) && (
            <div className="upload-files">
              {hasFiles && (
                <>
                  <div className="upload-files__header">
                    <span className="upload-files__count">{files.length} file{files.length > 1 ? 's' : ''}</span>
                    {!isUploadPending && (
                      <span className="upload-files__ready">✓ All ready</span>
                    )}
                  </div>

                  <AnimatePresence>
                {files.map((f) => (
                  <motion.div
                    key={f.id}
                    className={`upload-file ${previewFile?.id === f.id ? 'upload-file--selected' : ''}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    layout
                  >
                    <div
                      className="upload-file__main"
                      onClick={() => f.status === 'done' && setPreviewFile(f)}
                      style={{ cursor: f.status === 'done' ? 'pointer' : 'default' }}
                    >
                      <div className="upload-file__icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ce5522" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                      </div>
                      <div className="upload-file__info">
                        <span className="upload-file__name">{f.file.name}</span>
                        <span className="upload-file__meta">
                          {formatSize(f.file.size)}
                          {f.status === 'done' && ` • ${f.pages} pages`}
                        </span>
                      </div>
                      <div className="upload-file__status">
                        {f.status === 'uploading' && (
                          <div className="upload-file__spinner" />
                        )}
                        {f.status === 'done' && (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                    </div>

                    {/* Progress bar */}
                    {f.status === 'uploading' && (
                      <div className="upload-file__bar">
                        <div className="upload-file__bar-fill" style={{ width: `${f.progress}%` }} />
                      </div>
                    )}

                    {/* Remove button */}
                    <button className="upload-file__remove" onClick={(e) => { e.stopPropagation(); removeFile(f.id); }} title="Remove">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
              </>
              )}

              {/* Continue button */}
              <motion.button
                className={`upload-continue ${canContinue ? 'upload-continue--ready' : ''}`}
                onClick={handleContinue}
                disabled={!canContinue}
                whileHover={canContinue ? { scale: 1.02 } : {}}
                whileTap={canContinue ? { scale: 0.98 } : {}}
              >
                {isUploadPending ? (
                  'Uploading...'
                ) : (
                  <>
                    Continue to Videos
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                    </svg>
                  </>
                )}
              </motion.button>
            </div>
          )}
        </div>

        {/* ── Right: PDF Preview ─────────────────────────────────── */}
        <AnimatePresence>
          {previewFile && (
            <motion.div
              className="upload-preview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
            >
              <div className="upload-preview__header">
                <span className="upload-preview__name">{previewFile.file.name}</span>
                <button className="upload-preview__close" onClick={() => setPreviewFile(null)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <div className="upload-preview__body">
                <iframe
                  src={previewFile.preview || ''}
                  title="PDF Preview"
                  className="upload-preview__iframe"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
