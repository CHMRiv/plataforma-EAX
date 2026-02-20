/* ==========================================================================
   Aura Platform - CRM Module (Legacy Reborn)
   ========================================================================== */

(function () {
    'use strict';

    const CRMModule = {
        currentTab: 'clientes',

        // Initial state for calendar
        _calYear: new Date().getFullYear(),
        _calMonth: new Date().getMonth(),

        /**
         * Main render entry point
         */
        render() {
            const container = document.getElementById('page-content');
            if (!container) return;

            container.innerHTML = `
                <div class="animate-fadeIn">
                    ${Components.pageHeader({
                title: 'Aura CRM Intelligent Hub',
                subtitle: 'Gestión predictiva de relaciones y pipeline comercial estratégico',
                actions: [
                    { label: 'Intelligence Export', icon: 'sparkles', class: 'btn-outline border-primary-200 text-primary-600', action: 'export-crm' },
                    { label: 'Nuevo Registro', icon: 'plus', class: 'btn-primary shadow-lg shadow-primary-100', action: 'new-record' }
                ]
            })}

                    <div class="mb-8">
                        ${Components.tabs({
                tabs: [
                    { id: 'clientes', label: 'Directorio Clientes', icon: 'users' },
                    { id: 'negocios', label: 'Pipeline de Negocios', icon: 'trending-up' },
                    { id: 'actividades', label: 'Agenda & Actividades', icon: 'calendar-days' },
                    { id: 'comunicaciones', label: 'Comunicaciones', icon: 'mail' }
                ],
                activeTab: this.currentTab
            })}
                    </div>

                    <div id="crm-main-viewport" class="animate-fadeIn"></div>
                </div>
            `;

            this.initGlobalEvents();
            this.renderCurrentTab();
            if (window.lucide) lucide.createIcons();
        },

        /**
         * Setup global module events (Header buttons, etc)
         */
        initGlobalEvents() {
            // Tab switching
            document.querySelectorAll('.tab').forEach(tab => {
                tab.addEventListener('click', (e) => {
                    const nextTab = tab.dataset.tab;
                    if (this.currentTab === nextTab) return;

                    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    this.currentTab = nextTab;
                    this.renderCurrentTab();
                });
            });

            // Action: New Record based on context
            document.querySelector('[data-action="new-record"]')?.addEventListener('click', () => {
                if (this.currentTab === 'clientes') this.showClienteForm();
                else if (this.currentTab === 'negocios') this.showNegocioForm();
                else if (this.currentTab === 'actividades') this.showActividadForm();
            });

            // Action: Export
            document.querySelector('[data-action="export-crm"]')?.addEventListener('click', () => {
                const data = Store.get(this.currentTab === 'negocios' ? 'oportunidades' : this.currentTab);
                Utils.downloadCSV(data, `aura_crm_${this.currentTab}_${new Date().toISOString().split('T')[0]}.csv`);
                Components.toast('Exportación completada', 'success');
            });
        },

        /**
         * Orchestrates tab rendering
         */
        renderCurrentTab() {
            const viewport = document.getElementById('crm-main-viewport');
            if (!viewport) return;

            viewport.innerHTML = ''; // Clear

            switch (this.currentTab) {
                case 'clientes':
                    this.submodules.clientes.render(viewport, this);
                    break;
                case 'negocios':
                    this.submodules.negocios.render(viewport, this);
                    break;
                case 'actividades':
                    this.submodules.actividades.render(viewport, this);
                    break;
                case 'comunicaciones':
                    this.submodules.inbox.render(viewport, this);
                    break;
            }
            if (window.lucide) lucide.createIcons();
        },

        // --- Submodules Container ---
        submodules: {
            clientes: {
                render(container, parent) {
                    const data = Store.get('clientes') || [];

                    container.innerHTML = `
                        <div class="card border-none shadow-sm bg-white overflow-hidden rounded-3xl">
                                <div class="p-6 border-b border-gray-50 flex items-center justify-between bg-white/50 backdrop-blur-md">
                                    <div class="flex gap-4 w-full max-w-2xl px-2">
                                        <div class="relative flex-1 group">
                                            <i data-lucide="search" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors w-4 h-4"></i>
                                            <input type="text" id="search-clientes-new" class="form-input pl-12 bg-gray-50/50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 transition-all" placeholder="Filtrar por empresa, contacto o RUT...">
                                        </div>
                                        <select class="form-select bg-gray-50/50 border-none rounded-2xl px-6 focus:ring-2 focus:ring-primary-500/20 transition-all font-semibold text-gray-600" id="filter-estado-new">
                                            <option value="">Todos los Estados</option>
                                            <option value="Activo">✓ Activos</option>
                                            <option value="Prospecto">⚡ Prospectos</option>
                                            <option value="Inactivo">○ Inactivos</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="overflow-x-auto custom-scrollbar" id="clientes-table-container">
                                ${this.renderTable(data)}
                            </div>
                        </div>
                    `;

                    this.attachEvents(container, parent);
                },

                renderTable(data) {
                    return Components.dataTable({
                        columns: [
                            {
                                key: 'nombre', label: 'Empresa', render: (val, row) => `
                                <div class="flex items-center gap-4">
                                    <div class="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white flex items-center justify-center font-black shadow-lg shadow-primary-100">
                                        ${Utils.getInitials(val)}
                                    </div>
                                    <div>
                                        <div class="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">${val}</div>
                                        <div class="text-[10px] text-gray-400 font-black uppercase tracking-widest">${row.rut}</div>
                                    </div>
                                </div>
                            `},
                            { key: 'sector', label: 'Industria', render: (val) => `<span class="text-xs font-semibold text-gray-500 italic">${val}</span>` },
                            { key: 'contacto', label: 'Contacto Principal', render: (val) => `<strong>${val}</strong>` },
                            { key: 'estado', label: 'Estado', type: 'badge' },
                            { key: 'valor', label: 'Lifetime Value', type: 'currency' }
                        ],
                        data: data,
                        actions: [
                            { icon: 'external-link', label: 'Ver 360', action: 'view-client' },
                            { icon: 'edit-2', label: 'Editar', action: 'edit-client' },
                            { icon: 'trash-2', label: 'Eliminar', action: 'delete-client' }
                        ]
                    });
                },

                attachEvents(container, parent) {
                    const searchInput = document.getElementById('search-clientes-new');
                    const statusFilter = document.getElementById('filter-estado-new');

                    const updateTable = () => {
                        let filtered = Store.get('clientes');
                        if (searchInput.value) filtered = Utils.search(filtered, searchInput.value, ['nombre', 'rut', 'contacto']);
                        if (statusFilter.value) filtered = filtered.filter(c => c.estado === statusFilter.value);

                        document.getElementById('clientes-table-container').innerHTML = this.renderTable(filtered);
                        this.attachEvents(container, parent);
                        if (window.lucide) lucide.createIcons();
                    };

                    searchInput?.addEventListener('input', Utils.debounce(updateTable, 300));
                    statusFilter?.addEventListener('change', updateTable);

                    // Table Actions
                    container.querySelectorAll('[data-action="view-client"]').forEach(btn => {
                        btn.onclick = () => parent.showClienteDetail(parseInt(btn.dataset.id));
                    });
                    container.querySelectorAll('[data-action="edit-client"]').forEach(btn => {
                        btn.onclick = () => parent.showClienteForm(parseInt(btn.dataset.id));
                    });
                    container.querySelectorAll('[data-action="delete-client"]').forEach(btn => {
                        btn.onclick = async () => {
                            const confirmed = await Components.confirm({
                                title: 'Eliminar Cliente',
                                message: '¿Estás seguro? Se perderá el historial asociado en esta vista.',
                                type: 'danger'
                            });
                            if (confirmed) {
                                Store.delete('clientes', parseInt(btn.dataset.id));
                                Components.toast('Cliente eliminado', 'success');
                                parent.renderCurrentTab();
                            }
                        };
                    });
                }
            },

            negocios: {
                render(container, parent) {
                    const opps = Store.get('oportunidades') || [];

                    container.innerHTML = `
                        <div class="kanban-board animate-fadeIn">
                                ${this.renderStages(opps)}
                        </div>
                    `;

                    this.attachEvents(container, parent);
                },

                renderStages(opps) {
                    const stages = [
                        { id: 'calificacion', label: 'Calificación', color: 'slate' },
                        { id: 'propuesta', label: 'Propuesta', color: 'blue' },
                        { id: 'negociacion', label: 'Negociación', color: 'amber' },
                        { id: 'ganada', label: 'Ganadas', color: 'emerald' },
                        { id: 'perdida', label: 'Perdidas', color: 'rose' }
                    ];

                    return stages.map(stage => {
                        const items = opps.filter(o => o.etapa === stage.id);
                        const total = items.reduce((acc, curr) => acc + (curr.valor || 0), 0);

                        return `
                            <div class="kanban-column" data-status="${stage.id}">
                                <div class="kanban-column-header">
                                    <div class="kanban-column-title">
                                        <div class="w-2.5 h-2.5 rounded-full bg-${stage.color}-500"></div>
                                        <span>${stage.label}</span>
                                        <span class="kanban-column-count">${items.length}</span>
                                    </div>
                                    <div class="text-[10px] font-bold text-gray-400">${Utils.formatCurrency(total)}</div>
                                </div>
                                
                                <div class="kanban-column-body custom-scrollbar" data-status="${stage.id}">
                                    ${items.map(item => `
                                        <div class="kanban-card group active:scale-[0.98] transition-all" draggable="true" data-id="${item.id}">
                                            <div class="flex items-center justify-between mb-3">
                                                <span class="px-2 py-0.5 rounded-md bg-primary-50 text-2xs font-bold text-primary-600 uppercase tracking-tight">
                                                    ${item.cliente}
                                                </span>
                                                <div class="w-6 h-6 rounded-lg bg-gray-50 flex items-center justify-center text-3xs font-black text-gray-400 shadow-sm">
                                                    ${Utils.getInitials(item.responsable)}
                                                </div>
                                            </div>
                                            <h4 class="font-bold text-gray-900 text-sm leading-snug mb-4 group-hover:text-primary-600 transition-colors line-clamp-2">${item.titulo}</h4>
                                            
                                            <div class="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                                                <div class="flex items-center gap-1.5 text-gray-400">
                                                    <i data-lucide="dollar-sign" class="w-3.5 h-3.5"></i>
                                                    <span class="font-black text-xs text-gray-900">${Utils.formatCurrency(item.valor)}</span>
                                                </div>
                                                <div class="text-2xs font-black text-gray-400 uppercase tracking-widest">Lead</div>
                                            </div>
                                        </div>
                                    `).join('')}
                                    <button class="btn btn-ghost btn-sm w-full mt-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 border border-dashed border-gray-200" onclick="window.CRMModule.showNegocioForm(null, {etapa: '${stage.id}'})">
                                        <i data-lucide="plus" class="w-4 h-4 mr-2"></i> Crear Registro
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('');
                },

                attachEvents(container, parent) {
                    const cards = container.querySelectorAll('.kanban-card');
                    const zones = container.querySelectorAll('.kanban-drop-zone');

                    cards.forEach(card => {
                        card.addEventListener('dragstart', (e) => {
                            e.dataTransfer.setData('text/plain', card.dataset.id);
                            card.classList.add('opacity-40');
                        });
                        card.addEventListener('dragend', () => card.classList.remove('opacity-40'));
                        card.addEventListener('click', () => parent.showNegocioDetail(parseInt(card.dataset.id)));
                    });

                    container.querySelectorAll('.kanban-column-body').forEach(zone => {
                        zone.addEventListener('dragover', (e) => {
                            e.preventDefault();
                            zone.classList.add('bg-primary-50/30', 'border-primary-200');
                        });
                        zone.addEventListener('dragleave', () => {
                            zone.classList.remove('bg-primary-50/30', 'border-primary-200');
                        });
                        zone.addEventListener('drop', (e) => {
                            e.preventDefault();
                            zone.classList.remove('bg-primary-50/50', 'border-primary-200');

                            const id = parseInt(e.dataTransfer.getData('text/plain'));
                            const newStage = zone.dataset.status;

                            const opp = Store.find('oportunidades', id);
                            if (opp && opp.etapa !== newStage) {
                                Store.update('oportunidades', id, { etapa: newStage });
                                Components.toast(`Negocio movido a ${newStage}`, 'info');
                                parent.renderCurrentTab();
                            }
                        });
                    });
                }
            },

            actividades: {
                render(container, parent) {
                    const acts = Store.get('actividades') || [];

                    container.innerHTML = `
                        <div class="grid grid-cols-12 gap-8 animate-fadeIn">
                            <div class="col-span-8">
                                <div class="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
                                    <div class="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                                        <h3 class="font-black text-gray-900 text-base">Timeline de Interacciones</h3>
                                        <div class="flex gap-1 p-1 bg-white rounded-xl shadow-inner">
                                            <button class="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all active bg-primary-600 text-white shadow-md shadow-primary-100" data-filter="all">Todas</button>
                                            <button class="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-primary-600 transition-all" data-filter="pending">Pendientes</button>
                                        </div>
                                    </div>
                                    <div class="p-8 space-y-0 relative" id="activity-timeline-new">
                                        <div class="absolute left-[59px] top-8 bottom-8 w-px bg-gray-100"></div>
                                        ${this.renderTimeline(acts)}
                                    </div>
                                </div>
                            </div>
                            
                            <div class="col-span-4">
                                <div class="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 sticky top-4">
                                    <h4 class="font-black text-gray-900 text-sm mb-6 flex items-center gap-2 uppercase tracking-widest">
                                        <i data-lucide="calendar-days" class="w-4 h-4 text-primary-500"></i> Calendario Comercial
                                    </h4>
                                    <div id="mini-calendar-new" class="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                                        ${parent.renderMiniCalendar(acts)}
                                    </div>
                                    <div class="mt-8">
                                        <div class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Próximos Hitos</div>
                                        <div class="space-y-3">
                                            <div class="p-3 rounded-2xl bg-primary-50 border border-primary-100 flex items-center gap-3">
                                                <div class="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></div>
                                                <div class="text-xs font-black text-primary-900">Demo Técnica Aura</div>
                                            </div>
                                            <div class="p-3 rounded-2xl bg-amber-50 border border-amber-100 flex items-center gap-3">
                                                <div class="w-2 h-2 rounded-full bg-amber-500"></div>
                                                <div class="text-xs font-black text-amber-900">Cierre Q1 - Rev. Metas</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;

                    this.attachEvents(container, parent);
                },

                renderTimeline(acts) {
                    if (!acts.length) return `<div class="p-12 text-center text-gray-400 italic">No hay registros de actividad</div>`;

                    const sorted = acts.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

                    return sorted.map(a => `
                        <div class="relative pl-16 pb-10 last:pb-0 group cursor-pointer" onclick="window.CRMModule.showActividadForm(${a.id})">
                            <div class="absolute left-[20px] top-1.5 w-2 h-2 rounded-full bg-white border-2 ${a.completada ? 'border-emerald-500' : 'border-primary-500'} z-10 transition-transform group-hover:scale-150"></div>
                            <div class="flex flex-col gap-1">
                                <div class="flex items-center gap-2">
                                    <span class="text-2xs font-black text-gray-400 uppercase tracking-widest">${Utils.formatRelativeTime(a.fecha)}</span>
                                    <span class="w-1 h-1 rounded-full bg-gray-300"></span>
                                    <span class="text-2xs font-black ${a.completada ? 'text-emerald-500' : 'text-primary-500'} uppercase tracking-tight">${a.tipo}</span>
                                </div>
                                <h5 class="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">${a.titulo}</h5>
                                <div class="text-xs text-secondary mt-1 max-w-xl leading-relaxed">
                                    ${a.resultado || `Seguimiento activo con <span class="font-bold text-gray-700">${a.cliente}</span>. Responsable: ${a.responsable}.`}
                                </div>
                            </div>
                        </div>
                    `).join('');
                },

                attachEvents(container, parent) {
                    container.querySelectorAll('[data-filter]').forEach(btn => {
                        btn.onclick = () => {
                            container.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active', 'bg-gray-100'));
                            btn.classList.add('active', 'bg-gray-100');
                            const filter = btn.dataset.filter;
                            let acts = Store.get('actividades');
                            if (filter === 'pending') acts = acts.filter(a => !a.completada);
                            document.getElementById('activity-timeline-new').innerHTML = this.renderTimeline(acts);
                            if (window.lucide) lucide.createIcons();
                        };
                    });
                }
            },

            inbox: {
                render(container, parent) {
                    const msgs = Store.get('crm_mensajes') || [];

                    container.innerHTML = `
                        <div class="grid grid-cols-12 gap-0 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden" style="height: 700px;">
                            <div class="col-span-4 border-r border-gray-50 flex flex-col bg-gray-50/30">
                                <div class="p-6 bg-white border-b border-gray-50">
                                    <h3 class="font-black text-gray-900 mb-4">Comunicaciones</h3>
                                    ${Components.searchInput({ placeholder: 'Asunto o email...', id: 'inbox-search-new' })}
                                </div>
                                <div class="flex-1 overflow-y-auto custom-scrollbar" id="inbox-msg-list">
                                    ${this.renderMsgList(msgs)}
                                </div>
                            </div>
                            <div class="col-span-8 flex flex-col bg-white" id="msg-content-new">
                                <div class="flex-1 flex flex-col items-center justify-center text-gray-400 p-12 text-center opacity-40">
                                    <i data-lucide="mail-open" class="w-16 h-16 mb-4"></i>
                                    <h4 class="font-bold">Selecciona una conversación</h4>
                                    <p class="text-xs">Usa el panel de la izquierda para navegar tus mensajes.</p>
                                </div>
                            </div>
                        </div>
                    `;

                    this.attachEvents(container, parent);
                },

                renderMsgList(msgs) {
                    if (!msgs.length) return `<div class="p-12 text-center text-gray-400 italic">No hay mensajes recientes</div>`;

                    return msgs.map(m => `
                        <div class="p-6 border-b border-gray-50 cursor-pointer hover:bg-white transition-all msg-item-new group ${m.leido ? 'opacity-60' : 'bg-primary-50/50 border-l-4 border-l-primary-500'}" data-id="${m.id}">
                            <div class="flex justify-between items-start mb-2">
                                <div class="font-black text-gray-900 text-sm truncate pr-4">${m.de}</div>
                                <div class="text-[9px] font-black text-gray-400 uppercase shrink-0">${Utils.formatRelativeTime(m.fecha)}</div>
                            </div>
                            <div class="text-xs font-bold text-primary-600 mb-1 group-hover:underline">${m.asunto}</div>
                            <div class="text-xs text-secondary line-clamp-2 leading-relaxed pb-1">${m.cuerpo}</div>
                        </div>
                    `).join('');
                },

                attachEvents(container, parent) {
                    container.querySelectorAll('.msg-item-new').forEach(item => {
                        item.onclick = () => {
                            const id = parseInt(item.dataset.id);
                            this.viewMessage(id, container, parent);
                            container.querySelectorAll('.msg-item-new').forEach(i => i.classList.remove('bg-white', 'shadow-inner'));
                            item.classList.add('bg-white', 'shadow-inner');
                        };
                    });

                    document.getElementById('inbox-search-new')?.addEventListener('input', Utils.debounce((e) => {
                        const filtered = Utils.search(Store.get('crm_mensajes'), e.target.value, ['asunto', 'de', 'email']);
                        document.getElementById('inbox-msg-list').innerHTML = this.renderMsgList(filtered);
                        this.attachEvents(container, parent);
                    }, 300));
                },

                viewMessage(id, container, parent) {
                    const msg = Store.find('crm_mensajes', id);
                    const viewport = document.getElementById('msg-content-new');
                    if (!msg || !viewport) return;

                    const opps = Store.get('oportunidades');

                    viewport.innerHTML = `
                        <div class="flex flex-col h-full animate-fadeIn">
                             <div class="p-8 border-b border-gray-50">
                                <div class="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 class="text-xl font-black text-gray-900 mb-1">${msg.asunto}</h2>
                                        <div class="flex items-center gap-3">
                                            <div class="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center font-black text-sm">
                                                ${Utils.getInitials(msg.de)}
                                            </div>
                                            <div>
                                                <div class="text-sm font-bold text-gray-800">${msg.de} <span class="text-xs font-normal text-gray-400">&lt;${msg.email}&gt;</span></div>
                                                <div class="text-[10px] text-gray-400 font-black uppercase">${Utils.formatDate(msg.fecha)} · ${msg.fecha.split(' ')[1] || ''}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="flex gap-2">
                                        <button class="btn btn-sm btn-ghost hover:bg-gray-100"><i data-lucide="reply" class="w-4 h-4"></i></button>
                                        <button class="btn btn-sm btn-ghost hover:bg-gray-100"><i data-lucide="forward" class="w-4 h-4"></i></button>
                                    </div>
                                </div>
                                
                                <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                    <div class="flex-1">
                                        <div class="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em] mb-1">Vinculación Comercial</div>
                                        <div class="flex items-center gap-2">
                                            <i data-lucide="briefcase" class="w-4 h-4 text-primary-500"></i>
                                            <select class="bg-transparent border-none text-sm font-bold text-gray-900 focus:ring-0 p-0 cursor-pointer" id="link-inbox-opp-new">
                                                <option value="">— Sin Vincular —</option>
                                                ${opps.map(o => `<option value="${o.id}" ${o.id === msg.negocioId ? 'selected' : ''}>${o.titulo}</option>`).join('')}
                                            </select>
                                        </div>
                                    </div>
                                    ${msg.negocioId ? `
                                        <button class="btn btn-xs btn-primary bg-primary-50 text-primary-600 border-none hover:bg-primary-100" onclick="window.CRMModule.showNegocioDetail(${msg.negocioId})">
                                            Ver Negocio <i data-lucide="external-link" class="w-3 h-3 ml-1"></i>
                                        </button>
                                    ` : ''}
                                </div>
                             </div>

                             <div class="flex-1 p-8 overflow-y-auto custom-scrollbar bg-white">
                                <div class="prose prose-sm max-w-none text-gray-700 leading-relaxed font-medium">
                                    ${msg.cuerpo.replace(/\n/g, '<br>')}
                                </div>
                             </div>

                             <div class="p-6 border-t border-gray-50 bg-gray-50/50 flex justify-end gap-3">
                                <button class="btn btn-outline border-none bg-white">Ignorar</button>
                                <button class="btn btn-primary px-10">Responder</button>
                             </div>
                        </div>
                    `;

                    if (window.lucide) lucide.createIcons();

                    const sel = document.getElementById('link-inbox-opp-new');
                    if (sel) {
                        sel.onchange = (e) => {
                            const val = e.target.value ? parseInt(e.target.value) : null;
                            Store.update('crm_mensajes', msg.id, { negocioId: val });
                            Components.toast('Negocio vinculado con éxito', 'success');
                            this.render(container, parent); // Refresh module
                            this.viewMessage(msg.id, container, parent); // Re-open
                        };
                    }
                }
            }
        },

        // --- Shared Modals (CRM Core Logic) ---

        /**
         * Show 360 Client View
         */
        showClienteDetail(id) {
            const client = Store.find('clientes', id);
            if (!client) return;

            const renderNestedTab = (tab) => {
                switch (tab) {
                    case 'info':
                        return `
                            <div class="space-y-8 animate-fadeIn">
                                <div class="grid grid-cols-4 gap-4">
                                    <div class="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div class="text-[9px] font-black text-gray-400 uppercase mb-1">RUT Empresa</div>
                                        <div class="font-bold text-gray-900">${client.rut}</div>
                                    </div>
                                    <div class="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div class="text-[9px] font-black text-gray-400 uppercase mb-1">Industria</div>
                                        <div class="font-bold text-gray-900">${client.sector}</div>
                                    </div>
                                    <div class="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div class="text-[9px] font-black text-gray-400 uppercase mb-1">Estado</div>
                                        <span class="badge ${Utils.getStatusColor(client.estado)} mt-1">${client.estado}</span>
                                    </div>
                                    <div class="p-5 bg-primary-50 rounded-2xl border border-primary-100">
                                        <div class="text-[9px] font-black text-primary-400 uppercase mb-1">Ingresos Acumulados</div>
                                        <div class="font-black text-primary-700">${Utils.formatCurrency(client.valor)}</div>
                                    </div>
                                </div>

                                <div class="flex flex-col gap-4">
                                    <div class="flex items-center justify-between">
                                        <h4 class="font-bold text-gray-900 flex items-center gap-2">
                                            <i data-lucide="contact" class="w-4 h-4 text-primary-500"></i> Contactos Registrados
                                        </h4>
                                        <button class="btn btn-xs btn-primary bg-primary-50 text-primary-600 border-none" onclick="window.CRMModule.showContactForm(${client.id})">
                                            <i data-lucide="plus" class="w-3 h-3 mr-1"></i> Añadir
                                        </button>
                                    </div>
                                    <div class="grid grid-cols-2 gap-4">
                                        ${(client.contactos || []).map(c => `
                                            <div class="p-4 border border-gray-100 rounded-2xl bg-white flex items-center gap-4 group">
                                                <div class="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center font-bold">
                                                    ${Utils.getInitials(c.nombre)}
                                                </div>
                                                <div class="flex-1 min-w-0">
                                                    <div class="font-bold text-gray-900 truncate text-sm">${c.nombre}</div>
                                                    <div class="text-[10px] text-primary-600 font-black uppercase mb-1">${c.cargo || 'Funcionario'}</div>
                                                    <div class="text-[10px] text-gray-400 truncate">${c.email}</div>
                                                </div>
                                            </div>
                                        `).join('')}
                                        ${(!client.contactos?.length) ? `<div class="col-span-2 text-center py-6 text-gray-400 text-xs italic bg-gray-50/50 rounded-2xl">Solo se registra el contacto principal.</div>` : ''}
                                    </div>
                                </div>
                            </div>
                        `;
                    case 'negocios':
                        const myOpps = Store.filter('oportunidades', o => o.clienteId === id);
                        return `
                             <div class="space-y-4 animate-fadeIn">
                                <div class="flex items-center justify-between">
                                    <h4 class="font-bold text-gray-900">Oportunidades en Curso</h4>
                                    <button class="btn btn-xs btn-primary" onclick="Components.modal.closeAll(); window.CRMModule.showNegocioForm(null, { clienteId: ${id} })">Abrir Nuevo</button>
                                </div>
                                <div class="flex flex-col gap-3">
                                    ${myOpps.map(o => `
                                        <div class="p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all cursor-pointer flex items-center justify-between" onclick="Components.modal.closeAll(); window.CRMModule.showNegocioDetail(${o.id})">
                                            <div class="flex items-center gap-4">
                                                <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                                    <i data-lucide="briefcase" class="w-5 h-5"></i>
                                                </div>
                                                <div>
                                                    <div class="font-bold text-gray-900 text-sm">${o.titulo}</div>
                                                    <div class="text-[10px] text-gray-400 font-bold uppercase">${o.etapa} · Cierre: ${o.fechaCierre || 'Pendiente'}</div>
                                                </div>
                                            </div>
                                            <div class="text-right">
                                                <div class="font-black text-gray-900 text-sm">${Utils.formatCurrency(o.valor)}</div>
                                            </div>
                                        </div>
                                    `).join('')}
                                    ${!myOpps.length ? `<div class="py-20 text-center text-gray-400 text-xs">Sin registros históricos de negocios.</div>` : ''}
                                </div>
                             </div>
                        `;
                    default: return `<div class="py-20 text-center text-gray-400">Próximamente integración completa con otros módulos.</div>`;
                }
            };

            const { modal } = Components.modal({
                title: 'Perfil 360° del Cliente',
                size: 'xl',
                content: `
                    <div class="flex flex-col gap-8 -mt-2">
                        <div class="flex items-center gap-6 p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
                            <div class="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-primary-200">
                                ${Utils.getInitials(client.nombre)}
                            </div>
                            <div class="flex-1">
                                <div class="text-[11px] font-black text-primary-500 uppercase tracking-[0.2em] mb-1">Cliente Corporativo</div>
                                <h1 class="text-3xl font-black text-gray-900 tracking-tight">${client.nombre}</h1>
                                <div class="flex items-center gap-4 mt-2">
                                     <div class="flex items-center gap-1.5 text-xs text-gray-500 font-bold bg-gray-100 px-3 py-1 rounded-full uppercase">
                                        <i data-lucide="user" class="w-3.5 h-3.5"></i> ${client.contacto}
                                    </div>
                                    <div class="flex items-center gap-1.5 text-xs text-primary-600 font-bold bg-primary-50 px-3 py-1 rounded-full uppercase">
                                        <i data-lucide="mail" class="w-3.5 h-3.5"></i> ${client.email}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="flex gap-1 bg-gray-100 p-1.5 rounded-2xl w-fit mx-auto">
                            <button class="px-8 py-2.5 rounded-xl text-xs font-black transition-all detail-nav active" data-tab="info">Información General</button>
                            <button class="px-8 py-2.5 rounded-xl text-xs font-black transition-all detail-nav" data-tab="negocios">Pipeline & Negocios</button>
                            <button class="px-8 py-2.5 rounded-xl text-xs font-black transition-all detail-nav" data-tab="servicios">Servicios & Soporte</button>
                            <button class="px-8 py-2.5 rounded-xl text-xs font-black transition-all detail-nav" data-tab="ventas">Ventas Públicas</button>
                        </div>

                        <div id="nested-client-viewport" class="min-h-[400px]">
                            ${renderNestedTab('info')}
                        </div>
                    </div>
                `
            });

            if (window.lucide) lucide.createIcons();

            modal.querySelectorAll('.detail-nav').forEach(btn => {
                btn.onclick = () => {
                    modal.querySelectorAll('.detail-nav').forEach(b => b.classList.remove('active', 'bg-white', 'shadow-sm', 'text-primary-600'));
                    btn.classList.add('active', 'bg-white', 'shadow-sm', 'text-primary-600');
                    modal.querySelector('#nested-client-viewport').innerHTML = renderNestedTab(btn.dataset.tab);
                    if (window.lucide) lucide.createIcons();
                };
            });
            // Add specific styles for internal tabs if not exist
            if (!document.getElementById('crm-nested-styles')) {
                const style = document.createElement('style');
                style.id = 'crm-nested-styles';
                style.innerHTML = `
                    .detail-nav { color: #64748b; }
                    .detail-nav.active { color: var(--color-primary-600); }
                `;
                document.head.appendChild(style);
            }
        },

        /**
         * Show Oportunidad / Negocio detail modal
         */
        showNegocioDetail(id) {
            const opp = Store.find('oportunidades', id);
            if (!opp) return;

            const activities = Store.filter('actividades', a => a.oportunidadId === id);
            const emails = Store.filter('crm_mensajes', m => m.negocioId === id);
            const timeline = [...activities.map(a => ({ ...a, typeLabel: 'Actividad' })), ...emails.map(e => ({ ...e, typeLabel: 'Correo', titulo: e.asunto }))]
                .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

            const { modal } = Components.modal({
                title: 'Ficha de Oportunidad Comercial',
                size: 'xl',
                content: `
                    <div class="flex flex-col gap-0 -m-6 h-[80vh] bg-gray-50/50">
                         <div class="bg-white p-8 border-b border-gray-100 shadow-sm flex justify-between items-end">
                            <div class="space-y-4">
                                <div class="flex items-center gap-4">
                                    <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center shadow-lg shadow-blue-200">
                                        <i data-lucide="briefcase" class="w-7 h-7"></i>
                                    </div>
                                    <div>
                                        <div class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Pipeline Comercial</div>
                                        <h2 class="text-3xl font-black text-gray-900 tracking-tight">${opp.titulo}</h2>
                                    </div>
                                </div>
                                <div class="flex items-center gap-8">
                                    <div class="flex flex-col">
                                        <span class="text-[9px] font-black text-gray-400 uppercase mb-1">Empresa</span>
                                        <span class="text-sm font-bold text-gray-700">${opp.cliente}</span>
                                    </div>
                                    <div class="w-px h-8 bg-gray-100"></div>
                                    <div class="flex flex-col">
                                        <span class="text-[9px] font-black text-gray-400 uppercase mb-1">Valor Estimado</span>
                                        <span class="text-sm font-black text-primary-600">${Utils.formatCurrency(opp.valor)}</span>
                                    </div>
                                    <div class="w-px h-8 bg-gray-100"></div>
                                    <div class="flex flex-col">
                                        <span class="text-[9px] font-black text-gray-400 uppercase mb-1">Cierre Proyectado</span>
                                        <span class="text-sm font-bold text-gray-700">${opp.fechaCierre || 'Sin definir'}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="flex gap-2">
                                <button class="btn btn-outline border-gray-200" onclick="window.CRMModule.showNegocioForm(${opp.id})"><i data-lucide="edit-3" class="w-4 h-4 mr-2"></i> Editar Negocio</button>
                                <button class="btn btn-primary px-8 shadow-xl shadow-primary-200">Gestionar Propuesta</button>
                            </div>
                         </div>

                         <div class="flex-1 grid grid-cols-12 overflow-hidden">
                             <div class="col-span-4 border-r border-gray-100 p-8 overflow-y-auto bg-white custom-scrollbar">
                                <div class="space-y-10">
                                    <section>
                                        <h4 class="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
                                            <i data-lucide="info" class="w-3 h-3 text-primary-500"></i> Parámetros de Ventas
                                        </h4>
                                        <div class="space-y-4">
                                             <div class="flex justify-between items-center bg-gray-50 p-4 rounded-2xl">
                                                <span class="text-xs font-bold text-gray-500 uppercase">Probabilidad</span>
                                                <span class="font-black text-gray-900">${opp.probabilidad}%</span>
                                            </div>
                                             <div class="flex justify-between items-center bg-gray-50 p-4 rounded-2xl">
                                                <span class="text-xs font-bold text-gray-500 uppercase">Responsable</span>
                                                <span class="font-bold text-gray-900">${opp.responsable}</span>
                                            </div>
                                             <div class="flex justify-between items-center bg-gray-50 p-4 rounded-2xl">
                                                <span class="text-xs font-bold text-gray-500 uppercase">Etapa Actual</span>
                                                <span class="badge ${Utils.getStatusColor(opp.etapa)}">${opp.etapa.toUpperCase()}</span>
                                            </div>
                                        </div>
                                    </section>
                                </div>
                             </div>

                             <div class="col-span-8 p-8 overflow-y-auto custom-scrollbar bg-gray-50/20">
                                <div class="flex items-center justify-between mb-8">
                                    <h4 class="font-black text-gray-900 text-sm italic uppercase tracking-wider">Historial de Interacciones</h4>
                                    <button class="btn btn-xs btn-outline bg-white" onclick="window.CRMModule.showActividadForm(null, { oportunidadId: ${opp.id}, cliente: '${opp.cliente.replace(/'/g, "\\'")}' })">
                                        <i data-lucide="plus" class="w-3 h-3 mr-1"></i> Registrar Hito
                                    </button>
                                </div>
                                <div class="relative pl-6 border-l-2 border-gray-100 space-y-6">
                                    ${timeline.map(item => `
                                        <div class="relative bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                            <div class="absolute -left-[33px] top-4 w-6 h-6 rounded-full bg-white border-2 border-primary-500 flex items-center justify-center text-primary-500 shadow-sm z-10">
                                                <i data-lucide="${item.typeLabel === 'Actividad' ? 'zap' : 'mail'}" class="w-2.5 h-2.5"></i>
                                            </div>
                                            <div class="text-[9px] font-black text-gray-400 mb-1 uppercase tracking-widest">${item.typeLabel} • ${Utils.formatRelativeTime(item.fecha)}</div>
                                            <div class="font-bold text-gray-900 text-sm">${item.titulo}</div>
                                            ${item.cuerpo || item.resultado ? `<div class="mt-3 text-xs text-gray-500 line-clamp-3 bg-gray-50 p-3 rounded-xl border-l-2 border-gray-200">"${item.cuerpo || item.resultado}"</div>` : ''}
                                        </div>
                                    `).join('')}
                                    ${!timeline.length ? `<div class="text-center py-20 text-gray-300 italic text-sm">Sin interacciones registradas aún.</div>` : ''}
                                </div>
                             </div>
                         </div>
                    </div>
                `
            });

            if (window.lucide) lucide.createIcons();
        },

        // --- Form Logic ---

        showClienteForm(id = null) {
            const data = id ? Store.find('clientes', id) : null;
            const isEdit = !!data;

            const { modal, close } = Components.modal({
                title: isEdit ? 'Actualizar Cliente' : 'Nuevo Cliente Corporativo',
                size: 'lg',
                content: `
                    <form id="form-cliente-new" class="grid grid-cols-2 gap-6">
                        ${Components.formInput({ label: 'Nombre Legal / Empresa', name: 'nombre', value: data?.nombre || '', required: true })}
                        ${Components.formInput({ label: 'RUT / ID Tax', name: 'rut', value: data?.rut || '', required: true })}
                        ${Components.formInput({
                    label: 'Sector Industrial', name: 'sector', type: 'select', value: data?.sector || '', options: [
                        { value: 'Tecnología', label: 'Tecnología' },
                        { value: 'Minería', label: 'Minería' },
                        { value: 'Construcción', label: 'Construcción' },
                        { value: 'Salud', label: 'Salud' },
                        { value: 'Retail', label: 'Retail' }
                    ]
                })}
                        ${Components.formInput({
                    label: 'Estado Inicial', name: 'estado', type: 'select', value: data?.estado || 'Prospecto', options: [
                        { value: 'Prospecto', label: 'Prospecto' },
                        { value: 'Activo', label: 'Activo' },
                        { value: 'Inactivo', label: 'Inactivo' }
                    ]
                })}
                        ${Components.formInput({ label: 'Contacto Principal', name: 'contacto', value: data?.contacto || '', required: true })}
                        ${Components.formInput({ label: 'Email Corporativo', name: 'email', type: 'email', value: data?.email || '', required: true })}
                    </form>
                `,
                footer: `
                    <button class="btn btn-ghost" data-action="cancel">Descartar</button>
                    <button class="btn btn-primary px-10" data-action="save-client">
                        <i data-lucide="check-circle" class="w-4 h-4 mr-2"></i> ${isEdit ? 'Refrescar Datos' : 'Registrar Empresa'}
                    </button>
                `
            });

            if (window.lucide) lucide.createIcons();

            modal.querySelector('[data-action="cancel"]').onclick = close;
            modal.querySelector('[data-action="save-client"]').onclick = () => {
                const form = document.getElementById('form-cliente-new');
                if (!form.checkValidity()) return form.reportValidity();

                const payload = Object.fromEntries(new FormData(form).entries());
                if (isEdit) {
                    Store.update('clientes', id, payload);
                    Components.toast('Cliente actualizado', 'success');
                } else {
                    Store.add('clientes', { ...payload, valor: 0, oportunidades: 0, contactos: [] });
                    Components.toast('Nuevo cliente registrado', 'success');
                }
                close();
                this.renderCurrentTab();
            };
        },

        showNegocioForm(id = null, defaults = {}) {
            const data = id ? Store.find('oportunidades', id) : null;
            const isEdit = !!data;
            const clients = Store.get('clientes') || [];

            const { modal, close } = Components.modal({
                title: isEdit ? 'Editar Oportunidad' : 'Nueva Oportunidad Comercial',
                size: 'md',
                content: `
                    <form id="form-negocio-new" class="flex flex-col gap-5">
                        ${Components.formInput({ label: 'Título descriptivo', name: 'titulo', value: data?.titulo || '', required: true })}
                        ${Components.formInput({ label: 'Cliente asociado', name: 'clienteId', type: 'select', value: data?.clienteId || defaults.clienteId || '', required: true, options: clients.map(c => ({ value: c.id, label: c.nombre })) })}
                        <div class="grid grid-cols-2 gap-4">
                            ${Components.formInput({ label: 'Valor Estimado', name: 'valor', type: 'number', value: data?.valor || '', required: true })}
                            ${Components.formInput({ label: '% Probabilidad', name: 'probabilidad', type: 'number', value: data?.probabilidad || 50 })}
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                             ${Components.formInput({
                    label: 'Etapa del Pipeline', name: 'etapa', type: 'select', value: data?.etapa || 'calificacion', options: [
                        { value: 'calificacion', label: 'Calificación' },
                        { value: 'propuesta', label: 'Propuesta' },
                        { value: 'negociacion', label: 'Negociación' },
                        { value: 'ganada', label: 'Ganada' },
                        { value: 'perdida', label: 'Perdida' }
                    ]
                })}
                            ${Components.formInput({ label: 'Cierre Proyectado', name: 'fechaCierre', type: 'date', value: data?.fechaCierre || '' })}
                        </div>
                        ${Components.formInput({ label: 'Responsable', name: 'responsable', value: data?.responsable || Store.state.user.name })}
                    </form>
                 `,
                footer: `
                    <button class="btn btn-ghost" data-action="cancel">Cancelar</button>
                    <button class="btn btn-primary" data-action="save-negocio">Persistir Registro</button>
                 `
            });

            if (window.lucide) lucide.createIcons();

            modal.querySelector('[data-action="cancel"]').onclick = close;
            modal.querySelector('[data-action="save-negocio"]').onclick = () => {
                const form = document.getElementById('form-negocio-new');
                if (!form.checkValidity()) return form.reportValidity();

                const payload = Object.fromEntries(new FormData(form).entries());
                payload.clienteId = parseInt(payload.clienteId);
                payload.valor = parseFloat(payload.valor);
                payload.cliente = clients.find(c => c.id === payload.clienteId)?.nombre || '';

                if (isEdit) {
                    Store.update('oportunidades', id, payload);
                    Components.toast('Negocio actualizado', 'success');
                } else {
                    Store.add('oportunidades', payload);
                    Components.toast('Nuevo negocio en pipeline', 'success');
                }
                close();
                this.renderCurrentTab();
            };
        },

        showActividadForm(id = null, defaults = {}) {
            const data = id ? Store.find('actividades', id) : null;
            const isEdit = !!data;
            const clients = Store.get('clientes') || [];

            const { modal, close } = Components.modal({
                title: isEdit ? 'Actualizar Hito' : 'Registrar nueva Actividad',
                size: 'md',
                content: `
                    <form id="form-actividad-new" class="flex flex-col gap-4">
                        <div class="grid grid-cols-2 gap-4">
                            ${Components.formInput({ label: 'Tipo', name: 'tipo', type: 'select', value: data?.tipo || 'reunion', options: [{ value: 'llamada', label: 'Llamada' }, { value: 'reunion', label: 'Reunión' }, { value: 'email', label: 'Email' }] })}
                            ${Components.formInput({ label: 'Título / Resumen', name: 'titulo', value: data?.titulo || '', required: true })}
                        </div>
                        ${Components.formInput({ label: 'Cliente', name: 'cliente', type: 'select', value: data?.cliente || defaults.cliente || '', options: clients.map(c => ({ value: c.nombre, label: c.nombre })) })}
                        <div class="grid grid-cols-2 gap-4">
                            ${Components.formInput({ label: 'Fecha', name: 'fecha', type: 'date', value: data?.fecha || new Date().toISOString().split('T')[0] })}
                            ${Components.formInput({ label: 'Hora', name: 'hora', type: 'time', value: data?.hora || '09:00' })}
                        </div>
                         <label class="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl cursor-pointer">
                            <input type="checkbox" name="completada" ${data?.completada ? 'checked' : ''} class="w-5 h-5 accent-primary-600">
                            <div class="flex flex-col">
                                <span class="font-black text-xs text-gray-900 uppercase">Actividad Realizada</span>
                                <span class="text-[10px] text-gray-400 font-bold">Marcar para habilitar registro de resultados</span>
                            </div>
                        </label>
                        <div id="res-box-new" class="${data?.completada ? '' : 'hidden'}">
                             ${Components.formInput({ label: 'Acuerdos / Resultados', name: 'resultado', type: 'textarea', value: data?.resultado || '' })}
                        </div>
                    </form>
                 `,
                footer: `
                    <button class="btn btn-ghost" data-action="cancel">Cancelar</button>
                    <button class="btn btn-primary" data-action="save-act">Guardar Actividad</button>
                 `
            });

            const chk = modal.querySelector('[name="completada"]');
            chk.onchange = () => modal.querySelector('#res-box-new').classList.toggle('hidden', !chk.checked);

            modal.querySelector('[data-action="cancel"]').onclick = close;
            modal.querySelector('[data-action="save-act"]').onclick = () => {
                const form = document.getElementById('form-actividad-new');
                if (!form.checkValidity()) return form.reportValidity();
                const payload = Object.fromEntries(new FormData(form).entries());
                payload.completada = chk.checked;
                payload.responsable = Store.state.user.name;

                if (isEdit) {
                    Store.update('actividades', id, payload);
                    Components.toast('Actividad actualizada', 'success');
                } else {
                    Store.add('actividades', payload);
                    Components.toast('Actividad agendada', 'success');
                }
                close();
                this.renderCurrentTab();
            };
            if (window.lucide) lucide.createIcons();
        },

        // --- Helper Renderers ---

        renderMiniCalendar(acts) {
            const year = this._calYear;
            const month = this._calMonth;
            const first = new Date(year, month, 1);
            const last = new Date(year, month + 1, 0);
            const mName = new Date(year, month).toLocaleString('es-CL', { month: 'long', year: 'numeric' });

            let html = `
                <div class="flex items-center justify-between mb-4 px-2">
                    <span class="text-xs font-black uppercase text-gray-400 tracking-tighter">${mName}</span>
                    <div class="flex gap-1">
                        <button class="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-gray-100" id="cal-prev-btn"><i data-lucide="chevron-left" class="w-3.5 h-3.5"></i></button>
                        <button class="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-gray-100" id="cal-next-btn"><i data-lucide="chevron-right" class="w-3.5 h-3.5"></i></button>
                    </div>
                </div>
                <div class="grid grid-cols-7 text-center text-2xs font-black text-gray-300 mb-2 uppercase">
                    <div>Do</div><div>Lu</div><div>Ma</div><div>Mi</div><div>Ju</div><div>Vi</div><div>Sa</div>
                </div>
                <div class="grid grid-cols-7 gap-1 text-center font-bold text-xs" id="cal-grid-new">
            `;

            for (let i = 0; i < first.getDay(); i++) html += `<div></div>`;
            for (let i = 1; i <= last.getDate(); i++) {
                const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
                const hasAct = acts.some(a => a.fecha === dStr);
                const isToday = i === new Date().getDate() && month === new Date().getMonth();

                html += `
                    <div class="relative w-8 h-8 flex items-center justify-center rounded-xl transition-all cursor-default
                                ${isToday ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' : 'text-gray-600 hover:bg-gray-50'}
                                ${hasAct && !isToday ? 'border-b-2 border-primary-500' : ''}">
                        ${i}
                        ${hasAct && !isToday ? `<div class="absolute bottom-1 w-1 h-1 bg-primary-500 rounded-full"></div>` : ''}
                    </div>
                `;
            }
            html += `</div>`;

            // Timeout to attach nav events because of string template
            setTimeout(() => {
                const prev = document.getElementById('cal-prev-btn');
                const next = document.getElementById('cal-next-btn');
                if (prev) prev.onclick = () => { this._calMonth--; if (this._calMonth < 0) { this._calMonth = 11; this._calYear--; } this.renderCurrentTab(); };
                if (next) next.onclick = () => { this._calMonth++; if (this._calMonth > 11) { this._calMonth = 0; this._calYear++; } this.renderCurrentTab(); };
            }, 0);

            return html;
        }

    };

    // Public API
    window.CRMModule = CRMModule;
    console.log('CRMModule: Aura Intelligent Hub desplegado con éxito.');

    // Custom Module Styles (Auditoría UI/UX: Añadiendo micro-interacciones faltantes)
    if (!document.getElementById('crm-v6-styles')) {
        const style = document.createElement('style');
        style.id = 'crm-v6-styles';
        style.innerHTML = `
            .kanban-card-v6:hover { transform: translateY(-3px) scale(1.01); }
            .kanban-scroll-area { scrollbar-gutter: stable; }
            .detail-nav.active { 
                background: white; 
                color: var(--color-primary-600); 
                box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05);
            }
            .msg-item-new:hover { background-color: white !important; }
            .msg-item-new.shadow-inner { border-right: 4px solid var(--color-primary-500); }
            .glass-header { background: rgba(255,255,255,0.7); backdrop-filter: blur(10px); }
        `;
        document.head.appendChild(style);
    }

})();
