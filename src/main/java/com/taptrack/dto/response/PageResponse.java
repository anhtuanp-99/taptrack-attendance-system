package com.taptrack.dto.response;

import lombok.Getter;
import org.springframework.data.domain.Page;

import java.util.List;

/** Khuôn dạng cho danh sách có phân trang — chỉ dùng cho API có dữ liệu tăng dần không giới hạn theo thời gian. */
@Getter
public class PageResponse<T> {

    private final List<T> content;
    private final int page;
    private final int size;
    private final long totalElements;
    private final int totalPages;

    public PageResponse(List<T> content, int page, int size, long totalElements, int totalPages) {
        this.content = content;
        this.page = page;
        this.size = size;
        this.totalElements = totalElements;
        this.totalPages = totalPages;
    }

    // Tiện gọi thẳng từ Page<T> do Spring Data JPA trả về, không cần map tay từng field
    public static <T> PageResponse<T> from(Page<T> page) {
        return new PageResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages()
        );
    }
}