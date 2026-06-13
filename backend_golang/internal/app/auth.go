package app

import (
	"context"
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"errors"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type contextKey string

const userContextKey contextKey = "user"

type claims struct {
	Role string `json:"role"`
	jwt.RegisteredClaims
}

func (s *Server) requireAuth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			unauthenticated(w)
			return
		}
		tokenString := strings.TrimSpace(strings.TrimPrefix(authHeader, "Bearer "))
		parsedClaims := &claims{}
		token, err := jwt.ParseWithClaims(tokenString, parsedClaims, func(token *jwt.Token) (any, error) {
			if token.Method != jwt.SigningMethodHS256 {
				return nil, errors.New("unexpected signing method")
			}
			return []byte(s.cfg.JWTSecret), nil
		})
		if err != nil || !token.Valid {
			unauthenticated(w)
			return
		}
		if parsedClaims.ID == "" || parsedClaims.Subject == "" {
			unauthenticated(w)
			return
		}
		revoked, err := s.isTokenRevoked(r.Context(), parsedClaims.ID)
		if err != nil {
			serverError(w, err)
			return
		}
		if revoked {
			unauthenticated(w)
			return
		}
		userID, err := strconv.ParseInt(parsedClaims.Subject, 10, 64)
		if err != nil {
			unauthenticated(w)
			return
		}
		user, err := s.userByID(r.Context(), userID)
		if err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				unauthenticated(w)
				return
			}
			serverError(w, err)
			return
		}
		ctx := context.WithValue(r.Context(), userContextKey, user)
		next(w, r.WithContext(ctx))
	}
}

func currentUser(r *http.Request) *User {
	user, _ := r.Context().Value(userContextKey).(*User)
	return user
}

func roleRequired(roles ...string) func(http.HandlerFunc) http.HandlerFunc {
	allowed := make(map[string]bool, len(roles))
	for _, role := range roles {
		allowed[role] = true
	}
	return func(next http.HandlerFunc) http.HandlerFunc {
		return func(w http.ResponseWriter, r *http.Request) {
			user := currentUser(r)
			if user == nil || !allowed[user.Role] {
				forbidden(w)
				return
			}
			next(w, r)
		}
	}
}

func (s *Server) createAccessToken(user *User) (string, string, error) {
	jti, err := randomHex(16)
	if err != nil {
		return "", "", err
	}
	now := time.Now().UTC()
	claims := claims{
		Role: user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ID:        jti,
			Subject:   strconv.FormatInt(user.ID, 10),
			IssuedAt:  jwt.NewNumericDate(now),
			NotBefore: jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(7 * 24 * time.Hour)),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString([]byte(s.cfg.JWTSecret))
	if err != nil {
		return "", "", err
	}
	return signed, jti, nil
}

func randomHex(size int) (string, error) {
	bytes := make([]byte, size)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

func (s *Server) isTokenRevoked(ctx context.Context, jti string) (bool, error) {
	var exists bool
	err := s.db.QueryRowContext(ctx, `select exists(select 1 from token_blocklist where jti = $1)`, jti).Scan(&exists)
	return exists, err
}
