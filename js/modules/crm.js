/* ==========================================================================
   EAX Platform - CRM Module
   ========================================================================== */

/* ==========================================================================
   EAX Platform - CRM Module
   ========================================================================== */

const CRMModule = {
    currentTab: 'clientes',

    render() {
        const content = document.getElementById('page-content');

        content.innerHTML = `
            <div class="animate-fadeIn">
                ${Components.pageHeader({
            title: 'CRM',
            subtitle: 'Gestión de clientes y negocios comerciales',
            actions: [
                { label: 'Exportar', icon: 'download', class: 'btn-outline', action: 'export' },
                { label: 'Nuevo Cliente', icon: 'plus', class: 'btn-primary', action: 'new-cliente' }
            ]
        })}
                
                ${Components.tabs({
            tabs: [
                { id: 'clientes', label: 'Clientes', icon: 'users' },
                { id: 'negocios', label: 'Negocios', icon: 'briefcase' },
                { id: 'actividades', label: 'Actividades', icon: 'calendar' }
            ],
            activeTab: this.currentTab
        })}
                
                <div id="crm-content"></div>
            </div>
        `;

        if (window.lucide) {
            lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });
        }
        this.attachTabEvents();
        this.renderTab(this.currentTab);
    },

    attachTabEvents() {
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.currentTab = tab.dataset.tab;
                this.renderTab(this.currentTab);
            });
        });

        document.querySelector('[data-action="new-cliente"]')?.addEventListener('click', () => {
            this.showClienteForm();
        });

        document.querySelector('[data-action="export"]')?.addEventListener('click', () => {
            const data = Store.get(this.currentTab === 'negocios' ? 'oportunidades' : this.currentTab);
            Utils.downloadCSV(data, `${this.currentTab}_${Date.now()}.csv`);
            Components.toast('Datos exportados correctamente', 'success');
        });
    },

    renderTab(tab) {
        const container = document.getElementById('crm-content');

        switch (tab) {
            case 'clientes':
                this.renderClientes(container);
                break;
            case 'negocios': // Renamed from oportunidades
                this.renderNegocios(container);
                break;
            case 'actividades':
                this.renderActividades(container);
                break;
        }
    },

    renderClientes(container) {
        const clientes = Store.get('clientes');

        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <div class="flex gap-4 items-center">
                        ${Components.searchInput({ placeholder: 'Buscar clientes...', id: 'search-clientes' })}
                        <select class="form-select" style="width: 180px;" id="filter-estado">
                            <option value="">Todos los estados</option>
                            <option value="Activo">Activo</option>
                            <option value="Prospecto">Prospecto</option>
                            <option value="Inactivo">Inactivo</option>
                        </select>
                    </div>
                </div>
                <div class="card-body p-0">
                    ${Components.dataTable({
            columns: [
                { key: 'nombre', label: 'Empresa' },
                { key: 'rut', label: 'RUT' },
                { key: 'sector', label: 'Sector' },
                { key: 'contacto', label: 'Contacto' },
                { key: 'email', label: 'Email' },
                { key: 'estado', label: 'Estado', type: 'badge' },
                { key: 'oportunidades', label: 'Negocios' },
                { key: 'valor', label: 'Valor Histórico', type: 'currency' }
            ],
            data: clientes,
            actions: [
                { icon: 'eye', label: 'Ver', action: 'view' },
                { icon: 'edit', label: 'Editar', action: 'edit' },
                { icon: 'trash-2', label: 'Eliminar', action: 'delete' }
            ]
        })}
                </div>
            </div>
        `;

        if (window.lucide) {
            lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });
        }
        this.attachClienteEvents();
    },

    attachClienteEvents() {
        // Search
        document.getElementById('search-clientes')?.addEventListener('input', Utils.debounce((e) => {
            this.filterClientes();
        }, 300));

        // Filter by estado
        document.getElementById('filter-estado')?.addEventListener('change', () => {
            this.filterClientes();
        });

        // Action buttons
        document.querySelectorAll('[data-action="view"]').forEach(btn => {
            btn.addEventListener('click', () => this.showClienteDetail(parseInt(btn.dataset.id)));
        });

        document.querySelectorAll('[data-action="edit"]').forEach(btn => {
            btn.addEventListener('click', () => this.showClienteForm(parseInt(btn.dataset.id)));
        });

        document.querySelectorAll('[data-action="delete"]').forEach(btn => {
            btn.addEventListener('click', async () => {
                const confirmed = await Components.confirm({
                    title: 'Eliminar Cliente',
                    message: '¿Estás seguro de que deseas eliminar este cliente? Esta acción no se puede deshacer.',
                    confirmText: 'Eliminar',
                    type: 'danger'
                });
                if (confirmed) {
                    Store.delete('clientes', parseInt(btn.dataset.id));
                    Components.toast('Cliente eliminado', 'success');
                    this.renderTab('clientes');
                }
            });
        });
    },

    filterClientes() {
        const searchTerm = document.getElementById('search-clientes')?.value || '';
        const estadoFilter = document.getElementById('filter-estado')?.value || '';

        let clientes = Store.get('clientes');

        if (searchTerm) {
            clientes = Utils.search(clientes, searchTerm, ['nombre', 'contacto', 'email', 'rut']);
        }

        if (estadoFilter) {
            clientes = clientes.filter(c => c.estado === estadoFilter);
        }

        const container = document.getElementById('crm-content');
        this.renderClientesTable(container, clientes);
    },

    renderClientesTable(container, clientes) {
        const tableContainer = container.querySelector('.card-body');
        tableContainer.innerHTML = Components.dataTable({
            columns: [
                { key: 'nombre', label: 'Empresa' },
                { key: 'rut', label: 'RUT' },
                { key: 'sector', label: 'Sector' },
                { key: 'contacto', label: 'Contacto' },
                { key: 'email', label: 'Email' },
                { key: 'estado', label: 'Estado', type: 'badge' },
                { key: 'oportunidades', label: 'Negocios' },
                { key: 'valor', label: 'Valor Histórico', type: 'currency' }
            ],
            data: clientes,
            actions: [
                { icon: 'eye', label: 'Ver', action: 'view' },
                { icon: 'edit', label: 'Editar', action: 'edit' },
                { icon: 'trash-2', label: 'Eliminar', action: 'delete' }
            ]
        });
        if (window.lucide) {
            lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });
        }
        this.attachClienteEvents();
    },

    showClienteForm(id = null) {
        const cliente = id ? Store.find('clientes', id) : null;
        const isEdit = !!cliente;

        const formContent = `
            <form id="cliente-form">
                <div class="grid grid-cols-2 gap-4">
                    ${Components.formInput({ label: 'Nombre Empresa', name: 'nombre', value: cliente?.nombre || '', required: true })}
                    ${Components.formInput({ label: 'RUT', name: 'rut', value: cliente?.rut || '', required: true })}
                    ${Components.formInput({
            label: 'Sector',
            name: 'sector',
            type: 'select',
            value: cliente?.sector || '',
            options: [
                { value: 'Minería', label: 'Minería' },
                { value: 'Manufactura', label: 'Manufactura' },
                { value: 'Construcción', label: 'Construcción' },
                { value: 'Tecnología', label: 'Tecnología' },
                { value: 'Agricultura', label: 'Agricultura' },
                { value: 'Otro', label: 'Otro' }
            ]
        })}
                    ${Components.formInput({
            label: 'Estado',
            name: 'estado',
            type: 'select',
            value: cliente?.estado || 'Prospecto',
            options: [
                { value: 'Prospecto', label: 'Prospecto' },
                { value: 'Activo', label: 'Activo' },
                { value: 'Inactivo', label: 'Inactivo' }
            ]
        })}
                    ${Components.formInput({ label: 'Contacto Principal', name: 'contacto', value: cliente?.contacto || '', required: true })}
                    ${Components.formInput({ label: 'Email', name: 'email', type: 'email', value: cliente?.email || '', required: true })}
                    ${Components.formInput({ label: 'Teléfono', name: 'telefono', value: cliente?.telefono || '' })}
                </div>
            </form>
        `;

        const { modal, close } = Components.modal({
            title: isEdit ? 'Editar Cliente' : 'Nuevo Cliente',
            size: 'lg',
            content: formContent,
            footer: `
                <button class="btn btn-secondary" data-action="cancel">Cancelar</button>
                <button class="btn btn-primary" data-action="save">
                    <i data-lucide="save"></i>
                    ${isEdit ? 'Guardar Cambios' : 'Crear Cliente'}
                </button>
            `
        });

        if (window.lucide) {
            lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });
        }

        modal.querySelector('[data-action="cancel"]').addEventListener('click', close);
        modal.querySelector('[data-action="save"]').addEventListener('click', () => {
            const form = document.getElementById('cliente-form');
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            data.oportunidades = cliente?.oportunidades || 0;
            data.valor = cliente?.valor || 0;

            if (isEdit) {
                Store.update('clientes', id, data);
                Components.toast('Cliente actualizado', 'success');
            } else {
                Store.add('clientes', data);
                Components.toast('Cliente creado', 'success');
            }

            close();
            this.renderTab('clientes');
        });
    },

    showClienteDetail(id) {
        const cliente = Store.find('clientes', id);
        if (!cliente) return;

        const oportunidades = Store.filter('oportunidades', o => o.clienteId === id);
        const actividades = Store.filter('actividades', a => a.cliente === cliente.nombre).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        const content = `
            <div class="flex flex-col gap-6" style="max-height: 80vh; overflow-y: auto;">
                <!-- Header Info -->
                <div class="flex gap-6">
                    <div class="flex-1">
                        <div class="flex items-center gap-4 mb-6">
                            <div class="avatar avatar-xl">${Utils.getInitials(cliente.nombre)}</div>
                            <div>
                                <h2 class="text-2xl font-semibold">${cliente.nombre}</h2>
                                <p class="text-secondary">${cliente.sector} • ${cliente.rut}</p>
                                <span class="badge badge-${Utils.getStatusColor(cliente.estado)} mt-2">${cliente.estado}</span>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-4 gap-4 mb-6">
                            <div class="p-4 bg-gray-50 rounded-lg">
                                <div class="text-sm text-secondary">Contacto</div>
                                <div class="font-medium">${cliente.contacto}</div>
                            </div>
                            <div class="p-4 bg-gray-50 rounded-lg">
                                <div class="text-sm text-secondary">Email</div>
                                <div class="font-medium">${cliente.email}</div>
                            </div>
                            <div class="p-4 bg-gray-50 rounded-lg">
                                <div class="text-sm text-secondary">Teléfono</div>
                                <div class="font-medium">${cliente.telefono || '-'}</div>
                            </div>
                            <div class="p-4 bg-gray-50 rounded-lg">
                                <div class="text-sm text-secondary">Valor Histórico</div>
                                <div class="font-medium">${Utils.formatCurrency(cliente.valor)}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- History Sections -->
                <div class="grid grid-cols-2 gap-6">
                    <!-- Business History -->
                    <div>
                        <h4 class="font-semibold mb-3 flex items-center gap-2">
                            <i data-lucide="briefcase"></i> Historial de Negocios
                        </h4>
                        ${oportunidades.length > 0 ? `
                            <div class="flex flex-col gap-2">
                                ${oportunidades.map(op => `
                                    <div class="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer" onclick="CRMModule.showNegocioDetail(${op.id})">
                                        <div class="flex-1">
                                            <div class="font-medium">${op.titulo}</div>
                                            <div class="text-xs text-secondary">${Utils.formatDate(op.fechaCierre || new Date())}</div>
                                        </div>
                                        <div class="text-right">
                                            <div class="font-medium text-sm">${Utils.formatCurrency(op.valor)}</div>
                                            <span class="badge badge-${Utils.getStatusColor(op.etapa)} ${op.etapa === 'ganada' ? 'bg-green-100 text-green-800' : ''}">${op.etapa}</span>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : '<div class="p-4 border border-dashed rounded-lg text-center text-secondary">No hay negocios registrados</div>'}
                    </div>

                    <!-- Activity History -->
                    <div>
                        <h4 class="font-semibold mb-3 flex items-center gap-2">
                            <i data-lucide="history"></i> Historial de Actividades
                        </h4>
                        ${actividades.length > 0 ? `
                            <div class="timeline" style="margin-top:0;">
                                ${actividades.map(act => `
                                    <div class="timeline-item">
                                        <div class="timeline-icon ${act.completada ? 'success' : 'primary'}">
                                            <i data-lucide="${act.tipo === 'llamada' ? 'phone' : act.tipo === 'reunion' ? 'users' : 'mail'}"></i>
                                        </div>
                                        <div class="timeline-content">
                                            <div class="timeline-title">${act.titulo}</div>
                                            <div class="timeline-description">${act.resultado || 'Sin detalles registrados'}</div>
                                            <div class="timeline-time">${Utils.formatDate(act.fecha)} - ${act.hora} ${act.completada ? '(Realizada)' : '(Pendiente)'}</div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : '<div class="p-4 border border-dashed rounded-lg text-center text-secondary">No hay actividades registradas</div>'}
                    </div>
                </div>
            </div>
        `;

        Components.modal({
            title: 'Detalle del Cliente',
            size: 'xl', // Increased size for better view
            content
        });

        if (window.lucide) {
            lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });
        }
    },

    showNegocioDetail(id) {
        const negocio = Store.find('oportunidades', id);
        if (!negocio) return;

        let actividades = Store.filter('actividades', a => a.oportunidadId === id);
        actividades.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        const content = `
            <div class="flex flex-col gap-6 h-full">
                <!-- Negocio Header -->
                <div class="bg-white p-6 rounded-xl border-l-4 border-blue-500 shadow-sm flex justify-between items-start">
                    <div>
                        <div class="text-sm text-secondary mb-1 flex items-center gap-2">
                            <i data-lucide="building-2" style="width:14px;"></i> ${negocio.cliente}
                        </div>
                        <h2 class="text-2xl font-bold text-gray-900 mb-2">${negocio.titulo}</h2>
                        <div class="flex items-center gap-4">
                            <span class="badge badge-${Utils.getStatusColor(negocio.etapa)}">${negocio.etapa.toUpperCase()}</span>
                            <span class="text-sm text-secondary"><i data-lucide="target" style="width:14px;display:inline;"></i> ${negocio.probabilidad}% Probabilidad</span>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-sm text-secondary mb-1">Valor Estimado</div>
                        <div class="text-3xl font-bold text-gray-900">${Utils.formatCurrency(negocio.valor)}</div>
                        <div class="text-sm text-secondary mt-1">Cierre: ${Utils.formatDate(negocio.fechaCierre || new Date())}</div>
                        <button class="btn btn-sm btn-outline mt-3" onclick="CRMModule.showOportunidadForm(${negocio.id})">
                             <i data-lucide="edit-2" style="width:14px;"></i> Editar
                        </button>
                    </div>
                </div>

                <!-- Activities Section -->
                <div class="flex-1 bg-gray-50 rounded-xl p-6 border border-gray-200 flex flex-col min-h-0">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="font-bold text-lg text-gray-800 flex items-center gap-2">
                             <i data-lucide="list-todo"></i> Actividades del Negocio
                        </h3>
                        <button class="btn btn-primary btn-sm" onclick="CRMModule.showActividadForm(null, { cliente: '${negocio.cliente}', oportunidadId: ${negocio.id} })">
                            <i data-lucide="plus"></i> Nueva Actividad
                        </button>
                    </div>
                    
                    <div class="flex-1 overflow-y-auto">
                        ${actividades.length > 0 ? `
                            <div class="space-y-3">
                                ${actividades.map(act => `
                                    <div class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onclick="CRMModule.showActividadForm(${act.id})">
                                        <div class="flex justify-between items-start mb-2">
                                            <div class="flex items-center gap-3">
                                                <div class="p-2 rounded-full ${act.completada ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}">
                                                    <i data-lucide="${act.tipo === 'llamada' ? 'phone' : act.tipo === 'reunion' ? 'users' : 'mail'}" style="width:16px;height:16px;"></i>
                                                </div>
                                                <div>
                                                    <div class="font-semibold text-gray-900">${act.titulo}</div>
                                                    <div class="text-xs text-secondary">${Utils.formatDate(act.fecha)} - ${act.hora}</div>
                                                </div>
                                            </div>
                                            ${act.completada
                ? '<span class="badge badge-success text-xs">Realizada</span>'
                : '<span class="badge badge-warning text-xs">Pendiente</span>'}
                                        </div>
                                        ${act.resultado ? `
                                            <div class="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-md border-l-2 border-gray-300">
                                                "${act.resultado}"
                                            </div>
                                        ` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        ` : `
                            <div class="h-full flex flex-col items-center justify-center text-secondary opacity-60">
                                <i data-lucide="calendar-x" style="width:48px;height:48px;margin-bottom:1rem;"></i>
                                <p>No hay actividades específicas para este negocio</p>
                            </div>
                        `}
                    </div>
                </div>
            </div>
        `;

        const { modal } = Components.modal({
            title: 'Detalle del Negocio',
            size: 'lg',
            content
        });

        if (window.lucide) {
            lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });
        }
    },

    renderNegocios(container) {
        const clientes = Store.get('clientes');

        container.innerHTML = `
            <div class="flex items-center justify-between mb-6">
                <div class="flex gap-4">
                    ${Components.searchInput({ placeholder: 'Buscar negocios...', id: 'search-opp' })}
                    
                    <div class="relative" style="width: 250px;">
                        <input type="text" 
                               class="form-input" 
                               id="filter-opp-cliente" 
                               list="clientes-list" 
                               placeholder="Filtrar por cliente...">
                        <datalist id="clientes-list">
                            ${clientes.map(c => `<option value="${c.nombre}">`).join('')}
                        </datalist>
                    </div>
                </div>
                <button class="btn btn-primary" data-action="new-opp">
                    <i data-lucide="plus"></i>
                    Nuevo Negocio
                </button>
            </div>
            
            <div class="kanban-board">
                <!-- Content loaded via filterNegocios -->
            </div>
        `;

        this.filterNegocios();
        this.attachOportunidadesEvents();
    },

    filterNegocios() {
        const searchTerm = document.getElementById('search-opp')?.value || '';
        const clienteFilter = document.getElementById('filter-opp-cliente')?.value || '';

        let oportunidades = Store.get('oportunidades');

        if (searchTerm) {
            oportunidades = Utils.search(oportunidades, searchTerm, ['titulo', 'cliente']);
        }

        if (clienteFilter) {
            // Precise match or partial match? Datalist allows free typing, so we might want loose matching or strict.
            // Usually strict for 'filtering', but user might type 'ABC' for 'Empresa ABC', so includes() is safer UX.
            oportunidades = oportunidades.filter(o => o.cliente.toLowerCase().includes(clienteFilter.toLowerCase()));
        }

        const container = document.querySelector('.kanban-board');
        if (container) this.renderKanbanBoard(container, oportunidades);
    },

    renderKanbanBoard(container, oportunidades) {
        const stages = [
            { id: 'calificacion', name: 'Calificación', color: '#94a3b8' },
            { id: 'propuesta', name: 'Propuesta', color: '#3b82f6' },
            { id: 'negociacion', name: 'Negociación', color: '#f59e0b' },
            { id: 'ganada', name: 'Ganadas', color: '#10b981' }
        ];

        container.innerHTML = stages.map(stage => {
            const stageOpps = oportunidades.filter(o => o.etapa === stage.id);
            const stageTotal = stageOpps.reduce((sum, o) => sum + o.valor, 0);
            return `
                <div class="kanban-column" data-stage="${stage.id}">
                    <div class="kanban-column-header">
                        <div class="kanban-column-title">
                            <span style="width:12px;height:12px;border-radius:50%;background:${stage.color}"></span>
                            ${stage.name}
                            <span class="kanban-column-count">${stageOpps.length}</span>
                        </div>
                        <div class="text-xs text-secondary">${Utils.formatCurrency(stageTotal)}</div>
                    </div>
                    <div class="kanban-column-body" data-stage="${stage.id}">
                        ${stageOpps.map(op => `
                            <div class="kanban-card" draggable="true" data-id="${op.id}">
                                <div class="kanban-card-title">${op.titulo}</div>
                                <div class="text-sm text-secondary mb-2">${op.cliente}</div>
                                <div class="kanban-card-footer">
                                    <div class="font-semibold">${Utils.formatCurrency(op.valor)}</div>
                                    <div class="avatar avatar-sm">${Utils.getInitials(op.responsable)}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('');

        if (window.lucide) {
            lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });
        }

        this.attachDragAndDropEvents();
    },

    attachOportunidadesEvents() {
        document.querySelector('[data-action="new-opp"]')?.addEventListener('click', () => {
            this.showOportunidadForm();
        });

        document.getElementById('search-opp')?.addEventListener('input', Utils.debounce(() => this.filterNegocios(), 300));
        // Use input event for real-time filtering with datalist
        document.getElementById('filter-opp-cliente')?.addEventListener('input', Utils.debounce(() => this.filterNegocios(), 300));
    },

    attachDragAndDropEvents() {
        const cards = document.querySelectorAll('.kanban-card');
        const columns = document.querySelectorAll('.kanban-column-body');

        cards.forEach(card => {
            card.addEventListener('dragstart', (e) => {
                card.classList.add('dragging');
                e.dataTransfer.setData('text/plain', card.dataset.id);
            });
            card.addEventListener('dragend', () => card.classList.remove('dragging'));
            card.addEventListener('click', () => this.showNegocioDetail(parseInt(card.dataset.id)));
        });

        columns.forEach(column => {
            column.addEventListener('dragover', (e) => {
                e.preventDefault();
                column.style.background = 'var(--color-primary-50)';
            });
            column.addEventListener('dragleave', () => column.style.background = '');
            column.addEventListener('drop', (e) => {
                e.preventDefault();
                column.style.background = '';
                const cardId = parseInt(e.dataTransfer.getData('text/plain'));
                const newStage = column.dataset.stage;
                Store.update('oportunidades', cardId, { etapa: newStage });
                Components.toast(`Negocio movido a ${newStage}`, 'success');
                this.filterNegocios(); // Refresh keeping filters
            });
        });
    },

    showOportunidadForm(id = null) {
        const oportunidad = id ? Store.find('oportunidades', id) : null;
        const clientes = Store.get('clientes');
        const isEdit = !!oportunidad;

        const formContent = `
            <form id="opp-form">
                ${Components.formInput({ label: 'Título del Negocio', name: 'titulo', value: oportunidad?.titulo || '', required: true })}
                ${Components.formInput({
            label: 'Cliente',
            name: 'clienteId',
            type: 'select',
            value: oportunidad?.clienteId || '',
            required: true,
            options: clientes.map(c => ({ value: c.id, label: c.nombre }))
        })}
                <div class="grid grid-cols-2 gap-4">
                    ${Components.formInput({ label: 'Valor Estimado', name: 'valor', type: 'number', value: oportunidad?.valor || '', required: true })}
                    ${Components.formInput({ label: 'Probabilidad (%)', name: 'probabilidad', type: 'number', value: oportunidad?.probabilidad || 50 })}
                    ${Components.formInput({
            label: 'Etapa',
            name: 'etapa',
            type: 'select',
            value: oportunidad?.etapa || 'calificacion',
            options: [
                { value: 'calificacion', label: 'Calificación' },
                { value: 'propuesta', label: 'Propuesta' },
                { value: 'negociacion', label: 'Negociación' },
                { value: 'ganada', label: 'Ganada' },
                { value: 'perdida', label: 'Perdida' }
            ]
        })}
                    ${Components.formInput({ label: 'Cierre Estimado', name: 'fechaCierre', type: 'date', value: oportunidad?.fechaCierre || '' })}
                </div>
                ${Components.formInput({ label: 'Responsable', name: 'responsable', value: oportunidad?.responsable || Store.state.user.name })}
            </form>
        `;

        const { modal, close } = Components.modal({
            title: isEdit ? 'Editar Negocio' : 'Nuevo Negocio',
            size: 'md',
            content: formContent,
            footer: `
                <button class="btn btn-secondary" data-action="cancel">Cancelar</button>
                <button class="btn btn-primary" data-action="save">Guardar</button>
            `
        });

        if (window.lucide) {
            lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });
        }

        modal.querySelector('[data-action="cancel"]').addEventListener('click', close);
        modal.querySelector('[data-action="save"]').addEventListener('click', () => {
            const form = document.getElementById('opp-form');
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            data.clienteId = parseInt(data.clienteId);
            data.valor = parseInt(data.valor);
            data.probabilidad = parseInt(data.probabilidad);
            data.cliente = clientes.find(c => c.id === data.clienteId)?.nombre || '';

            if (isEdit) {
                Store.update('oportunidades', id, data);
            } else {
                Store.add('oportunidades', data);
            }

            Components.toast(`Negocio ${isEdit ? 'actualizado' : 'creado'}`, 'success');

            close();
            this.renderTab('negocios');
        });
    },

    renderActividades(container) {
        const actividades = Store.get('actividades');
        // Sort by date desc
        actividades.sort((a, b) => new Date(b.fecha + 'T' + b.hora) - new Date(a.fecha + 'T' + a.hora));

        container.innerHTML = `
            <div class="grid grid-cols-3 gap-6">
                <!-- Activities List -->
                <div class="card" style="grid-column: span 2;">
                    <div class="card-header">
                        <h3 class="card-title">Listado de Actividades</h3>
                        <div class="flex gap-2">
                             <select class="form-select status-filter" style="width: auto; padding-right: 30px;">
                                <option value="all">Todas</option>
                                <option value="pending">Pendientes</option>
                                <option value="completed">Realizadas</option>
                            </select>
                            <button class="btn btn-primary btn-sm" data-action="new-actividad">
                                <i data-lucide="plus"></i>
                                Nueva
                            </button>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="timeline activity-list">
                            ${this.renderActivityItems(actividades)}
                        </div>
                    </div>
                </div>
                
                <!-- Calendar -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Calendario</h3>
                    </div>
                    <div class="card-body p-0">
                        ${this.renderCalendarWidget(actividades)}
                    </div>
                </div>
            </div>
        `;

        if (window.lucide) {
            lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });
        }

        // Event listeners for activities
        container.querySelector('.status-filter')?.addEventListener('change', (e) => {
            const val = e.target.value;
            let filtered = actividades;
            if (val === 'pending') filtered = actividades.filter(a => !a.completada);
            if (val === 'completed') filtered = actividades.filter(a => a.completada);
            container.querySelector('.activity-list').innerHTML = this.renderActivityItems(filtered);
            if (window.lucide) lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });

            // Re-attach click events for edits
            this.attachActivityItemEvents(container);
        });

        document.querySelector('[data-action="new-actividad"]')?.addEventListener('click', () => {
            this.showActividadForm();
        });

        this.attachActivityItemEvents(container);
    },

    renderActivityItems(actividades) {
        if (actividades.length === 0) return '<div class="text-center text-secondary py-4">No hay actividades.</div>';

        return actividades.map(act => `
            <div class="timeline-item cursor-pointer hover:bg-gray-50 p-2 rounded" data-id="${act.id}" title="Click para ver detalle/editar">
                <div class="timeline-icon ${act.completada ? 'success' : 'primary'}">
                    <i data-lucide="${act.tipo === 'llamada' ? 'phone' : act.tipo === 'reunion' ? 'users' : 'mail'}"></i>
                </div>
                <div class="timeline-content">
                    <div class="flex justify-between">
                        <div class="timeline-title">${act.titulo}</div>
                        ${act.completada
                ? '<span class="badge badge-success" style="font-size:10px;">Realizada</span>'
                : '<span class="badge badge-warning" style="font-size:10px;">Pendiente</span>'}
                    </div>
                    <div class="timeline-description">${act.cliente}</div>
                    ${act.resultado ? `<div class="text-sm text-gray-600 mt-1 italic">"${act.resultado}"</div>` : ''}
                    <div class="timeline-time">${Utils.formatDate(act.fecha)} - ${act.hora}</div>
                </div>
            </div>
        `).join('');
    },

    attachActivityItemEvents(container) {
        container.querySelectorAll('.timeline-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = parseInt(item.dataset.id);
                this.showActividadForm(id);
            });
        });
    },

    renderCalendarWidget(actividades) {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        let html = `
            <div class="p-4 bg-gray-50 border-b flex justify-between items-center">
                <span class="font-semibold">${today.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}</span>
            </div>
            <!-- Use inline styles for grid to ensure 7 columns -->
            <div style="display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; font-size: 0.75rem; padding: 0.5rem 0; color: var(--color-text-secondary);">
                <div>Do</div><div>Lu</div><div>Ma</div><div>Mi</div><div>Ju</div><div>Vi</div><div>Sa</div>
            </div>
            <div style="display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; font-size: 0.875rem;">
        `;

        for (let i = 0; i < firstDay.getDay(); i++) {
            html += `<div style="padding: 0.5rem;"></div>`;
        }

        for (let i = 1; i <= lastDay.getDate(); i++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const isToday = i === today.getDate();
            const hasActivity = actividades.some(a => a.fecha === dateStr);
            const acts = actividades.filter(a => a.fecha === dateStr);
            const hasPending = acts.some(a => !a.completada);

            let badgeStyle = 'width: 2rem; height: 2rem; margin: 0 auto; display: flex; align-items: center; justify-content: center; border-radius: 9999px;';
            let badgeClass = '';

            if (hasActivity) {
                if (hasPending) {
                    badgeClass = 'bg-primary-100 text-primary-600 font-bold';
                } else {
                    badgeClass = 'bg-success-100 text-success-600'; // Assuming success-100/600 classes exist, else use style
                }
            }
            if (isToday) {
                badgeClass = 'bg-primary-600 text-white font-bold';
                // If classes fail, use inline
                badgeStyle += ' background-color: var(--color-primary-600); color: white; font-weight: bold;';
            }

            html += `
                <div style="padding: 0.5rem;">
                    <div class="${badgeClass}" style="${badgeStyle}">
                        ${i}
                    </div>
                    ${hasActivity ? `<div style="width: 4px; height: 4px; background-color: currentColor; margin: 4px auto 0; border-radius: 50%;"></div>` : ''}
                </div>
            `;
        }

        html += `</div>`;
        return html;
    },

    showActividadForm(id = null) {
        const actividad = id ? Store.find('actividades', id) : null;
        const clientes = Store.get('clientes');
        const isEdit = !!actividad;

        const formContent = `
            <form id="actividad-form">
                ${Components.formInput({
            label: 'Tipo Actividad',
            name: 'tipo',
            type: 'select',
            required: true,
            value: actividad?.tipo || 'reunion',
            options: [
                { value: 'llamada', label: 'Llamada' },
                { value: 'reunion', label: 'Reunión' },
                { value: 'email', label: 'Email' }
            ]
        })}
                ${Components.formInput({ label: 'Asunto / Título', name: 'titulo', value: actividad?.titulo || '', required: true })}
                ${Components.formInput({
            label: 'Cliente',
            name: 'cliente',
            type: 'select',
            required: true,
            value: actividad?.cliente || '',
            options: clientes.map(c => ({ value: c.nombre, label: c.nombre }))
        })}
                <div class="grid grid-cols-2 gap-4">
                    ${Components.formInput({ label: 'Fecha', name: 'fecha', type: 'date', value: actividad?.fecha || new Date().toISOString().split('T')[0], required: true })}
                    ${Components.formInput({ label: 'Hora', name: 'hora', type: 'time', value: actividad?.hora || '10:00', required: true })}
                </div>
                
                <div class="mt-4 border-t pt-4">
                     <label class="flex items-center gap-2 mb-4 cursor-pointer">
                        <input type="checkbox" name="completada" id="check-completada" ${actividad?.completada ? 'checked' : ''} class="w-4 h-4">
                        <span class="font-medium">Marcar como Realizada</span>
                    </label>
                    
                    <div id="resultado-container" class="${actividad?.completada ? '' : 'hidden'}">
                        ${Components.formInput({
            label: 'Resultado / Notas de la actividad',
            name: 'resultado',
            type: 'textarea',
            value: actividad?.resultado || '',
            placeholder: 'Describe el resultado de la reunión o llamada...'
        })}
                    </div>
                </div>
            </form>
        `;

        const { modal, close } = Components.modal({
            title: isEdit ? 'Editar Actividad' : 'Nueva Actividad',
            size: 'md',
            content: formContent,
            footer: `
                <button class="btn btn-secondary" data-action="cancel">Cancelar</button>
                <button class="btn btn-primary" data-action="save">Guardar</button>
            `
        });

        // Toggle result field logic
        const checkBox = document.getElementById('check-completada');
        const resultContainer = document.getElementById('resultado-container');
        checkBox.addEventListener('change', (e) => {
            if (e.target.checked) {
                resultContainer.classList.remove('hidden');
            } else {
                resultContainer.classList.add('hidden');
            }
        });

        if (window.lucide) {
            lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });
        }

        modal.querySelector('[data-action="cancel"]').addEventListener('click', close);
        modal.querySelector('[data-action="save"]').addEventListener('click', () => {
            const form = document.getElementById('actividad-form');
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            data.completada = checkBox.checked; // Explicit check

            if (isEdit) {
                Store.update('actividades', id, data);
            } else {
                Store.add('actividades', data);
            }

            Components.toast('Actividad guardada', 'success');
            close();
            this.renderTab('actividades');
        });
    }
};

window.CRMModule = CRMModule;
