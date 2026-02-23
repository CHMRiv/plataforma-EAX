/* ==========================================================================
   EAX Platform - Desarrollo Module (Task Manager - Hierarchical)
   ========================================================================== */

const DesarrolloModule = {
    currentView: 'kanban',
    currentArea: null,
    currentProject: null,
    currentFolder: null,

    render() {
        const content = document.getElementById('page-content');
        const areas = Store.get('areas') || [];
        const proyectos = Store.get('proyectos') || [];
        const carpetas = Store.get('carpetas') || [];
        const isAdmin = Store.state.user.role === 'Administrador';

        content.innerHTML = `
            <div class="comm-container animate-fade-in" style="height: calc(100vh - 80px);">
                <!-- Sidebar Hierárquico - ClickUp Inspired -->
                <aside class="comm-sidebar">
                    <div class="comm-sidebar-header flex justify-between items-center px-4 mb-6">
                        <h2 class="text-xl font-bold font-heading tracking-tight text-gray-800">Estructura</h2>
                        ${isAdmin ? `
                            <button class="header-btn p-1.5 hover:bg-gray-100 rounded-full transition-colors" onclick="DesarrolloModule.showAreaForm()">
                                <i data-lucide="plus" style="width:18px; color:var(--color-primary-500);"></i>
                            </button>
                        ` : ''}
                    </div>

                    <div class="overflow-auto flex-1 custom-scrollbar">
                        <!-- Vista General -->
                        <div class="px-2 mb-6 text-gray-500">
                            <h3 class="text-3xs uppercase tracking-[0.2em] text-gray-400 font-bold mb-3 px-3">Vistas</h3>
                            <div class="comm-item rounded-lg ${!this.currentProject && !this.currentArea ? 'active bg-primary-50 text-primary-600' : ''}" onclick="DesarrolloModule.filterProject(null)">
                                <i data-lucide="layout-grid" style="width:18px;"></i>
                                <span class="font-semibold text-sm">Panel General</span>
                            </div>
                        </div>

                        <!-- Espacios -->
                        <div class="px-2">
                            <h3 class="text-3xs uppercase tracking-[0.2em] text-gray-400 font-bold mb-3 px-3">Espacios de Trabajo</h3>
                            
                            <div class="flex flex-col">
                                ${areas.map(area => {
            const areaProjects = proyectos.filter(p => p.areaId === area.id);
            const isAreaActive = this.currentArea === area.id;

            return `
                                        <div class="flex flex-col mb-1 last:mb-0">
                                            <!-- Nivel 1: Área (Espacio) -->
                                            <div class="comm-item group py-2 px-3 rounded-lg transition-all ${isAreaActive && !this.currentProject ? 'bg-gray-100 text-gray-900 font-bold' : 'hover:bg-gray-50 text-gray-600'}" onclick="DesarrolloModule.filterArea(${area.id})">
                                                <div class="flex items-center gap-3 flex-1 overflow-hidden">
                                                    <i data-lucide="${area.icono || 'layers'}" style="width:18px; color: ${area.color};"></i>
                                                    <span class="truncate text-[14px]">${area.nombre}</span>
                                                </div>
                                                <div class="flex gap-1">
                                                    <button class="btn-icon btn-ghost btn-xs opacity-0 group-hover:opacity-100" onclick="event.stopPropagation(); DesarrolloModule.showMetrics('area', ${area.id})">
                                                        <i data-lucide="bar-chart-2" style="width:14px;"></i>
                                                    </button>
                                                    <button class="btn-icon btn-ghost btn-xs opacity-0 group-hover:opacity-100" onclick="event.stopPropagation(); DesarrolloModule.showRequestForm('proyecto', ${area.id})">
                                                        <i data-lucide="plus" style="width:14px;"></i>
                                                    </button>
                                                </div>
                                            </div>

                                            <!-- Contenedor Proyectos (Indentación Nivel 2) -->
                                            <div class="flex flex-col ml-[28px] border-l border-gray-100 pl-2 mt-0.5">
                                                ${areaProjects.map(p => {
                const isActive = this.currentProject === p.id && !this.currentFolder;
                const projectFolders = carpetas.filter(c => c.proyectoId === p.id);

                return `
                                                        <div class="flex flex-col">
                                                            <!-- Nivel 2: Proyecto -->
                                                            <div class="comm-item group py-1.5 pl-3 pr-2 rounded-lg ${isActive ? 'bg-primary-50 text-primary-600 font-bold' : 'text-gray-500 hover:bg-gray-50'}" onclick="DesarrolloModule.filterProject(${p.id})">
                                                                <div class="flex items-center gap-2 flex-1 overflow-hidden">
                                                                    <i data-lucide="folder" style="width:16px;"></i>
                                                                    <span class="truncate text-[13px]">${p.nombre}</span>
                                                                </div>
                                                                <div class="flex gap-1">
                                                                    <button class="btn-icon btn-ghost btn-xs opacity-0 group-hover:opacity-100" onclick="event.stopPropagation(); DesarrolloModule.showMetrics('proyecto', ${p.id})">
                                                                        <i data-lucide="bar-chart-2" style="width:13px;"></i>
                                                                    </button>
                                                                    <button class="btn-icon btn-ghost btn-xs opacity-0 group-hover:opacity-100" onclick="event.stopPropagation(); DesarrolloModule.showRequestForm('subcarpeta', ${p.id})">
                                                                        <i data-lucide="plus" style="width:13px;"></i>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            
                                                            <!-- Contenedor Subcarpetas (Indentación Nivel 3) -->
                                                            ${projectFolders.length > 0 ? `
                                                                <div class="flex flex-col ml-5 border-l border-gray-100 pl-2">
                                                                    ${projectFolders.map(f => `
                                                                        <!-- Nivel 3: Subcarpeta -->
                                                                        <div class="comm-item group py-1 pl-3 pr-2 rounded-lg text-xs ${this.currentFolder === f.id ? 'text-primary-600 font-bold' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}" onclick="DesarrolloModule.filterFolder(${f.id}, ${p.id})">
                                                                            <div class="flex items-center gap-2 flex-1 overflow-hidden">
                                                                                <i data-lucide="hash" style="width:12px;" class="opacity-50"></i>
                                                                                <span class="truncate">${f.nombre}</span>
                                                                            </div>
                                                                            <button class="btn-icon btn-ghost btn-xs opacity-0 group-hover:opacity-100" onclick="event.stopPropagation(); DesarrolloModule.showMetrics('subcarpeta', ${f.id})">
                                                                                <i data-lucide="bar-chart-2" style="width:12px;"></i>
                                                                            </button>
                                                                        </div>
                                                                    `).join('')}
                                                                </div>
                                                            ` : ''}
                                                        </div>
                                                    `;
            }).join('')}
                                            </div>
                                        </div>
                                    `;
        }).join('')}
                            </div>
                        </div>

                        <!-- Configuración -->
                        ${isAdmin ? `
                        <div class="mt-8 pt-6 px-4 border-t border-gray-100">
                             <div class="comm-item rounded-lg ${this.currentView === 'requests' ? 'bg-warning-50 text-warning-700 font-bold' : 'text-gray-500 hover:bg-gray-50'}" onclick="DesarrolloModule.setView('requests')">
                                <i data-lucide="shield-check" style="width:18px;"></i>
                                <span class="text-sm">Solicitudes Pendientes</span>
                                ${this.getPendingCount() > 0 ? `<span class="bg-warning-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-auto">${this.getPendingCount()}</span>` : ''}
                            </div>
                        </div>
                        ` : ''}
                    </div>
                </aside>

                <!-- Content Area -->
                <main class="comm-chat-area">
                    <header class="comm-chat-header justify-between py-4">
                        <div class="flex items-center gap-4">
                            <div class="flex gap-1 bg-gray-50 rounded-full p-1 border">
                                ${['kanban', 'lista', 'gantt', 'calendario', 'reportes'].map(v => `
                                    <button class="btn btn-sm ${this.currentView === v ? 'btn-primary shadow-sm' : 'btn-ghost'} px-4 py-1.5 rounded-full" onclick="DesarrolloModule.setView('${v}')" style="font-size:13px;">
                                        ${v.charAt(0).toUpperCase() + v.slice(1)}
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                        <div class="flex gap-2">
                            <button class="btn btn-primary" onclick="DesarrolloModule.showTaskForm()">
                                <i data-lucide="plus" style="width:16px;"></i>
                                Nueva Tarea
                            </button>
                        </div>
                    </header>

                    <div class="flex-1 overflow-auto custom-scrollbar p-6" id="dev-content-area">
                        ${this.renderView()}
                    </div>
                </main>
            </div>
        `;

        if (window.lucide) lucide.createIcons();
    },

    setView(view) {
        this.currentView = view;
        this.render();
    },

    filterArea(id) {
        this.currentArea = id;
        this.currentProject = null;
        this.currentFolder = null;
        this.render();
    },

    filterProject(id) {
        this.currentProject = id;
        this.currentFolder = null;
        if (id) {
            const p = Store.find('proyectos', id);
            this.currentArea = p ? p.areaId : null;
        } else {
            this.currentArea = null;
        }
        this.render();
    },

    filterFolder(id, projectId) {
        this.currentFolder = id;
        this.currentProject = projectId;
        if (projectId) {
            const p = Store.find('proyectos', projectId);
            this.currentArea = p ? p.areaId : null;
        }
        this.render();
    },

    getPendingCount() {
        const requests = Store.get('projectRequests') || [];
        return requests.filter(r => r.estado === 'pendiente').length;
    },

    renderView() {
        if (this.currentView === 'requests') return this.renderRequests();
        switch (this.currentView) {
            case 'kanban': return this.renderKanban();
            case 'lista': return this.renderLista();
            case 'gantt': return this.renderGantt();
            case 'calendario': return this.renderCalendario();
            case 'reportes': return this.renderReportes();
            default: return this.renderKanban();
        }
    },

    renderKanban() {
        const tasks = this.getFilteredTasks();
        const columns = [
            { id: 'todo', name: 'Por Hacer', color: 'var(--color-gray-400)' },
            { id: 'in-progress', name: 'En Progreso', color: 'var(--color-primary-500)' },
            { id: 'review', name: 'En Revisión', color: 'var(--color-warning-500)' },
            { id: 'done', name: 'Completado', color: 'var(--color-success-500)' }
        ];

        return `
            <div class="kanban-board" style="gap:24px;">
                ${columns.map(col => {
            const colTasks = tasks.filter(t => t.estado === col.id);
            return `
                        <div class="kanban-column" style="background:var(--color-gray-25); border:1px solid var(--color-gray-100); border-radius:24px; min-height: calc(100vh - 250px);">
                            <div class="kanban-column-header p-5 border-b border-gray-100">
                                <div class="flex items-center gap-2">
                                    <div style="width:10px;height:10px;border-radius:50%;background:${col.color};"></div>
                                    <h4 class="font-bold text-sm">${col.name}</h4>
                                    <span class="badge badge-ghost">${colTasks.length}</span>
                                </div>
                            </div>
                            <div class="kanban-column-body p-4 flex flex-col gap-4" ondrop="DesarrolloModule.handleDrop(event, '${col.id}')" ondragover="event.preventDefault()">
                                ${colTasks.length > 0 ? colTasks.map(t => this.renderTaskCard(t)).join('') : '<div class="text-xs text-center py-8 text-tertiary">Sin tareas</div>'}
                            </div>
                        </div>
                    `;
        }).join('')}
            </div>
        `;
    },

    renderTaskCard(task) {
        const isPending = (task.proyectoId && task.proyectoId.toString().startsWith('PENDING')) ||
            (task.carpetaId && task.carpetaId.toString().startsWith('PENDING'));
        return `
            <div class="card p-4 shadow-sm hover:shadow-md transition-all cursor-pointer border-l-4" 
                 draggable="true" ondragstart="DesarrolloModule.handleDragStart(event, ${task.id})"
                 style="border-left-color:${task.prioridad === 'alta' ? 'var(--color-secondary-red)' : 'var(--color-primary-500)'}"
                 onclick="DesarrolloModule.showTaskForm(${task.id})">
                
                ${isPending ? `
                    <div class="flex items-center gap-1 text-warning-600 text-3xs font-bold uppercase mb-2">
                        <i data-lucide="alert-circle" style="width:10px;"></i>
                        Ubicación pendiente
                    </div>
                ` : ''}

                <h5 class="text-sm font-bold mb-2">${task.titulo}</h5>
                
                <div class="flex justify-between items-center mt-4">
                    <div class="flex items-center gap-1 text-xs text-tertiary">
                        <i data-lucide="calendar" style="width:12px;"></i>
                        ${task.fechaVencimiento ? Utils.formatDate(task.fechaVencimiento) : 'S/F'}
                    </div>
                    <div class="avatar-sm" title="${task.asignado}">${Utils.getInitials(task.asignado)}</div>
                </div>
            </div>
        `;
    },

    handleDragStart(e, id) {
        e.dataTransfer.setData('taskId', id);
    },

    handleDrop(e, newStatus) {
        e.preventDefault();
        const id = parseInt(e.dataTransfer.getData('taskId'));
        Store.update('tareas', id, { estado: newStatus });
        this.render();
    },

    getFilteredTasks() {
        let tasks = Store.get('tareas') || [];
        if (this.currentArea && !this.currentProject) {
            const projectsInArea = Store.get('proyectos').filter(p => p.areaId === this.currentArea).map(p => p.id);
            tasks = tasks.filter(t => projectsInArea.includes(t.proyectoId));
        }
        if (this.currentProject && !this.currentFolder) tasks = tasks.filter(t => t.proyectoId == this.currentProject);
        if (this.currentFolder) tasks = tasks.filter(t => t.carpetaId == this.currentFolder);
        return tasks;
    },

    showMetrics(tipo, id) {
        let name = '';
        let filteredTasks = [];

        if (tipo === 'area') {
            const area = Store.find('areas', id);
            name = area?.nombre || 'Área';
            const projectsInArea = Store.get('proyectos').filter(p => p.areaId === id).map(p => p.id);
            filteredTasks = Store.get('tareas').filter(t => projectsInArea.includes(t.proyectoId));
        } else if (tipo === 'proyecto') {
            const proj = Store.find('proyectos', id);
            name = proj?.nombre || 'Proyecto';
            filteredTasks = Store.get('tareas').filter(t => t.proyectoId == id);
        } else {
            const fold = Store.find('carpetas', id);
            name = fold?.nombre || 'Subcarpeta';
            filteredTasks = Store.get('tareas').filter(t => t.carpetaId == id);
        }

        const stats = {
            total: filteredTasks.length,
            todo: filteredTasks.filter(t => t.estado === 'todo').length,
            inProgress: filteredTasks.filter(t => t.estado === 'in-progress').length,
            done: filteredTasks.filter(t => t.estado === 'done').length,
            late: filteredTasks.filter(t => t.estado !== 'done' && t.fechaVencimiento && new Date(t.fechaVencimiento) < new Date()).length
        };

        Components.modal({
            title: `Métricas: ${name}`,
            size: 'md',
            content: `
                <div class="grid grid-cols-2 gap-4">
                    <div class="summary-card">
                        <span class="label">Total Tareas</span>
                        <span class="value">${stats.total}</span>
                    </div>
                    <div class="summary-card">
                        <span class="label text-red-500">Atrasadas</span>
                        <span class="value text-red-500">${stats.late}</span>
                    </div>
                    <div class="summary-card">
                        <span class="label">Pendientes</span>
                        <span class="value">${stats.todo + stats.inProgress}</span>
                    </div>
                    <div class="summary-card">
                        <span class="label">Completadas</span>
                        <span class="value text-green-500">${stats.done}</span>
                    </div>
                </div>
                <div class="mt-6">
                    <h4 class="text-sm font-bold mb-3 font-heading">Distribución de Estados</h4>
                    <div class="h-4 bg-gray-100 rounded-full overflow-hidden flex">
                        <div style="width:${(stats.done / stats.total) * 100 || 0}%; background:var(--color-primary-500);" title="Completadas"></div>
                        <div style="width:${(stats.inProgress / stats.total) * 100 || 0}%; background:var(--color-secondary-teal);" title="En progreso"></div>
                        <div style="width:${(stats.todo / stats.total) * 100 || 0}%; background:var(--color-gray-300);" title="Pendientes"></div>
                    </div>
                </div>
            `
        });
    },

    showAreaForm() {
        const { modal, close } = Components.modal({
            title: 'Crear Nuevo Espacio',
            content: `
                <div class="grid grid-cols-1 gap-4">
                    <div class="form-group">
                        <label class="form-label">Nombre del Espacio</label>
                        <input type="text" id="area-name" class="form-input" placeholder="Ej: Operaciones Logísticas">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Color Representativo</label>
                        <input type="color" id="area-color" class="form-input" value="#00875a" style="height:44px;">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Icono</label>
                        <select id="area-icon" class="form-select">
                            <option value="briefcase">Maletín (Corporativo)</option>
                            <option value="zap">Rayo (I+D+i)</option>
                            <option value="trending-up">Gráfico (Ventas)</option>
                            <option value="truck">Camión (Servicios)</option>
                            <option value="users">Usuarios (RRHH)</option>
                        </select>
                    </div>
                </div>
            `,
            footer: `
                <button class="btn btn-secondary" onclick="this.closest('.modal-backdrop').remove()">Cancelar</button>
                <button class="btn btn-primary" onclick="DesarrolloModule.createArea()">Crear Espacio Ahora</button>
            `
        });
    },

    createArea() {
        const nombre = document.getElementById('area-name').value;
        const color = document.getElementById('area-color').value;
        const icono = document.getElementById('area-icon').value;

        if (!nombre) return;

        Store.add('areas', { nombre, color, icono });
        Components.toast('Nuevo Espacio creado exitosamente', 'success');
        document.querySelector('.modal-backdrop').remove();
        this.render();
    },

    renderRequests() {
        const requests = Store.get('projectRequests') || [];
        const areas = Store.get('areas');
        const proyectos = Store.get('proyectos');

        return `
            <div class="max-w-5xl mx-auto">
                <div class="welcome-section mb-8">
                    <h1 class="welcome-title text-2xl">Administración de Estructura</h1>
                    <p class="welcome-subtitle">Revisa y aprueba solicitudes para nuevos proyectos o subcarpetas.</p>
                </div>

                <div class="card overflow-hidden">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Nombre Solicitado</th>
                                <th>Tipo</th>
                                <th>Ubicación Superior</th>
                                <th>Solicitante</th>
                                <th>Estado</th>
                                <th class="text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${requests.length === 0 ? '<tr><td colspan="6" class="text-center py-8 text-secondary">No hay solicitudes pendientes</td></tr>' : ''}
                            ${requests.map(r => {
            let parentName = '-';
            if (r.tipo === 'proyecto') {
                const area = areas.find(a => a.id == r.areaId);
                parentName = area ? `Área: ${area.nombre}` : '-';
            } else {
                const proj = proyectos.find(p => p.id == r.proyectoId);
                parentName = proj ? `Proyecto: ${proj.nombre}` : (r.proyectoId && r.proyectoId.toString().startsWith('PENDING') ? 'Proyecto Pendiente' : '-');
            }

            return `
                                    <tr>
                                        <td class="font-bold">${r.nombre}</td>
                                        <td><span class="badge badge-ghost">${r.tipo}</span></td>
                                        <td class="text-xs text-secondary">${parentName}</td>
                                        <td>${r.solicitadoPor}</td>
                                        <td>
                                            <span class="badge badge-${r.estado === 'pendiente' ? 'warning' : r.estado === 'aprobada' ? 'success' : 'error'}">
                                                ${r.estado}
                                            </span>
                                        </td>
                                        <td class="text-right">
                                            ${r.estado === 'pendiente' ? `
                                                <div class="flex justify-end gap-2">
                                                    <button class="btn btn-icon btn-ghost text-red-500" onclick="DesarrolloModule.processRequest(${r.id}, 'rechazada')">
                                                        <i data-lucide="x-circle"></i>
                                                    </button>
                                                    <button class="btn btn-icon btn-ghost text-green-500" onclick="DesarrolloModule.processRequest(${r.id}, 'aprobada')">
                                                        <i data-lucide="check-circle"></i>
                                                    </button>
                                                </div>
                                            ` : '<span class="text-xs text-tertiary">Procesada</span>'}
                                        </td>
                                    </tr>
                                `;
        }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    processRequest(id, status) {
        const requests = Store.get('projectRequests');
        const r = requests.find(item => item.id === id);
        if (!r) return;

        r.estado = status;

        if (status === 'aprobada') {
            if (r.tipo === 'proyecto') {
                const newProj = Store.add('proyectos', { areaId: r.areaId, nombre: r.nombre, estado: 'Activo', progreso: 0 });
                // Update tasks that were pointing to this pending ID
                const tasks = Store.get('tareas');
                tasks.forEach(t => {
                    if (t.proyectoId === `PENDING-${id}`) t.proyectoId = newProj.id;
                });
            } else if (r.tipo === 'subcarpeta') {
                const newFolder = Store.add('carpetas', { nombre: r.nombre, proyectoId: r.proyectoId });
                // Update tasks
                const tasks = Store.get('tareas');
                tasks.forEach(t => {
                    if (t.carpetaId === `PENDING-${id}`) t.carpetaId = newFolder.id;
                });
            }
        }

        Store.set('projectRequests', requests);
        Components.toast(`Solicitud ${status} correctamente`, status === 'aprobada' ? 'success' : 'info');
        this.render();
    },

    showRequestForm(tipo, parentId) {
        const title = tipo === 'proyecto' ? 'Solicitar Nuevo Proyecto' : 'Solicitar Nueva Subcarpeta';
        const label = tipo === 'proyecto' ? 'Nombre del Proyecto' : 'Nombre de la Subcarpeta';

        const { modal, close } = Components.modal({
            title,
            content: `
                <div class="form-group">
                    <label class="form-label">${label}</label>
                    <input type="text" id="req-name" class="form-input" placeholder="Ej: ${tipo === 'proyecto' ? 'Adquisición' : 'Planos Tec.'}">
                </div>
            `,
            footer: `
                <button class="btn btn-secondary" onclick="this.closest('.modal-backdrop').remove()">Cancelar</button>
                <button class="btn btn-primary" onclick="DesarrolloModule.submitRequest('${tipo}', ${parentId})">Enviar Solicitud</button>
            `
        });
    },

    submitRequest(tipo, parentId) {
        const name = document.getElementById('req-name').value;
        if (!name) return;

        Store.add('projectRequests', {
            tipo,
            nombre: name,
            [tipo === 'proyecto' ? 'areaId' : 'proyectoId']: parentId,
            solicitadoPor: Store.state.user.name,
            fecha: new Date().toISOString(),
            estado: 'pendiente'
        });

        Components.toast('Solicitud enviada para aprobación', 'warning');
        document.querySelector('.modal-backdrop').remove();
        this.render();
    },

    showTaskForm(id = null) {
        const task = id ? Store.find('tareas', id) : null;
        const areas = Store.get('areas');
        const proyectos = Store.get('proyectos');
        const carpetas = Store.get('carpetas');
        const empleados = Store.get('empleados');

        // Determinar área inicial
        const initialAreaId = task ? proyectos.find(p => p.id == task.proyectoId)?.areaId : this.currentArea;

        const { modal, close } = Components.modal({
            title: task ? 'Editar Tarea' : 'Nueva Tarea',
            size: 'lg',
            content: `
                <form id="task-detail-form">
                    <div class="grid grid-cols-2 gap-6">
                        <div class="form-group col-span-2">
                            <label class="form-label">Nombre de la Tarea</label>
                            <input type="text" name="titulo" class="form-input" value="${task?.titulo || ''}" required>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Área / Espacio</label>
                            <select name="areaId" class="form-select" id="task-edit-area" required>
                                <option value="">Seleccionar Área...</option>
                                ${areas.map(a => `<option value="${a.id}" ${initialAreaId == a.id ? 'selected' : ''}>${a.nombre}</option>`).join('')}
                            </select>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Proyecto</label>
                            <div class="flex gap-2">
                                <select name="proyectoId" class="form-select" id="task-edit-project" required>
                                    <option value="">Seleccionar Proyecto...</option>
                                    ${initialAreaId ? proyectos.filter(p => p.areaId == initialAreaId).map(p => `
                                        <option value="${p.id}" ${task?.proyectoId == p.id ? 'selected' : ''}>${p.nombre}</option>
                                    `).join('') : ''}
                                    <option value="NEW">+ Solicitar Proyecto</option>
                                </select>
                            </div>
                            <input type="text" id="new-project-input" name="newProjectName" class="form-input mt-2 hidden" placeholder="Nombre solicitado">
                        </div>

                        <div class="form-group">
                            <label class="form-label">Subcarpeta</label>
                            <select name="carpetaId" id="task-edit-folder" class="form-select">
                                <option value="">(Raíz del proyecto)</option>
                                ${task?.proyectoId ? carpetas.filter(c => c.proyectoId == task.proyectoId).map(c => `
                                    <option value="${c.id}" ${task?.carpetaId == c.id ? 'selected' : ''}>${c.nombre}</option>
                                `).join('') : ''}
                                <option value="NEW">+ Solicitar Subcarpeta</option>
                            </select>
                            <input type="text" id="new-folder-input" name="newFolderName" class="form-input mt-2 hidden" placeholder="Nombre solicitado">
                        </div>

                        <div class="form-group">
                            <label class="form-label">Estado</label>
                            <select name="estado" class="form-select">
                                <option value="todo" ${task?.estado === 'todo' ? 'selected' : ''}>Por Hacer</option>
                                <option value="in-progress" ${task?.estado === 'in-progress' ? 'selected' : ''}>En Progreso</option>
                                <option value="review" ${task?.estado === 'review' ? 'selected' : ''}>En Revisión</option>
                                <option value="done" ${task?.estado === 'done' ? 'selected' : ''}>Completado</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Encargado</label>
                            <select name="asignado" class="form-select" required>
                                <option value="">Seleccionar...</option>
                                ${empleados.map(e => `<option value="${e.nombre}" ${task?.asignado === e.nombre ? 'selected' : ''}>${e.nombre}</option>`).join('')}
                            </select>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Prioridad</label>
                            <select name="prioridad" class="form-select">
                                <option value="baja" ${task?.prioridad === 'baja' ? 'selected' : ''}>Baja</option>
                                <option value="media" ${task?.prioridad === 'media' ? 'selected' : ''}>Media</option>
                                <option value="alta" ${task?.prioridad === 'alta' ? 'selected' : ''}>Alta</option>
                            </select>
                        </div>

                        <div class="form-group">
                             <label class="form-label">Vencimiento</label>
                             <input type="date" name="fechaVencimiento" class="form-input" value="${task?.fechaVencimiento || ''}">
                        </div>

                        <div class="form-group col-span-2">
                             <label class="form-label">Carpeta Google Drive Asociada</label>
                             <div class="flex gap-2">
                                <div class="input-group-icon w-full">
                                    <i data-lucide="link" class="w-4 h-4 text-gray-400"></i>
                                    <input type="url" name="driveUrl" class="form-input pl-10" placeholder="https://drive.google.com/..." value="${task?.driveUrl || ''}">
                                </div>
                             </div>
                        </div>

                        <div class="form-group col-span-2">
                            <label class="form-label">Descripción</label>
                            <textarea name="descripcion" class="form-textarea" rows="3">${task?.descripcion || ''}</textarea>
                        </div>
                    </div>
                </form>
            `,
            footer: `
                <div class="flex justify-between w-full">
                    ${id ? `<button class="btn btn-ghost text-red-500" onclick="DesarrolloModule.deleteTask(${id}, close)">Eliminar Tarea</button>` : '<div></div>'}
                    <div class="flex gap-2">
                        <button class="btn btn-secondary" onclick="this.closest('.modal-backdrop').remove()">Cancelar</button>
                        <button class="btn btn-primary" id="save-task-btn">Guardar Cambios</button>
                    </div>
                </div>
            `
        });

        if (window.lucide) lucide.createIcons();

        // Lógica de cascada Área -> Proyecto -> Carpeta
        const areaSelect = document.getElementById('task-edit-area');
        const projectSelect = document.getElementById('task-edit-project');
        const folderSelect = document.getElementById('task-edit-folder');
        const newProjInput = document.getElementById('new-project-input');
        const newFoldInput = document.getElementById('new-folder-input');

        areaSelect.addEventListener('change', () => {
            const areaId = areaSelect.value;
            projectSelect.innerHTML = '<option value="">Seleccionar Proyecto...</option>';
            if (areaId) {
                proyectos.filter(p => p.areaId == areaId).forEach(p => {
                    projectSelect.innerHTML += `<option value="${p.id}">${p.nombre}</option>`;
                });
                projectSelect.innerHTML += '<option value="NEW">+ Solicitar Proyecto</option>';
            }
            folderSelect.innerHTML = '<option value="">(Raíz del proyecto)</option>';
        });

        projectSelect.addEventListener('change', () => {
            const projId = projectSelect.value;
            newProjInput.classList.toggle('hidden', projId !== 'NEW');
            folderSelect.innerHTML = '<option value="">(Raíz del proyecto)</option>';

            if (projId && projId !== 'NEW') {
                carpetas.filter(c => c.proyectoId == projId).forEach(c => {
                    folderSelect.innerHTML += `<option value="${c.id}">${c.nombre}</option>`;
                });
            }
            folderSelect.innerHTML += '<option value="NEW">+ Solicitar Subcarpeta</option>';
        });

        folderSelect.addEventListener('change', () => {
            newFoldInput.classList.toggle('hidden', folderSelect.value !== 'NEW');
        });

        document.getElementById('save-task-btn').addEventListener('click', () => {
            const form = document.getElementById('task-detail-form');
            if (!form.checkValidity()) { form.reportValidity(); return; }

            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            let finalProjId = data.proyectoId;
            let finalFoldId = data.carpetaId;

            // Handle Requests inside task form
            if (data.proyectoId === 'NEW') {
                const req = Store.add('projectRequests', {
                    tipo: 'proyecto', areaId: data.areaId, nombre: data.newProjectName,
                    solicitadoPor: Store.state.user.name, fecha: new Date().toISOString(), estado: 'pendiente'
                });
                finalProjId = `PENDING-${req.id}`;
            }

            if (data.carpetaId === 'NEW') {
                const req = Store.add('projectRequests', {
                    tipo: 'subcarpeta', proyectoId: finalProjId, nombre: data.newFolderName,
                    solicitadoPor: Store.state.user.name, fecha: new Date().toISOString(), estado: 'pendiente'
                });
                finalFoldId = `PENDING-${req.id}`;
            }

            if (id) {
                Store.update('tareas', id, { ...data, proyectoId: finalProjId, carpetaId: finalFoldId });
            } else {
                Store.add('tareas', {
                    ...data, proyectoId: finalProjId, carpetaId: finalFoldId,
                    estado: data.estado || 'todo', prioridad: data.prioridad || 'media',
                    fechaCreacion: new Date().toISOString()
                });
            }

            Components.toast('Operación finalizada correctamente', 'success');
            close();
            this.render();
        });
    },

    deleteTask(id, close) {
        if (confirm('¿Estás seguro de eliminar esta tarea?')) {
            Store.delete('tareas', id);
            close();
            this.render();
        }
    },

    renderLista() {
        const tasks = this.getFilteredTasks();
        return `
            <div class="card overflow-hidden">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Tarea</th>
                            <th>Asignado</th>
                            <th>Prioridad</th>
                            <th>Vencimiento</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tasks.map(t => `
                            <tr class="cursor-pointer hover:bg-gray-50" onclick="DesarrolloModule.showTaskForm(${t.id})">
                                <td class="font-bold">${t.titulo}</td>
                                <td><div class="flex items-center gap-2"><div class="avatar-sm">${Utils.getInitials(t.asignado)}</div> ${t.asignado}</div></td>
                                <td><span class="badge badge-${t.prioridad === 'alta' ? 'error' : t.prioridad === 'media' ? 'warning' : 'success'}">${t.prioridad}</span></td>
                                <td>${Utils.formatDate(t.fechaVencimiento)}</td>
                                <td><span class="badge badge-outline">${t.estado}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    renderReportes() {
        return `<div class="p-12 text-center text-secondary">Módulo de Reportes optimizado según la nueva jerarquía de Espacios.</div>`;
    },

    renderGantt() {
        return `<div class="p-12 text-center text-secondary">Cronograma Gantt interactivo filtrado por el espacio activo.</div>`;
    },

    renderCalendario() {
        return `<div class="p-12 text-center text-secondary">Vencimientos proyectados según objetivos del área.</div>`;
    }
};

window.DesarrolloModule = DesarrolloModule;
