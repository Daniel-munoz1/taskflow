import { useEffect, useState } from "react";
import "./App.css";

const STATUSES = [
  { key: "TODO", label: "Por hacer" },
  { key: "IN_PROGRESS", label: "En curso" },
  { key: "DONE", label: "Hecho" },
];

async function api(path, options) {
  const res = await fetch(`/api${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.status === 204 ? null : res.json();
}

export default function App() {
  const [projects, setProjects] = useState([]);
  const [current, setCurrent] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState("");
  const [projectName, setProjectName] = useState("");
  const [taskTitle, setTaskTitle] = useState("");

  const run = async (fn) => {
    try {
      setError("");
      await fn();
    } catch {
      setError("No se pudo conectar con el servidor. Revisa que el backend esté encendido en el puerto 8080.");
    }
  };

  const loadTasks = (id) =>
    run(async () => setTasks(await api(`/tasks?projectId=${id}`)));

  useEffect(() => {
    run(async () => {
      const data = await api("/projects");
      setProjects(data);
      setCurrent(data[0] ?? null);
    });
  }, []);

  useEffect(() => {
    if (current) loadTasks(current.id);
    else setTasks([]);
  }, [current?.id]);

  const addProject = (e) => {
    e.preventDefault();
    if (!projectName.trim()) return;
    run(async () => {
      const p = await api("/projects", {
        method: "POST",
        body: JSON.stringify({ name: projectName.trim() }),
      });
      setProjects((ps) => [...ps, p]);
      setCurrent(p);
      setProjectName("");
    });
  };

  const deleteProject = () =>
    run(async () => {
      await Promise.all(tasks.map((t) => api(`/tasks/${t.id}`, { method: "DELETE" })));
      await api(`/projects/${current.id}`, { method: "DELETE" });
      const rest = projects.filter((p) => p.id !== current.id);
      setProjects(rest);
      setCurrent(rest[0] ?? null);
    });

  const addTask = (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    run(async () => {
      const t = await api("/tasks", {
        method: "POST",
        body: JSON.stringify({ title: taskTitle.trim(), projectId: current.id }),
      });
      setTasks((ts) => [...ts, t]);
      setTaskTitle("");
    });
  };

  const changeStatus = (task, status) =>
    run(async () => {
      const updated = await api(`/tasks/${task.id}`, {
        method: "PUT",
        body: JSON.stringify({ ...task, status }),
      });
      setTasks((ts) => ts.map((t) => (t.id === task.id ? updated : t)));
    });

  const deleteTask = (id) =>
    run(async () => {
      await api(`/tasks/${id}`, { method: "DELETE" });
      setTasks((ts) => ts.filter((t) => t.id !== id));
    });

  return (
    <div className="app">
      <aside className="sidebar">
        <h1>TaskFlow</h1>
        <form onSubmit={addProject} className="inline-form">
          <input
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Nombre del proyecto"
            aria-label="Nombre del proyecto"
          />
          <button type="submit">Crear</button>
        </form>
        <ul className="project-list">
          {projects.map((p) => (
            <li key={p.id}>
              <button
                className={p.id === current?.id ? "project active" : "project"}
                onClick={() => setCurrent(p)}
              >
                {p.name}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <main className="main">
        {error && <p className="error" role="alert">{error}</p>}

        {!current ? (
          <div className="empty">
            <h2>Aún no tienes proyectos</h2>
            <p>Crea el primero desde el panel de la izquierda para empezar a organizar tus tareas.</p>
          </div>
        ) : (
          <>
            <header className="main-head">
              <h2>{current.name}</h2>
              <button className="link-danger" onClick={deleteProject}>
                Eliminar proyecto
              </button>
            </header>

            <form onSubmit={addTask} className="inline-form task-form">
              <input
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="¿Qué hay que hacer?"
                aria-label="Título de la tarea"
              />
              <button type="submit">Agregar tarea</button>
            </form>

            <div className="board">
              {STATUSES.map((s) => {
                const items = tasks.filter((t) => t.status === s.key);
                return (
                  <section key={s.key} className={`column ${s.key}`}>
                    <h3>
                      {s.label} <span className="count">{items.length}</span>
                    </h3>
                    {items.length === 0 && <p className="hint">Sin tareas</p>}
                    {items.map((t) => (
                      <article key={t.id} className="task">
                        <p>{t.title}</p>
                        <div className="task-actions">
                          <select
                            value={t.status}
                            onChange={(e) => changeStatus(t, e.target.value)}
                            aria-label={`Estado de ${t.title}`}
                          >
                            {STATUSES.map((o) => (
                              <option key={o.key} value={o.key}>{o.label}</option>
                            ))}
                          </select>
                          <button className="link-danger" onClick={() => deleteTask(t.id)}>
                            Eliminar
                          </button>
                        </div>
                      </article>
                    ))}
                  </section>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
