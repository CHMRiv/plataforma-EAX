/* ==========================================================================
   EAX Platform - Licitaciones Module
   ========================================================================== */

const LicitacionesModule = {
    render() {
        const content = document.getElementById('page-content');

        content.innerHTML = `
            <div class="animate-fadeIn">
                ${Components.pageHeader({
            title: 'Licitaciones',
            subtitle: 'Gestión de licitaciones públicas y privadas',
            actions: [
                { label: 'Nueva Licitación', icon: 'plus', class: 'btn-primary', action: 'new-lic' }
            ]
        })}
                
                <div id="licitaciones-summary">
                    <!-- Stats loaded dynamically -->
                </div>
                
                <div class="card mt-6">
                    <div class="card-header border-b border-gray-100 p-4">
                        <div class="flex gap-4">
                            ${Components.searchInput({ placeholder: 'Buscar licitación...', id: 'search-lic' })}
                            <div class="relative" style="width: 250px;">
                                <input type="text" 
                                    class="form-input" 
                                    id="filter-lic-entidad" 
                                    list="entidades-list" 
                                    placeholder="Filtrar por entidad...">
                                <datalist id="entidades-list">
                                    <!-- Options loaded dynamically -->
                                </datalist>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-3 gap-6 mt-6" id="licitaciones-grid">
                    <!-- Cards loaded via filterLicitaciones -->
                </div>
            </div>
        `;

        lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });
        this.filterLicitaciones();
        this.attachEvents();
    },

    filterLicitaciones() {
        const searchTerm = document.getElementById('search-lic')?.value || '';
        const entidadFilter = document.getElementById('filter-lic-entidad')?.value || '';

        let licitaciones = Store.get('licitaciones');

        if (searchTerm) {
            licitaciones = Utils.search(licitaciones, searchTerm, ['titulo', 'entidad']);
        }

        if (entidadFilter) {
            licitaciones = licitaciones.filter(l => l.entidad.toLowerCase().includes(entidadFilter.toLowerCase()));
        }

        const container = document.getElementById('licitaciones-grid');
        if (container) this.renderLicitacionesGrid(container, licitaciones);

        this.renderStats(licitaciones);
        this.updateDatalist();
    },

    updateDatalist() {
        const allLicitaciones = Store.get('licitaciones');
        const entidades = [...new Set(allLicitaciones.map(l => l.entidad))].sort();
        const datalist = document.getElementById('entidades-list');
        if (datalist) {
            datalist.innerHTML = entidades.map(e => `<option value="${e}">`).join('');
        }
    },

    renderStats(licitaciones) {
        const summary = document.getElementById('licitaciones-summary');
        if (!summary) return;

        summary.innerHTML = `
            <div class="quick-stats">
                ${Components.statCard({ icon: 'file-text', label: 'Total', value: licitaciones.length, iconClass: 'primary' })}
                ${Components.statCard({ icon: 'clock', label: 'En Preparación', value: licitaciones.filter(l => l.estado === 'En preparación').length, iconClass: 'warning' })}
                ${Components.statCard({ icon: 'send', label: 'Presentadas', value: licitaciones.filter(l => l.estado === 'Presentada').length, iconClass: 'primary' })}
                ${Components.statCard({ icon: 'dollar-sign', label: 'Monto Total', value: Utils.formatCurrency(licitaciones.reduce((s, l) => s + l.monto, 0)), iconClass: 'success' })}
            </div>
        `;
        // Re-init icons for stats
        if (window.lucide) lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });
    },

    renderLicitacionesGrid(container, licitaciones) {
        if (licitaciones.length === 0) {
            container.innerHTML = `
                <div class="col-span-3 text-center py-12 text-gray-400">
                    <i data-lucide="inbox" style="width:48px;height:48px;margin-bottom:1rem;mx-auto"></i>
                    <p>No se encontraron licitaciones</p>
                </div>
            `;
            if (window.lucide) lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });
            return;
        }

        container.innerHTML = licitaciones.map(lic => `
            <div class="card cursor-pointer hover:shadow-lg transition-all" data-id="${lic.id}">
                <div class="card-body">
                    <div class="flex justify-between items-start mb-3">
                        <span class="badge badge-${lic.tipo === 'Pública' ? 'primary' : 'secondary'}">${lic.tipo}</span>
                        <span class="badge badge-${Utils.getStatusColor(lic.estado)}">${lic.estado}</span>
                    </div>
                    <h3 class="font-semibold mb-2">${lic.titulo}</h3>
                    <p class="text-sm text-secondary mb-4">${lic.entidad}</p>
                    <div class="text-2xl font-bold text-primary-600 mb-4">${Utils.formatCurrency(lic.monto)}</div>
                    <div class="flex justify-between text-sm text-secondary">
                        <span><i data-lucide="calendar" style="width:14px;height:14px;display:inline;"></i> Apertura: ${Utils.formatDate(lic.fechaApertura)}</span>
                        <span><i data-lucide="clock" style="width:14px;height:14px;display:inline;"></i> Cierre: ${Utils.formatDate(lic.fechaCierre)}</span>
                    </div>
                    <div class="mt-4">
                        ${Components.progressBar(this.getProgress(lic), 'primary')}
                    </div>
                </div>
            </div>
        `).join('');

        // Re-attach click events for dynamic cards
        container.querySelectorAll('[data-id]').forEach(card => {
            card.addEventListener('click', () => this.showLicitacionDetail(parseInt(card.dataset.id)));
        });

        if (window.lucide) lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });
    },

    getProgress(lic) {
        const now = new Date();
        const start = new Date(lic.fechaApertura);
        const end = new Date(lic.fechaCierre);
        const total = end - start;
        const elapsed = now - start;
        return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
    },

    attachEvents() {
        document.querySelector('[data-action="new-lic"]')?.addEventListener('click', () => {
            this.showLicitacionForm();
        });

        document.getElementById('search-lic')?.addEventListener('input', Utils.debounce(() => this.filterLicitaciones(), 300));
        document.getElementById('filter-lic-entidad')?.addEventListener('input', Utils.debounce(() => this.filterLicitaciones(), 300));
    },

    showLicitacionDetail(id) {
        const lic = Store.find('licitaciones', id);
        if (!lic) return;

        Components.modal({
            title: lic.titulo,
            size: 'lg',
            content: `
                <div class="grid grid-cols-2 gap-6 mb-6">
                    <div>
                        <div class="text-sm text-secondary">Entidad</div>
                        <div class="font-medium">${lic.entidad}</div>
                    </div>
                    <div>
                        <div class="text-sm text-secondary">Tipo</div>
                        <span class="badge badge-${lic.tipo === 'Pública' ? 'primary' : 'secondary'}">${lic.tipo}</span>
                    </div>
                    <div>
                        <div class="text-sm text-secondary">Monto Estimado</div>
                        <div class="font-bold text-xl">${Utils.formatCurrency(lic.monto)}</div>
                    </div>
                    <div>
                        <div class="text-sm text-secondary">Estado</div>
                        <span class="badge badge-${Utils.getStatusColor(lic.estado)}">${lic.estado}</span>
                    </div>
                </div>
                
                <h4 class="font-semibold mb-3">Timeline</h4>
                <div class="timeline">
                    <div class="timeline-item">
                        <div class="timeline-icon success"><i data-lucide="calendar"></i></div>
                        <div class="timeline-content">
                            <div class="timeline-title">Fecha de Apertura</div>
                            <div class="timeline-time">${Utils.formatDate(lic.fechaApertura, 'long')}</div>
                        </div>
                    </div>
                    <div class="timeline-item">
                        <div class="timeline-icon warning"><i data-lucide="clock"></i></div>
                        <div class="timeline-content">
                            <div class="timeline-title">Fecha de Cierre</div>
                            <div class="timeline-time">${Utils.formatDate(lic.fechaCierre, 'long')}</div>
                        </div>
                    </div>
                </div>
            `
        });
        lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });
    },

    showLicitacionForm() {
        const { modal, close } = Components.modal({
            title: 'Nueva Licitación',
            size: 'md',
            content: `
                <form id="lic-form">
                    ${Components.formInput({ label: 'Título', name: 'titulo', required: true })}
                    ${Components.formInput({ label: 'Entidad', name: 'entidad', required: true })}
                    <div class="grid grid-cols-2 gap-4">
                        ${Components.formInput({
                label: 'Tipo', name: 'tipo', type: 'select',
                options: [{ value: 'Pública', label: 'Pública' }, { value: 'Privada', label: 'Privada' }]
            })}
                        ${Components.formInput({ label: 'Monto Estimado', name: 'monto', type: 'number', required: true })}
                        ${Components.formInput({ label: 'Fecha Apertura', name: 'fechaApertura', type: 'date', required: true })}
                        ${Components.formInput({ label: 'Fecha Cierre', name: 'fechaCierre', type: 'date', required: true })}
                    </div>
                </form>
            `,
            footer: `
                <button class="btn btn-secondary" data-action="cancel">Cancelar</button>
                <button class="btn btn-primary" data-action="save">Crear</button>
            `
        });

        modal.querySelector('[data-action="cancel"]').addEventListener('click', close);
        modal.querySelector('[data-action="save"]').addEventListener('click', () => {
            const form = document.getElementById('lic-form');
            if (!form.checkValidity()) { form.reportValidity(); return; }

            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            data.monto = parseInt(data.monto);
            data.estado = 'En preparación';

            Store.add('licitaciones', data);
            Components.toast('Licitación creada', 'success');
            close();
            this.render();
        });
    }
};

window.LicitacionesModule = LicitacionesModule;
