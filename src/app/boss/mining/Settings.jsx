"use client"
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { FiTrash2 } from 'react-icons/fi'

export default function Settings({ onCardAdded }) {

    const [isLoading, setIsLoading] = useState(true);

    const [rows, setRows] = useState([]);


    useEffect(() => {
        setIsLoading(true);
        fetch('/api/boss/mining')
            .then(res => res.json())
            .then(data => setRows(data))
            .catch(err => console.log(err))
            .finally(() => setIsLoading(false));
    }, [])



    const handleChange = (index, field, value) => {
        const newRows = [...rows];
        newRows[index][field] = Number(value);
        setRows(newRows);
    };

    const addRow = () => {
        setRows([...rows, { reward: 0, percentage: 0 }]);
    };

    const removeRow = (index) => {
        const newRows = rows.filter((_, i) => i !== index);
        setRows(newRows);
    };

    const calculateTotal = () => {
        return rows.reduce((sum, row) => sum + Number(row.percentage), 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const total = calculateTotal();
        if (Math.abs(total - 100) > 0.001) { // Using small epsilon for floating point comparison
            toast.error('Total probability must be 100%');
            return;
        }

        const loadingToast = toast.loading('Saving settings...');

        try {
            const response = await fetch('/api/boss/mining', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ settings: rows })
            });

            if (!response.ok) {
                throw new Error('Failed to save settings');
            }

            onCardAdded();
            toast.dismiss(loadingToast);
            toast.success('Settings saved successfully!');
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.dismiss(loadingToast);
            toast.error('Failed to save settings');
        }
    };

    return (
        <div className="container mx-auto p-4 max-w-2xl">
            <h1 className="text-2xl font-bold mb-6">Mining Settings</h1>

            {isLoading ? <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div> :
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="mb-4 grid grid-cols-12 gap-4 font-semibold">
                            <div className="col-span-5">Reward</div>
                            <div className="col-span-5">(%)</div>
                            <div className="col-span-2"></div>
                        </div>

                        {rows.map((row, index) => (
                            <div key={index} className="grid grid-cols-12 gap-4 mb-3">
                                <input
                                    type="number"
                                    value={row.reward}
                                    onChange={(e) => handleChange(index, 'reward', e.target.value)}
                                    className="col-span-5 p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                    min="0"
                                    required
                                />
                                <input
                                    type="number"
                                    value={row.percentage}
                                    onChange={(e) => handleChange(index, 'percentage', e.target.value)}
                                    className="col-span-5 p-2 border rounded focus:ring-2 focus:ring-blue-500"
                                    step="0.1"
                                    min="0"
                                    max="100"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => removeRow(index)}
                                    className="col-span-2 p-2 text-gray-600 hover:text-red-600 transition-colors"
                                    title="Remove row"
                                >
                                    <FiTrash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))}

                        <div className="mt-4 flex justify-between items-center">
                            <button
                                type="button"
                                onClick={addRow}
                                className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200"
                            >
                                Add Row
                            </button>

                            <div className={`font-semibold ${Math.abs(calculateTotal() - 100) > 0.001 ? 'text-red-600' : 'text-green-600'}`}>
                                Total: {calculateTotal()}%
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end mt-6">
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-500"
                            disabled={Math.abs(calculateTotal() - 100) > 0.001}
                        >
                            Save Settings
                        </button>
                    </div>
                </form>
            }
        </div>
    );
}