package app

import (
	"bytes"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestCORSWildcard(t *testing.T) {
	// Test case 1: Wildcard CORS allowed
	s1 := &Server{
		cfg: Config{
			CORSOrigins: []string{"*"},
		},
	}
	handler1 := s1.cors(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	req1 := httptest.NewRequest("GET", "/api/health", nil)
	req1.Header.Set("Origin", "http://evil.com")
	rr1 := httptest.NewRecorder()

	handler1.ServeHTTP(rr1, req1)

	if rr1.Header().Get("Access-Control-Allow-Origin") != "*" {
		t.Errorf("Expected Access-Control-Allow-Origin to be '*', got %q", rr1.Header().Get("Access-Control-Allow-Origin"))
	}
	if rr1.Header().Get("Access-Control-Allow-Credentials") == "true" {
		t.Errorf("Expected Access-Control-Allow-Credentials to not be 'true' for wildcard CORS")
	}
	if rr1.Header().Get("X-Content-Type-Options") != "nosniff" {
		t.Errorf("Expected X-Content-Type-Options to be 'nosniff', got %q", rr1.Header().Get("X-Content-Type-Options"))
	}

	// Test case 2: Specific origin CORS allowed
	s2 := &Server{
		cfg: Config{
			CORSOrigins: []string{"http://localhost:5173"},
		},
	}
	handler2 := s2.cors(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	req2 := httptest.NewRequest("GET", "/api/health", nil)
	req2.Header.Set("Origin", "http://localhost:5173")
	rr2 := httptest.NewRecorder()

	handler2.ServeHTTP(rr2, req2)

	if rr2.Header().Get("Access-Control-Allow-Origin") != "http://localhost:5173" {
		t.Errorf("Expected Access-Control-Allow-Origin to be 'http://localhost:5173', got %q", rr2.Header().Get("Access-Control-Allow-Origin"))
	}
	if rr2.Header().Get("Access-Control-Allow-Credentials") != "true" {
		t.Errorf("Expected Access-Control-Allow-Credentials to be 'true'")
	}
}

func TestUploadSecurity(t *testing.T) {
	// Create temporary uploads folder
	tmpDir, err := os.MkdirTemp("", "uploads-test-*")
	if err != nil {
		t.Fatalf("failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tmpDir)

	s := &Server{
		cfg: Config{
			MaxUploadBytes: 10 * 1024,
		},
	}

	tests := []struct {
		name        string
		filename    string
		content     []byte
		expectError bool
		errorMsg    string
	}{
		{
			name:        "Valid PNG Image",
			filename:    "test.png",
			content:     []byte("\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89"),
			expectError: false,
		},
		{
			name:        "Fake PNG (Text File)",
			filename:    "fake.png",
			content:     []byte("this is not a png file, it is plain text"),
			expectError: true,
			errorMsg:    "invalid file content: not a valid image",
		},
		{
			name:        "Malicious SVG (XSS Script)",
			filename:    "exploit.svg",
			content:     []byte(`<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>`),
			expectError: true,
			errorMsg:    "malicious SVG content detected",
		},
		{
			name:        "Malicious SVG (XSS onload event)",
			filename:    "exploit2.svg",
			content:     []byte(`<svg xmlns="http://www.w3.org/2000/svg" onload="javascript:alert(1)"></svg>`),
			expectError: true,
			errorMsg:    "malicious SVG content detected",
		},
		{
			name:        "Safe SVG",
			filename:    "safe.svg",
			content:     []byte(`<svg xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40" fill="red" /></svg>`),
			expectError: false,
		},
		{
			name:        "Invalid Extension",
			filename:    "shell.php",
			content:     []byte("<?php echo 'hello'; ?>"),
			expectError: true,
			errorMsg:    "invalid extension",
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			// Prepare multipart upload request
			body := &bytes.Buffer{}
			writer := multipart.NewWriter(body)
			part, err := writer.CreateFormFile("file", tc.filename)
			if err != nil {
				t.Fatalf("failed to create form file: %v", err)
			}
			_, _ = part.Write(tc.content)
			_ = writer.Close()

			req := httptest.NewRequest("POST", "/api/upload", body)
			req.Header.Set("Content-Type", writer.FormDataContentType())

			// Since s.uploadFile is what we are testing, let's call it.
			// However, uploadFile has:
			// return s.uploadToLocal(objectPath, content)
			// Wait, uploadToLocal in s is a method. We cannot easily override it unless we modify s.
			// But wait, s.cfg.SupabaseURL is empty, so it will call s.uploadToLocal.
			// Let's create an uploads directory locally if it doesn't exist and clean up after.
			// To avoid polluting, we can temporarily rename "uploads" directory or clean up the files generated.
			// Let's check: s.uploadFile will write to "uploads" directory.
			// Let's clean up any file in "uploads" that starts with the timestamp prefix.
			
			// Let's run uploadFile
			url, err := s.uploadFile(req, "file")
			if tc.expectError {
				if err == nil {
					t.Errorf("Expected error containing %q, got nil", tc.errorMsg)
				} else if !strings.Contains(err.Error(), tc.errorMsg) {
					t.Errorf("Expected error containing %q, got %q", tc.errorMsg, err.Error())
				}
			} else {
				if err != nil {
					t.Errorf("Expected no error, got %v", err)
				} else {
					// Clean up the uploaded file from uploads/
					filename := filepath.Base(url)
					localPath := filepath.Join("uploads", filename)
					_ = os.Remove(localPath)
				}
			}
		})
	}
}
