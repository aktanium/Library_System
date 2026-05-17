# Skill: Add a New API Endpoint

Use this when adding any new backend endpoint to the project.

## Checklist

1. **Entity** (if new table needed) → `src/main/java/com/library/backend/entity/`
2. **Repository** → `src/main/java/com/library/backend/repository/`
3. **DTO** → `dto/request/` and `dto/response/`
4. **Mapper** → `src/main/java/com/library/backend/mapper/`
5. **Service** → `src/main/java/com/library/backend/service/`
6. **Controller** → `src/main/java/com/library/backend/controller/`
7. **Security** → add to `SecurityConfig.java` if public, or add `@PreAuthorize` if role-restricted

## Controller Template
```java
@RestController
@RequestMapping("/api/your-resource")
@RequiredArgsConstructor
public class YourController {

    private final YourService yourService;

    @GetMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<YourResponse>> getAll() {
        return ResponseEntity.ok(yourService.getAll());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<YourResponse> create(@RequestBody @Valid YourRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(yourService.create(request));
    }
}
```

## Response DTO Template
```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class YourResponse {
    private Long id;
    // fields...
}
```

## Rules
- Always use `ResponseEntity<T>` return type
- Always use `@Valid` on request bodies
- Throw `ResourceNotFoundException` for missing entities
- Throw `BadRequestException` for business logic violations
- Never expose passwords or internal fields in response DTOs
