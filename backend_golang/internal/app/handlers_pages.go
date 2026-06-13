package app

import (
	"context"
	"database/sql"
	"errors"
	"net/http"
	"sort"
	"strings"
	"time"
)

func (s *Server) validatePagePayload(r *http.Request, payload map[string]any, create bool, current *Page) (map[string][]string, string, string, sql.NullString) {
	errorsMap := map[string][]string{}
	var title string
	var slug string
	summary := sql.NullString{}

	if create {
		title, _ = requiredString(payload, "title", errorsMap, 0)
		validateSlug(payload["slug"], errorsMap, "slug")
		slug, _ = payload["slug"].(string)
	} else {
		if value, exists := payload["title"]; exists {
			raw, ok := value.(string)
			if !ok {
				addError(errorsMap, "title", "The title must be a string.")
			} else if raw == "" {
				addError(errorsMap, "title", "The title field is required.")
			} else {
				title = raw
			}
		}
		if value, exists := payload["slug"]; exists {
			validateSlug(value, errorsMap, "slug")
			slug, _ = value.(string)
		}
	}
	if value, exists := payload["summary"]; exists {
		if value == nil {
			summary = sql.NullString{}
		} else if raw, ok := value.(string); ok {
			summary = sql.NullString{String: raw, Valid: true}
		} else {
			addError(errorsMap, "summary", "The summary must be a string.")
		}
	}
	if slug != "" {
		var existingID int64
		err := s.db.QueryRowContext(r.Context(), `select id from pages where slug = $1`, slug).Scan(&existingID)
		if err != nil && !errors.Is(err, sql.ErrNoRows) {
			addError(errorsMap, "slug", "Unable to validate slug.")
		}
		if err == nil && (current == nil || existingID != current.ID) {
			addError(errorsMap, "slug", "The slug has already been taken.")
		}
	}
	return errorsMap, title, slug, summary
}

func (s *Server) ownedPage(w http.ResponseWriter, r *http.Request, slug string, allowCollaborator bool) (*Page, bool) {
	page, err := s.pageBySlug(r.Context(), slug)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			notFound(w)
			return nil, false
		}
		serverError(w, err)
		return nil, false
	}
	ok, err := s.canAccessPage(r.Context(), page, currentUser(r), true, allowCollaborator)
	if err != nil {
		serverError(w, err)
		return nil, false
	}
	if !ok {
		forbidden(w)
		return nil, false
	}
	return page, true
}

func (s *Server) createPage(w http.ResponseWriter, r *http.Request) {
	payload, err := decodeJSON(r)
	if err != nil {
		apiError(w, http.StatusBadRequest, "Invalid JSON payload", nil)
		return
	}
	errorsMap, title, slug, summary := s.validatePagePayload(r, payload, true, nil)
	if len(errorsMap) > 0 {
		invalidField(w, errorsMap)
		return
	}
	user := currentUser(r)
	page, err := scanPage(s.db.QueryRowContext(r.Context(), `
		insert into pages (user_id, title, slug, summary)
		values ($1, $2, $3, $4)
		returning id, user_id, title, slug, summary, is_published, published_at,
		          meta_title, meta_description, og_image, created_at, updated_at
	`, user.ID, strings.TrimSpace(title), strings.TrimSpace(slug), summary))
	if err != nil {
		serverError(w, err)
		return
	}
	success(w, http.StatusCreated, "Page created successful", pageMap(page, false))
}

func (s *Server) indexPages(w http.ResponseWriter, r *http.Request) {
	user := currentUser(r)
	rows, err := s.db.QueryContext(r.Context(), `
		select distinct p.id, p.user_id, p.title, p.slug, p.summary, p.is_published, p.published_at,
		       p.meta_title, p.meta_description, p.og_image, p.created_at, p.updated_at
		from pages p
		left join page_collaborators pc on pc.page_id = p.id
		where p.user_id = $1 or pc.user_id = $1
		order by p.updated_at desc
	`, user.ID)
	if err != nil {
		serverError(w, err)
		return
	}
	defer rows.Close()
	pages := []map[string]any{}
	for rows.Next() {
		page, err := scanPage(rows)
		if err != nil {
			serverError(w, err)
			return
		}
		pages = append(pages, pageMap(page, false))
	}
	if err := rows.Err(); err != nil {
		serverError(w, err)
		return
	}
	success(w, http.StatusOK, "Get all pages successful", map[string]any{"pages": pages})
}

func (s *Server) showPage(w http.ResponseWriter, r *http.Request) {
	page, err := s.pageByIdentifier(r.Context(), r.PathValue("identifier"))
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			notFound(w)
			return
		}
		serverError(w, err)
		return
	}
	ok, err := s.canAccessPage(r.Context(), page, currentUser(r), true, true)
	if err != nil {
		serverError(w, err)
		return
	}
	if !ok {
		forbidden(w)
		return
	}
	if err := s.loadPageSections(r.Context(), page); err != nil {
		serverError(w, err)
		return
	}
	success(w, http.StatusOK, "Get page successful", pageMap(page, true))
}

func (s *Server) updatePage(w http.ResponseWriter, r *http.Request) {
	page, ok := s.ownedPage(w, r, r.PathValue("slug"), true)
	if !ok {
		return
	}
	payload, err := decodeJSON(r)
	if err != nil {
		apiError(w, http.StatusBadRequest, "Invalid JSON payload", nil)
		return
	}
	errorsMap, title, slug, summary := s.validatePagePayload(r, payload, false, page)
	if len(errorsMap) > 0 {
		invalidField(w, errorsMap)
		return
	}
	if _, exists := payload["title"]; exists {
		page.Title = strings.TrimSpace(title)
	}
	if _, exists := payload["slug"]; exists {
		page.Slug = strings.TrimSpace(slug)
	}
	if _, exists := payload["summary"]; exists {
		page.Summary = summary
	}
	updated, err := scanPage(s.db.QueryRowContext(r.Context(), `
		update pages
		set title = $1, slug = $2, summary = $3, updated_at = now()
		where id = $4
		returning id, user_id, title, slug, summary, is_published, published_at,
		          meta_title, meta_description, og_image, created_at, updated_at
	`, page.Title, page.Slug, page.Summary, page.ID))
	if err != nil {
		serverError(w, err)
		return
	}
	success(w, http.StatusOK, "Page updated successful", pageMap(updated, false))
}

func (s *Server) deletePage(w http.ResponseWriter, r *http.Request) {
	page, ok := s.ownedPage(w, r, r.PathValue("slug"), false)
	if !ok {
		return
	}
	if _, err := s.db.ExecContext(r.Context(), `delete from pages where id = $1`, page.ID); err != nil {
		serverError(w, err)
		return
	}
	success(w, http.StatusOK, "Page deleted successful", nil)
}

func (s *Server) publishPage(w http.ResponseWriter, r *http.Request) {
	page, ok := s.ownedPage(w, r, r.PathValue("slug"), true)
	if !ok {
		return
	}
	payload, _ := decodeJSON(r)
	isPublished := true
	if value, exists := payload["is_published"]; exists {
		if typed, ok := value.(bool); ok {
			isPublished = typed
		} else {
			isPublished = value != nil
		}
	}
	var publishedAt any
	if isPublished {
		publishedAt = time.Now().UTC()
	}
	updated, err := scanPage(s.db.QueryRowContext(r.Context(), `
		update pages set is_published = $1, published_at = $2, updated_at = now()
		where id = $3
		returning id, user_id, title, slug, summary, is_published, published_at,
		          meta_title, meta_description, og_image, created_at, updated_at
	`, isPublished, publishedAt, page.ID))
	if err != nil {
		serverError(w, err)
		return
	}
	message := "Page published successful"
	if !isPublished {
		message = "Page unpublished successful"
	}
	success(w, http.StatusOK, message, pageMap(updated, false))
}

func (s *Server) addSection(w http.ResponseWriter, r *http.Request) {
	page, ok := s.ownedPage(w, r, r.PathValue("slug"), true)
	if !ok {
		return
	}
	payload, err := decodeJSON(r)
	if err != nil {
		apiError(w, http.StatusBadRequest, "Invalid JSON payload", nil)
		return
	}
	errorsMap := map[string][]string{}
	templateID, okTemplate := intFromAny(payload["template_id"])
	if !okTemplate {
		addError(errorsMap, "template_id", "The template_id field is required.")
	}
	positionID, okPosition := intFromAny(payload["position"])
	if !okPosition || positionID < 1 {
		addError(errorsMap, "position", "The position must be an integer starting from 1.")
	}
	template, err := s.templateByID(r.Context(), templateID)
	if okTemplate && err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			addError(errorsMap, "template_id", "The selected template_id is invalid.")
		} else {
			serverError(w, err)
			return
		}
	}
	if len(errorsMap) > 0 {
		invalidField(w, errorsMap)
		return
	}

	var newID int64
	err = withTx(r.Context(), s.db, func(tx *sql.Tx) error {
		var count int
		if err := tx.QueryRowContext(r.Context(), `select count(*) from page_sections where page_id = $1`, page.ID).Scan(&count); err != nil {
			return err
		}
		target := int(positionID)
		if target > count+1 {
			target = count + 1
		}
		if _, err := tx.ExecContext(r.Context(), `update page_sections set position = position + 1, updated_at = now() where page_id = $1 and position >= $2`, page.ID, target); err != nil {
			return err
		}
		if err := tx.QueryRowContext(r.Context(), `
			insert into page_sections (page_id, template_id, position)
			values ($1, $2, $3) returning id
		`, page.ID, template.ID, target).Scan(&newID); err != nil {
			return err
		}
		for _, field := range template.Fields {
			if _, err := tx.ExecContext(r.Context(), `
				insert into section_field_values (page_section_id, template_field_id, value)
				values ($1, $2, null)
			`, newID, field.ID); err != nil {
				return err
			}
		}
		return nil
	})
	if err != nil {
		serverError(w, err)
		return
	}
	section, err := s.sectionByID(r.Context(), page.ID, newID)
	if err != nil {
		serverError(w, err)
		return
	}
	success(w, http.StatusCreated, "Section added successful", sectionMap(*section, true, true))
}

func (s *Server) sectionByID(ctx context.Context, pageID int64, sectionID int64) (*PageSection, error) {
	var section PageSection
	err := s.db.QueryRowContext(ctx, `
		select ps.id, ps.page_id, ps.template_id, ps.position, ps.created_at, ps.updated_at,
		       t.id, t.name, t.slug, t.description, t.created_at, t.updated_at
		from page_sections ps
		join templates t on t.id = ps.template_id
		where ps.page_id = $1 and ps.id = $2
	`, pageID, sectionID).Scan(
		&section.ID, &section.PageID, &section.TemplateID, &section.Position, &section.CreatedAt, &section.UpdatedAt,
		&section.Template.ID, &section.Template.Name, &section.Template.Slug, &section.Template.Description,
		&section.Template.CreatedAt, &section.Template.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &section, s.loadSectionFields(ctx, &section)
}

func (s *Server) updateSectionFields(w http.ResponseWriter, r *http.Request) {
	page, ok := s.ownedPage(w, r, r.PathValue("slug"), true)
	if !ok {
		return
	}
	sectionID, err := pathInt(r, "section_id")
	if err != nil {
		notFound(w)
		return
	}
	section, err := s.sectionByID(r.Context(), page.ID, sectionID)
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
	items, ok := payload["fields"].([]any)
	if !ok {
		addError(errorsMap, "fields", "The fields field is required.")
		invalidField(w, errorsMap)
		return
	}
	validFields := map[int64]bool{}
	for _, field := range section.Fields {
		validFields[field.ID] = true
	}
	updates := map[int64]sql.NullString{}
	for index, item := range items {
		obj, ok := item.(map[string]any)
		if !ok {
			addError(errorsMap, "fields."+itoa(index), "Each field value must be an object.")
			continue
		}
		fieldID, ok := intFromAny(obj["field_id"])
		if !ok || !validFields[fieldID] {
			addError(errorsMap, "fields."+itoa(index)+".field_id", "The selected field_id is invalid.")
		}
		if value, exists := obj["value"]; exists && value != nil {
			if _, ok := value.(string); !ok {
				addError(errorsMap, "fields."+itoa(index)+".value", "The value must be a string.")
			}
		}
		if ok {
			updates[fieldID] = nullableStringFromAny(obj["value"])
		}
	}
	if len(errorsMap) > 0 {
		invalidField(w, errorsMap)
		return
	}
	err = withTx(r.Context(), s.db, func(tx *sql.Tx) error {
		for fieldID, value := range updates {
			_, err := tx.ExecContext(r.Context(), `
				insert into section_field_values (page_section_id, template_field_id, value)
				values ($1, $2, $3)
				on conflict (page_section_id, template_field_id)
				do update set value = excluded.value, updated_at = now()
			`, section.ID, fieldID, value)
			if err != nil {
				return err
			}
		}
		return nil
	})
	if err != nil {
		serverError(w, err)
		return
	}
	updated, err := s.sectionByID(r.Context(), page.ID, section.ID)
	if err != nil {
		serverError(w, err)
		return
	}
	success(w, http.StatusOK, "Section fields updated successful", sectionMap(*updated, false, false))
}

func (s *Server) reorderSections(w http.ResponseWriter, r *http.Request) {
	page, ok := s.ownedPage(w, r, r.PathValue("slug"), true)
	if !ok {
		return
	}
	payload, err := decodeJSON(r)
	if err != nil {
		apiError(w, http.StatusBadRequest, "Invalid JSON payload", nil)
		return
	}
	items, ok := payload["sections"].([]any)
	errorsMap := map[string][]string{}
	if !ok || len(items) == 0 {
		addError(errorsMap, "sections", "The sections field is required.")
		invalidField(w, errorsMap)
		return
	}
	ids := make([]int64, 0, len(items))
	for _, item := range items {
		id, ok := intFromAny(item)
		if !ok {
			addError(errorsMap, "sections", "The sections must contain all section IDs in this page.")
			break
		}
		ids = append(ids, id)
	}
	rows, err := s.db.QueryContext(r.Context(), `select id from page_sections where page_id = $1`, page.ID)
	if err != nil {
		serverError(w, err)
		return
	}
	owned := []int64{}
	for rows.Next() {
		var id int64
		rows.Scan(&id)
		owned = append(owned, id)
	}
	rows.Close()
	if !sameIDs(ids, owned) {
		addError(errorsMap, "sections", "The sections must contain all section IDs in this page.")
	}
	if len(errorsMap) > 0 {
		invalidField(w, errorsMap)
		return
	}
	err = withTx(r.Context(), s.db, func(tx *sql.Tx) error {
		if _, err := tx.ExecContext(r.Context(), `update page_sections set position = position + 1000 where page_id = $1`, page.ID); err != nil {
			return err
		}
		for pos, id := range ids {
			if _, err := tx.ExecContext(r.Context(), `update page_sections set position = $1, updated_at = now() where id = $2 and page_id = $3`, pos+1, id, page.ID); err != nil {
				return err
			}
		}
		return nil
	})
	if err != nil {
		serverError(w, err)
		return
	}
	success(w, http.StatusOK, "Sections reordered successful", nil)
}

func sameIDs(a, b []int64) bool {
	if len(a) != len(b) {
		return false
	}
	acopy := make([]int64, len(a))
	copy(acopy, a)
	bcopy := make([]int64, len(b))
	copy(bcopy, b)
	sort.Slice(acopy, func(i, j int) bool { return acopy[i] < acopy[j] })
	sort.Slice(bcopy, func(i, j int) bool { return bcopy[i] < bcopy[j] })
	for i := range acopy {
		if acopy[i] != bcopy[i] {
			return false
		}
	}
	return true
}

func (s *Server) removeSection(w http.ResponseWriter, r *http.Request) {
	page, ok := s.ownedPage(w, r, r.PathValue("slug"), true)
	if !ok {
		return
	}
	sectionID, err := pathInt(r, "section_id")
	if err != nil {
		notFound(w)
		return
	}
	err = withTx(r.Context(), s.db, func(tx *sql.Tx) error {
		result, err := tx.ExecContext(r.Context(), `delete from page_sections where id = $1 and page_id = $2`, sectionID, page.ID)
		if err != nil {
			return err
		}
		affected, _ := result.RowsAffected()
		if affected == 0 {
			return sql.ErrNoRows
		}
		return normalizePositionsTx(r.Context(), tx, page.ID)
	})
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			notFound(w)
			return
		}
		serverError(w, err)
		return
	}
	success(w, http.StatusOK, "Section removed successful", nil)
}

func normalizePositionsTx(ctx context.Context, tx *sql.Tx, pageID int64) error {
	rows, err := tx.QueryContext(ctx, `select id from page_sections where page_id = $1 order by position asc`, pageID)
	if err != nil {
		return err
	}
	defer rows.Close()
	ids := []int64{}
	for rows.Next() {
		var id int64
		if err := rows.Scan(&id); err != nil {
			return err
		}
		ids = append(ids, id)
	}
	for i, id := range ids {
		if _, err := tx.ExecContext(ctx, `update page_sections set position = $1 where id = $2`, i+1, id); err != nil {
			return err
		}
	}
	return rows.Err()
}

func (s *Server) duplicatePage(w http.ResponseWriter, r *http.Request) {
	page, ok := s.ownedPage(w, r, r.PathValue("slug"), true)
	if !ok {
		return
	}
	if err := s.loadPageSections(r.Context(), page); err != nil {
		serverError(w, err)
		return
	}
	user := currentUser(r)
	var newID int64
	err := withTx(r.Context(), s.db, func(tx *sql.Tx) error {
		baseSlug := page.Slug + "-copy"
		newSlug := baseSlug
		for counter := 2; ; counter++ {
			var exists bool
			if err := tx.QueryRowContext(r.Context(), `select exists(select 1 from pages where slug = $1)`, newSlug).Scan(&exists); err != nil {
				return err
			}
			if !exists {
				break
			}
			newSlug = baseSlug + "-" + itoa(counter)
		}
		if err := tx.QueryRowContext(r.Context(), `
			insert into pages (user_id, title, slug, summary, is_published, meta_title, meta_description, og_image)
			values ($1, $2, $3, $4, false, $5, $6, $7)
			returning id
		`, user.ID, page.Title+" (Copy)", newSlug, page.Summary, page.MetaTitle, page.MetaDescription, page.OGImage).Scan(&newID); err != nil {
			return err
		}
		for _, section := range page.Sections {
			var newSectionID int64
			if err := tx.QueryRowContext(r.Context(), `
				insert into page_sections (page_id, template_id, position)
				values ($1, $2, $3) returning id
			`, newID, section.TemplateID, section.Position).Scan(&newSectionID); err != nil {
				return err
			}
			for _, field := range section.Fields {
				if _, err := tx.ExecContext(r.Context(), `
					insert into section_field_values (page_section_id, template_field_id, value)
					values ($1, $2, $3)
				`, newSectionID, field.ID, field.Value); err != nil {
					return err
				}
			}
		}
		return nil
	})
	if err != nil {
		serverError(w, err)
		return
	}
	newPage, err := s.pageByIdentifier(r.Context(), itoa(int(newID)))
	if err != nil {
		serverError(w, err)
		return
	}
	if err := s.loadPageSections(r.Context(), newPage); err != nil {
		serverError(w, err)
		return
	}
	success(w, http.StatusCreated, "Page duplicated successful", pageMap(newPage, true))
}

func (s *Server) duplicateSection(w http.ResponseWriter, r *http.Request) {
	page, ok := s.ownedPage(w, r, r.PathValue("slug"), true)
	if !ok {
		return
	}
	sectionID, err := pathInt(r, "section_id")
	if err != nil {
		notFound(w)
		return
	}
	section, err := s.sectionByID(r.Context(), page.ID, sectionID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			notFound(w)
			return
		}
		serverError(w, err)
		return
	}
	var newSectionID int64
	err = withTx(r.Context(), s.db, func(tx *sql.Tx) error {
		if _, err := tx.ExecContext(r.Context(), `update page_sections set position = position + 1 where page_id = $1 and position > $2`, page.ID, section.Position); err != nil {
			return err
		}
		if err := tx.QueryRowContext(r.Context(), `
			insert into page_sections (page_id, template_id, position)
			values ($1, $2, $3) returning id
		`, page.ID, section.TemplateID, section.Position+1).Scan(&newSectionID); err != nil {
			return err
		}
		for _, field := range section.Fields {
			if _, err := tx.ExecContext(r.Context(), `
				insert into section_field_values (page_section_id, template_field_id, value)
				values ($1, $2, $3)
			`, newSectionID, field.ID, field.Value); err != nil {
				return err
			}
		}
		return normalizePositionsTx(r.Context(), tx, page.ID)
	})
	if err != nil {
		serverError(w, err)
		return
	}
	newSection, err := s.sectionByID(r.Context(), page.ID, newSectionID)
	if err != nil {
		serverError(w, err)
		return
	}
	success(w, http.StatusCreated, "Section duplicated successful", sectionMap(*newSection, true, true))
}

func (s *Server) exportPage(w http.ResponseWriter, r *http.Request) {
	page, ok := s.ownedPage(w, r, r.PathValue("slug"), true)
	if !ok {
		return
	}
	if err := s.loadPageSections(r.Context(), page); err != nil {
		serverError(w, err)
		return
	}
	success(w, http.StatusOK, "Page exported successful", pageMap(page, true))
}

func (s *Server) updatePageSEO(w http.ResponseWriter, r *http.Request) {
	page, ok := s.ownedPage(w, r, r.PathValue("slug"), true)
	if !ok {
		return
	}
	payload, err := decodeJSON(r)
	if err != nil {
		apiError(w, http.StatusBadRequest, "Invalid JSON payload", nil)
		return
	}
	errorsMap := map[string][]string{}
	metaTitle := page.MetaTitle
	metaDescription := page.MetaDescription
	ogImage := page.OGImage
	if value, exists := payload["meta_title"]; exists {
		if value != nil {
			if _, ok := value.(string); !ok {
				addError(errorsMap, "meta_title", "The meta_title must be a string.")
			}
		}
		metaTitle = nullableStringFromAny(value)
	}
	if value, exists := payload["meta_description"]; exists {
		if value != nil {
			if _, ok := value.(string); !ok {
				addError(errorsMap, "meta_description", "The meta_description must be a string.")
			}
		}
		metaDescription = nullableStringFromAny(value)
	}
	if value, exists := payload["og_image"]; exists {
		if value != nil {
			if _, ok := value.(string); !ok {
				addError(errorsMap, "og_image", "The og_image must be a string.")
			}
		}
		ogImage = nullableStringFromAny(value)
	}
	if len(errorsMap) > 0 {
		invalidField(w, errorsMap)
		return
	}
	updated, err := scanPage(s.db.QueryRowContext(r.Context(), `
		update pages set meta_title = $1, meta_description = $2, og_image = $3, updated_at = now()
		where id = $4
		returning id, user_id, title, slug, summary, is_published, published_at,
		          meta_title, meta_description, og_image, created_at, updated_at
	`, metaTitle, metaDescription, ogImage, page.ID))
	if err != nil {
		serverError(w, err)
		return
	}
	success(w, http.StatusOK, "Page SEO updated successful", pageMap(updated, false))
}

func (s *Server) upload(w http.ResponseWriter, r *http.Request) {
	url, err := s.uploadFile(r, "file")
	if err != nil {
		message := err.Error()
		if message == "invalid extension" {
			apiError(w, http.StatusBadRequest, "Invalid file extension. Allowed extensions are: bmp, gif, jpeg, jpg, png, svg, webp", nil)
			return
		}
		apiError(w, http.StatusBadRequest, message, nil)
		return
	}
	if strings.HasPrefix(url, "/") {
		url = "http://" + r.Host + url
	}
	writeJSON(w, http.StatusOK, map[string]any{"status": "success", "url": url})
}

func (s *Server) indexTemplates(w http.ResponseWriter, r *http.Request) {
	rows, err := s.db.QueryContext(r.Context(), `
		select id, name, slug, description, created_at, updated_at
		from templates order by id asc
	`)
	if err != nil {
		serverError(w, err)
		return
	}
	defer rows.Close()
	templates := []map[string]any{}
	for rows.Next() {
		var template Template
		if err := rows.Scan(&template.ID, &template.Name, &template.Slug, &template.Description, &template.CreatedAt, &template.UpdatedAt); err != nil {
			serverError(w, err)
			return
		}
		if err := s.loadTemplateFields(r.Context(), &template); err != nil {
			serverError(w, err)
			return
		}
		templates = append(templates, templateMap(template, true))
	}
	success(w, http.StatusOK, "Get all templates successful", map[string]any{"templates": templates})
}

func (s *Server) showTemplate(w http.ResponseWriter, r *http.Request) {
	template, err := s.templateBySlug(r.Context(), r.PathValue("slug"))
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			notFound(w)
			return
		}
		serverError(w, err)
		return
	}
	success(w, http.StatusOK, "Get template successful", templateMap(template, true))
}

func (s *Server) publicPage(w http.ResponseWriter, r *http.Request) {
	page, err := s.pageBySlug(r.Context(), r.PathValue("slug"))
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			notFound(w)
			return
		}
		serverError(w, err)
		return
	}
	if !page.IsPublished {
		apiError(w, http.StatusNotFound, "Page is not published", nil)
		return
	}
	if err := s.loadPageSections(r.Context(), page); err != nil {
		serverError(w, err)
		return
	}
	success(w, http.StatusOK, "Get public page successful", pageMap(page, true))
}
