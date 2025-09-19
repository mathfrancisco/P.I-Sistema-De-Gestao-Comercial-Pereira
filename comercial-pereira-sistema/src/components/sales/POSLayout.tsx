// components/sales/POSLayout.tsx
'use client';

import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils/utils';
import { GripVertical, Maximize2, Minimize2 } from 'lucide-react';

interface POSLayoutProps {
    leftPanel: React.ReactNode;
    rightPanel: React.ReactNode;
    className?: string;
}

export const POSLayout: React.FC<POSLayoutProps> = ({
                                                        leftPanel,
                                                        rightPanel,
                                                        className
                                                    }) => {
    const [leftWidth, setLeftWidth] = useState(60); // Percentage
    const [isDragging, setIsDragging] = useState(false);
    const [isRightPanelMaximized, setIsRightPanelMaximized] = useState(false);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging) return;

        const container = document.querySelector('[data-pos-container]') as HTMLElement;
        if (!container) return;

        const containerRect = container.getBoundingClientRect();
        const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

        // Limit resize between 30% and 80%
        const clampedWidth = Math.max(30, Math.min(80, newLeftWidth));
        setLeftWidth(clampedWidth);
    }, [isDragging]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    React.useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    const toggleRightPanel = () => {
        setIsRightPanelMaximized(!isRightPanelMaximized);
        if (!isRightPanelMaximized) {
            setLeftWidth(20);
        } else {
            setLeftWidth(60);
        }
    };

    return (
        <div
            data-pos-container
            className={cn(
                'h-screen flex bg-gray-50 overflow-hidden',
                className
            )}
        >
            {/* Left Panel - Products */}
            <div
                className={cn(
                    'bg-white border-r border-gray-200 flex flex-col transition-all duration-300',
                    isRightPanelMaximized ? 'md:flex' : 'flex'
                )}
                style={{
                    width: `${leftWidth}%`,
                    minWidth: isRightPanelMaximized ? '200px' : '300px'
                }}
            >
                <div className="flex-1 overflow-hidden">
                    {leftPanel}
                </div>
            </div>

            {/* Resize Handle */}
            <div
                className={cn(
                    'group relative flex items-center justify-center w-2 bg-gray-100 hover:bg-gray-200 cursor-col-resize transition-colors',
                    isDragging && 'bg-blue-200'
                )}
                onMouseDown={handleMouseDown}
            >
                <div className="absolute inset-y-0 flex items-center justify-center">
                    <GripVertical className="w-3 h-3 text-gray-400 group-hover:text-gray-600" />
                </div>

                {/* Visual feedback line when dragging */}
                {isDragging && (
                    <div className="absolute inset-y-0 w-px bg-blue-500 left-1/2 transform -translate-x-1/2" />
                )}
            </div>

            {/* Right Panel - Cart & Checkout */}
            <div
                className={cn(
                    'bg-white flex flex-col transition-all duration-300 shadow-lg',
                    isRightPanelMaximized ? 'shadow-2xl' : 'shadow-md'
                )}
                style={{
                    width: `${100 - leftWidth}%`,
                    minWidth: '320px'
                }}
            >
                {/* Right Panel Header with controls */}
                <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
                    <h2 className="font-semibold text-gray-800">
                        {isRightPanelMaximized ? 'Finalizar Venda' : 'Carrinho'}
                    </h2>

                    <button
                        onClick={toggleRightPanel}
                        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors"
                        title={isRightPanelMaximized ? 'Minimizar painel' : 'Maximizar painel'}
                    >
                        {isRightPanelMaximized ? (
                            <Minimize2 className="w-4 h-4" />
                        ) : (
                            <Maximize2 className="w-4 h-4" />
                        )}
                    </button>
                </div>

                <div className="flex-1 overflow-hidden">
                    {rightPanel}
                </div>
            </div>

            {/* Mobile Overlay when dragging */}
            {isDragging && (
                <div className="fixed inset-0 bg-black bg-opacity-10 z-40 md:hidden" />
            )}
        </div>
    );
};

// Responsive wrapper for mobile
export const ResponsivePOSLayout: React.FC<POSLayoutProps> = (props) => {
    const [activePanel, setActivePanel] = useState<'products' | 'cart'>('products');

    return (
        <>
            {/* Desktop Layout */}
            <div className="hidden md:block h-screen">
                <POSLayout {...props} />
            </div>

            {/* Mobile Layout */}
            <div className="md:hidden h-screen flex flex-col bg-gray-50">
                {/* Mobile Tab Navigation */}
                <div className="flex bg-white border-b border-gray-200">
                    <button
                        onClick={() => setActivePanel('products')}
                        className={cn(
                            'flex-1 px-4 py-3 text-sm font-medium transition-colors',
                            activePanel === 'products'
                                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                                : 'text-gray-500 hover:text-gray-700'
                        )}
                    >
                        Produtos
                    </button>
                    <button
                        onClick={() => setActivePanel('cart')}
                        className={cn(
                            'flex-1 px-4 py-3 text-sm font-medium transition-colors',
                            activePanel === 'cart'
                                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                                : 'text-gray-500 hover:text-gray-700'
                        )}
                    >
                        Carrinho
                    </button>
                </div>

                {/* Mobile Panel Content */}
                <div className="flex-1 overflow-hidden">
                    {activePanel === 'products' ? (
                        <div className="h-full bg-white">
                            {props.leftPanel}
                        </div>
                    ) : (
                        <div className="h-full bg-white">
                            {props.rightPanel}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};