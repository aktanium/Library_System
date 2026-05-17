# Skill: Add New Database Field or Entity

Use this when adding columns, tables, or relationships.

## Project uses: JPA with `ddl-auto=update`
No Flyway/Liquibase — Hibernate auto-creates/alters tables on startup.

## Add a field to existing entity
1. Add field to the entity class with proper annotation
2. Add to DTO request/response as needed
3. Update Mapper
4. Restart backend — Hibernate adds the column automatically

```java
// In entity class
@Column(nullable = true)
private String newField;
```

## Add a new entity
```java
@Entity
@Table(name = "your_table")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class YourEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
```

## Enum fields
```java
@Enumerated(EnumType.STRING)
@Column(nullable = false)
private YourStatus status;
```

## Warning
- `ddl-auto=update` never drops columns — safe to add, careful with renames
- H2 profile uses in-memory DB — data resets on every restart
- Always check DataSeeder.java if you add required fields (update seed data)
