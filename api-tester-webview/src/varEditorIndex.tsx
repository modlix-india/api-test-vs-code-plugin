import React from 'react';
import { createRoot } from 'react-dom/client';

import { VarEditorLauncher } from './components/VarEditorLauncher';

const container = document.getElementById('app');
if (container) {
    const root = createRoot(container);
    root.render(<VarEditorLauncher />);
}
