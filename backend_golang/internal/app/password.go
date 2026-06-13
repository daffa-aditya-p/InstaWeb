package app

import (
	"crypto/hmac"
	"crypto/sha256"
	"crypto/sha512"
	"encoding/base64"
	"encoding/hex"
	"errors"
	"strconv"
	"strings"

	"golang.org/x/crypto/bcrypt"
	"golang.org/x/crypto/pbkdf2"
	"golang.org/x/crypto/scrypt"
)

func hashPassword(password string) (string, error) {
	hashed, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hashed), nil
}

func verifyPassword(storedHash, password string) bool {
	if strings.HasPrefix(storedHash, "$2a$") || strings.HasPrefix(storedHash, "$2b$") || strings.HasPrefix(storedHash, "$2y$") {
		return bcrypt.CompareHashAndPassword([]byte(storedHash), []byte(password)) == nil
	}
	if strings.HasPrefix(storedHash, "scrypt:") {
		return verifyWerkzeugScrypt(storedHash, password) == nil
	}
	if strings.HasPrefix(storedHash, "pbkdf2:") {
		return verifyWerkzeugPBKDF2(storedHash, password) == nil
	}
	return false
}

func verifyWerkzeugScrypt(storedHash, password string) error {
	parts := strings.Split(storedHash, "$")
	if len(parts) != 3 {
		return errors.New("invalid scrypt hash")
	}
	method := strings.TrimPrefix(parts[0], "scrypt:")
	params := strings.Split(method, ":")
	if len(params) != 3 {
		return errors.New("invalid scrypt params")
	}
	n, err := strconv.Atoi(params[0])
	if err != nil {
		return err
	}
	r, err := strconv.Atoi(params[1])
	if err != nil {
		return err
	}
	p, err := strconv.Atoi(params[2])
	if err != nil {
		return err
	}
	expected, err := hex.DecodeString(parts[2])
	if err != nil {
		return err
	}
	derived, err := scrypt.Key([]byte(password), []byte(parts[1]), n, r, p, len(expected))
	if err != nil {
		return err
	}
	if !hmac.Equal(derived, expected) {
		return errors.New("password mismatch")
	}
	return nil
}

func verifyWerkzeugPBKDF2(storedHash, password string) error {
	parts := strings.Split(storedHash, "$")
	if len(parts) != 3 {
		return errors.New("invalid pbkdf2 hash")
	}
	method := strings.TrimPrefix(parts[0], "pbkdf2:")
	params := strings.Split(method, ":")
	if len(params) != 2 {
		return errors.New("invalid pbkdf2 params")
	}
	iterations, err := strconv.Atoi(params[1])
	if err != nil {
		return err
	}
	expected, err := hex.DecodeString(parts[2])
	if err != nil {
		return err
	}
	var derived []byte
	switch params[0] {
	case "sha256":
		derived = pbkdf2.Key([]byte(password), []byte(parts[1]), iterations, len(expected), sha256.New)
	case "sha512":
		derived = pbkdf2.Key([]byte(password), []byte(parts[1]), iterations, len(expected), sha512.New)
	default:
		return errors.New("unsupported pbkdf2 method")
	}
	if !hmac.Equal(derived, expected) {
		return errors.New("password mismatch")
	}
	return nil
}

func basicAuthValue(username, password string) string {
	return "Basic " + base64.StdEncoding.EncodeToString([]byte(username+":"+password))
}
