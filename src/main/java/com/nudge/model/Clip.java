package com.nudge.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "clips")
public class Clip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    private String type;

    private String tag;                    // ← new

    private Boolean pinned = false;        // ← new

    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.expiresAt = LocalDateTime.now().plusHours(24);
        if (this.pinned == null) this.pinned = false;
    }

    // ─── Getters & Setters ───
    public Long getId() { return id; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getTag() { return tag; }
    public void setTag(String tag) { this.tag = tag; }

    public Boolean getPinned() { return pinned; }
    public void setPinned(Boolean pinned) { this.pinned = pinned; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
}

