/* ==========================================================================
   EAX Platform - PIM Module (Product Information Management)
   ========================================================================== */

const PIMModule = {
    render() {
        const content = document.getElementById('page-content');
        const productos = Store.get('productos') || [];

        content.innerHTML = `
            <div class="animate-fadeIn">
                ${Components.pageHeader({
            title: 'Productos (PIM)',
            subtitle: 'Gestión centralizada de especificaciones técnicas y catálogo',
            actions: [
                { label: 'Nuevo Producto', icon: 'plus', class: 'btn-primary', action: 'new-product' }
            ]
        })}
                
                <div class="card mb-6">
                    <div class="card-body">
                        <div class="flex flex-col gap-4">
                            <!-- Search and Filters Line 1 -->
                            <div class="flex gap-4">
                                ${Components.searchInput({ placeholder: 'Buscar por código, nombre, marca...', id: 'search-pim', class: 'flex-1' })}
                            </div>
                            <!-- Filters Line 2 -->
                            <div class="flex gap-2 flex-wrap">
                                <select class="form-select text-sm" id="filter-tipo" style="width: 150px;">
                                    <option value="">Tipo (Todos)</option>
                                    <option value="Equipo">Equipo</option>
                                    <option value="Opcional">Opcional</option>
                                    <option value="Repuesto">Repuesto</option>
                                    <option value="Insumo">Insumo</option>
                                </select>
                                <select class="form-select text-sm" id="filter-familia" style="width: 150px;">
                                    <option value="">Familia (Todas)</option>
                                    ${[...new Set(productos.map(p => p.familia).filter(Boolean))].map(f => `<option value="${f}">${f}</option>`).join('')}
                                </select>
                                <select class="form-select text-sm" id="filter-marca" style="width: 150px;">
                                    <option value="">Marca (Todas)</option>
                                    ${[...new Set(productos.map(p => p.marca).filter(Boolean))].map(m => `<option value="${m}">${m}</option>`).join('')}
                                </select>
                                <select class="form-select text-sm" id="filter-ciclo" style="width: 150px;">
                                    <option value="">Ciclo (Todos)</option>
                                    <option value="Activo">Activo</option>
                                    <option value="Inactivo">Inactivo</option>
                                    <option value="Descontinuado">Descontinuado</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-body p-0" id="pim-table-container">
                        <!-- Table rendered via renderTable -->
                    </div>
                </div>
            </div>
        `;

        this.filterProducts();
        this.attachEvents();
    },

    attachEvents() {
        document.getElementById('search-pim')?.addEventListener('input', Utils.debounce(() => this.filterProducts(), 300));
        ['filter-tipo', 'filter-familia', 'filter-marca', 'filter-ciclo'].forEach(id => {
            document.getElementById(id)?.addEventListener('change', () => this.filterProducts());
        });

        document.querySelector('[data-action="new-product"]')?.addEventListener('click', () => {
            this.showProductForm();
        });
    },

    filterProducts() {
        const search = document.getElementById('search-pim')?.value || '';
        const tipo = document.getElementById('filter-tipo')?.value || '';
        const familia = document.getElementById('filter-familia')?.value || '';
        const marca = document.getElementById('filter-marca')?.value || '';
        const ciclo = document.getElementById('filter-ciclo')?.value || '';

        let productos = Store.get('productos') || [];

        if (search) productos = Utils.search(productos, search, ['nombre', 'sku', 'marca', 'modelo', 'nombreComercial']);
        if (tipo) productos = productos.filter(p => p.tipo === tipo);
        if (familia) productos = productos.filter(p => p.familia === familia);
        if (marca) productos = productos.filter(p => p.marca === marca);
        if (ciclo) productos = productos.filter(p => p.cicloVida === ciclo);

        this.renderTable(productos);
    },

    renderTable(productos) {
        const container = document.getElementById('pim-table-container');
        if (!container) return;

        container.innerHTML = Components.dataTable({
            columns: [
                { key: 'sku', label: 'Código' },
                { key: 'tipo', label: 'Tipo', type: 'badge' },
                { key: 'familia', label: 'Familia' },
                { key: 'marca', label: 'Marca' },
                { key: 'modelo', label: 'Modelo' },
                { key: 'nombreComercial', label: 'Nombre Comercial' },
                { key: 'cicloVida', label: 'Ciclo de Vida', type: 'badge' },
                { key: 'procedencia', label: 'Procedencia' }
            ],
            data: productos,
            actions: [
                { icon: 'eye', label: 'Ver Ficha', action: 'view' },
                { icon: 'edit', label: 'Editar', action: 'edit' }
            ]
        });

        if (window.lucide) lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });

        document.querySelectorAll('[data-action="edit"]').forEach(btn => {
            btn.addEventListener('click', () => this.showProductForm(parseInt(btn.dataset.id)));
        });

        document.querySelectorAll('[data-action="view"]').forEach(btn => {
            btn.addEventListener('click', () => this.showProductView(parseInt(btn.dataset.id)));
        });
    },

    showProductView(id) {
        const producto = Store.find('productos', id);
        if (!producto) return;

        const tabs = [
            { id: 'general', label: 'General' },
            { id: 'comercial', label: 'Comercial' },
            { id: 'tecnica', label: 'Técnica' },
            { id: 'certificaciones', label: 'Certificaciones' }
        ];

        const { modal, close } = Components.modal({
            title: `${producto.nombreComercial || producto.nombre} (Vista de Lectura)`,
            size: 'lg',
            content: `
                 <div class="tabs mb-6 border-b border-gray-200">
                    <div class="flex gap-6">
                        ${tabs.map((t, i) => `
                            <button class="tab-btn-view px-4 py-2 font-medium text-sm border-b-2 ${i === 0 ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}" 
                                    data-tab="${t.id}">
                                ${t.label}
                            </button>
                        `).join('')}
                    </div>
                </div>

                <div id="view-content" class="overflow-y-auto" style="max-height: 70vh;">
                    
                    <!-- GENERAL TAB -->
                    <div class="view-tab-content" id="view-tab-general">
                        <div class="grid grid-cols-2 gap-y-4 gap-x-8">
                            <div><label class="text-xs text-secondary uppercase tracking-wider">SKU</label><div class="font-medium">${producto.sku}</div></div>
                            <div><label class="text-xs text-secondary uppercase tracking-wider">Nombre Interno</label><div class="font-medium">${producto.nombre}</div></div>
                            <div><label class="text-xs text-secondary uppercase tracking-wider">Marca</label><div class="font-medium">${producto.marca || '-'}</div></div>
                            <div><label class="text-xs text-secondary uppercase tracking-wider">Modelo</label><div class="font-medium">${producto.modelo || '-'}</div></div>
                            <div><label class="text-xs text-secondary uppercase tracking-wider">Tipo</label><div class="font-medium"><span class="badge badge-primary">${producto.tipo || 'Equipo'}</span></div></div>
                            <div><label class="text-xs text-secondary uppercase tracking-wider">Familia</label><div class="font-medium">${producto.familia || '-'}</div></div>
                            <div><label class="text-xs text-secondary uppercase tracking-wider">Ciclo de Vida</label><div class="font-medium">${producto.cicloVida || '-'}</div></div>
                            <div><label class="text-xs text-secondary uppercase tracking-wider">Procedencia</label><div class="font-medium">${producto.procedencia || '-'}</div></div>
                            <div><label class="text-xs text-secondary uppercase tracking-wider">Ubicación</label><div class="font-medium">${producto.ubicacion || '-'}</div></div>
                            <div><label class="text-xs text-secondary uppercase tracking-wider">Stock</label><div class="font-medium">${producto.stock}</div></div>
                        </div>
                    </div>

                    <!-- COMERCIAL TAB -->
                    <div class="view-tab-content hidden" id="view-tab-comercial">
                        <div class="mb-6">
                            <h4 class="font-semibold mb-2">Descripción Comercial</h4>
                            <p class="text-gray-700 leading-relaxed">${producto.descripcionComercial || 'Sin descripción.'}</p>
                        </div>
                        <div class="grid grid-cols-2 gap-6">
                            <div>
                                <h4 class="font-semibold mb-2 text-green-700">Ventajas</h4>
                                <ul class="list-disc list-inside space-y-1 text-gray-700">
                                    ${(producto.ventajas || []).map(v => `<li>${v}</li>`).join('') || '<li class="text-gray-400 list-none">No especificadas</li>'}
                                </ul>
                            </div>
                            <div>
                                <h4 class="font-semibold mb-2 text-blue-700">Beneficios</h4>
                                <ul class="list-disc list-inside space-y-1 text-gray-700">
                                    ${(producto.beneficios || []).map(b => `<li>${b}</li>`).join('') || '<li class="text-gray-400 list-none">No especificados</li>'}
                                </ul>
                            </div>
                        </div>
                    </div>

                    <!-- TECNICA TAB -->
                    <div class="view-tab-content hidden" id="view-tab-tecnica">
                        ${(producto.especificaciones || []).length === 0 ?
                    '<div class="text-center py-8 text-gray-400">No hay especificaciones técnicas registradas.</div>' :
                    (producto.especificaciones || []).map(cat => `
                                <div class="mb-6">
                                    <div class="bg-gray-50 py-2 px-3 border-b border-gray-200 font-semibold text-gray-800 rounded-t-lg">
                                        ${cat.categoria}
                                    </div>
                                    <div class="border border-t-0 border-gray-100 rounded-b-lg overflow-hidden">
                                        <table class="w-full text-sm">
                                            <tbody>
                                                ${cat.items.map(item => `
                                                    <tr class="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                                                        <td class="py-2 px-3 w-1/3 text-gray-500 font-medium bg-gray-50/50">${item.key}</td>
                                                        <td class="py-2 px-3 text-gray-800">${item.value}</td>
                                                    </tr>
                                                `).join('')}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            `).join('')
                }
                    </div>

                    <!-- CERTIFICACIONES TAB -->
                    <div class="view-tab-content hidden" id="view-tab-certificaciones">
                         ${(producto.certificaciones || []).length === 0 ?
                    '<div class="text-center py-8 text-gray-400">No hay certificaciones adjuntas.</div>' :
                    `<div class="grid grid-cols-1 gap-2">
                                ${(producto.certificaciones || []).map(c => `
                                    <div class="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                                        <div class="flex items-center gap-3">
                                            <div class="bg-red-50 text-red-600 p-2 rounded">
                                                <i data-lucide="file-text" style="width:20px;height:20px;"></i>
                                            </div>
                                            <span class="font-medium text-gray-700">${c.nombre}</span>
                                        </div>
                                        <button class="btn btn-sm btn-ghost text-primary-600 hover:text-primary-800">
                                            <i data-lucide="download" style="width:16px;"></i> Descargar
                                        </button>
                                    </div>
                                `).join('')}
                            </div>`
                }
                    </div>
                </div>
            `,
            footer: `
                <button class="btn btn-secondary" data-action="close">Cerrar</button>
                <button class="btn btn-primary" data-action="export-pdf">
                    <i data-lucide="file-down" style="width:16px;margin-right:8px;"></i> Exportar Ficha Técnica
                </button>
            `
        });

        // Tabs Logic
        const tabBtns = modal.querySelectorAll('.tab-btn-view');
        const tabContents = modal.querySelectorAll('.view-tab-content');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => {
                    b.classList.remove('border-primary-600', 'text-primary-600');
                    b.classList.add('border-transparent', 'text-gray-500');
                });
                btn.classList.remove('border-transparent', 'text-gray-500');
                btn.classList.add('border-primary-600', 'text-primary-600');

                tabContents.forEach(c => c.classList.add('hidden'));
                modal.querySelector(`#view-tab-${btn.dataset.tab}`).classList.remove('hidden');
            });
        });

        // Actions
        modal.querySelector('[data-action="close"]').addEventListener('click', close);
        modal.querySelector('[data-action="export-pdf"]').addEventListener('click', () => {
            this.exportProductPDF(producto);
        });

        if (window.lucide) lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });
    },

    exportProductPDF(producto) {
        console.group('Exportando PDF para:', producto.nombreComercial);
        console.log('SKU:', producto.sku);
        console.groupEnd();
        Components.toast(`Descargando Ficha Técnica: Ficha_${producto.sku}.pdf`, 'success');
    },

    showProductForm(id = null) {
        const producto = id ? Store.find('productos', id) : {};
        const isEdit = !!id;

        const tabs = [
            { id: 'general', label: 'General' },
            { id: 'comercial', label: 'Comercial' },
            { id: 'tecnica', label: 'Técnica' },
            { id: 'certificaciones', label: 'Certificaciones' }
        ];

        const { modal, close } = Components.modal({
            title: isEdit ? `Actualizar: ${producto.nombreComercial || producto.nombre}` : 'Nuevo Producto',
            size: 'xl',
            content: `
                <div class="tabs mb-4 border-b border-gray-200">
                    <div class="flex gap-6">
                        ${tabs.map((t, i) => `
                            <button class="tab-btn px-4 py-2 font-medium text-sm border-b-2 ${i === 0 ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}" 
                                    data-tab="${t.id}">
                                ${t.label}
                            </button>
                        `).join('')}
                    </div>
                </div>

                <form id="pim-form" class="overflow-y-auto" style="max-height: 70vh;">
                    
                    <!-- GENERAL TAB -->
                    <div class="tab-content" id="tab-general">
                        <div class="grid grid-cols-2 gap-4">
                            ${Components.formInput({ label: 'Código (SKU)', name: 'sku', value: producto.sku || '', required: true })}
                            ${Components.formInput({ label: 'Nombre Comercial', name: 'nombreComercial', value: producto.nombreComercial || '' })}
                            ${Components.formInput({ label: 'Nombre Interno', name: 'nombre', value: producto.nombre || '', required: true })}
                            ${Components.formInput({ label: 'Marca', name: 'marca', value: producto.marca || '' })}
                            ${Components.formInput({ label: 'Modelo', name: 'modelo', value: producto.modelo || '' })}
                            ${Components.formInput({ label: 'Procedencia', name: 'procedencia', value: producto.procedencia || '' })}
                            
                            ${Components.formInput({
                label: 'Tipo', name: 'tipo', type: 'select', value: producto.tipo || 'Equipo',
                options: ['Equipo', 'Opcional', 'Repuesto', 'Insumo'].map(o => ({ value: o, label: o }))
            })}
                            ${Components.formInput({ label: 'Familia', name: 'familia', value: producto.familia || '' })}
                            ${Components.formInput({ label: 'Línea', name: 'linea', value: producto.linea || '' })}
                            
                            ${Components.formInput({
                label: 'Ciclo de Vida', name: 'cicloVida', type: 'select', value: producto.cicloVida || 'Activo',
                options: ['Activo', 'Inactivo', 'Descontinuado'].map(o => ({ value: o, label: o }))
            })}

                            ${Components.formInput({ label: 'Precio USD', name: 'precio', type: 'number', value: producto.precio || 0 })}
                            ${Components.formInput({ label: 'Stock Inicial', name: 'stock', type: 'number', value: producto.stock || 0 })}
                            ${Components.formInput({ label: 'Ubicación', name: 'ubicacion', value: producto.ubicacion || '' })}
                            ${Components.formInput({ label: 'Imagen URL', name: 'imagen', value: producto.imagen || '' })}
                        </div>
                    </div>

                    <!-- COMERCIAL TAB -->
                    <div class="tab-content hidden" id="tab-comercial">
                        ${Components.formInput({ label: 'Descripción Comercial', name: 'descripcionComercial', type: 'textarea', value: producto.descripcionComercial || '', rows: 4 })}
                        
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Ventajas Principales (una por línea)</label>
                            <textarea class="form-input w-full" name="ventajas" rows="4">${(producto.ventajas || []).join('\n')}</textarea>
                        </div>

                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Beneficios (una por línea)</label>
                            <textarea class="form-input w-full" name="beneficios" rows="4">${(producto.beneficios || []).join('\n')}</textarea>
                        </div>
                    </div>

                    <!-- TECNICA TAB -->
                    <div class="tab-content hidden" id="tab-tecnica">
                        <div id="specs-container"></div>
                        <button type="button" class="btn btn-outline btn-sm mt-4 w-full" id="add-spec-category">
                            <i data-lucide="plus"></i> Agregar Categoría
                        </button>
                    </div>

                    <!-- CERTIFICACIONES TAB -->
                    <div class="tab-content hidden" id="tab-certificaciones">
                        <div id="certs-container" class="flex flex-col gap-2 mb-4"></div>
                        
                        <div class="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:bg-gray-50 cursor-pointer" id="upload-cert">
                            <i data-lucide="upload-cloud" class="mx-auto h-8 w-8 text-gray-400 mb-2"></i>
                            <span class="text-sm text-gray-500">Click para subir documento</span>
                        </div>
                    </div>

                </form>
            `,
            footer: `
                <button class="btn btn-secondary" data-action="cancel">Cancelar</button>
                <button class="btn btn-primary" data-action="save">Guardar Cambios</button>
            `
        });

        // --- TAB LOGIC ---
        const tabBtns = modal.querySelectorAll('.tab-btn');
        const tabContents = modal.querySelectorAll('.tab-content');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => {
                    b.classList.remove('border-primary-600', 'text-primary-600');
                    b.classList.add('border-transparent', 'text-gray-500');
                });
                btn.classList.remove('border-transparent', 'text-gray-500');
                btn.classList.add('border-primary-600', 'text-primary-600');

                tabContents.forEach(c => c.classList.add('hidden'));
                modal.querySelector(`#tab-${btn.dataset.tab}`).classList.remove('hidden');
            });
        });

        // --- SPECS LOGIC ---
        let specs = producto.especificaciones || [];
        const specsContainer = modal.querySelector('#specs-container');

        const renderSpecs = () => {
            if (specs.length === 0) {
                specsContainer.innerHTML = `
                    <div class="text-center py-8 text-secondary bg-gray-50 rounded-lg dashed-border">
                        <i data-lucide="list" class="mx-auto h-8 w-8 mb-2 opacity-50"></i>
                        <p>No hay especificaciones técnicas.</p>
                        <p class="text-sm">Agrega categorías para organizar la información.</p>
                    </div>
                `;
            } else {
                specsContainer.innerHTML = specs.map((cat, catIndex) => `
                    <div class="card mb-4 border border-gray-200 shadow-sm overflow-hidden group">
                        <div class="card-header bg-gray-50 py-3 px-4 flex justify-between items-center border-b border-gray-200">
                            <div class="flex-1 mr-4">
                                <input type="text" 
                                       class="bg-transparent font-semibold text-gray-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-100 rounded px-2 py-1 w-full transition-all placeholder-gray-400" 
                                       value="${cat.categoria}" 
                                       onchange="this.dispatchEvent(new CustomEvent('update-cat', {detail: {idx: ${catIndex}, val: this.value}}))"
                                       placeholder="Nombre de la Categoría (Ej: Eléctrica)">
                            </div>
                            <button type="button" 
                                    class="text-gray-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50" 
                                    title="Eliminar Categoría"
                                    onclick="this.dispatchEvent(new CustomEvent('remove-cat', {detail: ${catIndex}}))">
                                <i data-lucide="trash-2" style="width:16px;height:16px;"></i>
                            </button>
                        </div>
                        <div class="p-4 grid grid-cols-1 gap-3 bg-white">
                            ${cat.items.map((item, itemIndex) => `
                                <div class="flex gap-3 items-start group/row">
                                    <div class="w-1/3">
                                        <input type="text" 
                                               class="form-input py-1.5 px-3 text-sm w-full bg-gray-50 focus:bg-white transition-colors" 
                                               placeholder="Característica" 
                                               value="${item.key}"
                                               onchange="this.dispatchEvent(new CustomEvent('update-spec-key', {detail: {c: ${catIndex}, i: ${itemIndex}, v: this.value}}))">
                                    </div>
                                    <div class="flex-1">
                                        <input type="text" 
                                               class="form-input py-1.5 px-3 text-sm w-full" 
                                               placeholder="Valor" 
                                               value="${item.value}"
                                               onchange="this.dispatchEvent(new CustomEvent('update-spec-val', {detail: {c: ${catIndex}, i: ${itemIndex}, v: this.value}}))">
                                    </div>
                                    <button type="button" 
                                            class="text-gray-300 hover:text-red-500 mt-1.5 opacity-0 group-hover/row:opacity-100 transition-all"
                                            title="Eliminar Fila"
                                            onclick="this.dispatchEvent(new CustomEvent('remove-spec', {detail: {c: ${catIndex}, i: ${itemIndex}}}))">
                                        <i data-lucide="x" style="width:16px;height:16px;"></i>
                                    </button>
                                </div>
                            `).join('')}
                            
                            <div class="mt-2 pt-2 border-t border-gray-100">
                                <button type="button" 
                                        class="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1.5 py-1 px-2 rounded hover:bg-primary-50 transition-colors inline-flex"
                                        onclick="this.dispatchEvent(new CustomEvent('add-spec', {detail: ${catIndex}}))">
                                    <i data-lucide="plus-circle" style="width:14px;height:14px;"></i> 
                                    Agregar Característica
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('');
            }
            if (window.lucide) lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });
        };

        // Event delegation for re-rendered specs
        specsContainer.addEventListener('update-cat', (e) => { specs[e.detail.idx].categoria = e.detail.val; });
        specsContainer.addEventListener('remove-cat', (e) => { specs.splice(e.detail, 1); renderSpecs(); });
        specsContainer.addEventListener('update-spec-key', (e) => { specs[e.detail.c].items[e.detail.i].key = e.detail.v; });
        specsContainer.addEventListener('update-spec-val', (e) => { specs[e.detail.c].items[e.detail.i].value = e.detail.v; });
        specsContainer.addEventListener('remove-spec', (e) => { specs[e.detail.c].items.splice(e.detail.i, 1); renderSpecs(); });
        specsContainer.addEventListener('add-spec', (e) => { specs[e.detail.c].items.push({ key: '', value: '' }); renderSpecs(); });

        renderSpecs();
        modal.querySelector('#add-spec-category').addEventListener('click', () => {
            specs.push({ categoria: 'Nueva Categoría', items: [{ key: '', value: '' }] });
            renderSpecs();
        });

        // --- CERTS LOGIC ---
        let certs = producto.certificaciones || [];
        const certsContainer = modal.querySelector('#certs-container');

        const renderCerts = () => {
            certsContainer.innerHTML = certs.map((c, i) => `
                <div class="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200">
                    <div class="flex items-center gap-2">
                        <i data-lucide="file-text" class="text-gray-400"></i>
                        <span>${c.nombre}</span>
                    </div>
                    <button type="button" class="text-red-500 hover:text-red-700"
                            onclick="this.dispatchEvent(new CustomEvent('remove-cert', {detail: ${i}}))">
                        <i data-lucide="trash-2" style="width:16px;"></i>
                    </button>
                </div>
            `).join('');
            if (window.lucide) lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });
        };

        certsContainer.addEventListener('remove-cert', (e) => { certs.splice(e.detail, 1); renderCerts(); });
        renderCerts();

        modal.querySelector('#upload-cert').addEventListener('click', () => {
            const name = prompt('Nombre del documento (Simulación):', 'Certificado ISO 9001');
            if (name) {
                certs.push({ nombre: name, url: '#' });
                renderCerts();
            }
        });

        // --- SAVE ---
        modal.querySelector('[data-action="save"]').addEventListener('click', () => {
            const form = document.getElementById('pim-form');
            if (!form.checkValidity()) { form.reportValidity(); return; }

            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            // Numbers
            data.precio = parseInt(data.precio) || 0;
            data.stock = parseInt(data.stock) || 0;

            // Arrays
            data.ventajas = formData.get('ventajas').split('\n').filter(Boolean);
            data.beneficios = formData.get('beneficios').split('\n').filter(Boolean);
            data.especificaciones = specs;
            data.certificaciones = certs;

            if (isEdit) {
                Store.update('productos', id, data);
            } else {
                data.stockMinimo = 5;
                Store.add('productos', data);
            }

            Components.toast('Producto guardado correctamente', 'success');
            close();
            this.filterProducts();
        });

        modal.querySelector('[data-action="cancel"]').addEventListener('click', close);
    }
};

window.PIMModule = PIMModule;
