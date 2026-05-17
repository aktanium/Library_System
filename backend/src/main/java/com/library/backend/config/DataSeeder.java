package com.library.backend.config;

import com.library.backend.entity.Book;
import com.library.backend.entity.BorrowRecord;
import com.library.backend.entity.User;
import com.library.backend.entity.enums.BookStatus;
import com.library.backend.entity.enums.BorrowStatus;
import com.library.backend.entity.enums.Role;
import com.library.backend.repository.BookRepository;
import com.library.backend.repository.BorrowRecordRepository;
import com.library.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final BorrowRecordRepository borrowRecordRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        seedAdmin();
        seedDemoUsers();
        seedBooks();
        seedDemoBorrows();
    }

    private void seedAdmin() {
        User admin = userRepository.findByEmail("admin@library.com").orElse(null);

        if (admin == null) {
            admin = User.builder()
                    .fullName("System Admin")
                    .email("admin@library.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .build();
            userRepository.save(admin);
            log.info("Default admin user created: admin@library.com");
            return;
        }

        if (admin.getRole() != Role.ADMIN) {
            Role previousRole = admin.getRole();
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);
            log.warn("Restored admin@library.com to ADMIN role (was {})", previousRole);
        }
    }

    private void seedDemoUsers() {
        seedUserIfMissing("user1@library.com", "Alice Johnson", "user123");
        seedUserIfMissing("user2@library.com", "Bob Smith", "user123");
    }

    private void seedUserIfMissing(String email, String fullName, String password) {
        if (userRepository.existsByEmail(email)) {
            return;
        }
        User user = User.builder()
                .fullName(fullName)
                .email(email)
                .password(passwordEncoder.encode(password))
                .role(Role.USER)
                .build();
        userRepository.save(user);
        log.info("Demo user created: {}", email);
    }

    private void seedBooks() {
        if (bookRepository.count() > 0) {
            return;
        }

        List<Book> books = List.of(
                Book.builder().title("Clean Code").author("Robert C. Martin").genre("Software Engineering").isbn("978-0132350884").quantity(5).status(BookStatus.AVAILABLE).build(),
                Book.builder().title("Design Patterns").author("Erich Gamma").genre("Software Engineering").isbn("978-0201633610").quantity(3).status(BookStatus.AVAILABLE).build(),
                Book.builder().title("The Pragmatic Programmer").author("David Thomas").genre("Software Engineering").isbn("978-0135957059").quantity(4).status(BookStatus.AVAILABLE).build(),
                Book.builder().title("Effective Java").author("Joshua Bloch").genre("Java").isbn("978-0134685991").quantity(6).status(BookStatus.AVAILABLE).build(),
                Book.builder().title("Spring in Action").author("Craig Walls").genre("Java").isbn("978-1617294945").quantity(3).status(BookStatus.AVAILABLE).build(),
                Book.builder().title("Java Concurrency in Practice").author("Brian Goetz").genre("Java").isbn("978-0321349606").quantity(2).status(BookStatus.AVAILABLE).build(),
                Book.builder().title("Refactoring").author("Martin Fowler").genre("Software Engineering").isbn("978-0134757599").quantity(4).status(BookStatus.AVAILABLE).build(),
                Book.builder().title("Domain-Driven Design").author("Eric Evans").genre("Software Architecture").isbn("978-0321125217").quantity(2).status(BookStatus.AVAILABLE).build(),
                Book.builder().title("Head First Design Patterns").author("Eric Freeman").genre("Software Engineering").isbn("978-0596007126").quantity(5).status(BookStatus.AVAILABLE).build(),
                Book.builder().title("Microservices Patterns").author("Chris Richardson").genre("Software Architecture").isbn("978-1617294549").quantity(3).status(BookStatus.AVAILABLE).build()
        );

        bookRepository.saveAll(books);
        log.info("Seeded {} sample books", books.size());
    }

    private void seedDemoBorrows() {
        if (borrowRecordRepository.count() > 0) {
            return;
        }

        User alice = userRepository.findByEmail("user1@library.com").orElse(null);
        User bob = userRepository.findByEmail("user2@library.com").orElse(null);
        if (alice == null || bob == null) {
            log.warn("Skipping demo borrow seeding: demo users not present");
            return;
        }

        List<Book> books = bookRepository.findAll();
        if (books.size() < 3) {
            log.warn("Skipping demo borrow seeding: need at least 3 books, found {}", books.size());
            return;
        }

        // Alice — active borrow (10 days ago, within the 14-day overdue window)
        Book aliceActive = books.get(0);
        decrementCopy(aliceActive);
        borrowRecordRepository.save(BorrowRecord.builder()
                .user(alice)
                .book(aliceActive)
                .borrowDate(LocalDateTime.now().minusDays(10))
                .status(BorrowStatus.BORROWED)
                .build());

        // Alice — returned borrow (borrowed 30 days ago, returned 20 days ago)
        Book aliceReturned = books.get(1);
        borrowRecordRepository.save(BorrowRecord.builder()
                .user(alice)
                .book(aliceReturned)
                .borrowDate(LocalDateTime.now().minusDays(30))
                .returnDate(LocalDateTime.now().minusDays(20))
                .status(BorrowStatus.RETURNED)
                .build());

        // Bob — overdue borrow (20 days ago, past 14-day threshold → triggers frontend alert)
        Book bobOverdue = books.get(2);
        decrementCopy(bobOverdue);
        borrowRecordRepository.save(BorrowRecord.builder()
                .user(bob)
                .book(bobOverdue)
                .borrowDate(LocalDateTime.now().minusDays(20))
                .status(BorrowStatus.BORROWED)
                .build());

        log.info("Seeded 3 demo borrow records (Alice active + returned, Bob overdue)");
    }

    private void decrementCopy(Book book) {
        book.setQuantity(book.getQuantity() - 1);
        if (book.getQuantity() <= 0) {
            book.setStatus(BookStatus.BORROWED);
        }
        bookRepository.save(book);
    }
}
