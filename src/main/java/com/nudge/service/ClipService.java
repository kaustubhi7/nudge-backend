package com.nudge.service;

import com.nudge.model.Clip;
import com.nudge.repository.ClipRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ClipService {

    private final ClipRepository repo;

    public ClipService(ClipRepository repo) {
        this.repo = repo;
    }

    // ─── Save Clip ───
    public Clip save(Clip clip) {
        String content = clip.getContent();

        // Auto detect type
        if (content.startsWith("data:image")) {
            clip.setType("image");
        } else if (content.startsWith("http://") || content.startsWith("https://")) {
            clip.setType("link");
        } else {
            clip.setType("text");
        }

        return repo.save(clip);
    }

    // ─── Get All Non Expired Clips ───
    public List<Clip> getAll() {
        return repo.findByExpiresAtAfter(LocalDateTime.now());
    }

    // ─── Delete One ───
    public void deleteById(Long id) {
        repo.deleteById(id);
    }

    // ─── Delete All ───
    public void deleteAll() {
        repo.deleteAll();
    }

    // ─── Toggle Pin ───
    public Clip togglePin(Long id) {
        Clip clip = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Clip not found with id: " + id));
        clip.setPinned(!clip.getPinned());
        return repo.save(clip);
    }

    // ─── Auto Clean Expired Clips Every Hour ───
    @Scheduled(fixedRate = 3600000)
    @Transactional
    public void cleanExpired() {
        repo.deleteExpiredClips(LocalDateTime.now());
        System.out.println("Nudge: cleaned expired clips");
    }
}

