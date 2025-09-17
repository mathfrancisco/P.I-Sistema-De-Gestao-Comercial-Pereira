import React from "react";
import {Star, XCircle, Zap} from "lucide-react";
import {Button} from "@/components/ui/button";

interface DashboardPromoCardProps {
    title: string;
    description: string;
    ctaText: string;
    onCtaClick: () => void;
    onDismiss?: () => void;
    gradient?: string;
}

export const DashboardPromoCard: React.FC<DashboardPromoCardProps> = ({
                                                                          title,
                                                                          description,
                                                                          ctaText,
                                                                          onCtaClick,
                                                                          onDismiss,
                                                                          gradient = 'from-purple-500 to-blue-600'
                                                                      }) => {
    return (
        <div className={`relative bg-gradient-to-r ${gradient} rounded-xl p-6 text-white overflow-hidden`}>
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 right-4">
                    <Star className="w-16 h-16" />
                </div>
                <div className="absolute bottom-4 left-4">
                    <Zap className="w-12 h-12" />
                </div>
            </div>

            {/* Dismiss Button */}
            {onDismiss && (
                <button
                    onClick={onDismiss}
                    className="absolute top-4 right-4 p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
                >
                    <XCircle className="w-5 h-5" />
                </button>
            )}

            {/* Content */}
            <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2">{title}</h3>
                <p className="text-white text-opacity-90 mb-4 max-w-sm">{description}</p>

                <Button
                    onClick={onCtaClick}
                    className="bg-white text-gray-900 hover:bg-gray-100 font-medium"
                >
                    {ctaText}
                </Button>
            </div>
        </div>
    );
};
