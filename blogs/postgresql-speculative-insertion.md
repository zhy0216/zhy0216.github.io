---
title: "PostgreSQL Speculative Insertion"
date: "2026-08-24"
excerpt: "The small, reversible write that makes INSERT ... ON CONFLICT safe under concurrency."
tags: ["POSTGRESQL", "CONCURRENCY", "DATABASES"]
---

One of the easiest ways to misunderstand `INSERT ... ON CONFLICT` is to imagine a `SELECT` followed by an `INSERT` or an `UPDATE`. PostgreSQL does something more careful: it makes a provisional write, asks the relevant unique index to arbitrate, and only then decides whether the row should become real.

That provisional write is called **speculative insertion**. It is an internal mechanism rather than a SQL command, and it has been part of PostgreSQL's native upsert implementation since PostgreSQL 9.5. The [9.5 release notes](https://www.postgresql.org/docs/9.5/release-9-5.html) and the [original implementation commit](https://github.com/postgres/postgres/commit/168d5805e4c08bed7b95d351bf097cff7c07dd65) are good historical starting points.

I will use “speculative insertion” throughout this article. “Tentative insertion” is another reasonable translation; the important idea is that the tuple is real enough to participate in conflict detection, but still reversible.

## The problem behind upsert

Consider a table with a unique email address:

```sql
CREATE TABLE users (
    email     text PRIMARY KEY,
    last_seen timestamptz NOT NULL
);
```

An application may want to create the user if it is new, or refresh `last_seen` if the user already exists:

```sql
INSERT INTO users(email, last_seen)
VALUES ('alice@example.com', now())
ON CONFLICT (email)
DO UPDATE SET last_seen = EXCLUDED.last_seen;
```

Now imagine two sessions executing that statement at the same time. A naive “check, then write” sequence has a race: both sessions can observe that the email is absent, and both can try to insert it. A regular `INSERT` resolves that race by raising a unique-violation error. That is correct, but it is not the insert-or-update behavior the application asked for.

PostgreSQL's documentation describes `ON CONFLICT DO UPDATE` as an atomic insert-or-update outcome, provided there is no independent error. That guarantee is the user-facing result of the machinery underneath. ([`INSERT` and `ON CONFLICT`](https://www.postgresql.org/docs/18/sql-insert.html#SQL-ON-CONFLICT))

## A useful mental model

The shortest accurate model is:

> Write a candidate row, let the unique index decide, then confirm or withdraw the candidate.

At a high level, the executor follows this shape:

```text
non-conclusive pre-check
        │
        ├─ committed conflict → DO NOTHING / DO UPDATE
        │
        └─ no known conflict
             │
             ├─ acquire a speculative-insertion token
             ├─ insert a speculative heap tuple
             ├─ insert index entries and check uniqueness
             │
             ├─ no conflict → confirm the tuple
             └─ conflict → back it out, wake waiters, retry
```

The pre-check is deliberately not the final authority. PostgreSQL has not acquired the locks needed to make that conclusion permanent, so another session can still race with it. The final arbitration happens as the index entries are inserted. The relevant control flow is visible in [`nodeModifyTable.c`](https://github.com/postgres/postgres/blob/REL_18_STABLE/src/backend/executor/nodeModifyTable.c) and [`execIndexing.c`](https://github.com/postgres/postgres/blob/REL_18_STABLE/src/backend/executor/execIndexing.c).

## What happens inside PostgreSQL?

### 1. PostgreSQL identifies the arbiter index

In `ON CONFLICT (email)`, PostgreSQL infers a matching unique index. This is why `ON CONFLICT` is not an arbitrary predicate-based lock: the conflict must be defined by a suitable unique constraint or index. For `DO UPDATE`, a conflict target is required, and only non-deferrable unique constraints or indexes can act as arbiters.

### 2. It acquires a speculative token

Before writing the candidate row, the backend acquires a special lock identified by its transaction ID and a per-insertion token. The token distinguishes multiple speculative insertions made by the same transaction.

If you are reading the source for the first time, this can look more complicated than it is. The token answers one very focused question for other sessions: “Is this particular candidate row going to be kept or withdrawn?”

### 3. It inserts a speculative heap tuple

The tuple is written to the table's heap with a speculative flag. It is not yet a normal, visible row. Internally, PostgreSQL temporarily stores the token in the tuple header; when the insertion succeeds, the heap layer replaces that provisional state with the ordinary tuple state.

This is an important distinction: speculative insertion is not merely an in-memory trial. PostgreSQL performs much of the normal physical insertion work, but delays the final decision about visibility.

### 4. The unique index performs the hard part

The executor inserts the candidate's index entries. A unique B-tree index searches for equal keys and checks the corresponding heap tuples using transaction visibility information.

If the equal key belongs to an uncommitted ordinary insertion, PostgreSQL waits for that transaction to finish and checks again. If the equal key belongs to another speculative insertion, it waits on that insertion's token instead. The [index uniqueness documentation](https://www.postgresql.org/docs/18/index-unique-checks.html) explains why the index access method must inspect the heap as part of the uniqueness check: under MVCC, physical duplicates can exist even though no valid snapshot may see two live rows with the same key.

### 5. PostgreSQL confirms or withdraws the tuple

If no conflict is found, PostgreSQL confirms the speculative tuple. If a conflict is found, it marks the speculative tuple dead and backs it out without aborting the surrounding transaction. The executor then returns to the conflict path and either retries the insert or performs `DO NOTHING`/`DO UPDATE` against the conflicting row.

The heap-level confirmation and abort paths are implemented in [`heapam.c`](https://github.com/postgres/postgres/blob/REL_18_STABLE/src/backend/access/heap/heapam.c). The source comments are unusually helpful here: they make clear that the tuple must be explicitly finished or aborted before the transaction can commit.

## A two-session example

Suppose sessions A and B both try to insert the same new email:

1. Both sessions perform the initial pre-check and find no committed row.
2. Session A inserts a speculative tuple and begins the unique-index check.
3. Session B reaches the same key and discovers A's in-progress speculative tuple.
4. B waits for A's speculative token, rather than blindly waiting for all of A's future work.
5. If A confirms, B wakes up and rechecks the key. If A withdraws, B can proceed.
6. Once the conflict is conclusive, B executes its chosen alternative action or completes its own insert.

This is why `ON CONFLICT` can behave atomically without taking an exclusive lock on the whole table. The coordination is concentrated around the arbiter index, the tuple's transaction state, and the short-lived speculative token lock.

## Why the token lock matters

The lock manager exposes speculative insertion locks as `locktype = 'spectoken'`. A waiting backend may also wait on a `transactionid` after a speculative tuple has been confirmed and becomes an ordinary uncommitted row.

When diagnosing a hot key or a slow upsert, these queries can be useful:

```sql
SELECT pid, wait_event_type, wait_event, query
FROM pg_stat_activity
WHERE wait_event_type = 'Lock'
  AND wait_event IN ('spectoken', 'transactionid');

SELECT pid, locktype, mode, granted, transactionid, objid
FROM pg_locks
WHERE locktype = 'spectoken';
```

The [PostgreSQL lock view](https://www.postgresql.org/docs/18/view-pg-locks.html) documents both the `spectoken` lock type and the fact that the token is shown in `objid`. These locks can be very short-lived, so not seeing one in a snapshot does not prove that no speculative wait occurred.

The source also contains a livelock-prevention rule for simultaneous speculative conflicts in the exclusion-constraint path: one transaction backs out first while the other waits. That detail is mostly invisible to application code, but it is a good example of how much care is required to make “just retry” safe under concurrency.

## What speculative insertion does not promise

There are a few boundaries worth keeping in view:

- It does not make conflicts free. A real conflict may already have caused heap and index work before the candidate is withdrawn. The dead tuple is later reclaimed by normal cleanup, so a very hot key can still create write amplification and vacuum pressure.
- It only arbitrates conflicts represented by the relevant unique or exclusion machinery. It does not protect arbitrary business predicates such as “there must be fewer than five active rows.”
- In `READ COMMITTED`, `DO NOTHING` can skip a row whose inserting transaction was not visible to the statement snapshot, and `DO UPDATE` can update a conflicting row that was not conventionally visible to that snapshot. This behavior is documented in the [transaction isolation chapter](https://www.postgresql.org/docs/18/transaction-iso.html#XACT-READ-COMMITTED).
- Repeatable-read and serializable transactions can still fail with a serialization error. Speculative insertion handles uniqueness races; it does not remove the application's responsibility to retry a transaction when the isolation level requires it.
- `MERGE` is not a drop-in synonym. It is more general, but PostgreSQL documents different behavior for a concurrent unique-key insert; a `MERGE` may raise a unique-violation error instead of restarting the match.
- If multiple input rows in one `INSERT ... ON CONFLICT DO UPDATE` target the same existing row, PostgreSQL raises a cardinality violation rather than updating that row repeatedly.

## The idea to remember

Speculative insertion is best understood as a disciplined pause before making an insert visible. PostgreSQL does not ask the application to guess whether a row exists, and it does not immediately turn every race into an error. It writes a candidate, lets the unique index and MVCC rules arbitrate, and then makes one of three decisions:

- confirm the insert;
- withdraw the candidate and do nothing; or
- withdraw the candidate and update the conflicting row.

Once that model is in place, the behavior of `INSERT ... ON CONFLICT` becomes much less mysterious. It is not “a `SELECT` followed by an `UPDATE`.” It is a small optimistic protocol built from a provisional heap tuple, an index-level uniqueness check, a short-lived token lock, and a carefully controlled retry.

The internal field names and function names may evolve between PostgreSQL releases, so they should not be treated as application APIs. The underlying idea, however, is remarkably stable: make the write reversible until concurrency has had its say.

## Further reading

- [PostgreSQL 18: `INSERT` and `ON CONFLICT`](https://www.postgresql.org/docs/18/sql-insert.html#SQL-ON-CONFLICT)
- [PostgreSQL 18: Index Uniqueness Checks](https://www.postgresql.org/docs/18/index-unique-checks.html)
- [PostgreSQL 18: Transaction Isolation](https://www.postgresql.org/docs/18/transaction-iso.html#XACT-READ-COMMITTED)
- [PostgreSQL 18: `pg_locks`](https://www.postgresql.org/docs/18/view-pg-locks.html)
- [PostgreSQL source: speculative insertion executor path](https://github.com/postgres/postgres/blob/REL_18_STABLE/src/backend/executor/execIndexing.c)
