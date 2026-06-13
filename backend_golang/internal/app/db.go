package app

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/stdlib"
)

func OpenDatabase(ctx context.Context, cfg Config) (*sql.DB, error) {
	if cfg.DatabaseURL == "" {
		return nil, errors.New("DATABASE_URL or SUPABASE_DB_URL is required")
	}
	connConfig, err := pgx.ParseConfig(cfg.DatabaseURL)
	if err != nil {
		return nil, err
	}

	// Disable prepared statements for compatibility with Supabase connection pooler (transaction mode)
	connConfig.DefaultQueryExecMode = pgx.QueryExecModeSimpleProtocol

	db := stdlib.OpenDB(*connConfig)
	db.SetMaxOpenConns(cfg.DatabaseMaxOpenConns)
	db.SetMaxIdleConns(cfg.DatabaseMaxIdleConns)
	db.SetConnMaxLifetime(30 * time.Minute)
	if err := db.PingContext(ctx); err != nil {
		db.Close()
		return nil, err
	}
	return db, nil
}

func ApplyMigrations(ctx context.Context, db *sql.DB) error {
	files, err := migrationFiles()
	if err != nil {
		return err
	}
	if len(files) == 0 {
		return errors.New("no migration files found")
	}
	if _, err := db.ExecContext(ctx, `create table if not exists schema_migrations (version text primary key, applied_at timestamptz not null default now())`); err != nil {
		return err
	}
	for _, file := range files {
		version := filepath.Base(file)
		var exists bool
		if err := db.QueryRowContext(ctx, `select exists(select 1 from schema_migrations where version = $1)`, version).Scan(&exists); err != nil {
			return err
		}
		if exists {
			continue
		}
		body, err := os.ReadFile(file)
		if err != nil {
			return err
		}
		tx, err := db.BeginTx(ctx, nil)
		if err != nil {
			return err
		}
		if _, err := tx.ExecContext(ctx, string(body)); err != nil {
			tx.Rollback()
			return fmt.Errorf("%s: %w", version, err)
		}
		if _, err := tx.ExecContext(ctx, `insert into schema_migrations (version) values ($1)`, version); err != nil {
			tx.Rollback()
			return err
		}
		if err := tx.Commit(); err != nil {
			return err
		}
	}
	return nil
}

func migrationFiles() ([]string, error) {
	candidates := []string{
		"migrations",
		filepath.Join("backend_golang", "migrations"),
	}
	for _, dir := range candidates {
		entries, err := os.ReadDir(dir)
		if err != nil {
			continue
		}
		files := make([]string, 0, len(entries))
		for _, entry := range entries {
			if entry.IsDir() || filepath.Ext(entry.Name()) != ".sql" {
				continue
			}
			files = append(files, filepath.Join(dir, entry.Name()))
		}
		sort.Strings(files)
		return files, nil
	}
	return nil, nil
}

func withTx(ctx context.Context, db *sql.DB, fn func(*sql.Tx) error) error {
	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	if err := fn(tx); err != nil {
		tx.Rollback()
		return err
	}
	return tx.Commit()
}
