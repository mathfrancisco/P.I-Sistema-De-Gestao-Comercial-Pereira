
// components/products/CategoryTabs.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Package, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/loading';

interface Category {
    id: number;
    name: string;
    cnae?: string;
    count: number;
    icon?: React.ComponentType;
}

interface CategoryTabsProps {
    categories: Category[];
    activeCategory?: number | null;
    onCategoryChange: (categoryId: number | null) => void;
    loading?: boolean;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
                                                              categories,
                                                              activeCategory,
                                                              onCategoryChange,
                                                              loading = false
                                                          }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showLeftScroll, setShowLeftScroll] = useState(false);
    const [showRightScroll, setShowRightScroll] = useState(false);

    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setShowLeftScroll(scrollLeft > 0);
            setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 1);
        }
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        return () => window.removeEventListener('resize', checkScroll);
    }, [categories]);

    const scrollLeft = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
        }
    };

    if (loading) {
        return (
            <div className="bg-white border-b border-gray-200 p-4">
                <div className="flex space-x-4">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} width="128px" height="40px" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border-b border-gray-200 p-4 relative">
            {/* Scroll buttons nas extremidades em mobile */}
            {showLeftScroll && (
                <button
                    onClick={scrollLeft}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
            )}

            {showRightScroll && (
                <button
                    onClick={scrollRight}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            )}

            {/* Tabs horizontais scrolláveis */}
            <div
                ref={scrollRef}
                className="flex space-x-2 overflow-x-auto scrollbar-hide"
                onScroll={checkScroll}
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {/* All tab como primeira opção padrão */}
                <button
                    onClick={() => onCategoryChange(null)}
                    className={`flex items-center px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                        activeCategory === null
                            ? 'bg-purple-100 text-purple-700 border-b-2 border-purple-600'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                    <Package className="w-4 h-4 mr-2" />
                    Todas ({categories.reduce((sum, cat) => sum + cat.count, 0)})
                </button>

                {/* Tabs das 8 categorias CNAE */}
                {categories.map((category) => {
                    const IconComponent = category.icon || Tag;
                    return (
                        <button
                            key={category.id}
                            onClick={() => onCategoryChange(category.id)}
                            className={`flex items-center px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                                activeCategory === category.id
                                    ? 'bg-purple-100 text-purple-700 border-b-2 border-purple-600'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                        >
                            {/* Ícone representativo opcional antes do nome */}
                            <IconComponent className="w-4 h-4 mr-2" />
                            {/* Nome da categoria e contador entre parênteses */}
                            {category.name} ({category.count})
                        </button>
                    );
                })}
            </div>
        </div>
    );
};