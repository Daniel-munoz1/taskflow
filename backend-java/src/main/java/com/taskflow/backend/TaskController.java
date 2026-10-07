package com.taskflow.backend;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskRepository tasks;
    private final ProjectRepository projects;

    public TaskController(TaskRepository tasks, ProjectRepository projects) {
        this.tasks = tasks;
        this.projects = projects;
    }

    @GetMapping
    public List<Task> list(@RequestParam(required = false) Long projectId) {
        return projectId == null ? tasks.findAll() : tasks.findByProjectId(projectId);
    }

    @GetMapping("/{id}")
    public Task get(@PathVariable Long id) {
        return tasks.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tarea no encontrada"));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Task create(@Valid @RequestBody Task task) {
        if (!projects.existsById(task.getProjectId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El proyecto no existe");
        }
        task.setId(null);
        return tasks.save(task);
    }

    @PutMapping("/{id}")
    public Task update(@PathVariable Long id, @Valid @RequestBody Task data) {
        Task task = get(id);
        task.setTitle(data.getTitle());
        task.setDescription(data.getDescription());
        task.setStatus(data.getStatus());
        return tasks.save(task);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        tasks.delete(get(id));
    }
}
