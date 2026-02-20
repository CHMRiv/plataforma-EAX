/* ==========================================================================
   EAX Platform - PIM Module (Product Information Management)
   ========================================================================== */

const PIMModule = {
    currentTab: 'tecnico',

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
                
                ${Components.tabs({
            tabs: [
                { id: 'tecnico', label: 'Área Técnica', icon: 'settings' },
                { id: 'marketing', label: 'Área Marketing', icon: 'megaphone' },
                { id: 'postventa', label: 'Área Postventa', icon: 'wrench' }
            ],
            activeTab: this.currentTab
        })}

                <div id="pim-content" class="mt-6">
                    <!-- Content rendered via renderTab -->
                </div>
            </div>
        `;

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

        document.querySelector('[data-action="new-product"]')?.addEventListener('click', () => {
            this.showProductForm();
        });
    },

    renderTab(tab) {
        const container = document.getElementById('pim-content');
        if (!container) return;

        // Use unified tecnico-style view for all tabs
        this.renderUnifiedView(container);
    },

    renderUnifiedView(container) {
        const productos = Store.get('productos') || [];
        container.innerHTML = `
            <div class="card mb-6">
                <div class="card-body">
                    <div class="flex flex-col gap-4">
                        <div class="flex gap-4">
                            ${Components.searchInput({ placeholder: 'Buscar por código, nombre, marca...', id: 'search-pim', class: 'flex-1' })}
                            <div class="flex items-center gap-2 bg-primary-50 px-3 py-1 rounded-lg border border-primary-100">
                                <i data-lucide="info" class="text-primary-600" style="width:16px;"></i>
                                <span class="text-xs text-primary-700 font-medium">
                                    ${this.currentTab === 'tecnico' ? 'Filtros de especificaciones técnicas' :
                this.currentTab === 'marketing' ? 'Gestión de activos digitales y marketing' :
                    'Gestión de manuales y servicio técnico'}
                                </span>
                            </div>
                        </div>
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
                    <!-- Table rendered via filterProducts -->
                </div>
            </div>
        `;

        if (window.lucide) lucide.createIcons();
        this.attachUnifiedEvents();
        this.filterProducts();
    },

    attachUnifiedEvents() {
        document.getElementById('search-pim')?.addEventListener('input', Utils.debounce(() => this.filterProducts(), 300));
        ['filter-tipo', 'filter-familia', 'filter-marca', 'filter-ciclo'].forEach(id => {
            document.getElementById(id)?.addEventListener('change', () => this.filterProducts());
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

        const processedData = productos.map(p => {
            let score = 0;
            let statusBadge = '';

            if (this.currentTab === 'tecnico') {
                score = this.calculateCompleteness(p);
                statusBadge = `<span class="badge badge-${score > 80 ? 'success' : score > 50 ? 'warning' : 'secondary'}">${score}% Completo</span>`;
            } else if (this.currentTab === 'marketing') {
                const mkt = p.marketing || {};
                const filled = Object.values(mkt).filter(v => v && v.url).length;
                score = Math.round((filled / 14) * 100);
                statusBadge = `<span class="badge badge-${score > 70 ? 'success' : score > 30 ? 'warning' : 'secondary'}">${score}% Activos</span>`;
            } else {
                const pv = p.pim_postventa || {};
                const itemsCount = 7;
                const filled = Object.keys(pv).filter(k => pv[k] && (pv[k].checked || pv[k].notRequired)).length;
                score = Math.round((filled / itemsCount) * 100);
                statusBadge = `<span class="badge badge-${score > 80 ? 'success' : score > 40 ? 'warning' : 'secondary'}">${score}% Documentación</span>`;
            }

            return {
                ...p,
                statusView: statusBadge,
                thumb: `
                    <div class="avatar avatar-sm rounded bg-gray-50 border border-gray-100 font-bold text-gray-400">
                        ${p.sku?.substring(0, 2) || 'PR'}
                    </div>
                `,
                actions: `
                    <div class="flex justify-end gap-1">
                        <button class="btn btn-ghost btn-sm btn-icon" data-action="view" data-id="${p.id}" title="Ver Ficha"><i data-lucide="eye"></i></button>
                        <button class="btn btn-ghost btn-sm btn-icon" data-action="modal-context" data-id="${p.id}" title="${this.currentTab === 'tecnico' ? 'Editar General' : 'Gestionar ' + this.currentTab}"><i data-lucide="${this.currentTab === 'tecnico' ? 'edit-3' : (this.currentTab === 'marketing' ? 'megaphone' : 'wrench')}"></i></button>
                    </div>
                `
            };
        });

        container.innerHTML = Components.dataTable({
            columns: [
                { key: 'thumb', label: '' },
                { key: 'sku', label: 'Código' },
                { key: 'nombreComercial', label: 'Nombre Comercial' },
                { key: 'familia', label: 'Familia' },
                { key: 'tipo', label: 'Tipo', type: 'badge' },
                { key: 'statusView', label: this.currentTab === 'tecnico' ? 'Calidad Ficha' : (this.currentTab === 'marketing' ? 'Activos Mkt' : 'Documentación') }
            ],
            data: processedData
        });

        // Add actions manually to ensure correct event binding and custom icons
        const rows = container.querySelectorAll('tbody tr');
        rows.forEach((row, i) => {
            const actionsCell = document.createElement('td');
            actionsCell.className = 'px-6 py-4 text-right';
            actionsCell.innerHTML = processedData[i].actions;
            row.appendChild(actionsCell);
        });

        if (window.lucide) lucide.createIcons();

        container.querySelectorAll('[data-action="view"]').forEach(btn => {
            btn.onclick = () => {
                const id = parseInt(btn.dataset.id);
                let allowedTabs = [];
                let initialTab = '';

                if (this.currentTab === 'tecnico') {
                    allowedTabs = ['general', 'tecnica', 'certificaciones'];
                    initialTab = 'general';
                } else if (this.currentTab === 'marketing') {
                    allowedTabs = ['comercial'];
                    initialTab = 'comercial';
                } else {
                    allowedTabs = ['postventa'];
                    initialTab = 'postventa';
                }

                this.showProductView(id, initialTab, allowedTabs);
            };
        });

        container.querySelectorAll('[data-action="modal-context"]').forEach(btn => {
            btn.onclick = () => {
                const id = parseInt(btn.dataset.id);
                if (this.currentTab === 'tecnico') this.showProductForm(id);
                else if (this.currentTab === 'marketing') this.showMarketingModal(id);
                else this.showPostventaModal(id);
            };
        });
    },

    calculateCompleteness(p) {
        const fields = ['nombre', 'sku', 'marca', 'modelo', 'nombreComercial', 'descripcionComercial', 'tipo', 'familia', 'procedencia'];
        const filled = fields.filter(f => p[f] && p[f].toString().length > 0);
        let score = (filled.length / fields.length) * 80;
        if (p.especificaciones && p.especificaciones.length > 0) score += 10;
        if (p.certificaciones && p.certificaciones.length > 0) score += 10;
        return Math.round(score);
    },

    showMarketingModal(id) {
        const producto = Store.find('productos', id);
        if (!producto) return;

        const mkt = producto.marketing || {};
        const sections = [
            { title: 'Activos Fabricante', items: [{ id: 'fab_ficha', label: 'Ficha Técnica' }, { id: 'fab_catalogo', label: 'Catálogo' }, { id: 'fab_fotos', label: 'Fotografías' }] },
            { title: 'Activos EAX', items: [{ id: 'mkt_img_principal', label: 'Imagen Principal' }, { id: 'mkt_linea', label: 'Línea Mkt' }, { id: 'mkt_ficha', label: 'Ficha EAX' }] },
            { title: 'Canales de Venda', items: [{ id: 'mkt_web', label: 'Web Site' }, { id: 'mkt_tienda', label: 'Ecommerce' }] }
        ];

        const { modal, close } = Components.modal({
            title: `Canal Marketing: ${producto.sku}`,
            size: 'md',
            content: `
                <div class="space-y-6 pt-2">
                    ${sections.map(s => `
                        <div>
                            <h4 class="text-[10px] font-bold uppercase text-primary-600 mb-3 tracking-widest border-b border-primary-50 pb-1">${s.title}</h4>
                            <div class="space-y-2">
                                ${s.items.map(item => {
                const d = mkt[item.id] || { checked: false, url: '' };
                return `
                                        <div class="flex items-center gap-3 p-2 rounded-lg bg-gray-50 border border-transparent hover:border-gray-200 transition-all mkt-row" data-id="${item.id}">
                                            <input type="checkbox" class="form-checkbox text-primary-600 rounded" ${d.checked ? 'checked' : ''} id="c-${item.id}">
                                            <label class="text-xs font-semibold text-gray-700 w-32 shrink-0" for="c-${item.id}">${item.label}</label>
                                            <input type="text" class="form-input text-[11px] py-1 flex-1 bg-white" placeholder="Link o ubicación..." value="${d.url || ''}" id="u-${item.id}">
                                        </div>
                                    `;
            }).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `,
            footer: `<button class="btn btn-secondary" data-action="cancel">Cancelar</button><button class="btn btn-primary px-8" data-action="save">Guardar Marketing</button>`
        });

        modal.querySelector('[data-action="save"]').onclick = () => {
            const updated = { ...mkt };
            modal.querySelectorAll('.mkt-row').forEach(row => {
                const key = row.dataset.id;
                updated[key] = { checked: row.querySelector(`#c-${key}`).checked, url: row.querySelector(`#u-${key}`).value };
            });
            Store.update('productos', id, { marketing: updated });
            Components.toast('Marketing actualizado', 'success');
            close();
            this.filterProducts();
        };
        modal.querySelector('[data-action="cancel"]').onclick = close;
        if (window.lucide) lucide.createIcons();
    },

    showPostventaModal(id) {
        const producto = Store.find('productos', id);
        if (!producto) return;

        const pv = producto.pim_postventa || {};
        const fields = [
            { id: 'manual_operacion', label: 'Manual de Operación y Mantención', icon: 'book-open' },
            { id: 'instructivos_montaje', label: 'Instructivos de Montaje y proced.', icon: 'layout' },
            { id: 'programa_mantencion', label: 'Programa de Mantención', icon: 'calendar' },
            { id: 'costos_operacion', label: 'Costos de operación', icon: 'dollar-sign' },
            { id: 'manual_capacitacion', label: 'Manual de Capacitación', icon: 'graduation-cap' },
            { id: 'catalogo_repuestos', label: 'Catálogo de repuestos', icon: 'layers' },
            { id: 'fichas_despiece', label: 'Fichas de despiece', icon: 'component' }
        ];

        const { modal, close } = Components.modal({
            title: `Documentación Postventa: ${producto.sku}`,
            size: 'lg',
            content: `
                <div class="space-y-6 pt-2">
                    <div class="bg-primary-50/50 p-4 rounded-xl border border-primary-100 flex items-start gap-4">
                        <div class="p-2.5 bg-white rounded-lg shadow-sm border border-primary-100 shrink-0">
                            <i data-lucide="shield-check" class="text-primary-600" style="width:24px;"></i>
                        </div>
                        <div>
                            <h4 class="text-sm font-bold text-primary-900 mb-0.5">Centro de Documentación Técnica</h4>
                            <p class="text-xs text-primary-700 leading-relaxed font-medium">Gestione los manuales operativos y técnicos. Marque como <b class="text-primary-900">"No Req."</b> para excluir del progreso aquellos que no apliquen.</p>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 gap-3">
                        ${fields.map(field => {
                const d = pv[field.id] || { checked: false, notRequired: false, url: '' };
                return `
                                <div class="flex items-center gap-4 p-3 rounded-xl bg-white border border-gray-100 hover:border-primary-200 hover:shadow-sm transition-all pv-row cursor-default group" data-id="${field.id}">
                                    <div class="flex items-center gap-3 flex-1">
                                        <div class="p-2 rounded-lg bg-gray-50 text-gray-400 group-hover:bg-primary-50 group-hover:text-primary-500 transition-colors">
                                            <i data-lucide="${field.icon}" style="width:18px;"></i>
                                        </div>
                                        <div class="flex-1">
                                            <div class="flex items-center gap-2 mb-1">
                                                <input type="checkbox" class="form-checkbox text-primary-600 rounded h-4 w-4" ${d.checked ? 'checked' : ''} id="c-${field.id}">
                                                <label class="text-xs font-bold text-gray-800" for="c-${field.id}">${field.label}</label>
                                            </div>
                                            <input type="text" class="form-input text-[11px] py-1 bg-gray-50 border-none focus:ring-1 focus:ring-primary-400 w-full" 
                                                   placeholder="Link a la documentación..." value="${d.url || ''}" id="u-${field.id}">
                                        </div>
                                    </div>
                                    <div class="shrink-0 flex flex-col items-center gap-1 border-l pl-4 border-gray-100">
                                        <span class="text-[9px] font-bold uppercase text-gray-400">No Req.</span>
                                        <input type="checkbox" class="form-checkbox text-gray-400 rounded h-4 w-4" ${d.notRequired ? 'checked' : ''} id="n-${field.id}">
                                    </div>
                                </div>
                            `;
            }).join('')}
                    </div>
                </div>
            `,
            footer: `<button class="btn btn-secondary" data-action="cancel">Cancelar</button><button class="btn btn-primary px-10" data-action="save">Guardar Documentación</button>`
        });

        modal.querySelector('[data-action="save"]').onclick = () => {
            const updated = { ...pv };
            modal.querySelectorAll('.pv-row').forEach(row => {
                const key = row.dataset.id;
                updated[key] = {
                    checked: row.querySelector(`#c-${key}`).checked,
                    url: row.querySelector(`#u-${key}`).value,
                    notRequired: row.querySelector(`#n-${key}`).checked
                };
            });
            Store.update('productos', id, { pim_postventa: updated });
            Components.toast('Documentación actualizada', 'success');
            close();
            this.filterProducts();
        };
        modal.querySelector('[data-action="cancel"]').onclick = close;
        if (window.lucide) lucide.createIcons();
    },

    showMarketingModal(id) {
        const producto = Store.find('productos', id);
        if (!producto) return;

        const mkt = producto.marketing || {};

        const sections = [
            {
                title: 'Información Fabricante',
                items: [
                    { id: 'fab_ficha', label: 'Ficha Técnica' },
                    { id: 'fab_catalogo', label: 'Catálogo' },
                    { id: 'fab_fotos', label: 'Fotografías' },
                    { id: 'fab_videos', label: 'Videos' }
                ]
            },
            {
                title: 'Información EAX',
                items: [
                    { id: 'mkt_img_principal', label: 'Imagen Principal' },
                    { id: 'mkt_linea', label: 'Línea Productos' },
                    { id: 'mkt_iconografia', label: 'Iconografía' },
                    { id: 'mkt_ficha', label: 'Ficha Técnica' },
                    { id: 'mkt_video_eax', label: 'Video EAX' }
                ]
            },
            {
                title: 'Difusión',
                items: [
                    { id: 'mkt_mailing', label: 'Mailing' },
                    { id: 'mkt_blog', label: 'Blog' },
                    { id: 'mkt_web', label: 'Web' },
                    { id: 'mkt_tienda', label: 'Tienda Online' },
                    { id: 'mkt_cuestionario', label: 'Cuestionario' }
                ]
            }
        ];

        const { modal, close } = Components.modal({
            title: `Marketing: ${producto.nombreComercial || producto.nombre}`,
            size: 'lg',
            content: `
                <div class="marketing-modal-content overflow-y-auto" style="max-height: 70vh; padding-right: 8px;">
                    ${sections.map(section => `
                        <div class="mb-6">
                            <h4 class="text-primary-600 font-bold text-sm mb-3 pb-1 border-b border-gray-100">${section.title}</h4>
                            <div class="space-y-3">
                                ${section.items.map(item => {
                const data = mkt[item.id] || { checked: false, url: '' };
                return `
                                        <div class="flex items-center gap-3 marketing-row" data-id="${item.id}">
                                            <div class="shrink-0 pt-1">
                                                <input type="checkbox" class="form-checkbox h-4 w-4 text-primary-600 rounded" 
                                                       ${data.checked ? 'checked' : ''} id="check-${item.id}">
                                            </div>
                                            <div class="w-32 shrink-0">
                                                <label class="text-sm font-medium text-gray-700" for="check-${item.id}">${item.label}</label>
                                            </div>
                                            <div class="flex-1">
                                                <input type="text" class="form-input py-1 text-sm bg-gray-50 border-gray-200 focus:bg-white w-full" 
                                                       placeholder="URL / Ubicación" value="${data.url || ''}" id="url-${item.id}">
                                            </div>
                                            <div class="flex gap-1">
                                                <button class="btn btn-ghost btn-icon btn-sm border border-gray-200" title="Refrescar">
                                                    <i data-lucide="refresh-cw" style="width:14px;"></i>
                                                </button>
                                                <button class="btn btn-ghost btn-icon btn-sm border border-gray-200" title="Explorar">
                                                    <i data-lucide="folder-open" style="width:14px;"></i>
                                                </button>
                                            </div>
                                        </div>
                                    `;
            }).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `,
            footer: `
                <button class="btn btn-secondary" data-action="cancel">Cancelar</button>
                <button class="btn btn-primary px-8" data-action="save">Guardar</button>
            `
        });

        if (window.lucide) lucide.createIcons();

        modal.querySelector('[data-action="cancel"]').addEventListener('click', close);
        modal.querySelector('[data-action="save"]').addEventListener('click', () => {
            const updatedMkt = { ...mkt };
            modal.querySelectorAll('.marketing-row').forEach(row => {
                const itemId = row.dataset.id;
                updatedMkt[itemId] = {
                    checked: row.querySelector(`#check-${itemId}`).checked,
                    url: row.querySelector(`#url-${itemId}`).value
                };
            });

            Store.update('productos', id, { marketing: updatedMkt });
            const p = Store.find('productos', id);
            if (p) {
                // Trigger view update
                this.renderTab(this.currentTab);
            }
            Components.toast('Información de marketing actualizada', 'success');
            close();
        });
    },

    showProductView(id, initialTab = 'general', allowedTabs = ['general', 'comercial', 'tecnica', 'postventa', 'certificaciones']) {
        const producto = Store.find('productos', id);
        if (!producto) return;

        const allTabs = [
            { id: 'general', label: 'General', icon: 'info' },
            { id: 'comercial', label: 'Marketing/Comercial', icon: 'megaphone' },
            { id: 'tecnica', label: 'Especif. Técnicas', icon: 'settings' },
            { id: 'postventa', label: 'Postventa/Doc.', icon: 'wrench' },
            { id: 'certificaciones', label: 'Certificaciones', icon: 'shield' }
        ];

        // Filter tabs based on the allowed context
        const tabs = allTabs.filter(t => allowedTabs.includes(t.id));

        const { modal, close } = Components.modal({
            title: `${producto.sku}: ${producto.nombreComercial || producto.nombre}`,
            size: 'lg',
            content: `
                 <div class="tabs mb-6 border-b border-gray-200 overflow-x-auto ${tabs.length <= 1 ? 'hidden' : ''}">
                    <div class="flex gap-4 min-w-max">
                        ${tabs.map((t) => `
                            <button class="tab-btn-view px-4 py-2 font-bold text-xs uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${t.id === initialTab ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-400 hover:text-gray-600'}" 
                                    data-tab="${t.id}">
                                <i data-lucide="${t.icon}" style="width:14px;height:14px;"></i>
                                ${t.label}
                            </button>
                        `).join('')}
                    </div>
                </div>

                <div id="view-content" class="overflow-y-auto pr-2" style="max-height: 70vh;">
                    
                    <!-- GENERAL TAB -->
                    <div class="view-tab-content ${initialTab === 'general' ? '' : 'hidden'}" id="view-tab-general">
                        <div class="space-y-8">
                            <div>
                                <h3 class="text-lg font-semibold text-gray-900 mb-4">Información General</h3>
                                <div class="grid grid-cols-2 gap-x-12 gap-y-6">
                                    <div>
                                        <label class="text-xs text-gray-400 block mb-1">SKU / Código</label>
                                        <div class="text-gray-900 font-medium font-mono">${producto.sku}</div>
                                    </div>
                                    <div>
                                        <label class="text-xs text-gray-400 block mb-1">Nombre Interno</label>
                                        <div class="text-gray-900 font-medium">${producto.nombre}</div>
                                    </div>
                                    <div>
                                        <label class="text-xs text-gray-400 block mb-1">Marca / Proveedor</label>
                                        <div class="text-gray-900 font-medium">${producto.marca || '-'}</div>
                                    </div>
                                    <div>
                                        <label class="text-xs text-gray-400 block mb-1">Modelo / Versión</label>
                                        <div class="text-gray-900 font-medium">${producto.modelo || '-'}</div>
                                    </div>
                                    <div>
                                        <label class="text-xs text-gray-400 block mb-1">Categoría</label>
                                        <div class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">${producto.tipo || 'Equipo'}</div>
                                    </div>
                                    <div>
                                        <label class="text-xs text-gray-400 block mb-1">Familia</label>
                                        <div class="text-gray-900 font-medium">${producto.familia || '-'}</div>
                                    </div>
                                    <div>
                                        <label class="text-xs text-gray-400 block mb-1">Estado</label>
                                        <div class="text-gray-900 font-medium">${producto.cicloVida || 'Activo'}</div>
                                    </div>
                                    <div>
                                        <label class="text-xs text-gray-400 block mb-1">Origen</label>
                                        <div class="text-gray-900 font-medium">${producto.procedencia || '-'}</div>
                                    </div>
                                </div>
                            </div>

                            <div class="grid grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                                <div class="flex items-center gap-4">
                                    <div class="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                        <i data-lucide="warehouse" style="width:20px;"></i>
                                    </div>
                                    <div>
                                        <div class="text-xs text-gray-400">Stock Actual</div>
                                        <div class="text-xl font-bold text-gray-900">${producto.stock} <span class="text-sm font-normal text-gray-500">unids</span></div>
                                    </div>
                                </div>
                                <div class="flex items-center gap-4 border-l border-gray-100 pl-6">
                                    <div class="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                                        <i data-lucide="dollar-sign" style="width:20px;"></i>
                                    </div>
                                    <div>
                                        <div class="text-xs text-gray-400">Precio de Venta</div>
                                        <div class="text-xl font-bold text-gray-900">${Utils.formatCurrency(producto.precioVenta || producto.precio)}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- MARKETING TAB -->
                    <div class="view-tab-content ${initialTab === 'marketing' || initialTab === 'comercial' ? '' : 'hidden'}" id="view-tab-comercial">
                        <div class="space-y-8">
                            <div>
                                <h3 class="text-lg font-semibold text-gray-900 mb-4">Presentación Comercial</h3>
                                <p class="text-gray-600 leading-relaxed text-sm bg-gray-50 p-4 rounded-lg border border-gray-100">${producto.descripcionComercial || 'No hay descripción comercial disponible.'}</p>
                            </div>
                            
                            <div class="grid grid-cols-2 gap-8">
                                <div>
                                    <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Ventajas</h4>
                                    <ul class="space-y-2">
                                        ${(producto.ventajas || []).map(v => `<li class="text-sm text-gray-600 flex gap-2"><div class="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5"></div> ${v}</li>`).join('') || '<li class="text-xs text-gray-400 italic">No registradas</li>'}
                                    </ul>
                                </div>
                                <div>
                                    <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Beneficios</h4>
                                    <ul class="space-y-2">
                                        ${(producto.beneficios || []).map(b => `<li class="text-sm text-gray-600 flex gap-2"><div class="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5"></div> ${b}</li>`).join('') || '<li class="text-xs text-gray-400 italic">No registrados</li>'}
                                    </ul>
                                </div>
                            </div>

                            <div class="pt-8 border-t border-gray-100">
                                <h4 class="text-sm font-semibold text-gray-900 mb-4">Recursos Multimedia</h4>
                                <div class="grid grid-cols-3 gap-4">
                                    ${Object.entries(producto.marketing || {}).map(([key, data]) => `
                                        <div class="p-3 rounded-lg border ${data.url ? 'bg-white border-gray-200 hover:border-primary-300' : 'bg-gray-50 border-gray-100 opacity-60'} flex items-center justify-between transition-all">
                                            <div class="flex items-center gap-2">
                                                <i data-lucide="file-text" class="${data.url ? 'text-primary-500' : 'text-gray-400'}" style="width:16px;"></i>
                                                <span class="text-xs font-medium text-gray-700">${key.split('_').pop().toUpperCase()}</span>
                                            </div>
                                            ${data.url ? `<a href="${data.url}" target="_blank" class="text-gray-400 hover:text-primary-600"><i data-lucide="external-link" style="width:14px;"></i></a>` : ''}
                                        </div>
                                    `).join('') || '<div class="col-span-3 text-center py-6 text-gray-400 text-xs bg-gray-50 rounded-lg">Sin activos digitales vinculados</div>'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- TECNICA TAB -->
                    <div class="view-tab-content ${initialTab === 'tecnica' || initialTab === 'tecnico' ? '' : 'hidden'}" id="view-tab-tecnica">
                        <div class="space-y-8">
                            ${(producto.especificaciones || []).length === 0 ?
                    '<div class="text-center py-16 bg-gray-50 rounded-xl text-gray-400 text-sm">No hay especificaciones técnicas registradas.</div>' :
                    (producto.especificaciones || []).map(cat => `
                                <div>
                                    <h3 class="text-sm font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">${cat.categoria}</h3>
                                    <div class="grid grid-cols-1 divide-y divide-gray-50">
                                        ${cat.items.map(item => `
                                            <div class="grid grid-cols-2 py-2 text-sm">
                                                <div class="text-gray-500">${item.key}</div>
                                                <div class="text-gray-900 font-medium">${item.value}</div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- POSTVENTA TAB -->
                    <div class="view-tab-content ${initialTab === 'postventa' ? '' : 'hidden'}" id="view-tab-postventa">
                        <div class="space-y-6">
                            <div class="bg-gray-50 p-6 rounded-xl border border-gray-100 flex items-center justify-between">
                                <div>
                                    <h3 class="text-lg font-semibold text-gray-900">Centro de Documentación</h3>
                                    <p class="text-sm text-gray-500">Documentación técnica estratégica para soporte post-venta.</p>
                                </div>
                                <div class="w-12 h-12 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center">
                                    <i data-lucide="wrench" style="width:24px;"></i>
                                </div>
                            </div>

                            <div class="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden bg-white">
                                ${Object.entries(producto.pim_postventa || {}).map(([key, data]) => {
                        const labels = {
                            manual_operacion: 'Manual de Operación & Mantención',
                            instructivos_montaje: 'Guía de Instalación / Montaje',
                            programa_mantencion: 'Programa de Mantención Preventiva',
                            costos_operacion: 'Análisis de Costos Operativos',
                            manual_capacitacion: 'Material de Capacitación',
                            catalogo_repuestos: 'Catálogo de Repuestos Críticos',
                            fichas_despiece: 'Diagramas de Despiece'
                        };
                        return `
                                        <div class="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                                            <div class="flex items-center gap-4">
                                                <div class="w-10 h-10 rounded bg-gray-50 flex items-center justify-center text-gray-400">
                                                    <i data-lucide="${data.url ? 'file-text' : 'file'}" style="width:18px;"></i>
                                                </div>
                                                <div>
                                                    <div class="text-sm font-semibold ${data.url ? 'text-gray-900' : 'text-gray-400'}">${labels[key] || key}</div>
                                                    <div class="flex items-center gap-2 mt-1">
                                                        <span class="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${data.notRequired ? 'bg-amber-50 text-amber-600' : 'bg-gray-100 text-gray-500'}">
                                                            ${data.notRequired ? 'Opcional' : 'Requerido'}
                                                        </span>
                                                        ${data.url ? '<span class="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-green-50 text-green-600">Disponible</span>' : ''}
                                                    </div>
                                                </div>
                                            </div>
                                            ${data.url ? `<a href="${data.url}" target="_blank" class="text-primary-600 hover:underline text-xs font-semibold">Descargar PDF</a>` : `<span class="text-[10px] font-bold text-gray-300 uppercase">Pendiente</span>`}
                                        </div>
                                    `;
                    }).join('') || '<div class="text-center py-12 text-gray-400 text-sm">No hay registros de postventa.</div>'}
                            </div>
                        </div>
                    </div>

                    <!-- CERTIFICACIONES TAB -->
                    <div class="view-tab-content ${initialTab === 'certificaciones' ? '' : 'hidden'}" id="view-tab-certificaciones">
                        <div class="space-y-6">
                            <h3 class="text-lg font-semibold text-gray-900">Acreditaciones y Certificaciones</h3>
                            ${(producto.certificaciones || []).length === 0 ?
                    '<div class="text-center py-16 bg-gray-50 rounded-xl text-gray-400 text-sm">No hay certificaciones disponibles.</div>' :
                    `<div class="grid grid-cols-1 gap-4">
                                ${(producto.certificaciones || []).map(c => `
                                    <div class="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl transition-shadow hover:shadow-sm">
                                        <div class="flex items-center gap-4">
                                            <div class="w-12 h-12 bg-red-50 text-red-500 rounded-lg flex items-center justify-center">
                                                <i data-lucide="shield-check" style="width:24px;"></i>
                                            </div>
                                            <div>
                                                <div class="font-semibold text-gray-900 text-sm">${c.nombre}</div>
                                                <div class="text-xs text-gray-400">Verificado / PDF Original</div>
                                            </div>
                                        </div>
                                        <button class="text-primary-600 hover:text-primary-700 text-xs font-bold px-4 py-2 rounded-lg border border-primary-50 hover:bg-primary-50 transition-all flex items-center gap-2">
                                            <i data-lucide="download" style="width:14px;"></i> DESCARGAR
                                        </button>
                                    </div>
                                `).join('')}
                            </div>`}
                        </div>
                    </div>
                </div>
            `,
            footer: `
                <div class="flex items-center justify-between w-full">
                    <div class="flex gap-2">
                        <button class="btn btn-ghost" data-action="go-inventario">
                            <i data-lucide="warehouse" style="width:16px;height:16px;margin-right:4px;"></i> Inventario
                        </button>
                    </div>
                    <div class="flex gap-2">
                        <button class="btn btn-secondary" data-action="close">Cerrar</button>
                        <button class="btn btn-primary" data-action="export-pdf">
                            <i data-lucide="file-down" style="width:16px;margin-right:8px;"></i> Exportar PDF
                        </button>
                    </div>
                </div>
            `
        });

        const tabBtns = modal.querySelectorAll('.tab-btn-view');
        const tabContents = modal.querySelectorAll('.view-tab-content');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => {
                    b.classList.remove('border-primary-600', 'text-primary-600');
                    b.classList.add('border-transparent', 'text-gray-400');
                });
                btn.classList.remove('border-transparent', 'text-gray-400');
                btn.classList.add('border-primary-600', 'text-primary-600');

                tabContents.forEach(c => c.classList.add('hidden'));
                const contentId = btn.dataset.tab === 'marketing' ? 'view-tab-comercial' : `view-tab-${btn.dataset.tab}`;
                modal.querySelector(`#${contentId}`).classList.remove('hidden');
            });
        });

        modal.querySelector('[data-action="close"]').addEventListener('click', close);
        modal.querySelector('[data-action="export-pdf"]').addEventListener('click', () => this.exportProductPDF(producto));
        modal.querySelector('[data-action="go-inventario"]')?.addEventListener('click', () => {
            close();
            if (window.InventarioModule) InventarioModule.showProductDetail(producto.id);
        });

        if (window.lucide) lucide.createIcons();
    },

    exportProductPDF(producto) {
        const printWin = window.open('', '_blank');
        const specs = (producto.especificaciones || []).map(cat => `
            <h3 style="background:#f8fafc;padding:10px 15px;border-radius:6px;margin:25px 0 10px;color:#1e293b;font-size:16px;border-left:4px solid #3b82f6;">${cat.categoria}</h3>
            <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
                ${cat.items.map(item => `
                    <tr>
                        <td style="padding:10px 15px;border-bottom:1px solid #f1f5f9;width:35%;color:#64748b;font-weight:600;font-size:13px;">${item.key}</td>
                        <td style="padding:10px 15px;border-bottom:1px solid #f1f5f9;color:#1e293b;font-size:13px;">${item.value}</td>
                    </tr>
                `).join('')}
            </table>
        `).join('');

        const certs = (producto.certificaciones || []).map(c => `
            <div style="display:inline-block;padding:8px 16px;background:#f0f9ff;border:1px solid #bae6fd;color:#0369a1;border-radius:20px;margin:4px;font-size:12px;font-weight:500;">
                <span style="margin-right:4px;">✓</span> ${c.nombre}
            </div>
        `).join('');

        printWin.document.write(`
            <html><head><title>Ficha Técnica - ${producto.sku}</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                body { font-family: 'Inter', sans-serif; padding: 50px; max-width: 850px; margin: 0 auto; color: #334155; line-height: 1.6; }
                .brand-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #e2e8f0; padding-bottom: 25px; }
                .logo { font-size: 28px; font-weight: 800; color: #2563eb; letter-spacing: -0.5px; }
                .sku-badge { background: #f1f5f9; color: #475569; padding: 4px 12px; border-radius: 6px; font-size: 13px; font-weight: 700; margin-top: 8px; display: inline-block; }
                
                h1 { margin: 0; font-size: 28px; color: #0f172a; font-weight: 700; }
                h2 { color: #0f172a; font-size: 20px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-top: 35px; }
                
                .meta-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 30px 0; background: #f8fafc; padding: 20px; border-radius: 12px; }
                .meta-item label { display: block; font-size: 11px; text-transform: uppercase; color: #94a3b8; font-weight: 600; margin-bottom: 4px; }
                .meta-item div { font-weight: 600; color: #1e293b; font-size: 14px; }
                
                .description { font-size: 15px; color: #475569; }
                .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 11px; text-align: center; }
                @media print { body { padding: 0; } }
            </style></head><body>
            <div class="brand-header">
                <div>
                    <h1>${producto.nombreComercial || producto.nombre}</h1>
                    <div class="sku-badge">SKU: ${producto.sku}</div>
                </div>
                <div style="text-align:right;">
                    <div class="logo">EAX</div>
                    <div style="color:#64748b;font-size:12px;margin-top:4px;">Technical Data Sheet</div>
                </div>
            </div>

            <div class="meta-grid">
                <div class="meta-item"><label>Marca</label><div>${producto.marca || '-'}</div></div>
                <div class="meta-item"><label>Modelo</label><div>${producto.modelo || '-'}</div></div>
                <div class="meta-item"><label>Familia</label><div>${producto.familia || '-'}</div></div>
                <div class="meta-item"><label>Procedencia</label><div>${producto.procedencia || '-'}</div></div>
            </div>

            ${producto.descripcionComercial ? `<h2>Descripción del Producto</h2><p class="description">${producto.descripcionComercial}</p>` : ''}

            ${specs ? `<h2>Especificaciones Técnicas</h2>${specs}` : ''}
            
            ${certs ? `<h2>Certificaciones y Estándares</h2><div style="margin-top:15px;">${certs}</div>` : ''}

            <div class="footer">
                EAX Corp — Información técnica confidencial para uso interno y comercial autorizado.<br>
                Generado el ${new Date().toLocaleDateString('es-CL')} — www.eax-platform.com
            </div>
            </body></html>
        `);
        printWin.document.close();
        printWin.focus();
        setTimeout(() => printWin.print(), 800);
        Components.toast(`Ficha técnica generada: ${producto.sku}`, 'success');
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
            this.renderTab(this.currentTab);
        });

        modal.querySelector('[data-action="cancel"]').addEventListener('click', close);
    }
};

window.PIMModule = PIMModule;
