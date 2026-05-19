package com.library.backend.config;

import com.library.backend.entity.Book;
import com.library.backend.entity.BorrowRecord;
import com.library.backend.entity.Notification;
import com.library.backend.entity.User;
import com.library.backend.entity.enums.BookStatus;
import com.library.backend.entity.enums.BorrowStatus;
import com.library.backend.entity.enums.Role;
import com.library.backend.repository.BookRepository;
import com.library.backend.repository.BorrowRecordRepository;
import com.library.backend.repository.NotificationRepository;
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
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        seedAdmin();
        seedDemoUsers();
        seedBooks();
        seedDemoBorrows();
        seedDemoNotifications();
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
                seedBook("Clean Code", "Robert C. Martin", "Software Engineering", "978-0132350884", 5, 2008, "#2563eb",
                        "A handbook of agile software craftsmanship. Teaches the values, principles, and practices behind writing clean, maintainable code through dozens of worked case studies.",
                        "Robert C. Martin walks the reader from messy code to clean code, covering meaningful names, small focused functions, comments, formatting, error handling, and unit tests. Each chapter ends with concrete heuristics you can apply on Monday morning. Essential reading for any working programmer."),
                seedBook("Design Patterns", "Erich Gamma", "Software Engineering", "978-0201633610", 3, 1994, "#4f46e5",
                        "The original Gang of Four catalog of 23 reusable object-oriented design patterns, organized into creational, structural, and behavioural categories.",
                        "A seminal work that gave the industry a shared vocabulary for solving recurring design problems. Each pattern is presented with intent, applicability, structure, sample code, and known uses. Dense but rewarding — the foundation of modern object-oriented design."),
                seedBook("The Pragmatic Programmer", "David Thomas", "Software Engineering", "978-0135957059", 4, 1999, "#7c3aed",
                        "A timeless collection of tips, habits, and philosophical advice for software developers who want to ship better software faster.",
                        "Hunt and Thomas distill decades of experience into short, practical essays — DRY, orthogonality, broken-window theory, tracer bullets, automation. Written to be read in any order. The 20th-anniversary edition refreshes the examples for the modern era."),
                seedBook("Effective Java", "Joshua Bloch", "Java", "978-0134685991", 6, 2017, "#2563eb",
                        "Joshua Bloch's authoritative guide to writing idiomatic, robust Java. Ninety best-practice items covering language features, libraries, and design.",
                        "Each item is a self-contained essay on a specific decision — when to use static factory methods, how to design APIs, how to handle exceptions. Updated for Java 9 with coverage of streams, lambdas, and optionals. Required reading for serious Java developers."),
                seedBook("Spring in Action", "Craig Walls", "Java", "978-1617294945", 3, 2022, "#16a34a",
                        "A hands-on guide to building production-ready applications with Spring Boot, Spring Security, and the modern Spring ecosystem.",
                        "Craig Walls covers core Spring through Spring Cloud microservices, using a recurring Taco Cloud sample app. The 6th edition adds reactive programming, OAuth 2 security, and native compilation with Spring Native. Practical and example-driven."),
                seedBook("Java Concurrency in Practice", "Brian Goetz", "Java", "978-0321349606", 2, 2006, "#0d9488",
                        "A rigorous treatment of concurrent programming on the JVM, written by the team behind the java.util.concurrent package.",
                        "Goetz and his co-authors explain why concurrent programs are hard, what guarantees the Java Memory Model provides, and how to use locks, executors, and synchronizers correctly. Dense but indispensable for anyone writing multithreaded Java."),
                seedBook("Refactoring", "Martin Fowler", "Software Engineering", "978-0134757599", 4, 2018, "#9333ea",
                        "Martin Fowler's catalog of disciplined techniques for restructuring existing code without changing its observable behaviour.",
                        "The book teaches a vocabulary of named refactorings — Extract Function, Replace Conditional with Polymorphism, Move Function — each with motivation, mechanics, and worked examples. The 2nd edition uses JavaScript and reorganises around testable, small-step rewrites."),
                seedBook("Domain-Driven Design", "Eric Evans", "Software Architecture", "978-0321125217", 2, 2003, "#4f46e5",
                        "Eric Evans' foundational text on aligning software design with the business domain it serves.",
                        "Introduces concepts that have shaped modern architecture: ubiquitous language, bounded contexts, entities, value objects, aggregates, and domain events. Combines theory with extensive case studies. Required reading for anyone designing complex enterprise systems."),
                seedBook("Head First Design Patterns", "Eric Freeman", "Software Engineering", "978-0596007126", 5, 2020, "#ec4899",
                        "A visually rich, brain-friendly introduction to the most useful object-oriented design patterns.",
                        "Freeman and Robson present patterns through cartoons, conversations, and exercises, focusing on the dozen patterns developers actually use. The 2nd edition updates the examples for modern Java and adds material on lambdas. A gentler companion to the Gang of Four book."),
                seedBook("Microservices Patterns", "Chris Richardson", "Software Architecture", "978-1617294549", 3, 2018, "#e11d48",
                        "Chris Richardson's playbook for designing, building, and operating microservices-based applications.",
                        "Covers decomposition strategies, inter-service communication, data consistency with the Saga pattern, deployment, and observability. Each pattern is presented with context, problem, solution, and trade-offs. Includes a recurring Food-to-Go sample to anchor the discussion.")
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

    private Book seedBook(String title, String author, String genre, String isbn, int quantity,
                          int publishedYear, String coverColor, String description, String summary) {
        return Book.builder()
                .title(title)
                .author(author)
                .genre(genre)
                .isbn(isbn)
                .quantity(quantity)
                .status(quantity > 0 ? BookStatus.AVAILABLE : BookStatus.BORROWED)
                .publishedYear(publishedYear)
                .coverColor(coverColor)
                .description(description)
                .summary(summary)
                .build();
    }

    private void decrementCopy(Book book) {
        book.setQuantity(book.getQuantity() - 1);
        if (book.getQuantity() <= 0) {
            book.setStatus(BookStatus.BORROWED);
        }
        bookRepository.save(book);
    }

    private void seedDemoNotifications() {
        if (notificationRepository.count() != 0) {
            return;
        }

        User alice = userRepository.findByEmail("user1@library.com").orElse(null);
        User bob = userRepository.findByEmail("user2@library.com").orElse(null);
        User admin = userRepository.findByEmail("admin@library.com").orElse(null);

        int created = 0;

        if (bob != null) {
            Notification n1 = new Notification();
            n1.setUser(bob);
            n1.setTitle("Overdue Book Alert");
            n1.setMessage("Your borrowed book is overdue. Please return it as soon as possible.");
            n1.setType("OVERDUE");
            n1.setRead(false);
            notificationRepository.save(n1);

            Notification n2 = new Notification();
            n2.setUser(bob);
            n2.setTitle("Return Reminder");
            n2.setMessage("You have a book due for return. Please visit the library.");
            n2.setType("REMINDER");
            n2.setRead(false);
            notificationRepository.save(n2);

            created += 2;
        }

        if (alice != null) {
            Notification n3 = new Notification();
            n3.setUser(alice);
            n3.setTitle("Welcome to LibraryMS!");
            n3.setMessage("Your account is ready. Browse our catalog and start borrowing books.");
            n3.setType("SYSTEM");
            n3.setRead(false);
            notificationRepository.save(n3);

            Notification n4 = new Notification();
            n4.setUser(alice);
            n4.setTitle("Return Reminder");
            n4.setMessage("Reminder: please return your borrowed book within the due date.");
            n4.setType("REMINDER");
            n4.setRead(true);
            notificationRepository.save(n4);

            created += 2;
        }

        if (admin != null) {
            Notification n5 = new Notification();
            n5.setUser(admin);
            n5.setTitle("System Notice");
            n5.setMessage("2 users have overdue books. Check the All Borrows page for details.");
            n5.setType("SYSTEM");
            n5.setRead(false);
            notificationRepository.save(n5);

            created += 1;
        }

        if (created > 0) {
            log.info("Seeded {} demo notifications", created);
        }
    }
}
