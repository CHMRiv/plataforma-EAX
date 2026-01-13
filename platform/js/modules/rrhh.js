/* ==========================================================================
   EAX Platform - RRHH Module (Human Resources)
   ========================================================================== */

const RRHHModule = {
    currentTab: 'empleados',

    render() {
        const content = document.getElementById('page-content');
        const empleados = Store.get('empleados');

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
                    ${Components.statCard({ icon: 'building', label: 'Departamentos', value: [...new Set(empleados.map(e => e.departamento))].length, iconClass: 'warning' })}
                    ${Components.statCard({ icon: 'calendar', label: 'Nuevos este mes', value: 2, iconClass: 'primary' })}
                </div>
                
                ${Components.tabs({
            tabs: [
                { id: 'empleados', label: 'Empleados', icon: 'users' },
                { id: 'organigrama', label: 'Organigrama', icon: 'git-branch' },
                { id: 'vacaciones', label: 'Vacaciones', icon: 'calendar' }
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
        }
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
                        ${empleados.map(emp => `
                            <div class="card cursor-pointer hover:shadow-lg transition-all" data-id="${emp.id}">
                                <div class="card-body">
                                    <div class="flex items-center gap-4">
                                        <div class="avatar avatar-lg">${Utils.getInitials(emp.nombre)}</div>
                                        <div class="flex-1">
                                            <div class="font-semibold">${emp.nombre}</div>
                                            <div class="text-sm text-secondary">${emp.cargo}</div>
                                            <span class="badge badge-primary mt-1">${emp.departamento}</span>
                                        </div>
                                    </div>
                                    <div class="mt-4 pt-4 border-t grid grid-cols-2 gap-2 text-sm">
                                        <div>
                                            <i data-lucide="mail" style="width:14px;height:14px;display:inline;"></i>
                                            ${emp.email}
                                        </div>
                                        <div>
                                            <i data-lucide="phone" style="width:14px;height:14px;display:inline;"></i>
                                            ${emp.telefono}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });

        document.querySelectorAll('[data-id]').forEach(card => {
            card.addEventListener('click', () => this.showEmpleadoDetail(parseInt(card.dataset.id)));
        });

        document.getElementById('search-emp')?.addEventListener('input', Utils.debounce(() => this.filterEmpleados(), 300));
        document.getElementById('filter-dept')?.addEventListener('change', () => this.filterEmpleados());
    },

    filterEmpleados() {
        const search = document.getElementById('search-emp')?.value.toLowerCase() || '';
        const dept = document.getElementById('filter-dept')?.value || '';

        let empleados = Store.get('empleados');
        if (search) empleados = empleados.filter(e => e.nombre.toLowerCase().includes(search) || e.cargo.toLowerCase().includes(search));
        if (dept) empleados = empleados.filter(e => e.departamento === dept);

        const grid = document.getElementById('empleados-grid');
        grid.innerHTML = empleados.map(emp => `
            <div class="card cursor-pointer hover:shadow-lg transition-all" data-id="${emp.id}">
                <div class="card-body">
                    <div class="flex items-center gap-4">
                        <div class="avatar avatar-lg">${Utils.getInitials(emp.nombre)}</div>
                        <div class="flex-1">
                            <div class="font-semibold">${emp.nombre}</div>
                            <div class="text-sm text-secondary">${emp.cargo}</div>
                            <span class="badge badge-primary mt-1">${emp.departamento}</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });
        document.querySelectorAll('[data-id]').forEach(card => {
            card.addEventListener('click', () => this.showEmpleadoDetail(parseInt(card.dataset.id)));
        });
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
                <button class="btn btn-secondary" data-action="cancel">Cerrar</button>
                <button class="btn btn-primary" data-action="edit">Editar</button>
            `
        });

        modal.querySelector('[data-action="cancel"]').addEventListener('click', close);
        modal.querySelector('[data-action="edit"]').addEventListener('click', () => {
            close();
            this.showEmpleadoForm(id);
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
            this.renderTab('empleados');
        });
    },

    renderOrganigrama(container) {
        const empleados = Store.get('empleados');
        const byDept = Utils.groupBy(empleados, 'departamento');

        container.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <div class="orgchart-container">
                        <div class="orgchart">
                            <!-- CEO Level -->
                            <div class="org-level">
                                <div class="org-node" style="border: 2px solid var(--color-primary-500);">
                                    <div class="org-avatar">${Utils.getInitials(empleados[0]?.nombre || 'CEO')}</div>
                                    <div class="org-name">${empleados[0]?.nombre || 'CEO'}</div>
                                    <div class="org-title">${empleados[0]?.cargo || 'Gerente General'}</div>
                                </div>
                            </div>
                            
                            <div class="org-connector"></div>
                            
                            <!-- Department Level -->
                            <div class="org-level">
                                ${Object.entries(byDept).slice(1, 5).map(([dept, emps]) => `
                                    <div class="org-node">
                                        <div class="org-avatar" style="background: linear-gradient(135deg, var(--color-secondary-400), var(--color-secondary-600));">${Utils.getInitials(emps[0]?.nombre || dept)}</div>
                                        <div class="org-name">${emps[0]?.nombre || 'N/A'}</div>
                                        <div class="org-title">${emps[0]?.cargo || ''}</div>
                                        <div class="org-department">${dept}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderVacaciones(container) {
        const empleados = Store.get('empleados');

        container.innerHTML = `
            <div class="grid grid-cols-2 gap-6">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Solicitudes Pendientes</h3>
                    </div>
                    <div class="card-body">
                        <div class="flex flex-col gap-3">
                            <div class="flex items-center gap-4 p-3 bg-warning-50 rounded-lg">
                                <div class="avatar">${Utils.getInitials('María González')}</div>
                                <div class="flex-1">
                                    <div class="font-medium">María González</div>
                                    <div class="text-sm text-secondary">15 - 22 Enero 2024</div>
                                </div>
                                <div class="flex gap-2">
                                    <button class="btn btn-success btn-sm">Aprobar</button>
                                    <button class="btn btn-secondary btn-sm">Rechazar</button>
                                </div>
                            </div>
                            <div class="flex items-center gap-4 p-3 bg-warning-50 rounded-lg">
                                <div class="avatar">${Utils.getInitials('Carlos Rodríguez')}</div>
                                <div class="flex-1">
                                    <div class="font-medium">Carlos Rodríguez</div>
                                    <div class="text-sm text-secondary">1 - 5 Febrero 2024</div>
                                </div>
                                <div class="flex gap-2">
                                    <button class="btn btn-success btn-sm">Aprobar</button>
                                    <button class="btn btn-secondary btn-sm">Rechazar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Resumen de Vacaciones</h3>
                    </div>
                    <div class="card-body">
                        <div class="flex flex-col gap-3">
                            ${empleados.slice(0, 5).map(emp => `
                                <div class="flex items-center gap-3">
                                    <div class="avatar avatar-sm">${Utils.getInitials(emp.nombre)}</div>
                                    <div class="flex-1">
                                        <div class="text-sm font-medium">${emp.nombre}</div>
                                    </div>
                                    <div class="text-right">
                                        <div class="font-semibold">15 días</div>
                                        <div class="text-xs text-secondary">disponibles</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
};

window.RRHHModule = RRHHModule;
