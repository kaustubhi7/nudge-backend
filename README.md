# Nudge - Backend

The backend API for **Nudge**, a cross-device clipboard/content syncing tool. It lets you save text, links, or images from one device and instantly access them from another - no app install, no account required.

Built with **Spring Boot 3.5** and **Java 21**, deployed on **Render** with a **MySQL (Aiven)** database.

## How it works

- Save a "clip" (text, link, or image) via the API - the backend auto-detects the type.
- Clips are fetched by any connected client (e.g. the web frontend) in real time.
- Clips **auto-expire after 24 hours** and are purged by an hourly scheduled cleanup job, so nothing piles up.
- Clips can be **pinned** to flag the important ones.

## Tech Stack

| Layer | Technology |
|---|---|
| Language | Java 21 |
| Framework | Spring Boot 3.5 (Web, Data JPA) |
| Database | MySQL (hosted on Aiven) |
| ORM | Hibernate / Spring Data JPA |
| Deployment | Docker -> Render |
| Build tool | Maven |

## API Reference

Base path: `/api/clips`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/clips` | Create a new clip. Type (`text` / `link` / `image`) is auto-detected from content. |
| `GET` | `/api/clips` | Get all non-expired clips. |
| `DELETE` | `/api/clips/{id}` | Delete a single clip by ID. |
| `DELETE` | `/api/clips` | Delete all clips. |
| `PATCH` | `/api/clips/{id}/pin` | Toggle the pinned state of a clip. |

### Clip object

```json
{
  "id": 1,
  "content": "string | data:image/... | https://...",
  "type": "text | image | link",
  "tag": "string",
  "pinned": false,
  "createdAt": "2026-06-21T10:00:00",
  "expiresAt": "2026-06-22T10:00:00"
}
```

## Architecture notes

- **Auto-expiry:** every clip is stamped with a 24-hour `expiresAt` on creation (`@PrePersist`). A `@Scheduled` job runs hourly to delete expired rows from the database, so the table stays small without needing a separate cron service.
- **Type detection:** the service layer inspects clip content on save - `data:image` prefix means `image`, `http(s)://` prefix means `link`, otherwise `text`. Clients don't need to specify type explicitly.
- **CORS:** open (`@CrossOrigin(origins = "*")`) since this is a public utility API consumed by a separate static frontend.

## Running locally

Requires Java 21 and a MySQL instance.

```bash
git clone https://github.com/kaustubhi7/nudge-backend.git
cd nudge-backend
```

Set the following environment variables (no credentials are stored in the repo):

```bash
export DB_URL=jdbc:mysql://<host>:3306/<database>
export DB_USERNAME=<username>
export DB_PASSWORD=<password>
```

Then run:

```bash
./mvnw spring-boot:run
```

## Deployment

Deployed on nudge-space.surge.sh

The included `Dockerfile` uses a multi-stage build (Maven build stage, then a lightweight Eclipse Temurin JRE runtime stage) and is deployed on Render. Database credentials are injected via environment variables at runtime - nothing sensitive is baked into the image or committed to source control.

## Related

- Frontend: dark-themed landing page + client, hosted on Netlify.
