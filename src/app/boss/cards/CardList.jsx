"use client"

import { useEffect, useState } from "react";
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { CldUploadWidget } from 'next-cloudinary';
import toast from 'react-hot-toast';

export default function CardList({ refreshTrigger }) {
    const [cards, setCards] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCard, setSelectedCard] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchCards();
    }, [refreshTrigger]);

    const fetchCards = async () => {
        try {
            const response = await fetch('/api/boss/cards');
            const data = await response.json();
            setCards(data);
        } catch (error) {
            console.error('Error fetching cards:', error);
            toast.error('Failed to fetch cards');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (card) => {
        setSelectedCard(card);
        setIsModalOpen(true);
    };

    const handleUpload = (result) => {
        const uploadedUrl = result?.info?.secure_url || result?.info?.url;

        if (!uploadedUrl) {
            console.error('Upload result structure:', result);
            return toast.error('Image URL not received');
        }

        try {
            setSelectedCard(prev => ({
                ...prev,
                image: uploadedUrl
            }));
            toast.success('Image uploaded successfully!');
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Error saving image URL');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const loadingToast = toast.loading('Updating card...');

        try {
            const formData = new FormData(e.target);

            const updatedCard = {
                name: formData.get('name'),
                description: formData.get('description'),
                price: Number(formData.get('price')),
                perHour: Number(formData.get('perHour')),
                image: selectedCard.image
            };

            const response = await fetch(`/api/boss/cards/${selectedCard._id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedCard)
            });

            if (!response.ok) {
                throw new Error('Failed to update card');
            }

            await fetchCards();
            toast.dismiss(loadingToast);
            toast.success('Card updated successfully!');
            setIsModalOpen(false);
            setSelectedCard(null);
        } catch (error) {
            console.error('Error updating card:', error);
            toast.dismiss(loadingToast);
            toast.error('Failed to update card');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (cardId) => {
        if (confirm('Are you sure you want to delete this card?')) {
            const loadingToast = toast.loading('Deleting card...');
            try {
                const response = await fetch(`/api/boss/cards/${cardId}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    throw new Error('Failed to delete card');
                }

                await fetchCards();
                toast.dismiss(loadingToast);
                toast.success('Card deleted successfully!');
            } catch (error) {
                console.error('Error deleting card:', error);
                toast.dismiss(loadingToast);
                toast.error('Failed to delete card');
            }
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    }

    return (
        <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                {cards.map((card) => (
                    <div
                        key={card._id}
                        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                    >
                        <div className="relative h-32 w-full flex justify-center items-center bg-gray-50">
                            <img
                                src={card.image}
                                alt={card.name}
                                className="w-20 h-20 object-contain"
                            />
                        </div>
                        <div className="p-4">
                            <h3 className="text-xl font-semibold mb-2">{card.name}</h3>
                            <p className="text-gray-600 text-sm mb-4">{card.description}</p>
                            <div className="flex justify-between items-center mb-4">
                                <div className="text-green-600 flex flex-col">
                                    <span className="text-sm text-gray-500 font-bold">Price:</span>
                                    <span className="font-bold text-lg">{card.price}</span>
                                </div>
                                <div className="text-blue-600 flex flex-col">
                                    <span className="text-sm text-gray-500 font-bold">Per Hour:</span>
                                    <span className="font-bold text-lg text-right">{card.perHour}</span>

                                </div>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => handleEdit(card)}
                                    className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                                    title="Edit"
                                >
                                    <FiEdit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(card._id)}
                                    className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                                    title="Delete"
                                >
                                    <FiTrash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Edit Modal */}
            {isModalOpen && selectedCard && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-semibold mb-4">Edit Card</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <input
                                    name="name"
                                    type="text"
                                    defaultValue={selectedCard.name}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea
                                    name="description"
                                    defaultValue={selectedCard.description}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                    rows={4}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Price</label>
                                    <input
                                        name="price"
                                        type="number"
                                        defaultValue={selectedCard.price}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Per Hour</label>
                                    <input
                                        name="perHour"
                                        type="number"
                                        defaultValue={selectedCard.perHour}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Image Upload
                                </label>
                                <CldUploadWidget
                                    uploadPreset="ml_default"
                                    onError={(error) => console.error('Upload error:', error)}
                                    onSuccess={(result) => handleUpload(result)}
                                    options={{
                                        maxFiles: 1,
                                        resourceType: "image",
                                        clientAllowedFormats: ["images"],
                                        maxFileSize: 10000000,
                                        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
                                    }}
                                >
                                    {({ open }) => (
                                        <div className="space-y-2">
                                            <button
                                                type="button"
                                                onClick={() => open()}
                                                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            >
                                                {selectedCard.image ? 'Change Image' : 'Upload Image'}
                                            </button>
                                            {selectedCard.image && (
                                                <div className="mt-2">
                                                    <img
                                                        src={selectedCard.image}
                                                        alt="Card preview"
                                                        className="h-32 w-auto object-cover rounded-md"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </CldUploadWidget>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setSelectedCard(null);
                                    }}
                                    className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors disabled:bg-blue-300"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}