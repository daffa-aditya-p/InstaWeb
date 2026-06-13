package app

import (
	"context"
	"database/sql"
	"errors"
	"net/http"
	"strings"
)

func (s *Server) hasProPlus(ctx context.Context, userID int64) (bool, error) {
	plan, err := s.userPlan(ctx, userID)
	if err != nil {
		return false, err
	}
	return plan == "pro_plus", nil
}

func (s *Server) ownerPage(w http.ResponseWriter, r *http.Request, slug string) (*Page, bool) {
	user := currentUser(r)
	page, err := s.pageBySlug(r.Context(), slug)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			notFound(w)
			return nil, false
		}
		serverError(w, err)
		return nil, false
	}
	if page.UserID != user.ID {
		notFound(w)
		return nil, false
	}
	return page, true
}

func (s *Server) listCollaborators(w http.ResponseWriter, r *http.Request) {
	user := currentUser(r)
	page, ok := s.ownerPage(w, r, r.PathValue("slug"))
	if !ok {
		return
	}
	pro, err := s.hasProPlus(r.Context(), user.ID)
	if err != nil {
		serverError(w, err)
		return
	}
	if !pro {
		apiError(w, http.StatusForbidden, "Upgrade to Pro+ to manage collaborators", nil)
		return
	}
	rows, err := s.db.QueryContext(r.Context(), `
		select pc.id, pc.user_id, pc.permission, pc.invited_at, u.name, u.email
		from page_collaborators pc
		left join users u on u.id = pc.user_id
		where pc.page_id = $1
		order by pc.invited_at asc
	`, page.ID)
	if err != nil {
		serverError(w, err)
		return
	}
	defer rows.Close()
	items := []map[string]any{}
	for rows.Next() {
		var id, userID int64
		var permission string
		var invitedAt sql.NullTime
		var name, email sql.NullString
		if err := rows.Scan(&id, &userID, &permission, &invitedAt, &name, &email); err != nil {
			serverError(w, err)
			return
		}
		items = append(items, map[string]any{
			"id":         id,
			"user_id":    userID,
			"email":      stringOrNil(email),
			"name":       stringOrNil(name),
			"permission": permission,
			"invited_at": timeOrNil(invitedAt),
		})
	}
	success(w, http.StatusOK, "Collaborators list", map[string]any{"collaborators": items})
}

func (s *Server) addCollaborator(w http.ResponseWriter, r *http.Request) {
	user := currentUser(r)
	page, ok := s.ownerPage(w, r, r.PathValue("slug"))
	if !ok {
		return
	}
	pro, err := s.hasProPlus(r.Context(), user.ID)
	if err != nil {
		serverError(w, err)
		return
	}
	if !pro {
		apiError(w, http.StatusForbidden, "Upgrade to Pro+ to manage collaborators", nil)
		return
	}
	payload, err := decodeJSON(r)
	if err != nil {
		apiError(w, http.StatusBadRequest, "Invalid JSON payload", nil)
		return
	}
	email := normalizeEmail(stringAny(payload["email"]))
	if email == "" {
		apiError(w, http.StatusBadRequest, "email is required", nil)
		return
	}
	target, err := s.userByEmail(r.Context(), email)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			apiError(w, http.StatusNotFound, "User not found with that email", nil)
			return
		}
		serverError(w, err)
		return
	}
	if target.ID == user.ID {
		apiError(w, http.StatusBadRequest, "You cannot add yourself as a collaborator", nil)
		return
	}
	var exists bool
	if err := s.db.QueryRowContext(r.Context(), `select exists(select 1 from page_collaborators where page_id = $1 and user_id = $2)`, page.ID, target.ID).Scan(&exists); err != nil {
		serverError(w, err)
		return
	}
	if exists {
		apiError(w, http.StatusBadRequest, "User is already a collaborator", nil)
		return
	}
	var count int
	if err := s.db.QueryRowContext(r.Context(), `select count(*) from page_collaborators where page_id = $1`, page.ID).Scan(&count); err != nil {
		serverError(w, err)
		return
	}
	if count >= 5 {
		apiError(w, http.StatusBadRequest, "Maximum 5 collaborators per page", nil)
		return
	}
	permission := stringAny(payload["permission"])
	if permission == "" {
		permission = "editor"
	}
	var collabID int64
	err = s.db.QueryRowContext(r.Context(), `
		insert into page_collaborators (page_id, user_id, permission)
		values ($1, $2, $3) returning id
	`, page.ID, target.ID, permission).Scan(&collabID)
	if err != nil {
		serverError(w, err)
		return
	}
	success(w, http.StatusCreated, "Collaborator added", map[string]any{
		"id":         collabID,
		"user_id":    target.ID,
		"email":      target.Email,
		"name":       target.Name,
		"permission": permission,
	})
}

func (s *Server) removeCollaborator(w http.ResponseWriter, r *http.Request) {
	page, ok := s.ownerPage(w, r, r.PathValue("slug"))
	if !ok {
		return
	}
	collabID, err := pathInt(r, "collab_id")
	if err != nil {
		notFound(w)
		return
	}
	result, err := s.db.ExecContext(r.Context(), `delete from page_collaborators where id = $1 and page_id = $2`, collabID, page.ID)
	if err != nil {
		serverError(w, err)
		return
	}
	affected, _ := result.RowsAffected()
	if affected == 0 {
		notFound(w)
		return
	}
	success(w, http.StatusOK, "Collaborator removed", nil)
}

func (s *Server) sendInvitation(w http.ResponseWriter, r *http.Request) {
	user := currentUser(r)
	pro, err := s.hasProPlus(r.Context(), user.ID)
	if err != nil {
		serverError(w, err)
		return
	}
	if !pro {
		apiError(w, http.StatusForbidden, "Pro+ plan required to invite collaborators", nil)
		return
	}
	page, err := s.pageBySlug(r.Context(), r.PathValue("slug"))
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			notFound(w)
			return
		}
		serverError(w, err)
		return
	}
	if page.UserID != user.ID {
		forbidden(w)
		return
	}
	var existingCollabs, pendingInvites int
	_ = s.db.QueryRowContext(r.Context(), `select count(*) from page_collaborators where page_id = $1`, page.ID).Scan(&existingCollabs)
	_ = s.db.QueryRowContext(r.Context(), `select count(*) from invitations where page_id = $1 and status = 'pending'`, page.ID).Scan(&pendingInvites)
	if existingCollabs+pendingInvites >= 5 {
		apiError(w, http.StatusBadRequest, "Maximum 5 collaborators per page", nil)
		return
	}
	payload, err := decodeJSON(r)
	if err != nil {
		apiError(w, http.StatusBadRequest, "Invalid JSON payload", nil)
		return
	}
	email := normalizeEmail(stringAny(payload["email"]))
	message := strings.TrimSpace(stringAny(payload["message"]))
	if email == "" {
		apiError(w, http.StatusBadRequest, "Email is required", nil)
		return
	}
	recipient, err := s.userByEmail(r.Context(), email)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			apiError(w, http.StatusNotFound, "User with that email not found", nil)
			return
		}
		serverError(w, err)
		return
	}
	if recipient.ID == user.ID {
		apiError(w, http.StatusBadRequest, "Cannot invite yourself", nil)
		return
	}
	var exists bool
	if err := s.db.QueryRowContext(r.Context(), `select exists(select 1 from page_collaborators where page_id = $1 and user_id = $2)`, page.ID, recipient.ID).Scan(&exists); err != nil {
		serverError(w, err)
		return
	}
	if exists {
		apiError(w, http.StatusBadRequest, "User is already a collaborator", nil)
		return
	}
	if err := s.db.QueryRowContext(r.Context(), `select exists(select 1 from invitations where page_id = $1 and recipient_id = $2 and status = 'pending')`, page.ID, recipient.ID).Scan(&exists); err != nil {
		serverError(w, err)
		return
	}
	if exists {
		apiError(w, http.StatusBadRequest, "Invitation already sent to this user", nil)
		return
	}
	var inviteID int64
	err = s.db.QueryRowContext(r.Context(), `
		insert into invitations (page_id, sender_id, recipient_id, message)
		values ($1, $2, $3, nullif($4, ''))
		returning id
	`, page.ID, user.ID, recipient.ID, message).Scan(&inviteID)
	if err != nil {
		serverError(w, err)
		return
	}
	success(w, http.StatusCreated, "Invitation sent", map[string]any{
		"id":        inviteID,
		"recipient": map[string]any{"id": recipient.ID, "name": recipient.Name, "email": recipient.Email},
		"status":    "pending",
	})
}

func (s *Server) inbox(w http.ResponseWriter, r *http.Request) {
	user := currentUser(r)
	rows, err := s.db.QueryContext(r.Context(), `
		select i.id, i.status, i.message, i.created_at,
		       p.id, p.title, p.slug,
		       u.id, u.name, u.email
		from invitations i
		left join pages p on p.id = i.page_id
		join users u on u.id = i.sender_id
		where i.recipient_id = $1
		order by i.created_at desc
	`, user.ID)
	if err != nil {
		serverError(w, err)
		return
	}
	defer rows.Close()
	items := []map[string]any{}
	for rows.Next() {
		var id, senderID int64
		var status string
		var message sql.NullString
		var createdAt sql.NullTime
		var pageID sql.NullInt64
		var pageTitle, pageSlug sql.NullString
		var senderName, senderEmail string
		if err := rows.Scan(&id, &status, &message, &createdAt, &pageID, &pageTitle, &pageSlug, &senderID, &senderName, &senderEmail); err != nil {
			serverError(w, err)
			return
		}
		var pageJSON any = nil
		if pageID.Valid {
			pageJSON = map[string]any{
				"id":    pageID.Int64,
				"title": pageTitle.String,
				"slug":  pageSlug.String,
			}
		}
		items = append(items, map[string]any{
			"id":         id,
			"page":       pageJSON,
			"sender":     map[string]any{"id": senderID, "name": senderName, "email": senderEmail},
			"message":    stringOrNil(message),
			"status":     status,
			"created_at": timeOrNil(createdAt),
		})
	}
	var unread int
	_ = s.db.QueryRowContext(r.Context(), `select count(*) from invitations where recipient_id = $1 and status = 'pending'`, user.ID).Scan(&unread)
	success(w, http.StatusOK, "Inbox", map[string]any{"invitations": items, "unread_count": unread})
}

func (s *Server) acceptInvitation(w http.ResponseWriter, r *http.Request) {
	s.handleInvitationDecision(w, r, true)
}

func (s *Server) declineInvitation(w http.ResponseWriter, r *http.Request) {
	s.handleInvitationDecision(w, r, false)
}

func (s *Server) handleInvitationDecision(w http.ResponseWriter, r *http.Request, accept bool) {
	user := currentUser(r)
	inviteID, err := pathInt(r, "invite_id")
	if err != nil {
		notFound(w)
		return
	}
	var pageID int64
	var status string
	err = s.db.QueryRowContext(r.Context(), `select page_id, status from invitations where id = $1 and recipient_id = $2`, inviteID, user.ID).Scan(&pageID, &status)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			notFound(w)
			return
		}
		serverError(w, err)
		return
	}
	if status != "pending" {
		apiError(w, http.StatusBadRequest, "Invitation already "+status, nil)
		return
	}
	newStatus := "declined"
	message := "Invitation declined"
	if accept {
		newStatus = "accepted"
		message = "Invitation accepted. You can now edit this page."
	}
	err = withTx(r.Context(), s.db, func(tx *sql.Tx) error {
		if _, err := tx.ExecContext(r.Context(), `update invitations set status = $1, updated_at = now() where id = $2`, newStatus, inviteID); err != nil {
			return err
		}
		if accept {
			_, err := tx.ExecContext(r.Context(), `
				insert into page_collaborators (page_id, user_id, permission)
				values ($1, $2, 'editor')
				on conflict (page_id, user_id) do nothing
			`, pageID, user.ID)
			return err
		}
		return nil
	})
	if err != nil {
		serverError(w, err)
		return
	}
	success(w, http.StatusOK, message, nil)
}

func (s *Server) inboxCount(w http.ResponseWriter, r *http.Request) {
	user := currentUser(r)
	var count int
	_ = s.db.QueryRowContext(r.Context(), `select count(*) from invitations where recipient_id = $1 and status = 'pending'`, user.ID).Scan(&count)
	success(w, http.StatusOK, "Unread count", map[string]any{"count": count})
}
