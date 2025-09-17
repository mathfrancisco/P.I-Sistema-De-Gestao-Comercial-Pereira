// components/products/ProductImageUploader.tsx
import React, { useState, useRef, useEffect } from 'react';
import { ImageIcon, Star, RotateCcw, Crop, Move, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductImageUploaderProps {
    onImagesChange: (images: File[]) => void;
    maxImages?: number;
    maxSizePerImage?: number; // MB
    existingImages?: string[];
}

export const ProductImageUploader: React.FC<ProductImageUploaderProps> = ({
                                                                              onImagesChange,
                                                                              maxImages = 5,
                                                                              maxSizePerImage = 5,
                                                                              existingImages = []
                                                                          }) => {
    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [dragOver, setDragOver] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [mainImageIndex, setMainImageIndex] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        onImagesChange(images);
    }, [images, onImagesChange]);

    // Área drag-and-drop com border dashed
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);

        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            handleFiles(files);
        }
    };

    const handleFiles = (files: File[]) => {
        const validImages = files.filter(file => {
            if (!file.type.startsWith('image/')) {
                alert(`${file.name} não é uma imagem válida`);
                return false;
            }

            // Limite de tamanho e quantidade configurável
            if (file.size > maxSizePerImage * 1024 * 1024) {
                alert(`${file.name} é muito grande (máximo ${maxSizePerImage}MB)`);
                return false;
            }

            return true;
        });

        if (images.length + validImages.length > maxImages) {
            alert(`Máximo de ${maxImages} imagens permitidas`);
            return;
        }

        setImages(prev => [...prev, ...validImages]);

        // Preview grid das imagens uploaded
        validImages.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviews(prev => [...prev, e.target?.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));

        if (mainImageIndex === index) {
            setMainImageIndex(0);
        } else if (mainImageIndex > index) {
            setMainImageIndex(prev => prev - 1);
        }
    };

    // Drag handles para reordenar imagens
    const moveImage = (fromIndex: number, toIndex: number) => {
        const newImages = [...images];
        const newPreviews = [...previews];

        const [movedImage] = newImages.splice(fromIndex, 1);
        const [movedPreview] = newPreviews.splice(fromIndex, 1);

        newImages.splice(toIndex, 0, movedImage);
        newPreviews.splice(toIndex, 0, movedPreview);

        setImages(newImages);
        setPreviews(newPreviews);

        if (mainImageIndex === fromIndex) {
            setMainImageIndex(toIndex);
        }
    };

    return (
        <div className="space-y-6">
            {/* Drag and Drop Area */}
            <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragOver
                        ? 'border-purple-400 bg-purple-50'
                        : 'border-gray-300 hover:border-gray-400'
                }`}
                onDrop={handleDrop}
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
            >
                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Arraste imagens aqui ou clique para selecionar
                </h3>
                <p className="text-gray-500 mb-4">
                    Máximo {maxImages} imagens, até {maxSizePerImage}MB cada
                </p>

                <Button
                    variant="secondary"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={images.length >= maxImages}
                >
                    Selecionar Imagens
                </Button>

                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                />
            </div>

            {/* Preview Grid */}
            {previews.length > 0 && (
                <div>
                    <h4 className="font-medium text-gray-900 mb-4">
                        Imagens do Produto ({previews.length}/{maxImages})
                    </h4>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {previews.map((preview, index) => (
                            <div key={index} className="relative group">
                                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                    <img
                                        src={preview}
                                        alt={`Preview ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Star icon para marcar imagem principal */}
                                <button
                                    onClick={() => setMainImageIndex(index)}
                                    className={`absolute top-2 left-2 p-1 rounded-full transition-colors ${
                                        mainImageIndex === index
                                            ? 'bg-yellow-500 text-white'
                                            : 'bg-white text-gray-400 hover:text-yellow-500'
                                    }`}
                                    title="Marcar como imagem principal"
                                >
                                    <Star className="w-4 h-4" />
                                </button>

                                {/* Crop/rotate tools básicos */}
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="flex space-x-1">
                                        <button
                                            className="p-1 bg-white rounded-full shadow hover:bg-gray-100"
                                            title="Rotacionar"
                                        >
                                            <RotateCcw className="w-4 h-4" />
                                        </button>
                                        <button
                                            className="p-1 bg-white rounded-full shadow hover:bg-gray-100"
                                            title="Cortar"
                                        >
                                            <Crop className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => removeImage(index)}
                                            className="p-1 bg-white rounded-full shadow hover:bg-red-100 text-red-600"
                                            title="Remover"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Drag handle para reordenar */}
                                <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        className="p-1 bg-white rounded-full shadow cursor-move"
                                        title="Arrastar para reordenar"
                                    >
                                        <Move className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Progress bar durante upload */}
                                {uploading && (
                                    <div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-200 rounded-b-lg overflow-hidden">
                                        <div className="h-full bg-purple-500 transition-all duration-300" style={{ width: '60%' }} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};