# Supabase Cheatsheet

A guide to Supabase commands and queries, from basic to advanced.

## CLI Commands

### Project Setup

| Command | Description |
| :--- | :--- |
| `npm install supabase --save-dev` | Installs the Supabase CLI. |
| `supabase init` | Initializes a new Supabase project. |
| `supabase login` | Logs in to your Supabase account. |
| `supabase link --project-ref <your-project-ref>` | Links your local repository to a Supabase project. |

### Local Development

| Command | Description |
| :--- | :--- |
| `supabase start` | Starts the local Supabase development environment. |
| `supabase stop` | Stops all Supabase services. |
| `supabase status` | Shows the status of local Supabase services. |

### Database Migrations

| Command | Description |
| :--- | :--- |
| `supabase db remote commit` | Dumps the remote database schema. |
| `supabase db push` | Applies local migrations to the remote database. |
| `supabase db reset` | Resets the local database to the latest schema. |

## Database Queries

### SELECT

**Select all columns from a table:**

```sql
SELECT * FROM your_table;
```

**Select specific columns:**

```sql
SELECT column1, column2 FROM your_table;
```

**Filter results with a `WHERE` clause:**

```sql
SELECT * FROM your_table WHERE status = 'active';
```

### INSERT

**Insert a single row:**

```sql
INSERT INTO your_table (column1, column2) VALUES ('value1', 'value2');
```

**Insert multiple rows:**

```sql
INSERT INTO your_table (column1, column2) VALUES ('value1', 'value2'), ('value3', 'value4');
```

### UPDATE

**Update a specific row:**

```sql
UPDATE your_table SET column1 = 'new_value' WHERE id = 1;
```

### DELETE

**Delete a specific row:**

```sql
DELETE FROM your_table WHERE id = 1;
```

## Authentication

### Sign Up

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function signUp(email, password) {
  const { user, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { user, error };
}
```

### Sign In

```javascript
async function signIn(email, password) {
  const { user, error } = await supabase.auth.signIn({
    email,
    password,
  });
  return { user, error };
}
```

### Sign Out

```javascript
async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}
```
