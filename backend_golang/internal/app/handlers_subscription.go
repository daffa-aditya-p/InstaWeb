package app

import (
	"bytes"
	"context"
	"crypto/sha512"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"strings"
	"time"
)

var pricing = map[string]int{
	"plus:monthly":     150000,
	"plus:yearly":      1500000,
	"pro_plus:monthly": 450000,
	"pro_plus:yearly":  4500000,
}

func (s *Server) getSubscription(w http.ResponseWriter, r *http.Request) {
	user := currentUser(r)
	sub, err := s.subscriptionByUser(r.Context(), user.ID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			success(w, http.StatusOK, "Current subscription", map[string]any{"plan": "free", "status": "active"})
			return
		}
		serverError(w, err)
		return
	}
	success(w, http.StatusOK, "Current subscription", subscriptionMap(sub))
}

func (s *Server) subscriptionByUser(ctx context.Context, userID int64) (*Subscription, error) {
	return scanSubscription(s.db.QueryRowContext(ctx, `
		select id, user_id, plan, billing_cycle, status, midtrans_order_id, midtrans_transaction_id,
		       amount, started_at, expires_at, created_at, updated_at
		from subscriptions where user_id = $1
	`, userID))
}

func scanSubscription(row interface{ Scan(...any) error }) (*Subscription, error) {
	var sub Subscription
	err := row.Scan(&sub.ID, &sub.UserID, &sub.Plan, &sub.BillingCycle, &sub.Status, &sub.MidtransOrderID, &sub.MidtransTransactionID, &sub.Amount, &sub.StartedAt, &sub.ExpiresAt, &sub.CreatedAt, &sub.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &sub, nil
}

func subscriptionMap(sub *Subscription) map[string]any {
	return map[string]any{
		"id":                sub.ID,
		"plan":              sub.Plan,
		"billing_cycle":     stringOrNil(sub.BillingCycle),
		"status":            sub.Status,
		"midtrans_order_id": stringOrNil(sub.MidtransOrderID),
		"amount":            sub.Amount,
		"started_at":        timeOrNil(sub.StartedAt),
		"expires_at":        timeOrNil(sub.ExpiresAt),
	}
}

func (s *Server) createSubscription(w http.ResponseWriter, r *http.Request) {
	user := currentUser(r)
	payload, err := decodeJSON(r)
	if err != nil {
		apiError(w, http.StatusBadRequest, "Invalid JSON payload", nil)
		return
	}
	plan, _ := payload["plan"].(string)
	cycle, _ := payload["billing_cycle"].(string)
	if plan != "plus" && plan != "pro_plus" {
		apiError(w, http.StatusBadRequest, "Invalid plan. Choose 'plus' or 'pro_plus'.", nil)
		return
	}
	if cycle != "monthly" && cycle != "yearly" {
		apiError(w, http.StatusBadRequest, "Invalid billing_cycle. Choose 'monthly' or 'yearly'.", nil)
		return
	}
	amount := pricing[plan+":"+cycle]
	orderID := "INSTAWEB-" + strconv.FormatInt(user.ID, 10) + "-" + strconv.FormatInt(time.Now().Unix(), 10)

	requestBody := map[string]any{
		"transaction_details": map[string]any{"order_id": orderID, "gross_amount": amount},
		"customer_details":    map[string]any{"first_name": user.Name, "email": user.Email},
	}
	body, _ := json.Marshal(requestBody)
	req, err := http.NewRequest(http.MethodPost, s.cfg.MidtransSnapURL, bytes.NewReader(body))
	if err != nil {
		serverError(w, err)
		return
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Authorization", basicAuthValue(s.cfg.MidtransServerKey, ""))
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		apiError(w, http.StatusBadGateway, "Failed to contact payment gateway: "+err.Error(), nil)
		return
	}
	defer resp.Body.Close()
	respBody, _ := io.ReadAll(resp.Body)
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		apiError(w, http.StatusBadGateway, "Midtrans API error: "+string(respBody), nil)
		return
	}
	var respData map[string]any
	if err := json.Unmarshal(respBody, &respData); err != nil {
		serverError(w, err)
		return
	}
	_, err = s.db.ExecContext(r.Context(), `
		insert into subscriptions (user_id, plan, billing_cycle, status, midtrans_order_id, amount)
		values ($1, $2, $3, 'pending', $4, $5)
		on conflict (user_id)
		do update set plan = excluded.plan, billing_cycle = excluded.billing_cycle, status = 'pending',
		              midtrans_order_id = excluded.midtrans_order_id, amount = excluded.amount, updated_at = now()
	`, user.ID, plan, cycle, orderID, amount)
	if err != nil {
		serverError(w, err)
		return
	}
	success(w, http.StatusOK, "Snap transaction created", map[string]any{
		"snap_token":   respData["token"],
		"redirect_url": respData["redirect_url"],
		"order_id":     orderID,
	})
}

func (s *Server) midtransNotification(w http.ResponseWriter, r *http.Request) {
	payload, err := decodeJSON(r)
	if err != nil {
		apiError(w, http.StatusBadRequest, "Invalid JSON payload", nil)
		return
	}
	orderID := stringAny(payload["order_id"])
	statusCode := stringAny(payload["status_code"])
	grossAmount := stringAny(payload["gross_amount"])
	signature := stringAny(payload["signature_key"])
	transactionStatus := stringAny(payload["transaction_status"])
	transactionID := stringAny(payload["transaction_id"])

	if s.cfg.MidtransServerKey == "" {
		apiError(w, http.StatusInternalServerError, "Payment gateway is not configured", nil)
		return
	}

	hash := sha512.Sum512([]byte(orderID + statusCode + grossAmount + s.cfg.MidtransServerKey))
	if signature != hex.EncodeToString(hash[:]) {
		apiError(w, http.StatusForbidden, "Invalid signature", nil)
		return
	}
	if err := s.applyTransactionStatus(r, orderID, transactionStatus, transactionID); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			apiError(w, http.StatusNotFound, "Subscription not found", nil)
			return
		}
		serverError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"status": "ok"})
}

func (s *Server) checkPaymentStatus(w http.ResponseWriter, r *http.Request) {
	user := currentUser(r)
	orderID := r.PathValue("order_id")

	if user.Role != "admin" && user.Role != "super_admin" {
		var exists bool
		err := s.db.QueryRowContext(r.Context(), `
			select exists(select 1 from subscriptions where midtrans_order_id = $1 and user_id = $2)
		`, orderID, user.ID).Scan(&exists)
		if err != nil {
			serverError(w, err)
			return
		}
		if !exists {
			forbidden(w)
			return
		}
	}

	data, statusCode, err := s.fetchMidtransStatus(orderID)
	if err != nil {
		apiError(w, http.StatusBadGateway, err.Error(), nil)
		return
	}
	writeJSON(w, statusCode, apiResponse{"status": "success", "message": "Payment status", "data": data})
}

func (s *Server) verifySubscription(w http.ResponseWriter, r *http.Request) {
	user := currentUser(r)
	payload, err := decodeJSON(r)
	if err != nil {
		apiError(w, http.StatusBadRequest, "Invalid JSON payload", nil)
		return
	}
	orderID, _ := payload["order_id"].(string)
	if orderID == "" {
		apiError(w, http.StatusBadRequest, "order_id is required", nil)
		return
	}
	sub, err := scanSubscription(s.db.QueryRowContext(r.Context(), `
		select id, user_id, plan, billing_cycle, status, midtrans_order_id, midtrans_transaction_id,
		       amount, started_at, expires_at, created_at, updated_at
		from subscriptions
		where user_id = $1 and midtrans_order_id = $2
	`, user.ID, orderID))
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			apiError(w, http.StatusNotFound, "Subscription not found", nil)
			return
		}
		serverError(w, err)
		return
	}
	data, _, err := s.fetchMidtransStatus(orderID)
	if err != nil {
		apiError(w, http.StatusBadGateway, "Failed to verify transaction status: "+err.Error(), nil)
		return
	}
	transactionStatus := stringAny(data["transaction_status"])
	if transactionStatus == "capture" || transactionStatus == "settlement" {
		transactionID := stringAny(data["transaction_id"])
		if err := s.activateSubscription(r, sub.ID, transactionID); err != nil {
			serverError(w, err)
			return
		}
		activated, _ := s.subscriptionByUser(r.Context(), user.ID)
		success(w, http.StatusOK, "Subscription activated", map[string]any{
			"plan":       activated.Plan,
			"status":     activated.Status,
			"started_at": timeOrNil(activated.StartedAt),
			"expires_at": timeOrNil(activated.ExpiresAt),
		})
		return
	}
	if transactionStatus == "pending" {
		success(w, http.StatusOK, "Payment still pending", map[string]any{"status": "pending"})
		return
	}
	if _, err := s.db.ExecContext(r.Context(), `update subscriptions set status = $1, updated_at = now() where id = $2`, fallback(transactionStatus, "failed"), sub.ID); err != nil {
		serverError(w, err)
		return
	}
	apiError(w, http.StatusBadRequest, "Payment status: "+transactionStatus, nil)
}

func (s *Server) fetchMidtransStatus(orderID string) (map[string]any, int, error) {
	req, err := http.NewRequest(http.MethodGet, s.cfg.MidtransAPIURL+"/"+orderID+"/status", nil)
	if err != nil {
		return nil, 0, err
	}
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Authorization", basicAuthValue(s.cfg.MidtransServerKey, ""))
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, 0, errors.New("Failed to check payment status: " + err.Error())
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, resp.StatusCode, errors.New("Midtrans API error: " + string(body))
	}
	var data map[string]any
	if err := json.Unmarshal(body, &data); err != nil {
		return nil, resp.StatusCode, err
	}
	return data, http.StatusOK, nil
}

func (s *Server) applyTransactionStatus(r *http.Request, orderID string, transactionStatus string, transactionID string) error {
	var subID int64
	var cycle sql.NullString
	if err := s.db.QueryRowContext(r.Context(), `select id, billing_cycle from subscriptions where midtrans_order_id = $1`, orderID).Scan(&subID, &cycle); err != nil {
		return err
	}
	if transactionStatus == "capture" || transactionStatus == "settlement" {
		return s.activateSubscription(r, subID, transactionID)
	}
	status := transactionStatus
	switch transactionStatus {
	case "deny":
		status = "denied"
	case "cancel":
		status = "cancelled"
	case "expire":
		status = "expired"
	}
	_, err := s.db.ExecContext(r.Context(), `
		update subscriptions set status = $1, midtrans_transaction_id = nullif($2, ''), updated_at = now()
		where id = $3
	`, status, transactionID, subID)
	return err
}

func (s *Server) activateSubscription(r *http.Request, subID int64, transactionID string) error {
	var cycle sql.NullString
	if err := s.db.QueryRowContext(r.Context(), `select billing_cycle from subscriptions where id = $1`, subID).Scan(&cycle); err != nil {
		return err
	}
	duration := 30 * 24 * time.Hour
	if cycle.Valid && cycle.String == "yearly" {
		duration = 365 * 24 * time.Hour
	}
	start := time.Now().UTC()
	_, err := s.db.ExecContext(r.Context(), `
		update subscriptions
		set status = 'active', started_at = $1, expires_at = $2,
		    midtrans_transaction_id = nullif($3, ''), updated_at = now()
		where id = $4
	`, start, start.Add(duration), transactionID, subID)
	return err
}

func stringAny(value any) string {
	switch typed := value.(type) {
	case string:
		return typed
	case float64:
		return strconv.FormatFloat(typed, 'f', -1, 64)
	case nil:
		return ""
	default:
		return strings.TrimSpace(strings.Trim(strings.ReplaceAll(strings.TrimSpace(fmt.Sprint(typed)), "\n", ""), `"`))
	}
}

func fallback(value, alt string) string {
	if value == "" {
		return alt
	}
	return value
}
