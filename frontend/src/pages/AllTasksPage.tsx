import React from 'react';
import TaskList from "../components/ui/Lists/TaskList.tsx";

interface AllTasksPageProps {
    onNavigate: (page: string) => void;
}

const AllTasksPage: React.FC<AllTasksPageProps> = ({ onNavigate }) => {
    return <TaskList onNavigate={onNavigate} />;
};

export default AllTasksPage;