import { FileUpload } from '@arshad-shah/cynosure-react';
import { useState } from 'react';

export default function Example() {
  const [error, setError] = useState<string | null>(null);
  return (
    <div style={{ width: 420 }}>
      <FileUpload
        multiple
        accept="image/*,.pdf"
        maxSize={5 * 1024 * 1024}
        onError={(e) => setError(e.message)}
        onFilesChange={() => setError(null)}
      />
      {error ? (
        <p style={{ marginTop: '0.5rem', color: 'var(--cynosure-color-danger-solid)' }}>{error}</p>
      ) : null}
    </div>
  );
}
