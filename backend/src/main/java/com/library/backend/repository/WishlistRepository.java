package com.library.backend.repository;

import com.library.backend.entity.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WishlistRepository extends JpaRepository<WishlistItem, Long> {

    List<WishlistItem> findByUserEmail(String email);

    boolean existsByUserEmailAndBookId(String email, Long bookId);

    long deleteByUserEmailAndBookId(String email, Long bookId);
}
