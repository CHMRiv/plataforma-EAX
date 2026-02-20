/* ==========================================================================
   Aura Platform - CRM Module
   ========================================================================== */

console.log('CRMModule: Script crm.js cargando...');

var CRMModule = window.CRMModule = {
    currentTab: 'clientes',

    render() {
        console.log('CRMModule: Invocando render...');
        const content = document.getElementById('page-content');
        if (!content) {
            console.error('CRMModule: No se encontró el contenedor page-content');
            return;
        }

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
            case 'negocios':
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

        let activeDetailTab = 'info';

        const renderDetailContent = (tab) => {
            switch (tab) {
                case 'info':
                    return `
                        <div class="space-y-6">
                            <div class="grid grid-cols-4 gap-4">
                                <div class="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <div class="text-[10px] uppercase font-bold text-gray-400 mb-1">Sector</div>
                                    <div class="font-bold text-gray-700">${cliente.sector}</div>
                                </div>
                                <div class="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <div class="text-[10px] uppercase font-bold text-gray-400 mb-1">RUT</div>
                                    <div class="font-bold text-gray-700">${cliente.rut}</div>
                                </div>
                                <div class="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <div class="text-[10px] uppercase font-bold text-gray-400 mb-1">Estado</div>
                                    <span class="badge badge-${Utils.getStatusColor(cliente.estado)}">${cliente.estado}</span>
                                </div>
                                <div class="p-4 bg-primary-50 rounded-xl border border-primary-100">
                                    <div class="text-[10px] uppercase font-bold text-primary-400 mb-1">Valor Histórico</div>
                                    <div class="font-bold text-primary-700">${Utils.formatCurrency(cliente.valor)}</div>
                                </div>
                            </div>

                            <div>
                                <div class="flex justify-between items-center mb-4">
                                    <h4 class="font-bold text-gray-800 flex items-center gap-2">
                                        <i data-lucide="contact" class="w-5 h-5 text-primary-500"></i> Directorio de Contactos
                                    </h4>
                                    <button class="btn btn-sm btn-primary" id="btn-add-contact">
                                        <i data-lucide="plus" class="w-3 h-3"></i> Agregar Contacto
                                    </button>
                                </div>
                                <div class="grid grid-cols-2 gap-4" id="contacts-list">
                                    ${(cliente.contactos || []).map(c => `
                                        <div class="p-4 border border-gray-100 rounded-xl bg-white hover:border-primary-200 transition-all group relative">
                                            <div class="flex items-start gap-3">
                                                <div class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
                                                    ${Utils.getInitials(c.nombre)}
                                                </div>
                                                <div class="flex-1 min-width-0">
                                                    <div class="font-bold text-gray-900 truncate">${c.nombre}</div>
                                                    <div class="text-xs text-primary-600 font-semibold mb-2">${c.cargo || 'Contacto'}</div>
                                                    <div class="space-y-1">
                                                        <div class="flex items-center gap-2 text-xs text-gray-500">
                                                            <i data-lucide="mail" class="w-3 h-3 text-gray-400"></i> ${c.email}
                                                        </div>
                                                        <div class="flex items-center gap-2 text-xs text-gray-500">
                                                            <i data-lucide="phone" class="w-3 h-3 text-gray-400"></i> ${c.telefono}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <button class="absolute top-2 right-2 p-1.5 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity btn-delete-contact" data-cid="${c.id}">
                                                <i data-lucide="trash-2" class="w-4 h-4"></i>
                                            </button>
                                        </div>
                                    `).join('')}
                                    ${(!cliente.contactos || cliente.contactos.length === 0) ? `
                                        <div class="col-span-2 p-8 border border-dashed rounded-xl text-center text-gray-400">
                                            No hay contactos registrados adicionales.
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    `;

                case 'negocios':
                    const oportunidades = Store.filter('oportunidades', o => o.clienteId === id);
                    return `
                        <div>
                            <div class="flex justify-between items-center mb-6">
                                <h4 class="font-bold text-gray-800">Historial de Negocios Comercial</h4>
                                <button class="btn btn-sm btn-outline" data-action="new-negocio-from-client" data-client-id="${id}" data-client-name="${cliente.nombre}">
                                    <i data-lucide="plus" class="w-4 h-4"></i> Nuevo Negocio
                                </button>
                            </div>
                            <div class="grid grid-cols-1 gap-3">
                                ${oportunidades.length > 0 ? oportunidades.map(op => `
                                    <div class="flex items-center gap-4 p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer" onclick="CRMModule.showNegocioDetail(${op.id})">
                                        <div class="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                            <i data-lucide="briefcase"></i>
                                        </div>
                                        <div class="flex-1">
                                            <div class="font-bold text-gray-900">${op.titulo}</div>
                                            <div class="text-xs text-gray-500">${Utils.formatDate(op.fechaCierre || new Date())} • Responsable: ${op.responsable}</div>
                                        </div>
                                        <div class="text-right">
                                            <div class="font-black text-gray-900">${Utils.formatCurrency(op.valor)}</div>
                                            <span class="badge ${op.etapa === 'ganada' ? 'badge-success' : 'badge-primary'} text-[10px] uppercase font-bold tracking-wider">${op.etapa}</span>
                                        </div>
                                    </div>
                                `).join('') : '<div class="text-center py-12 text-gray-400">No hay negocios registrados</div>'}
                            </div>
                        </div>
                    `;

                case 'ventas':
                    const vps = Store.filter('ventasPublicas', vp => {
                        const neg = Store.find('oportunidades', vp.negocioId);
                        return neg && neg.clienteId === id;
                    });
                    return `
                        <div>
                            <h4 class="font-bold text-gray-800 mb-6">Ventas Públicas Vinculadas (Licitaciones/CA)</h4>
                            <div class="grid grid-cols-1 gap-3">
                                ${vps.length > 0 ? vps.map(vp => `
                                    <div class="flex items-center gap-4 p-4 border border-gray-100 rounded-2xl hover:border-amber-200 transition-all bg-white shadow-sm">
                                        <div class="w-12 h-12 rounded-xl ${vp.modalidad === 'Compra Ágil' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'} flex items-center justify-center">
                                            <i data-lucide="${vp.modalidad === 'Compra Ágil' ? 'zap' : 'landmark'}"></i>
                                        </div>
                                        <div class="flex-1">
                                            <div class="font-bold text-gray-900">${vp.titulo}</div>
                                            <div class="text-xs text-gray-500">${vp.modalidad} • ${vp.entidad} • ${vp.idPortal || 'N/A'}</div>
                                        </div>
                                        <div class="text-right">
                                            <div class="font-black text-gray-900">${Utils.formatCurrency(vp.monto)}</div>
                                            <span class="badge badge-${Utils.getStatusColor(vp.estado)} text-[10px] lowercase">${vp.estado}</span>
                                        </div>
                                    </div>
                                `).join('') : '<div class="text-center py-12 text-gray-400">No existen licitaciones vinculadas a este cliente</div>'}
                            </div>
                        </div>
                    `;

                case 'tickets':
                    const tickets = (Store.data.servicios?.tickets || []).filter(t => t.clienteId === id);
                    return `
                        <div>
                            <h4 class="font-bold text-gray-800 mb-6">Casos y Tickets de Soporte (Solo Lectura)</h4>
                            <div class="grid grid-cols-1 gap-4">
                                ${tickets.length > 0 ? tickets.map(t => `
                                    <div class="p-5 border border-gray-100 rounded-2xl bg-white shadow-sm ring-1 ring-gray-50">
                                        <div class="flex justify-between items-start mb-4">
                                            <div>
                                                <div class="text-[10px] font-black text-primary-500 uppercase tracking-widest mb-1">${t.idDisplay}</div>
                                                <h5 class="font-bold text-gray-900">${t.asunto}</h5>
                                            </div>
                                            <span class="badge ${t.prioridad === 'Alta' ? 'badge-error' : 'badge-warning'}">${t.prioridad}</span>
                                        </div>
                                        <p class="text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg border-l-2 border-gray-200">${t.descripcion}</p>
                                        <div class="flex justify-between items-center pt-4 border-t border-gray-50">
                                            <div class="text-xs text-gray-500 flex items-center gap-2">
                                                <i data-lucide="user" class="w-3 h-3"></i> Asignado: <strong>${t.asignado}</strong>
                                            </div>
                                            <span class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${t.estado === 'Cerrado' ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700'}">
                                                ${t.estado}
                                            </span>
                                        </div>
                                    </div>
                                `).join('') : '<div class="text-center py-12 text-gray-400">No hay tickets de postventa registrados para este cliente</div>'}
                            </div>
                        </div>
                    `;
            }
        };

        const modalHTML = `
            <div class="animate-fadeIn">
                <!-- Header Brief -->
                <div class="flex items-center gap-6 mb-8 p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
                    <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-primary-200">
                        ${Utils.getInitials(cliente.nombre)}
                    </div>
                    <div>
                        <h2 class="text-2xl font-black text-gray-900">${cliente.nombre}</h2>
                        <div class="flex items-center gap-4 mt-1">
                            <span class="text-sm font-medium text-gray-500 flex items-center gap-1.5 italic">
                                <i data-lucide="map-pin" class="w-4 h-4"></i> ${cliente.sector}
                            </span>
                            <div class="w-1 h-1 rounded-full bg-gray-300"></div>
                            <span class="text-sm font-bold text-primary-600">${cliente.rut}</span>
                        </div>
                    </div>
                </div>

                <!-- Tabs -->
                <div class="flex gap-1 bg-gray-100 p-1.5 rounded-2xl mb-8 w-fit mx-auto">
                    <button class="px-6 py-2.5 rounded-xl text-sm font-black transition-all detail-tab-btn active" data-tab="info">
                        Información General
                    </button>
                    <button class="px-6 py-2.5 rounded-xl text-sm font-black transition-all detail-tab-btn" data-tab="negocios">
                        Negocios
                    </button>
                    <button class="px-6 py-2.5 rounded-xl text-sm font-black transition-all detail-tab-btn" data-tab="ventas">
                        Ventas Públicas
                    </button>
                    <button class="px-6 py-2.5 rounded-xl text-sm font-black transition-all detail-tab-btn" data-tab="tickets">
                        Postventa
                    </button>
                </div>

                <!-- Tab Content -->
                <div id="detail-tab-content" class="min-h-[400px]">
                    ${renderDetailContent('info')}
                </div>
            </div>
        `;

        const { modal, close } = Components.modal({
            title: 'Expediente 360 del Cliente',
            size: 'xl',
            content: modalHTML
        });

        if (window.lucide) lucide.createIcons();

        // Handle Detail Tabs
        modal.querySelectorAll('.detail-tab-btn').forEach(btn => {
            btn.onclick = () => {
                modal.querySelectorAll('.detail-tab-btn').forEach(b => b.classList.remove('active', 'bg-white', 'shadow-sm', 'text-primary-600'));
                btn.classList.add('active', 'bg-white', 'shadow-sm', 'text-primary-600');
                activeDetailTab = btn.dataset.tab;
                modal.querySelector('#detail-tab-content').innerHTML = renderDetailContent(activeDetailTab);
                if (window.lucide) lucide.createIcons();
                this._attachDetailEvents(modal, id, renderDetailContent, activeDetailTab);
            };
        });

        // Add specific styles for internal tabs if not exist
        if (!document.getElementById('detail-tabs-styles')) {
            const style = document.createElement('style');
            style.id = 'detail-tabs-styles';
            style.innerHTML = `
                .detail-tab-btn { color: #64748b; }
                .detail-tab-btn.active { color: var(--color-primary-600); }
            `;
            document.head.appendChild(style);
        }

        this._attachDetailEvents(modal, id, renderDetailContent, activeDetailTab);
    },

    _attachDetailEvents(modal, clientId, renderContent, currentTab) {
        // Business Action
        modal.querySelector('[data-action="new-negocio-from-client"]')?.onclick = (e) => {
            const clienteId = parseInt(e.currentTarget.dataset.clientId);
            const clienteName = e.currentTarget.dataset.clientName;
            // close current modal? The requirement doesn't specify, but usually yes to go to form
            // For now let's use the provided logic
            const currentClose = modal.querySelector('.modal-close');
            if (currentClose) currentClose.click();
            this.showOportunidadForm(null, { clienteId, cliente: clienteName });
        };

        // Add Contact
        modal.querySelector('#btn-add-contact')?.onclick = () => {
            const { modal: cModal, close: cClose } = Components.modal({
                title: 'Nuevo Contacto',
                size: 'md',
                content: `
                    <form id="new-contact-form" class="space-y-4">
                        ${Components.formInput({ label: 'Nombre Completo', name: 'nombre', required: true })}
                        ${Components.formInput({ label: 'Cargo', name: 'cargo' })}
                        ${Components.formInput({ label: 'Email', name: 'email', type: 'email', required: true })}
                        ${Components.formInput({ label: 'Teléfono', name: 'telefono' })}
                    </form>
                `,
                footer: `
                    <button class="btn btn-secondary" data-action="cancel">Cancelar</button>
                    <button class="btn btn-primary" data-action="save">Guardar Contacto</button>
                `
            });

            cModal.querySelector('[data-action="cancel"]').onclick = cClose;
            cModal.querySelector('[data-action="save"]').onclick = () => {
                const form = cModal.querySelector('#new-contact-form');
                if (!form.checkValidity()) { form.reportValidity(); return; }

                const formData = new FormData(form);
                const newContact = Object.fromEntries(formData.entries());
                newContact.id = Date.now();

                const cliente = Store.find('clientes', clientId);
                if (!cliente.contactos) cliente.contactos = [];
                cliente.contactos.push(newContact);
                Store.update('clientes', clientId, { contactos: cliente.contactos });

                cClose();
                Components.toast('Contacto agregado con éxito', 'success');
                // Refresh content if still on info tab
                if (currentTab === 'info') {
                    modal.querySelector('#detail-tab-content').innerHTML = renderContent('info');
                    if (window.lucide) lucide.createIcons();
                    this._attachDetailEvents(modal, clientId, renderContent, 'info');
                }
            };
        };

        // Delete Contact
        modal.querySelectorAll('.btn-delete-contact').forEach(btn => {
            btn.onclick = async () => {
                const confirmed = await Components.confirm({
                    title: 'Eliminar Contacto',
                    message: '¿Está seguro de eliminar este contacto de la empresa?'
                });
                if (confirmed) {
                    const cid = parseInt(btn.dataset.cid);
                    const cliente = Store.find('clientes', clientId);
                    cliente.contactos = cliente.contactos.filter(c => c.id !== cid);
                    Store.update('clientes', clientId, { contactos: cliente.contactos });

                    modal.querySelector('#detail-tab-content').innerHTML = renderContent('info');
                    if (window.lucide) lucide.createIcons();
                    this._attachDetailEvents(modal, clientId, renderContent, 'info');
                }
            };
        });
    },

    showNegocioDetail(id) {
        const negocio = Store.find('oportunidades', id);
        if (!negocio) return;

        let activeTab = 'actividades';

        const renderHistory = () => {
            const actividades = Store.filter('actividades', a => a.oportunidadId === id).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
            const correos = []; // Emails disabled

            // Merge and sort all interactions
            const interactions = [
                ...actividades.map(a => ({ ...a, interactionType: 'activity' })),
                ...correos.map(m => ({ ...m, interactionType: 'email' }))
            ].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

            if (interactions.length === 0) return `
                <div class="flex flex-col items-center justify-center py-20 text-gray-400 opacity-50">
                    <i data-lucide="history" class="w-16 h-16 mb-4"></i>
                    <p class="font-bold">No hay actividad registrada aún</p>
                    <p class="text-xs">Usa los botones superiores para registrar llamadas o correos.</p>
                </div>
            `;

            return `
                <div class="relative pl-8 border-l-2 border-gray-100 space-y-8 mt-4">
                    ${interactions.map(item => {
                if (item.interactionType === 'activity') {
                    const icon = item.tipo === 'llamada' ? 'phone' : item.tipo === 'reunion' ? 'users' : 'calendar';
                    return `
                                <div class="relative">
                                    <div class="absolute -left-[41px] top-0 w-8 h-8 rounded-full bg-white border-2 border-primary-500 flex items-center justify-center text-primary-500 shadow-sm z-10">
                                        <i data-lucide="${icon}" class="w-3.5 h-3.5"></i>
                                    </div>
                                    <div class="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                        <div class="flex justify-between items-start mb-2">
                                            <div>
                                                <div class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">${item.tipo} • ${Utils.formatRelativeTime(item.fecha)}</div>
                                                <h5 class="font-bold text-gray-900">${item.titulo}</h5>
                                            </div>
                                            <span class="badge ${item.completada ? 'badge-success' : 'badge-warning'} text-[10px] uppercase">${item.completada ? 'Completado' : 'Pendiente'}</span>
                                        </div>
                                        ${item.resultado ? `<div class="bg-gray-50 p-4 rounded-2xl text-sm text-gray-600 mt-2 border-l-4 border-primary-200">"${item.resultado}"</div>` : ''}
                                        <div class="mt-4 flex items-center gap-2 text-[10px] font-bold text-gray-400">
                                            <i data-lucide="user" class="w-3 h-3"></i> RESPONSABLE: ${item.responsable}
                                        </div>
                                    </div>
                                </div>
                            `;
                } else {
                    return `
                                <div class="relative">
                                    <div class="absolute -left-[41px] top-0 w-8 h-8 rounded-full bg-white border-2 border-amber-500 flex items-center justify-center text-amber-500 shadow-sm z-10">
                                        <i data-lucide="mail" class="w-3.5 h-3.5"></i>
                                    </div>
                                    <div class="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                        <div class="flex justify-between items-start mb-2">
                                            <div>
                                                <div class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">CORREO • ${Utils.formatRelativeTime(item.fecha)}</div>
                                                <h5 class="font-bold text-gray-900">${item.asunto}</h5>
                                            </div>
                                            <div class="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
                                                ${Utils.getInitials(item.de)}
                                            </div>
                                        </div>
                                        <div class="text-sm text-gray-600 line-clamp-3 my-3 leading-relaxed">
                                            ${item.cuerpo}
                                        </div>
                                        <div class="flex justify-between items-center pt-4 border-t border-gray-50">
                                            <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">DE: ${item.de}</span>
                                            <button class="text-xs font-bold text-amber-600 hover:underline" onclick="CRMModule.currentTab='inbox'; CRMModule.render(); CRMModule.viewMessage(${item.id}); Components.modal.closeAll();">Ver correo completo</button>
                                        </div>
                                    </div>
                                </div>
                            `;
                }
            }).join('')}
                </div>
            `;
        };

        const modalHTML = `
            <div class="flex flex-col h-full bg-gray-50/50 -m-6 animate-fadeIn" style="height: 80vh;">
                <!-- Modern Header HubSpot Style -->
                <div class="bg-white p-8 border-b border-gray-100 shadow-sm flex justify-between items-end">
                    <div class="space-y-4">
                        <div class="flex items-center gap-3">
                            <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center shadow-lg shadow-blue-200">
                                <i data-lucide="briefcase" class="w-6 h-6"></i>
                            </div>
                            <div>
                                <div class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Negocio Comercial</div>
                                <h2 class="text-2xl font-black text-gray-900">${negocio.titulo}</h2>
                            </div>
                        </div>
                        <div class="flex items-center gap-6">
                            <div class="flex flex-col">
                                <span class="text-[9px] font-bold text-gray-400 uppercase">Cliente</span>
                                <span class="text-sm font-bold text-gray-700">${negocio.cliente}</span>
                            </div>
                            <div class="w-px h-8 bg-gray-200"></div>
                            <div class="flex flex-col">
                                <span class="text-[9px] font-bold text-gray-400 uppercase">Valor</span>
                                <span class="text-sm font-black text-blue-600">${Utils.formatCurrency(negocio.valor)}</span>
                            </div>
                            <div class="w-px h-8 bg-gray-200"></div>
                            <div class="flex flex-col">
                                <span class="text-[9px] font-bold text-gray-400 uppercase">Etapa</span>
                                <span class="badge badge-${Utils.getStatusColor(negocio.etapa)} mt-1">${negocio.etapa.toUpperCase()}</span>
                            </div>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button class="btn btn-outline" onclick="CRMModule.showOportunidadForm(${negocio.id})"><i data-lucide="edit-3" class="w-4 h-4 mr-2"></i> Editar</button>
                        <button class="btn btn-primary shadow-lg shadow-primary-200"><i data-lucide="send" class="w-4 h-4 mr-2"></i> Enviar Cotización</button>
                    </div>
                </div>

                <div class="flex-1 grid grid-cols-12 gap-0 overflow-hidden">
                    <!-- Sidebar Left: Details -->
                    <div class="col-span-4 border-r border-gray-100 p-8 overflow-y-auto bg-white custom-scrollbar">
                        <div class="space-y-8">
                            <section>
                                <h4 class="text-[11px] font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <i data-lucide="info" class="w-3.5 h-3.5 text-blue-500"></i> Acerca de este negocio
                                </h4>
                                <div class="grid grid-cols-1 gap-4">
                                    ${Components.labelValue({ label: 'Probabilidad', value: `${negocio.probabilidad}%` })}
                                    ${Components.labelValue({ label: 'Fecha de Cierre', value: Utils.formatDate(negocio.fechaCierre || new Date()) })}
                                    ${Components.labelValue({ label: 'Propietario', value: negocio.responsable })}
                                </div>
                            </section>

                            <section>
                                <h4 class="text-[11px] font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <i data-lucide="landmark" class="w-3.5 h-3.5 text-amber-500"></i> Licitaciones Vinculadas
                                </h4>
                                ${(() => {
                const vps = Store.filter('ventasPublicas', vp => vp.negocioId === id);
                return vps.length > 0 ? vps.map(vp => `
                                        <div class="p-3 bg-gray-50 rounded-xl border border-gray-100 mb-2">
                                            <div class="font-bold text-xs text-gray-800 mb-1">${vp.titulo}</div>
                                            <div class="flex justify-between items-center text-[10px]">
                                                <span class="text-gray-500">${vp.idPortal || vp.entidad}</span>
                                                <span class="font-black text-blue-600">${Utils.formatCurrency(vp.monto)}</span>
                                            </div>
                                        </div>
                                    `).join('') : '<p class="text-xs text-gray-400 italic">No hay licitaciones vinculadas</p>';
            })()}
                            </section>
                        </div>
                    </div>

                    <!-- Right Main: Timeline/History -->
                    <div class="col-span-8 flex flex-col p-8 bg-gray-50/30 overflow-y-auto custom-scrollbar relative">
                        <!-- Interaction Bar -->
                        <div class="flex gap-1 bg-white p-1 rounded-2xl shadow-sm mb-8 sticky top-0 z-20 w-fit mx-auto border border-gray-100">
                            <button class="px-6 py-2 rounded-xl text-xs font-black transition-all hover:bg-gray-50 flex items-center gap-2" onclick="CRMModule.showActividadForm(null, { oportunidadId: ${id}, cliente: '${negocio.cliente.replace(/'/g, "\\'")}' })">
                                <i data-lucide="phone" class="w-3.5 h-3.5"></i> Llamada
                            </button>
                            <button class="px-6 py-2 rounded-xl text-xs font-black transition-all hover:bg-gray-50 flex items-center gap-2" onclick="CRMModule.showActividadForm(null, { oportunidadId: ${id}, cliente: '${negocio.cliente.replace(/'/g, "\\'")}' })">
                                <i data-lucide="mail" class="w-3.5 h-3.5"></i> Correo
                            </button>
                            <button class="px-6 py-2 rounded-xl text-xs font-black transition-all hover:bg-gray-50 flex items-center gap-2" onclick="CRMModule.showActividadForm(null, { oportunidadId: ${id}, cliente: '${negocio.cliente.replace(/'/g, "\\'")}' })">
                                <i data-lucide="users" class="w-3.5 h-3.5"></i> Reunión
                            </button>
                            <button class="px-6 py-2 rounded-xl text-xs font-black transition-all hover:bg-gray-50 flex items-center gap-2">
                                <i data-lucide="plus" class="w-3.5 h-3.5"></i> Nota
                            </button>
                        </div>

                        <div id="negocio-history">
                            ${renderHistory()}
                        </div>
                    </div>
                </div>
            </div>
        `;

        const { modal, close } = Components.modal({
            title: 'Expediente del Negocio',
            size: 'xl',
            content: modalHTML
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
            { id: 'ganada', name: 'Ganadas', color: '#10b981' },
            { id: 'perdida', name: 'Perdidas', color: '#ef4444' }
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
                this.filterNegocios();
            });
        });
    },

    showOportunidadForm(id = null, defaults = {}) {
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
            value: oportunidad?.clienteId || defaults.clienteId || '',
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

        // Calendar navigation
        document.querySelector('[data-action="cal-prev"]')?.addEventListener('click', () => {
            this._calMonth--;
            if (this._calMonth < 0) { this._calMonth = 11; this._calYear--; }
            const calBody = document.querySelector('.card-body.p-0');
            if (calBody) {
                calBody.innerHTML = this.renderCalendarWidget(Store.get('actividades'));
                if (window.lucide) lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });
                // Re-attach calendar nav
                this.renderTab('actividades');
            }
        });
        document.querySelector('[data-action="cal-next"]')?.addEventListener('click', () => {
            this._calMonth++;
            if (this._calMonth > 11) { this._calMonth = 0; this._calYear++; }
            const calBody = document.querySelector('.card-body.p-0');
            if (calBody) {
                calBody.innerHTML = this.renderCalendarWidget(Store.get('actividades'));
                if (window.lucide) lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });
                this.renderTab('actividades');
            }
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
                    <div class="timeline-description">${act.cliente}${act.responsable ? ` · <strong>${act.responsable}</strong>` : ''}</div>
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
        // Use stored calendar state or default to today
        if (!this._calYear || !this._calMonth && this._calMonth !== 0) {
            const today = new Date();
            this._calYear = today.getFullYear();
            this._calMonth = today.getMonth();
        }
        const year = this._calYear;
        const month = this._calMonth;
        const today = new Date();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const monthName = new Date(year, month).toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });

        let html = `
            <div class="p-4 bg-gray-50 border-b flex justify-between items-center">
                <button class="btn btn-ghost btn-sm" data-action="cal-prev"><i data-lucide="chevron-left" style="width:16px;height:16px;"></i></button>
                <span class="font-semibold" style="text-transform:capitalize;">${monthName}</span>
                <button class="btn btn-ghost btn-sm" data-action="cal-next"><i data-lucide="chevron-right" style="width:16px;height:16px;"></i></button>
            </div>
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
            const isToday = i === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            const hasActivity = actividades.some(a => a.fecha === dateStr);
            const acts = actividades.filter(a => a.fecha === dateStr);
            const hasPending = acts.some(a => !a.completada);

            let badgeStyle = 'width: 2rem; height: 2rem; margin: 0 auto; display: flex; align-items: center; justify-content: center; border-radius: 9999px;';
            let badgeClass = '';

            if (hasActivity) {
                if (hasPending) {
                    badgeClass = 'bg-primary-100 text-primary-600 font-bold';
                } else {
                    badgeClass = 'bg-success-100 text-success-600';
                }
            }
            if (isToday) {
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

    showActividadForm(id = null, defaults = {}) {
        const actividad = id ? Store.find('actividades', id) : null;
        const clientes = Store.get('clientes');
        const empleados = Store.get('empleados') || [];
        const oportunidades = Store.get('oportunidades') || [];
        const isEdit = !!actividad;

        // Pre-fill values from defaults or existing actividad
        const preCliente = actividad?.cliente || defaults.cliente || '';
        const preOportunidadId = actividad?.oportunidadId || defaults.oportunidadId || '';
        const preResponsable = actividad?.responsable || defaults.responsable || '';
        const clienteOpps = preCliente
            ? oportunidades.filter(o => o.cliente === preCliente)
            : oportunidades;

        const formContent = `
            <form id="actividad-form">
                <input type="hidden" name="oportunidadId" id="actividad-oportunidad-id" value="${preOportunidadId}">
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
                <div class="grid grid-cols-2 gap-4">
                    ${Components.formInput({
            label: 'Cliente',
            name: 'cliente',
            type: 'select',
            required: true,
            value: preCliente,
            options: clientes.map(c => ({ value: c.nombre, label: c.nombre }))
        })}
                    ${Components.formInput({
            label: 'Negocio Vinculado',
            name: 'negocio_selector',
            type: 'select',
            value: preOportunidadId,
            options: [{ value: '', label: '— Sin vincular —' }, ...clienteOpps.map(o => ({ value: o.id, label: o.titulo }))]
        })}
                </div>
                ${Components.formInput({
            label: 'Responsable / Encargado',
            name: 'responsable',
            type: 'select',
            required: true,
            value: preResponsable,
            options: empleados.map(e => ({ value: e.nombre, label: `${e.nombre} — ${e.cargo}` }))
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

        // When cliente changes, update negocio dropdown options
        const clienteSelect = modal.querySelector('[name="cliente"]');
        const negocioSelect = modal.querySelector('[name="negocio_selector"]');
        const hiddenOppId = document.getElementById('actividad-oportunidad-id');

        if (clienteSelect && negocioSelect) {
            clienteSelect.addEventListener('change', () => {
                const selectedCliente = clienteSelect.value;
                const filteredOpps = oportunidades.filter(o => o.cliente === selectedCliente);
                negocioSelect.innerHTML = `<option value="">— Sin vincular —</option>` +
                    filteredOpps.map(o => `<option value="${o.id}">${o.titulo}</option>`).join('');
                negocioSelect.value = '';
                if (hiddenOppId) hiddenOppId.value = '';
            });
        }

        // When negocio_selector changes, update hidden oportunidadId
        if (negocioSelect && hiddenOppId) {
            negocioSelect.addEventListener('change', () => {
                hiddenOppId.value = negocioSelect.value;
            });
        }

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
            data.completada = checkBox.checked;
            // Convert oportunidadId to number if present, otherwise null
            data.oportunidadId = data.oportunidadId ? parseInt(data.oportunidadId) : null;
            // Remove the helper selector field (not actual data)
            delete data.negocio_selector;

            if (isEdit) {
                Store.update('actividades', id, data);
            } else {
                Store.add('actividades', data);
            }

            Components.toast('Actividad guardada', 'success');
            close();
            this.renderTab(this.currentTab);
        });
    }
};

window.CRMModule = CRMModule;
console.log('CRMModule: Módulo cargado correctamente y listo.');
