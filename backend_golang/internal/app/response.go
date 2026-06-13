package app

import (
	"encoding/json"
	"log"
	"net/http"
)

type apiResponse map[string]any

func writeJSON(w http.ResponseWriter, status int, body any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(body); err != nil {
		log.Printf("encode response: %v", err)
	}
}

func success(w http.ResponseWriter, status int, message string, data any) {
	body := apiResponse{"status": "success", "message": message}
	if data != nil {
		body["data"] = data
	}
	writeJSON(w, status, body)
}

func apiError(w http.ResponseWriter, status int, message string, errors any) {
	body := apiResponse{"status": "error", "message": message}
	if errors != nil {
		body["errors"] = errors
	}
	writeJSON(w, status, body)
}

func invalidField(w http.ResponseWriter, errors map[string][]string) {
	apiError(w, http.StatusUnprocessableEntity, "Invalid field", errors)
}

func notFound(w http.ResponseWriter) {
	apiError(w, http.StatusNotFound, "Not found", nil)
}

func forbidden(w http.ResponseWriter) {
	apiError(w, http.StatusForbidden, "Forbidden access", nil)
}

func unauthenticated(w http.ResponseWriter) {
	apiError(w, http.StatusUnauthorized, "Unauthenticated.", nil)
}

func serverError(w http.ResponseWriter, err error) {
	log.Printf("internal error: %v", err)
	apiError(w, http.StatusInternalServerError, "Internal server error", nil)
}

func addError(errors map[string][]string, field, message string) {
	errors[field] = append(errors[field], message)
}
