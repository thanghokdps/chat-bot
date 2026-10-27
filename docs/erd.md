# CHAT A.I+ — Entity Relationship Diagram

Derived from the Figma file `ZIYKCxqRlpYMY98YFbMseb` (page "Screens": Sign up, New chat, chat ai ×4).
Target database: PostgreSQL via Drizzle. Timestamps are `timestamptz`.
Auth tables (`user`, `session`, `account`, `verification`) follow the Better Auth core schema — their ids are `text`; app tables use `uuid`.
Decisions behind this model: `docs/adr/0001-agent-architecture.md`.

```mermaid
erDiagram
    user ||--o{ account          : "signs in with"
    user ||--o{ session          : "has"
    user ||--|| user_settings    : "configures"
    user ||--o{ subscriptions    : "upgrades via"
    plan_limits ||--o{ subscriptions : "limits"
    user ||--o{ conversations    : "owns"
    conversations ||--o{ messages : "contains"
    messages |o--o{ messages      : "parent of (edit / regenerate branches)"
    messages ||--o{ attachments   : "carries"
    messages ||--o{ message_feedback : "rated by"
    user ||--o{ message_feedback : "gives"
    suggestion_categories ||--o{ prompt_suggestions : "groups"

    user {
        text        id PK
        text        name "Andrew Neilson"
        text        email UK "Email Address*"
        boolean     email_verified
        text        image "avatar"
        timestamptz terms_accepted_at "additional field: Terms + Privacy consent"
        timestamptz trial_ends_at "additional field: free trial"
        timestamptz created_at
        timestamptz updated_at
    }

    account {
        text        id PK
        text        user_id FK
        text        provider_id "credential | google | apple"
        text        account_id "provider's user id"
        text        password "hash; credential provider only"
        text        access_token
        text        refresh_token
        text        id_token
        timestamptz access_token_expires_at
        timestamptz refresh_token_expires_at
        text        scope
        timestamptz created_at
        timestamptz updated_at
    }

    session {
        text        id PK
        text        user_id FK
        text        token UK
        text        ip_address
        text        user_agent
        timestamptz expires_at
        timestamptz created_at
        timestamptz updated_at
    }

    verification {
        text        id PK
        text        identifier "email"
        text        value "token"
        timestamptz expires_at
        timestamptz created_at
        timestamptz updated_at
    }

    user_settings {
        text        user_id PK, FK
        text        theme "light | dark | system"
        text        background "gray | blue | pink | yellow | green (screen variants)"
        text        language
        timestamptz updated_at
    }

    plan_limits {
        text        plan PK "free | trial | pro"
        int         daily_messages "free/trial 30"
        text        model_tier "standard | premium"
    }

    subscriptions {
        uuid        id PK
        text        user_id FK
        text        plan FK "Upgrade to Pro"
        text        status "trialing | active | past_due | canceled"
        text        provider "stripe (later)"
        text        provider_subscription_id UK
        timestamptz current_period_end
        timestamptz created_at
        timestamptz updated_at
    }

    conversations {
        uuid        id PK
        text        user_id FK
        text        title "sidebar item; auto-titled, renamable"
        uuid        current_leaf_message_id FK "tip of the visible branch"
        uuid        active_run_id "non-null while a reply streams"
        timestamptz last_message_at "groups: Your conversations / Last 7 Days"
        timestamptz deleted_at "soft delete: trash icon, Clear All"
        timestamptz created_at
        timestamptz updated_at
    }

    messages {
        uuid        id PK
        uuid        conversation_id FK
        uuid        parent_message_id FK "null for the first prompt"
        text        role "user | assistant"
        text        content "markdown"
        text        status "streaming | complete | stopped | error"
        text        model "assistant only"
        int         input_tokens
        int         output_tokens
        timestamptz created_at
    }

    attachments {
        uuid        id PK
        uuid        message_id FK
        text        kind "image"
        text        storage_key
        text        mime_type
        bigint      size_bytes
        timestamptz created_at
    }

    message_feedback {
        uuid        id PK
        uuid        message_id FK
        text        user_id FK
        smallint    rating "+1 thumbs up | -1 thumbs down"
        text        comment
        timestamptz created_at
    }

    suggestion_categories {
        uuid        id PK
        text        slug UK "explore | capabilities | limitation"
        text        title "Explore"
        text        description "Learn how to use chat.ai platform for your needs"
        text        icon "globe | bolt | warning"
        int         sort_order
    }

    prompt_suggestions {
        uuid        id PK
        uuid        category_id FK
        text        title "\"Explain\""
        text        prompt "Quantum computing in simple terms"
        text        image_url "card thumbnail"
        int         sort_order
        boolean     is_active
    }
```

## Constraints and indexes

| Table              | Constraint / index                                                                              | Why                                         |
| ------------------ | ----------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `user`             | unique `lower(email)`                                                                           | one account per address, case-insensitive   |
| `account`          | unique `(provider_id, account_id)`                                                              | one Google/Apple identity maps to one user  |
| `conversations`    | index `(user_id, deleted_at, last_message_at desc)`                                             | sidebar list and date grouping              |
| `conversations`    | GIN `to_tsvector(title)`                                                                        | sidebar search                              |
| `conversations`    | `active_run_id` set via `update … where active_run_id is null`                                  | one run per conversation; second send → 409 |
| `messages`         | index `(conversation_id, created_at)`                                                           | load a thread in order                      |
| `messages`         | GIN `to_tsvector(content)`                                                                      | search inside conversations                 |
| `messages`         | partial index `(conversation_id) where role = 'user'` + join on owner, filtered by `created_at` | daily quota count                           |
| `message_feedback` | unique `(message_id, user_id)`                                                                  | thumbs up/down toggles, never duplicates    |
| `subscriptions`    | partial unique `(user_id) where status in ('trialing','active')`                                | one live plan per user                      |

## Design → data traceability

| Design element                                                     | Screen                        | Stored in                                                     |
| ------------------------------------------------------------------ | ----------------------------- | ------------------------------------------------------------- |
| Email, password, eye toggle                                        | Sign up                       | `user.email`, `account.password` (`provider_id = credential`) |
| Continue with Google / Apple                                       | Sign up                       | `account` (`provider_id = google / apple`)                    |
| "By registering… Terms of Service… Privacy Statement"              | Sign up                       | `user.terms_accepted_at`                                      |
| "Sign up with free trail" / "Get started free"                     | Sign up                       | `user.trial_ends_at`, `plan_limits` (`trial`)                 |
| Already have an account? Login                                     | Sign up                       | `session`                                                     |
| User chip "Andrew Neilson" + avatar                                | Sidebar                       | `user.name`, `user.image`                                     |
| Settings                                                           | Sidebar                       | `user_settings`                                               |
| Background colour per screen (gray / blue / pink / yellow / green) | New chat, chat ai, -1, -2, -3 | `user_settings.background`                                    |
| Upgrade to Pro tab                                                 | All chat screens              | `subscriptions`, `plan_limits`                                |
| New chat                                                           | Sidebar                       | insert `conversations`                                        |
| Search icon                                                        | Sidebar                       | full-text indexes on `conversations` / `messages`             |
| "Your conversations" / "Last 7 Days" groups                        | Sidebar                       | `conversations.last_message_at`                               |
| Clear All                                                          | Sidebar                       | `conversations.deleted_at` for all of the user's rows         |
| Trash / edit icons on active item                                  | Sidebar                       | `conversations.deleted_at`, `conversations.title`             |
| Explore / Capabilities / Limitation columns                        | New chat                      | `suggestion_categories`                                       |
| "Explain" / "How to" / "Remember" … cards                          | New chat                      | `prompt_suggestions`                                          |
| User prompt with avatar                                            | Chat                          | `messages` (`role = user`)                                    |
| "CHAT A.I+" answer                                                 | Chat                          | `messages` (`role = assistant`)                               |
| Edit icon on a prompt                                              | Chat                          | new sibling `messages` row under the same parent              |
| Regenerate                                                         | Chat                          | new assistant `messages` row under the same user prompt       |
| Thumbs up / down                                                   | Chat                          | `message_feedback`                                            |
| Copy, ⋮ more                                                       | Chat                          | client-only, no storage                                       |
| Image icon in "Reply…" composer                                    | Sign up hero                  | `attachments`                                                 |
| Emoji icon in composer                                             | Sign up hero                  | client-only (inserted into `content`)                         |

## Modelling decisions

- **Edit and Regenerate use a message tree** (`parent_message_id`): both keep the old answer, and `conversations.current_leaf_message_id` marks the branch on screen. The `messages` table is the history's source of truth; agent checkpoints are run-scoped.
- **Soft delete on conversations**: "Clear All" sets `deleted_at`; a scheduled job hard-deletes after 30 days.
- **Quota is counted, not stored**: today's `role = user` messages vs `plan_limits.daily_messages`; turns ending in `error` are excluded.
- **Suggestion cards are data, not code**: product can change the New chat grid without a deploy.
- **The AI identity is not a table.** "CHAT A.I+" is one assistant; the model that answered is stored per message in `messages.model`.
