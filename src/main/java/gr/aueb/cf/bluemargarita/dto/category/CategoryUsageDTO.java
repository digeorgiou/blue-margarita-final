package gr.aueb.cf.bluemargarita.dto.category;

public record CategoryUsageDTO(
        Long categoryId,
        String categoryName,
        Integer productCount,
        Double percentage
) {}
