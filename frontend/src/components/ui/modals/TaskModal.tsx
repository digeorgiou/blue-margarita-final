import React, { useState, useEffect } from 'react';
import { Button, Input } from "../"

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (taskData: { description: string; date: string }) => Promise<void>;
    mode: 'create' | 'update';
    initialData?: {
        id?: number;
        description?: string;
        date?: string;
    };
}

const TaskModal: React.FC<TaskModalProps> = ({
                                                 isOpen,
                                                 onClose,
                                                 onSubmit,
                                                 mode,
                                                 initialData
                                             }) => {
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Reset or populate form when modal opens
            setDescription(initialData?.description || '');
            setDate(initialData?.date || new Date().toISOString().split('T')[0]);
        }
    }, [isOpen, initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description.trim() || !date) return;

        setIsLoading(true);
        try {
            await onSubmit({ description: description.trim(), date });
            onClose();
        } catch (error) {
            console.error('Failed to save task:', error);
            alert('Failed to save task. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
                <h2 className="text-xl font-semibold mb-4">
                    {mode === 'create' ? 'Create New Task' : 'Update Task'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <Input
                            id="description"
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter task description"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                            Date
                        </label>
                        <Input
                            id="date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={isLoading || !description.trim() || !date}
                        >
                            {isLoading ? 'Saving...' : (mode === 'create' ? 'Create' : 'Update')}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TaskModal;