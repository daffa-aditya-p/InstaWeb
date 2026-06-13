package app

import (
	"net/mail"
	"regexp"
	"strconv"
	"strings"
)

var slugPattern = regexp.MustCompile(`^[a-z0-9]+(?:-[a-z0-9]+)*$`)

func validateSlug(value any, errors map[string][]string, field string) {
	if value == nil {
		addError(errors, field, "The slug field is required.")
		return
	}
	raw, ok := value.(string)
	if !ok {
		addError(errors, field, "The slug must be a string.")
		return
	}
	if raw == "" {
		addError(errors, field, "The slug field is required.")
		return
	}
	if !slugPattern.MatchString(raw) {
		addError(errors, field, "The slug may only contain lowercase letters, numbers, and hyphens.")
	}
}

func validateEmailField(value any, errors map[string][]string, required bool) {
	if value == nil {
		if required {
			addError(errors, "email", "The email field is required.")
		}
		return
	}
	raw, ok := value.(string)
	if !ok {
		addError(errors, "email", "The email must be a valid email address.")
		return
	}
	if raw == "" {
		if required {
			addError(errors, "email", "The email field is required.")
		}
		return
	}
	if _, err := mail.ParseAddress(raw); err != nil || !strings.Contains(raw, "@") {
		addError(errors, "email", "The email must be a valid email address.")
	}
}

func requiredString(payload map[string]any, field string, errors map[string][]string, minLength int) (string, bool) {
	value, exists := payload[field]
	if !exists || value == nil {
		addError(errors, field, "The "+field+" field is required.")
		return "", false
	}
	raw, ok := value.(string)
	if !ok {
		addError(errors, field, "The "+field+" must be a string.")
		return "", false
	}
	if raw == "" {
		addError(errors, field, "The "+field+" field is required.")
		return "", false
	}
	if minLength > 0 && len(raw) < minLength {
		addError(errors, field, "The "+field+" must be at least "+itoa(minLength)+" characters.")
	}
	return raw, true
}

func optionalString(payload map[string]any, field string, errors map[string][]string) (string, bool) {
	value, exists := payload[field]
	if !exists || value == nil {
		return "", false
	}
	raw, ok := value.(string)
	if !ok {
		addError(errors, field, "The "+field+" must be a string.")
		return "", true
	}
	return raw, true
}

func itoa(value int) string {
	return strconv.Itoa(value)
}
