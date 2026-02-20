/* ==========================================================================
   EAX Platform - Postventa and Services Module
   ========================================================================== */

const PostventaModule = {
    currentTab: 'servicios',

    render() {
        const content = document.getElementById('page-content');
        if (!content) return;

        content.innerHTML = `
            <div class="animate-fadeIn">
                ${Components.pageHeader({
            title: 'PostVenta y Servicios',
            subtitle: 'Gestión de soporte técnico, garantías y atención al cliente',
            actions: [
                { label: 'Nuevo Ticket', icon: 'plus', class: 'btn-primary', action: 'new-ticket' }
            ]
        })}
                
                ${Components.tabs({
            tabs: [
                { id: 'servicios', label: 'Servicios (Tickets)', icon: 'ticket' },
                { id: 'garantias', label: 'Gestión de Garantías', icon: 'shield-check' },
                { id: 'informacion', label: 'Información PostVenta', icon: 'info' }
            ],
            activeTab: this.currentTab
        })}

                <div id="postventa-content" class="mt-6">
                    <!-- Content rendered via renderTab -->
                </div>
            </div>
        `;

        this.attachEvents();
        this.renderTab(this.currentTab);
    },

    renderTab(tabId) {
        this.currentTab = tabId;
        const container = document.getElementById('postventa-content');
        if (!container) return;

        // Update active tab UI using platform standard class '.tab'
        document.querySelectorAll('.tab').forEach(tab => {
            if (tab.dataset.tab === tabId) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        switch (tabId) {
            case 'servicios':
                this.renderTickets(container);
                break;
            case 'garantias':
                this.renderGarantias(container);
                break;
            default:
                this.renderInfo(container);
                break;
        }
    },

    renderTickets(container) {
        const data = Store.get('servicios');
        const tickets = data.tickets || [];
        const metrics = data.metrics || {};

        container.innerHTML = `
            <!-- Metrics Grid -->
            <div class="grid grid-cols-4 gap-4 mb-6">
                ${Components.statCard({ icon: 'ticket', label: 'Tickets Abiertos', value: metrics.ticketsAbiertos, iconClass: 'primary' })}
                ${Components.statCard({ icon: 'clock', label: 'Tiempo Promedio', value: metrics.tiempoPromedio, iconClass: 'warning' })}
                ${Components.statCard({ icon: 'smile', label: 'Satisfacción', value: metrics.satisfaccion, iconClass: 'success' })}
                ${Components.statCard({ icon: 'trending-down', label: 'Tasa Falta', value: metrics.tasaFalta, iconClass: 'error' })}
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Tickets de Soporte</h3>
                </div>
                <div class="card-body p-0">
                    ${Components.dataTable({
            columns: [
                { key: 'idDisplay', label: 'ID' },
                { key: 'asunto', label: 'Asunto' },
                { key: 'cliente', label: 'Cliente' },
                { key: 'estado', label: 'Estado', type: 'badge' },
                { key: 'prioridad', label: 'Prioridad' },
                { key: 'asignado', label: 'Asignado' }
            ],
            data: tickets,
            actions: [
                { icon: 'eye', label: 'Ver Detalle', action: 'view-ticket' }
            ]
        })}
                </div>
            </div>
        `;

        // Attach specific table events
        container.querySelectorAll('[data-action="view-ticket"]').forEach(btn => {
            btn.onclick = () => this.showTicketModal(parseInt(btn.dataset.id));
        });

        if (window.lucide) lucide.createIcons();
    },

    renderGarantias(container) {
        const data = Store.get('servicios');
        const garantias = data.garantias || [];

        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Gestión de Garantías</h3>
                    <button class="btn btn-primary btn-sm" data-action="new-garantia">
                        <i data-lucide="shield-plus"></i> Activar Garantía
                    </button>
                </div>
                <div class="card-body p-0">
                    ${Components.dataTable({
            columns: [
                { key: 'equipo', label: 'Equipo' },
                { key: 'cliente', label: 'Cliente' },
                { key: 'fechaActivacion', label: 'Activación' },
                { key: 'vencimiento', label: 'Vencimiento' },
                { key: 'estado', label: 'Estado', type: 'badge' }
            ],
            data: garantias,
            actions: [
                { icon: 'edit-3', label: 'Editar', action: 'edit-garantia' },
                { icon: 'file-text', label: 'Acta', action: 'view-acta' }
            ]
        })}
                </div>
            </div>
        `;

        container.querySelector('[data-action="new-garantia"]')?.addEventListener('click', () => this.showGarantiaModal());

        container.querySelectorAll('[data-action="edit-garantia"]').forEach(btn => {
            btn.onclick = () => this.showGarantiaModal(parseInt(btn.dataset.id));
        });

        if (window.lucide) lucide.createIcons();
    },

    renderInfo(container) {
        const productos = Store.get('productos') || [];

        container.innerHTML = `
            <div class="animate-fadeIn">
                <div class="card mb-6">
                    <div class="card-body p-6">
                        <div class="flex items-center gap-4 mb-6">
                            <div class="w-12 h-12 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center shrink-0">
                                <i data-lucide="search" style="width:24px;"></i>
                            </div>
                            <div>
                                <h3 class="text-lg font-bold text-gray-900">Buscador de Equipos y Documentación</h3>
                                <p class="text-xs text-gray-500 font-medium uppercase tracking-wider">Consulta técnica de activos PIM</p>
                            </div>
                        </div>
                        
                        <div class="relative max-w-2xl">
                            <i data-lucide="search" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" style="width:18px;"></i>
                            <input type="text" id="postventa-search" class="form-input pl-12 py-3 bg-gray-50 border-gray-100 rounded-xl w-full focus:bg-white transition-all shadow-sm" 
                                   placeholder="Buscar por SKU, Nombre o Marca del equipo...">
                        </div>
                    </div>
                </div>

                <div id="lookup-results" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <!-- Results will be injected here -->
                </div>

                <div id="no-results" class="hidden">
                    <div class="card p-12 text-center bg-gray-50/50 border-dashed">
                        <div class="w-16 h-16 bg-white shadow-sm text-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i data-lucide="package-search" style="width:32px;"></i>
                        </div>
                        <h4 class="text-gray-900 font-bold mb-1">No se encontraron equipos</h4>
                        <p class="text-gray-500 text-sm">Prueba ajustando los términos de búsqueda.</p>
                    </div>
                </div>
            </div>
        `;

        if (window.lucide) lucide.createIcons();

        const searchInput = document.getElementById('postventa-search');
        const resultsContainer = document.getElementById('lookup-results');
        const noResults = document.getElementById('no-results');

        const filterResults = (query) => {
            const filtered = productos.filter(p =>
                (p.sku && p.sku.toLowerCase().includes(query.toLowerCase())) ||
                (p.nombre && p.nombre.toLowerCase().includes(query.toLowerCase())) ||
                (p.marca && p.marca.toLowerCase().includes(query.toLowerCase()))
            ).slice(0, 12); // Limit to 12 results for better UX

            if (filtered.length === 0) {
                resultsContainer.innerHTML = '';
                noResults.classList.remove('hidden');
                return;
            }

            noResults.classList.add('hidden');
            resultsContainer.innerHTML = filtered.map(p => `
                <div class="card hover:shadow-lg hover:border-primary-200 transition-all cursor-pointer group" data-action="view-equipment" data-id="${p.id}">
                    <div class="card-body p-6">
                        <div class="flex justify-between items-start mb-4">
                            <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded">${p.sku}</span>
                            <div class="p-2 bg-gray-50 text-gray-400 group-hover:bg-primary-50 group-hover:text-primary-600 rounded-lg transition-colors">
                                <i data-lucide="external-link" style="width:16px;"></i>
                            </div>
                        </div>
                        <h4 class="font-bold text-gray-900 mb-1 leading-snug group-hover:text-primary-700 transition-colors line-clamp-2">${p.nombre}</h4>
                        <p class="text-xs text-gray-500 mb-4">${p.marca || 'Sin Marca'} • ${p.familia || 'Sin Familia'}</p>
                        
                        <div class="flex items-center gap-2 pt-4 border-t border-gray-50">
                            <span class="text-[10px] font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded">CONSULTAR POSTVENTA</span>
                        </div>
                    </div>
                </div>
            `).join('');

            if (window.lucide) lucide.createIcons();

            resultsContainer.querySelectorAll('[data-action="view-equipment"]').forEach(card => {
                card.onclick = () => {
                    const id = parseInt(card.dataset.id);
                    if (window.PIMModule) {
                        PIMModule.showProductView(id, 'postventa', ['postventa']);
                    } else {
                        Components.toast('Error: Módulo PIM no disponible', 'error');
                    }
                };
            });
        };

        searchInput.addEventListener('input', Utils.debounce((e) => {
            filterResults(e.target.value);
        }, 300));

        // Initial render with all products limited
        filterResults('');
    },

    attachEvents() {
        // Tab switching - Listen for .tab class from Components.tabs
        document.querySelectorAll('.tab').forEach(tab => {
            tab.onclick = () => {
                this.renderTab(tab.dataset.tab);
            };
        });

        // Header action button
        document.querySelector('[data-action="new-ticket"]')?.addEventListener('click', () => {
            this.showTicketModal();
        });
    },

    showTicketModal(id = null) {
        const data = Store.get('servicios');
        const ticket = id ? data.tickets.find(t => t.id === id) : null;
        const isEdit = !!ticket;
        const clientes = Store.get('clientes') || [];

        const { modal, close } = Components.modal({
            title: isEdit ? `Ticket ${ticket.idDisplay}` : 'Nuevo Ticket',
            size: 'lg',
            content: `
                <form id="postventa-form">
                    <div class="grid grid-cols-2 gap-4">
                        ${Components.formInput({
                label: 'Cliente',
                name: 'clienteId',
                type: 'select',
                value: ticket ? ticket.clienteId : '',
                options: [
                    { value: '', label: 'Seleccione...' },
                    ...clientes.map(c => ({ value: c.id, label: c.nombre }))
                ]
            })}
                        ${Components.formInput({ label: 'Asunto', name: 'asunto', value: ticket ? ticket.asunto : '', placeholder: 'Ej: Falla en equipo...' })}
                        
                        ${Components.formInput({
                label: 'Prioridad',
                name: 'prioridad',
                type: 'select',
                value: ticket ? ticket.prioridad : 'Media',
                options: [
                    { value: 'Alta', label: 'Alta' },
                    { value: 'Media', label: 'Media' },
                    { value: 'Baja', label: 'Baja' }
                ]
            })}
                        ${Components.formInput({
                label: 'Estado',
                name: 'estado',
                type: 'select',
                value: ticket ? ticket.estado : 'Abierto',
                options: [
                    { value: 'Abierto', label: 'Abierto' },
                    { value: 'En Proceso', label: 'En Proceso' },
                    { value: 'Cerrado', label: 'Cerrado' }
                ]
            })}

                        <div class="col-span-2" style="grid-column: span 2;">
                            ${Components.formInput({ label: 'Asignado a', name: 'asignado', value: ticket ? ticket.asignado : '' })}
                        </div>

                        <div class="col-span-2" style="grid-column: span 2;">
                            ${Components.formInput({ label: 'Descripción', name: 'descripcion', type: 'textarea', value: ticket ? ticket.descripcion : '' })}
                        </div>
                    </div>
                </form>

                ${isEdit ? `
                <div class="mt-6 p-4 bg-gray-50 rounded-xl">
                    <h4 class="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <i data-lucide="history" style="width:16px;"></i> Historial
                    </h4>
                    <div class="space-y-3 mb-4">
                        ${ticket.historial.map(h => `
                            <div class="flex gap-4 text-xs">
                                <div class="text-gray-400 font-medium w-32 shrink-0">${h.fecha}</div>
                                <div class="flex-1">
                                    <span class="font-bold text-gray-700">${h.responsable} (${h.tipo})</span>
                                    <p class="text-gray-600 mt-0.5">${h.mensaje}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="flex gap-2 mt-4 pt-4 border-t">
                        <input type="text" id="historial-nota" class="form-input flex-1" placeholder="Agregar nota interna..." style="padding: 8px;">
                        <button type="button" class="btn btn-secondary btn-sm" onclick="PostventaModule.addHistoryNota(${id})">Agregar</button>
                    </div>
                </div>
                ` : ''}
            `,
            footer: `
                <button class="btn btn-secondary" data-action="cancel">Cancelar</button>
                <button class="btn btn-primary px-8" data-action="save">Guardar Ticket</button>
            `
        });

        if (window.lucide) lucide.createIcons();

        modal.querySelector('[data-action="save"]').addEventListener('click', () => {
            const form = document.getElementById('postventa-form');
            const formData = new FormData(form);
            const updates = {
                asunto: formData.get('asunto'),
                prioridad: formData.get('prioridad'),
                estado: formData.get('estado'),
                asignado: formData.get('asignado'),
                descripcion: formData.get('descripcion'),
                clienteId: parseInt(formData.get('clienteId'))
            };

            const cliente = clientes.find(c => c.id === updates.clienteId);
            updates.cliente = cliente ? cliente.nombre : 'Sin Cliente';

            if (isEdit) {
                const updatedTickets = data.tickets.map(t => t.id === id ? { ...t, ...updates } : t);
                Store.set('servicios', { ...data, tickets: updatedTickets });
            } else {
                const newTicket = {
                    id: Date.now(),
                    idDisplay: `#PV-${Math.floor(1000 + Math.random() * 9000)}`,
                    fecha: new Date().toLocaleString(),
                    ...updates,
                    historial: [
                        { fecha: new Date().toLocaleString(), responsable: 'Admin', tipo: 'Creado', mensaje: 'Ticket creado manualmente.' }
                    ]
                };
                data.tickets.unshift(newTicket);
                metrics.ticketsAbiertos++;
                Store.set('servicios', { ...data, metrics });
            }

            Components.toast(isEdit ? 'Ticket actualizado' : 'Ticket creado', 'success');
            close();
            this.renderTab('servicios');
        });

        modal.querySelector('[data-action="cancel"]').addEventListener('click', close);
    },

    showGarantiaModal(id = null) {
        const data = Store.get('servicios');
        const garantias = data.garantias || [];
        const garantia = id ? garantias.find(g => g.id === id) : null;
        const isEdit = !!garantia;
        const clientes = Store.get('clientes') || [];
        const productos = Store.get('productos') || [];

        const { modal, close } = Components.modal({
            title: isEdit ? 'Editar Garantía' : 'Activar Nueva Garantía',
            size: 'md',
            content: `
                <form id="garantia-form" class="space-y-4">
                    ${Components.formInput({
                label: 'Cliente',
                name: 'clienteId',
                type: 'select',
                value: garantia ? clientes.find(c => c.nombre === garantia.cliente)?.id : '',
                options: clientes.map(c => ({ value: c.id, label: c.nombre }))
            })}

                    ${Components.formInput({
                label: 'Equipo / SKU',
                name: 'sku',
                type: 'select',
                value: garantia ? garantia.sku : '',
                options: productos.map(p => ({ value: p.sku, label: `${p.nombre} (${p.sku})` }))
            })}

                    <div class="grid grid-cols-2 gap-4">
                        ${Components.formInput({
                label: 'Activación',
                name: 'fechaActivacion',
                type: 'date',
                value: garantia ? garantia.fechaActivacion : new Date().toISOString().split('T')[0]
            })}
                        
                        ${Components.formInput({
                label: 'Plazo (Meses)',
                name: 'periodo',
                type: 'number',
                value: garantia ? garantia.periodo : 12
            })}
                    </div>
                </form>
            `,
            footer: `
                <button class="btn btn-secondary" data-action="cancel">Cancelar</button>
                <button class="btn btn-primary" data-action="save">Guardar Garantía</button>
            `
        });

        if (window.lucide) lucide.createIcons();

        modal.querySelector('[data-action="save"]').addEventListener('click', () => {
            const form = document.getElementById('garantia-form');
            const formData = new FormData(form);
            const clienteId = parseInt(formData.get('clienteId'));
            const sku = formData.get('sku');
            const fechaActivacion = formData.get('fechaActivacion');
            const periodo = parseInt(formData.get('periodo'));

            const cliente = clientes.find(c => c.id === clienteId);
            const producto = productos.find(p => p.sku === sku);

            const date = new Date(fechaActivacion);
            date.setMonth(date.getMonth() + periodo);
            const vencimiento = date.toISOString().split('T')[0];

            const updates = {
                equipo: producto ? producto.nombre : 'Equipo Desconocido',
                sku: sku,
                cliente: cliente ? cliente.nombre : 'Cliente Desconocido',
                fechaActivacion,
                periodo,
                vencimiento,
                estado: new Date(vencimiento) > new Date() ? 'Vigente' : 'Caducada'
            };

            if (isEdit) {
                const updatedGarantias = data.garantias.map(g => g.id === id ? { ...g, ...updates } : g);
                Store.set('servicios', { ...data, garantias: updatedGarantias });
            } else {
                const newGarantia = { id: Date.now(), ...updates };
                if (!data.garantias) data.garantias = [];
                data.garantias.unshift(newGarantia);
                Store.set('servicios', data);
            }

            Components.toast('Garantía procesada', 'success');
            close();
            this.renderTab('garantias');
        });

        modal.querySelector('[data-action="cancel"]').addEventListener('click', close);
    },

    addHistoryNota(id) {
        const notaInput = document.getElementById('historial-nota');
        const mensaje = notaInput.value.trim();
        if (!mensaje) return;

        const data = Store.get('servicios');
        const ticket = data.tickets.find(t => t.id === id);
        if (ticket) {
            ticket.historial.push({
                fecha: new Date().toLocaleString(),
                responsable: 'Admin',
                tipo: 'Nota',
                mensaje: mensaje
            });
            Store.set('servicios', data);
            this.showTicketModal(id);
        }
    },

    createTicketFromSale(saleData) {
        const data = Store.get('servicios');
        const newTicket = {
            id: Date.now(),
            idDisplay: `#PV-${Math.floor(1000 + Math.random() * 9000)}`,
            fecha: new Date().toLocaleString(),
            cliente: saleData.cliente,
            asunto: saleData.asunto || 'Nueva Entrega',
            descripcion: saleData.descripcion || 'Ticket automático.',
            estado: 'Abierto',
            prioridad: saleData.prioridad || 'Media',
            asignado: saleData.asignado || 'Sin Asignar',
            historial: [{ fecha: new Date().toLocaleString(), responsable: 'Sistema', tipo: 'Auto', mensaje: 'Activación por venta.' }]
        };

        data.tickets.unshift(newTicket);
        data.metrics.ticketsAbiertos++;
        Store.set('servicios', data);
        if (Store.notify) Store.notify('Nuevo Ticket Postventa', `Cliente: ${saleData.cliente}`, 'info');
    }
};

window.PostventaModule = PostventaModule;
