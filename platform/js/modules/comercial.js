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
                Components.toast('Generando PDF...', 'info');
                setTimeout(() => Components.toast('PDF generado correctamente', 'success'), 1500);
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
    },

    showCotizacionDetail(id) {
        const cot = Store.find('cotizaciones', id);
        if (!cot) return;

        Components.modal({
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
            `
        });
    },

    renderConfigurador(container) {
        const productos = Store.get('productos');
        const clientes = Store.get('clientes');
        const total = this.currentConfig.items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

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
                                        <div class="font-bold text-lg">${Utils.formatCurrency(prod.precio)}</div>
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
                                            <div class="text-xs text-secondary">${Utils.formatCurrency(item.precio)}</div>
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
            const total = this.currentConfig.items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

            const cotizacion = {
                numero: `COT-${Date.now()}`,
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
                    ${Components.dataTable({
            columns: [
                { key: 'sku', label: 'SKU' },
                { key: 'nombre', label: 'Producto' },
                { key: 'categoria', label: 'Categoría' },
                { key: 'precio', label: 'Precio Lista', type: 'currency' },
                { key: 'stock', label: 'Stock Disponible' }
            ],
            data: productos,
            actions: [
                { icon: 'edit', label: 'Editar Precio', action: 'edit-price' }
            ]
        })}
                </div>
            </div>
        `;

        lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });

        document.querySelectorAll('[data-action="edit-price"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const prod = Store.find('productos', parseInt(btn.dataset.id));
                if (prod) {
                    this.showEditPriceModal(prod);
                }
            });
        });
    },

    showEditPriceModal(producto) {
        const { modal, close } = Components.modal({
            title: 'Editar Precio',
            size: 'sm',
            content: `
                <form id="price-form">
                    <div class="mb-4">
                        <div class="font-medium">${producto.nombre}</div>
                        <div class="text-sm text-secondary">SKU: ${producto.sku}</div>
                    </div>
                    ${Components.formInput({ label: 'Precio', name: 'precio', type: 'number', value: producto.precio, required: true })}
                </form>
            `,
            footer: `
                <button class="btn btn-secondary" data-action="cancel">Cancelar</button>
                <button class="btn btn-primary" data-action="save">Guardar</button>
            `
        });

        modal.querySelector('[data-action="cancel"]').addEventListener('click', close);
        modal.querySelector('[data-action="save"]').addEventListener('click', () => {
            const precio = parseInt(document.querySelector('[name="precio"]').value);
            Store.update('productos', producto.id, { precio });
            Components.toast('Precio actualizado', 'success');
            close();
            this.renderTab('productos');
        });
    }
};

window.ComercialModule = ComercialModule;
