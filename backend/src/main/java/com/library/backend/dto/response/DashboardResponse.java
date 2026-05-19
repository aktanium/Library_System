package com.library.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardResponse {

    private long totalBooks;
    private long availableBooks;
    private long borrowedBooks;
    private long totalUsers;
    private long overdueCount;
}
