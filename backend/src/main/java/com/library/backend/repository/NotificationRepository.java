package com.library.backend.repository;

import com.library.backend.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserEmailOrderByCreatedAtDesc(String email);

    long countByUserEmailAndReadFalse(String email);

    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.user.email = :email AND n.read = false")
    int markAllReadForUser(@Param("email") String email);
}
