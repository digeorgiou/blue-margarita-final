const LoadingSpinner = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600 text-lg">Loading dashboard...</p>
    </div>
    )
}

export default LoadingSpinner;