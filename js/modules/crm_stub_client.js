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
            console.error('CRMModule: No se encontrÃ³ el contenedor page-content');
            return;
        }

        content.innerHTML = `
            <div class="animate-fadeIn">
                ${Components.pageHeader({
            title: 'CRM',
            subtitle: 'GestiÃ³n de clientes y negocios comerciales',
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
        container.innerHTML = 'Client View Stubbed';
    },


    showNegocioDetail(id) {
        const negocio = Store.find('oportunidades', id);
        if (!negocio) return;

        let activeTab = 'actividades';

        const renderHistory = () => {
            const actividades = Store.filter('actividades', a => a.oportunidadId === id).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

            if (actividades.length === 0) return `
                <div class="flex flex-col items-center justify-center py-20 text-gray-400 opacity-50">
                    <i data-lucide="history" class="w-16 h-16 mb-4"></i>
                    <p class="font-bold">No hay actividad registrada aÃºn</p>
                    <p class="text-xs">Usa los botones superiores para registrar llamadas o correos.</p>
                </div>
            `;

            return `
                <div class="relative pl-8 border-l-2 border-gray-100 space-y-8 mt-4">
                    ${actividades.map(item => {
                const icon = item.tipo === 'llamada' ? 'phone' : item.tipo === 'reunion' ? 'users' : 'calendar';
                return `
                            <div class="relative">
                                <div class="absolute -left-[41px] top-0 w-8 h-8 rounded-full bg-white border-2 border-primary-500 flex items-center justify-center text-primary-500 shadow-sm z-10">
                                    <i data-lucide="${icon}" class="w-3.5 h-3.5"></i>
                                </div>
                                <div class="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                    <div class="flex justify-between items-start mb-2">
                                        <div>
                                            <div class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">${item.tipo} â€¢ ${Utils.formatRelativeTime(item.fecha)}</div>
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
                        <button class="btn btn-primary shadow-lg shadow-primary-200"><i data-lucide="send" class="w-4 h-4 mr-2"></i> Enviar CotizaciÃ³n</button>
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
                                <i data-lucide="users" class="w-3.5 h-3.5"></i> ReuniÃ³n
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
            { id: 'calificacion', name: 'CalificaciÃ³n', color: '#94a3b8' },
            { id: 'propuesta', name: 'Propuesta', color: '#3b82f6' },
            { id: 'negociacion', name: 'NegociaciÃ³n', color: '#f59e0b' },
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
                ${Components.formInput({ label: 'TÃ­tulo del Negocio', name: 'titulo', value: oportunidad?.titulo || '', required: true })}
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
                { value: 'calificacion', label: 'CalificaciÃ³n' },
                { value: 'propuesta', label: 'Propuesta' },
                { value: 'negociacion', label: 'NegociaciÃ³n' },
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
                    <div class="timeline-description">${act.cliente}${act.responsable ? ` Â· <strong>${act.responsable}</strong>` : ''}</div>
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
                { value: 'reunion', label: 'ReuniÃ³n' },
                { value: 'email', label: 'Email' }
            ]
        })}
                ${Components.formInput({ label: 'Asunto / TÃ­tulo', name: 'titulo', value: actividad?.titulo || '', required: true })}
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
            options: [{ value: '', label: 'â€” Sin vincular â€”' }, ...clienteOpps.map(o => ({ value: o.id, label: o.titulo }))]
        })}
                </div>
                ${Components.formInput({
            label: 'Responsable / Encargado',
            name: 'responsable',
            type: 'select',
            required: true,
            value: preResponsable,
            options: empleados.map(e => ({ value: e.nombre, label: `${e.nombre} â€” ${e.cargo}` }))
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
            placeholder: 'Describe el resultado de la reuniÃ³n o llamada...'
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
                negocioSelect.innerHTML = `<option value="">â€” Sin vincular â€”</option>` +
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
console.log('CRMModule: MÃ³dulo cargado correctamente y listo.');
