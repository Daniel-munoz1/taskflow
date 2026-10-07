package com.taskflow.backend;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectRepository projects;

    public ProjectController(ProjectRepository projects) {
        this.projects = projects;
    }

    @GetMapping
    public List<Project> list() {
        return projects.findAll();
    }

    @GetMapping("/{id}")
    public Project get(@PathVariable Long id) {
        return projects.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Proyecto no encontrado"));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Project create(@Valid @RequestBody Project project) {
        project.setId(null);
        return projects.save(project);
    }

    @PutMapping("/{id}")
    public Project update(@PathVariable Long id, @Valid @RequestBody Project data) {
        Project project = get(id);
        project.setName(data.getName());
        project.setDescription(data.getDescription());
        return projects.save(project);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        projects.delete(get(id));
    }
}
