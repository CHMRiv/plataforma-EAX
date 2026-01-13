/* ==========================================================================
   EAX Platform - Inventario Module
   ========================================================================== */

const InventarioModule = {
    currentTab: 'dashboard',

    render() {
        const content = document.getElementById('page-content');

        content.innerHTML = `
            <div class="animate-fadeIn">
                ${Components.pageHeader({
            title: 'Inventario',
            subtitle: 'Gestión inteligente de stock y almacenes',
            actions: [
                { label: 'Exportar Reporte', icon: 'download', class: 'btn-outline', action: 'export' },
                { label: 'Nuevo Producto', icon: 'plus', class: 'btn-primary', action: 'new-product' }
            ]
        })}

                ${Components.tabs({
            tabs: [
                { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
                { id: 'inventario', label: 'Productos', icon: 'package' },
                { id: 'movimientos', label: 'Movimientos', icon: 'arrow-left-right' },
                { id: 'configuracion', label: 'Configuración', icon: 'settings' }
            ],
            activeTab: this.currentTab
        })}

                <div id="inventory-content" class="mt-6"></div>
            </div>
        `;

        this.attachTabEvents();
        this.renderCurrentView();

        // Attach global header actions
        content.querySelector('[data-action="new-product"]')?.addEventListener('click', () => {
            this.showProductForm();
        });

        content.querySelector('[data-action="export"]')?.addEventListener('click', () => {
            alert('Exportando inventario...');
        });

        if (window.lucide) lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });
    },

    attachTabEvents() {
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.currentTab = tab.dataset.tab;
                this.renderCurrentView();
            });
        });
    },

    renderCurrentView() {
        const container = document.getElementById('inventory-content');
        if (!container) return;

        container.innerHTML = '';

        switch (this.currentTab) {
            case 'dashboard': this.renderDashboard(container); break;
            case 'inventario': this.renderInventario(container); break;
            case 'movimientos': this.renderMovimientos(container); break;
            case 'configuracion': this.renderConfiguracion(container); break;
        }

        if (window.lucide) lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });
    },

    renderDashboard(container) {
        const productos = Store.get('productos') || [];
        const movimientos = Store.get('movimientos') || [];

        const totalProductos = productos.length;
        const valorTotal = productos.reduce((sum, p) => sum + (p.precio * p.stock), 0);
        const stockBajo = productos.filter(p => p.stock <= p.stockMinimo);
        const movimientosHoy = movimientos.filter(m => m.fecha === new Date().toISOString().split('T')[0]).length;

        container.innerHTML = `
            <div class="grid grid-cols-4 gap-6 mb-6">
                ${Components.statCard({
            label: 'Total Productos',
            value: totalProductos,
            icon: 'package',
            iconClass: 'primary'
        })}
                ${Components.statCard({
            label: 'Valor Inventario',
            value: Utils.formatCurrency(valorTotal),
            icon: 'dollar-sign',
            iconClass: 'success'
        })}
                ${Components.statCard({
            label: 'Alertas Stock',
            value: stockBajo.length,
            icon: 'alert-triangle',
            iconClass: 'warning',
            change: stockBajo.length > 0 ? -stockBajo.length : 0 // Just for visual change effect
        })}
                ${Components.statCard({
            label: 'Movimientos Hoy',
            value: movimientosHoy,
            icon: 'activity',
            iconClass: 'info'
        })}
            </div>

            <div class="grid grid-cols-3 gap-6">
                <!-- Stock Bajo List -->
                <div class="card col-span-2">
                    <div class="card-header">
                        <h3 class="card-title">Productos con Stock Bajo</h3>
                        <span class="badge badge-warning">${stockBajo.length} Items</span>
                    </div>
                    <div class="card-body p-0">
                        ${stockBajo.length === 0 ?
                Components.emptyState({ icon: 'check-circle', title: 'Todo en orden', message: 'No hay productos con stock bajo.' }) :
                Components.dataTable({
                    columns: [
                        { key: 'nombre', label: 'Producto' },
                        { key: 'sku', label: 'SKU' },
                        { key: 'stockMinimo', label: 'Min' },
                        { key: 'stock', label: 'Actual', type: 'badge' } // We can customize this rendering if needed
                    ],
                    data: stockBajo,
                    actions: [{ icon: 'arrow-left-right', label: 'Reponer', action: 'restock' }]
                })
            }
                    </div>
                </div>

                <!-- Recent Activity (Simple List) -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Últimos Movimientos</h3>
                    </div>
                    <div class="card-body">
                        <div class="timeline">
                             ${movimientos.slice(-5).reverse().map(m => `
                                <div class="timeline-item">
                                    <div class="timeline-icon ${m.tipo === 'entrada' ? 'success' : 'warning'}">
                                        <i data-lucide="${m.tipo === 'entrada' ? 'arrow-down-left' : 'arrow-up-right'}"></i>
                                    </div>
                                    <div class="timeline-content">
                                        <div class="timeline-title">${m.producto}</div>
                                        <div class="timeline-description">
                                            ${m.tipo === 'entrada' ? 'Ingreso de' : 'Salida de'} <strong>${m.cantidad}</strong> unidades
                                        </div>
                                        <div class="timeline-time">${m.fecha}</div>
                                    </div>
                                </div>
                             `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderInventario(container) {
        const productos = Store.get('productos') || [];

        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <div class="flex gap-4 items-center w-full">
                        <div class="flex-1">
                            ${Components.searchInput({ placeholder: 'Buscar productos por nombre, SKU...', id: 'inv-search' })}
                        </div>
                        <div class="flex gap-2">
                            <select class="form-select" id="filter-category" style="width: 150px;">
                                <option value="">Todas las Categorías</option>
                                ${Store.get('configuracion_inventario').categorias.map(c => `<option value="${c}">${c}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                </div>
                <div class="card-body p-0" id="inventory-table-container">
                    <!-- Table rendered dynamically -->
                </div>
            </div>
        `;

        this.renderInventoryTable(productos);
        this.attachInventoryEvents();
    },

    renderInventoryTable(productos) {
        const container = document.getElementById('inventory-table-container');
        if (!container) return;

        // Custom renderer for Stock column to show alerts
        // We can pre-process the data to add a "stock_status" field for the badge.
        const processedData = productos.map(p => {
            let status = 'success';
            if (p.stock <= p.stockMinimo) status = 'danger';
            else if (p.stock <= p.stockMinimo * 2) status = 'warning';

            return {
                ...p,
                stock_label: p.stock, // We will use a badge type column but want the text to be the stock number? 
                // Actually Components.dataTable badge type uses Utils.getStatusColor(value).
                // Let's cheat a bit and create a specific status field for the badge color logic if we can, 
                // but Components.js logic for 'badge' does `Utils.getStatusColor(value)`. 
                // Utils.getStatusColor usually handles strings like 'Activo', 'Inactivo'.
                // If I pass a number, it returns 'primary' probably. 
                // So I'll modify the Component logic if needed, OR just stick to basic display.
                // Let's try to map 'stock' to a string that Utils understands or just leave it.
                // Actually, let's just use raw values and 'text' type for stock, and maybe a separate status column?
                // Or I can add a dedicated status field.
                estado: p.stock <= p.stockMinimo ? 'Bajo' : 'Normal'
            };
        });

        container.innerHTML = Components.dataTable({
            columns: [
                { key: 'nombre', label: 'Producto' },
                { key: 'sku', label: 'SKU' },
                { key: 'categoria', label: 'Categoría' },
                { key: 'ubicacion', label: 'Ubicación' },
                { key: 'precio', label: 'Precio', type: 'currency' },
                { key: 'stock', label: 'Stock' },
                { key: 'estado', label: 'Estado', type: 'badge' }
            ],
            data: processedData,
            actions: [
                { icon: 'eye', label: 'Ver', action: 'view' },
                { icon: 'edit', label: 'Editar', action: 'edit' },
                { icon: 'trash-2', label: 'Eliminar', action: 'delete' }
            ]
        });

        // Re-attach icons
        if (window.lucide) lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });

        // Attach action events within the table
        container.querySelectorAll('[data-action="view"]').forEach(btn =>
            btn.addEventListener('click', () => this.showProductDetail(parseInt(btn.dataset.id)))
        );
        container.querySelectorAll('[data-action="edit"]').forEach(btn =>
            btn.addEventListener('click', () => this.showProductForm(parseInt(btn.dataset.id)))
        );
        container.querySelectorAll('[data-action="delete"]').forEach(btn =>
            btn.addEventListener('click', () => this.deleteProduct(parseInt(btn.dataset.id)))
        );
    },

    attachInventoryEvents() {
        const searchInput = document.getElementById('inv-search');
        const filterCategory = document.getElementById('filter-category');

        const filterProducts = () => {
            let productos = Store.get('productos');
            const term = searchInput.value.toLowerCase();
            const cat = filterCategory.value;

            if (term) productos = Utils.search(productos, term, ['nombre', 'sku']);
            if (cat) productos = productos.filter(p => p.categoria === cat);

            this.renderInventoryTable(productos);
        };

        searchInput?.addEventListener('input', Utils.debounce(filterProducts, 300));
        filterCategory?.addEventListener('change', filterProducts);
    },

    renderMovimientos(container) {
        const productos = Store.get('productos') || [];
        const movimientos = Store.get('movimientos') || [];

        container.innerHTML = `
            <div class="grid grid-cols-3 gap-6">
                <!-- Form -->
                <div class="card h-fit">
                    <div class="card-header">
                        <h3 class="card-title">Registrar Movimiento</h3>
                    </div>
                    <div class="card-body">
                        <form id="movement-form">
                            <div class="form-group">
                                <label class="form-label">Producto</label>
                                <input type="text" list="products-list-mov" id="mov-product" class="form-input" placeholder="Buscar producto..." required>
                                <datalist id="products-list-mov">
                                    ${productos.map(p => `<option value="${p.nombre}">SKU: ${p.sku} | Stock: ${p.stock}</option>`).join('')}
                                </datalist>
                            </div>

                            ${Components.formInput({
            label: 'Tipo', name: 'tipo', type: 'select', required: true,
            options: [{ value: 'entrada', label: 'Entrada' }, { value: 'salida', label: 'Salida' }]
        })}

                            ${Components.formInput({
            label: 'Cantidad', name: 'cantidad', type: 'number', value: '1', required: true
        })}

                           ${Components.formInput({
            label: 'Referencia / Motivo', name: 'referencia', type: 'textarea'
        })}

                            <button type="button" class="btn btn-primary w-full mt-4" id="btn-save-movement">
                                <i data-lucide="save"></i> Registrar
                            </button>
                        </form>
                    </div>
                </div>

                <!-- History Table -->
                <div class="card col-span-2">
                    <div class="card-header">
                        <h3 class="card-title">Historial de Movimientos</h3>
                    </div>
                    <div class="card-body p-0">
                         ${Components.dataTable({
            columns: [
                { key: 'fecha', label: 'Fecha', type: 'date' },
                { key: 'tipo', label: 'Tipo', type: 'badge' },
                { key: 'producto', label: 'Producto' },
                { key: 'cantidad', label: 'Cant.' },
                { key: 'referencia', label: 'Ref.' }
            ],
            data: movimientos.slice().reverse()
        })}
                    </div>
                </div>
            </div>
        `;

        this.attachMovementEvents();
    },

    attachMovementEvents() {
        document.getElementById('btn-save-movement')?.addEventListener('click', () => {
            const form = document.getElementById('movement-form');
            const productName = document.getElementById('mov-product').value;
            const type = form.querySelector('[name="tipo"]').value;
            const qty = parseInt(form.querySelector('[name="cantidad"]').value);
            const ref = form.querySelector('[name="referencia"]').value;

            if (!productName || !qty) {
                Components.toast('Complete los campos obligatorios', 'warning');
                return;
            }

            const productos = Store.get('productos');
            const product = productos.find(p => p.nombre === productName);

            if (!product) {
                Components.toast('Producto no encontrado', 'error');
                return;
            }

            // Check stock for output
            if (type === 'salida' && product.stock < qty) {
                Components.toast('Stock insuficiente', 'error');
                return;
            }

            // Update stock
            let newStock = product.stock;
            if (type === 'entrada') newStock += qty;
            else newStock -= qty;

            Store.update('productos', product.id, { stock: newStock });

            // Record movement
            Store.add('movimientos', {
                tipo,
                producto: productName,
                cantidad: qty,
                referencia: ref,
                fecha: new Date().toISOString().split('T')[0]
            });

            Components.toast('Movimiento registrado', 'success');
            this.renderMovimientos(document.getElementById('inventory-content')); // Refresh
        });
    },

    renderConfiguracion(container) {
        const config = Store.get('configuracion_inventario');

        container.innerHTML = `
             <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="card">
                     <div class="card-header">
                        <h3 class="card-title">Configuración General</h3>
                    </div>
                    <div class="card-body">
                        ${Components.formInput({
            label: 'Stock Mínimo por Defecto',
            name: 'def-stock-min',
            type: 'number',
            value: config.stockMinimoDefault,
            disabled: true // Just a display for now as per previous code logic or we can enable editing
        })}
                    </div>
                </div>

                <div class="card">
                     <div class="card-header">
                        <h3 class="card-title">Gestión de Datos</h3>
                    </div>
                    <div class="card-body">
                        <p class="text-sm text-secondary mb-4">Descarga una copia completa del inventario actual.</p>
                        <button class="btn btn-outline" onclick="alert('Descargando backup...')">
                            <i data-lucide="download"></i> Exportar JSON
                        </button>
                    </div>
                </div>
             </div>
             
             <!-- Lists for Categories, Locations, etc. -->
             <div class="grid grid-cols-3 gap-6 mt-6">
                ${this.renderConfigList('Categorías', config.categorias)}
                ${this.renderConfigList('Ubicaciones', config.ubicaciones)}
                ${this.renderConfigList('Tipos de Producto', config.tiposProducto)}
             </div>
        `;
    },

    renderConfigList(title, items) {
        return `
            <div class="card h-full">
                <div class="card-header">
                    <h3 class="card-title">${title}</h3>
                </div>
                <div class="card-body">
                    <ul class="list-disc pl-5 text-sm text-gray-600 space-y-1">
                        ${items.map(i => `<li>${i}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
    },

    showProductForm(id = null) {
        const producto = id ? Store.find('productos', id) : null;
        const isEdit = !!producto;
        const config = Store.get('configuracion_inventario');

        const content = `
            <form id="product-form">
                <div class="grid grid-cols-2 gap-4">
                    ${Components.formInput({ label: 'Nombre Producto', name: 'nombre', value: producto?.nombre, required: true })}
                    ${Components.formInput({ label: 'SKU', name: 'sku', value: producto?.sku, required: true })}
                    ${Components.formInput({
            label: 'Categoría', name: 'categoria', type: 'select',
            value: producto?.categoria,
            options: config.categorias.map(c => ({ value: c, label: c }))
        })}
                    ${Components.formInput({
            label: 'Ubicación', name: 'ubicacion', type: 'select',
            value: producto?.ubicacion,
            options: config.ubicaciones.map(u => ({ value: u, label: u }))
        })}
                    ${Components.formInput({ label: 'Precio', name: 'precio', type: 'number', value: producto?.precio || 0, required: true })}
                    ${Components.formInput({ label: 'Stock Actual', name: 'stock', type: 'number', value: producto?.stock || 0 })}
                    ${Components.formInput({ label: 'Stock Mínimo', name: 'stockMinimo', type: 'number', value: producto?.stockMinimo || config.stockMinimoDefault })}
                    ${Components.formInput({ label: 'Marca', name: 'marca', value: producto?.marca })}
                </div>
            </form>
        `;

        const { modal, close } = Components.modal({
            title: isEdit ? 'Editar Producto' : 'Nuevo Producto',
            size: 'md',
            content,
            footer: `
                <button class="btn btn-secondary" data-action="cancel">Cancelar</button>
                <button class="btn btn-primary" data-action="save">Guardar</button>
            `
        });

        modal.querySelector('[data-action="cancel"]').addEventListener('click', close);
        modal.querySelector('[data-action="save"]').addEventListener('click', () => {
            const form = document.getElementById('product-form');
            if (!form.checkValidity()) { form.reportValidity(); return; }

            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            // Parse numbers
            data.precio = parseFloat(data.precio);
            data.stock = parseInt(data.stock);
            data.stockMinimo = parseInt(data.stockMinimo);

            if (isEdit) Store.update('productos', id, data);
            else Store.add('productos', data);

            Components.toast(isEdit ? 'Producto actualizado' : 'Producto creado', 'success');
            close();
            this.renderCurrentView(); // Refresh view
        });
    },

    showProductDetail(id) {
        const p = Store.find('productos', id);
        if (!p) return;

        Components.modal({
            title: 'Detalle de Producto',
            size: 'sm',
            content: `
                <div class="flex flex-col gap-4">
                    <div class="text-center mb-4">
                        <div class="w-24 h-24 bg-gray-100 rounded-lg mx-auto flex items-center justify-center mb-2">
                             <i data-lucide="package" style="width:40px;height:40px;color:#9ca3af;"></i>
                        </div>
                        <h3 class="text-lg font-bold">${p.nombre}</h3>
                        <p class="text-sm text-secondary">${p.sku}</p>
                    </div>
                    <div class="grid grid-cols-2 gap-4 text-sm">
                        <div class="p-3 bg-gray-50 rounded border border-gray-100">
                            <span class="block text-xs text-secondary">Categoría</span>
                            <span class="font-medium">${p.categoria}</span>
                        </div>
                        <div class="p-3 bg-gray-50 rounded border border-gray-100">
                             <span class="block text-xs text-secondary">Ubicación</span>
                            <span class="font-medium">${p.ubicacion}</span>
                        </div>
                         <div class="p-3 bg-gray-50 rounded border border-gray-100">
                             <span class="block text-xs text-secondary">Precio</span>
                            <span class="font-medium">${Utils.formatCurrency(p.precio)}</span>
                        </div>
                         <div class="p-3 bg-gray-50 rounded border border-gray-100">
                             <span class="block text-xs text-secondary">Stock</span>
                            <span class="font-medium ${p.stock <= p.stockMinimo ? 'text-red-600' : 'text-green-600'}">${p.stock}</span>
                        </div>
                    </div>
                </div>
            `
        });
        lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });
    },

    deleteProduct(id) {
        Components.confirm({
            title: 'Eliminar Producto',
            message: '¿Estás seguro? Esta acción no se puede deshacer.',
            type: 'danger'
        }).then(confirmed => {
            if (confirmed) {
                Store.delete('productos', id);
                Components.toast('Producto eliminado', 'success');
                this.renderCurrentView();
            }
        });
    }
};

window.InventarioModule = InventarioModule;
