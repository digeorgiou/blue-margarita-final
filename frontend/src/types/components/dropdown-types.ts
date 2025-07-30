import {CategoryForDropdownDTO} from "../api/categoryInterface.ts";
import {LocationForDropdownDTO} from "../api/locationInterface.ts";

export type CategoryDropdownListProps = {
    categories: CategoryForDropdownDTO[];
    loading: boolean;
    onEdit: (category: CategoryForDropdownDTO) => void;
    onDelete: (category: CategoryForDropdownDTO) => void;
    onViewDetails: (category: CategoryForDropdownDTO) => void;
}

export type LocationDropdownListProps = {
    locations: LocationForDropdownDTO[];
    loading: boolean;
    onEdit: (location: LocationForDropdownDTO) => void;
    onDelete: (location: LocationForDropdownDTO) => void;
    onViewDetails: (location: LocationForDropdownDTO) => void;
}