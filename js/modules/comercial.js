/* ==========================================================================
   EAX Platform - Comercial Module (Cotizaciones)
   ========================================================================== */

const ComercialModule = {
    currentTab: 'cotizaciones',
    currentConfig: { items: [], cliente: null },

    render() {
        const content = document.getElementById('page-content');

        content.innerHTML = `
            <div class="animate-fadeIn">
                ${Components.pageHeader({
            title: 'Comercial',
            subtitle: 'Gestión de cotizaciones y listas de precios',
            actions: [
                { label: 'Nueva Cotización', icon: 'plus', class: 'btn-primary', action: 'new-cotizacion' }
            ]
        })}
                
                ${Components.tabs({
            tabs: [
                { id: 'cotizaciones', label: 'Cotizaciones', icon: 'file-text' },
                { id: 'configurador', label: 'Configurador', icon: 'settings' },
                { id: 'productos', label: 'Lista de Precios', icon: 'tag' }
            ],
            activeTab: this.currentTab
        })}
                
                <div id="comercial-content"></div>
            </div>
        `;

        lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });
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

        document.querySelector('[data-action="new-cotizacion"]')?.addEventListener('click', () => {
            this.currentTab = 'configurador';
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelector('[data-tab="configurador"]')?.classList.add('active');
            this.currentConfig = { items: [], cliente: null };
            this.renderTab('configurador');
        });
    },

    renderTab(tab) {
        const container = document.getElementById('comercial-content');

        switch (tab) {
            case 'cotizaciones':
                this.renderCotizaciones(container);
                break;
            case 'configurador':
                this.renderConfigurador(container);
                break;
            case 'productos':
                this.renderProductos(container);
                break;
        }
    },

    renderCotizaciones(container) {
        const cotizaciones = Store.get('cotizaciones');
        const clientes = Store.get('clientes');

        container.innerHTML = `
            <div class="grid grid-cols-4 gap-4 mb-6">
                ${Components.statCard({ icon: 'file-text', label: 'Total Cotizaciones', value: cotizaciones.length, iconClass: 'primary' })}
                ${Components.statCard({ icon: 'check-circle', label: 'Aprobadas', value: cotizaciones.filter(c => c.estado === 'Aprobada').length, iconClass: 'success' })}
                ${Components.statCard({ icon: 'clock', label: 'Pendientes', value: cotizaciones.filter(c => c.estado === 'Pendiente').length, iconClass: 'warning' })}
                ${Components.statCard({ icon: 'dollar-sign', label: 'Valor Total', value: Utils.formatCurrency(cotizaciones.reduce((s, c) => s + c.total, 0)), iconClass: 'success' })}
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Historial de Cotizaciones</h3>
                    <div class="flex gap-4">
                        ${Components.searchInput({ placeholder: 'Buscar cotización...', id: 'search-cot' })}
                        <div class="relative" style="width: 250px;">
                            <input type="text" 
                                   class="form-input" 
                                   id="filter-cot-cliente" 
                                   list="clientes-list-cot" 
                                   placeholder="Filtrar por cliente...">
                            <datalist id="clientes-list-cot">
                                ${clientes.map(c => `<option value="${c.nombre}">`).join('')}
                            </datalist>
                        </div>
                    </div>
                </div>
                <div class="card-body p-0" id="cotizaciones-table-container">
                    <!-- Table loaded via filterCotizaciones -->
                </div>
            </div>
        `;

        this.filterCotizaciones();
        this.attachCotizacionesEvents();
    },

    filterCotizaciones() {
        const searchTerm = document.getElementById('search-cot')?.value || '';
        const clienteFilter = document.getElementById('filter-cot-cliente')?.value || '';

        let cotizaciones = Store.get('cotizaciones');

        if (searchTerm) {
            cotizaciones = Utils.search(cotizaciones, searchTerm, ['numero', 'cliente']);
        }

        if (clienteFilter) {
            cotizaciones = cotizaciones.filter(c => c.cliente.toLowerCase().includes(clienteFilter.toLowerCase()));
        }

        const container = document.getElementById('cotizaciones-table-container');
        if (container) this.renderCotizacionesTable(container, cotizaciones);
    },

    renderCotizacionesTable(container, cotizaciones) {
        container.innerHTML = Components.dataTable({
            columns: [
                { key: 'numero', label: 'Número' },
                { key: 'cliente', label: 'Cliente' },
                { key: 'fecha', label: 'Fecha', type: 'date' },
                { key: 'validez', label: 'Válida hasta', type: 'date' },
                { key: 'items', label: 'Items' },
                { key: 'total', label: 'Total', type: 'currency' },
                { key: 'estado', label: 'Estado', type: 'badge' }
            ],
            data: cotizaciones,
            actions: [
                { icon: 'eye', label: 'Ver', action: 'view' },
                { icon: 'check', label: 'Aprobar', action: 'approve' },
                { icon: 'copy', label: 'Duplicar', action: 'duplicate' },
                { icon: 'download', label: 'PDF', action: 'pdf' }
            ]
        });

        if (window.lucide) {
            lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });
        }

        this.attachCotizacionesTableEvents();
    },

    attachCotizacionesEvents() {
        document.getElementById('search-cot')?.addEventListener('input', Utils.debounce(() => this.filterCotizaciones(), 300));
        document.getElementById('filter-cot-cliente')?.addEventListener('input', Utils.debounce(() => this.filterCotizaciones(), 300));
    },

    attachCotizacionesTableEvents() {
        document.querySelectorAll('[data-action="view"]').forEach(btn => {
            btn.addEventListener('click', () => this.showCotizacionDetail(parseInt(btn.dataset.id)));
        });

        document.querySelectorAll('[data-action="pdf"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const cot = Store.find('cotizaciones', parseInt(btn.dataset.id));
                if (cot) this.exportCotizacionPDF(cot);
            });
        });

        document.querySelectorAll('[data-action="duplicate"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const cot = Store.find('cotizaciones', parseInt(btn.dataset.id));
                if (cot) {
                    const newCot = { ...cot, numero: `COT-${Date.now()}`, fecha: new Date().toISOString().split('T')[0], estado: 'Pendiente' };
                    Store.add('cotizaciones', newCot);
                    Components.toast('Cotización duplicada', 'success');
                    this.filterCotizaciones(); // Refresh w/ filters
                }
            });
        });

        document.querySelectorAll('[data-action="approve"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const cot = Store.find('cotizaciones', parseInt(btn.dataset.id));
                if (cot) this.showApproveModal(cot);
            });
        });
    },

    showApproveModal(cot) {
        const empleados = Store.get('empleados') || [];
        const { modal, close } = Components.modal({
            title: 'Aprobar Cotización y Activar Postventa',
            size: 'sm',
            content: `
                <div class="mb-4 text-sm text-gray-600">
                    Al aprobar la cotización <b>${cot.numero}</b>, se generará automáticamente un registro de servicio en Postventa para el cliente <b>${cot.cliente}</b>.
                </div>
                <div class="form-group">
                    <label class="form-label">Asignar Responsable Técnico</label>
                    <select class="form-select" id="approve-responsable">
                        <option value="">Seleccionar técnico...</option>
                        ${empleados.map(e => `<option value="${e.nombre}">${e.nombre}</option>`).join('')}
                    </select>
                </div>
            `,
            footer: `
                <button class="btn btn-secondary" data-action="cancel">Cancelar</button>
                <button class="btn btn-success" data-action="confirm-approve">Aprobar y Activar</button>
            `
        });

        modal.querySelector('[data-action="cancel"]').addEventListener('click', close);
        modal.querySelector('[data-action="confirm-approve"]').addEventListener('click', () => {
            const responsable = modal.querySelector('#approve-responsable').value || 'Sin Asignar';

            // Update Quote Status
            Store.update('cotizaciones', cot.id, { estado: 'Aprobada' });

            // Generate Postventa Ticket/Service record
            if (window.PostventaModule && PostventaModule.createTicketFromSale) {
                PostventaModule.createTicketFromSale({
                    cliente: cot.cliente,
                    asunto: `Activación de Garantía y Entrega: ${cot.numero}`,
                    descripcion: `Venta cerrada por módulo comercial. Requiere revisión de entrega y activación de servicios postventa.`,
                    prioridad: 'Media',
                    asignado: responsable
                });
            }

            Components.toast('Cotización aprobada y ticket de postventa generado', 'success');
            close();
            this.renderTab('cotizaciones');
        });
    },

    showCotizacionDetail(id) {
        const cot = Store.find('cotizaciones', id);
        if (!cot) return;

        const { modal, close } = Components.modal({
            title: `Cotización ${cot.numero}`,
            size: 'lg',
            content: `
                <div class="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <div class="text-sm text-secondary">Cliente</div>
                        <div class="font-medium">${cot.cliente}</div>
                    </div>
                    <div>
                        <div class="text-sm text-secondary">Estado</div>
                        <span class="badge badge-${Utils.getStatusColor(cot.estado)}">${cot.estado}</span>
                    </div>
                    <div>
                        <div class="text-sm text-secondary">Fecha Emisión</div>
                        <div class="font-medium">${Utils.formatDate(cot.fecha)}</div>
                    </div>
                    <div>
                        <div class="text-sm text-secondary">Válida hasta</div>
                        <div class="font-medium">${Utils.formatDate(cot.validez)}</div>
                    </div>
                </div>
                
                <h4 class="font-semibold mb-3">Productos (${cot.items})</h4>
                <div class="text-secondary mb-4">Los detalles de productos se mostrarán aquí.</div>
                
                <div class="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <span class="font-medium">Total Cotización</span>
                    <span class="text-2xl font-bold">${Utils.formatCurrency(cot.total)}</span>
                </div>
            `,
            footer: `
                <button class="btn btn-secondary" data-action="close-modal">Cerrar</button>
                <button class="btn btn-primary" data-action="export-cot-pdf">
                    <i data-lucide="file-down" style="width:16px;margin-right:6px;"></i> Exportar PDF
                </button>
            `
        });

        lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });
        modal.querySelector('[data-action="close-modal"]').addEventListener('click', close);
        modal.querySelector('[data-action="export-cot-pdf"]').addEventListener('click', () => {
            this.exportCotizacionPDF(cot);
        });
    },

    exportCotizacionPDF(cot) {
        const printWin = window.open('', '_blank');
        const itemsList = cot.itemsData || [
            { desc: 'Equipo Principal EAX-X1', qty: 1, unit: cot.total * 0.7 },
            { desc: 'Kit de Instalación Premium', qty: 1, unit: cot.total * 0.2 },
            { desc: 'Servicio de Puesta en Marcha', qty: 1, unit: cot.total * 0.1 }
        ];

        printWin.document.write(`
            <html><head><title>Cotización ${cot.numero} - EAX</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                body { font-family: 'Inter', sans-serif; padding: 50px; max-width: 900px; margin: 0 auto; color: #334155; line-height: 1.5; }
                .brand-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; border-bottom: 2px solid #e1e7ef; padding-bottom: 20px; }
                .logo { font-size: 32px; font-weight: 800; color: #2563eb; letter-spacing: -1px; }
                .doc-type { text-align: right; }
                .doc-type h1 { margin: 0; font-size: 24px; color: #0f172a; }
                .doc-type div { color: #64748b; font-size: 14px; }
                
                .info-section { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
                .info-box h3 { font-size: 12px; text-transform: uppercase; color: #94a3b8; margin-bottom: 8px; letter-spacing: 0.05em; }
                .info-box p { margin: 0; font-weight: 500; color: #1e293b; }

                table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                th { text-align: left; padding: 12px; background: #f8fafc; color: #64748b; font-size: 12px; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; }
                td { padding: 16px 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
                .text-right { text-align: right; }

                .totals-section { margin-left: auto; width: 300px; }
                .total-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
                .total-row.grand-total { border-bottom: none; padding-top: 20px; }
                .total-row.grand-total span { font-size: 20px; font-weight: 700; color: #0f172a; }

                .terms { margin-top: 60px; font-size: 12px; color: #64748b; background: #f8fafc; padding: 20px; border-radius: 8px; }
                .footer { margin-top: 40px; text-align: center; color: #94a3b8; font-size: 11px; }
                @media print { body { padding: 0; } .terms { background: #fff; border: 1px solid #eee; } }
            </style></head><body>
            <div class="brand-header">
                <div class="logo">EAX</div>
                <div class="doc-type">
                    <h1>COTIZACIÓN</h1>
                    <div>No. ${cot.numero}</div>
                </div>
            </div>
            
            <div class="info-section">
                <div class="info-box">
                    <h3>Cliente</h3>
                    <p>${cot.cliente}</p>
                    <p style="font-weight:400;font-size:13px;color:#64748b;margin-top:4px;">RUT: 77.342.120-K</p>
                </div>
                <div class="info-box" style="text-align:right;">
                    <h3>Detalles de Emisión</h3>
                    <p>Fecha: ${Utils.formatDate(cot.fecha)}</p>
                    <p>Válidez: ${Utils.formatDate(cot.validez)}</p>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Descripción</th>
                        <th class="text-right">Cant.</th>
                        <th class="text-right">P. Unitario</th>
                        <th class="text-right">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsList.map(item => `
                        <tr>
                            <td>${item.desc}</td>
                            <td class="text-right">${item.qty}</td>
                            <td class="text-right">${Utils.formatCurrency(item.unit)}</td>
                            <td class="text-right">${Utils.formatCurrency(item.qty * item.unit)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div class="totals-section">
                <div class="total-row">
                    <span>Neto</span>
                    <span>${Utils.formatCurrency(cot.total / 1.19)}</span>
                </div>
                <div class="total-row">
                    <span>IVA (19%)</span>
                    <span>${Utils.formatCurrency(cot.total - (cot.total / 1.19))}</span>
                </div>
                <div class="total-row grand-total">
                    <span>Total</span>
                    <span>${Utils.formatCurrency(cot.total)}</span>
                </div>
            </div>

            <div class="terms">
                <strong>Condiciones Comerciales:</strong><br>
                1. Tiempo de entrega: 5-7 días hábiles tras confirmación.<br>
                2. Forma de pago: 30 días contra factura.<br>
                3. Precios sujetos a cambios según variaciones del mercado.
            </div>

            <div class="footer">
                EAX Corp — Av. Providencia 1234, Santiago, Chile — www.eax-platform.com
            </div>
            </body></html>
        `);
        printWin.document.close();
        printWin.focus();
        setTimeout(() => printWin.print(), 800);
        Components.toast(`Generando PDF: ${cot.numero}`, 'success');
    },

    renderConfigurador(container) {
        const productos = Store.get('productos');
        const clientes = Store.get('clientes');
        const total = this.currentConfig.items.reduce((sum, item) => sum + ((item.precioVenta || item.precio) * item.cantidad), 0);

        container.innerHTML = `
            <div class="grid grid-cols-3 gap-6">
                <!-- Products Selection -->
                <div class="card" style="grid-column: span 2;">
                    <div class="card-header">
                        <h3 class="card-title">Seleccionar Productos</h3>
                        ${Components.searchInput({ placeholder: 'Buscar productos...', id: 'search-productos' })}
                    </div>
                    <div class="card-body">
                        <div class="grid grid-cols-2 gap-4" id="productos-grid">
                            ${productos.map(prod => `
                                <div class="flex items-center gap-4 p-4 border rounded-lg hover:border-primary-300 cursor-pointer transition-all product-item" data-id="${prod.id}">
                                    <div class="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                        <i data-lucide="package" style="color:var(--color-gray-400);"></i>
                                    </div>
                                    <div class="flex-1">
                                        <div class="font-medium">${prod.nombre}</div>
                                        <div class="text-sm text-secondary">SKU: ${prod.sku}</div>
                                        <div class="text-sm text-secondary">Stock: ${prod.stock}</div>
                                    </div>
                                    <div class="text-right">
                                        <div class="font-bold text-lg">${Utils.formatCurrency(prod.precioVenta || prod.precio)}</div>
                                        <button class="btn btn-primary btn-sm mt-2 add-product-btn" data-id="${prod.id}">
                                            <i data-lucide="plus" style="width:14px;height:14px;"></i>
                                            Agregar
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                
                <!-- Configuration Summary -->
                <div class="card sticky" style="top: 80px; height: fit-content;">
                    <div class="card-header">
                        <h3 class="card-title">Resumen Cotización</h3>
                    </div>
                    <div class="card-body">
                        <div class="form-group">
                            <label class="form-label">Cliente</label>
                            <select class="form-select" id="config-cliente">
                                <option value="">Seleccionar cliente...</option>
                                ${clientes.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('')}
                            </select>
                        </div>
                        
                        <h4 class="font-medium mb-3 mt-4">Productos Seleccionados</h4>
                        <div id="config-items" class="flex flex-col gap-2 mb-4" style="max-height: 300px; overflow-y: auto;">
                            ${this.currentConfig.items.length === 0
                ? '<p class="text-secondary text-sm">No hay productos seleccionados</p>'
                : this.currentConfig.items.map((item, index) => `
                                    <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <div class="flex-1 min-w-0">
                                            <div class="text-sm font-medium truncate">${item.nombre}</div>
                                            <div class="text-xs text-secondary">${Utils.formatCurrency(item.precioVenta || item.precio)}</div>
                                        </div>
                                        <input type="number" class="form-input" style="width: 60px;" value="${item.cantidad}" min="1" data-index="${index}">
                                        <button class="btn btn-ghost btn-icon remove-item" data-index="${index}">
                                            <i data-lucide="x"></i>
                                        </button>
                                    </div>
                                `).join('')}
                        </div>
                        
                        <div class="border-t pt-4 mt-4">
                            <div class="flex justify-between mb-2">
                                <span class="text-secondary">Subtotal</span>
                                <span>${Utils.formatCurrency(total)}</span>
                            </div>
                            <div class="flex justify-between mb-2">
                                <span class="text-secondary">IVA (19%)</span>
                                <span>${Utils.formatCurrency(total * 0.19)}</span>
                            </div>
                            <div class="flex justify-between text-lg font-bold">
                                <span>Total</span>
                                <span>${Utils.formatCurrency(total * 1.19)}</span>
                            </div>
                        </div>
                        
                        <button class="btn btn-primary w-full mt-6" id="generate-cotizacion" ${this.currentConfig.items.length === 0 ? 'disabled' : ''}>
                            <i data-lucide="file-plus"></i>
                            Generar Cotización
                        </button>
                    </div>
                </div>
            </div>
        `;

        lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });
        this.attachConfiguradorEvents();
    },

    attachConfiguradorEvents() {
        // Add product
        document.querySelectorAll('.add-product-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const prod = Store.find('productos', parseInt(btn.dataset.id));
                if (prod) {
                    const existing = this.currentConfig.items.find(i => i.id === prod.id);
                    if (existing) {
                        existing.cantidad++;
                    } else {
                        this.currentConfig.items.push({ ...prod, cantidad: 1 });
                    }
                    Components.toast(`${prod.nombre} agregado`, 'success');
                    this.renderConfigurador(document.getElementById('comercial-content'));
                }
            });
        });

        // Update quantity
        document.querySelectorAll('#config-items input[type="number"]').forEach(input => {
            input.addEventListener('change', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.currentConfig.items[index].cantidad = parseInt(e.target.value) || 1;
                this.renderConfigurador(document.getElementById('comercial-content'));
            });
        });

        // Remove item
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                this.currentConfig.items.splice(index, 1);
                this.renderConfigurador(document.getElementById('comercial-content'));
            });
        });

        // Search products
        document.getElementById('search-productos')?.addEventListener('input', Utils.debounce((e) => {
            const term = e.target.value.toLowerCase();
            document.querySelectorAll('.product-item').forEach(item => {
                const name = item.querySelector('.font-medium').textContent.toLowerCase();
                const sku = item.querySelector('.text-secondary').textContent.toLowerCase();
                item.style.display = (name.includes(term) || sku.includes(term)) ? '' : 'none';
            });
        }, 300));

        // Generate cotizacion
        document.getElementById('generate-cotizacion')?.addEventListener('click', () => {
            const clienteId = document.getElementById('config-cliente').value;
            if (!clienteId) {
                Components.toast('Selecciona un cliente', 'warning');
                return;
            }

            const cliente = Store.find('clientes', parseInt(clienteId));
            const total = this.currentConfig.items.reduce((sum, item) => sum + ((item.precioVenta || item.precio) * item.cantidad), 0);

            const cotizacion = {
                numero: `COT-${String(Store._nextId).padStart(4, '0')}`,
                cliente: cliente.nombre,
                fecha: new Date().toISOString().split('T')[0],
                validez: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                total: total * 1.19,
                estado: 'Pendiente',
                items: this.currentConfig.items.length
            };

            Store.add('cotizaciones', cotizacion);
            Components.toast('Cotización generada correctamente', 'success');
            this.currentConfig = { items: [], cliente: null };
            this.currentTab = 'cotizaciones';
            this.render();
        });
    },

    renderProductos(container) {
        const productos = Store.get('productos');

        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Lista de Precios</h3>
                    <div class="flex gap-3">
                        ${Components.searchInput({ placeholder: 'Buscar...', id: 'search-lista' })}
                        <select class="form-select" style="width: 180px;" id="filter-categoria">
                            <option value="">Todas las categorías</option>
                            ${[...new Set(productos.map(p => p.categoria))].map(cat =>
            `<option value="${cat}">${cat}</option>`
        ).join('')}
                        </select>
                    </div>
                </div>
                <div class="card-body p-0">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>SKU</th>
                                <th>Producto</th>
                                <th>Categoría</th>
                                <th>P. Compra</th>
                                <th>P. Venta</th>
                                <th>Margen</th>
                                <th>Stock</th>
                                <th style="width:130px;">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${productos.map(p => {
            const compra = p.precioCompra || 0;
            const venta = p.precioVenta || p.precio || 0;
            const margen = compra > 0 ? Math.round(((venta - compra) / compra) * 100) : 0;
            const margenColor = margen >= 40 ? '#10b981' : margen >= 20 ? '#f59e0b' : '#ef4444';
            return `
                                    <tr data-cat="${p.categoria}">
                                        <td class="font-mono text-sm">${p.sku}</td>
                                        <td>
                                            <div class="font-medium">${p.nombre}</div>
                                            <div class="text-xs text-secondary">${p.marca || ''} ${p.modelo || ''}</div>
                                        </td>
                                        <td><span class="badge badge-primary">${p.categoria}</span></td>
                                        <td class="text-sm">${compra > 0 ? Utils.formatCurrency(compra) : '<span class="text-secondary">—</span>'}</td>
                                        <td class="font-medium">${Utils.formatCurrency(venta)}</td>
                                        <td><span style="color:${margenColor};font-weight:600;">${compra > 0 ? margen + '%' : '—'}</span></td>
                                        <td><span class="${p.stock <= (p.stockMinimo || 0) ? 'text-red-600 font-bold' : ''}">${p.stock}</span></td>
                                        <td>
                                            <div class="flex gap-1">
                                                <button class="btn btn-ghost btn-icon btn-sm" data-action="edit-price" data-id="${p.id}" title="Editar Precios">
                                                    <i data-lucide="edit" style="width:14px;height:14px;"></i>
                                                </button>
                                                <button class="btn btn-ghost btn-icon btn-sm" data-action="view-pim" data-id="${p.id}" title="Ver Ficha PIM">
                                                    <i data-lucide="file-text" style="width:14px;height:14px;"></i>
                                                </button>
                                                <button class="btn btn-ghost btn-icon btn-sm" data-action="view-inv" data-id="${p.id}" title="Ver en Inventario">
                                                    <i data-lucide="warehouse" style="width:14px;height:14px;"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                `;
        }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });

        // Search & filter
        const filterFn = () => {
            const search = (document.getElementById('search-lista')?.value || '').toLowerCase();
            const cat = document.getElementById('filter-categoria')?.value || '';
            container.querySelectorAll('.data-table tbody tr').forEach(row => {
                const text = row.textContent.toLowerCase();
                const matchesSearch = !search || text.includes(search);
                const matchesCat = !cat || row.dataset.cat === cat;
                row.style.display = matchesSearch && matchesCat ? '' : 'none';
            });
        };
        document.getElementById('search-lista')?.addEventListener('input', Utils.debounce(filterFn, 300));
        document.getElementById('filter-categoria')?.addEventListener('change', filterFn);

        // Edit price
        container.querySelectorAll('[data-action="edit-price"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const prod = Store.find('productos', parseInt(btn.dataset.id));
                if (prod) this.showEditPriceModal(prod);
            });
        });

        // View in PIM
        container.querySelectorAll('[data-action="view-pim"]').forEach(btn => {
            btn.addEventListener('click', () => {
                if (window.PIMModule) PIMModule.showProductView(parseInt(btn.dataset.id));
            });
        });

        // View in Inventario
        container.querySelectorAll('[data-action="view-inv"]').forEach(btn => {
            btn.addEventListener('click', () => {
                if (window.InventarioModule) InventarioModule.showProductDetail(parseInt(btn.dataset.id));
            });
        });
    },

    showEditPriceModal(producto) {
        const compra = producto.precioCompra || 0;
        const venta = producto.precioVenta || producto.precio || 0;
        const margen = compra > 0 ? Math.round(((venta - compra) / compra) * 100) : 0;

        const { modal, close } = Components.modal({
            title: 'Gestión de Precios',
            size: 'sm',
            content: `
                <div class="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div class="font-medium">${producto.nombre}</div>
                    <div class="text-sm text-secondary">SKU: ${producto.sku} · ${producto.marca || ''} ${producto.modelo || ''}</div>
                </div>
                <form id="price-form">
                    ${Components.formInput({ label: 'Precio de Compra', name: 'precioCompra', type: 'number', value: compra, required: true })}
                    ${Components.formInput({ label: 'Precio de Venta', name: 'precioVenta', type: 'number', value: venta, required: true })}
                    <div class="p-3 rounded-lg mt-3" style="background:var(--color-primary-50);">
                        <div class="flex justify-between text-sm">
                            <span class="text-secondary">Margen calculado:</span>
                            <span class="font-bold" id="calc-margin" style="color:${margen >= 40 ? '#10b981' : margen >= 20 ? '#f59e0b' : '#ef4444'}">${margen}%</span>
                        </div>
                    </div>
                </form>
            `,
            footer: `
                <button class="btn btn-secondary" data-action="cancel">Cancelar</button>
                <button class="btn btn-primary" data-action="save">Guardar Precios</button>
            `
        });

        // Live margin calculator
        const calcMargin = () => {
            const c = parseFloat(modal.querySelector('[name="precioCompra"]').value) || 0;
            const v = parseFloat(modal.querySelector('[name="precioVenta"]').value) || 0;
            const m = c > 0 ? Math.round(((v - c) / c) * 100) : 0;
            const el = modal.querySelector('#calc-margin');
            if (el) {
                el.textContent = m + '%';
                el.style.color = m >= 40 ? '#10b981' : m >= 20 ? '#f59e0b' : '#ef4444';
            }
        };
        modal.querySelector('[name="precioCompra"]')?.addEventListener('input', calcMargin);
        modal.querySelector('[name="precioVenta"]')?.addEventListener('input', calcMargin);

        modal.querySelector('[data-action="cancel"]').addEventListener('click', close);
        modal.querySelector('[data-action="save"]').addEventListener('click', () => {
            const precioCompra = parseFloat(modal.querySelector('[name="precioCompra"]').value) || 0;
            const precioVenta = parseFloat(modal.querySelector('[name="precioVenta"]').value) || 0;
            Store.update('productos', producto.id, { precioCompra, precioVenta, precio: precioVenta });
            Components.toast('Precios actualizados correctamente', 'success');
            close();
            this.renderTab('productos');
        });
    }
};

window.ComercialModule = ComercialModule;

