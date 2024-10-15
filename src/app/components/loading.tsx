'use client';

export default function Loading() {
  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: '2rem',
      }}
    >
      Loading...
    </div>
  );
}
