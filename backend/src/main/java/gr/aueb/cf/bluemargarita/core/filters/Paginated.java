package gr.aueb.cf.bluemargarita.core.filters;

import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

import java.util.List;

@Getter
public class Paginated<T>{

    List<T> data;
    long totalElements; //total count across all pages
    int totalPages;
    int numberOfElements; //count in current page
    int currentPage;
    int pageSize;

    public Paginated(Page<T> page){
        this.data = page.getContent();
        this.totalElements = page.getTotalElements();
        this.totalPages = page.getTotalPages();
        this.numberOfElements = page.getNumberOfElements();
        this.currentPage = page.getNumber();
        this.pageSize = page.getSize();
    }

    public Paginated(List<T> data, int currentPage, int pageSize,
                    long totalElements){
        this.data = data;
        this.currentPage = currentPage;
        this.pageSize = pageSize;
        this.totalElements = totalElements;
        this.totalPages = (int) Math.ceil((double) totalElements / pageSize);
        this.numberOfElements = data.size();
    }
}
