/* ==========================================================================
   EAX Platform - Proveedores Module
   ========================================================================== */

const ProveedoresModule = {
    render() {
        const content = document.getElementById('page-content');
        const proveedores = Store.get('proveedores') || [];

        content.innerHTML = `
            <div class="animate-fadeIn">
                ${Components.pageHeader({
            title: 'Gestión de Proveedores',
            subtitle: 'Base de proveedores homologados y en proceso.',
            actions: [
                { label: 'Nuevo Proveedor', icon: 'plus', class: 'btn-primary', action: 'new-proveedor' }
            ]
        })}

                <div class="card mb-6">
                    <div class="card-body">
                        <div class="flex flex-wrap gap-4 items-center justify-between mb-6">
                            <div class="flex gap-4 items-center flex-1 min-w-[300px]">
                                ${Components.searchInput({ placeholder: 'Buscar por nombre...', id: 'search-proveedores' })}
                                
                                <select class="form-select w-auto" id="filter-pais">
                                    <option value="">País (Todos)</option>
                                    <option value="China">China</option>
                                    <option value="Alemania">Alemania</option>
                                    <option value="Chile">Chile</option>
                                </select>

                                <select class="form-select w-auto" id="filter-rating">
                                    <option value="">Rating (Todos)</option>
                                    <option value="Alto">Alto</option>
                                    <option value="Medio">Medio</option>
                                    <option value="Bajo">Bajo</option>
                                </select>

                                <select class="form-select w-auto" id="filter-representacion">
                                    <option value="">Representación (Todos)</option>
                                    <option value="Representado en Chile">Representado en Chile</option>
                                    <option value="En proceso de representación">En proceso de representación</option>
                                    <option value="No requiere representación">No requiere representación</option>
                                </select>
                            </div>
                        </div>

                        ${Components.dataTable({
            columns: [
                { key: 'nombre', label: 'Nombre' },
                { key: 'pais', label: 'País' },
                { key: 'rating', label: 'Rating Riesgo', type: 'badge' },
                { key: 'representacion', label: 'Representación', type: 'badge' }
            ],
            data: proveedores,
            actions: [
                { icon: 'eye', label: 'Ver Ficha', action: 'view' },
                { icon: 'edit', label: 'Actualizar', action: 'edit' }
            ]
        })}
                    </div>
                </div>
            </div>
        `;

        if (window.lucide) lucide.createIcons();
        this.attachEvents();
    },

    attachEvents() {
        // Search and Filters
        const searchInput = document.getElementById('search-proveedores');
        const filterPais = document.getElementById('filter-pais');
        const filterRating = document.getElementById('filter-rating');
        const filterRepresentacion = document.getElementById('filter-representacion');

        [searchInput, filterPais, filterRating, filterRepresentacion].forEach(el => {
            el?.addEventListener('input', Utils.debounce(() => this.filterData(), 300));
        });

        // New Provider
        document.querySelector('[data-action="new-proveedor"]')?.addEventListener('click', () => {
            this.showForm();
        });

        // Table Actions
        document.querySelectorAll('[data-action="view"]').forEach(btn => {
            btn.addEventListener('click', () => this.showDetail(parseInt(btn.dataset.id)));
        });

        document.querySelectorAll('[data-action="edit"]').forEach(btn => {
            btn.addEventListener('click', () => this.showForm(parseInt(btn.dataset.id)));
        });
    },

    filterData() {
        const searchTerm = document.getElementById('search-proveedores')?.value.toLowerCase() || '';
        const pais = document.getElementById('filter-pais')?.value || '';
        const rating = document.getElementById('filter-rating')?.value || '';
        const representacion = document.getElementById('filter-representacion')?.value || '';

        let filtered = Store.get('proveedores') || [];

        if (searchTerm) {
            filtered = filtered.filter(p => p.nombre.toLowerCase().includes(searchTerm));
        }
        if (pais) {
            filtered = filtered.filter(p => p.pais === pais);
        }
        if (rating) {
            filtered = filtered.filter(p => p.rating === rating);
        }
        if (representacion) {
            filtered = filtered.filter(p => p.representacion === representacion);
        }

        const tableBody = document.querySelector('.data-table tbody');
        if (tableBody) {
            tableBody.innerHTML = filtered.map(row => `
                <tr data-id="${row.id}">
                    <td>${row.nombre}</td>
                    <td>${row.pais}</td>
                    <td><span class="badge badge-${Utils.getStatusColor(row.rating)}">${row.rating}</span></td>
                    <td><span class="badge badge-neutral">${row.representacion}</span></td>
                    <td>
                        <div class="flex gap-1">
                            <button class="btn btn-ghost btn-icon" data-action="view" data-id="${row.id}" title="Ver Ficha">
                                <i data-lucide="eye"></i>
                            </button>
                            <button class="btn btn-ghost btn-icon" data-action="edit" data-id="${row.id}" title="Actualizar">
                                <i data-lucide="edit"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
            if (window.lucide) lucide.createIcons();

            // Re-attach actions
            tableBody.querySelectorAll('[data-action="view"]').forEach(btn => {
                btn.addEventListener('click', () => this.showDetail(parseInt(btn.dataset.id)));
            });
            tableBody.querySelectorAll('[data-action="edit"]').forEach(btn => {
                btn.addEventListener('click', () => this.showForm(parseInt(btn.dataset.id)));
            });
        }
    },

    showDetail(id) {
        const proveedor = Store.find('proveedores', id);
        if (!proveedor) return;

        const { modal, close } = Components.modal({
            title: `Ficha Proveedor: ${proveedor.nombre}`,
            size: 'lg',
            content: `
                <div class="space-y-8">
                    <div>
                        <h4 class="text-primary-600 font-bold mb-6">Información General</h4>
                        <div class="grid grid-cols-2 gap-y-6 gap-x-12">
                            <div>
                                <div class="text-xs uppercase font-black text-gray-400 mb-1 tracking-wider">Razón Social</div>
                                <div class="font-bold text-gray-800">${proveedor.razonSocial}</div>
                            </div>
                            <div>
                                <div class="text-xs uppercase font-black text-gray-400 mb-1 tracking-wider">País de Origen</div>
                                <div class="font-bold text-gray-800">${proveedor.pais}</div>
                            </div>
                            <div>
                                <div class="text-xs uppercase font-black text-gray-400 mb-1 tracking-wider">Rating Riesgo</div>
                                <span class="badge badge-${Utils.getStatusColor(proveedor.rating)}">${proveedor.rating}</span>
                            </div>
                            <div>
                                <div class="text-xs uppercase font-black text-gray-400 mb-1 tracking-wider">Representación</div>
                                <span class="badge badge-neutral">${proveedor.representacion}</span>
                            </div>
                            <div class="col-span-2">
                                <div class="text-xs uppercase font-black text-gray-400 mb-1 tracking-wider">Equipos</div>
                                <div class="font-bold text-gray-800">${proveedor.equipos.join(', ')}</div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 class="text-primary-600 font-bold mb-4">Certificaciones</h4>
                        <div class="space-y-2">
                            ${proveedor.certificaciones.map(cert => `
                                <div class="flex items-center gap-2 text-gray-700">
                                    <div class="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                                    <span class="font-medium">${cert}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div>
                        <h4 class="text-primary-600 font-bold mb-4">Contactos</h4>
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Cargo</th>
                                    <th>Email</th>
                                    <th>Teléfono</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${proveedor.contactos.map(c => `
                                    <tr>
                                        <td class="font-bold">${c.nombre}</td>
                                        <td>${c.cargo}</td>
                                        <td>${c.email}</td>
                                        <td>${c.telefono}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>

                    <div class="flex">
                        <button class="btn btn-outline btn-sm" onclick="Components.toast('Exportando ficha...', 'info')">
                            <i data-lucide="file-text"></i> Exportar Ficha
                        </button>
                    </div>
                </div>
            `,
            footer: `
                <button class="btn btn-secondary" data-action="close">Cerrar</button>
            `
        });

        if (window.lucide) lucide.createIcons();
        modal.querySelector('[data-action="close"]').addEventListener('click', close);
    },

    showForm(id = null) {
        const proveedor = id ? Store.find('proveedores', id) : null;
        const isEdit = !!proveedor;

        let activeTab = 'general';

        const renderTabContent = (tab) => {
            if (tab === 'general') {
                return `
                    <div class="grid grid-cols-2 gap-4 animate-fadeIn">
                        ${Components.formInput({ label: 'Nombre Razón Social', name: 'razonSocial', value: proveedor?.razonSocial || '', required: true })}
                        ${Components.formInput({ label: 'País de Origen', name: 'pais', value: proveedor?.pais || '', required: true })}
                        ${Components.formInput({
                    label: 'Rating Riesgo',
                    name: 'rating',
                    type: 'select',
                    value: proveedor?.rating || 'Medio',
                    options: [
                        { value: 'Alto', label: 'Alto' },
                        { value: 'Medio', label: 'Medio' },
                        { value: 'Bajo', label: 'Bajo' }
                    ]
                })}
                        ${Components.formInput({
                    label: 'Representación',
                    name: 'representacion',
                    type: 'select',
                    value: proveedor?.representacion || 'No requiere representación',
                    options: [
                        { value: 'Representado en Chile', label: 'Representado en Chile' },
                        { value: 'En proceso de representación', label: 'En proceso de representación' },
                        { value: 'No requiere representación', label: 'No requiere representación' }
                    ]
                })}
                        <div class="col-span-2">
                             ${Components.formInput({ label: 'Tipos de Equipos (Separar por comas)', name: 'equipos', value: proveedor?.equipos?.join(', ') || '' })}
                        </div>
                        <div class="col-span-2">
                            <label class="form-label">Certificaciones</label>
                            <div class="p-8 border-2 border-dashed border-gray-100 rounded-xl text-center bg-gray-50/50">
                                <input type="file" class="hidden" id="cert-upload">
                                <button class="btn btn-outline btn-sm" onclick="document.getElementById('cert-upload').click()">
                                    <i data-lucide="upload"></i> Elegir archivos
                                </button>
                                <p class="text-xs text-gray-400 mt-3">Suba archivos PDF o imágenes de las certificaciones vigentes.</p>
                            </div>
                        </div>
                    </div>
                `;
            } else if (tab === 'contactos') {
                return `
                    <div class="animate-fadeIn space-y-4">
                        <p class="text-sm text-gray-500">Gestione los puntos de contacto principales.</p>
                        <div id="contacts-form-list" class="space-y-3">
                            ${(proveedor?.contactos || []).map(c => `
                                <div class="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                                    <div>
                                        <div class="font-bold">${c.nombre}</div>
                                        <div class="text-xs text-gray-500">${c.cargo} • ${c.email}</div>
                                    </div>
                                    <button class="btn btn-ghost btn-icon text-red-500"><i data-lucide="trash-2"></i></button>
                                </div>
                            `).join('')}
                        </div>
                        <button class="btn btn-outline btn-sm" onclick="Components.toast('Función de agregar contacto', 'info')">
                            <i data-lucide="plus"></i> Agregar Contacto
                        </button>
                    </div>
                `;
            }
            return '';
        };

        const { modal, close } = Components.modal({
            title: isEdit ? 'Actualizar Proveedor' : 'Nuevo Proveedor',
            size: 'lg',
            content: `
                <div class="tabs mb-6">
                    <button class="tab active" data-form-tab="general">General</button>
                    <button class="tab" data-form-tab="contactos">Contactos</button>
                </div>
                <div id="form-tab-content" style="min-height: 350px;">
                    ${renderTabContent('general')}
                </div>
            `,
            footer: `
                <button class="btn btn-secondary" data-action="cancel">Cancelar</button>
                <button class="btn btn-primary" data-action="save">Guardar</button>
            `
        });

        if (window.lucide) lucide.createIcons();

        // Tab switching logic
        modal.querySelectorAll('[data-form-tab]').forEach(tabBtn => {
            tabBtn.addEventListener('click', () => {
                modal.querySelectorAll('[data-form-tab]').forEach(b => b.classList.remove('active'));
                tabBtn.classList.add('active');
                modal.querySelector('#form-tab-content').innerHTML = renderTabContent(tabBtn.dataset.formTab);
                if (window.lucide) lucide.createIcons();
            });
        });

        modal.querySelector('[data-action="cancel"]').addEventListener('click', close);
        modal.querySelector('[data-action="save"]').addEventListener('click', () => {
            Components.toast(isEdit ? 'Proveedor actualizado' : 'Proveedor creado', 'success');
            close();
        });
    }
};

window.ProveedoresModule = ProveedoresModule;
