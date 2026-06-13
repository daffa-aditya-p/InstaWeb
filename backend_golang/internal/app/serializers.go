package app

func userMap(user *User, token string) map[string]any {
	data := map[string]any{
		"id":         user.ID,
		"name":       user.Name,
		"email":      user.Email,
		"role":       user.Role,
		"created_at": formatTime(user.CreatedAt),
		"updated_at": formatTime(user.UpdatedAt),
	}
	if token != "" {
		data["token"] = token
	}
	return data
}

func templateFieldMap(field TemplateField, includeValue bool) map[string]any {
	data := map[string]any{
		"id":          field.ID,
		"template_id": field.TemplateID,
		"name":        field.Name,
		"slug":        field.Slug,
		"type":        field.Type,
	}
	if includeValue {
		data["value"] = stringOrNil(field.Value)
	}
	return data
}

func templateMap(template Template, includeFields bool) map[string]any {
	data := map[string]any{
		"id":   template.ID,
		"name": template.Name,
		"slug": template.Slug,
	}
	if template.Description.Valid && template.Description.String != "" {
		data["description"] = template.Description.String
	}
	if includeFields {
		fields := make([]map[string]any, 0, len(template.Fields))
		for _, field := range template.Fields {
			fields = append(fields, templateFieldMap(field, false))
		}
		data["fields"] = fields
	}
	return data
}

func sectionMap(section PageSection, includeTemplate bool, includeTimestamps bool) map[string]any {
	fields := make([]map[string]any, 0, len(section.Fields))
	for _, field := range section.Fields {
		fields = append(fields, templateFieldMap(field, true))
	}
	data := map[string]any{
		"id":          section.ID,
		"page_id":     section.PageID,
		"template_id": section.TemplateID,
		"position":    section.Position,
		"fields":      fields,
	}
	if includeTemplate {
		data["template"] = templateMap(section.Template, false)
	}
	if includeTimestamps {
		data["created_at"] = formatTime(section.CreatedAt)
		data["updated_at"] = formatTime(section.UpdatedAt)
	}
	return data
}

func pageMap(page *Page, includeSections bool) map[string]any {
	data := map[string]any{
		"id":               page.ID,
		"user_id":          page.UserID,
		"title":            page.Title,
		"slug":             page.Slug,
		"summary":          stringOrNil(page.Summary),
		"is_published":     page.IsPublished,
		"published_at":     timeOrNil(page.PublishedAt),
		"meta_title":       stringOrNil(page.MetaTitle),
		"meta_description": stringOrNil(page.MetaDescription),
		"og_image":         stringOrNil(page.OGImage),
		"created_at":       formatTime(page.CreatedAt),
		"updated_at":       formatTime(page.UpdatedAt),
	}
	if includeSections {
		sections := make([]map[string]any, 0, len(page.Sections))
		for _, section := range page.Sections {
			sections = append(sections, sectionMap(section, true, true))
		}
		data["sections"] = sections
	}
	return data
}
