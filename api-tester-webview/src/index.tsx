import React from 'react';
import { createRoot } from 'react-dom/client';
import { Editor } from './components/Editor';

const container = document.getElementById('app');
if (container) {
    const root = createRoot(container);
    root.render(<Editor />);
}
