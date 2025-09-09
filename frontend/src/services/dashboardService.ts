// Dashboard service to communicate with Spring Boot Dashboard API
import { authService } from './authService';
import {
    DashboardOverviewDTO,
    SaleReadOnlyDTO,
    PurchaseReadOnlyDTO,
    StockAlertDTO,
    ProductStatsSummaryDTO,
    ToDoTaskReadOnlyDTO,
    DashboardToDoTasksDTO,
    MispricedProductAlertDTO,
    ToDoTaskInsertDTO,
    ToDoTaskUpdateDTO,
    Paginated,
    SalesSummaryDTO
} from "../types/api/dashboardInterface.ts";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL + '/dashboard';

class DashboardService {
    private getAuthHeaders(): HeadersInit {
        const headers = authService.getAuthHeaders();
        console.log('Auth headers being sent:', headers); // Add debug logging
        return headers;
    }

    // Helper method to handle auth errors and redirect to login if needed
    private handleAuthError(response: Response): void {
        console.error('AUTH ERROR DETAILS:', {
            status: response.status,
            statusText: response.statusText,
            url: response.url,
            headers: Object.fromEntries(response.headers.entries())
        });
        if (response.status === 401) {
            console.error('Authentication failed - token may be expired or invalid');

            // TEMPORARY: Comment out automatic logout for debugging
            // authService.logout();
            // window.location.reload();

            // Instead, just throw an error so we can see it
            throw new Error(`401 Unauthorized: ${response.statusText} - Check console for details`);
        }

    }

    // =============================================================================
    // MAIN DASHBOARD DATA
    // =============================================================================

    /**
     * This is our main endpoint for loading the entire dashboard
     */
    async getDashboardOverview(): Promise<DashboardOverviewDTO> {
        try {
            await new Promise(resolve => setTimeout(resolve, 100));

            const token = authService.getToken();
            if (!token) {
                throw new Error('No authentication token available');
            }

            const response = await fetch(`${API_BASE_URL}/overview`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            if (!response.ok) {
                if (response.status === 401) {
                    this.handleAuthError(response);
                    throw new Error('Authentication failed - please log in again');
                }
                throw new Error(`Failed to fetch dashboard overview: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Dashboard overview error:', error);
            throw error;
        }
    }

    // =============================================================================
    // VIEW ALL FUNCTIONALITY
    // =============================================================================

    /**
     * Get all low stock products with pagination and filtering
     * Used when clicking "View All" from dashboard low stock widget
     */
    async getAllLowStockProducts(params:{
        nameOrCode?: string;
        categoryId?: number;
        procedureId?: number;
        materialName?: string;
        materialId?: number;
        minStock?: number;
        maxStock?: number;
        isActive?: boolean;
        page?: number;
        pageSize?: number;
        sortBy?: string;
        sortDirection?: string;
    } = {}) : Promise<Paginated<StockAlertDTO>> {
        try {
            const queryParams = new URLSearchParams();

            // Add all parameters to query string if they exist
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryParams.append(key, value.toString());
                }
            });

            const response = await fetch(`${API_BASE_URL}/low-stock-products/all?${queryParams}`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            if (!response.ok) {
                // Add proper 401 error handling like other methods
                if (response.status === 401) {
                    this.handleAuthError(response);
                    throw new Error('Authentication failed - please log in again');
                }
                throw new Error(`Failed to fetch all low stock products: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('All low stock products error:', error);
            throw error;
        }
    }


    /**
     * Get all mispriced products with pagination and filtering
     * Used when clicking "View All" from dashboard mispriced products widget
     */
    async getAllMispricedProducts(params: {
        thresholdPercentage?: number;
        nameOrCode?: string;
        categoryId?: number;
        issueType?: string;
        page?: number;
        pageSize?: number;
        sortBy?: string;
        sortDirection?: string;
    } = {}): Promise<Paginated<MispricedProductAlertDTO>> {
        try {
            const queryParams = new URLSearchParams();

            // Set default threshold if not provided
            if (!params.thresholdPercentage) {
                params.thresholdPercentage = 20;
            }

            // Add all parameters to query string if they exist
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryParams.append(key, value.toString());
                }
            });

            const response = await fetch(`${API_BASE_URL}/mispriced-products/all?${queryParams}`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch all mispriced products: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('All mispriced products error:', error);
            throw error;
        }
    }

    /**
     * Get all tasks with pagination and filtering
     * Used when clicking "View All Tasks" from dashboard task widget
     */
    async getAllTasks(params: {
        status?: string;
        dateFrom?: string;
        dateTo?: string;
        page?: number;
        pageSize?: number;
        sortBy?: string;
        sortDirection?: string;
    } = {}): Promise<Paginated<ToDoTaskReadOnlyDTO>> {
        try {
            const queryParams = new URLSearchParams();

            // Add all parameters to query string if they exist
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryParams.append(key, value.toString());
                }
            });

            const response = await fetch(`${API_BASE_URL}/tasks/all?${queryParams}`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch all tasks: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('All tasks error:', error);
            throw error;
        }
    }


    // =============================================================================
    // INDIVIDUAL WIDGET DATA (for refresh/reload specific sections)
    // =============================================================================

    /**
     * Get sales summary data
     */
    async getSalesSummary(): Promise<{ weeklySales: SalesSummaryDTO; monthlySales: SalesSummaryDTO }> {
        try {
            const response = await fetch(`${API_BASE_URL}/sales/summary`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch sales summary: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Sales summary error:', error);
            throw error;
        }
    }

    /**
     * Get recent sales for dashboard widget
     */
    async getRecentSales(limit: number = 5): Promise<SaleReadOnlyDTO[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/sales/recent?limit=${limit}`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch recent sales: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Recent sales error:', error);
            throw error;
        }
    }

    /**
     * Get recent purchases for dashboard widget
     */
    async getRecentPurchases(limit: number = 5): Promise<PurchaseReadOnlyDTO[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/purchases/recent?limit=${limit}`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch recent purchases: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Recent purchases error:', error);
            throw error;
        }
    }

    /**
     * Get low stock products alert
     */
    async getLowStockProducts(limit: number = 5): Promise<StockAlertDTO[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/products/low-stock?limit=${limit}`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch low stock products: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Low stock products error:', error);
            throw error;
        }
    }

    /**
     * Get top performing products this month
     */
    async getTopProducts(limit: number = 5): Promise<ProductStatsSummaryDTO[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/products/top?limit=${limit}`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch top products: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Top products error:', error);
            throw error;
        }
    }

    // =============================================================================
    // TASK MANAGEMENT FROM DASHBOARD
    // =============================================================================

    /**
     * Get tasks for dashboard display (organized by categories)
     */
    async getDashboardTasks(displayLimit: number = 5): Promise<DashboardToDoTasksDTO> {
        try {
            const response = await fetch(`${API_BASE_URL}/tasks?displayLimit=${displayLimit}`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch dashboard tasks: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Dashboard tasks error:', error);
            throw error;
        }
    }

    /**
     * Create a new task from dashboard
     */
    async createTask(taskData: ToDoTaskInsertDTO): Promise<ToDoTaskReadOnlyDTO> {
        try {
            const response = await fetch(`${API_BASE_URL}/tasks`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(taskData),
            });

            if (!response.ok) {
                if (response.status === 400) {
                    throw new Error('Invalid task data');
                }
                throw new Error(`Failed to create task: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Create task error:', error);
            throw error;
        }
    }

    /**
     * Update an existing task
     */
    async updateTask(id : number, taskData: ToDoTaskUpdateDTO): Promise<ToDoTaskReadOnlyDTO> {
        try {
            const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(taskData),
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Task not found');
                }
                if (response.status === 400) {
                    throw new Error('Invalid task data');
                }
                throw new Error(`Failed to update task: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Update task error:', error);
            throw error;
        }
    }

    /**
     * Delete a task
     */
    async deleteTask(taskId: number): Promise<void> {
        try {
            const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders(),
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Task not found');
                }
                throw new Error(`Failed to delete task: ${response.status}`);
            }
        } catch (error) {
            console.error('Delete task error:', error);
            throw error;
        }
    }

    /**
     * Mark task as completed
     */
    async completeTask(taskId: number): Promise<ToDoTaskReadOnlyDTO> {
        try {
            const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/status`, {
                method: 'PATCH',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type' : 'application/json'
                },
                body : JSON.stringify({
                    taskId : taskId,
                    status : 'COMPLETED'
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to complete task: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Completing task error:', error);
            throw error;
        }
    }

    /**
     * Mark task as pending
     */
    async restoreTask(taskId: number): Promise<ToDoTaskReadOnlyDTO> {
        try {
            const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/status`, {
                method: 'PATCH',
                headers: {
                    ...this.getAuthHeaders(),
                    'Content-Type' : 'application/json'
                },
                body : JSON.stringify({
                    taskId : taskId,
                    status : 'PENDING'
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to restore task: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Restoring task error:', error);
            throw error;
        }
    }


    // =============================================================================
    // ALERTS
    // =============================================================================

    /**
     * Get stock alerts
     */
    async getStockAlerts(): Promise<StockAlertDTO[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/alerts/stock`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch stock alerts: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Stock alerts error:', error);
            throw error;
        }
    }

    /**
     * Get mispriced product alerts
     */
    async getMispricedProductAlerts(): Promise<MispricedProductAlertDTO[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/alerts/mispriced`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch mispriced product alerts: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Mispriced product alerts error:', error);
            throw error;
        }
    }
}

// Export singleton instance
export const dashboardService = new DashboardService();