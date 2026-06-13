package app

import (
	"database/sql"
	"time"
)

type User struct {
	ID           int64
	Name         string
	Email        string
	PasswordHash string
	Role         string
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

type Page struct {
	ID              int64
	UserID          int64
	Title           string
	Slug            string
	Summary         sql.NullString
	IsPublished     bool
	PublishedAt     sql.NullTime
	MetaTitle       sql.NullString
	MetaDescription sql.NullString
	OGImage         sql.NullString
	CreatedAt       time.Time
	UpdatedAt       time.Time
	Sections        []PageSection
	Owner           *User
}

type Template struct {
	ID          int64
	Name        string
	Slug        string
	Description sql.NullString
	CreatedAt   time.Time
	UpdatedAt   time.Time
	Fields      []TemplateField
}

type TemplateField struct {
	ID         int64
	TemplateID int64
	Name       string
	Slug       string
	Type       string
	Value      sql.NullString
}

type PageSection struct {
	ID         int64
	PageID     int64
	TemplateID int64
	Position   int
	CreatedAt  time.Time
	UpdatedAt  time.Time
	Template   Template
	Fields     []TemplateField
}

type Subscription struct {
	ID                    int64
	UserID                int64
	Plan                  string
	BillingCycle          sql.NullString
	Status                string
	MidtransOrderID       sql.NullString
	MidtransTransactionID sql.NullString
	Amount                int
	StartedAt             sql.NullTime
	ExpiresAt             sql.NullTime
	CreatedAt             time.Time
	UpdatedAt             time.Time
	User                  *User
}

type Invitation struct {
	ID          int64
	PageID      int64
	SenderID    int64
	RecipientID int64
	Status      string
	Message     sql.NullString
	CreatedAt   time.Time
	UpdatedAt   time.Time
	Page        *Page
	Sender      *User
	Recipient   *User
}

type Collaborator struct {
	ID         int64
	PageID     int64
	UserID     int64
	Permission string
	InvitedAt  time.Time
	User       *User
}

func stringOrNil(value sql.NullString) any {
	if !value.Valid {
		return nil
	}
	return value.String
}

func stringValue(value sql.NullString, fallback string) string {
	if !value.Valid {
		return fallback
	}
	return value.String
}

func timeOrNil(value sql.NullTime) any {
	if !value.Valid {
		return nil
	}
	return formatTime(value.Time)
}

func formatTime(value time.Time) string {
	return value.UTC().Format("2006-01-02T15:04:05.000000Z")
}
