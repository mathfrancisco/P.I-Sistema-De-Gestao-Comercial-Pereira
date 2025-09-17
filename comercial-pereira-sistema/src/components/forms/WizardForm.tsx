import {CheckCircle, ChevronLeft, ChevronRight} from "lucide-react";
import React from "react";
import {Button} from "@/components/ui/button";

interface WizardStep {
    id: string;
    title: string;
    description?: string;
    component: React.ReactNode;
    isValid?: boolean;
}

interface WizardFormProps {
    steps: WizardStep[];
    currentStep: number;
    onStepChange: (step: number) => void;
    onNext: () => void;
    onPrevious: () => void;
    onSubmit: () => void;
    isSubmitting?: boolean;
}

export const WizardForm: React.FC<WizardFormProps> = ({
                                                          steps,
                                                          currentStep,
                                                          onStepChange,
                                                          onNext,
                                                          onPrevious,
                                                          onSubmit,
                                                          isSubmitting = false
                                                      }) => {
    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === steps.length - 1;
    const currentStepData = steps[currentStep];

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Steps Indicator */}
            <div className="mb-8">
                <nav className="flex items-center justify-center">
                    {steps.map((step, index) => (
                        <div key={step.id} className="flex items-center">
                            <div
                                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors cursor-pointer ${
                                    index <= currentStep
                                        ? 'bg-blue-600 border-blue-600 text-white'
                                        : 'bg-white border-gray-300 text-gray-500'
                                }`}
                                onClick={() => onStepChange(index)}
                            >
                                {index < currentStep ? (
                                    <CheckCircle className="w-6 h-6" />
                                ) : (
                                    <span className="text-sm font-medium">{index + 1}</span>
                                )}
                            </div>

                            {index < steps.length - 1 && (
                                <div className={`w-16 h-1 mx-4 ${
                                    index < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                                }`} />
                            )}
                        </div>
                    ))}
                </nav>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mt-6">
                    <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                    />
                </div>
            </div>

            {/* Step Content */}
            <div className="mb-8">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">{currentStepData.title}</h2>
                    {currentStepData.description && (
                        <p className="text-gray-600 mt-2">{currentStepData.description}</p>
                    )}
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-8">
                    {currentStepData.component}
                </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
                <Button
                    variant="secondary"
                    onClick={onPrevious}
                    disabled={isFirstStep}
                    leftIcon={ChevronLeft}
                >
                    Anterior
                </Button>

                <div className="text-center text-sm text-gray-500">
                    Passo {currentStep + 1} de {steps.length}
                </div>

                {isLastStep ? (
                    <Button
                        onClick={onSubmit}
                        loading={isSubmitting}
                        leftIcon={CheckCircle}
                    >
                        Finalizar
                    </Button>
                ) : (
                    <Button
                        onClick={onNext}
                        disabled={currentStepData.isValid === false}
                        rightIcon={ChevronRight}
                    >
                        Próximo
                    </Button>
                )}
            </div>
        </div>
    );
};