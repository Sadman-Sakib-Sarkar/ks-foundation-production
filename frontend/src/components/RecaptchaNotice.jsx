import React from 'react';

/**
 * reCAPTCHA policy notice component
 * Required when hiding the reCAPTCHA badge per Google's guidelines
 */
const RecaptchaNotice = ({ className = '' }) => {
    return (
        <p className={`text-xs text-gray-500 dark:text-gray-400 ${className}`}>
            This site is protected by reCAPTCHA and the Google{' '}
            <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
            >
                Privacy Policy
            </a>{' '}
            and{' '}
            <a
                href="https://policies.google.com/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
            >
                Terms of Service
            </a>{' '}
            apply.
        </p>
    );
};

export default RecaptchaNotice;
