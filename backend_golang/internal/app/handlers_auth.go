package app

import (
	"database/sql"
	"errors"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

func (s *Server) register(w http.ResponseWriter, r *http.Request) {
	payload, err := decodeJSON(r)
	if err != nil {
		apiError(w, http.StatusBadRequest, "Invalid JSON payload", nil)
		return
	}
	errorsMap := map[string][]string{}

	name, _ := requiredString(payload, "name", errorsMap, 0)
	emailValue := payload["email"]
	password, _ := requiredString(payload, "password", errorsMap, 6)
	validateEmailField(emailValue, errorsMap, true)
	email, _ := stringFromAny(emailValue)
	email = normalizeEmail(email)

	if email != "" {
		var exists bool
		if err := s.db.QueryRowContext(r.Context(), `select exists(select 1 from users where lower(email) = lower($1))`, email).Scan(&exists); err != nil {
			serverError(w, err)
			return
		}
		if exists {
			addError(errorsMap, "email", "The email has already been taken.")
		}
	}
	if len(errorsMap) > 0 {
		invalidField(w, errorsMap)
		return
	}

	passwordHash, err := hashPassword(password)
	if err != nil {
		serverError(w, err)
		return
	}
	var user User
	err = s.db.QueryRowContext(r.Context(), `
		insert into users (name, email, password_hash, role)
		values ($1, $2, $3, 'user')
		returning id, name, email, password_hash, role, created_at, updated_at
	`, strings.TrimSpace(name), email, passwordHash).Scan(
		&user.ID, &user.Name, &user.Email, &user.PasswordHash, &user.Role, &user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		serverError(w, err)
		return
	}
	token, _, err := s.createAccessToken(&user)
	if err != nil {
		serverError(w, err)
		return
	}
	success(w, http.StatusCreated, "Registration successful", userMap(&user, token))
}

func (s *Server) login(w http.ResponseWriter, r *http.Request) {
	payload, err := decodeJSON(r)
	if err != nil {
		apiError(w, http.StatusBadRequest, "Invalid JSON payload", nil)
		return
	}
	errorsMap := map[string][]string{}
	emailValue := payload["email"]
	password, _ := payload["password"].(string)
	validateEmailField(emailValue, errorsMap, true)
	if password == "" {
		addError(errorsMap, "password", "The password field is required.")
	}
	if len(errorsMap) > 0 {
		invalidField(w, errorsMap)
		return
	}
	email, _ := stringFromAny(emailValue)
	user, err := s.userByEmail(r.Context(), normalizeEmail(email))
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			apiError(w, http.StatusUnauthorized, "Username or password incorrect", nil)
			return
		}
		serverError(w, err)
		return
	}
	if !verifyPassword(user.PasswordHash, password) {
		apiError(w, http.StatusUnauthorized, "Username or password incorrect", nil)
		return
	}
	token, _, err := s.createAccessToken(user)
	if err != nil {
		serverError(w, err)
		return
	}
	success(w, http.StatusOK, "Login successful", userMap(user, token))
}

func (s *Server) logout(w http.ResponseWriter, r *http.Request) {
	authHeader := r.Header.Get("Authorization")
	tokenString := strings.TrimSpace(strings.TrimPrefix(authHeader, "Bearer "))
	parsedClaims := &claims{}
	_, _, err := jwtParser().ParseUnverified(tokenString, parsedClaims)
	if err != nil || parsedClaims.ID == "" {
		unauthenticated(w)
		return
	}
	user := currentUser(r)
	_, err = s.db.ExecContext(r.Context(), `
		insert into token_blocklist (jti, user_id)
		values ($1, $2)
		on conflict (jti) do nothing
	`, parsedClaims.ID, user.ID)
	if err != nil {
		serverError(w, err)
		return
	}
	success(w, http.StatusOK, "Logout successful", nil)
}

func jwtParser() *jwt.Parser {
	return jwt.NewParser()
}

func (s *Server) me(w http.ResponseWriter, r *http.Request) {
	success(w, http.StatusOK, "Get profile successful", userMap(currentUser(r), ""))
}

func (s *Server) updateMe(w http.ResponseWriter, r *http.Request) {
	payload, err := decodeJSON(r)
	if err != nil {
		apiError(w, http.StatusBadRequest, "Invalid JSON payload", nil)
		return
	}
	user := currentUser(r)
	errorsMap := map[string][]string{}
	updates := map[string]any{}

	if value, exists := payload["name"]; exists {
		name, ok := value.(string)
		if !ok || strings.TrimSpace(name) == "" {
			addError(errorsMap, "name", "The name must be a non-empty string.")
		} else {
			updates["name"] = strings.TrimSpace(name)
		}
	}
	if value, exists := payload["email"]; exists {
		validateEmailField(value, errorsMap, true)
		email, _ := value.(string)
		email = normalizeEmail(email)
		if email != "" {
			var existingID int64
			err := s.db.QueryRowContext(r.Context(), `select id from users where lower(email) = lower($1)`, email).Scan(&existingID)
			if err != nil && !errors.Is(err, sql.ErrNoRows) {
				serverError(w, err)
				return
			}
			if err == nil && existingID != user.ID {
				addError(errorsMap, "email", "The email has already been taken.")
			}
			if _, bad := errorsMap["email"]; !bad {
				updates["email"] = email
			}
		}
	}
	if value, exists := payload["password"]; exists {
		password, ok := value.(string)
		if !ok || len(password) < 6 {
			addError(errorsMap, "password", "The password must be at least 6 characters.")
		} else {
			hash, err := hashPassword(password)
			if err != nil {
				serverError(w, err)
				return
			}
			updates["password_hash"] = hash
		}
	}
	if len(errorsMap) > 0 {
		invalidField(w, errorsMap)
		return
	}
	if len(updates) == 0 {
		success(w, http.StatusOK, "Profile updated successful", userMap(user, ""))
		return
	}

	name := user.Name
	email := user.Email
	passwordHash := user.PasswordHash
	if value, ok := updates["name"].(string); ok {
		name = value
	}
	if value, ok := updates["email"].(string); ok {
		email = value
	}
	if value, ok := updates["password_hash"].(string); ok {
		passwordHash = value
	}
	updated, err := scanUser(s.db.QueryRowContext(r.Context(), `
		update users set name = $1, email = $2, password_hash = $3, updated_at = now()
		where id = $4
		returning id, name, email, password_hash, role, created_at, updated_at
	`, name, email, passwordHash, user.ID))
	if err != nil {
		serverError(w, err)
		return
	}
	success(w, http.StatusOK, "Profile updated successful", userMap(updated, ""))
}
