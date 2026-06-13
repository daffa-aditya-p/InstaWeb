package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"instaweb/backend_golang/internal/app"
)

func main() {
	cfg := app.LoadConfig()

	db, err := app.OpenDatabase(context.Background(), cfg)
	if err != nil {
		log.Fatalf("database: %v", err)
	}
	defer db.Close()

	if cfg.AutoMigrate {
		if err := app.ApplyMigrations(context.Background(), db); err != nil {
			log.Fatalf("migrations: %v", err)
		}
	}

	if cfg.SeedDemoData {
		if err := app.SeedDefaults(context.Background(), db); err != nil {
			log.Fatalf("seed: %v", err)
		}
	}

	server := &http.Server{
		Addr:              "0.0.0.0:" + cfg.Port,
		Handler:           app.NewServer(cfg, db).Routes(),
		ReadHeaderTimeout: 10 * time.Second,
	}

	errs := make(chan error, 1)
	go func() {
		log.Printf("InstaWeb Go API listening on %s", server.Addr)
		errs <- server.ListenAndServe()
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)

	select {
	case err := <-errs:
		if err != nil && err != http.ErrServerClosed {
			log.Fatalf("server: %v", err)
		}
	case <-stop:
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		if err := server.Shutdown(ctx); err != nil {
			log.Fatalf("shutdown: %v", err)
		}
	}
}
