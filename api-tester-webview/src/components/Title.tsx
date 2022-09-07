import React from 'react';

export function Title({ folderName, fileName }) {
    if (folderName)
        return (
            <h4>
                <span style={{ color: 'var(--panel-tab-foreground)', fontWeight: '300' }}>{folderName} / </span>
                {fileName}
            </h4>
        );

    return <h4>{fileName}</h4>;
}
