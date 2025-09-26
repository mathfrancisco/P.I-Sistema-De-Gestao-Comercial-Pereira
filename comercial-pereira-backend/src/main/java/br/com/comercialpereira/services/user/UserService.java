package br.com.comercialpereira.services.user;

import br.com.comercialpereira.entity.User;
import br.com.comercialpereira.enums.UserRole;
import br.com.comercialpereira.repository.UserRepository;
import br.com.comercialpereira.dto.user.CreateUserRequest;
import br.com.comercialpereira.dto.user.UpdateUserRequest;
import br.com.comercialpereira.dto.user.UserFilters;
import br.com.comercialpereira.dto.user.UserResponse;
import br.com.comercialpereira.exception.ApiException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private static final String EMAIL_IN_USE = "Este email já está sendo utilizado";
    private static final String USER_NOT_FOUND = "Usuário não encontrado";
    private static final String WEAK_PASSWORD = "A senha deve ter pelo menos 8 caracteres, incluindo maiúscula, minúscula, número e caractere especial";
    private static final String CANNOT_CHANGE_OWN_ROLE = "Não é possível alterar o próprio perfil";
    private static final String CANNOT_DELETE_SELF = "Não é possível desativar/excluir a própria conta";

    // Regex para validar senha forte
    private static final Pattern STRONG_PASSWORD_PATTERN = Pattern.compile(
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"
    );

    // =================== CREATE ===================

    public UserResponse create(CreateUserRequest request, Long currentUserId) {
        try {
            // 1. Validar email único
            validateUniqueEmail(request.getEmail(), null);

            // 2. Validar força da senha
            if (!validateStrongPassword(request.getPassword())) {
                throw new ApiException(WEAK_PASSWORD, HttpStatus.BAD_REQUEST);
            }

            // 3. Hash da senha
            String hashedPassword = passwordEncoder.encode(request.getPassword());

            // 4. Criar usuário
            User user = User.builder()
                    .name(request.getName())
                    .email(request.getEmail().toLowerCase())
                    .password(hashedPassword)
                    .role(request.getRole() != null ? request.getRole() : UserRole.SALESPERSON)
                    .isActive(true)
                    .build();

            User savedUser = userRepository.save(user);

            // 5. Log da operação
            logUserOperation(currentUserId, "CREATE", savedUser.getId(),
                    Map.of("new", Map.of(
                            "name", savedUser.getName(),
                            "email", savedUser.getEmail(),
                            "role", savedUser.getRole()
                    ))
            );

            return convertToUserResponse(savedUser);

        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            log.error("Erro ao criar usuário", e);
            throw new ApiException("Erro ao criar usuário", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // =================== READ ===================

    @Transactional(readOnly = true)
    public Page<UserResponse> findMany(UserFilters filters) {
        try {
            // Preparar paginação
            Sort sort = Sort.by(
                    filters.getSortOrder().equalsIgnoreCase("desc")
                            ? Sort.Direction.DESC
                            : Sort.Direction.ASC,
                    filters.getSortBy()
            );

            Pageable pageable = PageRequest.of(
                    filters.getPage(),
                    filters.getSize(),
                    sort
            );

            // Buscar usuários com filtros
            Page<User> usersPage = userRepository.findByFilters(
                    filters.getSearch(),
                    filters.getRole(),
                    filters.getIsActive(),
                    pageable
            );

            // Converter para response
            return usersPage.map(this::convertToUserResponse);

        } catch (Exception e) {
            log.error("Erro ao buscar usuários", e);
            throw new ApiException("Erro ao buscar usuários", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional(readOnly = true)
    public UserResponse findById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ApiException(USER_NOT_FOUND, HttpStatus.NOT_FOUND));

        return convertToUserResponse(user);
    }

    @Transactional(readOnly = true)
    public UserResponse findByEmail(String email) {
        return userRepository.findByEmail(email.toLowerCase())
                .map(this::convertToUserResponse)
                .orElse(null);
    }

    // =================== UPDATE ===================

    public UserResponse update(Long id, UpdateUserRequest request, Long currentUserId) {
        try {
            // 1. Verificar se usuário existe
            User existingUser = userRepository.findById(id)
                    .orElseThrow(() -> new ApiException(USER_NOT_FOUND, HttpStatus.NOT_FOUND));

            // 2. Impedir auto-alteração de role
            if (id.equals(currentUserId) && request.getRole() != null
                    && !request.getRole().equals(existingUser.getRole())) {
                throw new ApiException(CANNOT_CHANGE_OWN_ROLE, HttpStatus.FORBIDDEN);
            }

            // 3. Validar email único (se alterando)
            if (request.getEmail() != null && !request.getEmail().equals(existingUser.getEmail())) {
                validateUniqueEmail(request.getEmail(), id);
            }

            // 4. Atualizar campos
            if (request.getName() != null) {
                existingUser.setName(request.getName());
            }
            if (request.getEmail() != null) {
                existingUser.setEmail(request.getEmail().toLowerCase());
            }
            if (request.getRole() != null) {
                existingUser.setRole(request.getRole());
            }
            if (request.getIsActive() != null) {
                existingUser.setIsActive(request.getIsActive());
            }

            User updatedUser = userRepository.save(existingUser);

            // 5. Log da operação
            logUserOperation(currentUserId, "UPDATE", id,
                    Map.of(
                            "old", Map.of(
                                    "name", existingUser.getName(),
                                    "email", existingUser.getEmail(),
                                    "role", existingUser.getRole()
                            ),
                            "new", Map.of(
                                    "name", updatedUser.getName(),
                                    "email", updatedUser.getEmail(),
                                    "role", updatedUser.getRole()
                            )
                    )
            );

            return convertToUserResponse(updatedUser);

        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            log.error("Erro ao atualizar usuário", e);
            throw new ApiException("Erro ao atualizar usuário", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // =================== PASSWORD MANAGEMENT ===================

    public void resetPassword(Long id, String newPassword, Long currentUserId) {
        try {
            // 1. Verificar se usuário existe
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new ApiException(USER_NOT_FOUND, HttpStatus.NOT_FOUND));

            // 2. Validar força da senha
            if (!validateStrongPassword(newPassword)) {
                throw new ApiException(WEAK_PASSWORD, HttpStatus.BAD_REQUEST);
            }

            // 3. Hash da nova senha
            String hashedPassword = passwordEncoder.encode(newPassword);

            // 4. Atualizar senha
            user.setPassword(hashedPassword);
            userRepository.save(user);

            // 5. Log da operação
            logUserOperation(currentUserId, "RESET_PASSWORD", id, null);

        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            log.error("Erro ao redefinir senha", e);
            throw new ApiException("Erro ao redefinir senha", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // =================== DELETE (SOFT DELETE) ===================

    public void delete(Long id, Long currentUserId, String reason) {
        try {
            // 1. Verificar se usuário existe
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new ApiException(USER_NOT_FOUND, HttpStatus.NOT_FOUND));

            // 2. Impedir auto-exclusão
            if (id.equals(currentUserId)) {
                throw new ApiException(CANNOT_DELETE_SELF, HttpStatus.FORBIDDEN);
            }

            // 3. Soft delete (desativar usuário)
            user.setIsActive(false);
            userRepository.save(user);

            // 4. Log da operação
            logUserOperation(currentUserId, "DELETE", id,
                    Map.of(
                            "reason", reason != null ? reason : "",
                            "old", Map.of(
                                    "name", user.getName(),
                                    "email", user.getEmail(),
                                    "role", user.getRole(),
                                    "isActive", user.getIsActive()
                            )
                    )
            );

        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            log.error("Erro ao excluir usuário", e);
            throw new ApiException("Erro ao excluir usuário", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // =================== SEARCH AND FILTERS ===================

    @Transactional(readOnly = true)
    public List<UserResponse> search(String query, int limit) {
        try {
            UserFilters filters = UserFilters.builder()
                    .search(query)
                    .isActive(true)
                    .page(0)
                    .size(limit)
                    .sortBy("name")
                    .sortOrder("asc")
                    .build();

            Sort sort = Sort.by(Sort.Direction.ASC, "name");
            Pageable pageable = PageRequest.of(0, limit, sort);

            Page<User> users = userRepository.findByFilters(
                    query, null, true, pageable
            );

            return users.getContent().stream()
                    .map(this::convertToUserResponse)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Erro na busca de usuários", e);
            throw new ApiException("Erro na busca de usuários", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getActiveUsers() {
        try {
            List<User> users = userRepository.findByRoleAndIsActive(null, true);
            return users.stream()
                    .sorted((u1, u2) -> u1.getName().compareToIgnoreCase(u2.getName()))
                    .map(this::convertToUserResponse)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Erro ao buscar usuários ativos", e);
            throw new ApiException("Erro ao buscar usuários ativos", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getUsersByRole(UserRole role) {
        try {
            List<User> users = userRepository.findByRoleAndIsActive(role, true);
            return users.stream()
                    .map(this::convertToUserResponse)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Erro ao buscar usuários por role", e);
            throw new ApiException("Erro ao buscar usuários por role", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // =================== ANALYTICS ===================

    @Transactional(readOnly = true)
    public Map<String, Object> getStatistics() {
        try {
            long total = userRepository.count();
            long active = userRepository.countByIsActive(true);

            // Contar por role
            Map<String, Long> byRole = Map.of(
                    "ADMIN", userRepository.countByRole(UserRole.ADMIN),
                    "MANAGER", userRepository.countByRole(UserRole.MANAGER),
                    "SALESPERSON", userRepository.countByRole(UserRole.SALESPERSON)
            );

            return Map.of(
                    "total", total,
                    "active", active,
                    "inactive", total - active,
                    "byRole", byRole
            );

        } catch (Exception e) {
            log.error("Erro ao obter estatísticas de usuários", e);
            throw new ApiException("Erro ao obter estatísticas de usuários", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // =================== PRIVATE METHODS ===================

    private void validateUniqueEmail(String email, Long excludeId) {
        boolean exists = excludeId != null
                ? userRepository.existsByEmailAndIdNot(email.toLowerCase(), excludeId)
                : userRepository.existsByEmail(email.toLowerCase());

        if (exists) {
            throw new ApiException(EMAIL_IN_USE, HttpStatus.CONFLICT);
        }
    }

    private void logUserOperation(Long currentUserId, String action, Long targetUserId, Map<String, Object> data) {
        try {
            log.info("[USER_AUDIT] User {} performed {} on user {}",
                    currentUserId, action, targetUserId);
            log.debug("[USER_AUDIT] Data: {}", data);

            // TODO: Implementar tabela de auditoria no banco se necessário
            // auditService.log(currentUserId, action, "USERS", targetUserId, data);

        } catch (Exception e) {
            // Log de auditoria não deve impedir a operação principal
            log.error("Erro ao registrar log de auditoria", e);
        }
    }

    // =================== UTILITIES ===================

    public boolean verifyPassword(String plainPassword, String hashedPassword) {
        return passwordEncoder.matches(plainPassword, hashedPassword);
    }

    public String hashPassword(String password) {
        return passwordEncoder.encode(password);
    }

    private boolean validateStrongPassword(String password) {
        return STRONG_PASSWORD_PATTERN.matcher(password).matches();
    }

    private UserResponse convertToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    public Map<String, Object> formatUserForSelect(User user) {
        return Map.of(
                "value", user.getId(),
                "label", user.getName() + " (" + user.getEmail() + ")",
                "role", user.getRole().name()
        );
    }
}