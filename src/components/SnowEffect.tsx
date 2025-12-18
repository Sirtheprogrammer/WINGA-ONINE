import React, { useEffect, useState } from 'react';

export const SnowEffect: React.FC = () => {
  const [snowflakes, setSnowflakes] = useState<Array<{ id: number; left: number; delay: number; duration: number }>>([]);

  useEffect(() => {
    // Create 50 snowflakes
    const flakes = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 10 + Math.random() * 10
    }));
    setSnowflakes(flakes);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute text-white opacity-75 animate-snow select-none"
          style={{
            left: `${flake.left}%`,
            top: '-10px',
            animationDelay: `${flake.delay}s`,
            animationDuration: `${flake.duration}s`
          }}
        >
          ❄
        </div>
      ))}
    </div>
  );
};

