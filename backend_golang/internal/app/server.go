package app

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"
)

type Server struct {
	cfg Config
	db  *sql.DB
}

func NewServer(cfg Config, db *sql.DB) *Server {
	return &Server{cfg: cfg, db: db}
}

func (s *Server) Routes() http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /api/health", s.health)

	mux.HandleFunc("POST /api/register", s.register)
	mux.HandleFunc("POST /api/login", s.login)
	mux.HandleFunc("POST /api/logout", s.requireAuth(s.logout))
	mux.HandleFunc("GET /api/me", s.requireAuth(s.me))
	mux.HandleFunc("PUT /api/me", s.requireAuth(s.updateMe))

	mux.HandleFunc("GET /api/pages", s.requireAuth(s.indexPages))
	mux.HandleFunc("POST /api/pages", s.requireAuth(s.createPage))
	mux.HandleFunc("GET /api/pages/{identifier}", s.requireAuth(s.showPage))
	mux.HandleFunc("PUT /api/pages/{slug}", s.requireAuth(s.updatePage))
	mux.HandleFunc("DELETE /api/pages/{slug}", s.requireAuth(s.deletePage))
	mux.HandleFunc("PUT /api/pages/{slug}/publish", s.requireAuth(s.publishPage))
	mux.HandleFunc("POST /api/pages/{slug}/sections", s.requireAuth(s.addSection))
	mux.HandleFunc("PUT /api/pages/{slug}/sections/{section_id}/fields", s.requireAuth(s.updateSectionFields))
	mux.HandleFunc("PUT /api/pages/{slug}/sections/reorder", s.requireAuth(s.reorderSections))
	mux.HandleFunc("DELETE /api/pages/{slug}/sections/{section_id}", s.requireAuth(s.removeSection))
	mux.HandleFunc("POST /api/pages/{slug}/duplicate", s.requireAuth(s.duplicatePage))
	mux.HandleFunc("POST /api/pages/{slug}/sections/{section_id}/duplicate", s.requireAuth(s.duplicateSection))
	mux.HandleFunc("GET /api/pages/{slug}/export", s.requireAuth(s.exportPage))
	mux.HandleFunc("PUT /api/pages/{slug}/seo", s.requireAuth(s.updatePageSEO))
	mux.HandleFunc("POST /api/pages/upload", s.requireAuth(s.upload))
	mux.HandleFunc("POST /api/upload", s.requireAuth(s.upload))

	mux.HandleFunc("GET /api/templates", s.requireAuth(s.indexTemplates))
	mux.HandleFunc("GET /api/templates/{slug}", s.requireAuth(s.showTemplate))
	mux.HandleFunc("GET /api/public/pages/{slug}", s.publicPage)
	mux.HandleFunc("POST /api/public/track", s.trackPageView)

	mux.HandleFunc("GET /api/analytics/overview", s.requireAuth(s.analyticsOverview))
	mux.HandleFunc("GET /api/analytics/pages/{slug}/summary", s.requireAuth(s.pageSummary))
	mux.HandleFunc("GET /api/analytics/pages/{slug}/details", s.requireAuth(s.pageDetails))
	mux.HandleFunc("GET /api/analytics/pages/{slug}/visitors", s.requireAuth(s.pageVisitors))

	admin := roleRequired("admin", "super_admin")
	superAdmin := roleRequired("super_admin")
	mux.HandleFunc("GET /api/admin/analytics", s.requireAuth(admin(s.adminAnalytics)))
	mux.HandleFunc("GET /api/admin/users", s.requireAuth(superAdmin(s.adminUsers)))
	mux.HandleFunc("PUT /api/admin/users/{user_id}", s.requireAuth(superAdmin(s.adminUpdateUser)))
	mux.HandleFunc("DELETE /api/admin/users/{user_id}", s.requireAuth(superAdmin(s.adminDeleteUser)))
	mux.HandleFunc("GET /api/admin/pages", s.requireAuth(admin(s.adminPages)))
	mux.HandleFunc("DELETE /api/admin/pages/{identifier}", s.requireAuth(admin(s.adminDeletePage)))
	mux.HandleFunc("POST /api/admin/templates", s.requireAuth(admin(s.adminCreateTemplate)))
	mux.HandleFunc("PUT /api/admin/templates/{slug}", s.requireAuth(admin(s.adminUpdateTemplate)))
	mux.HandleFunc("DELETE /api/admin/templates/{slug}", s.requireAuth(admin(s.adminDeleteTemplate)))
	mux.HandleFunc("GET /api/admin/subscriptions", s.requireAuth(admin(s.adminSubscriptions)))
	mux.HandleFunc("PUT /api/admin/subscriptions/{sub_id}", s.requireAuth(superAdmin(s.adminUpdateSubscription)))
	mux.HandleFunc("GET /api/admin/revenue", s.requireAuth(admin(s.adminRevenue)))

	mux.HandleFunc("GET /api/subscription", s.requireAuth(s.getSubscription))
	mux.HandleFunc("POST /api/subscription/create", s.requireAuth(s.createSubscription))
	mux.HandleFunc("POST /api/subscription/notification", s.midtransNotification)
	mux.HandleFunc("GET /api/subscription/status/{order_id}", s.requireAuth(s.checkPaymentStatus))
	mux.HandleFunc("POST /api/subscription/verify", s.requireAuth(s.verifySubscription))

	mux.HandleFunc("GET /api/pages/{slug}/collaborators", s.requireAuth(s.listCollaborators))
	mux.HandleFunc("POST /api/pages/{slug}/collaborators", s.requireAuth(s.addCollaborator))
	mux.HandleFunc("DELETE /api/pages/{slug}/collaborators/{collab_id}", s.requireAuth(s.removeCollaborator))

	mux.HandleFunc("POST /api/pages/{slug}/invite", s.requireAuth(s.sendInvitation))
	mux.HandleFunc("GET /api/inbox", s.requireAuth(s.inbox))
	mux.HandleFunc("GET /api/inbox/count", s.requireAuth(s.inboxCount))
	mux.HandleFunc("PUT /api/inbox/{invite_id}/accept", s.requireAuth(s.acceptInvitation))
	mux.HandleFunc("PUT /api/inbox/{invite_id}/decline", s.requireAuth(s.declineInvitation))

	fileServer := http.StripPrefix("/static/uploads/", http.FileServer(http.Dir("uploads")))
	mux.Handle("GET /static/uploads/", fileServer)

	return s.cors(mux)
}

func (s *Server) cors(next http.Handler) http.Handler {
	allowed := map[string]bool{}
	for _, origin := range s.cfg.CORSOrigins {
		allowed[origin] = true
	}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if origin != "" {
			if allowed[origin] {
				w.Header().Set("Access-Control-Allow-Origin", origin)
				w.Header().Set("Vary", "Origin")
				w.Header().Set("Access-Control-Allow-Credentials", "true")
			} else if allowed["*"] {
				w.Header().Set("Access-Control-Allow-Origin", "*")
			}
		}
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("Access-Control-Allow-Headers", "Authorization, Content-Type, Accept")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func (s *Server) health(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, apiResponse{"status": "success", "message": "InstaWeb API is healthy"})
}

func decodeJSON(r *http.Request) (map[string]any, error) {
	if r.Body == nil {
		return map[string]any{}, nil
	}
	defer r.Body.Close()
	payload := map[string]any{}
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&payload); err != nil {
		return nil, err
	}
	return payload, nil
}

func pathInt(r *http.Request, name string) (int64, error) {
	return strconv.ParseInt(r.PathValue(name), 10, 64)
}

func intFromAny(value any) (int64, bool) {
	switch typed := value.(type) {
	case float64:
		if typed == float64(int64(typed)) {
			return int64(typed), true
		}
	case int:
		return int64(typed), true
	case int64:
		return typed, true
	}
	return 0, false
}

func stringFromAny(value any) (string, bool) {
	typed, ok := value.(string)
	return typed, ok
}

func nullableStringFromAny(value any) sql.NullString {
	if value == nil {
		return sql.NullString{}
	}
	if typed, ok := value.(string); ok {
		return sql.NullString{String: typed, Valid: true}
	}
	return sql.NullString{}
}

func (s *Server) userByID(ctx context.Context, id int64) (*User, error) {
	return scanUser(s.db.QueryRowContext(ctx, `
		select id, name, email, password_hash, role, created_at, updated_at
		from users where id = $1
	`, id))
}

func (s *Server) userByEmail(ctx context.Context, email string) (*User, error) {
	return scanUser(s.db.QueryRowContext(ctx, `
		select id, name, email, password_hash, role, created_at, updated_at
		from users where lower(email) = lower($1)
	`, email))
}

func scanUser(row interface{ Scan(...any) error }) (*User, error) {
	var user User
	err := row.Scan(&user.ID, &user.Name, &user.Email, &user.PasswordHash, &user.Role, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (s *Server) pageByIdentifier(ctx context.Context, identifier string) (*Page, error) {
	if id, err := strconv.ParseInt(identifier, 10, 64); err == nil {
		page, err := s.pageByQuery(ctx, `where p.id = $1`, id)
		if err == nil || !errors.Is(err, sql.ErrNoRows) {
			return page, err
		}
	}
	return s.pageByQuery(ctx, `where p.slug = $1`, identifier)
}

func (s *Server) pageBySlug(ctx context.Context, slug string) (*Page, error) {
	return s.pageByQuery(ctx, `where p.slug = $1`, slug)
}

func (s *Server) pageByQuery(ctx context.Context, condition string, arg any) (*Page, error) {
	query := `
		select p.id, p.user_id, p.title, p.slug, p.summary, p.is_published, p.published_at,
		       p.meta_title, p.meta_description, p.og_image, p.created_at, p.updated_at
		from pages p ` + condition
	return scanPage(s.db.QueryRowContext(ctx, query, arg))
}

func scanPage(row interface{ Scan(...any) error }) (*Page, error) {
	var page Page
	err := row.Scan(
		&page.ID, &page.UserID, &page.Title, &page.Slug, &page.Summary, &page.IsPublished,
		&page.PublishedAt, &page.MetaTitle, &page.MetaDescription, &page.OGImage, &page.CreatedAt, &page.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &page, nil
}

func (s *Server) loadPageSections(ctx context.Context, page *Page) error {
	rows, err := s.db.QueryContext(ctx, `
		select ps.id, ps.page_id, ps.template_id, ps.position, ps.created_at, ps.updated_at,
		       t.id, t.name, t.slug, t.description, t.created_at, t.updated_at
		from page_sections ps
		join templates t on t.id = ps.template_id
		where ps.page_id = $1
		order by ps.position asc
	`, page.ID)
	if err != nil {
		return err
	}
	defer rows.Close()

	page.Sections = []PageSection{}
	for rows.Next() {
		var section PageSection
		err := rows.Scan(
			&section.ID, &section.PageID, &section.TemplateID, &section.Position, &section.CreatedAt, &section.UpdatedAt,
			&section.Template.ID, &section.Template.Name, &section.Template.Slug, &section.Template.Description,
			&section.Template.CreatedAt, &section.Template.UpdatedAt,
		)
		if err != nil {
			return err
		}
		if err := s.loadSectionFields(ctx, &section); err != nil {
			return err
		}
		page.Sections = append(page.Sections, section)
	}
	return rows.Err()
}

func (s *Server) loadSectionFields(ctx context.Context, section *PageSection) error {
	rows, err := s.db.QueryContext(ctx, `
		select tf.id, tf.template_id, tf.name, tf.slug, tf.type, sfv.value
		from template_fields tf
		left join section_field_values sfv
		  on sfv.template_field_id = tf.id and sfv.page_section_id = $1
		where tf.template_id = $2
		order by tf.id asc
	`, section.ID, section.TemplateID)
	if err != nil {
		return err
	}
	defer rows.Close()

	section.Fields = []TemplateField{}
	for rows.Next() {
		var field TemplateField
		if err := rows.Scan(&field.ID, &field.TemplateID, &field.Name, &field.Slug, &field.Type, &field.Value); err != nil {
			return err
		}
		section.Fields = append(section.Fields, field)
	}
	section.Template.Fields = section.Fields
	return rows.Err()
}

func (s *Server) templateBySlug(ctx context.Context, slug string) (Template, error) {
	var template Template
	err := s.db.QueryRowContext(ctx, `
		select id, name, slug, description, created_at, updated_at
		from templates where slug = $1
	`, slug).Scan(&template.ID, &template.Name, &template.Slug, &template.Description, &template.CreatedAt, &template.UpdatedAt)
	if err != nil {
		return template, err
	}
	return template, s.loadTemplateFields(ctx, &template)
}

func (s *Server) templateByID(ctx context.Context, id int64) (Template, error) {
	var template Template
	err := s.db.QueryRowContext(ctx, `
		select id, name, slug, description, created_at, updated_at
		from templates where id = $1
	`, id).Scan(&template.ID, &template.Name, &template.Slug, &template.Description, &template.CreatedAt, &template.UpdatedAt)
	if err != nil {
		return template, err
	}
	return template, s.loadTemplateFields(ctx, &template)
}

func (s *Server) loadTemplateFields(ctx context.Context, template *Template) error {
	rows, err := s.db.QueryContext(ctx, `
		select id, template_id, name, slug, type
		from template_fields where template_id = $1
		order by id asc
	`, template.ID)
	if err != nil {
		return err
	}
	defer rows.Close()
	template.Fields = []TemplateField{}
	for rows.Next() {
		var field TemplateField
		if err := rows.Scan(&field.ID, &field.TemplateID, &field.Name, &field.Slug, &field.Type); err != nil {
			return err
		}
		template.Fields = append(template.Fields, field)
	}
	return rows.Err()
}

func (s *Server) canAccessPage(ctx context.Context, page *Page, user *User, allowAdmin bool, allowCollaborator bool) (bool, error) {
	if user == nil {
		return false, nil
	}
	if page.UserID == user.ID {
		return true, nil
	}
	if allowAdmin && (user.Role == "admin" || user.Role == "super_admin") {
		return true, nil
	}
	if allowCollaborator {
		var exists bool
		err := s.db.QueryRowContext(ctx, `
			select exists(select 1 from page_collaborators where page_id = $1 and user_id = $2)
		`, page.ID, user.ID).Scan(&exists)
		return exists, err
	}
	return false, nil
}

func normalizeEmail(email string) string {
	return strings.ToLower(strings.TrimSpace(email))
}
