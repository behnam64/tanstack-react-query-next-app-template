'use client';
import React from 'react';

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div
        style={{
          fontSize: '1.3rem',
          marginBottom: '1rem',
          marginTop: '1rem',
        }}
      >
        todos:
      </div>
      {children}
    </>
  );
}
