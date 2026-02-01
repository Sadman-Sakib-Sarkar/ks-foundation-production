import React, { useRef, useState, useEffect } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

const ImageUpload = ({ onChange, onRemove, value, existingUrl, className, accept = "image/*", placeholder = "Click to upload image" }) => {
    const inputRef = useRef(null);
    const [preview, setPreview] = useState(null);
    const [isRemoved, setIsRemoved] = useState(false);

    useEffect(() => {
        if (value instanceof File) {
            const objectUrl = URL.createObjectURL(value);
            setPreview(objectUrl);
            setIsRemoved(false);
            return () => URL.revokeObjectURL(objectUrl);
        } else if (typeof value === 'string' && value) {
            // value is an existing URL string
            setPreview(value);
            setIsRemoved(false);
        } else {
            setPreview(null);
        }
    }, [value]);

    // Reset isRemoved when existingUrl changes (e.g., when opening a different item)
    useEffect(() => {
        setIsRemoved(false);
    }, [existingUrl]);

    const displayImage = isRemoved ? null : (preview || existingUrl);

    const handleClick = () => {
        inputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setIsRemoved(false);
            onChange(file);
        }
    };

    const handleRemove = (e) => {
        e.stopPropagation();
        e.preventDefault();
        setIsRemoved(true);
        onChange(null);
        if (onRemove) onRemove();
        if (inputRef.current) inputRef.current.value = '';
    };

    return (
        <div
            onClick={handleClick}
            className={`border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all group min-h-[160px] ${className}`}
        >
            <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept={accept}
                onChange={handleFileChange}
            />

            {displayImage ? (
                <div className="relative w-full h-full flex items-center justify-center">
                    <img
                        src={displayImage}
                        alt="Preview"
                        className="max-h-[200px] w-auto object-contain rounded-md shadow-sm"
                    />
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors shadow-md z-10"
                        title="Remove image"
                    >
                        <X size={16} />
                    </button>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-md flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 bg-black/50 text-white text-xs px-2 py-1 rounded">Change Image</span>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-2 py-2 text-gray-500 dark:text-gray-400 group-hover:text-blue-500">
                    <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                        <Upload size={24} />
                    </div>
                    <span className="font-medium text-sm text-center">{placeholder}</span>
                </div>
            )}
        </div>
    );
};

export default ImageUpload;
