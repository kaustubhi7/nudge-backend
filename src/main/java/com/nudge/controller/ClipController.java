package com.nudge.controller;

import com.nudge.model.Clip;
import com.nudge.service.ClipService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/clips")
@CrossOrigin(origins = "*")
public class ClipController {

    private final ClipService service;

    public ClipController(ClipService service) {
        this.service = service;
    }

    // ─── Save New Clip ───
    @PostMapping
    public Clip create(@RequestBody Clip clip) {
        return service.save(clip);
    }

    // ─── Get All Clips ───
    @GetMapping
    public List<Clip> getAll() {
        return service.getAll();
    }

    // ─── Delete One Clip ───
    @DeleteMapping("/{id}")
    public void deleteOne(@PathVariable Long id) {
        service.deleteById(id);
    }

    // ─── Delete All Clips ───
    @DeleteMapping
    public void deleteAll() {
        service.deleteAll();
    }

    // ─── Toggle Pin ───
    @PatchMapping("/{id}/pin")
    public Clip togglePin(@PathVariable Long id) {
        return service.togglePin(id);
    }
}


