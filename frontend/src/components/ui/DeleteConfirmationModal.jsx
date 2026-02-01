import React from 'react';
import { Button } from './Button';

const DeleteConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Delete Item?",
    message = "Are you sure you want to delete this item? This action cannot be undone.",
    confirmText = "Delete",
    confirmButtonClass = "bg-red-600 hover:bg-red-700 text-white"
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full shadow-xl">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
                <div className="flex justify-end gap-3">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button variant="destructive" onClick={onConfirm} className={confirmButtonClass}>{confirmText}</Button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;
