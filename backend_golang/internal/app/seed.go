package app

import (
	"context"
	"database/sql"
)

type seedTemplate struct {
	Name        string
	Slug        string
	Description string
	Fields      []seedField
}

type seedField struct {
	Name string
	Slug string
	Type string
}

func SeedDefaults(ctx context.Context, db *sql.DB) error {
	if err := seedUsers(ctx, db); err != nil {
		return err
	}
	if err := seedTemplates(ctx, db); err != nil {
		return err
	}
	return seedDemoPage(ctx, db)
}

func seedUsers(ctx context.Context, db *sql.DB) error {
	hash, err := hashPassword("password")
	if err != nil {
		return err
	}
	users := []struct {
		Name  string
		Email string
		Role  string
	}{
		{"Super Admin", "super@instaweb.io", "super_admin"},
		{"Admin", "admin@instaweb.io", "admin"},
		{"Demo User", "demo@instaweb.io", "user"},
	}
	for _, user := range users {
		if _, err := db.ExecContext(ctx, `
			insert into users (name, email, password_hash, role)
			values ($1, $2, $3, $4)
			on conflict (email) do update
			set name = excluded.name, role = excluded.role, updated_at = now()
		`, user.Name, user.Email, hash, user.Role); err != nil {
			return err
		}
	}
	return nil
}

func seedTemplates(ctx context.Context, db *sql.DB) error {
	for _, template := range defaultTemplates() {
		var templateID int64
		if err := db.QueryRowContext(ctx, `
			insert into templates (name, slug, description)
			values ($1, $2, $3)
			on conflict (slug) do update
			set name = excluded.name, description = excluded.description, updated_at = now()
			returning id
		`, template.Name, template.Slug, template.Description).Scan(&templateID); err != nil {
			return err
		}
		for _, field := range append(template.Fields, styleFields()...) {
			if _, err := db.ExecContext(ctx, `
				insert into template_fields (template_id, name, slug, type)
				values ($1, $2, $3, $4)
				on conflict (template_id, slug) do update
				set name = excluded.name, type = excluded.type, updated_at = now()
			`, templateID, field.Name, field.Slug, field.Type); err != nil {
				return err
			}
		}
	}
	return nil
}

func seedDemoPage(ctx context.Context, db *sql.DB) error {
	var userID int64
	if err := db.QueryRowContext(ctx, `select id from users where email = 'demo@instaweb.io'`).Scan(&userID); err != nil {
		return err
	}
	var pageID int64
	if err := db.QueryRowContext(ctx, `
		insert into pages (user_id, title, slug, summary, is_published, published_at)
		values ($1, 'Startup Studio', 'startup-studio', 'A published demo site assembled from dynamic InstaWeb sections.', true, now())
		on conflict (slug) do update
		set title = excluded.title, summary = excluded.summary, is_published = true, published_at = coalesce(pages.published_at, now()), updated_at = now()
		returning id
	`, userID).Scan(&pageID); err != nil {
		return err
	}
	var sectionCount int
	if err := db.QueryRowContext(ctx, `select count(*) from page_sections where page_id = $1`, pageID).Scan(&sectionCount); err != nil {
		return err
	}
	if sectionCount > 0 {
		return nil
	}
	sections := []string{"navbar", "hero_variant", "logo_cloud", "feature_grid", "bento_grid", "pricing", "testimonials", "faq", "cta", "footer"}
	for position, slug := range sections {
		var templateID int64
		if err := db.QueryRowContext(ctx, `select id from templates where slug = $1`, slug).Scan(&templateID); err != nil {
			return err
		}
		var sectionID int64
		if err := db.QueryRowContext(ctx, `
			insert into page_sections (page_id, template_id, position)
			values ($1, $2, $3) returning id
		`, pageID, templateID, position+1).Scan(&sectionID); err != nil {
			return err
		}
		rows, err := db.QueryContext(ctx, `select id, slug from template_fields where template_id = $1`, templateID)
		if err != nil {
			return err
		}
		values := demoValues()[slug]
		for rows.Next() {
			var fieldID int64
			var fieldSlug string
			if err := rows.Scan(&fieldID, &fieldSlug); err != nil {
				rows.Close()
				return err
			}
			if _, err := db.ExecContext(ctx, `
				insert into section_field_values (page_section_id, template_field_id, value)
				values ($1, $2, $3)
			`, sectionID, fieldID, values[fieldSlug]); err != nil {
				rows.Close()
				return err
			}
		}
		rows.Close()
	}
	return nil
}

func styleFields() []seedField {
	return []seedField{
		{"Background Style", "style_bg", "text"},
		{"Padding Size", "style_padding", "text"},
		{"Highlight Text Color", "style_text_color", "text"},
	}
}

func defaultTemplates() []seedTemplate {
	common := []seedField{
		{"Title", "title", "text"},
		{"Subtitle", "subtitle", "text"},
		{"Image", "image", "image"},
	}
	return []seedTemplate{
		{"Hero Section", "hero", "A bold opening section with headline, subtitle, and immersive image.", []seedField{{"Title", "title", "text"}, {"Subtitle", "subtitle", "text"}, {"Background Image", "background_image", "image"}}},
		{"About Section", "about", "A split layout for brand story, positioning, and supporting image.", []seedField{{"Heading", "heading", "text"}, {"Description", "description", "text"}, {"Image", "image", "image"}}},
		{"Services Section", "services", "A three-column service grid for offers and capabilities.", []seedField{{"Service 1 Name", "service_1_name", "text"}, {"Service 1 Icon", "service_1_icon", "image"}, {"Service 2 Name", "service_2_name", "text"}, {"Service 2 Icon", "service_2_icon", "image"}, {"Service 3 Name", "service_3_name", "text"}, {"Service 3 Icon", "service_3_icon", "image"}}},
		{"Contact Section", "contact", "A conversion section with contact channels and location imagery.", []seedField{{"Title", "title", "text"}, {"Email", "email", "text"}, {"Phone", "phone", "text"}, {"Map Image", "map_image", "image"}}},
		{"Footer Section", "footer", "A compact footer with logo, copyright text, and social links.", []seedField{{"Copyright Text", "copyright_text", "text"}, {"Logo URL", "logo_url", "image"}, {"Instagram Link", "instagram_link", "text"}, {"Facebook Link", "facebook_link", "text"}}},
		{"Navbar Section", "navbar", "A clean navigation bar with logo, page links, and a call-to-action button.", []seedField{{"Logo URL", "logo_url", "image"}, {"Logo Text", "logo_text", "text"}, {"Link 1 Text", "link_1_text", "text"}, {"Link 1 URL", "link_1_url", "text"}, {"Link 2 Text", "link_2_text", "text"}, {"Link 2 URL", "link_2_url", "text"}, {"Link 3 Text", "link_3_text", "text"}, {"Link 3 URL", "link_3_url", "text"}, {"CTA Text", "cta_text", "text"}, {"CTA Link", "cta_link", "text"}}},
		{"Hero Section (Variant)", "hero_variant", "A premium hero variant with split text, actions, and a preview image.", []seedField{{"Badge", "badge", "text"}, {"Title", "title", "text"}, {"Subtitle", "subtitle", "text"}, {"Primary Button Text", "primary_btn_text", "text"}, {"Primary Button Link", "primary_btn_link", "text"}, {"Secondary Button Text", "secondary_btn_text", "text"}, {"Secondary Button Link", "secondary_btn_link", "text"}, {"Preview Image", "preview_image", "image"}}},
		{"Feature Grid", "feature_grid", "A high-fidelity grid displaying your main product values.", []seedField{{"Heading", "heading", "text"}, {"Subheading", "subheading", "text"}, {"Feature 1 Icon", "feat_1_icon", "image"}, {"Feature 1 Title", "feat_1_title", "text"}, {"Feature 1 Description", "feat_1_desc", "text"}, {"Feature 2 Icon", "feat_2_icon", "image"}, {"Feature 2 Title", "feat_2_title", "text"}, {"Feature 2 Description", "feat_2_desc", "text"}, {"Feature 3 Icon", "feat_3_icon", "image"}, {"Feature 3 Title", "feat_3_title", "text"}, {"Feature 3 Description", "feat_3_desc", "text"}, {"Feature 4 Icon", "feat_4_icon", "image"}, {"Feature 4 Title", "feat_4_title", "text"}, {"Feature 4 Description", "feat_4_desc", "text"}}},
		{"Stats Section", "stats", "A premium numeric facts showcase.", []seedField{{"Title", "title", "text"}, {"Subtitle", "subtitle", "text"}, {"Stat 1 Value", "stat_1_val", "text"}, {"Stat 1 Label", "stat_1_label", "text"}, {"Stat 2 Value", "stat_2_val", "text"}, {"Stat 2 Label", "stat_2_label", "text"}, {"Stat 3 Value", "stat_3_val", "text"}, {"Stat 3 Label", "stat_3_label", "text"}, {"Stat 4 Value", "stat_4_val", "text"}, {"Stat 4 Label", "stat_4_label", "text"}}},
		{"Logo Cloud", "logo_cloud", "A row of trust-building partner logos.", []seedField{{"Title", "title", "text"}, {"Logo 1", "logo_1", "image"}, {"Logo 2", "logo_2", "image"}, {"Logo 3", "logo_3", "image"}, {"Logo 4", "logo_4", "image"}, {"Logo 5", "logo_5", "image"}, {"Logo 6", "logo_6", "image"}}},
		{"Testimonials Section", "testimonials", "Highlight reviews and success stories.", []seedField{{"Heading", "heading", "text"}, {"Subheading", "subheading", "text"}, {"Quote 1", "quote_1", "text"}, {"Author 1 Name", "author_1_name", "text"}, {"Author 1 Role", "author_1_role", "text"}, {"Author 1 Avatar", "author_1_avatar", "image"}, {"Quote 2", "quote_2", "text"}, {"Author 2 Name", "author_2_name", "text"}, {"Author 2 Role", "author_2_role", "text"}, {"Author 2 Avatar", "author_2_avatar", "image"}}},
		{"Pricing Grid", "pricing", "A clear multi-tiered pricing comparison grid.", []seedField{{"Title", "title", "text"}, {"Subtitle", "subtitle", "text"}, {"Plan 1 Name", "plan_1_name", "text"}, {"Plan 1 Price", "plan_1_price", "text"}, {"Plan 1 Features", "plan_1_features", "text"}, {"Plan 1 CTA", "plan_1_cta", "text"}, {"Plan 2 Name", "plan_2_name", "text"}, {"Plan 2 Price", "plan_2_price", "text"}, {"Plan 2 Features", "plan_2_features", "text"}, {"Plan 2 CTA", "plan_2_cta", "text"}, {"Plan 2 Popular Badge", "plan_2_badge", "text"}}},
		{"FAQ Section", "faq", "Frequently Asked Questions block.", []seedField{{"Heading", "heading", "text"}, {"Subheading", "subheading", "text"}, {"Q1 Question", "q1_question", "text"}, {"Q1 Answer", "q1_answer", "text"}, {"Q2 Question", "q2_question", "text"}, {"Q2 Answer", "q2_answer", "text"}, {"Q3 Question", "q3_question", "text"}, {"Q3 Answer", "q3_answer", "text"}, {"Q4 Question", "q4_question", "text"}, {"Q4 Answer", "q4_answer", "text"}}},
		{"Call To Action (CTA)", "cta", "A high-conversion action section.", []seedField{{"Heading", "heading", "text"}, {"Description", "description", "text"}, {"Primary Button Text", "primary_btn_text", "text"}, {"Primary Button Link", "primary_btn_link", "text"}, {"Secondary Button Text", "secondary_btn_text", "text"}, {"Secondary Button Link", "secondary_btn_link", "text"}}},
		{"Newsletter Subscription", "newsletter", "A styled form block to gather emails.", []seedField{{"Title", "title", "text"}, {"Description", "description", "text"}, {"Input Placeholder", "input_placeholder", "text"}, {"Button Text", "button_text", "text"}, {"Privacy Notice", "privacy_notice", "text"}}},
		{"Portfolio Grid", "portfolio", "A curated list of creative works.", []seedField{{"Title", "title", "text"}, {"Subtitle", "subtitle", "text"}, {"Project 1 Image", "proj_1_img", "image"}, {"Project 1 Title", "proj_1_title", "text"}, {"Project 1 Category", "proj_1_cat", "text"}, {"Project 2 Image", "proj_2_img", "image"}, {"Project 2 Title", "proj_2_title", "text"}, {"Project 2 Category", "proj_2_cat", "text"}, {"Project 3 Image", "proj_3_img", "image"}, {"Project 3 Title", "proj_3_title", "text"}, {"Project 3 Category", "proj_3_cat", "text"}}},
		{"Photo Gallery", "gallery", "An immersive multi-ratio image grid.", []seedField{{"Heading", "heading", "text"}, {"Subheading", "subheading", "text"}, {"Image 1", "image_1", "image"}, {"Image 2", "image_2", "image"}, {"Image 3", "image_3", "image"}, {"Image 4", "image_4", "image"}}},
		{"Team Showcase", "team", "Show the people behind the company.", []seedField{{"Title", "title", "text"}, {"Subtitle", "subtitle", "text"}, {"Member 1 Name", "member_1_name", "text"}, {"Member 1 Role", "member_1_role", "text"}, {"Member 1 Image", "member_1_img", "image"}, {"Member 2 Name", "member_2_name", "text"}, {"Member 2 Role", "member_2_role", "text"}, {"Member 2 Image", "member_2_img", "image"}, {"Member 3 Name", "member_3_name", "text"}, {"Member 3 Role", "member_3_role", "text"}, {"Member 3 Image", "member_3_img", "image"}}},
		{"Company Timeline", "timeline", "Show key milestones.", []seedField{{"Title", "title", "text"}, {"Milestone 1 Year", "mile_1_year", "text"}, {"Milestone 1 Title", "mile_1_title", "text"}, {"Milestone 1 Desc", "mile_1_desc", "text"}, {"Milestone 2 Year", "mile_2_year", "text"}, {"Milestone 2 Title", "mile_2_title", "text"}, {"Milestone 2 Desc", "mile_2_desc", "text"}, {"Milestone 3 Year", "mile_3_year", "text"}, {"Milestone 3 Title", "mile_3_title", "text"}, {"Milestone 3 Desc", "mile_3_desc", "text"}}},
		{"Process Steps", "process_steps", "A structured step-by-step process.", []seedField{{"Title", "title", "text"}, {"Step 1 Number", "step_1_num", "text"}, {"Step 1 Title", "step_1_title", "text"}, {"Step 1 Desc", "step_1_desc", "text"}, {"Step 2 Number", "step_2_num", "text"}, {"Step 2 Title", "step_2_title", "text"}, {"Step 2 Desc", "step_2_desc", "text"}, {"Step 3 Number", "step_3_num", "text"}, {"Step 3 Title", "step_3_title", "text"}, {"Step 3 Desc", "step_3_desc", "text"}}},
		{"Blog Preview", "blog_preview", "Feature latest articles.", []seedField{{"Heading", "heading", "text"}, {"Article 1 Image", "art_1_img", "image"}, {"Article 1 Title", "art_1_title", "text"}, {"Article 1 Category", "art_1_cat", "text"}, {"Article 1 Link", "art_1_link", "text"}, {"Article 2 Image", "art_2_img", "image"}, {"Article 2 Title", "art_2_title", "text"}, {"Article 2 Category", "art_2_cat", "text"}, {"Article 2 Link", "art_2_link", "text"}}},
		{"Comparison Table", "comparison_table", "Deep feature comparison table.", []seedField{{"Title", "title", "text"}, {"Competitor Name", "competitor_name", "text"}, {"Feature 1 Name", "feat_1_name", "text"}, {"Feature 1 Us", "feat_1_us", "text"}, {"Feature 1 Them", "feat_1_them", "text"}, {"Feature 2 Name", "feat_2_name", "text"}, {"Feature 2 Us", "feat_2_us", "text"}, {"Feature 2 Them", "feat_2_them", "text"}, {"Feature 3 Name", "feat_3_name", "text"}, {"Feature 3 Us", "feat_3_us", "text"}, {"Feature 3 Them", "feat_3_them", "text"}}},
		{"Bento Grid", "bento_grid", "A modern asymmetrical panel grid.", []seedField{{"Title", "title", "text"}, {"Panel 1 Title", "p1_title", "text"}, {"Panel 1 Image", "p1_img", "image"}, {"Panel 1 Desc", "p1_desc", "text"}, {"Panel 2 Title", "p2_title", "text"}, {"Panel 2 Image", "p2_img", "image"}, {"Panel 2 Desc", "p2_desc", "text"}, {"Panel 3 Title", "p3_title", "text"}, {"Panel 3 Image", "p3_img", "image"}, {"Panel 3 Desc", "p3_desc", "text"}}},
		{"Product Showcase", "product_showcase", "A display of your product with specs.", []seedField{{"Heading", "heading", "text"}, {"Subheading", "subheading", "text"}, {"Image", "image", "image"}, {"Feature 1", "feature_1", "text"}, {"Feature 2", "feature_2", "text"}, {"Feature 3", "feature_3", "text"}}},
		{"App Download Section", "app_download", "Drive mobile app installs.", []seedField{{"Title", "title", "text"}, {"Description", "description", "text"}, {"Mockup Image", "mockup_image", "image"}, {"App Store Link", "app_store_link", "text"}, {"Play Store Link", "play_store_link", "text"}}},
		{"Case Studies", "case_studies", "Showcase client success stories.", []seedField{{"Title", "title", "text"}, {"Case 1 Title", "case_1_title", "text"}, {"Case 1 Metric", "case_1_metric", "text"}, {"Case 1 Image", "case_1_img", "image"}, {"Case 1 Link", "case_1_link", "text"}, {"Case 2 Title", "case_2_title", "text"}, {"Case 2 Metric", "case_2_metric", "text"}, {"Case 2 Image", "case_2_img", "image"}, {"Case 2 Link", "case_2_link", "text"}}},
		{"Contact Section (Variant)", "contact_variant", "A premium multi-office contact section.", []seedField{{"Title", "title", "text"}, {"Description", "description", "text"}, {"Office 1 Name", "office_1_name", "text"}, {"Office 1 Address", "office_1_addr", "text"}, {"Office 2 Name", "office_2_name", "text"}, {"Office 2 Address", "office_2_addr", "text"}, {"Email", "email", "text"}, {"Image", "image", "image"}}},
		{"Hero Glow Showcase", "hero_glow", "SaaS landing opener with high-impact copy.", []seedField{{"Badge", "badge", "text"}, {"Title", "title", "text"}, {"Subtitle", "subtitle", "text"}, {"Primary Button Text", "primary_btn_text", "text"}, {"Primary Button Link", "primary_btn_link", "text"}, {"Secondary Button Text", "secondary_btn_text", "text"}, {"Secondary Button Link", "secondary_btn_link", "text"}, {"Mockup Image", "mockup_image", "image"}}},
		{"Infinite Logo Marquee", "logo_marquee", "An infinitely sliding logowall.", []seedField{{"Title", "title", "text"}, {"Brand 1 Name", "brand_1", "text"}, {"Brand 2 Name", "brand_2", "text"}, {"Brand 3 Name", "brand_3", "text"}, {"Brand 4 Name", "brand_4", "text"}, {"Brand 5 Name", "brand_5", "text"}, {"Brand 6 Name", "brand_6", "text"}, {"Brand 7 Name", "brand_7", "text"}, {"Brand 8 Name", "brand_8", "text"}}},
		{"Modern Callout Box", "callout_box", "Elegant callout banner with actions.", []seedField{{"Accent Icon", "accent_icon", "image"}, {"Title", "title", "text"}, {"Description", "description", "text"}, {"Primary Button Text", "primary_btn_text", "text"}, {"Primary Button Link", "primary_btn_link", "text"}, {"Secondary Button Text", "secondary_btn_text", "text"}, {"Secondary Button Link", "secondary_btn_link", "text"}}},
		{"Alternating Feature Split", "feature_split", "High-end alternating feature layout.", []seedField{{"Heading", "heading", "text"}, {"Subheading", "subheading", "text"}, {"Feature 1 Title", "feat_1_title", "text"}, {"Feature 1 Description", "feat_1_desc", "text"}, {"Feature 1 Image", "feat_1_img", "image"}, {"Feature 1 Button Text", "feat_1_btn_text", "text"}, {"Feature 1 Button Link", "feat_1_btn_link", "text"}, {"Feature 2 Title", "feat_2_title", "text"}, {"Feature 2 Description", "feat_2_desc", "text"}, {"Feature 2 Image", "feat_2_img", "image"}, {"Feature 2 Button Text", "feat_2_btn_text", "text"}, {"Feature 2 Button Link", "feat_2_btn_link", "text"}}},
		{"Simple Content", "simple_content", "A flexible fallback content section.", common},
	}
}

func demoValues() map[string]map[string]string {
	return map[string]map[string]string{
		"navbar":       {"logo_text": "InstaWeb", "link_1_text": "Features", "link_1_url": "#features", "link_2_text": "Pricing", "link_2_url": "#pricing", "link_3_text": "FAQ", "link_3_url": "#faq", "cta_text": "Start Free", "cta_link": "/register", "style_bg": "glass", "style_padding": "none", "style_text_color": "brand-aqua"},
		"hero_variant": {"badge": "WEBSITE BUILDER", "title": "Launch a polished site in minutes", "subtitle": "Compose premium sections, publish fast, and keep every page consistent.", "primary_btn_text": "Start Building", "primary_btn_link": "/register", "secondary_btn_text": "View Demo", "secondary_btn_link": "#demo", "preview_image": "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80", "style_bg": "dark", "style_padding": "cozy", "style_text_color": "brand-aqua"},
		"logo_cloud":   {"title": "Trusted by modern teams", "logo_1": "https://dummyimage.com/180x60/f3f4f6/111827&text=Linear", "logo_2": "https://dummyimage.com/180x60/f3f4f6/111827&text=Vercel", "logo_3": "https://dummyimage.com/180x60/f3f4f6/111827&text=Stripe", "style_bg": "dark-variant", "style_padding": "compact", "style_text_color": "brand-muted"},
		"feature_grid": {"heading": "Everything you need to ship", "subheading": "Structured content, reusable sections, and analytics in one place.", "feat_1_title": "Sections", "feat_1_desc": "Build from reusable blocks.", "feat_2_title": "Preview", "feat_2_desc": "Inspect before publishing.", "feat_3_title": "SEO", "feat_3_desc": "Tune metadata per page.", "feat_4_title": "Analytics", "feat_4_desc": "See what works.", "style_bg": "dark", "style_padding": "cozy", "style_text_color": "brand-aqua"},
		"bento_grid":   {"title": "Crafted with modular precision", "p1_title": "Fast Editing", "p1_desc": "Update content safely.", "p2_title": "Responsive", "p2_desc": "Layouts adapt across screens.", "p3_title": "Integrated", "p3_desc": "Backend and storage ready.", "style_bg": "dark", "style_padding": "comfortable", "style_text_color": "brand-teal"},
		"pricing":      {"title": "Flexible pricing", "subtitle": "Start free and upgrade when your team grows.", "plan_1_name": "Free", "plan_1_price": "Rp0", "plan_1_features": "Basic pages, Templates, Publishing", "plan_1_cta": "Start Free", "plan_2_name": "Pro+", "plan_2_price": "Rp450k", "plan_2_features": "Collaborators, Advanced analytics, Priority features", "plan_2_cta": "Upgrade", "plan_2_badge": "POPULAR", "style_bg": "dark", "style_padding": "cozy", "style_text_color": "brand-teal"},
		"testimonials": {"heading": "Loved by builders", "subheading": "Teams use InstaWeb to launch faster.", "quote_1": "We published our launch page in one morning.", "author_1_name": "Sarah", "author_1_role": "Founder", "quote_2": "The section system keeps our brand tidy.", "author_2_name": "Marcus", "author_2_role": "Designer", "style_bg": "dark-variant", "style_padding": "cozy", "style_text_color": "brand-aqua"},
		"faq":          {"heading": "Questions", "subheading": "Common answers before you begin.", "q1_question": "Can I publish quickly?", "q1_answer": "Yes, pages are database-backed and ready to publish.", "q2_question": "Can teams collaborate?", "q2_answer": "Yes, collaboration is available on Pro+.", "style_bg": "dark", "style_padding": "cozy", "style_text_color": "brand-teal"},
		"cta":          {"heading": "Ready to build?", "description": "Create your first page and publish it today.", "primary_btn_text": "Get Started", "primary_btn_link": "/register", "secondary_btn_text": "Sign In", "secondary_btn_link": "/login", "style_bg": "brand-gradient", "style_padding": "comfortable", "style_text_color": "white"},
		"footer":       {"copyright_text": "Copyright 2026 InstaWeb. All rights reserved.", "instagram_link": "https://instagram.com", "facebook_link": "https://facebook.com", "style_bg": "dark", "style_padding": "compact", "style_text_color": "brand-muted"},
	}
}
