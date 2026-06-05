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

    @PostMapping
    public Clip create(@RequestBody Clip clip) {
        return service.save(clip);
    }

    @GetMapping
    public List<Clip> getAll() {
        return service.getAll();
    }

    @DeleteMapping("/{id}")
    public void deleteOne(@PathVariable Long id) {
        service.deleteById(id);
    }

    @DeleteMapping
    public void deleteAll() {
        service.deleteAll();
    }
}

