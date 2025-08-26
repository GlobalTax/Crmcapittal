/**
 * Commission Report Service
 * 
 * Service for handling commission report generation and data processing
 */

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export interface ReportFilters {
  startDate: Date | null;
  endDate: Date | null;
  collaboratorId: string | null;
  calculationType: string | null;
  status: string | null;
  recipientType: string | null;
}

export interface CommissionData {
  id: string;
  amount: number;
  commission_percentage: number;
  commission_amount: number;
  collaborator_name: string;
  deal_id: string;
  created_at: string;
  status: string;
}

export class CommissionReportService {
  /**
   * Export commission data to Excel
   */
  static exportToExcel(data: CommissionData[], filename: string = 'commission-report') {
    const worksheet = XLSX.utils.json_to_sheet(data.map(commission => ({
      'ID': commission.id,
      'Colaborador': commission.collaborator_name,
      'Monto Deal': commission.amount,
      'Porcentaje': `${commission.commission_percentage}%`,
      'Comisión': commission.commission_amount,
      'Estado': commission.status,
      'Fecha': new Date(commission.created_at).toLocaleDateString('es-ES'),
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Comisiones');
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  }

  /**
   * Export commission data to PDF
   */
  static exportToPDF(data: CommissionData[], filters: ReportFilters, filename: string = 'commission-report') {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.text('Reporte de Comisiones', 20, 20);
    
    // Filters info
    doc.setFontSize(12);
    let yPos = 35;
    if (filters.startDate) {
      doc.text(`Desde: ${filters.startDate.toLocaleDateString('es-ES')}`, 20, yPos);
      yPos += 7;
    }
    if (filters.endDate) {
      doc.text(`Hasta: ${filters.endDate.toLocaleDateString('es-ES')}`, 20, yPos);
      yPos += 7;
    }
    
    // Table
    const tableData = data.map(commission => [
      commission.collaborator_name,
      commission.amount.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' }),
      `${commission.commission_percentage}%`,
      commission.commission_amount.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' }),
      commission.status,
      new Date(commission.created_at).toLocaleDateString('es-ES')
    ]);

    (doc as any).autoTable({
      head: [['Colaborador', 'Monto Deal', 'Porcentaje', 'Comisión', 'Estado', 'Fecha']],
      body: tableData,
      startY: yPos + 10,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] }
    });

    doc.save(`${filename}.pdf`);
  }

  /**
   * Calculate commission statistics
   */
  static calculateStats(data: CommissionData[]) {
    const totalCommissions = data.reduce((sum, commission) => sum + commission.commission_amount, 0);
    const totalDeals = data.length;
    const avgCommission = totalDeals > 0 ? totalCommissions / totalDeals : 0;
    
    const statusBreakdown = data.reduce((acc, commission) => {
      acc[commission.status] = (acc[commission.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalCommissions,
      totalDeals,
      avgCommission,
      statusBreakdown
    };
  }

  /**
   * Generate chart data for reports
   */
  static generateChartData(data: CommissionData[]) {
    // Monthly commission data
    const monthlyData = data.reduce((acc, commission) => {
      const month = new Date(commission.created_at).toISOString().slice(0, 7);
      if (!acc[month]) {
        acc[month] = { month, amount: 0, count: 0 };
      }
      acc[month].amount += commission.commission_amount;
      acc[month].count += 1;
      return acc;
    }, {} as Record<string, { month: string; amount: number; count: number }>);

    return {
      monthlyData: Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month)),
    };
  }

  /**
   * Filter commission data based on criteria
   */
  static filterData(data: CommissionData[], filters: ReportFilters): CommissionData[] {
    return data.filter(commission => {
      // Date filters
      if (filters.startDate) {
        const commissionDate = new Date(commission.created_at);
        if (commissionDate < filters.startDate) return false;
      }
      
      if (filters.endDate) {
        const commissionDate = new Date(commission.created_at);
        if (commissionDate > filters.endDate) return false;
      }
      
      // Status filter
      if (filters.status && commission.status !== filters.status) {
        return false;
      }
      
      // Collaborator filter
      if (filters.collaboratorId && commission.collaborator_name !== filters.collaboratorId) {
        return false;
      }
      
      return true;
    });
  }
}