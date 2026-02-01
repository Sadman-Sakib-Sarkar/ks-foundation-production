import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import api from '../lib/axios';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Send, Mail, MapPin, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import RecaptchaNotice from '../components/RecaptchaNotice';

const ContactPage = () => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const [submitting, setSubmitting] = useState(false);
    const { executeRecaptcha } = useGoogleReCaptcha();

    const onSubmit = useCallback(async (data) => {
        if (!executeRecaptcha) {
            toast.error('reCAPTCHA not ready. Please try again.');
            return;
        }

        setSubmitting(true);
        try {
            // Get reCAPTCHA token
            const recaptchaToken = await executeRecaptcha('contact');

            // Send with reCAPTCHA token
            await api.post('/core/contact/', {
                ...data,
                recaptcha_token: recaptchaToken
            });
            toast.success('Message sent successfully! We will get back to you soon.');
            reset();
        } catch (error) {
            console.error('Failed to send message', error);
            if (error.response?.data?.recaptcha) {
                toast.error(error.response.data.recaptcha);
            } else {
                toast.error('Failed to send message. Please try again.');
            }
        } finally {
            setSubmitting(false);
        }
    }, [executeRecaptcha, reset]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl">
                        Contact Us
                    </h1>
                    <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
                        We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Contact Info */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden p-8 flex flex-col justify-between">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Get in Touch</h3>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full shrink-0">
                                        <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">Email Us</p>
                                        <p className="text-gray-600 dark:text-gray-400">contact@ksfoundation.org</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full shrink-0">
                                        <MapPin className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">Visit Us</p>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            Kashimuddin Sarkar Foundation<br />
                                            Thakurgaon, Bangladesh
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full shrink-0">
                                        <Phone className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">Call Us</p>
                                        <p className="text-gray-600 dark:text-gray-400">+880 1712-345678</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-700">
                            <p className="text-sm text-gray-500 italic">
                                "Building a stronger community through knowledge, health, and compassion."
                            </p>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Name
                                </label>
                                <Input
                                    id="name"
                                    {...register('name', { required: 'Name is required' })}
                                    className="mt-1"
                                    placeholder="Your Name"
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Email
                                </label>
                                <Input
                                    id="email"
                                    type="email"
                                    {...register('email', {
                                        required: 'Email is required',
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: "Invalid email address"
                                        }
                                    })}
                                    className="mt-1"
                                    placeholder="your@email.com"
                                />
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                            </div>

                            <div>
                                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Subject
                                </label>
                                <Input
                                    id="subject"
                                    {...register('subject', { required: 'Subject is required' })}
                                    className="mt-1"
                                    placeholder="How can we help?"
                                />
                                {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>}
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Message
                                </label>
                                <textarea
                                    id="message"
                                    rows={4}
                                    {...register('message', { required: 'Message is required' })}
                                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="Your message here..."
                                />
                                {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
                            </div>

                            <Button type="submit" disabled={submitting} className="w-full flex justify-center gap-2">
                                {submitting ? 'Sending...' : 'Send Message'}
                                <Send className="h-4 w-4" />
                            </Button>

                            <RecaptchaNotice className="mt-4 text-center" />
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
