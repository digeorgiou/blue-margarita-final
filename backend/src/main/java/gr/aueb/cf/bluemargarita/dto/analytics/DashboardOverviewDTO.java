package gr.aueb.cf.bluemargarita.dto.analytics;

import gr.aueb.cf.bluemargarita.dto.product.MispricedProductAlertDTO;
import gr.aueb.cf.bluemargarita.dto.product.ProductStatsSummaryDTO;
import gr.aueb.cf.bluemargarita.dto.purchase.PurchaseReadOnlyDTO;
import gr.aueb.cf.bluemargarita.dto.sale.SaleReadOnlyDTO;
import gr.aueb.cf.bluemargarita.dto.sale.SalesSummaryDTO;
import gr.aueb.cf.bluemargarita.dto.stock.StockAlertDTO;
import gr.aueb.cf.bluemargarita.dto.task.DashboardToDoTasksDTO;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.util.List;

public record DashboardOverviewDTO(
        SalesSummaryDTO weeklySales,
        SalesSummaryDTO monthlySales,
        List<SaleReadOnlyDTO> recentSales,
        List<PurchaseReadOnlyDTO> recentPurchases,
        List<StockAlertDTO> lowStockProducts,
        List<ProductStatsSummaryDTO> topProductsThisMonth,
        DashboardToDoTasksDTO dashboardTasks,
        List<MispricedProductAlertDTO> mispricedProducts
){}
