create table users (
    id uuid primary key,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null,
    email varchar(254) not null unique,
    full_name varchar(100) not null,
    password_hash varchar(100) not null,
    role varchar(20) not null check (role in ('USER', 'ADMIN')),
    status varchar(20) not null check (status in ('ACTIVE', 'LOCKED', 'DELETED')),
    failed_login_attempts integer not null default 0,
    locked_at timestamp with time zone,
    deleted_at timestamp with time zone
);

create table refresh_tokens (
    id uuid primary key,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null,
    user_id uuid not null references users(id),
    token_hash varchar(64) not null unique,
    expires_at timestamp with time zone not null,
    revoked_at timestamp with time zone
);

create index idx_users_status on users(status);
create index idx_refresh_tokens_user_id on refresh_tokens(user_id);
