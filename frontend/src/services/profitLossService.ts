import { authService } from './authService';
import { ProfitLossReportDTO, ProfitLossPageInitData} from "../types/api/profitLossInterface.ts";
import { ApiErrorHandler } from '../utils/apiErrorHandler';

const API_BASE_URL = '/api/profit-loss';

class ProfitLossService {

    private getAuthHeaders(): HeadersInit {
        const headers = authService.getAuthHeaders();
        console.log('Auth headers being sent:', headers);
        return headers;
    }

    // =============================================================================
    // PAGE INITIALIZATION
    // =============================================================================

    /**
     * Get initial page data with current month, last month, and current year reports
     */
    async getProfitLossPageInitData(): Promise<ProfitLossPageInitData> {
        try {
            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}/init`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            return await response.json();
        } catch (error) {
            console.error('Get profit loss page init data error:', error);
            throw error;
        }
    }

    // =============================================================================
    // CUSTOM REPORTS
    // =============================================================================

    /**
     * Generate a custom profit and loss report for the specified date range
     */
    async generateCustomReport(dateFrom: string, dateTo: string): Promise<ProfitLossReportDTO> {
        try {
            const queryParams = new URLSearchParams();
            queryParams.append('dateFrom', dateFrom);
            queryParams.append('dateTo', dateTo);

            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}/report?${queryParams}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            return await response.json();
        } catch (error) {
            console.error('Generate custom profit loss report error:', error);
            throw error;
        }
    }

    // =============================================================================
    // QUICK PERIOD REPORTS
    // =============================================================================

    /**
     * Get current month profit and loss report
     */
    async getCurrentMonthReport(): Promise<ProfitLossReportDTO> {
        try {
            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}/current-month`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            return await response.json();
        } catch (error) {
            console.error('Get current month report error:', error);
            throw error;
        }
    }

    /**
     * Get last month profit and loss report
     */
    async getLastMonthReport(): Promise<ProfitLossReportDTO> {
        try {
            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}/last-month`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            return await response.json();
        } catch (error) {
            console.error('Get last month report error:', error);
            throw error;
        }
    }

    /**
     * Get current year profit and loss report
     */
    async getCurrentYearReport(): Promise<ProfitLossReportDTO> {
        try {
            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}/current-year`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            return await response.json();
        } catch (error) {
            console.error('Get current year report error:', error);
            throw error;
        }
    }

    /**
     * Get last year profit and loss report
     */
    async getLastYearReport(): Promise<ProfitLossReportDTO> {
        try {
            const response = await ApiErrorHandler.enhancedFetch(`${API_BASE_URL}/last-year`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            return await response.json();
        } catch (error) {
            console.error('Get last year report error:', error);
            throw error;
        }
    }
}

export const profitLossService = new ProfitLossService();