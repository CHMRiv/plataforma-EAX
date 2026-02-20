/* ==========================================================================
   EAX Platform - Ventas Públicas Module
   (Licitaciones + Compras Ágiles)
   ========================================================================== */

const VentasPublicasModule = {
    currentTab: 'todas',   // todas | licitaciones | compras-agiles
    currentView: 'kanban', // grid | kanban

    render() {
        const content = document.getElementById('page-content');

        content.innerHTML = `
            <div class="animate-fadeIn">
                ${Components.pageHeader({
            title: 'Ventas Públicas',
            subtitle: 'Gestión de licitaciones y compras ágiles en plataformas públicas',
            actions: [
                { label: 'Nueva Compra Ágil', icon: 'zap', class: 'btn-outline', action: 'new-compra' },
                { label: 'Nueva Licitación', icon: 'plus', class: 'btn-primary', action: 'new-lic' }
            ]
        })}

                <div id="vp-summary">
                    <!-- Stats loaded dynamically -->
                </div>

                <!-- Tabs & Views -->
                <div class="card mt-6">
                    <div class="card-header border-b border-gray-100">
                        <div class="flex items-center justify-between w-full">
                            <div class="flex gap-1">
                                <button class="btn btn-sm ${this.currentTab === 'todas' ? 'btn-primary' : 'btn-ghost'}" data-tab="todas">
                                    <i data-lucide="layers" style="width:14px;height:14px;margin-right:4px;"></i> Todas
                                </button>
                                <button class="btn btn-sm ${this.currentTab === 'licitaciones' ? 'btn-primary' : 'btn-ghost'}" data-tab="licitaciones">
                                    <i data-lucide="file-text" style="width:14px;height:14px;margin-right:4px;"></i> Licitaciones
                                </button>
                                <button class="btn btn-sm ${this.currentTab === 'compras-agiles' ? 'btn-primary' : 'btn-ghost'}" data-tab="compras-agiles">
                                    <i data-lucide="zap" style="width:14px;height:14px;margin-right:4px;"></i> Compras Ágiles
                                </button>
                            </div>
                            
                            <div class="flex items-center gap-4">
                                <!-- View Toggle -->
                                <div class="flex bg-gray-100 p-1 rounded-lg">
                                    <button class="btn btn-icon btn-sm ${this.currentView === 'kanban' ? 'bg-white shadow-sm text-primary-600' : 'btn-ghost text-gray-400'}" data-view="kanban" title="Vista Kanban">
                                        <i data-lucide="trello" style="width:14px;height:14px;"></i>
                                    </button>
                                    <button class="btn btn-icon btn-sm ${this.currentView === 'grid' ? 'bg-white shadow-sm text-primary-600' : 'btn-ghost text-gray-400'}" data-view="grid" title="Vista Grilla">
                                        <i data-lucide="layout-grid" style="width:14px;height:14px;"></i>
                                    </button>
                                </div>

                                <div class="flex gap-3">
                                    ${Components.searchInput({ placeholder: 'Buscar...', id: 'search-vp' })}
                                    <div class="relative" style="width: 220px;">
                                        <input type="text"
                                            class="form-input"
                                            id="filter-vp-entidad"
                                            list="entidades-list"
                                            placeholder="Filtrar por entidad...">
                                        <datalist id="entidades-list">
                                            <!-- Options loaded dynamically -->
                                        </datalist>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="vp-container" class="mt-6">
                    ${this.currentView === 'grid'
                ? `<div class="grid grid-cols-3 gap-6" id="vp-grid"></div>`
                : `<div class="kanban-overflow"><div class="kanban-board" id="vp-kanban"></div></div>`
            }
                </div>
            </div>
        `;

        lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });
        this.filterItems();
        this.attachEvents();
    },

    getItems() {
        return Store.get('ventasPublicas') || [];
    },

    filterItems() {
        const searchTerm = document.getElementById('search-vp')?.value || '';
        const entidadFilter = document.getElementById('filter-vp-entidad')?.value || '';

        let items = this.getItems();

        // Tab filter
        if (this.currentTab === 'licitaciones') {
            items = items.filter(i => i.modalidad === 'Licitación');
        } else if (this.currentTab === 'compras-agiles') {
            items = items.filter(i => i.modalidad === 'Compra Ágil');
        }

        if (searchTerm) {
            items = Utils.search(items, searchTerm, ['titulo', 'entidad', 'idPortal']);
        }

        if (entidadFilter) {
            items = items.filter(l => l.entidad.toLowerCase().includes(entidadFilter.toLowerCase()));
        }

        const gridContainer = document.getElementById('vp-grid');
        const kanbanContainer = document.getElementById('vp-kanban');

        if (this.currentView === 'grid' && gridContainer) {
            this.renderGrid(gridContainer, items);
        } else if (this.currentView === 'kanban' && kanbanContainer) {
            this.renderKanban(kanbanContainer, items);
        }

        this.renderStats(items);
        this.updateDatalist();
    },

    updateDatalist() {
        const allItems = this.getItems();
        const entidades = [...new Set(allItems.map(l => l.entidad))].sort();
        const datalist = document.getElementById('entidades-list');
        if (datalist) {
            datalist.innerHTML = entidades.map(e => `<option value="${e}">`).join('');
        }
    },

    renderStats(items) {
        const summary = document.getElementById('vp-summary');
        if (!summary) return;

        const lics = items.filter(i => i.modalidad === 'Licitación');
        const compras = items.filter(i => i.modalidad === 'Compra Ágil');
        const adjudicadas = items.filter(i => i.estado === 'Adjudicada');
        const montoTotal = items.reduce((s, l) => s + (l.monto || 0), 0);
        const tasaExito = items.length > 0 ? Math.round((adjudicadas.length / items.length) * 100) : 0;

        summary.innerHTML = `
            <div class="quick-stats">
                ${Components.statCard({ icon: 'layers', label: 'Total', value: items.length, iconClass: 'primary' })}
                ${Components.statCard({ icon: 'file-text', label: 'Licitaciones', value: lics.length, iconClass: 'warning' })}
                ${Components.statCard({ icon: 'zap', label: 'Compras Ágiles', value: compras.length, iconClass: 'accent' })}
                ${Components.statCard({ icon: 'trophy', label: 'Adjudicadas', value: adjudicadas.length, iconClass: 'success' })}
                ${Components.statCard({ icon: 'dollar-sign', label: 'Monto Total', value: Utils.formatCurrency(montoTotal), iconClass: 'primary' })}
            </div>
        `;
        if (window.lucide) lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });
    },

    renderGrid(container, items) {
        if (items.length === 0) {
            container.innerHTML = `
                <div class="col-span-3 text-center py-12 text-gray-400">
                    <i data-lucide="inbox" style="width:48px;height:48px;margin-bottom:1rem;display:block;margin-left:auto;margin-right:auto;"></i>
                    <p>No se encontraron ventas públicas</p>
                </div>
            `;
            if (window.lucide) lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });
            return;
        }

        container.innerHTML = items.map(item => {
            const isCompraAgil = item.modalidad === 'Compra Ágil';
            const icon = isCompraAgil ? 'zap' : 'file-text';
            const badgeClass = isCompraAgil ? 'accent' : 'primary';
            const negocio = item.negocioId ? Store.find('oportunidades', item.negocioId) : null;

            return `
                <div class="card cursor-pointer hover:shadow-lg transition-all" data-vp-id="${item.id}" style="border-left: 4px solid var(--color-${isCompraAgil ? 'warning' : 'primary'}-500);">
                    <div class="card-body">
                        <div class="flex justify-between items-start mb-3">
                            <div class="flex items-center gap-2">
                                <span class="badge badge-${badgeClass}" style="display:flex;align-items:center;gap:4px;">
                                    <i data-lucide="${icon}" style="width:12px;height:12px;"></i> ${item.modalidad}
                                </span>
                                ${item.tipo ? `<span class="badge badge-${item.tipo === 'Pública' ? 'primary' : 'secondary'}">${item.tipo}</span>` : ''}
                            </div>
                            <span class="badge badge-${Utils.getStatusColor(item.estado)}">${item.estado}</span>
                        </div>
                        <h3 class="font-semibold mb-2 line-clamp-2">${item.titulo}</h3>
                        <p class="text-sm text-secondary mb-2">${item.entidad}</p>
                        ${item.idPortal ? `<p class="text-xs font-mono text-secondary mb-3"><i data-lucide="hash" style="width:10px;height:10px;display:inline;"></i> ${item.idPortal}</p>` : ''}
                        <div class="text-2xl font-bold text-primary-600 mb-3">${Utils.formatCurrency(item.monto)}</div>
                        <div class="flex justify-between text-xs text-secondary mb-3">
                            <span><i data-lucide="calendar" style="width:12px;height:12px;display:inline;"></i> ${Utils.formatDate(item.fechaApertura)}</span>
                            <span><i data-lucide="clock" style="width:12px;height:12px;display:inline;"></i> ${Utils.formatDate(item.fechaCierre)}</span>
                        </div>
                        ${negocio ? `
                            <div class="flex items-center gap-2 p-2 bg-blue-50 rounded-lg text-xs">
                                <i data-lucide="briefcase" style="width:12px;height:12px;color:var(--color-primary-600);"></i>
                                <span class="font-medium text-primary-700 truncate">${negocio.titulo}</span>
                            </div>
                        ` : ''}
                        <div class="mt-3">
                            ${Components.progressBar(this.getProgress(item), isCompraAgil ? 'warning' : 'primary')}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Re-attach click events for dynamic cards
        container.querySelectorAll('[data-vp-id]').forEach(card => {
            card.addEventListener('click', () => this.showDetail(parseInt(card.dataset.vpId)));
        });

        if (window.lucide) lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });
    },

    getProgress(item) {
        const now = new Date();
        const start = new Date(item.fechaApertura);
        const end = new Date(item.fechaCierre);
        const total = end - start;
        const elapsed = now - start;
        return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
    },

    renderKanban(container, items) {
        const stages = [
            { id: 'Identificada', label: 'Identificada', color: 'gray' },
            { id: 'En preparación', label: 'En preparación', color: 'primary' },
            { id: 'Presentada', label: 'Presentada / Enviada', color: 'warning' },
            { id: 'En evaluación', label: 'En evaluación', color: 'accent' },
            { id: 'Adjudicada', label: 'Adjudicada', color: 'success' },
            { id: 'No adjudicada', label: 'No adjudicada', color: 'error' }
        ];

        container.innerHTML = stages.map(stage => {
            const stageItems = items.filter(item => {
                if (stage.id === 'Presentada') return item.estado === 'Presentada' || item.estado === 'Enviada';
                return item.estado === stage.id;
            });
            const totalMonto = stageItems.reduce((s, i) => s + (i.monto || 0), 0);

            return `
                <div class="kanban-column" data-stage="${stage.id}">
                    <div class="kanban-column-header">
                        <div class="flex items-center gap-2">
                            <span class="badge badge-${stage.color} pulse">${stageItems.length}</span>
                            <h3 class="font-semibold text-sm truncate">${stage.label}</h3>
                        </div>
                        <div class="text-xs text-secondary mt-1">${Utils.formatCurrency(totalMonto)}</div>
                    </div>
                    <div class="kanban-items" id="kanban-stage-${stage.id}">
                        ${stageItems.map(item => this.renderKanbanCard(item)).join('')}
                    </div>
                </div>
            `;
        }).join('');

        // Attach events to kanban cards
        container.querySelectorAll('[data-vp-id]').forEach(card => {
            card.addEventListener('click', () => this.showDetail(parseInt(card.dataset.vpId)));
        });

        if (window.lucide) lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });
    },

    renderKanbanCard(item) {
        const isCompraAgil = item.modalidad === 'Compra Ágil';
        const daysLeft = Math.ceil((new Date(item.fechaCierre) - new Date()) / (1000 * 60 * 60 * 24));
        const countdownColor = daysLeft < 3 ? 'error' : (daysLeft < 7 ? 'warning' : 'success');
        const progress = this.getProgress(item);

        return `
            <div class="kanban-card card" data-vp-id="${item.id}" style="border-top: 3px solid var(--color-${isCompraAgil ? 'warning' : 'primary'}-500);">
                <div class="p-3">
                    <div class="flex justify-between items-start mb-2">
                        <span class="text-[10px] font-bold text-secondary uppercase tracking-tighter">${item.entidad}</span>
                        ${daysLeft >= 0 ? `
                            <span class="badge badge-${countdownColor} text-[9px] px-1 py-0">
                                <i data-lucide="clock" style="width:8px;height:8px;margin-right:2px;"></i> ${daysLeft}d
                            </span>
                        ` : ''}
                    </div>
                    <h4 class="text-xs font-bold mb-2 line-clamp-2">${item.titulo}</h4>
                    <div class="text-sm font-black text-primary-700 mb-2">${Utils.formatCurrency(item.monto)}</div>
                    
                    <div class="flex items-center justify-between mt-3">
                        <div class="flex -space-x-1">
                            <div class="avatar avatar-xs" title="Responsable">${Utils.getInitials(item.responsable || 'SA')}</div>
                        </div>
                        <div class="flex items-center gap-1 text-[10px] text-secondary">
                            <i data-lucide="check-square" style="width:10px;height:10px;"></i>
                            ${(item.checklist || []).filter(c => c.checked).length}/${(item.checklist || []).length || 0}
                        </div>
                    </div>
                    <div class="mt-2">
                        ${Components.progressBar(progress, isCompraAgil ? 'warning' : 'primary')}
                    </div>
                </div>
            </div>
        `;
    },

    attachEvents() {
        // Tab switching
        document.querySelectorAll('[data-tab]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.currentTab = btn.dataset.tab;
                this.render();
            });
        });

        // View switching
        document.querySelectorAll('[data-view]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.currentView = btn.dataset.view;
                this.render();
            });
        });

        document.querySelector('[data-action="new-lic"]')?.addEventListener('click', () => {
            this.showForm(null, 'Licitación');
        });

        document.querySelector('[data-action="new-compra"]')?.addEventListener('click', () => {
            this.showForm(null, 'Compra Ágil');
        });

        document.getElementById('search-vp')?.addEventListener('input', Utils.debounce(() => this.filterItems(), 300));
        document.getElementById('filter-vp-entidad')?.addEventListener('input', Utils.debounce(() => this.filterItems(), 300));
    },

    showDetail(id) {
        const item = Store.find('ventasPublicas', id);
        if (!item) return;
        const isCompraAgil = item.modalidad === 'Compra Ágil';
        const negocio = item.negocioId ? Store.find('oportunidades', item.negocioId) : null;

        // Initialize checklist if empty
        if (!item.checklist) {
            item.checklist = [
                { id: 1, label: 'Bases Administritavas', checked: false },
                { id: 2, label: 'Oferta Técnica', checked: false },
                { id: 3, label: 'Oferta Económica', checked: false },
                { id: 4, label: 'Garantía de Seriedad', checked: false }
            ];
        }

        const estados = isCompraAgil
            ? ['Identificada', 'En preparación', 'Enviada', 'En evaluación', 'Adjudicada', 'No adjudicada', 'Desierta']
            : ['En preparación', 'Presentada', 'En evaluación', 'Adjudicada', 'No adjudicada', 'Desierta'];

        const { modal, close } = Components.modal({
            title: item.titulo,
            size: 'lg',
            content: `
                <div class="flex gap-6">
                    <!-- Left Sidebar: Info & Actions -->
                    <div style="width: 300px; flex-shrink: 0;" class="flex flex-col gap-6">
                        <div class="card bg-gray-50 p-4 border-none">
                            <div class="text-xs text-secondary uppercase font-bold mb-4">Información Clave</div>
                            <div class="flex flex-col gap-4">
                                <div>
                                    <div class="text-[10px] text-secondary uppercase">Monto Estimado</div>
                                    <div class="font-bold text-xl text-primary-700">${Utils.formatCurrency(item.monto)}</div>
                                </div>
                                <div>
                                    <div class="text-[10px] text-secondary uppercase">Estado Actual</div>
                                    <span class="badge badge-${Utils.getStatusColor(item.estado)} mt-1">${item.estado}</span>
                                </div>
                                <div>
                                    <div class="text-[10px] text-secondary uppercase">Cierre de Ofertas</div>
                                    <div class="font-medium flex items-center gap-1">
                                        <i data-lucide="clock" style="width:14px;height:14px;color:var(--color-error-500);"></i>
                                        ${Utils.formatDate(item.fechaCierre, 'short')}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Negocio CRM Link -->
                        <div class="card p-4 border-primary-100" style="background: var(--color-primary-50);">
                            <h4 class="text-[10px] text-primary-600 uppercase font-bold mb-3 flex items-center gap-2">
                                <i data-lucide="briefcase" style="width:14px;height:14px;"></i> Vínculo CRM
                            </h4>
                            ${negocio ? `
                                <div class="font-bold text-sm mb-1">${negocio.titulo}</div>
                                <div class="text-xs text-secondary mb-3">${negocio.etapa} · ${Utils.formatCurrency(negocio.valor)}</div>
                                <div class="flex gap-2">
                                    <button class="btn btn-xs btn-primary flex-1" data-action="view-negocio">Ver Detalle</button>
                                    <button class="btn btn-xs btn-outline" data-action="unlink-negocio" title="Desvincular"><i data-lucide="unlink" style="width:12px;height:12px;"></i></button>
                                </div>
                            ` : `
                                <p class="text-xs text-secondary mb-3">No hay un negocio de ventas vinculado en el CRM.</p>
                                <button class="btn btn-xs btn-primary w-full" data-action="link-negocio">Vincular o Crear Negocio</button>
                            `}
                        </div>
                    </div>

                    <!-- Main Content: Checklist & Timeline -->
                    <div class="flex-1 flex flex-col gap-6">
                        <!-- Checklist Documents -->
                        <div class="card">
                            <div class="card-header border-b border-gray-100 flex justify-between items-center">
                                <h4 class="font-bold text-sm">Checklist de Documentación</h4>
                                <span class="text-xs text-secondary">
                                    ${item.checklist.filter(c => c.checked).length}/${item.checklist.length} completados
                                </span>
                            </div>
                            <div class="card-body">
                                <div class="flex flex-col gap-2">
                                    ${item.checklist.map(check => `
                                        <label class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-100 transition-all">
                                            <input type="checkbox" class="form-checkbox h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500" 
                                                   ${check.checked ? 'checked' : ''} data-check-id="${check.id}">
                                            <span class="text-sm font-medium ${check.checked ? 'text-gray-400 line-through' : 'text-gray-700'}">${check.label}</span>
                                        </label>
                                    `).join('')}
                                </div>
                            </div>
                        </div>

                        <!-- Change Status -->
                        <div class="card p-4">
                            <h4 class="font-bold text-sm mb-4">Actualizar Etapa del Pipeline</h4>
                            <div class="flex flex-wrap gap-2">
                                ${estados.map(e => {
                const isActive = item.estado === e;
                return `<button class="btn btn-sm ${isActive ? 'btn-primary shadow-md' : 'btn-outline'}" 
                                            data-action="change-status" data-status="${e}">${e}</button>`;
            }).join('')}
                            </div>
                        </div>

                        <!-- Timeline -->
                        <div class="timeline ml-2">
                            <div class="timeline-item">
                                <div class="timeline-icon success"><i data-lucide="play-circle"></i></div>
                                <div class="timeline-content">
                                    <div class="text-xs text-secondary uppercase">Apertura</div>
                                    <div class="font-bold">${Utils.formatDate(item.fechaApertura, 'long')}</div>
                                </div>
                            </div>
                            <div class="timeline-item">
                                <div class="timeline-icon danger"><i data-lucide="alert-circle"></i></div>
                                <div class="timeline-content">
                                    <div class="text-xs text-secondary uppercase">Cierre</div>
                                    <div class="font-bold">${Utils.formatDate(item.fechaCierre, 'long')}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            footer: `
                <button class="btn btn-danger btn-ghost" data-action="delete" style="margin-right: auto;">Eliminar Registro</button>
                <button class="btn btn-secondary" data-action="close">Cerrar</button>
                <button class="btn btn-primary" data-action="edit">Editar Detalles</button>
            `
        });

        lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });

        modal.querySelector('[data-action="close"]').addEventListener('click', close);

        // Checklist toggle
        modal.querySelectorAll('[data-check-id]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const checkId = parseInt(e.target.dataset.checkId);
                const check = item.checklist.find(c => c.id === checkId);
                if (check) {
                    check.checked = e.target.checked;
                    Store.update('ventasPublicas', id, { checklist: item.checklist });
                    // Visual update
                    const span = e.target.nextElementSibling;
                    if (e.target.checked) {
                        span.classList.add('text-gray-400', 'line-through');
                    } else {
                        span.classList.remove('text-gray-400', 'line-through');
                    }
                }
            });
        });

        modal.querySelector('[data-action="edit"]').addEventListener('click', () => {
            close();
            this.showForm(id);
        });

        modal.querySelector('[data-action="delete"]').addEventListener('click', async () => {
            const confirmed = await Components.confirm({
                title: 'Eliminar Venta Pública',
                message: `¿Estás seguro de que deseas eliminar "${item.titulo}"?`,
                confirmText: 'Eliminar',
                type: 'danger'
            });
            if (confirmed) {
                Store.delete('ventasPublicas', id);
                Components.toast('Venta pública eliminada', 'success');
                close();
                this.render();
            }
        });

        // Change status buttons
        modal.querySelectorAll('[data-action="change-status"]').forEach(btn => {
            btn.addEventListener('click', async () => {
                const newStatus = btn.dataset.status;

                // Special logic for Adjudicada
                if (newStatus === 'Adjudicada' && !item.negocioId) {
                    const confirmed = await Components.confirm({
                        title: '¡Licitación Adjudicada!',
                        message: `¿Deseas crear automáticamente el negocio correspondiente en el CRM?`,
                        confirmText: 'Sí, crear negocio',
                        cancelText: 'Solo actualizar estado',
                        type: 'success'
                    });

                    if (confirmed) {
                        this.createNegocioFromVP(item);
                        close();
                        this.render();
                        return;
                    }
                }

                Store.update('ventasPublicas', id, { estado: newStatus });
                Components.toast(`Etapa actualizada a "${newStatus}"`, 'success');
                close();
                this.render();
            });
        });

        // View CRM Negocio
        modal.querySelector('[data-action="view-negocio"]')?.addEventListener('click', () => {
            close();
            if (negocio && window.CRMModule) {
                CRMModule.showNegocioDetail(negocio.id);
            }
        });

        // Link to CRM Negocio
        modal.querySelector('[data-action="link-negocio"]')?.addEventListener('click', () => {
            this.showLinkNegocioModal(item, close);
        });

        // Unlink negocio
        modal.querySelector('[data-action="unlink-negocio"]')?.addEventListener('click', () => {
            Store.update('ventasPublicas', id, { negocioId: null });
            Components.toast('Negocio desvinculado', 'success');
            close();
            this.showDetail(id);
        });
    },

    createNegocioFromVP(item) {
        const newNegocio = {
            titulo: `[ADJUDICADA] ${item.titulo}`,
            cliente: item.entidad,
            clienteId: null,
            valor: item.monto,
            etapa: 'ganado',
            probabilidad: 100,
            fechaCierre: new Date().toISOString().split('T')[0],
            responsable: item.responsable || 'Sin asignar',
            ventaPublicaId: item.id
        };
        const saved = Store.add('oportunidades', newNegocio);
        const newId = saved?.id || (Store.get('oportunidades').slice(-1)[0]?.id);
        if (newId) {
            Store.update('ventasPublicas', item.id, { negocioId: newId, estado: 'Adjudicada' });
        }
        Components.toast('Negocio creado en CRM y licitación adjudicada', 'success');
    },

    showLinkNegocioModal(item, parentClose) {
        const negocios = Store.get('oportunidades') || [];

        const { modal: linkModal, close: linkClose } = Components.modal({
            title: 'Vincular con Negocio CRM',
            size: 'md',
            content: `
                <div class="mb-4">
                    <p class="text-sm text-secondary mb-4">Selecciona el negocio del CRM que deseas vincular con <strong>"${item.titulo}"</strong></p>
                    ${Components.searchInput({ placeholder: 'Buscar negocios...', id: 'search-link-negocio' })}
                </div>
                <div class="flex flex-col gap-2 max-h-96 overflow-y-auto" id="negocios-list">
                    ${negocios.length > 0 ? negocios.map(n => `
                        <div class="p-4 rounded-lg border border-gray-200 hover:border-primary-400 hover:bg-primary-50 cursor-pointer transition-all" data-negocio-id="${n.id}">
                            <div class="flex justify-between items-start">
                                <div class="flex-1 min-w-0">
                                    <div class="font-medium truncate">${n.titulo}</div>
                                    <div class="text-sm text-secondary">${n.cliente}</div>
                                </div>
                                <div class="text-right ml-4">
                                    <div class="font-bold">${Utils.formatCurrency(n.valor)}</div>
                                    <span class="badge badge-${Utils.getStatusColor(n.etapa)} text-xs">${n.etapa}</span>
                                </div>
                            </div>
                        </div>
                    `).join('') : `
                        <div class="text-center py-8 text-gray-400">
                            <p>No hay negocios disponibles en el CRM</p>
                        </div>
                    `}
                </div>
            `,
            footer: `
                <button class="btn btn-secondary" data-action="cancel">Cancelar</button>
                <button class="btn btn-primary" data-action="create-negocio">
                    <i data-lucide="plus" style="width:14px;height:14px;margin-right:4px;"></i> Crear Nuevo Negocio
                </button>
            `
        });

        lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });

        // Search filter
        linkModal.querySelector('#search-link-negocio')?.addEventListener('input', Utils.debounce((e) => {
            const term = e.target.value.toLowerCase();
            linkModal.querySelectorAll('[data-negocio-id]').forEach(card => {
                const text = card.textContent.toLowerCase();
                card.style.display = text.includes(term) ? '' : 'none';
            });
        }, 200));

        // Select negocio
        linkModal.querySelectorAll('[data-negocio-id]').forEach(card => {
            card.addEventListener('click', () => {
                const negocioId = parseInt(card.dataset.negocioId);
                Store.update('ventasPublicas', item.id, { negocioId });
                Components.toast('Negocio vinculado correctamente', 'success');
                linkClose();
                parentClose();
                this.showDetail(item.id);
            });
        });

        linkModal.querySelector('[data-action="cancel"]')?.addEventListener('click', linkClose);

        // Create new negocio and link
        linkModal.querySelector('[data-action="create-negocio"]')?.addEventListener('click', () => {
            const newNegocio = {
                titulo: item.titulo,
                cliente: item.entidad,
                clienteId: null,
                valor: item.monto,
                etapa: 'calificacion',
                probabilidad: 20,
                fechaCierre: item.fechaCierre,
                responsable: 'Sin asignar',
                ventaPublicaId: item.id
            };
            const saved = Store.add('oportunidades', newNegocio);
            const newId = saved?.id || (Store.get('oportunidades').slice(-1)[0]?.id);
            if (newId) {
                Store.update('ventasPublicas', item.id, { negocioId: newId });
            }
            Components.toast('Negocio creado y vinculado', 'success');
            linkClose();
            parentClose();
            this.showDetail(item.id);
        });
    },

    showForm(id = null, defaultModalidad = 'Licitación') {
        const item = id ? Store.find('ventasPublicas', id) : null;
        const isEdit = !!item;
        const modalidad = item?.modalidad || defaultModalidad;
        const isCompraAgil = modalidad === 'Compra Ágil';

        const { modal, close } = Components.modal({
            title: isEdit ? `Editar ${modalidad}` : `Nueva ${modalidad}`,
            size: 'md',
            content: `
                <form id="vp-form">
                    ${Components.formInput({ label: 'Título', name: 'titulo', value: item?.titulo || '', required: true })}
                    ${Components.formInput({ label: 'Entidad / Organismo', name: 'entidad', value: item?.entidad || '', required: true })}
                    <div class="grid grid-cols-2 gap-4">
                        ${Components.formInput({
                label: 'Modalidad', name: 'modalidad', type: 'select', value: modalidad,
                options: [
                    { value: 'Licitación', label: 'Licitación' },
                    { value: 'Compra Ágil', label: 'Compra Ágil' }
                ]
            })}
                        ${!isCompraAgil ? Components.formInput({
                label: 'Tipo', name: 'tipo', type: 'select', value: item?.tipo || 'Pública',
                options: [{ value: 'Pública', label: 'Pública' }, { value: 'Privada', label: 'Privada' }]
            }) : Components.formInput({
                label: 'Plataforma', name: 'plataforma', type: 'select', value: item?.plataforma || 'Mercado Público',
                options: [
                    { value: 'Mercado Público', label: 'Mercado Público' },
                    { value: 'ChileCompra', label: 'ChileCompra' },
                    { value: 'Otro', label: 'Otro' }
                ]
            })}
                        ${Components.formInput({ label: 'Monto Estimado', name: 'monto', type: 'number', value: item?.monto || '', required: true })}
                        ${Components.formInput({ label: isCompraAgil ? 'ID Mercado Público' : 'ID Portal', name: 'idPortal', value: item?.idPortal || '' })}
                        ${Components.formInput({ label: 'Fecha Apertura', name: 'fechaApertura', type: 'date', value: item?.fechaApertura || '', required: true })}
                        ${Components.formInput({ label: 'Fecha Cierre', name: 'fechaCierre', type: 'date', value: item?.fechaCierre || '', required: true })}
                    </div>
                </form>
            `,
            footer: `
                <button class="btn btn-secondary" data-action="cancel">Cancelar</button>
                <button class="btn btn-primary" data-action="save">${isEdit ? 'Guardar' : 'Crear'}</button>
            `
        });

        modal.querySelector('[data-action="cancel"]').addEventListener('click', close);
        modal.querySelector('[data-action="save"]').addEventListener('click', () => {
            const form = document.getElementById('vp-form');
            if (!form.checkValidity()) { form.reportValidity(); return; }

            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            data.monto = parseInt(data.monto);

            if (isEdit) {
                Store.update('ventasPublicas', id, data);
                Components.toast(`${data.modalidad} actualizada`, 'success');
            } else {
                data.estado = data.modalidad === 'Compra Ágil' ? 'Identificada' : 'En preparación';
                Store.add('ventasPublicas', data);
                Components.toast(`${data.modalidad} creada`, 'success');
            }

            close();
            this.render();
        });
    }
};

// Keep backward compat alias
window.VentasPublicasModule = VentasPublicasModule;
window.LicitacionesModule = VentasPublicasModule;
