import { useState, useEffect } from 'react';

/**
 * Custom hook to handle file selection and preview
 */
export const useFileSelection = (allowedTypes = []) => {
    const [file, setFile] = useState(null);
    const [error, setError] = useState(null);

    const handleFileChange = (selectedFile) => {
        if (!selectedFile) return;

        if (allowedTypes.length > 0) {
            const fileName = selectedFile.name.toLowerCase();
            const isValid = allowedTypes.some(type => fileName.endsWith(type));

            if (!isValid) {
                setError(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`);
                setFile(null);
                return;
            }
        }

        setFile(selectedFile);
        setError(null);
    };

    const clearFile = () => {
        setFile(null);
        setError(null);
    };

    return { file, error, handleFileChange, clearFile, setFile };
};
