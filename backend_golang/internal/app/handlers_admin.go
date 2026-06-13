package app

import (
	"database/sql"
	"errors"
	"net/http"
	"strings"
)

func (s *Server) adminAnalytics(w http.ResponseWriter, r *http.Request) {
	count := func(query string, args ...any) int64 {
		var value int64
		if err := s.db.QueryRowContext(r.Context(), query, args...).Scan(&value); err != nil {
			return 0
		}
		return value
	}
	success(w, http.StatusOK, "Get platform analytics successful", map[string]any{
		"users":                count(`select count(*) from users`),
		"pages":                count(`select count(*) from pages`),
		"published_pages":      count(`select count(*) from pages where is_published = true`),
		"sections":             count(`select count(*) from page_sections`),
		"templates":            count(`select count(*) from templates`),
		"roles":                map[string]any{"super_admin": count(`select count(*) from users where role = 'super_admin'`), "admin": count(`select count(*) from users where role = 'admin'`), "user": count(`select count(*) from users where role = 'user'`)},
		"total_page_views":     count(`select count(*) from page_views`),
		"active_subscriptions": count(`select count(*) from subscriptions where status = 'active' and plan <> 'free'`),
		"total_invitations":    count(`select count(*) from invitations`),
	})
}

func (s *Server) adminUsers(w http.ResponseWriter, r *http.Request) {
	rows, err := s.db.QueryContext(r.Context(), `
		select id, name, email, password_hash, role, created_at, updated_at
		from users order by created_at desc
	`)
	if err != nil {
		serverError(w, err)
		return
	}
	defer rows.Close()
	users := []map[string]any{}
	for rows.Next() {
		user, err := scanUser(rows)
		if err != nil {
			serverError(w, err)
			return
		}
		users = append(users, userMap(user, ""))
	}
	success(w, http.StatusOK, "Get all users successful", map[string]any{"users": users})
}

func (s *Server) adminUpdateUser(w http.ResponseWriter, r *http.Request) {
	userID, err := pathInt(r, "user_id")
	if err != nil {
		notFound(w)
		return
	}
	user, err := s.userByID(r.Context(), userID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			notFound(w)
			return
		}
		serverError(w, err)
		return
	}
	payload, err := decodeJSON(r)
	if err != nil {
		apiError(w, http.StatusBadRequest, "Invalid JSON payload", nil)
		return
	}
	errorsMap := map[string][]string{}
	if value, exists := payload["name"]; exists {
		name, ok := value.(string)
		if !ok || strings.TrimSpace(name) == "" {
			addError(errorsMap, "name", "The name must be a non-empty string.")
		} else {
			user.Name = strings.TrimSpace(name)
		}
	}
	if value, exists := payload["role"]; exists {
		role, ok := value.(string)
		if !ok || (role != "user" && role != "admin" && role != "super_admin") {
			addError(errorsMap, "role", "The selected role is invalid.")
		} else {
			if user.Role == "super_admin" && role != "super_admin" {
				var count int
				if err := s.db.QueryRowContext(r.Context(), `select count(*) from users where role = 'super_admin'`).Scan(&count); err != nil {
					serverError(w, err)
					return
				}
				if count <= 1 {
					addError(errorsMap, "role", "Cannot change role of the only super admin.")
				}
			}
			if len(errorsMap) == 0 {
				user.Role = role
			}
		}
	}
	if len(errorsMap) > 0 {
		invalidField(w, errorsMap)
		return
	}
	updated, err := scanUser(s.db.QueryRowContext(r.Context(), `
		update users set name = $1, role = $2, updated_at = now()
		where id = $3
		returning id, name, email, password_hash, role, created_at, updated_at
	`, user.Name, user.Role, user.ID))
	if err != nil {
		serverError(w, err)
		return
	}
	success(w, http.StatusOK, "User updated successful", userMap(updated, ""))
}

func (s *Server) adminDeleteUser(w http.ResponseWriter, r *http.Request) {
	userID, err := pathInt(r, "user_id")
	if err != nil {
		notFound(w)
		return
	}
	user, err := s.userByID(r.Context(), userID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			notFound(w)
			return
		}
		serverError(w, err)
		return
	}
	if user.Role == "super_admin" {
		var count int
		if err := s.db.QueryRowContext(r.Context(), `select count(*) from users where role = 'super_admin'`).Scan(&count); err != nil {
			serverError(w, err)
			return
		}
		if count <= 1 {
			forbidden(w)
			return
		}
	}
	if _, err := s.db.ExecContext(r.Context(), `delete from users where id = $1`, user.ID); err != nil {
		serverError(w, err)
		return
	}
	success(w, http.StatusOK, "User deleted successful", nil)
}

func (s *Server) adminPages(w http.ResponseWriter, r *http.Request) {
	rows, err := s.db.QueryContext(r.Context(), `
		select p.id, p.user_id, p.title, p.slug, p.summary, p.is_published, p.published_at,
		       p.meta_title, p.meta_description, p.og_image, p.created_at, p.updated_at,
		       u.id, u.name, u.email, u.password_hash, u.role, u.created_at, u.updated_at
		from pages p
		join users u on u.id = p.user_id
		order by p.updated_at desc
	`)
	if err != nil {
		serverError(w, err)
		return
	}
	defer rows.Close()
	items := []map[string]any{}
	for rows.Next() {
		var page Page
		var owner User
		err := rows.Scan(
			&page.ID, &page.UserID, &page.Title, &page.Slug, &page.Summary, &page.IsPublished, &page.PublishedAt,
			&page.MetaTitle, &page.MetaDescription, &page.OGImage, &page.CreatedAt, &page.UpdatedAt,
			&owner.ID, &owner.Name, &owner.Email, &owner.PasswordHash, &owner.Role, &owner.CreatedAt, &owner.UpdatedAt,
		)
		if err != nil {
			serverError(w, err)
			return
		}
		item := pageMap(&page, false)
		item["owner"] = userMap(&owner, "")
		items = append(items, item)
	}
	success(w, http.StatusOK, "Get all platform pages successful", map[string]any{"pages": items})
}

func (s *Server) adminDeletePage(w http.ResponseWriter, r *http.Request) {
	page, err := s.pageByIdentifier(r.Context(), r.PathValue("identifier"))
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			notFound(w)
			return
		}
		serverError(w, err)
		return
	}
	if _, err := s.db.ExecContext(r.Context(), `delete from pages where id = $1`, page.ID); err != nil {
		serverError(w, err)
		return
	}
	success(w, http.StatusOK, "Page deleted successful", nil)
}

func (s *Server) adminCreateTemplate(w http.ResponseWriter, r *http.Request) {
	payload, err := decodeJSON(r)
	if err != nil {
		apiError(w, http.StatusBadRequest, "Invalid JSON payload", nil)
		return
	}
	errorsMap := s.validateTemplatePayload(r, payload, true, nil)
	if len(errorsMap) > 0 {
		invalidField(w, errorsMap)
		return
	}
	var newID int64
	err = withTx(r.Context(), s.db, func(tx *sql.Tx) error {
		description := nullableStringFromAny(payload["description"])
		return tx.QueryRowContext(r.Context(), `
			insert into templates (name, slug, description)
			values ($1, $2, $3) returning id
		`, strings.TrimSpace(payload["name"].(string)), payload["slug"].(string), description).Scan(&newID)
	})
	if err != nil {
		serverError(w, err)
		return
	}
	if err := s.syncTemplateFields(r, newID, payload["fields"].([]any)); err != nil {
		serverError(w, err)
		return
	}
	template, err := s.templateByID(r.Context(), newID)
	if err != nil {
		serverError(w, err)
		return
	}
	success(w, http.StatusCreated, "Template created successful", templateMap(template, true))
}

func (s *Server) adminUpdateTemplate(w http.ResponseWriter, r *http.Request) {
	template, err := s.templateBySlug(r.Context(), r.PathValue("slug"))
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			notFound(w)
			return
		}
		serverError(w, err)
		return
	}
	payload, err := decodeJSON(r)
	if err != nil {
		apiError(w, http.StatusBadRequest, "Invalid JSON payload", nil)
		return
	}
	errorsMap := s.validateTemplatePayload(r, payload, false, &template)
	if len(errorsMap) > 0 {
		invalidField(w, errorsMap)
		return
	}
	name := template.Name
	slug := template.Slug
	description := template.Description
	if value, exists := payload["name"].(string); exists {
		name = strings.TrimSpace(value)
	}
	if value, exists := payload["slug"].(string); exists {
		slug = value
	}
	if _, exists := payload["description"]; exists {
		description = nullableStringFromAny(payload["description"])
	}
	if _, err := s.db.ExecContext(r.Context(), `
		update templates set name = $1, slug = $2, description = $3, updated_at = now()
		where id = $4
	`, name, slug, description, template.ID); err != nil {
		serverError(w, err)
		return
	}
	if fields, exists := payload["fields"].([]any); exists {
		if err := s.syncTemplateFields(r, template.ID, fields); err != nil {
			serverError(w, err)
			return
		}
	}
	updated, err := s.templateByID(r.Context(), template.ID)
	if err != nil {
		serverError(w, err)
		return
	}
	success(w, http.StatusOK, "Template updated successful", templateMap(updated, true))
}

func (s *Server) adminDeleteTemplate(w http.ResponseWriter, r *http.Request) {
	template, err := s.templateBySlug(r.Context(), r.PathValue("slug"))
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			notFound(w)
			return
		}
		serverError(w, err)
		return
	}
	var used bool
	if err := s.db.QueryRowContext(r.Context(), `select exists(select 1 from page_sections where template_id = $1)`, template.ID).Scan(&used); err != nil {
		serverError(w, err)
		return
	}
	if used {
		invalidField(w, map[string][]string{"template": {"The template is currently used by one or more sections."}})
		return
	}
	if _, err := s.db.ExecContext(r.Context(), `delete from templates where id = $1`, template.ID); err != nil {
		serverError(w, err)
		return
	}
	success(w, http.StatusOK, "Template deleted successful", nil)
}

func (s *Server) validateTemplatePayload(r *http.Request, payload map[string]any, create bool, template *Template) map[string][]string {
	errorsMap := map[string][]string{}
	name, nameExists := payload["name"]
	slug, slugExists := payload["slug"]
	fields, fieldsExists := payload["fields"].([]any)
	if create {
		requiredString(payload, "name", errorsMap, 0)
		validateSlug(slug, errorsMap, "slug")
		if !fieldsExists || len(fields) == 0 {
			addError(errorsMap, "fields", "The fields field is required.")
		}
	} else {
		if nameExists {
			raw, ok := name.(string)
			if !ok || strings.TrimSpace(raw) == "" {
				addError(errorsMap, "name", "The name must be a non-empty string.")
			}
		}
		if slugExists {
			validateSlug(slug, errorsMap, "slug")
		}
		if _, exists := payload["fields"]; exists && (!fieldsExists || len(fields) == 0) {
			addError(errorsMap, "fields", "The fields must be a non-empty array.")
		}
	}
	if rawSlug, ok := slug.(string); ok && rawSlug != "" {
		var existingID int64
		err := s.db.QueryRowContext(r.Context(), `select id from templates where slug = $1`, rawSlug).Scan(&existingID)
		if err != nil && !errors.Is(err, sql.ErrNoRows) {
			addError(errorsMap, "slug", "Unable to validate slug.")
		}
		if err == nil && (template == nil || existingID != template.ID) {
			addError(errorsMap, "slug", "The slug has already been taken.")
		}
	}
	if fieldsExists {
		seen := map[string]bool{}
		for index, item := range fields {
			field, ok := item.(map[string]any)
			if !ok {
				addError(errorsMap, "fields."+itoa(index), "Each field must be an object.")
				continue
			}
			fieldName, _ := field["name"].(string)
			fieldSlug, _ := field["slug"].(string)
			fieldType, _ := field["type"].(string)
			if strings.TrimSpace(fieldName) == "" {
				addError(errorsMap, "fields."+itoa(index)+".name", "The field name is required.")
			}
			fieldErrors := map[string][]string{}
			validateSlug(field["slug"], fieldErrors, "slug")
			for _, message := range fieldErrors["slug"] {
				addError(errorsMap, "fields."+itoa(index)+".slug", message)
			}
			if seen[fieldSlug] {
				addError(errorsMap, "fields."+itoa(index)+".slug", "The field slug must be unique.")
			}
			seen[fieldSlug] = true
			if fieldType != "text" && fieldType != "image" {
				addError(errorsMap, "fields."+itoa(index)+".type", "The type must be text or image.")
			}
		}
	}
	return errorsMap
}

func (s *Server) syncTemplateFields(r *http.Request, templateID int64, fields []any) error {
	return withTx(r.Context(), s.db, func(tx *sql.Tx) error {
		desired := map[string]map[string]any{}
		for _, item := range fields {
			field := item.(map[string]any)
			desired[field["slug"].(string)] = field
		}
		rows, err := tx.QueryContext(r.Context(), `select id, slug from template_fields where template_id = $1`, templateID)
		if err != nil {
			return err
		}
		existing := map[string]int64{}
		for rows.Next() {
			var id int64
			var slug string
			if err := rows.Scan(&id, &slug); err != nil {
				rows.Close()
				return err
			}
			existing[slug] = id
		}
		rows.Close()
		for slug, id := range existing {
			if _, ok := desired[slug]; !ok {
				if _, err := tx.ExecContext(r.Context(), `delete from template_fields where id = $1`, id); err != nil {
					return err
				}
			}
		}
		for slug, field := range desired {
			name := strings.TrimSpace(field["name"].(string))
			fieldType := field["type"].(string)
			if id, ok := existing[slug]; ok {
				if _, err := tx.ExecContext(r.Context(), `update template_fields set name = $1, type = $2, updated_at = now() where id = $3`, name, fieldType, id); err != nil {
					return err
				}
			} else {
				if _, err := tx.ExecContext(r.Context(), `insert into template_fields (template_id, name, slug, type) values ($1, $2, $3, $4)`, templateID, name, slug, fieldType); err != nil {
					return err
				}
			}
		}
		return nil
	})
}

func (s *Server) adminSubscriptions(w http.ResponseWriter, r *http.Request) {
	rows, err := s.db.QueryContext(r.Context(), `
		select s.id, s.plan, s.billing_cycle, s.status, s.amount, s.started_at, s.expires_at,
		       u.id, u.name, u.email, u.password_hash, u.role, u.created_at, u.updated_at
		from subscriptions s
		join users u on u.id = s.user_id
		order by s.created_at desc
	`)
	if err != nil {
		serverError(w, err)
		return
	}
	defer rows.Close()
	items := []map[string]any{}
	for rows.Next() {
		var sub Subscription
		var user User
		if err := rows.Scan(&sub.ID, &sub.Plan, &sub.BillingCycle, &sub.Status, &sub.Amount, &sub.StartedAt, &sub.ExpiresAt, &user.ID, &user.Name, &user.Email, &user.PasswordHash, &user.Role, &user.CreatedAt, &user.UpdatedAt); err != nil {
			serverError(w, err)
			return
		}
		items = append(items, map[string]any{
			"id":            sub.ID,
			"user":          map[string]any{"id": user.ID, "name": user.Name, "email": user.Email},
			"plan":          sub.Plan,
			"billing_cycle": stringOrNil(sub.BillingCycle),
			"status":        sub.Status,
			"amount":        sub.Amount,
			"started_at":    timeOrNil(sub.StartedAt),
			"expires_at":    timeOrNil(sub.ExpiresAt),
		})
	}
	success(w, http.StatusOK, "All subscriptions", map[string]any{"subscriptions": items})
}

func (s *Server) adminUpdateSubscription(w http.ResponseWriter, r *http.Request) {
	subID, err := pathInt(r, "sub_id")
	if err != nil {
		notFound(w)
		return
	}
	payload, err := decodeJSON(r)
	if err != nil {
		apiError(w, http.StatusBadRequest, "Invalid JSON payload", nil)
		return
	}
	var plan, status string
	if err := s.db.QueryRowContext(r.Context(), `select plan, status from subscriptions where id = $1`, subID).Scan(&plan, &status); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			notFound(w)
			return
		}
		serverError(w, err)
		return
	}
	if value, ok := payload["plan"].(string); ok && (value == "free" || value == "plus" || value == "pro_plus") {
		plan = value
	}
	if value, ok := payload["status"].(string); ok && (value == "active" || value == "expired" || value == "cancelled") {
		status = value
	}
	if _, err := s.db.ExecContext(r.Context(), `update subscriptions set plan = $1, status = $2, updated_at = now() where id = $3`, plan, status, subID); err != nil {
		serverError(w, err)
		return
	}
	success(w, http.StatusOK, "Subscription updated", nil)
}

func (s *Server) adminRevenue(w http.ResponseWriter, r *http.Request) {
	var total, activePlus, activePro, totalSubs int64
	_ = s.db.QueryRowContext(r.Context(), `select coalesce(sum(amount), 0) from subscriptions where status = 'active'`).Scan(&total)
	_ = s.db.QueryRowContext(r.Context(), `select count(*) from subscriptions where plan = 'plus' and status = 'active'`).Scan(&activePlus)
	_ = s.db.QueryRowContext(r.Context(), `select count(*) from subscriptions where plan = 'pro_plus' and status = 'active'`).Scan(&activePro)
	_ = s.db.QueryRowContext(r.Context(), `select count(*) from subscriptions where status = 'active'`).Scan(&totalSubs)
	success(w, http.StatusOK, "Revenue summary", map[string]any{
		"total_revenue":        total,
		"active_subscriptions": totalSubs,
		"plus_subscribers":     activePlus,
		"pro_plus_subscribers": activePro,
	})
}
