import React from 'react';
import { Quote } from 'lucide-react';

const OurVisionPage = () => {
    return (
        <div className="max-w-4xl mx-auto py-12 px-4 space-y-12">
            <div className="text-center space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
                    Our Vision
                </h1>
                <div className="h-1 w-24 bg-blue-500 mx-auto rounded-full"></div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                <div className="absolute top-0 left-0 p-4 opacity-10">
                    <Quote size={120} className="text-blue-600 dark:text-blue-400" />
                </div>

                <div className="relative z-10 space-y-8">
                    <p className="text-xl md:text-2xl leading-relaxed text-gray-700 dark:text-gray-300 font-medium text-center italic">
                        "At Kasimuddin Sarkar Foundation, our vision is to cultivate a vibrant and inclusive hub of knowledge and culture, where every member of our community is empowered to pursue lifelong learning, develop modern skills, improve health/wellbeing and inspire one another through the transformative power of books, digital resources and shared experiences."
                    </p>

                    <div className="flex flex-col items-center justify-center space-y-2 pt-6 border-t border-gray-100 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wide">
                            MD Azam
                        </h3>
                        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium text-center">
                            Chief Coordinator and Mentor<br />
                            <span className="text-gray-500 dark:text-gray-500">Kasimuddin Sarkar Foundation</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OurVisionPage;
