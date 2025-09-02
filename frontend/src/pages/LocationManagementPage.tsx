import { useState, useEffect } from 'react';
import { Button, Alert, LocationList, LoadingSpinner, CustomCard } from '../components/ui/common';
import { ConfirmDeleteModal, LocationCreateModal, LocationUpdateModal, LocationDetailModal, SuccessModal } from '../components/ui/modals';
import { locationService } from '../services/locationService';
import { MapPin, Plus } from 'lucide-react';
import type {
    LocationForDropdownDTO,
    LocationReadOnlyDTO,
    LocationDetailedViewDTO
} from '../types/api/locationInterface';

const LocationManagementPage = () => {
    // State management
    const [locations, setLocations] = useState<LocationForDropdownDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

    // Selected item states
    const [selectedLocation, setSelectedLocation] = useState<LocationForDropdownDTO | null>(null);
    const [selectedLocationFull, setSelectedLocationFull] = useState<LocationReadOnlyDTO | null>(null);
    const [locationDetails, setLocationDetails] = useState<LocationDetailedViewDTO | null>(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    // Success message state
    const [successMessage, setSuccessMessage] = useState({ title: '', message: '' });

    // Load locations
    const loadLocations = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await locationService.getActiveLocationsForDropdown();
            setLocations(data);
        } catch (err) {
            console.error('Failed to load locations:', err);
            setError('Αποτυχία φόρτωσης τοποθεσιών');
        } finally {
            setLoading(false);
        }
    };

    // Load location details for modals
    const loadLocationDetails = async (id: number) => {
        try {
            setDetailsLoading(true);
            const details = await locationService.getLocationDetailedView(id);
            setLocationDetails(details);
        } catch (err) {
            console.error('Failed to load location details:', err);
            alert('Αποτυχία φόρτωσης λεπτομερειών τοποθεσίας');
        } finally {
            setDetailsLoading(false);
        }
    };

    // Load full location data for update modal
    const loadFullLocationData = async (id: number) => {
        try {
            const locationData = await locationService.getLocationById(id);
            setSelectedLocationFull(locationData);
        } catch (err) {
            console.error('Failed to load location data:', err);
            alert('Αποτυχία φόρτωσης δεδομένων τοποθεσίας');
        }
    };

    // Handle create location
    const handleCreateLocation = async (data: { name: string }) => {
        await locationService.createLocation({
            name: data.name
        });
        await loadLocations();
        setSuccessMessage({
            title: 'Επιτυχής Δημιουργία',
            message: `Η τοποθεσία "${data.name}" δημιουργήθηκε επιτυχώς.`
        });
        setIsSuccessModalOpen(true);
    };

    // Handle update location
    const handleUpdateLocation = async (data: { name: string }) => {
        if (!selectedLocation) return;

        await locationService.updateLocation(selectedLocation.id, {
            locationId: selectedLocation.id,
            name: data.name
        });
        await loadLocations();
        setSuccessMessage({
            title: 'Επιτυχής Ενημέρωση',
            message: `Η τοποθεσία "${data.name}" ενημερώθηκε επιτυχώς.`
        });
        setIsSuccessModalOpen(true);
    };

    // Handle delete location
    const handleDeleteLocation = async () => {
        if (!selectedLocation) return;

        await locationService.deleteLocation(selectedLocation.id);
        await loadLocations();
        setSuccessMessage({
            title: 'Επιτυχής Διαγραφή',
            message: `Η τοποθεσία "${selectedLocation.name}" διαγράφηκε επιτυχώς.`
        });
        setIsSuccessModalOpen(true);
    };

    // Load locations on component mount
    useEffect(() => {
        loadLocations();
    }, []);

    return (
        <div className="min-h-screen p-4">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
                    <div className="flex items-center space-x-3">

                    </div>

                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        variant="create"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Νέα Τοποθεσία
                    </Button>
                </div>

                {/* Error Alert */}
                {error && (
                    <Alert variant="error" className="mb-6">
                        {error}
                    </Alert>
                )}

                {/* Locations List */}
                <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                    <CustomCard
                        title="Τοποθεσίες"
                        className="bg-white/10 backdrop-blur-sm border-white/20"
                    >
                        <LocationList
                            locations={locations}
                            loading={loading}
                            onViewDetails={(location) => {
                                setSelectedLocation(location);
                                setIsDetailsModalOpen(true);
                                loadLocationDetails(location.id);
                            }}
                            onEdit={async (location) => {
                                setSelectedLocation(location);
                                await loadFullLocationData(location.id);
                                setIsUpdateModalOpen(true);
                            }}
                            onDelete={(location) => {
                                setSelectedLocation(location);
                                setIsDeleteModalOpen(true);
                            }}
                        />
                    </CustomCard>
                </div>

                {/* Modals */}
                <LocationCreateModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSubmit={handleCreateLocation}
                />
                {selectedLocationFull && (
                    <LocationUpdateModal
                        isOpen={isUpdateModalOpen}
                        onClose={() => {
                            setIsUpdateModalOpen(false);
                            setSelectedLocationFull(null);
                        }}
                        onSubmit={handleUpdateLocation}
                        location={selectedLocationFull}
                    />
                )}

                <ConfirmDeleteModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleDeleteLocation}
                    title="Διαγραφή Τοποθεσίας"
                    message={selectedLocation ?
                        `Είστε σίγουροι ότι θέλετε να διαγράψετε την τοποθεσία "${selectedLocation.name}";`
                        : ''
                    }
                    warningMessage="Αυτή η ενέργεια δεν μπορεί να αναιρεθεί."
                />

                {/* Details Modal */}
                {isDetailsModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                {/* Header */}
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center">
                                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                                            <MapPin className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900 mb-1">
                                                {selectedLocation?.name || 'Τοποθεσία'}
                                            </h2>
                                            <p className="text-gray-600">Λεπτομερείς αναλυτικές πληροφορίες τοποθεσίας</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost-primary"
                                        size="sm"
                                        onClick={() => {
                                            setIsDetailsModalOpen(false);
                                            setLocationDetails(null);
                                        }}
                                    >
                                        ×
                                    </Button>
                                </div>

                                {/* Content */}
                                {detailsLoading ? (
                                    <div className="text-center py-12">
                                        <LoadingSpinner />
                                        <p className="text-gray-500 mt-3">Φόρτωση λεπτομερειών τοποθεσίας...</p>
                                    </div>
                                ) : locationDetails ? (
                                    <LocationDetailModal
                                        isOpen={true}
                                        onClose={() => {
                                            setIsDetailsModalOpen(false);
                                            setLocationDetails(null);
                                        }}
                                        location={locationDetails}
                                    />
                                ) : (
                                    <div className="text-center py-12">
                                        <p className="text-red-500">Αποτυχία φόρτωσης λεπτομερειών</p>
                                        <Button
                                            variant="primary"
                                            onClick={() => selectedLocation && loadLocationDetails(selectedLocation.id)}
                                            className="mt-4"
                                        >
                                            Επανάληψη
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Success Modal */}
                <SuccessModal
                    isOpen={isSuccessModalOpen}
                    onClose={() => setIsSuccessModalOpen(false)}
                    title={successMessage.title}
                    message={successMessage.message}
                />
            </div>
        </div>
    );
};

// Export the page
export default LocationManagementPage;