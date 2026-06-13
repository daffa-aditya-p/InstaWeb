package app

import (
	"context"
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"errors"
	"net"
	"net/http"
	"strings"
	"time"
)

func (s *Server) trackPageView(w http.ResponseWriter, r *http.Request) {
	payload, err := decodeJSON(r)
	if err != nil {
		apiError(w, http.StatusBadRequest, "Invalid JSON payload", nil)
		return
	}
	slug, _ := payload["slug"].(string)
	if slug == "" {
		apiError(w, http.StatusBadRequest, "slug is required", nil)
		return
	}
	page, err := s.pageBySlug(r.Context(), slug)
	if err != nil || !page.IsPublished {
		if err == nil || errors.Is(err, sql.ErrNoRows) {
			notFound(w)
			return
		}
		serverError(w, err)
		return
	}
	ip := clientIP(r)
	hash := sha256.Sum256([]byte(ip))
	referrer, _ := payload["referrer"].(string)
	if len(referrer) > 500 {
		referrer = referrer[:500]
	}
	userAgent := r.UserAgent()
	if len(userAgent) > 500 {
		userAgent = userAgent[:500]
	}
	_, err = s.db.ExecContext(r.Context(), `
		insert into page_views (page_id, ip_hash, user_agent, referrer)
		values ($1, $2, $3, nullif($4, ''))
	`, page.ID, hex.EncodeToString(hash[:]), userAgent, referrer)
	if err != nil {
		serverError(w, err)
		return
	}
	success(w, http.StatusOK, "Page view recorded", nil)
}

func clientIP(r *http.Request) string {
	for _, header := range []string{"X-Forwarded-For", "X-Real-IP"} {
		value := r.Header.Get(header)
		if value == "" {
			continue
		}
		return strings.TrimSpace(strings.Split(value, ",")[0])
	}
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err == nil {
		return host
	}
	return r.RemoteAddr
}

func (s *Server) analyticsOverview(w http.ResponseWriter, r *http.Request) {
	user := currentUser(r)
	var total, today, week, month int64
	err := s.db.QueryRowContext(r.Context(), `
		with owned_pages as (
			select id from pages where user_id = $1
		)
		select
			count(pv.id),
			count(pv.id) filter (where pv.created_at >= date_trunc('day', now())),
			count(pv.id) filter (where pv.created_at >= date_trunc('week', now())),
			count(pv.id) filter (where pv.created_at >= date_trunc('month', now()))
		from page_views pv
		where pv.page_id in (select id from owned_pages)
	`, user.ID).Scan(&total, &today, &week, &month)
	if err != nil {
		serverError(w, err)
		return
	}
	topPages, err := s.topPages(r, user.ID)
	if err != nil {
		serverError(w, err)
		return
	}
	success(w, http.StatusOK, "Analytics overview", map[string]any{
		"total_views":      total,
		"views_today":      today,
		"views_this_week":  week,
		"views_this_month": month,
		"top_pages":        topPages,
	})
}

func (s *Server) topPages(r *http.Request, userID int64) ([]map[string]any, error) {
	rows, err := s.db.QueryContext(r.Context(), `
		select p.title, p.slug, count(pv.id) as views
		from pages p
		join page_views pv on pv.page_id = p.id
		where p.user_id = $1
		group by p.id
		order by count(pv.id) desc
		limit 5
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []map[string]any{}
	for rows.Next() {
		var title, slug string
		var views int64
		if err := rows.Scan(&title, &slug, &views); err != nil {
			return nil, err
		}
		items = append(items, map[string]any{"title": title, "slug": slug, "views": views})
	}
	return items, rows.Err()
}

func (s *Server) pageSummary(w http.ResponseWriter, r *http.Request) {
	page, ok := s.analyticsPageAccess(w, r)
	if !ok {
		return
	}
	var total, today, d7, d30 int64
	err := s.db.QueryRowContext(r.Context(), `
		select
			count(id),
			count(id) filter (where created_at >= date_trunc('day', now())),
			count(id) filter (where created_at >= now() - interval '7 days'),
			count(id) filter (where created_at >= now() - interval '30 days')
		from page_views where page_id = $1
	`, page.ID).Scan(&total, &today, &d7, &d30)
	if err != nil {
		serverError(w, err)
		return
	}
	referrers, err := s.referrerCounts(r, page.ID, true)
	if err != nil {
		serverError(w, err)
		return
	}
	success(w, http.StatusOK, "Page summary", map[string]any{
		"total_views":   total,
		"views_today":   today,
		"views_7d":      d7,
		"views_30d":     d30,
		"top_referrers": referrers,
	})
}

func (s *Server) pageDetails(w http.ResponseWriter, r *http.Request) {
	page, ok := s.analyticsPageAccess(w, r)
	if !ok {
		return
	}
	user := currentUser(r)
	ownerPlan, err := s.userPlan(r.Context(), page.UserID)
	if err != nil {
		serverError(w, err)
		return
	}
	userPlan, err := s.userPlan(r.Context(), user.ID)
	if err != nil {
		serverError(w, err)
		return
	}
	if ownerPlan != "plus" && ownerPlan != "pro_plus" && userPlan != "plus" && userPlan != "pro_plus" {
		apiError(w, http.StatusForbidden, "Upgrade to Plus to access detailed analytics", nil)
		return
	}
	daily, err := s.dailyViews(r, page.ID)
	if err != nil {
		serverError(w, err)
		return
	}
	referrers, err := s.referrerCounts(r, page.ID, false)
	if err != nil {
		serverError(w, err)
		return
	}
	var unique int64
	if err := s.db.QueryRowContext(r.Context(), `select count(distinct ip_hash) from page_views where page_id = $1`, page.ID).Scan(&unique); err != nil {
		serverError(w, err)
		return
	}
	success(w, http.StatusOK, "Page details", map[string]any{
		"daily_views":     daily,
		"all_referrers":   referrers,
		"unique_visitors": unique,
	})
}

func (s *Server) pageVisitors(w http.ResponseWriter, r *http.Request) {
	page, ok := s.analyticsPageAccess(w, r)
	if !ok {
		return
	}
	user := currentUser(r)
	ownerPlan, err := s.userPlan(r.Context(), page.UserID)
	if err != nil {
		serverError(w, err)
		return
	}
	userPlan, err := s.userPlan(r.Context(), user.ID)
	if err != nil {
		serverError(w, err)
		return
	}
	if ownerPlan != "pro_plus" && userPlan != "pro_plus" {
		apiError(w, http.StatusForbidden, "Upgrade to Pro+ to access visitor logs", nil)
		return
	}
	rows, err := s.db.QueryContext(r.Context(), `
		select user_agent, referrer, created_at
		from page_views
		where page_id = $1
		order by created_at desc
		limit 100
	`, page.ID)
	if err != nil {
		serverError(w, err)
		return
	}
	defer rows.Close()
	items := []map[string]any{}
	for rows.Next() {
		var userAgent, referrer sql.NullString
		var createdAt sql.NullTime
		if err := rows.Scan(&userAgent, &referrer, &createdAt); err != nil {
			serverError(w, err)
			return
		}
		items = append(items, map[string]any{
			"user_agent": stringOrNil(userAgent),
			"referrer":   stringOrNil(referrer),
			"created_at": timeOrNil(createdAt),
		})
	}
	success(w, http.StatusOK, "Visitor log", map[string]any{"visitors": items})
}

func (s *Server) analyticsPageAccess(w http.ResponseWriter, r *http.Request) (*Page, bool) {
	page, err := s.pageBySlug(r.Context(), r.PathValue("slug"))
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			notFound(w)
			return nil, false
		}
		serverError(w, err)
		return nil, false
	}
	ok, err := s.canAccessPage(r.Context(), page, currentUser(r), true, true)
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

func (s *Server) userPlan(ctx context.Context, userID int64) (string, error) {
	var plan string
	err := s.db.QueryRowContext(ctx, `
		select plan from subscriptions
		where user_id = $1 and status = 'active'
		limit 1
	`, userID).Scan(&plan)
	if errors.Is(err, sql.ErrNoRows) {
		return "free", nil
	}
	return plan, err
}

func (s *Server) dailyViews(r *http.Request, pageID int64) ([]map[string]any, error) {
	rows, err := s.db.QueryContext(r.Context(), `
		select created_at::date as day, count(id)
		from page_views
		where page_id = $1 and created_at >= now() - interval '30 days'
		group by created_at::date
		order by created_at::date
	`, pageID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []map[string]any{}
	for rows.Next() {
		var day time.Time
		var count int64
		if err := rows.Scan(&day, &count); err != nil {
			return nil, err
		}
		items = append(items, map[string]any{"date": day.Format("2006-01-02"), "count": count})
	}
	return items, rows.Err()
}

func (s *Server) referrerCounts(r *http.Request, pageID int64, topOnly bool) ([]map[string]any, error) {
	limit := ""
	if topOnly {
		limit = " limit 5"
	}
	var total int64 = 1
	if !topOnly {
		_ = s.db.QueryRowContext(r.Context(), `select count(id) from page_views where page_id = $1`, pageID).Scan(&total)
		if total == 0 {
			total = 1
		}
	}
	rows, err := s.db.QueryContext(r.Context(), `
		select referrer, count(id)
		from page_views
		where page_id = $1 and referrer is not null and referrer <> ''
		group by referrer
		order by count(id) desc`+limit, pageID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []map[string]any{}
	for rows.Next() {
		var referrer string
		var count int64
		if err := rows.Scan(&referrer, &count); err != nil {
			return nil, err
		}
		item := map[string]any{"referrer": referrer, "count": count}
		if !topOnly {
			item["percentage"] = float64(int(float64(count)/float64(total)*1000+0.5)) / 10
		}
		items = append(items, item)
	}
	return items, rows.Err()
}
