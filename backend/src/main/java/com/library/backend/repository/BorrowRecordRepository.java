package com.library.backend.repository;

import com.library.backend.entity.BorrowRecord;
import com.library.backend.entity.enums.BorrowStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BorrowRecordRepository extends JpaRepository<BorrowRecord, Long> {

    List<BorrowRecord> findByUserId(Long userId);

    List<BorrowRecord> findByUserEmail(String email);

    List<BorrowRecord> findByBookId(Long bookId);

    List<BorrowRecord> findByStatus(BorrowStatus status);

    long countByStatus(BorrowStatus status);

    @Query("SELECT COUNT(b) FROM BorrowRecord b WHERE b.status = com.library.backend.entity.enums.BorrowStatus.BORROWED AND b.borrowDate < :cutoff")
    long countOverdue(@Param("cutoff") LocalDateTime cutoff);
}
