/* ==========================================================================
   EAX Platform - Inventario Module
   ========================================================================== */

const InventarioModule = {
    currentTab: 'dashboard',

    render() {
        const content = document.getElementById('page-content');

        content.innerHTML = `
            <div class="inventory-module animate-fadeIn flex flex-col h-full bg-gray-50">
                <!-- Header Section -->
                <div class="bg-white border-b border-gray-200 px-8 py-6">
                    <div class="flex justify-between items-end mb-6">
                        <div>
                            <h1 class="text-3xl font-bold text-gray-900 tracking-tight">StockMaster</h1>
                            <p class="text-gray-500 mt-1 text-sm font-medium">Gestión Inteligente de Inventario</p>
                        </div>
                        <div class="text-xs text-gray-400 font-mono">
                            ${new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                    </div>

                    <!-- Navigation Tabs -->
                    <div class="flex gap-2">
                        ${this.renderTabButton('dashboard', 'Dashboard', 'layout-dashboard')}
                        ${this.renderTabButton('inventario', 'Inventario', 'package')}
                        ${this.renderTabButton('movimientos', 'Movimientos', 'arrow-left-right')}
                        ${this.renderTabButton('configuracion', 'Configuración', 'settings')}
                    </div>
                </div>

                <!-- Main Content Area -->
                <div class="flex-1 overflow-auto p-8" id="inventory-view-content">
                   <!-- Content injected here -->
                </div>
            </div>
        `;

        this.attachTabEvents(content);
        this.renderCurrentView();
    },

    renderTabButton(id, label, icon) {
        const isActive = this.currentTab === id;
        // Premium Tab Style
        const activeClass = "bg-green-50 text-green-700 border-green-200 shadow-sm ring-1 ring-green-200";
        const inactiveClass = "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-transparent hover:shadow-sm";

        return `
            <button class="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium border transition-all duration-200 ${isActive ? activeClass : inactiveClass}" 
                data-tab="${id}">
                <i data-lucide="${icon}" class="w-4 h-4"></i>
                ${label}
            </button>
        `;
    },

    attachTabEvents(content) {
        content.querySelectorAll('[data-tab]').forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchTab(tab.dataset.tab);
            });
        });
    },

    switchTab(tab) {
        this.currentTab = tab;
        this.render();
    },

    renderCurrentView() {
        const container = document.getElementById('inventory-view-content');
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
            <div class="space-y-8 max-w-7xl mx-auto">
                <!-- KPI Cards -->
                <div class="grid grid-cols-4 gap-6">
                    ${this.renderKpiCard('Total Productos', totalProductos, 'package', 'text-green-600', 'bg-green-50')}
                    ${this.renderKpiCard('Valor Inventario', Utils.formatCurrency(valorTotal), 'dollar-sign', 'text-emerald-600', 'bg-emerald-50')}
                    ${this.renderKpiCard('Alertas Stock', stockBajo.length, 'alert-triangle', 'text-amber-500', 'bg-amber-50')}
                    ${this.renderKpiCard('Movimientos Hoy', movimientosHoy, 'trending-up', 'text-blue-500', 'bg-blue-50')}
                </div>

                <!-- Main Grid -->
                <div class="grid grid-cols-3 gap-8">
                    <!-- Chart Section -->
                    <div class="col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100/50">
                        <div class="flex justify-between items-center mb-8">
                            <div>
                                <h3 class="font-bold text-gray-800 text-lg">Movimientos de la Semana</h3>
                                <p class="text-xs text-gray-400">Resumen de actividad reciente</p>
                            </div>
                            <button class="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-50 rounded-lg transition-colors"><i data-lucide="more-horizontal"></i></button>
                        </div>
                        <div class="h-64 flex items-end justify-between gap-4 px-4 pb-2 border-b border-gray-50">
                            ${[4, 3, 5, 2, 4, 1, 3].map((val, i) => `
                                <div class="flex flex-col items-center gap-3 flex-1 group cursor-pointer">
                                    <div class="w-full bg-gray-50 rounded-lg relative h-48 flex items-end overflow-hidden ring-1 ring-gray-100">
                                        <div class="w-full bg-green-500 opacity-80 group-hover:opacity-100 transition-all duration-500 rounded-lg" style="height: ${val * 15}%"></div>
                                    </div>
                                    <span class="text-xs font-medium text-gray-400 group-hover:text-green-600 transition-colors">01-${10 + i}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Low Stock Alerts -->
                    <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100/50 flex flex-col h-[400px]">
                        <div class="flex justify-between items-center mb-6">
                            <h3 class="font-bold text-gray-800 text-lg">Stock Bajo</h3>
                            <span class="text-xs font-bold bg-amber-50 text-amber-600 px-2 py-1 rounded-md border border-amber-100">${stockBajo.length} Items</span>
                        </div>
                        <div class="space-y-3 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                            ${stockBajo.length === 0 ?
                '<div class="h-full flex flex-col items-center justify-center text-gray-400 text-sm"><p>Todo en orden</p></div>' :
                stockBajo.map(p => `
                                    <div class="p-4 bg-red-50/30 hover:bg-red-50 transition-colors rounded-xl flex justify-between items-center border border-red-100/30 group">
                                        <div class="flex-1 min-w-0 pr-4">
                                            <div class="font-semibold text-gray-800 text-sm mb-1 truncate">${p.nombre}</div>
                                            <div class="text-xs text-red-500 font-medium flex items-center gap-2">
                                                <span class="bg-white px-1.5 rounded border border-red-100">Min: ${p.stockMinimo}</span>
                                                <span>Actual: ${p.stock}</span>
                                            </div>
                                        </div>
                                        <span class="flex-shrink-0 px-2.5 py-1 bg-white text-red-600 text-[10px] font-bold rounded-lg shadow-sm border border-red-100 uppercase tracking-wide">Alerta</span>
                                    </div>
                                `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderKpiCard(label, value, icon, colorClass, bgClass) {
        return `
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100/50 hover:shadow-md transition-all duration-200 group">
                <div class="flex items-start justify-between">
                    <div>
                        <div class="text-sm font-medium text-gray-500 mb-2 group-hover:text-gray-700 transition-colors">${label}</div>
                        <div class="text-3xl font-bold text-gray-900 tracking-tight">${value}</div>
                    </div>
                    <div class="p-3.5 ${bgClass} ${colorClass} rounded-2xl group-hover:scale-110 transition-transform">
                        <i data-lucide="${icon}" class="w-6 h-6"></i>
                    </div>
                </div>
            </div>
        `;
    },

    renderInventario(container) {
        const productos = Store.get('productos') || [];

        container.innerHTML = `
            <div class="space-y-6 max-w-7xl mx-auto h-full flex flex-col">
                <!-- Toolbar -->
                <div class="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100/50">
                    <div class="flex items-center gap-4 flex-1">
                        <!-- Search -->
                        <div class="relative flex-1 max-w-lg">
                            <i data-lucide="search" class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"></i>
                            <input type="text" id="inv-search" placeholder="Búsqueda global por nombre, SKU..." 
                                class="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm bg-gray-50/50 focus:bg-white">
                        </div>
                    </div>
                    
                    <div class="flex items-center gap-3">
                        <button class="flex items-center gap-2 px-4 py-2.5 text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl transition-all font-medium text-sm shadow-sm">
                            <i data-lucide="download" class="w-4 h-4"></i> Exportar
                        </button>
                         <button class="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all font-bold text-sm shadow-lg shadow-green-200 hover:shadow-green-300 transform hover:-translate-y-0.5"
                            data-action="new-product">
                            <i data-lucide="plus" class="w-4 h-4"></i> Nuevo Producto
                        </button>
                    </div>
                </div>

                <!-- Table Card -->
                <div class="bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden flex flex-col flex-1 min-h-0">
                     <div class="overflow-auto flex-1">
                        <table class="w-full text-left border-collapse">
                            <thead class="bg-gray-50/50 border-b border-gray-100 sticky top-0 z-10 backdrop-blur-sm">
                                <tr>
                                    <th class="p-5 w-10"><input type="checkbox" class="rounded border-gray-300 text-green-600 focus:ring-green-500"></th>
                                    <th class="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Producto</th>
                                    <th class="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">SKU</th>
                                    <th class="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Categoría</th>
                                    <th class="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Ubicación</th>
                                    <th class="p-5 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Stock</th>
                                    <th class="p-5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-50" id="inv-table-body">
                                ${productos.map(p => this.renderProductRow(p)).join('')}
                            </tbody>
                        </table>
                    </div>
                    <div class="p-4 border-t border-gray-100 bg-gray-50/30 text-xs text-gray-500 flex justify-center items-center gap-2">
                        <span class="font-medium text-gray-700">${productos.length}</span> productos encontrados
                    </div>
                </div>
            </div>
        `;

        this.attachInventoryEvents();
        if (window.lucide) lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });
    },

    renderProductRow(p) {
        const isLowStock = p.stock <= p.stockMinimo;

        return `
            <tr class="hover:bg-green-50/30 transition-colors group border-b border-gray-50 last:border-0">
                <td class="p-5">
                    <input type="checkbox" class="rounded border-gray-300 text-green-600 focus:ring-green-500">
                </td>
                <td class="p-5">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 overflow-hidden flex-shrink-0 shadow-sm">
                             ${p.imagen ? `<img src="${p.imagen}" class="w-full h-full object-cover">` : '<i data-lucide="image" class="w-6 h-6 opacity-30"></i>'}
                        </div>
                        <div>
                            <div class="font-bold text-gray-800 text-sm mb-0.5">${p.nombre}</div>
                            <div class="text-xs text-gray-400 font-medium">${p.modelo || 'Sin modelo'}</div>
                        </div>
                    </div>
                </td>
                <td class="p-5"><span class="font-mono text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md border border-gray-200">${p.sku}</span></td>
                <td class="p-5 text-sm text-gray-600 font-medium">${p.categoria}</td>
                <td class="p-5 text-sm text-gray-500">${p.ubicacion || '-'}</td>
                <td class="p-5 text-center">
                    <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${isLowStock ? 'bg-red-50 text-red-600 ring-1 ring-red-100' : 'bg-gray-100 text-gray-700'}">
                        ${isLowStock ? '<i data-lucide="alert-circle" class="w-3 h-3"></i>' : ''}
                        ${p.stock}
                    </div>
                </td>
                <td class="p-5 text-right">
                    <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                         <button class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100" title="Ver Detalles" onclick="InventarioModule.showProductDetail(${p.id})">
                            <i data-lucide="eye" class="w-4 h-4"></i>
                        </button>
                        <button class="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-transparent hover:border-green-100" title="Editar" onclick="InventarioModule.showProductForm(${p.id})">
                            <i data-lucide="edit-2" class="w-4 h-4"></i>
                        </button>
                        <button class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100" title="Eliminar">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    },

    attachInventoryEvents() {
        document.getElementById('inv-search')?.addEventListener('input', Utils.debounce((e) => {
            const term = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('#inv-table-body tr');

            rows.forEach(row => {
                const text = row.innerText.toLowerCase();
                row.style.display = text.includes(term) ? '' : 'none';
            });
        }, 300));

        document.querySelector('[data-action="new-product"]')?.addEventListener('click', () => {
            this.showProductForm();
        });
    },

    showProductDetail(id) {
        const producto = Store.find('productos', id);
        if (!producto) return;

        Components.modal({
            title: producto.nombre,
            size: 'md',
            content: `
                <div class="grid grid-cols-2 gap-6">
                    <div class="bg-gray-100 rounded-xl h-48 flex items-center justify-center">
                         ${producto.imagen ? `<img src="${producto.imagen}" class="w-full h-full object-cover rounded-xl">` : '<i data-lucide="package" style="width:64px;height:64px;color:var(--color-gray-400);"></i>'}
                    </div>
                    <div>
                        <div class="mb-4">
                            <div class="text-sm text-secondary">SKU</div>
                            <div class="font-medium">${producto.sku}</div>
                        </div>
                        <div class="mb-4">
                            <div class="text-sm text-secondary">Categoría</div>
                            <div class="font-medium">${producto.categoria}</div>
                        </div>
                        <div class="mb-4">
                            <div class="text-sm text-secondary">Precio</div>
                            <div class="font-bold text-xl">${Utils.formatCurrency(producto.precio)}</div>
                        </div>
                    </div>
                </div>
            `
        });
        if (window.lucide) lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });
    },

    showProductForm(id = null) {
        const producto = id ? Store.find('productos', id) : null;
        const isEdit = !!producto;

        const { modal, close } = Components.modal({
            title: isEdit ? 'Editar Producto' : 'Nuevo Producto',
            size: 'md',
            content: `
                <form id="product-form">
                    <div class="grid grid-cols-2 gap-4">
                        ${Components.formInput({ label: 'Nombre', name: 'nombre', value: producto?.nombre || '', required: true })}
                        ${Components.formInput({ label: 'SKU', name: 'sku', value: producto?.sku || '', required: true })}
                        ${Components.formInput({
                label: 'Categoría', name: 'categoria', type: 'select', value: producto?.categoria || '',
                options: Store.get('configuracion_inventario').categorias.map(c => ({ value: c, label: c }))
            })}
                        ${Components.formInput({
                label: 'Tipo', name: 'tipo', type: 'select', value: producto?.tipo || 'Equipo',
                options: Store.get('configuracion_inventario').tiposProducto.map(t => ({ value: t, label: t }))
            })}
                        ${Components.formInput({ label: 'Marca', name: 'marca', value: producto?.marca || '' })}
                        ${Components.formInput({ label: 'Modelo', name: 'modelo', value: producto?.modelo || '' })}
                        ${Components.formInput({ label: 'Precio', name: 'precio', type: 'number', value: producto?.precio || '', required: true })}
                        ${Components.formInput({ label: 'Stock', name: 'stock', type: 'number', value: producto?.stock || 0 })}
                        ${Components.formInput({ label: 'Stock Mínimo', name: 'stockMinimo', type: 'number', value: producto?.stockMinimo || 5 })}
                        ${Components.formInput({
                label: 'Ubicación', name: 'ubicacion', type: 'select', value: producto?.ubicacion || '',
                options: Store.get('configuracion_inventario').ubicaciones.map(u => ({ value: u, label: u }))
            })}
                    </div>
                </form>
            `,
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
            data.precio = parseInt(data.precio);
            data.stock = parseInt(data.stock);
            data.stockMinimo = parseInt(data.stockMinimo);

            if (isEdit) {
                Store.update('productos', id, data);
            } else {
                Store.add('productos', data);
            }

            close();
            this.renderTab(this.currentTab);
        });
    },

    renderMovimientos(container) {
        const productos = Store.get('productos') || [];
        const movimientos = Store.get('movimientos') || [];

        container.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 h-full">
                <!-- Registration Form -->
                <div class="col-span-1 bg-white p-8 rounded-2xl shadow-sm border border-gray-100/50 h-fit">
                    <h3 class="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                        <div class="p-2 bg-green-50 rounded-lg text-green-600">
                             <i data-lucide="arrow-left-right" class="w-5 h-5"></i>
                        </div>
                        Registrar Movimiento
                    </h3>
                    
                    <form id="movement-quick-form" class="space-y-5">
                        <div class="space-y-1.5">
                            <label class="block text-sm font-semibold text-gray-700">Buscar Producto</label>
                            <div class="relative">
                                <i data-lucide="search" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"></i>
                                <input type="text" list="products-list" name="product_name" class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-medium text-sm" placeholder="Escriba nombre o código...">
                            </div>
                            <datalist id="products-list">
                                ${productos.map(p => `<option value="${p.nombre}">SKU: ${p.sku} | Stock: ${p.stock}</option>`).join('')}
                            </datalist>
                        </div>

                        <div class="space-y-1.5">
                            <label class="block text-sm font-semibold text-gray-700">Tipo de Movimiento</label>
                            <div class="grid grid-cols-2 gap-3">
                                <label class="cursor-pointer group relative">
                                    <input type="radio" name="tipo" value="entrada" class="peer sr-only" checked>
                                    <div class="p-4 bg-gray-50 text-gray-600 rounded-xl text-center peer-checked:bg-green-50 peer-checked:text-green-700 peer-checked:border-green-200 border border-transparent transition-all hover:bg-white hover:shadow-md hover:-translate-y-0.5 peer-checked:shadow-sm ring-1 ring-transparent peer-checked:ring-green-200">
                                        <div class="font-bold flex flex-col items-center gap-1">
                                            <i data-lucide="arrow-down-left" class="w-5 h-5 mb-1 opacity-50 peer-checked:opacity-100"></i>
                                            Entrada
                                        </div>
                                    </div>
                                </label>
                                <label class="cursor-pointer group relative">
                                    <input type="radio" name="tipo" value="salida" class="peer sr-only">
                                    <div class="p-4 bg-gray-50 text-gray-600 rounded-xl text-center peer-checked:bg-red-50 peer-checked:text-red-700 peer-checked:border-red-200 border border-transparent transition-all hover:bg-white hover:shadow-md hover:-translate-y-0.5 peer-checked:shadow-sm ring-1 ring-transparent peer-checked:ring-red-200">
                                        <div class="font-bold flex flex-col items-center gap-1">
                                            <i data-lucide="arrow-up-right" class="w-5 h-5 mb-1 opacity-50 peer-checked:opacity-100"></i>
                                            Salida
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div class="space-y-1.5">
                            <label class="block text-sm font-semibold text-gray-700">Cantidad</label>
                            <input type="number" name="cantidad" min="1" value="1" class="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-bold text-gray-800" required>
                        </div>

                        <div class="space-y-1.5">
                            <label class="block text-sm font-semibold text-gray-700">Motivo / Comentario</label>
                            <textarea name="referencia" rows="3" class="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm" placeholder="Ej: Compra mensual, Venta #123..."></textarea>
                        </div>

                        <button type="button" class="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-green-200 hover:shadow-green-300 transform active:scale-95 transition-all flex items-center justify-center gap-2" id="btn-save-movement">
                            <span>Confirmar</span>
                            <i data-lucide="check" class="w-5 h-5"></i>
                        </button>
                    </form>
                </div>

                <!-- History -->
                <div class="col-span-2 space-y-4 flex flex-col h-full overflow-hidden">
                    <h3 class="text-xl font-bold text-gray-800 px-1">Historial Reciente</h3>
                    
                    <div class="bg-white rounded-2xl shadow-sm overflow-hidden flex-1 border border-gray-100/50 flex flex-col">
                         ${movimientos.length === 0 ?
                `<div class="h-full flex flex-col items-center justify-center text-gray-400 gap-4">
                                <div class="p-4 bg-gray-50 rounded-full"><i data-lucide="clipboard-list" class="w-8 h-8 opacity-50"></i></div>
                                <p class="font-medium">No hay movimientos registrados</p>
                            </div>` :
                `<div class="overflow-auto flex-1 p-0">
                                <table class="w-full text-left">
                                    <thead class="bg-gray-50/80 text-xs font-bold text-gray-500 uppercase sticky top-0 backdrop-blur-sm border-b border-gray-100">
                                        <tr>
                                            <th class="p-5">Tipo</th>
                                            <th class="p-5">Producto</th>
                                            <th class="p-5">Cant.</th>
                                            <th class="p-5">Fecha</th>
                                            <th class="p-5">Ref.</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-gray-50 text-sm">
                                        ${movimientos.slice().reverse().map(m => `
                                            <tr class="hover:bg-gray-50 transition-colors">
                                                <td class="p-5">
                                                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${m.tipo === 'entrada' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}">
                                                        <i data-lucide="${m.tipo === 'entrada' ? 'arrow-down-left' : 'arrow-up-right'}" class="w-3 h-3"></i>
                                                        ${m.tipo === 'entrada' ? 'Entrada' : 'Salida'}
                                                    </span>
                                                </td>
                                                <td class="p-5 font-bold text-gray-800">${m.producto}</td>
                                                <td class="p-5 font-mono font-bold text-gray-600">${m.cantidad}</td>
                                                <td class="p-5 text-gray-500 text-xs">${m.fecha}</td>
                                                <td class="p-5 text-gray-400 text-xs max-w-[200px] truncate" title="${m.referencia}">${m.referencia || '-'}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>`
            }
                    </div>
                </div>
            </div>
        `;

        if (window.lucide) lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });
        this.attachMovementEvents();
    },

    attachMovementEvents() {
        document.getElementById('btn-save-movement')?.addEventListener('click', () => {
            const form = document.getElementById('movement-quick-form');
            if (!form) return;

            const nameInput = form.querySelector('[name="product_name"]');
            const typeInput = form.querySelector('[name="tipo"]:checked');
            const qtyInput = form.querySelector('[name="cantidad"]');
            const refInput = form.querySelector('[name="referencia"]');

            if (!nameInput.value || !qtyInput.value) {
                alert('Por favor complete los campos obligatorios');
                return;
            }

            const data = {
                tipo: typeInput.value,
                producto: nameInput.value,
                cantidad: parseInt(qtyInput.value),
                referencia: refInput.value,
                fecha: new Date().toISOString().split('T')[0]
            };

            const productos = Store.get('productos');
            const product = productos.find(p => p.nombre === data.producto);

            if (!product) {
                alert('Producto no encontrado. Seleccione uno de la lista.');
                return;
            }

            let newStock = product.stock;
            if (data.tipo === 'entrada') newStock += data.cantidad;
            else if (data.tipo === 'salida') {
                if (product.stock < data.cantidad) {
                    alert('Stock insuficiente para realizar esta salida.');
                    return;
                }
                newStock -= data.cantidad;
            }

            Store.add('movimientos', data);
            Store.update('productos', product.id, { stock: newStock });

            Components.toast('Movimiento registrado con éxito', 'success');

            nameInput.value = '';
            qtyInput.value = '1';
            refInput.value = '';

            this.switchTab('movimientos');
        });
    },

    renderConfiguracion(container) {
        const config = Store.get('configuracion_inventario');

        container.innerHTML = `
            <div class="space-y-8 max-w-5xl mx-auto">
                <!-- Personalization -->
                <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100/50">
                    <h3 class="font-bold text-gray-800 text-lg mb-6 flex items-center gap-2">
                        <i data-lucide="palette" class="w-5 h-5 text-gray-400"></i>
                        Personalización
                    </h3>
                    
                    <div class="grid grid-cols-2 gap-12">
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-4">Tema de Color</label>
                            <div class="flex gap-4">
                                <button class="w-10 h-10 rounded-full bg-blue-600 ring-2 ring-offset-2 ring-blue-600 hover:scale-110 transition-transform shadow-sm"></button>
                                <button class="w-10 h-10 rounded-full bg-green-500 hover:scale-110 transition-transform shadow-sm"></button>
                                <button class="w-10 h-10 rounded-full bg-purple-600 hover:scale-110 transition-transform shadow-sm"></button>
                                <button class="w-10 h-10 rounded-full bg-orange-500 hover:scale-110 transition-transform shadow-sm"></button>
                                <button class="w-10 h-10 rounded-full bg-red-600 hover:scale-110 transition-transform shadow-sm"></button>
                                <button class="w-10 h-10 rounded-full bg-gray-600 hover:scale-110 transition-transform shadow-sm"></button>
                            </div>
                        </div>

                        <div>
                             <label class="block text-sm font-semibold text-gray-700 mb-4">Stock Mínimo Predeterminado</label>
                             <div class="flex items-center gap-4">
                                <input type="number" value="${config.stockMinimoDefault}" class="w-32 px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 font-medium text-gray-600 focus:outline-none" disabled>
                                <span class="text-xs text-gray-400">Valor por defecto para nuevos productos.</span>
                             </div>
                        </div>
                    </div>
                </div>

                <!-- Lists Configuration -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    ${this.renderConfigList('Tipos de Producto', config.tiposProducto, 'tag')}
                    ${this.renderConfigList('Ubicaciones', config.ubicaciones, 'map-pin')}
                    ${this.renderConfigList('Categorías', config.categorias, 'folder')}
                </div>

                <!-- Data Management -->
                <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100/50">
                    <h3 class="font-bold text-gray-800 text-lg mb-6 flex items-center gap-2">
                        <i data-lucide="database" class="w-5 h-5 text-gray-400"></i>
                        Gestión de Datos
                    </h3>
                    
                    <div class="bg-gray-50 p-6 rounded-xl flex items-center justify-between border border-gray-100">
                         <div>
                            <div class="font-bold text-gray-800 mb-1">Copia de Seguridad</div>
                            <div class="text-sm text-gray-500">Descarga una copia completa de tu inventario.</div>
                         </div>
                         <div class="flex gap-3">
                             <button class="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition-all" onclick="alert('Descargando backup.json...')">
                                <i data-lucide="download" class="w-4 h-4 inline mr-2"></i>Exportar Backup
                             </button>
                             <button class="px-5 py-2.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-xl text-sm font-bold hover:bg-blue-100 transition-all" onclick="alert('Feature coming soon')">
                                <i data-lucide="upload" class="w-4 h-4 inline mr-2"></i>Restaurar Backup
                             </button>
                         </div>
                    </div>
                </div>
            </div>
        `;

        if (window.lucide) lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });
    },

    renderConfigList(title, items, icon) {
        return `
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100/50 flex flex-col h-full">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="font-bold text-gray-800 flex items-center gap-2">
                        <i data-lucide="${icon}" class="w-4 h-4 text-gray-400"></i>
                        ${title}
                    </h3>
                </div>
                
                <div class="flex gap-2 mb-4">
                    <input type="text" placeholder="Nuevo item..." class="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white transition-all focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none" disabled>
                    <button class="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all" disabled>
                        <i data-lucide="plus" class="w-4 h-4"></i>
                    </button>
                </div>

                <div class="space-y-2 flex-1 overflow-y-auto max-h-48 pr-1 custom-scrollbar">
                    ${items.map(item => `
                        <div class="flex justify-between items-center text-sm p-3 bg-gray-50 rounded-xl group hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200 cursor-default">
                            <span class="text-gray-700 font-medium">${item}</span>
                            <button class="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all p-1">
                                <i data-lucide="x" class="w-3 h-3"></i>
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
};

window.InventarioModule = InventarioModule;
