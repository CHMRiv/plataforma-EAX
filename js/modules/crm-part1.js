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
                { id: 'inbox', label: 'Bandeja de Entrada', icon: 'mail' },
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
            case 'inbox':
                this.renderInbox(container);
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
}; window.CRMModule = CRMModule;
