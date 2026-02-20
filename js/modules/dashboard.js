/* ==========================================================================
   EAX Platform - Dashboard Module (HubSpot-level)
   ========================================================================== */

const DashboardModule = {
    render() {
        const content = document.getElementById('page-content');

        const clientes = Store.get('clientes') || [];
        const oportunidades = Store.get('oportunidades') || [];
        const tareas = Store.get('tareas') || [];
        const productos = Store.get('productos') || [];
        const ventasPublicas = Store.get('ventasPublicas') || [];
        const cotizaciones = Store.get('cotizaciones') || [];
        const actividades = Store.get('actividades') || [];

        const totalClientes = clientes.length;
        const oportunidadesAbiertas = oportunidades.filter(o => o.etapa !== 'ganada' && o.etapa !== 'perdida').length;
        const valorPipeline = oportunidades.filter(o => o.etapa !== 'perdida').reduce((sum, o) => sum + (o.valor || 0), 0);
        const tareasEnProgreso = tareas.filter(t => t.estado === 'in-progress').length;
        const productosStockBajo = productos.filter(p => p.stock <= p.stockMinimo).length;
        const vpActivas = ventasPublicas.filter(vp => !['Adjudicada', 'No adjudicada', 'Desierta'].includes(vp.estado)).length;

        content.innerHTML = `
            <div class="animate-fadeIn">
                ${Components.pageHeader({
            title: 'Dashboard',
            subtitle: `Buenos días, EAX Admin — ${new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}`,
            actions: [
                { label: 'Exportar', icon: 'download', class: 'btn-outline', action: 'export' },
                { label: 'Actualizar', icon: 'refresh-cw', class: 'btn-primary', action: 'refresh' }
            ]
        })}

                <!-- KPI Cards -->
                <div class="dashboard-kpi-grid" style="display:grid;grid-template-columns:repeat(5,1fr);gap:16px;margin-bottom:24px;">
                    ${this._kpiCard('users', 'Clientes', totalClientes, '+2 este mes', 'primary', '#3b82f6')}
                    ${this._kpiCard('target', 'Pipeline', Utils.formatCurrency(valorPipeline), `${oportunidadesAbiertas} negocios abiertos`, 'success', '#10b981')}
                    ${this._kpiCard('clipboard-list', 'Tareas activas', tareasEnProgreso, 'En progreso', 'warning', '#f59e0b')}
                    ${this._kpiCard('landmark', 'Ventas Públicas', vpActivas, 'Procesos activos', 'accent', '#8b5cf6')}
                    ${this._kpiCard('alert-triangle', 'Stock bajo', productosStockBajo, productosStockBajo > 0 ? 'Requiere atención' : 'Dentro de parámetros', 'error', '#f43f5e')}
                </div>

                <!-- Main 2-col grid -->
                <div style="display:grid;grid-template-columns:1fr 340px;gap:20px;margin-bottom:20px;">
                    <!-- Pipeline Chart -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Pipeline de Ventas</h3>
                            <a href="#/crm" class="text-sm text-primary" style="font-weight:500;">Ver CRM →</a>
                        </div>
                        <div class="card-body">
                            ${this.renderPipelineStages(oportunidades)}
                            <div class="mt-6">
                                <div style="font-weight:600;font-size:13px;color:#64748b;margin-bottom:12px;text-transform:uppercase;letter-spacing:.05em;">Negocios Recientes</div>
                                ${this.renderRecentOpportunities(oportunidades)}
                            </div>
                        </div>
                    </div>

                    <!-- Right: Tasks -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Mis Tareas</h3>
                            <a href="#/desarrollo" class="text-sm text-primary" style="font-weight:500;">Ver todo</a>
                        </div>
                        <div class="card-body">
                            ${this.renderRecentTasks(tareas)}
                        </div>
                    </div>
                </div>

                <!-- Bottom 3-col grid -->
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Actividad Reciente</h3>
                        </div>
                        <div class="card-body">
                            ${this.renderActivityTimeline(actividades)}
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Ventas Públicas</h3>
                            <a href="#/licitaciones" class="text-sm text-primary" style="font-weight:500;">Ver todas</a>
                        </div>
                        <div class="card-body">
                            ${this.renderVPSummary(ventasPublicas)}
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Alertas de Stock</h3>
                            <a href="#/inventario" class="text-sm text-primary" style="font-weight:500;">Ver inventario</a>
                        </div>
                        <div class="card-body">
                            ${this.renderStockAlerts(productos)}
                        </div>
                    </div>
                </div>
            </div>
        `;

        if (window.lucide) lucide.createIcons();
        this.attachEvents();
        this._animateCounters();
    },

    _kpiCard(icon, label, value, sub, type, color) {
        const colors = {
            primary: { bg: '#eff6ff', icon: '#3b82f6' },
            success: { bg: '#ecfdf5', icon: '#10b981' },
            warning: { bg: '#fffbeb', icon: '#f59e0b' },
            accent: { bg: '#ede9fe', icon: '#8b5cf6' },
            error: { bg: '#fff1f2', icon: '#f43f5e' },
        };
        const c = colors[type] || colors.primary;
        return `
            <div class="card" style="cursor:default;" data-animate-number="${typeof value === 'number' ? value : ''}">
                <div class="card-body" style="padding:20px;">
                    <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:16px;">
                        <div style="width:44px;height:44px;border-radius:12px;background:${c.bg};display:flex;align-items:center;justify-content:center;color:${c.icon};">
                            <i data-lucide="${icon}" style="width:20px;height:20px;"></i>
                        </div>
                    </div>
                    <div class="kpi-value" style="font-size:28px;font-weight:800;font-family:'Outfit',sans-serif;color:#0f172a;line-height:1;">${value}</div>
                    <div style="font-size:13px;font-weight:600;color:#64748b;margin-top:4px;">${label}</div>
                    <div style="font-size:12px;color:#94a3b8;margin-top:6px;">${sub}</div>
                </div>
            </div>
        `;
    },

    _animateCounters() {
        document.querySelectorAll('.kpi-value').forEach(el => {
            el.style.animation = 'countUp 0.5s both';
        });
    },

    renderPipelineStages(oportunidades) {
        const stages = [
            { id: 'calificacion', name: 'Calificación', color: '#94a3b8' },
            { id: 'propuesta', name: 'Propuesta', color: '#3b82f6' },
            { id: 'negociacion', name: 'Negociación', color: '#f59e0b' },
            { id: 'ganada', name: 'Ganadas', color: '#10b981' },
        ];

        const total = oportunidades.length || 1;
        return `
            <div style="display:flex;gap:4px;height:10px;border-radius:10px;overflow:hidden;margin-bottom:16px;">
                ${stages.map(s => {
            const count = oportunidades.filter(o => o.etapa === s.id).length;
            const pct = Math.round((count / total) * 100);
            return `<div style="flex:${pct || 1};background:${s.color};transition:flex 0.6s ease;" title="${s.name}: ${count}"></div>`;
        }).join('')}
            </div>
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;">
                ${stages.map(s => {
            const count = oportunidades.filter(o => o.etapa === s.id).length;
            const value = oportunidades.filter(o => o.etapa === s.id).reduce((sum, o) => sum + (o.valor || 0), 0);
            return `
                        <div style="text-align:center;padding:12px;background:#f8fafc;border-radius:10px;">
                            <div style="font-size:22px;font-weight:800;color:${s.color};">${count}</div>
                            <div style="font-size:11px;font-weight:600;color:#64748b;margin-top:2px;">${s.name}</div>
                            <div style="font-size:11px;color:#94a3b8;margin-top:4px;">${Utils.formatCurrency(value)}</div>
                        </div>
                    `;
        }).join('')}
            </div>
        `;
    },

    renderRecentOpportunities(oportunidades) {
        const recents = oportunidades.slice(0, 4);
        if (!recents.length) return `<div style="color:#94a3b8;font-size:13px;text-align:center;padding:16px;">Sin negocios recientes</div>`;

        const statusMap = { calificacion: 'neutral', propuesta: 'info', negociacion: 'warning', ganada: 'success', perdida: 'danger' };

        return `<div style="display:flex;flex-direction:column;gap:8px;">
            ${recents.map(op => `
                <div class="list-item-hover" style="display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:10px;cursor:pointer;" onclick="Router.navigate('/crm')">
                    <div class="avatar" style="width:36px;height:36px;font-size:13px;">${Utils.getInitials(op.cliente || '?')}</div>
                    <div style="flex:1;min-width:0;">
                        <div style="font-size:13px;font-weight:600;color:#1e293b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${op.titulo}</div>
                        <div style="font-size:11px;color:#64748b;">${op.cliente}</div>
                    </div>
                    <div style="text-align:right;flex-shrink:0;">
                        <div style="font-size:13px;font-weight:700;color:#0f172a;">${Utils.formatCurrency(op.valor || 0)}</div>
                        <span class="badge badge-${statusMap[op.etapa] || 'neutral'} badge-dot" style="margin-top:4px;">${op.etapa}</span>
                    </div>
                </div>
            `).join('')}
        </div>`;
    },

    renderRecentTasks(tareas) {
        const active = tareas.filter(t => t.estado === 'in-progress' || t.estado === 'todo').slice(0, 6);
        if (!active.length) return Components.emptyState({ icon: 'check-circle', title: '¡Todo al día!', message: 'No tienes tareas pendientes' });

        const prioColors = { alta: 'danger', media: 'warning', baja: 'neutral' };
        return `<div style="display:flex;flex-direction:column;gap:6px;">
            ${active.map(t => `
                <div class="list-item-hover" style="display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:10px;cursor:pointer;" onclick="Router.navigate('/desarrollo')">
                    <div style="width:8px;height:8px;border-radius:50%;background:${t.prioridad === 'alta' ? '#f43f5e' : t.prioridad === 'media' ? '#f59e0b' : '#94a3b8'};flex-shrink:0;"></div>
                    <div style="flex:1;min-width:0;">
                        <div style="font-size:13px;font-weight:500;color:#1e293b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${t.titulo}</div>
                        <div style="font-size:11px;color:#64748b;">${t.proyecto || 'Sin proyecto'}</div>
                    </div>
                    <span class="badge badge-${prioColors[t.prioridad] || 'neutral'}">${t.prioridad || 'normal'}</span>
                </div>
            `).join('')}
        </div>`;
    },

    renderActivityTimeline(actividades) {
        const feed = [
            { icon: 'check-circle', color: '#10b981', bg: '#ecfdf5', title: 'Cotización aprobada', desc: 'COT-001 – Empresa ABC', time: 'Hace 2h' },
            { icon: 'user-plus', color: '#3b82f6', bg: '#eff6ff', title: 'Nuevo cliente', desc: 'Tech Solutions SpA', time: 'Hace 4h' },
            { icon: 'package', color: '#8b5cf6', bg: '#ede9fe', title: 'Stock actualizado', desc: 'Motor 5HP +10 uds', time: 'Hace 6h' },
            { icon: 'landmark', color: '#f59e0b', bg: '#fffbeb', title: 'Nueva licitación ID', desc: 'Mercado Público #4521', time: 'Ayer' },
            { icon: 'message-square', color: '#06b6d4', bg: '#ecfeff', title: 'Nuevo mensaje', desc: 'Canal General', time: 'Ayer' },
        ];
        return `<div style="display:flex;flex-direction:column;gap:0;">
            ${feed.map((a, i) => `
                <div style="display:flex;gap:12px;padding:12px 0;${i < feed.length - 1 ? 'border-bottom:1px solid #f1f5f9;' : ''}">
                    <div style="width:36px;height:36px;border-radius:50%;background:${a.bg};display:flex;align-items:center;justify-content:center;color:${a.color};flex-shrink:0;">
                        <i data-lucide="${a.icon}" style="width:16px;height:16px;"></i>
                    </div>
                    <div style="flex:1;">
                        <div style="font-size:13px;font-weight:600;color:#1e293b;">${a.title}</div>
                        <div style="font-size:12px;color:#64748b;">${a.desc}</div>
                        <div style="font-size:11px;color:#94a3b8;margin-top:2px;">${a.time}</div>
                    </div>
                </div>
            `).join('')}
        </div>`;
    },

    renderStockAlerts(productos) {
        const low = productos.filter(p => p.stock <= p.stockMinimo);
        if (!low.length) return Components.emptyState({ icon: 'check-circle', title: 'Stock OK', message: 'Todos los productos están dentro del mínimo' });

        return `<div style="display:flex;flex-direction:column;gap:8px;">
            ${low.map(p => `
                <div style="display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:10px;background:#fff1f2;cursor:pointer;" onclick="Router.navigate('/inventario')">
                    <div style="width:36px;height:36px;background:#ffe4e6;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#f43f5e;">
                        <i data-lucide="alert-triangle" style="width:16px;height:16px;"></i>
                    </div>
                    <div style="flex:1;min-width:0;">
                        <div style="font-size:13px;font-weight:600;color:#1e293b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.nombre}</div>
                        <div style="font-size:11px;color:#64748b;">SKU: ${p.sku || '—'}</div>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-size:14px;font-weight:700;color:#f43f5e;">${p.stock} uds</div>
                        <div style="font-size:11px;color:#94a3b8;">Mín: ${p.stockMinimo}</div>
                    </div>
                </div>
            `).join('')}
        </div>`;
    },

    renderVPSummary(ventasPublicas) {
        const active = ventasPublicas.filter(vp => !['Adjudicada', 'No adjudicada', 'Desierta'].includes(vp.estado));
        if (!active.length) return Components.emptyState({ icon: 'landmark', title: 'Sin procesos activos', message: 'No hay ventas públicas en curso' });

        const statusMap = { 'Publicada': 'info', 'En evaluación': 'warning', 'Adjudicada': 'success', 'No adjudicada': 'danger' };
        return `<div style="display:flex;flex-direction:column;gap:8px;">
            ${active.slice(0, 4).map(vp => {
            const isCA = vp.modalidad === 'Compra Ágil';
            return `
                    <div class="list-item-hover" style="display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:10px;cursor:pointer;" onclick="Router.navigate('/licitaciones')">
                        <div style="width:36px;height:36px;border-radius:10px;background:${isCA ? '#fff7ed' : '#eff6ff'};display:flex;align-items:center;justify-content:center;color:${isCA ? '#ea580c' : '#3b82f6'};">
                            <i data-lucide="${isCA ? 'zap' : 'file-text'}" style="width:16px;height:16px;"></i>
                        </div>
                        <div style="flex:1;min-width:0;">
                            <div style="font-size:13px;font-weight:600;color:#1e293b;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${vp.titulo}</div>
                            <div style="font-size:11px;color:#64748b;">${vp.entidad || '—'}</div>
                        </div>
                        <span class="badge badge-${statusMap[vp.estado] || 'neutral'} badge-dot">${vp.estado}</span>
                    </div>
                `;
        }).join('')}
        </div>`;
    },

    attachEvents() {
        document.querySelectorAll('[data-action="refresh"]').forEach(btn => {
            btn.addEventListener('click', () => { Components.toast('Dashboard actualizado', 'success'); DashboardModule.render(); });
        });
        document.querySelectorAll('[data-action="export"]').forEach(btn => {
            btn.addEventListener('click', () => Components.toast('Exportando datos...', 'info'));
        });
    }
};

window.DashboardModule = DashboardModule;
