import React from "react";
import {ArrowRight, Star, XCircle, Zap} from "lucide-react";

interface DashboardPromoCardProps {
    title: string;
    description: string;
    ctaText: string;
    onCtaClick: () => void;
    onDismiss?: () => void;
    gradient?: string;
    icon?: React.ComponentType<{ className?: string }>;
}

export const DashboardPromoCard: React.FC<DashboardPromoCardProps> = ({
                                                                               title,
                                                                               description,
                                                                               ctaText,
                                                                               onCtaClick,
                                                                               onDismiss,
                                                                               gradient = 'from-purple-500 to-blue-600',
                                                                               icon: PromoIcon = Star
                                                                           }) => {
    return (
        <div className={`relative bg-gradient-to-r ${gradient} rounded-xl p-6 text-white overflow-hidden`}>
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 right-4">
                    <PromoIcon className="w-16 h-16" />
                </div>
                <div className="absolute bottom-4 left-4">
                    <Zap className="w-12 h-12" />
                </div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-32 h-32 bg-white rounded-full opacity-5"></div>
                </div>
            </div>

            {onDismiss && (
                <button
                    onClick={onDismiss}
                    className="absolute top-4 right-4 p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors z-10"
                >
                    <XCircle className="w-5 h-5" />
                </button>
            )}

            <div className="relative z-10 max-w-2xl">
                <h3 className="text-2xl font-bold mb-3">{title}</h3>
                <p className="text-white text-opacity-90 mb-6 text-lg leading-relaxed">{description}</p>

                <button
                    onClick={onCtaClick}
                    className="bg-white text-gray-900 hover:bg-gray-100 font-medium px-6 py-3 rounded-lg transition-colors inline-flex items-center"
                >
                    {ctaText}
                    <ArrowRight className="w-4 h-4 ml-2" />
                </button>
            </div>
        </div>
    );
};
