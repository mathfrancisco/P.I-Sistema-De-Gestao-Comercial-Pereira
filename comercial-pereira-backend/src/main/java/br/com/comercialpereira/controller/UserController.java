package br.com.comercialpereira.controller;

import br.com.comercialpereira.dto.user.CreateUserRequest;
import br.com.comercialpereira.dto.user.UpdateUserRequest;
import br.com.comercialpereira.dto.user.UserFilters;
import br.com.comercialpereira.dto.user.UserResponse;
import br.com.comercialpereira.entity.User;
import br.com.comercialpereira.enums.UserRole;
import br.com.comercialpereira.services.user.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // SOLUÇÃO ALTERNATIVA: Obter User-ID do contexto de segurança
    private Long getCurrentUserId(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return user.getId();
    }

    @PostMapping
    public ResponseEntity<UserResponse> createUser(
            @Valid @RequestBody CreateUserRequest request,
            Authentication authentication) {

        Long currentUserId = getCurrentUserId(authentication);
        UserResponse user = userService.create(request, currentUserId);
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<UserResponse>> getUsers(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(required = false) UserRole role,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortOrder) {

        UserFilters filters = UserFilters.builder()
                .search(search)
                .role(role)
                .isActive(isActive)
                .page(page)
                .size(size)
                .sortBy(sortBy)
                .sortOrder(sortOrder)
                .build();

        Page<UserResponse> users = userService.findMany(filters);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @userService.isOwnerOrAdmin(#id, authentication.principal.id)")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        UserResponse user = userService.findById(id);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request,
            Authentication authentication) {

        Long currentUserId = getCurrentUserId(authentication);
        UserResponse user = userService.update(id, request, currentUserId);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/{id}/password")
    @PreAuthorize("hasRole('ADMIN') or @userService.isOwnerOrAdmin(#id, authentication.principal.id)")
    public ResponseEntity<Void> resetPassword(
            @PathVariable Long id,
            @RequestBody Map<String, String> request,
            Authentication authentication) {

        String newPassword = request.get("password");
        Long currentUserId = getCurrentUserId(authentication);
        userService.resetPassword(id, newPassword, currentUserId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(
            @PathVariable Long id,
            Authentication authentication,
            @RequestParam(required = false) String reason) {

        Long currentUserId = getCurrentUserId(authentication);
        userService.delete(id, currentUserId, reason);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponse>> searchUsers(
            @RequestParam String query,
            @RequestParam(defaultValue = "10") int limit) {

        List<UserResponse> users = userService.search(query, limit);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponse>> getActiveUsers() {
        List<UserResponse> users = userService.getActiveUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/by-role/{role}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponse>> getUsersByRole(@PathVariable UserRole role) {
        List<UserResponse> users = userService.getUsersByRole(role);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getUserStatistics() {
        Map<String, Object> stats = userService.getStatistics();
        return ResponseEntity.ok(stats);
    }

    // Endpoint para obter dados do usuário logado
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        UserResponse userResponse = userService.findById(user.getId());
        return ResponseEntity.ok(userResponse);
    }
}