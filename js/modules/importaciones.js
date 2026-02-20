/* ==========================================================================
   EAX Platform - Módulo de Importaciones (Versión 100% Funcional)
   ========================================================================== */

const ImportacionesModule = {
    currentTab: 'torre-control',
    searchTerm: '',

    render() {
        const container = document.getElementById('page-content');
        if (!container) return;

        container.innerHTML = `
            <div class="animate-fadeIn">
                ${Components.pageHeader({
            title: 'Gestión de Importaciones',
            subtitle: 'Control estratégico de operaciones internacionales y Landed Cost',
            actions: [
                { label: 'Nueva Operación', icon: 'plus', class: 'btn-primary shadow-lg', action: 'new-import' },
                { label: 'Reporte Consolidado', icon: 'download', class: 'btn-outline', action: 'export-imports' }
            ]
        })}

                <div class="mb-8">
                    ${Components.tabs({
            tabs: [
                { id: 'torre-control', label: 'Torre de Control', icon: 'layout-dashboard' },
                { id: 'logistica', label: 'Logística & Hitos', icon: 'ship' },
                { id: 'landed-cost', label: 'Landed Cost', icon: 'calculator' },
                { id: 'finanzas', label: 'Pagos & Finanzas', icon: 'credit-card' }
            ],
            activeTab: this.currentTab
        })}
                </div>

                <div id="imports-main-viewport" class="animate-fadeIn"></div>
            </div>
        `;

        this.initGlobalEvents();
        this.renderCurrentTab();
    },

    initGlobalEvents() {
        // Tab switching
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const nextTab = tab.dataset.tab;
                if (this.currentTab === nextTab) return;

                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.currentTab = nextTab;
                this.renderCurrentTab();
            });
        });

        const container = document.getElementById('page-content');

        // Header actions
        container.querySelector('[data-action="new-import"]')?.addEventListener('click', () => {
            this.showImportForm();
        });

        container.querySelector('[data-action="export-imports"]')?.addEventListener('click', () => {
            const data = Store.get('importaciones');
            Utils.downloadCSV(data, `importaciones_${new Date().toISOString().split('T')[0]}.csv`);
            Components.toast('Exportando reporte...', 'success');
        });

        // Store subscription for live updates
        Store.on('importaciones:changed', () => {
            this.renderCurrentTab();
        });
    },

    renderCurrentTab() {
        const viewport = document.getElementById('imports-main-viewport');
        if (!viewport) return;

        viewport.innerHTML = '';

        switch (this.currentTab) {
            case 'torre-control':
                this.renderTorreControl(viewport);
                break;
            case 'logistica':
                this.renderLogistica(viewport);
                break;
            case 'landed-cost':
                this.renderLandedCost(viewport);
                break;
            case 'finanzas':
                this.renderFinanzas(viewport);
                break;
        }

        if (window.lucide) lucide.createIcons();
    },

    /* --------------------------------------------------------------------------
       Torre de Control (Dashboard)
       -------------------------------------------------------------------------- */
    renderTorreControl(container) {
        const data = Store.get('importaciones') || [];
        const enTransito = data.filter(i => i.estado === 'En Tránsito').length;
        const enAduana = data.filter(i => i.estado === 'Aduana').length;
        const totalFob = data.reduce((acc, i) => acc + (i.costos?.valorFob || 0), 0);

        container.innerHTML = `
            <div class="grid grid-cols-4 gap-6 mb-8">
                ${Components.statCard({
            label: 'Operaciones Activas',
            value: data.length,
            icon: 'activity',
            iconClass: 'primary'
        })}
                ${Components.statCard({
            label: 'En Tránsito',
            value: enTransito,
            icon: 'ship',
            iconClass: 'info'
        })}
                ${Components.statCard({
            label: 'En Aduana',
            value: enAduana,
            icon: 'landmark',
            iconClass: 'warning'
        })}
                ${Components.statCard({
            label: 'Inversión FOB',
            value: Utils.formatCurrency(totalFob),
            icon: 'dollar-sign',
            iconClass: 'success'
        })}
            </div>

            <div class="grid grid-cols-12 gap-6">
                <div class="col-span-8">
                    <div class="card bg-white rounded-3xl border-none shadow-sm overflow-hidden min-h-[400px]">
                        <div class="p-6 border-b border-gray-50 flex items-center justify-between">
                            <h3 class="font-bold text-gray-900">Pipeline de Operaciones</h3>
                            <button class="btn btn-ghost btn-xs text-primary-600 font-bold" onclick="ImportacionesModule.currentTab='logistica'; ImportacionesModule.renderCurrentTab()">Ver todos</button>
                        </div>
                        <div class="p-6">
                            ${data.length === 0 ? Components.emptyState({ icon: 'ship', title: 'Sin operaciones', message: 'No hay importaciones activas en este momento.' }) : `
                                <div class="space-y-6">
                                    ${data.slice(0, 5).map(item => {
            const hitos = item.hitos || [];
            const progress = hitos.length > 0 ? (hitos.filter(h => h.completado).length / hitos.length) * 100 : 0;
            return `
                                            <div class="p-4 rounded-2xl bg-gray-50/50 border border-gray-100 hover:bg-white hover:shadow-md transition-all cursor-pointer group" onclick="ImportacionesModule.showImportDetail(${item.id})">
                                                <div class="flex items-center justify-between mb-4">
                                                    <div class="flex items-center gap-4">
                                                        <div class="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center font-bold">
                                                            <i data-lucide="${item.logistica?.modo === 'Marítimo' ? 'ship' : 'plane'}" class="w-5 h-5"></i>
                                                        </div>
                                                        <div>
                                                            <div class="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">${item.operacion}</div>
                                                            <div class="text-xs text-gray-500">${item.proveedor} • ${item.origen}</div>
                                                        </div>
                                                    </div>
                                                    <div class="text-right">
                                                        <span class="badge ${Utils.getStatusColor(item.estado)}">${item.estado}</span>
                                                        <div class="text-[10px] text-gray-400 font-bold uppercase mt-1">ETA: ${item.logistica?.eta || 'Pendiente'}</div>
                                                    </div>
                                                </div>
                                                <div class="space-y-2">
                                                    <div class="flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                        <span>Progreso de Hitos</span>
                                                        <span>${Math.round(progress)}%</span>
                                                    </div>
                                                    <div class="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                                        <div class="h-full bg-primary-500 transition-all duration-500" style="width: ${progress}%"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        `;
        }).join('')}
                                </div>
                            `}
                        </div>
                    </div>
                </div>

                <div class="col-span-4">
                    <div class="card bg-white rounded-3xl border-none shadow-sm p-6 mb-6">
                        <h4 class="font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <i data-lucide="alert-triangle" class="text-amber-500 w-5 h-5"></i>
                            Alertas Críticas
                        </h4>
                        <div class="space-y-4">
                            <div class="p-4 rounded-2xl bg-rose-50 border border-rose-100 flex gap-4">
                                <div class="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                                    <i data-lucide="clock" class="w-5 h-5"></i>
                                </div>
                                <div>
                                    <div class="text-xs font-bold text-rose-900">Demurrage Riesgo Alto</div>
                                    <div class="text-[10px] text-rose-700 mt-1">IMP-2024-002: 48h para retiro sin sobrecosto.</div>
                                </div>
                            </div>
                            <div class="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex gap-4">
                                <div class="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                                    <i data-lucide="file-warning" class="w-5 h-5"></i>
                                </div>
                                <div>
                                    <div class="text-xs font-bold text-amber-900">Documentación Pendiente</div>
                                    <div class="text-[10px] text-amber-700 mt-1">Falta Bill of Lading original para IMP-2024-001.</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="card bg-primary-600 rounded-3xl border-none shadow-xl p-6 text-white overflow-hidden relative">
                        <div class="absolute -right-4 -bottom-4 opacity-10">
                            <i data-lucide="calculator" class="w-32 h-32"></i>
                        </div>
                        <h4 class="font-bold mb-4 opacity-80 uppercase tracking-widest text-xs relative z-10">KPI Mensual</h4>
                        <div class="text-3xl font-black mb-2 relative z-10">94.2%</div>
                        <div class="text-xs opacity-70 mb-6 relative z-10">Exactitud en Landed Cost Estimado vs Real</div>
                        <div class="w-full h-1.5 bg-white/20 rounded-full overflow-hidden relative z-10">
                            <div class="h-full bg-white transition-all duration-1000" style="width: 94%"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /* --------------------------------------------------------------------------
       Logística & Hitos
       -------------------------------------------------------------------------- */
    renderLogistica(container) {
        const rawData = Store.get('importaciones') || [];
        const filteredData = this.searchTerm
            ? Utils.search(rawData, this.searchTerm, ['operacion', 'proveedor', 'origen', 'estado'])
            : rawData;

        container.innerHTML = `
            <div class="card bg-white rounded-3xl border-none shadow-sm overflow-hidden">
                <div class="p-6 border-b border-gray-50 flex items-center justify-between bg-white/50 backdrop-blur-md sticky top-0 z-10">
                    <div class="relative w-1/3">
                        ${Components.searchInput({
            id: 'import-search-input',
            placeholder: 'Buscar por operación, proveedor...',
            value: this.searchTerm
        })}
                    </div>
                    <div class="flex gap-2">
                        <select class="form-select text-xs rounded-xl" id="import-filter-status">
                            <option value="">Todos los estados</option>
                            <option value="En Tránsito">En Tránsito</option>
                            <option value="Aduana">Aduana</option>
                            <option value="Cerrado">Cerrado</option>
                        </select>
                    </div>
                </div>
                <div class="overflow-x-auto min-h-[400px]">
                    ${Components.dataTable({
            columns: [
                {
                    key: 'operacion', label: 'Operación', render: (val, row) => `
                                <div class="flex items-center gap-3">
                                    <div class="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                        <i data-lucide="${row.logistica?.modo === 'Marítimo' ? 'ship' : 'plane'}" class="w-4 h-4 text-gray-600"></i>
                                    </div>
                                    <div class="font-bold text-gray-900">${val}</div>
                                </div>
                            `},
                { key: 'proveedor', label: 'Proveedor' },
                { key: 'origen', label: 'Origen' },
                { key: 'incoterm', label: 'Incoterm' },
                { key: 'estado', label: 'Estado', type: 'badge' },
                {
                    key: 'prioridad', label: 'Prioridad', render: (val) => `
                                <span class="badge ${val === 'Urgente' ? 'badge-danger' : val === 'Alta' ? 'badge-warning' : 'badge-info'}">${val}</span>
                            `}
            ],
            data: filteredData,
            actions: [
                { icon: 'eye', label: 'Ver Detalles', action: 'view-import' },
                { icon: 'edit-2', label: 'Editar', action: 'edit-import' },
                { icon: 'trash-2', label: 'Eliminar', action: 'delete-import' }
            ]
        })}
                </div>
            </div>
        `;

        // Search logic
        const searchInput = container.querySelector('#import-search-input');
        if (searchInput) {
            searchInput.focus();
            searchInput.addEventListener('input', Utils.debounce((e) => {
                this.searchTerm = e.target.value;
                this.renderCurrentTab();
            }, 300));
        }

        // Action listeners
        container.querySelectorAll('[data-action="view-import"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                this.showImportDetail(id);
            });
        });

        container.querySelectorAll('[data-action="edit-import"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                this.showImportForm(id);
            });
        });

        container.querySelectorAll('[data-action="delete-import"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                this.deleteImport(id);
            });
        });

        if (window.lucide) lucide.createIcons();
    },

    /* --------------------------------------------------------------------------
       Landed Cost
       -------------------------------------------------------------------------- */
    renderLandedCost(container) {
        const data = Store.get('importaciones') || [];

        container.innerHTML = `
             <div class="card bg-white rounded-3xl border-none shadow-sm overflow-hidden">
                <div class="p-6 border-b border-gray-50 flex items-center justify-between">
                    <h3 class="font-bold text-gray-900">Análisis de Landed Cost</h3>
                    <span class="text-xs bg-primary-50 text-primary-700 px-3 py-1 rounded-full font-bold">Base Impositiva: Chile (6% / 19%)</span>
                </div>
                <div class="p-6">
                    <div class="grid grid-cols-12 gap-8">
                        <div class="col-span-8">
                             ${Components.dataTable({
            columns: [
                { key: 'operacion', label: 'Operación' },
                { key: 'fob', label: 'Valor FOB', render: (v, row) => Utils.formatCurrency(row.costos?.valorFob || 0) },
                { key: 'logistics', label: 'Logística', render: (v, row) => Utils.formatCurrency((row.costos?.flete || 0) + (row.costos?.seguro || 0)) },
                { key: 'taxes', label: 'Contribución', render: (v, row) => Utils.formatCurrency((row.costos?.arancel || 0) + (row.costos?.iva || 0)) },
                { key: 'landed', label: 'Landed Total', render: (v, row) => `<span class="font-black text-primary-600">${Utils.formatCurrency(row.costos?.totalLanded || 0)}</span>` },
                {
                    key: 'ratio', label: 'Markup', render: (v, row) => {
                        const fob = row.costos?.valorFob || 1;
                        const landed = row.costos?.totalLanded || 1;
                        return `<span class="text-rose-600 font-bold">+${Math.round(((landed - fob) / fob) * 100)}%</span>`;
                    }
                }
            ],
            data: data
        })}
                        </div>
                        <div class="col-span-4">
                            <div class="bg-gray-50 rounded-3xl p-6 border border-gray-100 shadow-inner">
                                <h4 class="font-bold text-sm mb-4 uppercase tracking-widest text-gray-500 flex items-center gap-2">
                                    <i data-lucide="zap" class="w-4 h-4 text-amber-500"></i>
                                    Simulador Express
                                </h4>
                                <div class="space-y-4" id="sim-container">
                                    ${Components.formInput({ label: 'Monto FOB (USD)', name: 'sim-fob', type: 'number', value: '10000' })}
                                    ${Components.formInput({ label: 'Flete Estimado (USD)', name: 'sim-flete', type: 'number', value: '1500' })}
                                    
                                    <div class="grid grid-cols-2 gap-4 my-6">
                                        <div class="form-group text-center p-3 bg-blue-50 rounded-2xl border border-blue-100">
                                            <div class="text-[9px] font-black text-blue-400 uppercase">Arancel</div>
                                            <div class="font-black text-blue-700">6%</div>
                                        </div>
                                        <div class="form-group text-center p-3 bg-indigo-50 rounded-2xl border border-indigo-100">
                                            <div class="text-[9px] font-black text-indigo-400 uppercase">IVA</div>
                                            <div class="font-black text-indigo-700">19%</div>
                                        </div>
                                    </div>

                                    <div class="pt-4 border-t border-gray-200">
                                        <div class="flex justify-between items-center mb-1">
                                            <span class="text-xs text-gray-500">Subtotal CIF</span>
                                            <span class="font-bold text-gray-700" id="sim-cif">$11.500</span>
                                        </div>
                                        <div class="flex justify-between items-center mb-3">
                                            <span class="text-xs text-gray-500 font-bold">Landed Estimado</span>
                                            <span class="text-xl font-black text-primary-600" id="sim-result">$14.500</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
             </div>
        `;

        this.initSimulador();
    },

    initSimulador() {
        const updateSim = () => {
            const fob = parseFloat(document.getElementById('sim-fob')?.value || 0);
            const flete = parseFloat(document.getElementById('sim-flete')?.value || 0);
            const cif = fob + flete;

            const arancel = cif * 0.06;
            const baseIva = cif + arancel;
            const iva = baseIva * 0.19;
            const total = baseIva + iva;

            const cifEl = document.getElementById('sim-cif');
            const resultEl = document.getElementById('sim-result');

            if (cifEl) cifEl.textContent = Utils.formatCurrency(cif);
            if (resultEl) resultEl.textContent = Utils.formatCurrency(total);
        };

        const inputs = ['sim-fob', 'sim-flete'];
        inputs.forEach(id => {
            document.getElementById(id)?.addEventListener('input', updateSim);
        });

        updateSim();
    },

    /* --------------------------------------------------------------------------
       Pagos & Finanzas
       -------------------------------------------------------------------------- */
    renderFinanzas(container) {
        const data = Store.get('importaciones') || [];
        const pendingPayments = [];

        data.forEach(item => {
            if (item.estado !== 'Cerrado') {
                pendingPayments.push({
                    concepto: `Impuestos Aduana - ${item.operacion}`,
                    monto: (item.costos?.arancel || 0) + (item.costos?.iva || 0),
                    vencimiento: item.logistica?.eta || '2024-03-01',
                    type: 'tax'
                });
                pendingPayments.push({
                    concepto: `Gastos Terminales - ${item.operacion}`,
                    monto: item.costos?.gastosTerminales || 0,
                    vencimiento: item.logistica?.eta || '2024-03-05',
                    type: 'service'
                });
            }
        });

        container.innerHTML = `
            <div class="grid grid-cols-2 gap-6">
                <div class="card bg-white rounded-3xl border-none shadow-sm p-6 overflow-hidden min-h-[400px]">
                    <h3 class="font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <i data-lucide="calendar" class="text-primary-500"></i>
                        Vencimientos Financieros
                    </h3>
                    <div class="space-y-4">
                        ${pendingPayments.length === 0 ? '<p class="text-center text-gray-400 py-8">No hay pagos pendientes.</p>' :
                pendingPayments.slice(0, 5).map(pay => `
                                <div class="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border-l-4 ${pay.type === 'tax' ? 'border-amber-400' : 'border-blue-400'} hover:bg-white hover:shadow-sm transition-all">
                                     <div>
                                         <div class="font-bold text-gray-900">${pay.concepto}</div>
                                         <div class="text-xs text-gray-500">Vencimiento: ${pay.vencimiento}</div>
                                     </div>
                                     <div class="font-black text-gray-900">${Utils.formatCurrency(pay.monto)}</div>
                                </div>
                            `).join('')
            }
                    </div>
                </div>

                <div class="card bg-white rounded-3xl border-none shadow-sm p-6 flex flex-col">
                    <h3 class="font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <i data-lucide="bar-chart-3" class="text-primary-500"></i>
                        Estructura de Capital Invertido
                    </h3>
                    <div class="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                         <div class="w-full max-w-xs space-y-4">
                            <div class="space-y-1">
                                <div class="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-400">
                                    <span>Mercadería (FOB)</span>
                                    <span>72%</span>
                                </div>
                                <div class="h-4 w-full bg-gray-200 rounded-lg overflow-hidden">
                                    <div class="h-full bg-primary-500" style="width: 72%"></div>
                                </div>
                            </div>
                            <div class="space-y-1">
                                <div class="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-400">
                                    <span>Impuestos (Chile)</span>
                                    <span>21%</span>
                                </div>
                                <div class="h-4 w-full bg-gray-200 rounded-lg overflow-hidden">
                                    <div class="h-full bg-amber-500" style="width: 21%"></div>
                                </div>
                            </div>
                            <div class="space-y-1">
                                <div class="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-400">
                                    <span>Logística & Others</span>
                                    <span>7%</span>
                                </div>
                                <div class="h-4 w-full bg-gray-200 rounded-lg overflow-hidden">
                                    <div class="h-full bg-indigo-500" style="width: 7%"></div>
                                </div>
                            </div>
                         </div>
                    </div>
                </div>
            </div>
        `;
    },

    /* --------------------------------------------------------------------------
       CRUD Logics
       -------------------------------------------------------------------------- */
    showImportForm(id = null) {
        const isEdit = id !== null;
        const item = isEdit ? Store.find('importaciones', id) : {
            operacion: `IMP-${new Date().getFullYear()}-${Math.floor(Math.random() * 900) + 100}`,
            proveedor: '',
            origen: 'China',
            incoterm: 'CIF',
            puerto: 'San Antonio',
            estado: 'En Tránsito',
            prioridad: 'Media',
            logistica: { modo: 'Marítimo', carrier: '', documento: '', etd: '', eta: '' },
            costos: { valorFob: 0, flete: 0, seguro: 0, gastosTerminales: 0, arancel: 0, iva: 0, totalLanded: 0 },
            items: [],
            hitos: [
                { nombre: 'PO Emitida', fecha: '', completado: true },
                { nombre: 'Embarcado', fecha: '', completado: false },
                { nombre: 'Arribo', fecha: '', completado: false },
                { nombre: 'Liberado', fecha: '', completado: false }
            ]
        };

        const { modal, close } = Components.modal({
            title: isEdit ? `Editar Operación: ${item.operacion}` : 'Nueva Importación',
            size: 'xl',
            content: `
                <form id="import-form" class="space-y-6">
                    <div class="grid grid-cols-3 gap-4">
                        ${Components.formInput({ label: 'Operación ID', name: 'operacion', value: item.operacion, required: true })}
                        ${Components.formInput({ label: 'Proveedor', name: 'proveedor', value: item.proveedor, required: true })}
                        ${Components.formInput({ label: 'País Origen', name: 'origen', value: item.origen })}
                    </div>
                    <div class="grid grid-cols-3 gap-4">
                        ${Components.formInput({
                label: 'Incoterm', name: 'incoterm', type: 'select', value: item.incoterm, options: [
                    { label: 'FOB', value: 'FOB' }, { label: 'CIF', value: 'CIF' }, { label: 'DAP', value: 'DAP' }
                ]
            })}
                        ${Components.formInput({ label: 'Puerto/Terminal', name: 'puerto', value: item.puerto })}
                        ${Components.formInput({
                label: 'Prioridad', name: 'prioridad', type: 'select', value: item.prioridad, options: [
                    { label: 'Urgente', value: 'Urgente' }, { label: 'Alta', value: 'Alta' }, { label: 'Media', value: 'Media' }
                ]
            })}
                    </div>
                    <div class="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                        <h4 class="text-xs font-black uppercase text-gray-400 mb-4 tracking-tighter">Detalles Logísticos</h4>
                        <div class="grid grid-cols-4 gap-4">
                            ${Components.formInput({
                label: 'Modo', name: 'modo', type: 'select', value: item.logistica?.modo, options: [
                    { label: 'Marítimo', value: 'Marítimo' }, { label: 'Aéreo', value: 'Aéreo' }, { label: 'Terrestre', value: 'Terrestre' }
                ]
            })}
                            ${Components.formInput({ label: 'Carrier', name: 'carrier', value: item.logistica?.carrier })}
                            ${Components.formInput({ label: 'ETD', name: 'etd', type: 'date', value: item.logistica?.etd })}
                            ${Components.formInput({ label: 'ETA', name: 'eta', type: 'date', value: item.logistica?.eta })}
                        </div>
                    </div>
                     <div class="bg-primary-50/30 p-6 rounded-3xl border border-primary-100">
                        <h4 class="text-xs font-black uppercase text-primary-400 mb-4 tracking-tighter">Financial Forecast (USD)</h4>
                        <div class="grid grid-cols-3 gap-4">
                            ${Components.formInput({ label: 'Valor FOB Mercadería', name: 'valorFob', type: 'number', value: item.costos?.valorFob })}
                            ${Components.formInput({ label: 'Flete Internacional', name: 'flete', type: 'number', value: item.costos?.flete })}
                            ${Components.formInput({ label: 'Seguro', name: 'seguro', type: 'number', value: item.costos?.seguro })}
                        </div>
                    </div>
                    <div class="flex justify-end gap-3 pt-4">
                        <button type="button" class="btn btn-outline" data-action="close-modal">Cancelar</button>
                        <button type="submit" class="btn btn-primary shadow-lg px-8">Guardar Operación</button>
                    </div>
                </form>
            `
        });

        const form = document.getElementById('import-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const raw = Object.fromEntries(formData.entries());

            // Automated Landed Cost Calculation (Simplified for demo)
            const fob = parseFloat(raw.valorFob || 0);
            const flete = parseFloat(raw.flete || 0);
            const seguro = parseFloat(raw.seguro || 0);
            const cif = fob + flete + seguro;
            const arancel = cif * 0.06;
            const iva = (cif + arancel) * 0.19;
            const total = cif + arancel + iva + 500; // +500 terminal fees fix

            const updatedItem = {
                ...item,
                operacion: raw.operacion,
                proveedor: raw.proveedor,
                origen: raw.origen,
                incoterm: raw.incoterm,
                puerto: raw.puerto,
                prioridad: raw.prioridad,
                logistica: {
                    ...item.logistica,
                    modo: raw.modo,
                    carrier: raw.carrier,
                    etd: raw.etd,
                    eta: raw.eta
                },
                costos: {
                    valorFob: fob,
                    flete: flete,
                    seguro: seguro,
                    arancel: Math.round(arancel),
                    iva: Math.round(iva),
                    gastosTerminales: 500,
                    totalLanded: Math.round(total)
                }
            };

            if (isEdit) {
                Store.update('importaciones', id, updatedItem);
                Components.toast('Importación actualizada correctamente', 'success');
            } else {
                Store.add('importaciones', updatedItem);
                Components.toast('Nueva importación registrada', 'success');
            }

            close();
        });

        // Add handler for the cancel button
        modal.querySelector('[data-action="close-modal"]')?.addEventListener('click', close);
    },

    deleteImport(id) {
        if (confirm('¿Está seguro de eliminar esta operación? Esta acción no se puede deshacer.')) {
            Store.delete('importaciones', id);
            Components.toast('Operación eliminada', 'secondary');
        }
    },

    showImportDetail(id) {
        const item = Store.find('importaciones', id);
        if (!item) return;

        Components.modal({
            title: `Expediente: ${item.operacion}`,
            size: 'lg',
            content: `
                <div class="space-y-6">
                    <div class="flex items-center justify-between">
                         <div class="flex items-center gap-4">
                            <div class="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-primary-600">
                                <i data-lucide="${item.logistica?.modo === 'Marítimo' ? 'ship' : 'plane'}" class="w-8 h-8"></i>
                            </div>
                            <div>
                                <h2 class="text-2xl font-black text-gray-900">${item.operacion}</h2>
                                <p class="text-xs text-gray-500">${item.proveedor} • <b>${item.incoterm}</b> ${item.puerto}</p>
                            </div>
                         </div>
                         <div class="text-right">
                            <span class="badge ${Utils.getStatusColor(item.estado)} px-4 py-2 rounded-xl text-sm">${item.estado}</span>
                         </div>
                    </div>

                    <div class="grid grid-cols-4 gap-4">
                        <div class="p-4 bg-primary-50 rounded-2xl border border-primary-100">
                            <div class="text-[9px] font-black text-primary-400 uppercase mb-1">Costo Landed Total</div>
                            <div class="text-lg font-black text-primary-700">${Utils.formatCurrency(item.costos?.totalLanded || 0)}</div>
                        </div>
                        <div class="p-4 bg-gray-50 rounded-2xl">
                             <div class="text-[9px] font-black text-gray-400 uppercase mb-1">Días en Tránsito</div>
                             <div class="text-lg font-black text-gray-700">24</div>
                        </div>
                        <div class="p-4 bg-gray-50 rounded-2xl">
                             <div class="text-[9px] font-black text-gray-400 uppercase mb-1">Doc. Maestro</div>
                             <div class="text-sm font-bold text-gray-800">${item.logistica?.documento || 'No asignado'}</div>
                        </div>
                        <div class="p-4 bg-rose-50 rounded-2xl border border-rose-100">
                             <div class="text-[9px] font-black text-rose-400 uppercase mb-1">Alertas</div>
                             <div class="text-sm font-bold text-rose-700">0 Críticas</div>
                        </div>
                    </div>

                    <div>
                        <div class="flex items-center justify-between mb-4">
                             <h4 class="font-bold text-sm uppercase tracking-widest text-gray-500">Cronograma de Hitos</h4>
                             <span class="text-[10px] font-bold text-primary-600 cursor-pointer">Editar cronograma</span>
                        </div>
                        <div class="grid grid-cols-1 gap-2">
                            ${(item.hitos || []).map((h, idx) => `
                                <div class="flex items-center gap-4 p-4 rounded-2xl ${h.completado ? 'bg-emerald-50/50 border border-emerald-100' : 'bg-white border border-gray-100'} transition-all group">
                                    <div class="hito-checkbox cursor-pointer w-6 h-6 rounded-full flex items-center justify-center ${h.completado ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-gray-100 text-gray-300'}" 
                                         onclick="ImportacionesModule.toggleHito(${item.id}, ${idx})">
                                        <i data-lucide="${h.completado ? 'check' : 'circle'}" class="w-3 h-3"></i>
                                    </div>
                                    <div class="flex-1 flex justify-between items-center">
                                        <div>
                                            <span class="text-sm ${h.completado ? 'font-bold text-emerald-900' : 'text-gray-500'}">${h.nombre}</span>
                                            ${!h.completado ? '<span class="ml-2 text-[8px] bg-amber-100 text-amber-700 px-1 rounded">Pendiente</span>' : ''}
                                        </div>
                                        <span class="text-[10px] text-gray-400 font-bold">${h.fecha || 'Sin fecha'}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div>
                         <h4 class="font-bold text-sm mb-4 uppercase tracking-widest text-gray-500">Packing List Resumido</h4>
                         <div class="rounded-3xl border border-gray-100 overflow-hidden">
                             <table class="w-full text-xs">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="p-4 text-left font-black text-gray-400 uppercase">SKU / Modelo</th>
                                        <th class="p-4 text-center font-black text-gray-400 uppercase">Cant.</th>
                                        <th class="p-4 text-right font-black text-gray-400 uppercase">Subtotal FOB</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${item.items?.length > 0 ? item.items.map(i => `
                                        <tr class="border-b border-gray-50">
                                            <td class="p-4">
                                                <div class="font-bold text-gray-900">${i.descripcion}</div>
                                                <div class="text-[10px] font-mono text-gray-400">${i.sku}</div>
                                            </td>
                                            <td class="p-4 text-center font-bold">${i.cantidad}</td>
                                            <td class="p-4 text-right font-black text-primary-600">${Utils.formatCurrency(i.cantidad * i.precioUnitario)}</td>
                                        </tr>
                                    `).join('') : '<tr><td colspan="3" class="p-8 text-center text-gray-400">No hay items registrados</td></tr>'}
                                </tbody>
                             </table>
                         </div>
                    </div>
                </div>
            `
        });

        if (window.lucide) lucide.createIcons();
    },

    toggleHito(importId, hitoIndex) {
        const items = Store.get('importaciones');
        const itemIdx = items.findIndex(i => i.id === importId);
        if (itemIdx === -1) return;

        const updatedItems = Utils.deepClone(items);
        updatedItems[itemIdx].hitos[hitoIndex].completado = !updatedItems[itemIdx].hitos[hitoIndex].completado;
        updatedItems[itemIdx].hitos[hitoIndex].fecha = updatedItems[itemIdx].hitos[hitoIndex].completado
            ? new Date().toISOString().split('T')[0]
            : '';

        // Actualizar estado general basado en hitos (lógica simple)
        const hitos = updatedItems[itemIdx].hitos;
        const total = hitos.length;
        const comp = hitos.filter(h => h.completado).length;

        if (comp === total) updatedItems[itemIdx].estado = 'Cerrado';
        else if (comp > total / 2) updatedItems[itemIdx].estado = 'Aduana';
        else updatedItems[itemIdx].estado = 'En Tránsito';

        Store.set('importaciones', updatedItems);

        // Refresh detail modal content (bit hacky for demo but works)
        this.showImportDetail(importId);
    }
};

window.ImportacionesModule = ImportacionesModule;
