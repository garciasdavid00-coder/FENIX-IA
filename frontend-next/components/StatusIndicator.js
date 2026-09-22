'use client';

import React, { useState, useEffect } from 'react';

export default function StatusIndicator({ phase, label }) {
  if (!phase || !label) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        opacity: 0.7,
        padding: '8px 12px',
        fontSize: '0.95rem',
        color: 'var(--text-muted, #666)',
        fontFamily: 'inherit',
      }}
    >
      <style>{`
        @keyframes pulseGlow {
          0%, 100% { transform: scale(0.95); opacity: 0.7; filter: drop-shadow(0 0 4px rgba(217,119,87,0.3)); }
          50% { transform: scale(1.1); opacity: 1; filter: drop-shadow(0 0 8px rgba(217,119,87,0.7)); }
        }
        @keyframes shimmerText {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .status-star {
          color: #d97757;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: pulseGlow 2s ease-in-out infinite;
        }
        .status-star svg {
          width: 18px;
          height: 18px;
          animation: spinStar 8s linear infinite;
        }
        @keyframes spinStar {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .status-text {
          background: linear-gradient(90deg, var(--text-muted, #888) 0%, var(--text-main, #111) 50%, var(--text-muted, #888) 100%);
          background-size: 200% auto;
          color: transparent;
          -webkit-background-clip: text;
          background-clip: text;
          animation: shimmerText 3s linear infinite;
          font-weight: 500;
        }
        
        @media (prefers-color-scheme: dark) {
          .status-text {
            background: linear-gradient(90deg, var(--text-muted, #888) 0%, var(--text-main, #fff) 50%, var(--text-muted, #888) 100%);
            background-size: 200% auto;
            -webkit-background-clip: text;
            background-clip: text;
          }
        }
      `}</style>
      <div className="status-star">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 1.5C12.3 6.5 16.5 10.7 21.5 11C21.8 11.05 22 11.3 22 11.5C22 11.7 21.8 11.95 21.5 12C16.5 12.3 12.3 16.5 12 21.5C11.95 21.8 11.7 22 11.5 22C11.3 22 11.05 21.8 11 21.5C10.7 16.5 6.5 12.3 1.5 12C1.2 11.95 1 11.7 1 11.5C1 11.3 1.2 11.05 1.5 11C6.5 10.7 10.7 6.5 11 1.5C11.05 1.2 11.3 1 11.5 1C11.7 1 11.95 1.2 12 1.5Z" />
        </svg>
      </div>
      <span className="status-text">
        {label}
      </span>
    </div>
  );
}
