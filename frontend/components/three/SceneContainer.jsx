'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import WebGLFallback from './WebGLFallback';

const DynamicNeuralScene = dynamic(() => import('./NeuralNetworkScene'), {
  ssr: false,
  loading: () => <WebGLFallback />,
});

export default function SceneContainer() {
  const [hasWebGL, setHasWebGL] = useState(null);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl =
        canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      setHasWebGL(Boolean(gl));
    } catch {
      setHasWebGL(false);
    }
  }, []);

  if (hasWebGL === false) {
    return <WebGLFallback />;
  }

  if (hasWebGL === null) {
    return <WebGLFallback />;
  }

  return <DynamicNeuralScene />;
}
