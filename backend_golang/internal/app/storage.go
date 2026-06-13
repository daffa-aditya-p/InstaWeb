package app

import (
	"bytes"
	"errors"
	"io"
	"mime"
	"net/http"
	"os"
	"path"
	"path/filepath"
	"regexp"
	"strings"
	"time"
)

var allowedUploadExtensions = map[string]bool{
	".png": true, ".jpg": true, ".jpeg": true, ".gif": true,
	".webp": true, ".svg": true, ".bmp": true,
}

var filenameCleaner = regexp.MustCompile(`[^a-zA-Z0-9._-]+`)

func (s *Server) uploadFile(r *http.Request, formField string) (string, error) {
	r.Body = http.MaxBytesReader(nil, r.Body, s.cfg.MaxUploadBytes+1024)
	if err := r.ParseMultipartForm(s.cfg.MaxUploadBytes); err != nil {
		return "", err
	}
	file, header, err := r.FormFile(formField)
	if err != nil {
		return "", err
	}
	defer file.Close()

	ext := strings.ToLower(filepath.Ext(header.Filename))
	if !allowedUploadExtensions[ext] {
		return "", errors.New("invalid extension")
	}
	name := safeFilename(header.Filename)
	if name == "" || filepath.Ext(name) == "" {
		name = "image" + ext
	}
	objectPath := path.Join("uploads", time.Now().UTC().Format("20060102150405")+"_"+name)
	content, err := io.ReadAll(io.LimitReader(file, s.cfg.MaxUploadBytes+1))
	if err != nil {
		return "", err
	}
	if int64(len(content)) > s.cfg.MaxUploadBytes {
		return "", errors.New("file too large")
	}

	contentType := http.DetectContentType(content)
	if ext == ".svg" {
		if !strings.HasPrefix(contentType, "image/svg") &&
			!strings.HasPrefix(contentType, "text/xml") &&
			!strings.HasPrefix(contentType, "text/plain") {
			return "", errors.New("invalid file content for svg")
		}
		lowerContent := strings.ToLower(string(content))
		if strings.Contains(lowerContent, "<script") ||
			strings.Contains(lowerContent, "javascript:") ||
			strings.Contains(lowerContent, "onload") ||
			strings.Contains(lowerContent, "onerror") ||
			strings.Contains(lowerContent, "onclick") ||
			strings.Contains(lowerContent, "onmouseover") {
			return "", errors.New("malicious SVG content detected")
		}
	} else {
		if !strings.HasPrefix(contentType, "image/") || strings.Contains(contentType, "svg") {
			return "", errors.New("invalid file content: not a valid image")
		}
	}

	if s.cfg.SupabaseURL != "" && s.cfg.SupabaseServiceRoleKey != "" {
		return s.uploadToSupabase(objectPath, ext, content)
	}
	return s.uploadToLocal(objectPath, content)
}

func (s *Server) uploadToSupabase(objectPath string, ext string, content []byte) (string, error) {
	endpoint := s.cfg.SupabaseURL + "/storage/v1/object/" + path.Join(s.cfg.SupabaseStorageBucket, objectPath)
	req, err := http.NewRequest(http.MethodPost, endpoint, bytes.NewReader(content))
	if err != nil {
		return "", err
	}
	contentType := mime.TypeByExtension(ext)
	if contentType == "" {
		contentType = "application/octet-stream"
	}
	req.Header.Set("Content-Type", contentType)
	req.Header.Set("Authorization", "Bearer "+s.cfg.SupabaseServiceRoleKey)
	req.Header.Set("apikey", s.cfg.SupabaseServiceRoleKey)
	req.Header.Set("x-upsert", "false")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		body, _ := io.ReadAll(io.LimitReader(resp.Body, 4096))
		return "", errors.New("supabase storage upload failed: " + string(body))
	}
	if s.cfg.SupabaseStoragePublicBaseURL != "" {
		return s.cfg.SupabaseStoragePublicBaseURL + "/" + objectPath, nil
	}
	return s.cfg.SupabaseURL + "/storage/v1/object/public/" + path.Join(s.cfg.SupabaseStorageBucket, objectPath), nil
}

func (s *Server) uploadToLocal(objectPath string, content []byte) (string, error) {
	localPath := filepath.Join("uploads", filepath.Base(objectPath))
	if err := os.MkdirAll(filepath.Dir(localPath), 0o755); err != nil {
		return "", err
	}
	if err := os.WriteFile(localPath, content, 0o644); err != nil {
		return "", err
	}
	return "/static/uploads/" + filepath.Base(objectPath), nil
}

func safeFilename(name string) string {
	name = filepath.Base(name)
	name = strings.TrimSpace(name)
	name = filenameCleaner.ReplaceAllString(name, "_")
	return strings.Trim(name, "._-")
}
