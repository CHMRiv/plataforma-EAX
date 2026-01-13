/* ==========================================================================
   EAX Platform - Desarrollo Module (Task Manager)
   ========================================================================== */

const DesarrolloModule = {
    currentView: 'kanban',
    currentProject: null,
    currentFolder: null,
    ganttMode: 'week', // 'week' | 'month'
    calendarState: null,

    render() {
        const content = document.getElementById('page-content');
        const proyectos = Store.get('proyectos');
        const carpetas = Store.get('carpetas') || [];

        content.innerHTML = `
            <div class="animate-fadeIn">
                ${Components.pageHeader({
            title: 'Desarrollo',
            subtitle: 'Gestión de proyectos y tareas',
            actions: [
                { label: 'Nueva Tarea', icon: 'plus', class: 'btn-primary', action: 'new-task' }
            ]
        })}
                
                <div class="flex gap-6 mb-6">
                    <!-- Projects Sidebar -->
                    <div class="card" style="width: 280px; flex-shrink: 0;">
                        <div class="card-header">
                            <h3 class="card-title">Proyectos</h3>
                            <button class="btn btn-ghost btn-icon" data-action="new-project">
                                <i data-lucide="plus"></i>
                            </button>
                        </div>
                        <div class="card-body p-2">
                            <div class="flex flex-col gap-1">
                                <button class="nav-link ${!this.currentProject ? 'active' : ''}" data-project="all" style="background: ${!this.currentProject ? 'var(--color-primary-50)' : ''}; color: ${!this.currentProject ? 'var(--color-primary-600)' : 'var(--color-gray-700)'};">
                                    <i data-lucide="layout-grid"></i>
                                    <span>Todas las Tareas</span>
                                </button>
                                ${proyectos.map(p => {
            const projectFolders = carpetas.filter(c => c.proyectoId === p.id);
            const isProjectActive = this.currentProject === p.id && !this.currentFolder;

            return `
                                    <div class="flex flex-col">
                                        <button class="nav-link ${isProjectActive ? 'active' : ''}" data-project="${p.id}" style="justify-content: space-between; background: ${isProjectActive ? 'var(--color-primary-50)' : ''}; color: ${isProjectActive ? 'var(--color-primary-600)' : 'var(--color-gray-700)'};">
                                            <div class="flex items-center gap-2">
                                                <i data-lucide="folder"></i>
                                                <span class="truncate" title="${p.nombre}">${p.nombre}</span>
                                            </div>
                                            <i data-lucide="plus-circle" class="w-4 h-4 text-gray-400 hover:text-primary-600 cursor-pointer" data-action="new-folder" data-project-id="${p.id}" title="Nueva carpeta"></i>
                                        </button>
                                        
                                        <!-- Subfolders -->
                                        ${projectFolders.length > 0 ? `
                                            <div class="flex flex-col gap-1 ml-6 pl-2 border-l border-gray-200 my-1">
                                                ${projectFolders.map(f => {
                const isFolderActive = this.currentFolder === f.id;
                return `
                                                    <button class="nav-link text-sm h-8 ${isFolderActive ? 'active' : ''}" data-folder="${f.id}" data-project-id="${p.id}" style="background: ${isFolderActive ? 'var(--color-primary-50)' : ''}; color: ${isFolderActive ? 'var(--color-primary-600)' : 'var(--color-gray-600)'};">
                                                        <i data-lucide="folder-open" class="w-3 h-3"></i>
                                                        <span class="truncate" title="${f.nombre}">${f.nombre}</span>
                                                    </button>
                                                `;
            }).join('')}
                                            </div>
                                        ` : ''}
                                    </div>
                                    `;
        }).join('')}
                            </div>
                        </div>
                    </div>
                    
                    <!-- Main Content -->
                    <div class="flex-1">
                        <!-- View Tabs -->
                        <div class="flex items-center justify-between mb-4">
                            <div class="flex gap-1 bg-gray-100 rounded-lg p-1">
                                ${['kanban', 'lista', 'gantt', 'calendario'].map(view => `
                                    <button class="btn ${this.currentView === view ? 'btn-secondary' : 'btn-ghost'} btn-sm view-btn" data-view="${view}">
                                        <i data-lucide="${this.getViewIcon(view)}"></i>
                                        ${view.charAt(0).toUpperCase() + view.slice(1)}
                                    </button>
                                `).join('')}
                            </div>
                            
                            <div class="flex gap-3">
                                ${Components.searchInput({ placeholder: 'Buscar tareas...', id: 'search-tasks' })}
                                <select class="form-select" style="width: 150px;" id="filter-priority">
                                    <option value="">Prioridad</option>
                                    <option value="alta">Alta</option>
                                    <option value="media">Media</option>
                                    <option value="baja">Baja</option>
                                </select>
                            </div>
                        </div>
                        
                        <div id="tasks-content"></div>
                    </div>
                </div>
            </div>
        `;

        // Re-initialize icons
        if (window.lucide) {
            lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });
        }

        this.attachEvents();
        this.renderView();
    },

    getViewIcon(view) {
        const icons = { kanban: 'columns', lista: 'list', gantt: 'bar-chart-2', calendario: 'calendar' };
        return icons[view] || 'grid';
    },

    attachEvents() {
        // View switcher
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.currentView = btn.dataset.view;
                document.querySelectorAll('.view-btn').forEach(b => {
                    b.classList.remove('btn-secondary');
                    b.classList.add('btn-ghost');
                });
                btn.classList.remove('btn-ghost');
                btn.classList.add('btn-secondary');
                this.renderView();
            });
        });

        // Project filter
        document.querySelectorAll('[data-project]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (e.target.closest('[data-action="new-folder"]')) return;
                this.currentProject = btn.dataset.project === 'all' ? null : parseInt(btn.dataset.project);
                this.currentFolder = null;
                this.render();
            });
        });

        // Folder filter
        document.querySelectorAll('[data-folder]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.currentFolder = parseInt(btn.dataset.folder);
                this.currentProject = parseInt(btn.dataset.projectId);
                this.render();
            });
        });

        // New task
        document.querySelector('[data-action="new-task"]')?.addEventListener('click', () => {
            this.showTaskForm();
        });

        // New project
        document.querySelector('[data-action="new-project"]')?.addEventListener('click', () => {
            this.showProjectForm();
        });

        // New folder action
        document.querySelectorAll('[data-action="new-folder"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const nombre = prompt('Nombre de la nueva carpeta:');
                if (nombre) {
                    const projectId = parseInt(btn.dataset.projectId);
                    const carpetas = Store.get('carpetas') || [];
                    const newId = carpetas.length > 0 ? Math.max(...carpetas.map(c => c.id)) + 1 : 1;
                    carpetas.push({ id: newId, nombre, proyectoId: projectId });
                    Store.set('carpetas', carpetas);
                    this.render();
                }
            });
        });

        // Search
        document.getElementById('search-tasks')?.addEventListener('input', Utils.debounce(() => {
            this.renderView();
        }, 300));

        // Priority filter
        document.getElementById('filter-priority')?.addEventListener('change', () => {
            this.renderView();
        });
    },

    getTasks() {
        let tareas = Store.get('tareas') || [];

        if (this.currentProject) {
            tareas = tareas.filter(t => t.proyectoId === this.currentProject);
        }

        if (this.currentFolder) {
            tareas = tareas.filter(t => t.carpetaId === this.currentFolder);
        }

        const searchTerm = document.getElementById('search-tasks')?.value;
        if (searchTerm) {
            tareas = Utils.search(tareas, searchTerm, ['titulo', 'proyecto']);
        }

        const priority = document.getElementById('filter-priority')?.value;
        if (priority) {
            tareas = tareas.filter(t => t.prioridad === priority);
        }

        return tareas;
    },

    renderView() {
        const container = document.getElementById('tasks-content');
        if (!container) return;
        container.innerHTML = '';

        if (this.currentView === 'kanban') {
            this.renderKanban(container);
        } else if (this.currentView === 'lista') {
            this.renderLista(container);
        } else if (this.currentView === 'gantt') {
            this.renderGantt(container);
        } else if (this.currentView === 'calendario') {
            this.renderCalendario(container);
        }
    },

    renderKanban(container) {
        const tareas = this.getTasks();
        const columns = [
            { id: 'todo', name: 'Por Hacer', color: '#94a3b8' },
            { id: 'in-progress', name: 'En Progreso', color: '#3b82f6' },
            { id: 'review', name: 'En Revisión', color: '#f59e0b' },
            { id: 'done', name: 'Completado', color: '#10b981' }
        ];

        container.innerHTML = `
            <div class="kanban-board">
                ${columns.map(col => {
            const colTasks = tareas.filter(t => t.estado === col.id);
            return `
                        <div class="kanban-column" data-status="${col.id}">
                            <div class="kanban-column-header">
                                <div class="kanban-column-title">
                                    <span style="width:12px;height:12px;border-radius:50%;background:${col.color}"></span>
                                    ${col.name}
                                    <span class="kanban-column-count">${colTasks.length}</span>
                                </div>
                                <div class="kanban-column-actions">
                                    <button data-action="add-task" data-status="${col.id}"><i data-lucide="plus"></i></button>
                                </div>
                            </div>
                            <div class="kanban-column-body" data-status="${col.id}">
                                ${colTasks.map(task => this.renderKanbanCard(task)).join('')}
                            </div>
                             <div class="p-2">
                                <button class="btn btn-ghost btn-sm w-full text-gray-500 hover:text-primary-600" data-action="add-task" data-status="${col.id}">
                                    <i data-lucide="plus" class="w-4 h-4 mr-2"></i>
                                    Agregar tarea
                                </button>
                             </div>
                        </div>
                    `;
        }).join('')}
            </div>
        `;

        lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });
        this.attachKanbanEvents();
    },

    renderKanbanCard(task) {
        const priorityColors = { alta: '#f43f5e', media: '#f59e0b', baja: '#10b981' };
        return `
            <div class="kanban-card" draggable="true" data-id="${task.id}">
                <div class="kanban-card-labels">
                    ${task.etiquetas?.map(et => `
                        <span class="kanban-card-label" style="background: var(--color-primary-100); color: var(--color-primary-700);">${et}</span>
                    `).join('') || ''}
                </div>
                <div class="kanban-card-title">${task.titulo}</div>
                <div class="kanban-card-footer">
                    <div class="kanban-card-meta">
                        <span style="color: ${priorityColors[task.prioridad] || '#94a3b8'};">
                            <i data-lucide="flag"></i>
                            ${task.prioridad}
                        </span>
                        ${task.fechaVencimiento ? `
                            <span>
                                <i data-lucide="calendar"></i>
                                ${Utils.formatDate(task.fechaVencimiento)}
                            </span>
                        ` : ''}
                    </div>
                    <div class="avatar avatar-sm">${Utils.getInitials(task.asignado || 'NA')}</div>
                </div>
            </div>
        `;
    },

    attachKanbanEvents() {
        const cards = document.querySelectorAll('.kanban-card');
        const columns = document.querySelectorAll('.kanban-column-body');

        cards.forEach(card => {
            card.addEventListener('dragstart', (e) => {
                card.classList.add('dragging');
                e.dataTransfer.setData('text/plain', card.dataset.id);
            });

            card.addEventListener('dragend', () => {
                card.classList.remove('dragging');
            });

            card.addEventListener('click', () => {
                this.showTaskForm(parseInt(card.dataset.id));
            });
        });

        columns.forEach(column => {
            column.addEventListener('dragover', (e) => {
                e.preventDefault();
                column.parentElement.style.background = 'var(--color-slate-50)';
            });

            column.addEventListener('dragleave', () => {
                column.parentElement.style.background = '';
            });

            column.addEventListener('drop', (e) => {
                e.preventDefault();
                column.parentElement.style.background = '';
                const taskId = parseInt(e.dataTransfer.getData('text/plain'));
                const newStatus = column.dataset.status;

                Store.update('tareas', taskId, { estado: newStatus });
                Components.toast('Tarea actualizada', 'success');
                this.renderView();
            });
        });

        document.querySelectorAll('[data-action="add-task"]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.showTaskForm(null, { estado: btn.dataset.status });
            });
        });
    },

    renderLista(container) {
        const tareas = this.getTasks();

        container.innerHTML = `
            <div class="card">
                <div class="card-body p-0">
                    ${Components.dataTable({
            columns: [
                { key: 'titulo', label: 'Tarea' },
                { key: 'proyecto', label: 'Proyecto' },
                { key: 'estado', label: 'Estado', type: 'badge' },
                { key: 'prioridad', label: 'Prioridad', type: 'badge' },
                { key: 'asignado', label: 'Asignado', type: 'avatar' },
                { key: 'fechaVencimiento', label: 'Vencimiento', type: 'date' }
            ],
            data: tareas,
            actions: [
                { icon: 'edit', label: 'Editar', action: 'edit' },
                { icon: 'trash-2', label: 'Eliminar', action: 'delete' }
            ]
        })}
                </div>
            </div>
        `;

        lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });

        document.querySelectorAll('[data-action="edit"]').forEach(btn => {
            btn.addEventListener('click', () => this.showTaskForm(parseInt(btn.dataset.id)));
        });

        document.querySelectorAll('[data-action="delete"]').forEach(btn => {
            btn.addEventListener('click', async () => {
                const confirmed = await Components.confirm({
                    title: 'Eliminar Tarea',
                    message: '¿Estás seguro de que deseas eliminar esta tarea?',
                    confirmText: 'Eliminar',
                    type: 'danger'
                });
                if (confirmed) {
                    Store.delete('tareas', parseInt(btn.dataset.id));
                    Components.toast('Tarea eliminada', 'success');
                    this.renderView();
                }
            });
        });
    },

    renderGantt(container) {
        const tareas = this.getTasks();
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 5);
        const daysToShow = 15;

        let headerHtml = '';
        for (let i = 0; i < daysToShow; i++) {
            const d = new Date(startDate);
            d.setDate(startDate.getDate() + i);
            const isToday = d.toDateString() === today.toDateString();
            headerHtml += `
                <div style="flex: 1; min-width: 60px; text-align: center; border-right: 1px solid #eee; padding: 5px; background: ${isToday ? '#eff6ff' : 'transparent'};">
                    <div style="font-size: 0.75rem; color: #64748b;">${d.toLocaleDateString('es-ES', { weekday: 'short' })}</div>
                    <div style="font-weight: bold; font-size: 0.875rem; color: ${isToday ? '#2563eb' : '#334155'};">${d.getDate()}</div>
                </div>
            `;
        }

        container.innerHTML = `
            <div class="card" style="height: 100%; display: flex; flex-direction: column; overflow: hidden;">
                <div style="padding: 16px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="font-weight: bold; display: flex; align-items: center; gap: 8px;">
                        <i data-lucide="bar-chart-2" style="color: #64748b;"></i>
                        Cronograma de Proyecto
                    </h3>
                    <div style="display: flex; gap: 8px;">
                         <button class="btn btn-sm btn-ghost" style="border: 1px solid #eee;">Hoy</button>
                    </div>
                </div>
                
                <div style="flex: 1; overflow: auto; position: relative;">
                    <!-- Header -->
                    <div style="display: flex; border-bottom: 1px solid #eee; position: sticky; top: 0; background: #fff; z-index: 10; width: max-content; min-width: 100%;">
                        <div style="width: 250px; padding: 12px; border-right: 1px solid #eee; font-weight: 600; font-size: 0.875rem; background: #f8fafc; position: sticky; left: 0; z-index: 20;">Tarea</div>
                        <div style="flex: 1; display: flex;">
                            ${headerHtml}
                        </div>
                    </div>

                    <!-- Body -->
                    <div style="width: max-content; min-width: 100%;">
                        ${tareas.map(t => {
            const start = t.fechaInicio ? new Date(t.fechaInicio) : new Date();
            const end = t.fechaVencimiento ? new Date(t.fechaVencimiento) : new Date();

            const diffStart = Math.ceil((start - startDate) / (1000 * 60 * 60 * 24));
            const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 1;

            let offset = diffStart;
            let width = duration;

            if (offset < 0) { width += offset; offset = 0; }
            if (offset + width > daysToShow) { width = daysToShow - offset; }

            if (width <= 0) return '';

            const statusColors = {
                'todo': '#94a3b8',
                'in-progress': '#3b82f6',
                'review': '#f59e0b',
                'done': '#10b981'
            };

            const leftPos = (offset * 100 / daysToShow) + '%';
            const widthPos = (width * 100 / daysToShow) + '%';

            return `
                                <div style="display: flex; border-bottom: 1px solid #eee; height: 48px; align-items: center;">
                                    <div style="width: 250px; min-width: 250px; padding: 0 12px; border-right: 1px solid #eee; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center; gap: 8px; font-size: 0.875rem; background: #fff; position: sticky; left: 0; z-index: 15;">
                                        <div style="width: 8px; height: 8px; border-radius: 50%; background: ${statusColors[t.estado]};"></div>
                                        ${t.titulo}
                                    </div>
                                    <div style="flex: 1; position: relative; height: 100%; display: flex;">
                                        ${Array(daysToShow).fill(0).map((_, i) => `
                                            <div style="flex: 1; border-right: 1px solid #f8fafc; height: 100%;"></div>
                                        `).join('')}
                                        
                                        <div style="position: absolute; top: 12px; height: 24px; left: ${leftPos}; width: ${widthPos}; background: ${statusColors[t.estado]}; border-radius: 4px; padding: 0 8px; display: flex; align-items: center; color: white; font-size: 0.75rem; overflow: hidden; white-space: nowrap; box-shadow: 0 1px 2px rgba(0,0,0,0.1); cursor: pointer;" title="${t.titulo}">
                                            ${width > 1 ? t.prioridad : ''}
                                        </div>
                                    </div>
                                </div>
                            `;
        }).join('')}
                    </div>
                </div>
            </div>
        `;
        lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });
    },

    renderCalendario(container) {
        const tareas = this.getTasks();
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();

        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

        let cells = '';

        for (let i = 0; i < startingDay; i++) {
            cells += `<div style="background: #f8fafc; border-right: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; min-height: 120px;"></div>`;
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const currentDate = new Date(year, month, i);
            const isToday = i === date.getDate();

            const dayTasks = tareas.filter(t => {
                if (!t.fechaInicio) return false;
                const start = new Date(t.fechaInicio);
                start.setHours(0, 0, 0, 0);
                const current = new Date(currentDate);
                current.setHours(0, 0, 0, 0);
                return current.getTime() === start.getTime();
            });

            cells += `
                <div style="background: white; border-right: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; min-height: 120px; padding: 8px; display: flex; flex-direction: column; gap: 4px; position: relative;">
                    <span style="font-size: 0.875rem; font-weight: 600; margin-bottom: 4px; ${isToday ? 'background: #2563eb; color: white; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border-radius: 50%;' : 'color: #334155;'}">
                        ${i}
                    </span>
                    
                    <div style="display: flex; flex-direction: column; gap: 4px; overflow-y: auto;">
                        ${dayTasks.map(t => {
                const colors = {
                    'todo': { bg: '#f1f5f9', text: '#334155' },
                    'in-progress': { bg: '#dbeafe', text: '#1e40af' },
                    'review': { bg: '#fef3c7', text: '#92400e' },
                    'done': { bg: '#d1fae5', text: '#065f46' }
                };
                const c = colors[t.estado] || colors['todo'];
                return `
                                <div style="font-size: 0.75rem; padding: 2px 6px; border-radius: 4px; background: ${c.bg}; color: ${c.text}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer;" title="${t.titulo}">
                                    ${t.titulo}
                                </div>
                            `;
            }).join('')}
                    </div>
                </div>
            `;
        }

        container.innerHTML = `
            <div class="card" style="height: 100%; display: flex; flex-direction: column;">
                 <div style="padding: 16px; border-bottom: 1px solid #eee; display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 16px;">
                        <h3 style="font-weight: bold; font-size: 1.25rem;">${monthNames[month]} <span style="font-weight: normal; color: #94a3b8;">${year}</span></h3>
                        <div style="display: flex; gap: 4px;">
                            <button class="btn btn-icon btn-sm btn-ghost"><i data-lucide="chevron-left"></i></button>
                            <button class="btn btn-icon btn-sm btn-ghost"><i data-lucide="chevron-right"></i></button>
                        </div>
                    </div>
                    <button class="btn btn-primary btn-sm">
                        <i data-lucide="plus"></i> Evento
                    </button>
                </div>
                 <div style="display: grid; grid-template-columns: repeat(7, 1fr); background: #f8fafc; border-bottom: 1px solid #eee;">
                    ${['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'].map(d =>
            `<div style="padding: 12px; text-align: center; font-size: 0.75rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">${d}</div>`
        ).join('')}
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(7, 1fr); background: #e2e8f0; gap: 1px; border-left: 1px solid #e2e8f0; overflow-y: auto;">
                    ${cells}
                </div>
            </div>
        `;
        lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });
    },

    showTaskForm(id = null, defaults = {}) {
        const tarea = id ? Store.find('tareas', id) : defaults;
        const isEdit = !!id;
        const proyectos = Store.get('proyectos') || [];

        const { modal, close } = Components.modal({
            title: isEdit ? 'Editar Tarea' : 'Nueva Tarea',
            size: 'lg',
            content: `
                <form id="task-form">
                    <div class="grid grid-cols-2 gap-4">
                        ${Components.formInput({ label: 'Título', name: 'titulo', value: tarea?.titulo || '', required: true, class: 'col-span-2' })}
                        
                        ${Components.formInput({
                label: 'Proyecto',
                name: 'proyectoId',
                type: 'select',
                value: tarea?.proyectoId || '',
                options: projectsToOptions(proyectos),
                required: true
            })}
                        
                        ${Components.formInput({
                label: 'Prioridad',
                name: 'prioridad',
                type: 'select',
                value: tarea?.prioridad || 'media',
                options: [
                    { value: 'alta', label: 'Alta' },
                    { value: 'media', label: 'Media' },
                    { value: 'baja', label: 'Baja' }
                ]
            })}
                        
                        ${Components.formInput({ label: 'Fecha Inicio', name: 'fechaInicio', type: 'date', value: tarea?.fechaInicio || new Date().toISOString().split('T')[0] })}
                        ${Components.formInput({ label: 'Fecha Vencimiento', name: 'fechaVencimiento', type: 'date', value: tarea?.fechaVencimiento || '' })}
                        
                        ${Components.formInput({ label: 'Asignado a', name: 'asignado', value: tarea?.asignado || '' })}
                        ${Components.formInput({
                label: 'Estado',
                name: 'estado',
                type: 'select',
                value: tarea?.estado || 'todo',
                options: [
                    { value: 'todo', label: 'Por hacer' },
                    { value: 'in-progress', label: 'En progreso' },
                    { value: 'review', label: 'Revisión' },
                    { value: 'done', label: 'Completado' }
                ]
            })}
                        
                        ${Components.formInput({ label: 'Descripción', name: 'descripcion', type: 'textarea', value: tarea?.descripcion || '', class: 'col-span-2', rows: 4 })}
                    </div>
                </form>
            `,
            footer: `
                <button class="btn btn-secondary" data-action="cancel">Cancelar</button>
                <button class="btn btn-primary" data-action="save">Guardar</button>
            `
        });

        function projectsToOptions(projs) {
            return projs.map(p => ({ value: p.id, label: p.nombre }));
        }

        modal.querySelector('[data-action="cancel"]').addEventListener('click', close);
        modal.querySelector('[data-action="save"]').addEventListener('click', () => {
            const form = document.getElementById('task-form');
            if (!form.checkValidity()) { form.reportValidity(); return; }

            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            data.proyectoId = parseInt(data.proyectoId);
            const project = Store.find('proyectos', data.proyectoId);
            data.proyecto = project ? project.nombre : '';

            if (isEdit) {
                Store.update('tareas', id, data);
                Components.toast('Tarea actualizada', 'success');
            } else {
                Store.add('tareas', data);
                Components.toast('Tarea creada', 'success');
            }

            close();
            this.renderView();
        });
    },

    showProjectForm() {
        const { modal, close } = Components.modal({
            title: 'Nuevo Proyecto',
            content: `
                <form id="project-form">
                    ${Components.formInput({ label: 'Nombre del Proyecto', name: 'nombre', required: true })}
                    ${Components.formInput({ label: 'Cliente', name: 'cliente', placeholder: 'Opcional' })}
                    ${Components.formInput({ label: 'Descripción', name: 'descripcion', type: 'textarea' })}
                </form>
            `,
            footer: `
                <button class="btn btn-secondary" data-action="cancel">Cancelar</button>
                <button class="btn btn-primary" data-action="save">Crear Proyecto</button>
            `
        });

        modal.querySelector('[data-action="cancel"]').addEventListener('click', close);
        modal.querySelector('[data-action="save"]').addEventListener('click', () => {
            const form = document.getElementById('project-form');
            if (!form.checkValidity()) { form.reportValidity(); return; }

            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            Store.add('proyectos', data);
            Components.toast('Proyecto creado', 'success');
            close();
            this.render();
        });
    }
};

window.DesarrolloModule = DesarrolloModule;
