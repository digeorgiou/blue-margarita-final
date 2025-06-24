package gr.aueb.cf.bluemargarita.dto.category;

public record CategoryUpdateDTO(
        Long categoryId,
        Long updaterUserId,
        String name
)
{}
