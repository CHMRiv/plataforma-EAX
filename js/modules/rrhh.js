/* ==========================================================================
   EAX Platform - RRHH Module (Human Resources)
   ========================================================================== */

const RRHHModule = {
    currentTab: 'empleados',

    render() {
        const content = document.getElementById('page-content');
        const empleados = Store.get('empleados');

        // Initialize vacaciones data if not exists
        if (!Store.data.vacaciones) {
            Store.data.vacaciones = [
                { id: 1, empleadoId: 2, empleado: 'María González', fechaInicio: '2024-01-15', fechaFin: '2024-01-22', dias: 5, estado: 'Pendiente', motivo: 'Vacaciones familiares' },
                { id: 2, empleadoId: 3, empleado: 'Carlos Rodríguez', fechaInicio: '2024-02-01', fechaFin: '2024-02-05', dias: 3, estado: 'Pendiente', motivo: 'Viaje personal' }
            ];
        }

        // Initialize permisos data if not exists
        if (!Store.data.permisos) {
            Store.data.permisos = [
                { id: 1, empleadoId: 4, empleado: 'Luis Martínez', fecha: '2024-02-10', duracion: '4 horas', tipo: 'Trámite Personal', estado: 'Aprobado', motivo: 'Banco y Notaría' },
                { id: 2, empleadoId: 1, empleado: 'Juan Pérez', fecha: '2024-02-15', duracion: '1 día', tipo: 'Licencia Médica', estado: 'Aprobado', motivo: 'Control dental' }
            ];
        }

        content.innerHTML = `
            <div class="animate-fadeIn">
                ${Components.pageHeader({
            title: 'Recursos Humanos',
            subtitle: 'Gestión de personal y organización',
            actions: [
                { label: 'Nuevo Empleado', icon: 'user-plus', class: 'btn-primary', action: 'new-employee' }
            ]
        })}
                
                <div class="quick-stats">
                    ${Components.statCard({ icon: 'users', label: 'Total Empleados', value: empleados.length, iconClass: 'primary' })}
                    ${Components.statCard({ icon: 'user-check', label: 'Activos', value: empleados.filter(e => e.estado === 'Activo').length, iconClass: 'success' })}
                    ${Components.statCard({ icon: 'calendar', label: 'Ausencias Hoy', value: (Store.data.permisos || []).filter(p => p.fecha === new Date().toISOString().split('T')[0]).length, iconClass: 'warning' })}
                    ${Components.statCard({ icon: 'clock', label: 'Solicitudes Pendientes', value: (Store.data.vacaciones || []).filter(v => v.estado === 'Pendiente').length + (Store.data.permisos || []).filter(p => p.estado === 'Pendiente').length, iconClass: 'primary' })}
                </div>
                
                ${Components.tabs({
            tabs: [
                { id: 'empleados', label: 'Empleados', icon: 'users' },
                { id: 'organigrama', label: 'Organigrama', icon: 'git-branch' },
                { id: 'vacaciones', label: 'Vacaciones', icon: 'calendar' },
                { id: 'permisos', label: 'Permisos', icon: 'clock' },
                { id: 'seguridad', label: 'Accesos y Seguridad', icon: 'shield-check' }
            ],
            activeTab: this.currentTab
        })}
                
                <div id="rrhh-content"></div>
            </div>
        `;

        lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });
        this.attachEvents();
        this.renderTab(this.currentTab);
    },

    attachEvents() {
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.currentTab = tab.dataset.tab;
                this.renderTab(this.currentTab);
            });
        });

        document.querySelector('[data-action="new-employee"]')?.addEventListener('click', () => {
            this.showEmpleadoForm();
        });
    },

    renderTab(tab) {
        const container = document.getElementById('rrhh-content');

        switch (tab) {
            case 'empleados': this.renderEmpleados(container); break;
            case 'organigrama': this.renderOrganigrama(container); break;
            case 'vacaciones': this.renderVacaciones(container); break;
            case 'permisos': this.renderPermisos(container); break;
            case 'seguridad': this.renderSeguridad(container); break;
        }
    },

    renderSeguridad(container) {
        const empleados = Store.get('empleados');

        container.innerHTML = `
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h3 class="text-lg font-bold text-gray-900">Control de Accesos y Seguridad</h3>
                    <p class="text-sm text-gray-500">Gestione los permisos de plataforma por cada colaborador</p>
                </div>
                <div class="flex gap-2">
                    <button class="btn btn-secondary text-xs uppercase font-bold tracking-wider" id="reset-all-perms">
                        Restablecer Todos
                    </button>
                </div>
            </div>

            <div class="card bg-white shadow-sm overflow-hidden">
                <div class="card-body p-0">
                    <div class="overflow-x-auto">
                        <table class="w-full text-left bg-white border-collapse">
                            <thead>
                                <tr class="bg-gray-50 border-b border-gray-100">
                                    <th class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Colaborador</th>
                                    <th class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Cargo / Departamento</th>
                                    <th class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Módulos Activos</th>
                                    <th class="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Seguridad</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-50">
                                ${empleados.map(emp => {
            const perms = emp.permisos || {};
            const activeCount = Object.keys(perms).filter(k => perms[k]?.enabled).length;
            const dc = this._deptColor(emp.departamento);

            return `
                                        <tr class="hover:bg-gray-50/50 transition-colors">
                                            <td class="px-6 py-4">
                                                <div class="flex items-center gap-3">
                                                    <div class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm" style="background: ${dc.avatar}; color: white;">
                                                        ${Utils.getInitials(emp.nombre)}
                                                    </div>
                                                    <div>
                                                        <div class="font-bold text-gray-900">${emp.nombre}</div>
                                                        <div class="text-[11px] text-gray-400 font-medium">${emp.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td class="px-6 py-4">
                                                <div class="text-sm font-semibold text-gray-700">${emp.cargo}</div>
                                                <span class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-lg" style="background: ${dc.bg}; color: ${dc.text}">
                                                    ${emp.departamento}
                                                </span>
                                            </td>
                                            <td class="px-6 py-4 text-center">
                                                <span class="badge ${activeCount > 5 ? 'badge-success' : 'badge-primary'}">
                                                    ${activeCount} Módulos
                                                </span>
                                            </td>
                                            <td class="px-6 py-4 text-right">
                                                <button class="btn btn-light btn-sm btn-edit-perms group" data-id="${emp.id}">
                                                    <i data-lucide="key" class="w-4 h-4 mr-2 text-primary-500"></i>
                                                    Gestionar Accesos
                                                </button>
                                            </td>
                                        </tr>
                                    `;
        }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div class="mt-6 p-4 bg-primary-50 rounded-2xl border border-primary-100 flex items-start gap-4">
                <div class="p-2 bg-primary-500 text-white rounded-lg">
                    <i data-lucide="info" class="w-5 h-5"></i>
                </div>
                <div>
                    <h4 class="text-sm font-bold text-primary-900">Nota sobre Jerarquía de Permisos</h4>
                    <p class="text-xs text-primary-700 leading-relaxed mt-1">
                        Para habilitar el acceso a un submódulo específico, el colaborador debe poseer primero el permiso general del módulo raíz.
                        Si se deshabilita un módulo principal, todos sus submódulos asociados se restringirán automáticamente.
                    </p>
                </div>
            </div>
        `;

        if (window.lucide) lucide.createIcons();

        container.querySelectorAll('.btn-edit-perms').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                this.openPermissionsModal(id);
            });
        });
    },

    openPermissionsModal(employeeId) {
        const emp = Store.find('empleados', employeeId);
        if (!emp) return;

        if (!emp.permisos) emp.permisos = {};
        const structure = this._getModuleStructure();

        const { modal, close } = Components.modal({
            title: `Permisos de Acceso: ${emp.nombre}`,
            size: 'lg',
            content: `
                <div class="space-y-6 max-h-[70vh] overflow-y-auto pr-4 custom-scrollbar">
                    <div class="bg-primary-50 p-5 rounded-2xl mb-6 border border-primary-100 flex items-start gap-4">
                        <div class="p-2.5 bg-primary-500 text-white rounded-xl shadow-lg shadow-primary-200">
                            <i data-lucide="shield-check" class="w-5 h-5"></i>
                        </div>
                        <div>
                            <h4 class="text-sm font-bold text-primary-900">Panel de Seguridad</h4>
                            <p class="text-xs text-primary-700 leading-relaxed mt-1">
                                Defina los niveles de acceso para cada módulo. Los interruptores principales habilitan el módulo general, mientras que los secundarios controlan funciones específicas.
                            </p>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 gap-4">
                        ${structure.map(mod => {
                const modPerm = emp.permisos[mod.id] || { enabled: false, submodules: {} };

                return `
                                <div class="perm-card ${modPerm.enabled ? 'active' : ''}" id="card-${mod.id}">
                                    <div class="perm-header">
                                        <div class="perm-info">
                                            <div class="perm-icon">
                                                <i data-lucide="${mod.icon}" class="w-6 h-6"></i>
                                            </div>
                                            <div>
                                                <div class="perm-label">${mod.label}</div>
                                                <div class="perm-category">${mod.category}</div>
                                            </div>
                                        </div>
                                        <label class="eax-switch">
                                            <input type="checkbox" class="main-mod-toggle" data-mod="${mod.id}" ${modPerm.enabled ? 'checked' : ''}>
                                            <span class="switch-slider"></span>
                                        </label>
                                    </div>

                                    <div class="perm-subs" id="subs-${mod.id}">
                                        ${mod.submodules.map(sub => {
                    const subEnabled = modPerm.submodules && modPerm.submodules[sub.id];
                    return `
                                                <div class="sub-item">
                                                    <span class="sub-item-label">${sub.label}</span>
                                                    <label class="eax-switch sm">
                                                        <input type="checkbox" class="sub-mod-toggle" 
                                                            data-mod="${mod.id}" 
                                                            data-sub="${sub.id}"
                                                            ${subEnabled ? 'checked' : ''}>
                                                        <span class="switch-slider"></span>
                                                    </label>
                                                </div>
                                            `;
                }).join('')}
                                    </div>
                                </div>
                            `;
            }).join('')}
                    </div>
                </div>
            `,
            footer: `
                <button class="btn btn-secondary px-8" data-action="cancel">Cancelar</button>
                <button class="btn btn-primary px-10" data-action="save">Guardar Cambios</button>
            `
        });

        if (window.lucide) lucide.createIcons();

        // UI Event Listeners for dependency
        modal.querySelectorAll('.main-mod-toggle').forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                const modId = e.target.dataset.mod;
                const card = modal.querySelector(`#card-${modId}`);
                if (e.target.checked) {
                    card.classList.add('active');
                } else {
                    card.classList.remove('active');
                    card.querySelectorAll('.sub-mod-toggle').forEach(s => s.checked = false);
                }
            });
        });

        modal.querySelector('[data-action="cancel"]').onclick = close;
        modal.querySelector('[data-action="save"]').onclick = () => {
            const newPerms = {};

            modal.querySelectorAll('.main-mod-toggle').forEach(toggle => {
                const modId = toggle.dataset.mod;
                newPerms[modId] = {
                    enabled: toggle.checked,
                    submodules: {}
                };

                modal.querySelectorAll(`.sub-mod-toggle[data-mod="${modId}"]`).forEach(subToggle => {
                    newPerms[modId].submodules[subToggle.dataset.sub] = subToggle.checked;
                });
            });

            Store.update('empleados', emp.id, { permisos: newPerms });
            Components.toast(`Permisos actualizados para ${emp.nombre}`, 'success');
            close();
            this.renderSeguridad(document.getElementById('rrhh-content'));
        };
    },

    _getModuleStructure() {
        return [
            { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard', category: 'Principal', submodules: [{ id: 'metrics', label: 'Métricas' }, { id: 'reports', label: 'Reportes' }] },
            { id: 'crm', label: 'CRM', icon: 'users', category: 'Gestión Comercial', submodules: [{ id: 'clientes', label: 'Clientes' }, { id: 'pipeline', label: 'Embudos' }, { id: 'actividades', label: 'Actividades' }] },
            { id: 'comercial', label: 'Comercial', icon: 'calculator', category: 'Gestión Comercial', submodules: [{ id: 'cotizaciones', label: 'Cotizaciones' }, { id: 'configurador', label: 'Configurador' }, { id: 'precios', label: 'Listas de Precio' }] },
            { id: 'licitaciones', label: 'Ventas Públicas', icon: 'landmark', category: 'Gestión Comercial', submodules: [{ id: 'licitaciones', label: 'Licitaciones' }, { id: 'compras_agiles', label: 'Compras Ágiles' }] },
            { id: 'desarrollo', label: 'Desarrollo', icon: 'clipboard-list', category: 'Operaciones', submodules: [{ id: 'tareas', label: 'Tareas' }, { id: 'tablero', label: 'Tablero Kanban' }, { id: 'gantt', label: 'Gantt' }, { id: 'roadmap', label: 'Roadmap' }] },
            { id: 'inventario', label: 'Inventario', icon: 'package', category: 'Operaciones', submodules: [{ id: 'stock', label: 'Stock' }, { id: 'movimientos', label: 'Movimientos' }, { id: 'almacenes', label: 'Almacenes' }] },
            { id: 'pim', label: 'PIM', icon: 'database', category: 'Operaciones', submodules: [{ id: 'tech', label: 'Ficha Técnica' }, { id: 'mkt', label: 'Activos Marketing' }, { id: 'postventa_docs', label: 'Postventa Docs' }] },
            { id: 'postventa', label: 'Postventa', icon: 'life-buoy', category: 'Operaciones', submodules: [{ id: 'tickets', label: 'Tickets' }, { id: 'garantias', label: 'Garantías' }] },
            { id: 'rrhh', label: 'RRHH', icon: 'user-cog', category: 'Organización', submodules: [{ id: 'empleados', label: 'Empleados' }, { id: 'organigrama', label: 'Organigrama' }, { id: 'vacaciones', label: 'Vacaciones' }, { id: 'permisos', label: 'Permisos' }, { id: 'seguridad', label: 'Seguridad' }] },
            { id: 'comunicaciones', label: 'Comunicaciones', icon: 'message-square', category: 'Organización', submodules: [{ id: 'chat', label: 'Chat Interno' }, { id: 'anuncios', label: 'Anuncios' }] },
            { id: 'intranet', label: 'Intranet', icon: 'globe', category: 'Organización', submodules: [{ id: 'docs', label: 'Documentos' }, { id: 'noticias', label: 'Noticias' }] },
            { id: 'canvas', label: 'Canvas', icon: 'layout-grid', category: 'Estrategia', submodules: [{ id: 'negocio', label: 'Modelo de Negocio' }, { id: 'boards', label: 'Tableros Visuales' }] }
        ];
    },

    _deptColor(dept) {
        const colors = {
            'Dirección': { bg: '#fee2e2', text: '#991b1b', avatar: 'linear-gradient(135deg, #1e293b, #334155)' },
            'Comercial': { bg: '#dcfce7', text: '#166534', avatar: 'linear-gradient(135deg, #22c55e, #16a34a)' },
            'TI': { bg: '#dbeafe', text: '#1e40af', avatar: 'linear-gradient(135deg, #3b82f6, #2563eb)' },
            'Recursos Humanos': { bg: '#fef3c7', text: '#92400e', avatar: 'linear-gradient(135deg, #f59e0b, #d97706)' },
            'Operaciones': { bg: '#f3e8ff', text: '#6b21a8', avatar: 'linear-gradient(135deg, #a855f7, #9333ea)' }
        };
        return colors[dept] || { bg: '#f1f5f9', text: '#475569', avatar: 'linear-gradient(135deg, #94a3b8, #64748b)' };
    },

    renderEmpleados(container) {
        const empleados = Store.get('empleados');

        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <div class="flex gap-4">
                        ${Components.searchInput({ placeholder: 'Buscar empleados...', id: 'search-emp' })}
                        <select class="form-select" style="width: 180px;" id="filter-dept">
                            <option value="">Todos los departamentos</option>
                            ${[...new Set(empleados.map(e => e.departamento))].map(d => `<option value="${d}">${d}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div class="card-body">
                    <div class="grid grid-cols-3 gap-4" id="empleados-grid">
                        ${this.renderEmpleadoCards(empleados)}
                    </div>
                </div>
            </div>
        `;

        lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });
        this.attachEmpleadoEvents();

        document.getElementById('search-emp')?.addEventListener('input', Utils.debounce(() => this.filterEmpleados(), 300));
        document.getElementById('filter-dept')?.addEventListener('change', () => this.filterEmpleados());
    },

    _deptColor(dept) {
        const map = {
            'Dirección': { bg: '#ede9fe', text: '#6d28d9', avatar: 'linear-gradient(135deg,#7c3aed,#5b21b6)' },
            'Comercial': { bg: '#ecfdf5', text: '#059669', avatar: 'linear-gradient(135deg,#10b981,#047857)' },
            'TI': { bg: '#eff6ff', text: '#2563eb', avatar: 'linear-gradient(135deg,#3b82f6,#1d4ed8)' },
            'Recursos Humanos': { bg: '#fff7ed', text: '#c2410c', avatar: 'linear-gradient(135deg,#f97316,#ea580c)' },
            'Operaciones': { bg: '#fffbeb', text: '#b45309', avatar: 'linear-gradient(135deg,#f59e0b,#d97706)' },
            'Finanzas': { bg: '#fdf4ff', text: '#a21caf', avatar: 'linear-gradient(135deg,#d946ef,#a21caf)' },
        };
        return map[dept] || { bg: '#f1f5f9', text: '#475569', avatar: 'linear-gradient(135deg,#94a3b8,#64748b)' };
    },

    renderEmpleadoCards(empleados) {
        return empleados.map(emp => {
            const dc = this._deptColor(emp.departamento);
            const isActive = emp.estado === 'Activo';
            return `
            <div class="card" style="cursor:pointer;transition:all 0.2s;overflow:hidden;" data-emp-id="${emp.id}"
                 onmouseenter="this.style.boxShadow='0 8px 24px rgba(0,0,0,0.12)';this.style.transform='translateY(-2px)'"
                 onmouseleave="this.style.boxShadow='';this.style.transform=''">
                <!-- Colored top bar -->
                <div style="height:4px;background:${dc.avatar};"></div>
                <div class="card-body" style="padding:20px;">
                    <div style="display:flex;align-items:flex-start;gap:14px;">
                        <div style="width:52px;height:52px;border-radius:14px;background:${dc.avatar};display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;color:#fff;flex-shrink:0;position:relative;">
                            ${Utils.getInitials(emp.nombre)}
                            <div style="position:absolute;bottom:-2px;right:-2px;width:14px;height:14px;border-radius:50%;background:${isActive ? '#10b981' : '#94a3b8'};border:2px solid #fff;"></div>
                        </div>
                        <div style="flex:1;min-width:0;">
                            <div style="font-weight:700;font-size:14px;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${emp.nombre}</div>
                            <div style="font-size:12px;color:#64748b;margin-top:2px;">${emp.cargo}</div>
                            <span style="display:inline-block;margin-top:6px;padding:2px 10px;border-radius:20px;font-size:11px;font-weight:600;background:${dc.bg};color:${dc.text};">${emp.departamento}</span>
                        </div>
                    </div>
                    <div style="margin-top:16px;padding-top:14px;border-top:1px solid #f1f5f9;display:flex;flex-direction:column;gap:6px;">
                        <div style="display:flex;align-items:center;gap:8px;font-size:12px;color:#475569;">
                            <i data-lucide="mail" style="width:13px;height:13px;color:${dc.text};flex-shrink:0;"></i>
                            <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${emp.email}</span>
                        </div>
                        <div style="display:flex;align-items:center;gap:8px;font-size:12px;color:#475569;">
                            <i data-lucide="phone" style="width:13px;height:13px;color:${dc.text};flex-shrink:0;"></i>
                            ${emp.telefono}
                        </div>
                    </div>
                    <div style="margin-top:12px;display:flex;gap:8px;">
                        <button onclick="event.stopPropagation();ComunicacionesModule?.showNewMessageModal?.()" style="flex:1;border:1px solid #e2e8f0;background:#fff;border-radius:8px;padding:6px;cursor:pointer;font-size:11px;font-weight:500;color:#475569;display:flex;align-items:center;justify-content:center;gap:4px;" title="Mensaje directo">
                            <i data-lucide="message-circle" style="width:13px;height:13px;"></i> Mensaje
                        </button>
                        <button onclick="event.stopPropagation();RRHHModule.showEmpleadoDetail(${emp.id})" style="flex:1;border:1px solid #e2e8f0;background:#fff;border-radius:8px;padding:6px;cursor:pointer;font-size:11px;font-weight:500;color:#475569;display:flex;align-items:center;justify-content:center;gap:4px;">
                            <i data-lucide="eye" style="width:13px;height:13px;"></i> Ver ficha
                        </button>
                    </div>
                </div>
            </div>
            `;
        }).join('');
    },

    attachEmpleadoEvents() {
        document.querySelectorAll('[data-emp-id]').forEach(card => {
            card.addEventListener('click', () => this.showEmpleadoDetail(parseInt(card.dataset.empId)));
        });
    },

    filterEmpleados() {
        const search = document.getElementById('search-emp')?.value.toLowerCase() || '';
        const dept = document.getElementById('filter-dept')?.value || '';

        let empleados = Store.get('empleados');
        if (search) empleados = empleados.filter(e => e.nombre.toLowerCase().includes(search) || e.cargo.toLowerCase().includes(search));
        if (dept) empleados = empleados.filter(e => e.departamento === dept);

        const grid = document.getElementById('empleados-grid');
        grid.innerHTML = this.renderEmpleadoCards(empleados);

        lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });
        this.attachEmpleadoEvents();
    },

    showEmpleadoDetail(id) {
        const emp = Store.find('empleados', id);
        if (!emp) return;

        const { modal, close } = Components.modal({
            title: 'Ficha del Empleado',
            size: 'lg',
            content: `
                <div class="flex gap-8">
                    <div class="text-center">
                        <div class="avatar avatar-xl mx-auto">${Utils.getInitials(emp.nombre)}</div>
                        <h3 class="mt-4 font-semibold">${emp.nombre}</h3>
                        <p class="text-secondary">${emp.cargo}</p>
                        <span class="badge badge-${emp.estado === 'Activo' ? 'success' : 'secondary'} mt-2">${emp.estado}</span>
                    </div>
                    <div class="flex-1 grid grid-cols-2 gap-4">
                        <div class="p-4 bg-gray-50 rounded-lg">
                            <div class="text-sm text-secondary">Departamento</div>
                            <div class="font-medium">${emp.departamento}</div>
                        </div>
                        <div class="p-4 bg-gray-50 rounded-lg">
                            <div class="text-sm text-secondary">Fecha de Ingreso</div>
                            <div class="font-medium">${Utils.formatDate(emp.fechaIngreso)}</div>
                        </div>
                        <div class="p-4 bg-gray-50 rounded-lg">
                            <div class="text-sm text-secondary">Email</div>
                            <div class="font-medium">${emp.email}</div>
                        </div>
                        <div class="p-4 bg-gray-50 rounded-lg">
                            <div class="text-sm text-secondary">Teléfono</div>
                            <div class="font-medium">${emp.telefono}</div>
                        </div>
                    </div>
                </div>
            `,
            footer: `
                <button class="btn btn-danger" data-action="delete" style="margin-right: auto;">Eliminar</button>
                <button class="btn btn-secondary" data-action="cancel">Cerrar</button>
                <button class="btn btn-primary" data-action="edit">Editar</button>
            `
        });

        modal.querySelector('[data-action="cancel"]').addEventListener('click', close);
        modal.querySelector('[data-action="edit"]').addEventListener('click', () => {
            close();
            this.showEmpleadoForm(id);
        });
        modal.querySelector('[data-action="delete"]').addEventListener('click', async () => {
            const confirmed = await Components.confirm({
                title: 'Eliminar Empleado',
                message: `¿Estás seguro de que deseas eliminar a "${emp.nombre}"? Esta acción no se puede deshacer.`,
                confirmText: 'Eliminar',
                type: 'danger'
            });
            if (confirmed) {
                Store.delete('empleados', id);
                Components.toast('Empleado eliminado', 'success');
                close();
                this.render();
            }
        });
    },

    showEmpleadoForm(id = null) {
        const emp = id ? Store.find('empleados', id) : null;
        const isEdit = !!emp;

        const { modal, close } = Components.modal({
            title: isEdit ? 'Editar Empleado' : 'Nuevo Empleado',
            size: 'md',
            content: `
                <form id="emp-form">
                    <div class="grid grid-cols-2 gap-4">
                        ${Components.formInput({ label: 'Nombre Completo', name: 'nombre', value: emp?.nombre || '', required: true })}
                        ${Components.formInput({ label: 'Cargo', name: 'cargo', value: emp?.cargo || '', required: true })}
                        ${Components.formInput({
                label: 'Departamento', name: 'departamento', type: 'select', value: emp?.departamento || '',
                options: ['Dirección', 'Comercial', 'TI', 'Recursos Humanos', 'Operaciones', 'Finanzas'].map(d => ({ value: d, label: d }))
            })}
                        ${Components.formInput({
                label: 'Rol Jerárquico', name: 'nivelHierarquico', type: 'select', value: emp?.nivelHierarquico || '3',
                options: [
                    { value: '1', label: 'Gerente General / Director' },
                    { value: '2', label: 'Encargado / Jefe de Área' },
                    { value: '3', label: 'Operativo / Staff' }
                ]
            })}
                        ${Components.formInput({
                label: 'Estado', name: 'estado', type: 'select', value: emp?.estado || 'Activo',
                options: [{ value: 'Activo', label: 'Activo' }, { value: 'Inactivo', label: 'Inactivo' }]
            })}
                        ${Components.formInput({ label: 'Email', name: 'email', type: 'email', value: emp?.email || '', required: true })}
                        ${Components.formInput({ label: 'Teléfono', name: 'telefono', value: emp?.telefono || '' })}
                        ${Components.formInput({ label: 'Fecha de Ingreso', name: 'fechaIngreso', type: 'date', value: emp?.fechaIngreso || '' })}
                    </div>
                </form>
            `,
            footer: `
                <button class="btn btn-secondary" data-action="cancel">Cancelar</button>
                <button class="btn btn-primary" data-action="save">Guardar</button>
            `
        });

        modal.querySelector('[data-action="cancel"]').addEventListener('click', close);
        modal.querySelector('[data-action="save"]').addEventListener('click', () => {
            const form = document.getElementById('emp-form');
            if (!form.checkValidity()) { form.reportValidity(); return; }

            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            if (isEdit) {
                Store.update('empleados', id, data);
                Components.toast('Empleado actualizado', 'success');
            } else {
                Store.add('empleados', data);
                Components.toast('Empleado creado', 'success');
            }

            close();
            this.render();
        });
    },

    renderOrganigrama(container) {
        const empleados = Store.get('empleados');
        const byDept = Utils.groupBy(empleados, 'departamento');

        // Identify Level 1 (Direction)
        const leaders = empleados.filter(e => e.nivelHierarquico === '1') || [empleados[0]];
        const otherDepts = Object.keys(byDept).filter(d => d !== 'Dirección');

        container.innerHTML = `
            <div class="orgchart-container animate-fadeIn">
                <div class="org-tree">
                    <!-- TOP LEVEL: DIRECTION (Nivel 1) -->
                    <div class="org-row justify-center">
                        ${leaders.map(leader => `
                            <div class="org-card leader">
                                <div class="org-card-glow"></div>
                                <div class="org-card-content">
                                    <div class="org-card-avatar" style="background: linear-gradient(135deg, #1e293b, #334155);">
                                        ${Utils.getInitials(leader.nombre)}
                                    </div>
                                    <div class="org-card-info">
                                        <div class="org-card-name">${leader.nombre}</div>
                                        <div class="org-card-title">${leader.cargo}</div>
                                        <div class="org-card-dept">Alta Dirección</div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <div class="org-connector-v"></div>

                    <!-- MID LEVEL: DEPARTMENTS (Nivel 2 & 3) -->
                    <div class="org-row align-start">
                        ${otherDepts.map(dept => {
            const emps = byDept[dept];
            const deptLeads = emps.filter(e => e.nivelHierarquico === '2');
            const deptStaff = emps.filter(e => e.nivelHierarquico === '3');

            // If no Level 2, use the first employee as surrogate leader for layout
            const displayLeader = deptLeads.length > 0 ? deptLeads[0] : emps[0];
            const displayStaff = deptLeads.length > 0 ? emps.filter(e => e.id !== displayLeader.id) : emps.slice(1);

            const dc = this._deptColor(dept);

            return `
                                <div class="org-dept-branch">
                                    <div class="org-branch-connector"></div>
                                    
                                    <!-- Jefe de Área / Encargado (Nivel 2) -->
                                    <div class="org-card dept-lead" style="border-top: 3px solid ${dc.text}">
                                        <div class="org-card-content">
                                            <div class="org-card-avatar" style="background: ${dc.avatar}">
                                                ${Utils.getInitials(displayLeader.nombre)}
                                            </div>
                                            <div class="org-card-info">
                                                <div class="org-card-name">${displayLeader.nombre}</div>
                                                <div class="org-card-title">${displayLeader.cargo}</div>
                                                <div class="org-card-dept-badge" style="background: ${dc.bg}; color: ${dc.text}">${dept}</div>
                                            </div>
                                        </div>
                                    </div>

                                    ${displayStaff.length > 0 ? `
                                        <div class="org-connector-v sm"></div>
                                        
                                        <!-- Personal Operativo (Nivel 3) -->
                                        <div class="org-staff-group">
                                            ${displayStaff.map(s => `
                                                <div class="org-card staff">
                                                    <div class="org-card-content">
                                                        <div class="org-card-avatar-sm" style="background: ${dc.bg}; color: ${dc.text}">
                                                            ${Utils.getInitials(s.nombre)}
                                                        </div>
                                                        <div class="org-card-info">
                                                            <div class="org-card-name-sm">${s.nombre}</div>
                                                            <div class="org-card-title-sm">${s.cargo}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            `).join('')}
                                        </div>
                                    ` : ''}
                                </div>
                            `;
        }).join('')}
                    </div>
                </div>
            </div>
        `;

        if (window.lucide) lucide.createIcons();
    },

    renderVacaciones(container) {
        const empleados = Store.get('empleados');
        const vacaciones = Store.data.vacaciones || [];
        const pendientes = vacaciones.filter(v => v.estado === 'Pendiente');
        const historial = vacaciones.filter(v => v.estado !== 'Pendiente');

        container.innerHTML = `
            <div class="flex justify-end mb-4">
                <button class="btn btn-primary" data-action="request-vacation">
                    <i data-lucide="calendar-plus" style="width:16px;height:16px;margin-right:6px;"></i>
                    Solicitar Vacaciones
                </button>
            </div>
            <div class="grid grid-cols-2 gap-6">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Solicitudes Pendientes</h3>
                    </div>
                    <div class="card-body">
                        <div class="flex flex-col gap-3">
                            ${pendientes.length === 0 ? `
                                <div class="text-center py-6 text-secondary">
                                    <i data-lucide="check-circle" style="width:32px;height:32px;margin:0 auto 8px;display:block;opacity:0.5;"></i>
                                    No hay solicitudes pendientes
                                </div>
                            ` : pendientes.map(v => `
                                <div class="flex items-center gap-4 p-3 bg-warning-50 rounded-lg" data-vac-id="${v.id}">
                                    <div class="avatar">${Utils.getInitials(v.empleado)}</div>
                                    <div class="flex-1">
                                        <div class="font-medium">${v.empleado}</div>
                                        <div class="text-sm text-secondary">${Utils.formatDate(v.fechaInicio)} - ${Utils.formatDate(v.fechaFin)} (${v.dias} días)</div>
                                        ${v.motivo ? `<div class="text-xs text-tertiary mt-1">${v.motivo}</div>` : ''}
                                    </div>
                                    <div class="flex gap-2">
                                        <button class="btn btn-success btn-sm" data-action="approve-vacation" data-id="${v.id}">Aprobar</button>
                                        <button class="btn btn-secondary btn-sm" data-action="reject-vacation" data-id="${v.id}">Rechazar</button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                
                <div class="flex flex-col gap-6">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Resumen de Vacaciones</h3>
                        </div>
                        <div class="card-body">
                            <div class="flex flex-col gap-3">
                                ${empleados.slice(0, 5).map(emp => {
            const usados = vacaciones.filter(v => v.empleadoId === emp.id && v.estado === 'Aprobada').reduce((s, v) => s + v.dias, 0);
            const disponibles = 15 - usados;
            return `
                                    <div class="flex items-center gap-3">
                                        <div class="avatar avatar-sm">${Utils.getInitials(emp.nombre)}</div>
                                        <div class="flex-1">
                                            <div class="text-sm font-medium">${emp.nombre}</div>
                                            <div class="progress mt-1" style="height: 4px;">
                                                <div class="progress-bar primary" style="width: ${(usados / 15) * 100}%"></div>
                                            </div>
                                        </div>
                                        <div class="text-right">
                                            <div class="font-semibold">${disponibles} días</div>
                                            <div class="text-xs text-secondary">disponibles</div>
                                        </div>
                                    </div>
                                `}).join('')}
                            </div>
                        </div>
                    </div>
                    
                    ${historial.length > 0 ? `
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Historial</h3>
                        </div>
                        <div class="card-body">
                            <div class="flex flex-col gap-2">
                                ${historial.map(v => `
                                    <div class="flex items-center gap-3 p-2 rounded-lg">
                                        <div class="avatar avatar-sm">${Utils.getInitials(v.empleado)}</div>
                                        <div class="flex-1">
                                            <div class="text-sm font-medium">${v.empleado}</div>
                                            <div class="text-xs text-secondary">${Utils.formatDate(v.fechaInicio)} - ${Utils.formatDate(v.fechaFin)}</div>
                                        </div>
                                        <span class="badge badge-${v.estado === 'Aprobada' ? 'success' : 'error'}">${v.estado}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;

        lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });

        // Approve/Reject handlers
        document.querySelectorAll('[data-action="approve-vacation"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const vacId = parseInt(btn.dataset.id);
                const vac = (Store.data.vacaciones || []).find(v => v.id === vacId);
                if (vac) {
                    vac.estado = 'Aprobada';
                    Components.toast(`Vacaciones de ${vac.empleado} aprobadas`, 'success');
                    this.renderTab('vacaciones');
                }
            });
        });

        document.querySelectorAll('[data-action="reject-vacation"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const vacId = parseInt(btn.dataset.id);
                const vac = (Store.data.vacaciones || []).find(v => v.id === vacId);
                if (vac) {
                    vac.estado = 'Rechazada';
                    Components.toast(`Vacaciones de ${vac.empleado} rechazadas`, 'warning');
                    this.renderTab('vacaciones');
                }
            });
        });

        // Request vacation
        document.querySelector('[data-action="request-vacation"]')?.addEventListener('click', () => {
            this.showVacationRequestForm();
        });
    },

    showVacationRequestForm() {
        const empleados = Store.get('empleados');

        const { modal, close } = Components.modal({
            title: 'Solicitar Vacaciones',
            size: 'md',
            content: `
                <form id="vacation-form">
                    ${Components.formInput({
                label: 'Empleado', name: 'empleadoId', type: 'select', required: true,
                options: empleados.map(e => ({ value: e.id, label: e.nombre }))
            })}
                    <div class="grid grid-cols-2 gap-4">
                        ${Components.formInput({ label: 'Fecha Inicio', name: 'fechaInicio', type: 'date', required: true })}
                        ${Components.formInput({ label: 'Fecha Fin', name: 'fechaFin', type: 'date', required: true })}
                    </div>
                    ${Components.formInput({ label: 'Motivo', name: 'motivo', type: 'textarea' })}
                </form>
            `,
            footer: `
                <button class="btn btn-secondary" data-action="cancel">Cancelar</button>
                <button class="btn btn-primary" data-action="save">Enviar Solicitud</button>
            `
        });

        modal.querySelector('[data-action="cancel"]').addEventListener('click', close);
        modal.querySelector('[data-action="save"]').addEventListener('click', () => {
            const form = document.getElementById('vacation-form');
            if (!form.checkValidity()) { form.reportValidity(); return; }

            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            data.empleadoId = parseInt(data.empleadoId);

            const emp = Store.find('empleados', data.empleadoId);
            data.empleado = emp ? emp.nombre : 'Desconocido';
            data.estado = 'Pendiente';

            // Calculate days
            const start = new Date(data.fechaInicio);
            const end = new Date(data.fechaFin);
            data.dias = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1);
            data.id = Store._nextId++;

            if (!Store.data.vacaciones) Store.data.vacaciones = [];
            Store.data.vacaciones.push(data);

            Components.toast('Solicitud de vacaciones enviada', 'success');
            close();
            this.render();
        });
    },

    renderPermisos(container) {
        const permisos = Store.data.permisos || [];
        const empleados = Store.get('empleados');

        container.innerHTML = `
            <div class="flex justify-between items-center mb-6">
                <div>
                    <h3 class="text-lg font-bold text-gray-900">Gestión de Permisos y Ausencias</h3>
                    <p class="text-sm text-gray-500">Registro de salidas, licencias y trámites personales</p>
                </div>
                <button class="btn btn-primary" data-action="new-permiso">
                    <i data-lucide="clock-plus" style="width:16px;height:16px;margin-right:6px;"></i>
                    Nuevo Permiso
                </button>
            </div>

            <div class="card">
                <div class="card-body p-0">
                    ${Components.dataTable({
            columns: [
                { key: 'empleado', label: 'Empleado' },
                { key: 'fecha', label: 'Fecha' },
                { key: 'duracion', label: 'Duración' },
                { key: 'tipo', label: 'Tipo de Ausencial' },
                { key: 'motivo', label: 'Motivo Detallado' },
                { key: 'estado', label: 'Estado', type: 'badge' }
            ],
            data: permisos,
            actions: [
                { icon: 'check', label: 'Aprobar', action: 'approve-permiso' },
                { icon: 'x', label: 'Rechazar', action: 'reject-permiso' }
            ]
        })}
                </div>
            </div>

            <div class="grid grid-cols-3 gap-6 mt-6">
                <div class="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-center gap-4 shadow-sm">
                    <div class="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-blue-600">
                        <i data-lucide="stethoscope" style="width:20px;"></i>
                    </div>
                    <div>
                        <div class="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Licencias Médicas</div>
                        <div class="text-lg font-bold">${permisos.filter(p => p.tipo === 'Licencia Médica').length} este mes</div>
                    </div>
                </div>
                <div class="p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-center gap-4 shadow-sm">
                    <div class="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-amber-600">
                        <i data-lucide="briefcase" style="width:20px;"></i>
                    </div>
                    <div>
                        <div class="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Trámites Personales</div>
                        <div class="text-lg font-bold">${permisos.filter(p => p.tipo === 'Trámite Personal').length} este mes</div>
                    </div>
                </div>
                <div class="p-4 bg-purple-50 rounded-xl border border-purple-100 flex items-center gap-4 shadow-sm">
                    <div class="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-purple-600">
                        <i data-lucide="clock" style="width:20px;"></i>
                    </div>
                    <div>
                        <div class="text-[10px] font-bold text-purple-700 uppercase tracking-wider">Hrs Solicitadas</div>
                        <div class="text-lg font-bold">32.0 hrs</div>
                    </div>
                </div>
            </div>
        `;

        lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });

        container.querySelector('[data-action="new-permiso"]')?.addEventListener('click', () => this.showPermisoForm());

        container.querySelectorAll('[data-action="approve-permiso"]').forEach(btn => {
            btn.onclick = () => {
                const id = parseInt(btn.dataset.id);
                const p = permisos.find(x => x.id === id);
                if (p) {
                    p.estado = 'Aprobado';
                    Components.toast('Permiso aprobado', 'success');
                    this.renderTab('permisos');
                }
            };
        });

        container.querySelectorAll('[data-action="reject-permiso"]').forEach(btn => {
            btn.onclick = () => {
                const id = parseInt(btn.dataset.id);
                const p = permisos.find(x => x.id === id);
                if (p) {
                    p.estado = 'Rechazado';
                    Components.toast('Permiso rechazado', 'warning');
                    this.renderTab('permisos');
                }
            };
        });
    },

    showPermisoForm() {
        const empleados = Store.get('empleados');

        const { modal, close } = Components.modal({
            title: 'Solicitud de Permiso o Ausencia',
            size: 'md',
            content: `
                <form id="permiso-form" class="space-y-4">
                    ${Components.formInput({
                label: 'Empleado', name: 'empleadoId', type: 'select', required: true,
                options: empleados.map(e => ({ value: e.id, label: e.nombre }))
            })}
                    <div class="grid grid-cols-2 gap-4">
                        ${Components.formInput({ label: 'Fecha de Ausencia', name: 'fecha', type: 'date', required: true, value: new Date().toISOString().split('T')[0] })}
                        ${Components.formInput({ label: 'Duración Estimada', name: 'duracion', required: true, placeholder: 'ej: 4 horas, 1 día' })}
                    </div>
                    ${Components.formInput({
                label: 'Tipo/Motivo de Ausencia', name: 'tipo', type: 'select', required: true,
                options: [
                    { value: 'Trámite Personal', label: 'Trámite Personal' },
                    { value: 'Licencia Médica', label: 'Licencia Médica' },
                    { value: 'Urgencia Familiar', label: 'Urgencia Familiar' },
                    { value: 'Capacitación', label: 'Capacitación' },
                    { value: 'Compensación', label: 'Compensación' }
                ]
            })}
                    ${Components.formInput({ label: 'Detalles adicionales', name: 'motivo', type: 'textarea', placeholder: 'Breve explicación del trámite o motivo...' })}
                </form>
            `,
            footer: `
                <button class="btn btn-secondary" data-action="cancel">Cancelar</button>
                <button class="btn btn-primary" data-action="save">Registrar Solicitud</button>
            `
        });

        modal.querySelector('[data-action="cancel"]').addEventListener('click', close);
        modal.querySelector('[data-action="save"]').addEventListener('click', () => {
            const form = document.getElementById('permiso-form');
            if (!form.checkValidity()) { form.reportValidity(); return; }

            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            data.id = Date.now();
            data.empleadoId = parseInt(data.empleadoId);
            const emp = empleados.find(e => e.id === data.empleadoId);
            data.empleado = emp ? emp.nombre : 'Desconocido';
            data.estado = 'Pendiente';

            if (!Store.data.permisos) Store.data.permisos = [];
            Store.data.permisos.unshift(data);

            Components.toast('Permiso registrado correctamente', 'success');
            close();
            this.renderTab('permisos');
        });
    }
};

window.RRHHModule = RRHHModule;
