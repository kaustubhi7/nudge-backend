package com.nudge.repository;

import com.nudge.model.Clip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface ClipRepository extends JpaRepository<Clip, Long> {

    List<Clip> findByExpiresAtAfter(LocalDateTime now);

    @Modifying
    @Query("DELETE FROM Clip c WHERE c.expiresAt < :now")
    void deleteExpiredClips(@Param("now") LocalDateTime now);
}

