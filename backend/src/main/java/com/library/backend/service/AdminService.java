package com.library.backend.service;

import com.library.backend.dto.request.UpdateUserRoleRequest;
import com.library.backend.dto.response.BorrowRecordResponse;
import com.library.backend.dto.response.DashboardResponse;
import com.library.backend.dto.response.UserResponse;
import com.library.backend.entity.User;
import com.library.backend.entity.enums.BookStatus;
import com.library.backend.entity.enums.BorrowStatus;
import com.library.backend.entity.enums.Role;
import com.library.backend.exception.ResourceNotFoundException;
import com.library.backend.mapper.BorrowRecordMapper;
import com.library.backend.mapper.UserMapper;
import com.library.backend.repository.BookRepository;
import com.library.backend.repository.BorrowRecordRepository;
import com.library.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final BorrowRecordRepository borrowRecordRepository;
    private final UserMapper userMapper;
    private final BorrowRecordMapper borrowRecordMapper;

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard() {
        return DashboardResponse.builder()
                .totalBooks(bookRepository.count())
                .availableBooks(bookRepository.countByStatus(BookStatus.AVAILABLE))
                .borrowedBooks(bookRepository.countByStatus(BookStatus.BORROWED))
                .totalUsers(userRepository.count())
                .activeBorrowRecords(borrowRecordRepository.countByStatus(BorrowStatus.BORROWED))
                .returnedBorrowRecords(borrowRecordRepository.countByStatus(BorrowStatus.RETURNED))
                .build();
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(userMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = findUserOrThrow(id);
        return userMapper.toResponse(user);
    }

    @Transactional(readOnly = true)
    public List<BorrowRecordResponse> getUserBorrowHistory(Long userId) {
        findUserOrThrow(userId);
        return borrowRecordRepository.findByUserId(userId).stream()
                .map(borrowRecordMapper::toResponse)
                .toList();
    }

    @Transactional
    public UserResponse updateUserRole(Long id, UpdateUserRoleRequest request) {
        User user = findUserOrThrow(id);
        user.setRole(Role.valueOf(request.getRole()));
        return userMapper.toResponse(userRepository.save(user));
    }

    private User findUserOrThrow(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }
}
