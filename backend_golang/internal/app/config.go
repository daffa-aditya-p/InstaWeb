package app

import (
	"bufio"
	"os"
	"path/filepath"
	"strconv"
	"strings"
)

type Config struct {
	Port                         string
	DatabaseURL                  string
	JWTSecret                    string
	CORSOrigins                  []string
	AutoMigrate                  bool
	SeedDemoData                 bool
	MaxUploadBytes               int64
	SupabaseURL                  string
	SupabaseServiceRoleKey       string
	SupabaseStorageBucket        string
	SupabaseStoragePublicBaseURL string
	MidtransServerKey            string
	MidtransSnapURL              string
	MidtransAPIURL               string
	DatabaseMaxOpenConns         int
	DatabaseMaxIdleConns         int
}

func LoadConfig() Config {
	loadDotEnv(".env")
	loadDotEnv(filepath.Join("backend_golang", ".env"))

	port := env("PORT", "5000")
	cors := splitCSV(env("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"))

	return Config{
		Port:                         port,
		DatabaseURL:                  env("DATABASE_URL", env("SUPABASE_DB_URL", "")),
		JWTSecret:                    env("JWT_SECRET_KEY", "instaweb-jwt-local-development-secret"),
		CORSOrigins:                  cors,
		AutoMigrate:                  envBool("AUTO_MIGRATE", true),
		SeedDemoData:                 envBool("SEED_DEMO_DATA", true),
		MaxUploadBytes:               envInt64("MAX_UPLOAD_BYTES", 10*1024*1024),
		SupabaseURL:                  strings.TrimRight(env("SUPABASE_URL", ""), "/"),
		SupabaseServiceRoleKey:       env("SUPABASE_SERVICE_ROLE_KEY", ""),
		SupabaseStorageBucket:        env("SUPABASE_STORAGE_BUCKET", "instaweb-uploads"),
		SupabaseStoragePublicBaseURL: strings.TrimRight(env("SUPABASE_STORAGE_PUBLIC_BASE_URL", ""), "/"),
		MidtransServerKey:            env("MIDTRANS_SERVER_KEY", ""),
		MidtransSnapURL:              env("MIDTRANS_SNAP_URL", "https://app.sandbox.midtrans.com/snap/v1/transactions"),
		MidtransAPIURL:               strings.TrimRight(env("MIDTRANS_API_URL", "https://api.sandbox.midtrans.com/v2"), "/"),
		DatabaseMaxOpenConns:         envInt("DATABASE_MAX_OPEN_CONNS", 4),
		DatabaseMaxIdleConns:         envInt("DATABASE_MAX_IDLE_CONNS", 2),
	}
}

func loadDotEnv(path string) {
	file, err := os.Open(path)
	if err != nil {
		return
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		key, value, ok := strings.Cut(line, "=")
		if !ok {
			continue
		}
		key = strings.TrimSpace(key)
		if key == "" {
			continue
		}
		if _, exists := os.LookupEnv(key); exists {
			continue
		}
		os.Setenv(key, strings.Trim(strings.TrimSpace(value), `"'`))
	}
}

func env(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}

func envBool(key string, fallback bool) bool {
	value, ok := os.LookupEnv(key)
	if !ok || strings.TrimSpace(value) == "" {
		return fallback
	}
	parsed, err := strconv.ParseBool(value)
	if err != nil {
		return fallback
	}
	return parsed
}

func envInt64(key string, fallback int64) int64 {
	value, ok := os.LookupEnv(key)
	if !ok || strings.TrimSpace(value) == "" {
		return fallback
	}
	parsed, err := strconv.ParseInt(value, 10, 64)
	if err != nil {
		return fallback
	}
	return parsed
}

func envInt(key string, fallback int) int {
	value, ok := os.LookupEnv(key)
	if !ok || strings.TrimSpace(value) == "" {
		return fallback
	}
	parsed, err := strconv.Atoi(value)
	if err != nil {
		return fallback
	}
	return parsed
}

func splitCSV(value string) []string {
	parts := strings.Split(value, ",")
	items := make([]string, 0, len(parts))
	for _, part := range parts {
		part = strings.TrimSpace(part)
		if part != "" {
			items = append(items, part)
		}
	}
	return items
}
