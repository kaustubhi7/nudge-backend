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

    public Clip save(Clip clip) {
        String content = clip.getContent();
        if (content.startsWith("http://") || content.startsWith("https://")) {
            clip.setType("link");
        } else {
            clip.setType("text");
        }
        return repo.save(clip);
    }

    public List<Clip> getAll() {
        return repo.findByExpiresAtAfter(LocalDateTime.now());
    }

    public void deleteById(Long id) {
        repo.deleteById(id);
    }

    public void deleteAll() {
        repo.deleteAll();
    }

    @Scheduled(fixedRate = 3600000)
    @Transactional
    public void cleanExpired() {
        repo.deleteExpiredClips(LocalDateTime.now());
        System.out.println("Nudge: cleaned expired clips");
    }
}

