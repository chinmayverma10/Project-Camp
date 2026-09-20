import { useEffect, useState } from "react";
import { request } from "./api.js";

const emptyProject = {name: "",description: ""};
const emptyTask = {title: "",description: "",assignedTo: "",status: "todo",attachments: []};

const statusLabel = (status) => status.replace("_"," ");

function App(){
  const [user,setUser] = useState(null);
  const [projects,setProjects] = useState([]);
  const [selectedProject,setSelectedProject] = useState(null);
  const [tasks,setTasks] = useState([]);
  const [members,setMembers] = useState([]);
  const [notes,setNotes] = useState([]);
  const [activeTab,setActiveTab] = useState("tasks");
  const [loading,setLoading] = useState(true);
  const [message,setMessage] = useState("");

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if(savedUser && localStorage.getItem("accessToken")){
      setUser(JSON.parse(savedUser));
    } else {
      setLoading(false);
    }
  },[]);

  useEffect(() => {
    if(user){
      loadProjects();
    }
  },[user]);

  useEffect(() => {
    if(selectedProject){
      loadProjectData(selectedProject.project._id);
    }
  },[selectedProject?.project?._id]);

  const showMessage = (text) => {
    setMessage(text);
    window.setTimeout(() => setMessage(""),3500);
  }

  const loadProjects = async() => {
    try {
      setLoading(true);
      const projectList = await request("/projects/");
      setProjects(projectList);
      const currentProjectId = selectedProject?.project?._id;
      setSelectedProject(projectList.find((item) => item.project._id === currentProjectId) || projectList[0] || null);
    } catch(error) {
      showMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  const loadProjectData = async(projectId) => {
    try {
      const [taskList,memberList,noteList] = await Promise.all([
        request(`/tasks/${projectId}`),
        request(`/projects/${projectId}/members`),
        request(`/notes/${projectId}`)
      ]);
      setTasks(taskList);
      setMembers(memberList);
      setNotes(noteList);
    } catch(error) {
      showMessage(error.message);
    }
  }

  const saveSession = (data) => {
    const loggedInUser = data.User;
    localStorage.setItem("accessToken",data.accessToken);
    localStorage.setItem("refreshToken",data.refreshToken);
    localStorage.setItem("user",JSON.stringify(loggedInUser));
    setUser(loggedInUser);
  }

  const logout = async() => {
    try {
      await request("/auth/logout",{method: "POST"});
    } catch(error) {
      // Local session is still cleared when the server session has expired.
    }
    localStorage.clear();
    setUser(null);
    setProjects([]);
    setSelectedProject(null);
  }

  if(!user){
    return <AuthScreen onLogin={saveSession} onMessage={showMessage} message={message} loading={loading} />;
  }

  const projectRole = selectedProject?.role;
  const canManageProject = projectRole === "admin";
  const canManageTasks = projectRole === "admin" || projectRole === "project_admin";

  return <main className="app-shell">
    <aside className="sidebar" aria-label="Project navigation">
      <div className="brand"><span className="brand-mark">✦</span><span>Project Camp</span></div>
      <div className="profile-card">
        <div className="avatar">{user.username?.slice(0,1).toUpperCase()}</div>
        <div><strong>{user.fullName || user.username}</strong><small>{user.role}</small></div>
      </div>
      <div className="sidebar-heading"><span>Your projects</span><span>{projects.length}</span></div>
      <nav className="project-list">
        {projects.map((item) => <button key={item.project._id} className={`project-button ${selectedProject?.project._id === item.project._id ? "selected" : ""}`} onClick={() => setSelectedProject(item)}>
          <span className="project-dot"></span><span>{item.project.name}</span>
        </button>)}
      </nav>
      {user.role === "admin" && <ProjectForm onCreated={async() => { await loadProjects(); showMessage("Project created") }} onMessage={showMessage} />}
      <button className="logout-button" onClick={logout}>Sign out</button>
    </aside>

    <section className="workspace">
      {message && <div className="toast" role="status">{message}</div>}
      {loading ? <div className="empty-state">Loading your workspace…</div> : !selectedProject ? <div className="empty-state"><h1>Welcome to Project Camp</h1><p>{user.role === "admin" ? "Create a project to get started." : "Ask a project admin to add you to a project."}</p></div> : <>
        <header className="workspace-header">
          <div><p className="eyebrow">{projectRole?.replace("_"," ")}</p><h1>{selectedProject.project.name}</h1><p>{selectedProject.project.description || "No project description yet."}</p></div>
          <div className="header-actions"><div className="member-count">{selectedProject.project.members || members.length} members</div>{canManageProject && <ProjectControls project={selectedProject.project} onRefresh={loadProjects} onMessage={showMessage} />}</div>
        </header>
        <div className="tabs" role="tablist" aria-label="Project sections">
          {[["tasks","Tasks"],["notes","Notes"],["members","Members"]].map(([id,label]) => <button key={id} role="tab" aria-selected={activeTab === id} className={activeTab === id ? "active" : ""} onClick={() => setActiveTab(id)}>{label}</button>)}
        </div>
        {activeTab === "tasks" && <TasksPanel project={selectedProject.project} tasks={tasks} members={members} canManage={canManageTasks} role={projectRole} onRefresh={() => loadProjectData(selectedProject.project._id)} onMessage={showMessage} />}
        {activeTab === "notes" && <NotesPanel projectId={selectedProject.project._id} notes={notes} canManage={canManageProject} onRefresh={() => loadProjectData(selectedProject.project._id)} onMessage={showMessage} />}
        {activeTab === "members" && <MembersPanel projectId={selectedProject.project._id} members={members} canManage={canManageProject} onRefresh={() => loadProjectData(selectedProject.project._id)} onMessage={showMessage} />}
      </>}
    </section>
  </main>
}

function AuthScreen({onLogin,onMessage,message,loading}){
  const [mode,setMode] = useState("login");
  const [form,setForm] = useState({username: "",fullName: "",email: "",password: ""});
  const [submitting,setSubmitting] = useState(false);
  const update = (event) => setForm({...form,[event.target.name]: event.target.value});
  const submit = async(event) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      if(mode === "register"){
        await request("/auth/register",{method: "POST",body: JSON.stringify(form)});
      }
      const data = await request("/auth/login",{method: "POST",body: JSON.stringify({email: form.email,password: form.password})});
      onLogin(data);
    } catch(error) {
      onMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  }
  return <main className="auth-page"><section className="auth-intro"><div className="brand"><span className="brand-mark">✦</span>Project Camp</div><h1>Calm project management for focused teams.</h1><p>Keep work, teammates, tasks and notes in one clear shared space.</p><div className="feature-list"><span>✓ Project-based access</span><span>✓ Tasks and subtasks</span><span>✓ File attachments</span></div></section><section className="auth-panel"><form className="auth-card" onSubmit={submit}><p className="eyebrow">{mode === "login" ? "WELCOME BACK" : "START HERE"}</p><h2>{mode === "login" ? "Sign in to your workspace" : "Create your account"}</h2>{message && <p className="form-error" role="alert">{message}</p>}{mode === "register" && <><label>Username<input name="username" minLength="8" required value={form.username} onChange={update} /></label><label>Full name<input name="fullName" value={form.fullName} onChange={update} /></label></>}<label>Email<input name="email" type="email" required value={form.email} onChange={update} /></label><label>Password<input name="password" type="password" minLength="8" required value={form.password} onChange={update} placeholder="8+ chars, uppercase, number, symbol" /></label><button className="primary-button" disabled={submitting || loading}>{submitting ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}</button><button type="button" className="text-button" onClick={() => setMode(mode === "login" ? "register" : "login")}>{mode === "login" ? "Need an account? Register" : "Already have an account? Sign in"}</button></form></section></main>
}

function ProjectForm({onCreated,onMessage}){
  const [open,setOpen] = useState(false); const [form,setForm] = useState(emptyProject);
  const submit = async(event) => { event.preventDefault(); try { await request("/projects/",{method: "POST",body: JSON.stringify(form)}); setForm(emptyProject); setOpen(false); onCreated(); } catch(error) { onMessage(error.message); } }
  return <div className="project-form">{open ? <form onSubmit={submit}><input aria-label="Project name" placeholder="Project name" required value={form.name} onChange={(e) => setForm({...form,name: e.target.value})} /><textarea aria-label="Project description" placeholder="Description" value={form.description} onChange={(e) => setForm({...form,description: e.target.value})} /><div><button className="small-button" type="submit">Create</button><button className="small-button muted" type="button" onClick={() => setOpen(false)}>Cancel</button></div></form> : <button className="new-project" onClick={() => setOpen(true)}>+ New project</button>}</div>
}

function ProjectControls({project,onRefresh,onMessage}){
  const [editing,setEditing] = useState(false);
  const [form,setForm] = useState({name: project.name,description: project.description || ""});
  const save = async(event) => { event.preventDefault(); try { await request(`/projects/${project._id}`,{method: "PUT",body: JSON.stringify(form)}); setEditing(false); await onRefresh(); onMessage("Project updated"); } catch(error) { onMessage(error.message); } }
  const remove = async() => { if(!window.confirm(`Delete ${project.name}? This cannot be undone.`)) return; try { await request(`/projects/${project._id}`,{method: "DELETE"}); await onRefresh(); onMessage("Project deleted"); } catch(error) { onMessage(error.message); } }
  return <div className="project-controls">{editing ? <form onSubmit={save}><input aria-label="Project name" required value={form.name} onChange={(e) => setForm({...form,name: e.target.value})} /><textarea aria-label="Project description" value={form.description} onChange={(e) => setForm({...form,description: e.target.value})} /><button className="small-button">Save</button><button className="small-button muted" type="button" onClick={() => setEditing(false)}>Cancel</button></form> : <><button className="small-button muted" onClick={() => setEditing(true)}>Edit project</button><button className="danger-button" onClick={remove}>Delete</button></>}</div>
}

function TasksPanel({project,tasks,members,canManage,role,onRefresh,onMessage}){
  const [form,setForm] = useState(emptyTask); const [showForm,setShowForm] = useState(false); const [detail,setDetail] = useState({});
  const submit = async(event) => { event.preventDefault(); try { const data = new FormData(); Object.entries(form).forEach(([key,value]) => { if(key !== "attachments") data.append(key,value); }); Array.from(form.attachments).forEach((file) => data.append("attachments",file)); await request(`/tasks/${project._id}`,{method: "POST",body: data}); setForm(emptyTask); setShowForm(false); onRefresh(); } catch(error) { onMessage(error.message); } }
  const showDetails = async(taskId) => { try { const data = await request(`/tasks/${project._id}/t/${taskId}`); setDetail({...detail,[taskId]: data}); } catch(error) { onMessage(error.message); } }
  const createSubtask = async(taskId,title) => { try { await request(`/tasks/${project._id}/t/${taskId}/subtasks`,{method: "POST",body: JSON.stringify({title})}); await showDetails(taskId); } catch(error) { onMessage(error.message); } }
  const updateSubtask = async(subTaskId,isCompleted) => { try { await request(`/tasks/${project._id}/st/${subTaskId}`,{method: "PUT",body: JSON.stringify({isCompleted})}); await showDetails(detail[subTaskId]?.task?._id); onRefresh(); } catch(error) { onMessage(error.message); } }
  return <section className="content-panel"><div className="section-title"><div><h2>Tasks</h2><p>{tasks.length} active task{tasks.length === 1 ? "" : "s"}</p></div>{canManage && <button className="primary-button compact" onClick={() => setShowForm(!showForm)}>{showForm ? "Close" : "+ Add task"}</button>}</div>{showForm && <form className="entry-form" onSubmit={submit}><input required placeholder="Task title" value={form.title} onChange={(e) => setForm({...form,title: e.target.value})} /><textarea placeholder="Description" value={form.description} onChange={(e) => setForm({...form,description: e.target.value})} /><select required value={form.assignedTo} onChange={(e) => setForm({...form,assignedTo: e.target.value})}><option value="">Assign to…</option>{members.map((member) => <option key={member.user._id} value={member.user._id}>{member.user.fullName || member.user.username}</option>)}</select><select value={form.status} onChange={(e) => setForm({...form,status: e.target.value})}><option value="todo">To do</option><option value="in_progress">In progress</option><option value="done">Done</option></select><label className="file-input">Attach files<input type="file" multiple accept="image/*,.pdf" onChange={(e) => setForm({...form,attachments: e.target.files})} /></label><button className="primary-button" type="submit">Create task</button></form>}<div className="task-grid">{tasks.map((task) => <TaskCard key={task._id} task={task} projectId={project._id} canManage={canManage} role={role} detail={detail[task._id]} onDetails={() => showDetails(task._id)} onCreateSubtask={createSubtask} onRefresh={onRefresh} onMessage={onMessage} />)}</div>{!tasks.length && <div className="empty-inline">No tasks yet. {canManage && "Create the first one."}</div>}</section>
}

function TaskCard({task,projectId,canManage,role,detail,onDetails,onCreateSubtask,onRefresh,onMessage}){
  const [subtaskTitle,setSubtaskTitle] = useState("");
  const updateStatus = async(status) => { try { await request(`/tasks/${projectId}/t/${task._id}`,{method: "PUT",body: JSON.stringify({status})}); onRefresh(); } catch(error) { onMessage(error.message); } }
  const complete = async(subtask) => { try { await request(`/tasks/${projectId}/st/${subtask._id}`,{method: "PUT",body: JSON.stringify({isCompleted: !subtask.isCompleted})}); onDetails(); } catch(error) { onMessage(error.message); } }
  return <article className="task-card"><div className="task-card-top"><span className={`status ${task.status}`}>{statusLabel(task.status)}</span>{canManage && <select aria-label={`Status for ${task.title}`} value={task.status} onChange={(e) => updateStatus(e.target.value)}><option value="todo">To do</option><option value="in_progress">In progress</option><option value="done">Done</option></select>}</div><h3>{task.title}</h3><p>{task.description || "No description"}</p><div className="task-meta"><span>Assigned to {task.assignedTo?.fullName || task.assignedTo?.username || "Unassigned"}</span><span>{task.attachment?.length || 0} file(s)</span></div><button className="text-button details-button" onClick={onDetails}>Show subtasks</button>{detail && <div className="subtasks">{detail.subtasks.map((subtask) => <label key={subtask._id} className={subtask.isCompleted ? "complete" : ""}><input type="checkbox" checked={subtask.isCompleted} onChange={() => complete(subtask)} />{subtask.title}</label>)}{canManage && <form onSubmit={(e) => { e.preventDefault(); if(subtaskTitle.trim()){ onCreateSubtask(task._id,subtaskTitle); setSubtaskTitle(""); } }}><input placeholder="Add subtask" value={subtaskTitle} onChange={(e) => setSubtaskTitle(e.target.value)} /><button className="small-button">Add</button></form>}</div>}</article>
}

function NotesPanel({projectId,notes,canManage,onRefresh,onMessage}){
  const [content,setContent] = useState(""); const [editing,setEditing] = useState(null);
  const create = async(event) => { event.preventDefault(); try { await request(`/notes/${projectId}`,{method: "POST",body: JSON.stringify({content})}); setContent(""); onRefresh(); } catch(error) { onMessage(error.message); } }
  const remove = async(id) => { try { await request(`/notes/${projectId}/n/${id}`,{method: "DELETE"}); onRefresh(); } catch(error) { onMessage(error.message); } }
  const update = async(event,noteId) => { event.preventDefault(); try { await request(`/notes/${projectId}/n/${noteId}`,{method: "PUT",body: JSON.stringify({content: editing.content})}); setEditing(null); onRefresh(); } catch(error) { onMessage(error.message); } }
  return <section className="content-panel"><div className="section-title"><div><h2>Notes</h2><p>Shared reference for the project</p></div></div>{canManage && <form className="note-form" onSubmit={create}><textarea required value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write a project note…" /><button className="primary-button">Save note</button></form>}<div className="notes-list">{notes.map((note) => <article className="note-card" key={note._id}>{editing?.id === note._id ? <form onSubmit={(event) => update(event,note._id)}><textarea required value={editing.content} onChange={(e) => setEditing({...editing,content: e.target.value})} /><button className="small-button">Save</button><button className="small-button muted" type="button" onClick={() => setEditing(null)}>Cancel</button></form> : <><p>{note.content}</p><footer><span>{note.createdBy?.fullName || note.createdBy?.username}</span>{canManage && <span><button className="text-button" onClick={() => setEditing({id: note._id,content: note.content})}>Edit</button><button className="danger-button" onClick={() => remove(note._id)}>Delete</button></span>}</footer></>}</article>)}</div>{!notes.length && <div className="empty-inline">No notes yet.</div>}</section>
}

function MembersPanel({projectId,members,canManage,onRefresh,onMessage}){
  const [form,setForm] = useState({email: "",role: "member"});
  const add = async(event) => { event.preventDefault(); try { await request(`/projects/${projectId}/members`,{method: "POST",body: JSON.stringify(form)}); setForm({email: "",role: "member"}); onRefresh(); } catch(error) { onMessage(error.message); } }
  const roleChange = async(userId,role) => { try { await request(`/projects/${projectId}/members/${userId}`,{method: "PUT",body: JSON.stringify({role})}); onRefresh(); } catch(error) { onMessage(error.message); } }
  const remove = async(userId) => { if(!window.confirm("Remove this member from the project?")) return; try { await request(`/projects/${projectId}/members/${userId}`,{method: "DELETE"}); onRefresh(); } catch(error) { onMessage(error.message); } }
  return <section className="content-panel"><div className="section-title"><div><h2>Members</h2><p>{members.length} people in this project</p></div></div>{canManage && <form className="member-form" onSubmit={add}><input type="email" required placeholder="teammate@example.com" value={form.email} onChange={(e) => setForm({...form,email: e.target.value})} /><select value={form.role} onChange={(e) => setForm({...form,role: e.target.value})}><option value="member">Member</option><option value="project_admin">Project admin</option></select><button className="primary-button">Add member</button></form>}<div className="members-list">{members.map((member) => <div className="member-row" key={member.user._id}><div className="avatar small">{member.user.username?.slice(0,1).toUpperCase()}</div><div className="member-name"><strong>{member.user.fullName || member.user.username}</strong><span>{member.user.email}</span></div>{canManage ? <><select aria-label={`Role for ${member.user.username}`} value={member.role} onChange={(e) => roleChange(member.user._id,e.target.value)}><option value="admin">Admin</option><option value="project_admin">Project admin</option><option value="member">Member</option></select><button className="danger-button" onClick={() => remove(member.user._id)}>Remove</button></> : <span className="role-badge">{member.role.replace("_"," ")}</span>}</div>)}</div></section>
}

export default App;
