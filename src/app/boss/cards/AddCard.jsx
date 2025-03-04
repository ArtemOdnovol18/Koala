"use client"
import { useState } from 'react';
import toast from 'react-hot-toast';
import { CldUploadWidget } from 'next-cloudinary';

export default function AddCard({ onCardAdded }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        perHour: '',
        price: '',
        image: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        const loadingToast = toast.loading('Adding card...');

        try {

            console.log(formData);


            const response = await fetch('/api/boss/cards', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                toast.dismiss(loadingToast);
                toast.success('Card added successfully!');
                onCardAdded();
                setFormData({
                    name: '',
                    description: '',
                    perHour: '',
                    price: '',
                    image: ''
                });
            } else {
                toast.dismiss(loadingToast);
                toast.error('Failed to add card');
            }

        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error('Error adding card');
            console.error('Error adding card:', error);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleUpload = (result) => {
        console.log('Upload result:', result);

        const uploadedUrl = result?.info?.secure_url || result?.info?.url;

        if (!uploadedUrl) {
            console.error('Upload result structure:', result);
            return toast.error('Image URL not received');
        }

        try {
            setFormData(prev => ({
                ...prev,
                image: uploadedUrl
            }));
            console.log('Updated formData with image:', uploadedUrl);
            toast.success('Image uploaded successfully!');
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Error saving image URL');
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Card</h2>

                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Card Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                        placeholder="Enter card name"
                    />
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        rows={4}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                        placeholder="Enter card description"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="perHour" className="block text-sm font-medium text-gray-700 mb-1">
                            Per Hour Rate
                        </label>
                        <input
                            type="number"
                            id="perHour"
                            name="perHour"
                            value={formData.perHour}
                            onChange={handleChange}
                            required
                            min="0"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            placeholder="0"
                        />
                    </div>

                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                            Price
                        </label>
                        <input
                            type="number"
                            id="price"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            required
                            min="0"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                            placeholder="0"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Image Upload
                    </label>
                    <CldUploadWidget
                        uploadPreset="ml_default"
                        onUpload={(result) => {
                            console.log('Upload callback triggered', result);
                        }}
                        onError={(error) => console.error('Upload error:', error)}
                        onSuccess={(result) => handleUpload(result)}
                        options={{
                            maxFiles: 1,
                            resourceType: "image",
                            clientAllowedFormats: ["png", "jpg", "jpeg", "gif"],
                            maxFileSize: 10000000,
                            cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
                        }}
                    >
                        {({ open }) => (
                            <div className="space-y-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        console.log('Upload button clicked');
                                        open();
                                    }}
                                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    {formData.image ? 'Change Image' : 'Upload Image'}
                                </button>
                                {formData.image && (
                                    <div className="mt-2">
                                        <img
                                            src={formData.image}
                                            alt="Uploaded preview"
                                            className="h-32 w-auto object-cover rounded-md"
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </CldUploadWidget>
                </div>

                <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                >
                    Add Card
                </button>
            </form>
        </div>
    );
}