import React, { useState, useEffect } from 'react';
import api from '../lib/axios';

const Carousel = () => {
    const [slides, setSlides] = useState([]);
    const [current, setCurrent] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSlides = async () => {
            try {
                const response = await api.get('/core/carousel/');
                // Handle paginated response and filter only active slides
                const data = response.data.results || response.data;
                const activeSlides = Array.isArray(data)
                    ? data.filter(slide => slide.is_active).sort((a, b) => a.order - b.order)
                    : [];

                if (activeSlides.length > 0) {
                    setSlides(activeSlides);
                } else {
                    // Fallback if no active carousel items
                    setSlides([
                        {
                            id: 1,
                            image: 'https://via.placeholder.com/1200x400?text=Welcome+to+KS+Foundation',
                            title: 'Serving the Community',
                            caption: 'Dedicated to education and health.'
                        }
                    ]);
                }
            } catch (error) {
                console.error("Failed to fetch carousel", error);
                setSlides([
                    {
                        id: 1,
                        image: 'https://via.placeholder.com/1200x400?text=Welcome+to+KS+Foundation',
                        title: 'Serving the Community',
                        caption: 'Dedicated to education and health.'
                    }
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchSlides();
    }, []);

    useEffect(() => {
        if (slides.length <= 1) return;
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [slides.length]);

    if (loading) return <div className="h-[400px] bg-gray-100 animate-pulse rounded-lg"></div>;

    return (
        <div className="relative w-full h-[400px] overflow-hidden rounded-lg shadow-md mb-8 group">
            {slides.map((slide, index) => (
                <div
                    key={slide.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ${index === current ? 'opacity-100' : 'opacity-0'}`}
                >
                    <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white p-8 pt-20">
                        <h3 className="text-3xl font-bold mb-2">{slide.title}</h3>
                        <p className="text-lg opacity-90">{slide.caption}</p>
                    </div>
                </div>
            ))}

            {slides.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {slides.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrent(idx)}
                            className={`w-3 h-3 rounded-full transition-colors ${idx === current ? 'bg-white' : 'bg-white/50 hover:bg-white/80'}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Carousel;
