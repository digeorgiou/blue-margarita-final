// Dashboard service to communicate with Spring Boot Dashboard API
import { authService } from './authService';
import {DashboardOverviewDTO, SaleListItemDTO, PurchaseReadOnlyDTO, ProductListItemDTO , ToDoTaskReadOnlyDTO,
DashboardToDoTasksDTO, MispricedProductAlertDTO, StockAlertDTO, ToDoTaskInsertDTO,ToDoTaskUpdateDTO ,
Paginated} from "../types/api/dashboardInterface.ts";

const API_BASE_URL = '/api/dashboard';



class DashboardService {
     private getAuthHeaders(): HeadersInit {
        return authService.getAuthHeaders();
    }

    // =============================================================================
    // MAIN DASHBOARD DATA
    // =============================================================================

    /**
     * This is our main endpoint for loading the entire dashboard
     */
    async getDashboardOverview(): Promise<DashboardOverviewDTO> {
        try {
            const response = await fetch(`${API_BASE_URL}/overview`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch dashboard overview: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Dashboard overview error:', error);
            throw error;
        }
    }

    // =============================================================================
    // INDIVIDUAL WIDGET DATA (for refresh/reload specific sections)
    // =============================================================================

    /**
     * Get sales summary data
     */
    async getSalesSummary(): Promise<{ weeklySales: number; monthlySales: number }> {
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
    async getRecentSales(limit: number = 5): Promise<SaleListItemDTO[]> {
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
    async getLowStockProducts(limit: number = 5): Promise<ProductListItemDTO[]> {
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
    async getTopProducts(limit: number = 5): Promise<ProductListItemDTO[]> {
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
     * Get all tasks with pagination (for "View All" functionality)
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

            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
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
    async updateTask(taskData: ToDoTaskUpdateDTO): Promise<ToDoTaskReadOnlyDTO> {
        try {
            const response = await fetch(`${API_BASE_URL}/tasks/${taskData.id}`, {
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
        return this.updateTask({
            id: taskId,
            status: 'COMPLETED'
        });
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