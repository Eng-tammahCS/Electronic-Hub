import { apiService, ApiResponse } from './apiService';
import { API_CONFIG } from '../config/api';

// Expense Types - Match backend DTOs exactly
export interface Expense {
  id: number;
  expenseType: string;
  amount: number;
  note?: string;
  userId: number;
  username: string;
  createdAt: string;
}

export interface CreateExpenseRequest {
  expenseType: string;
  amount: number;
  note?: string;
}

export interface UpdateExpenseRequest extends Partial<CreateExpenseRequest> {
  id: number;
}

export interface ExpensesSummary {
  totalExpenses: number;
  totalAmount: number;
  todayExpenses: number;
  todayAmount: number;
  thisMonthExpenses: number;
  thisMonthAmount: number;
  averageDailyExpense: number;
  topExpenseTypes: TopExpenseType[];
}

export interface TopExpenseType {
  expenseType: string;
  count: number;
  totalAmount: number;
  percentage: number;
}

// Expense Service Class
class ExpenseService {
  private baseEndpoint = API_CONFIG.ENDPOINTS.EXPENSES;

  // Get all expenses
  async getExpenses(): Promise<ApiResponse<Expense[]>> {
    return apiService.get<Expense[]>(this.baseEndpoint);
  }

  // Get expense by ID
  async getExpenseById(id: number): Promise<ApiResponse<Expense>> {
    return apiService.get<Expense>(`${this.baseEndpoint}/${id}`);
  }

  // Create new expense
  async createExpense(expenseData: CreateExpenseRequest): Promise<ApiResponse<Expense>> {
    return apiService.post<Expense>(this.baseEndpoint, expenseData);
  }

  // Update existing expense
  async updateExpense(id: number, expenseData: UpdateExpenseRequest): Promise<ApiResponse<Expense>> {
    return apiService.put<Expense>(`${this.baseEndpoint}/${id}`, expenseData);
  }

  // Delete expense
  async deleteExpense(id: number): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`${this.baseEndpoint}/${id}`);
  }

  // Get expenses by date range
  async getExpensesByDateRange(startDate: string, endDate: string): Promise<ApiResponse<Expense[]>> {
    return apiService.get<Expense[]>(`${this.baseEndpoint}/date-range?startDate=${startDate}&endDate=${endDate}`);
  }

  // Get expenses summary
  async getExpensesSummary(): Promise<ApiResponse<ExpensesSummary>> {
    return apiService.get<ExpensesSummary>(`${this.baseEndpoint}/summary`);
  }

  // Get expenses by type
  async getExpensesByType(expenseType: string): Promise<ApiResponse<Expense[]>> {
    return apiService.get<Expense[]>(`${this.baseEndpoint}/type?expenseType=${encodeURIComponent(expenseType)}`);
  }
}

export const expenseService = new ExpenseService();
