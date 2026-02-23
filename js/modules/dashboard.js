/* ==========================================================================
   Aura Platform - Dashboard Module (Reworked)
   Premium Emerald Aesthetic
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
        const totalVentas = oportunidades.filter(o => o.etapa === 'ganada').reduce((sum, o) => sum + (o.valor || 0), 0);
        const valorPipeline = oportunidades.filter(o => o.etapa !== 'perdida').reduce((sum, o) => sum + (o.valor || 0), 0);
        const tareasEnProgreso = tareas.filter(t => t.estado === 'in-progress').length;
        const productosStockBajo = productos.filter(p => p.stock <= p.stockMinimo).length;

        content.innerHTML = `
            <div class="animate-fade-in">
                <!-- Welcome Section -->
                <div class="welcome-section flex justify-between items-center">
                    <div>
                        <h1 class="welcome-title">Bienvenido de nuevo, EAX Admin 👋</h1>
                        <p class="welcome-subtitle">Aquí tienes un resumen de lo que está pasando en la plataforma hoy.</p>
                    </div>
                    <div class="flex gap-3">
                        <button class="btn btn-outline" data-action="export">
                            <i data-lucide="download"></i>
                            Exportar Informe
                        </button>
                        <button class="btn btn-primary" data-action="refresh">
                            <i data-lucide="plus"></i>
                            Nueva Cotización
                        </button>
                    </div>
                </div>

                <!-- Dashboard Content Grid -->
                <div class="dashboard-grid">
                    
                    <!-- Top Stats -->
                    <div class="stats-container">
                        ${this._statCard('users', 'Clientes Totales', totalClientes, '+12% este mes', 'up')}
                        ${this._statCard('target', 'Valor de Pipeline', Utils.formatCurrency(valorPipeline), '+5.4% desde ayer', 'up')}
                        ${this._statCard('ship', 'Importaciones', '14', '-0.3% retraso', 'down')}
                    </div>

                    <!-- Market/Pipeline Chart Placeholder (Large) -->
                    <div class="main-chart-container">
                        <div class="card">
                            <div class="card-header">
                                <h3 class="card-title">Tendencias del Mercado</h3>
                                <div class="tabs-container">
                                    <button class="tab-btn active">1 Año</button>
                                    <button class="tab-btn">6 Meses</button>
                                    <button class="tab-btn">1 Mes</button>
                                </div>
                            </div>
                            <div class="card-body">
                                <div style="height:300px; background: linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%); border-radius: 12px; display: flex; align-items: flex-end; padding: 20px; gap: 12px;">
                                    <!-- Placeholder Bars or simple svg -->
                                    <svg width="100%" height="200" viewBox="0 0 800 200" preserveAspectRatio="none">
                                        <path d="M0,150 Q200,50 400,120 T800,80" fill="none" stroke="var(--color-primary-500)" stroke-width="4" stroke-linecap="round" />
                                        <path d="M0,180 Q250,100 500,160 T800,120" fill="none" stroke="var(--color-secondary-red)" stroke-width="2" stroke-dasharray="5,5" />
                                    </svg>
                                </div>
                                <div class="flex justify-between mt-6">
                                    <div class="flex gap-4">
                                        <div class="flex items-center gap-2">
                                            <div style="width:10px;height:10px;border-radius:50%;background:var(--color-primary-500);"></div>
                                            <span class="text-sm font-medium">Precio Promedio</span>
                                        </div>
                                        <div class="flex items-center gap-2">
                                            <div style="width:10px;height:10px;border-radius:50%;background:var(--color-secondary-red);"></div>
                                            <span class="text-sm font-medium">Precio Mediano</span>
                                        </div>
                                    </div>
                                    <span class="text-xs text-secondary font-medium">Actualizado: hace 5 minutos</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Lateral Distribution (Small Card) -->
                    <div class="sidebar-chart-container">
                        <div class="card h-full">
                            <div class="card-header">
                                <h3 class="card-title">Distribución de Activos</h3>
                            </div>
                            <div class="card-body flex flex-col items-center">
                                <div style="position:relative; width:180px; height:180px; margin-bottom:24px;">
                                    <svg viewBox="0 0 36 36" style="width:100%; height:100%; transform: rotate(-90deg);">
                                        <circle cx="18" cy="18" r="16" fill="none" stroke="#f1f3f5" stroke-width="4"></circle>
                                        <circle cx="18" cy="18" r="16" fill="none" stroke="var(--color-primary-500)" stroke-width="4" stroke-dasharray="70, 100"></circle>
                                    </svg>
                                    <div style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-size:24px; font-weight:800; font-family:var(--font-family-heading);">70%</div>
                                </div>
                                <div class="w-full flex flex-col gap-3">
                                    ${this._distItem('Comercial', 40, 'var(--color-primary-500)')}
                                    ${this._distItem('Ventas Públicas', 30, 'var(--color-secondary-orange)')}
                                    ${this._distItem('Postventa', 20, 'var(--color-secondary-purple)')}
                                    ${this._distItem('Otros', 10, 'var(--color-secondary-teal)')}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Bottom Lists -->
                    <div class="main-chart-container" style="display:grid; grid-template-columns: 1fr 1fr; gap:var(--space-6);">
                         <div class="card">
                            <div class="card-header">
                                <h3 class="card-title">Mis Tareas</h3>
                                <a href="#/desarrollo" class="text-xs font-bold text-primary">VER TODO</a>
                            </div>
                            <div class="card-body">
                                ${this.renderRecentTasks(tareas)}
                            </div>
                        </div>
                        <div class="card">
                            <div class="card-header">
                                <h3 class="card-title">Alertas de Stock</h3>
                                <a href="#/inventario" class="text-xs font-bold text-primary">GESTIONAR</a>
                            </div>
                            <div class="card-body">
                                ${this.renderStockAlerts(productos)}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        `;

        if (window.lucide) lucide.createIcons();
        this.attachEvents();
    },

    _statCard(icon, label, value, trendText, trendDir) {
        return `
            <div class="stat-card">
                <div class="stat-card-header">
                    <span class="stat-label">${label}</span>
                    <div class="stat-icon-wrapper">
                        <i data-lucide="${icon}"></i>
                    </div>
                </div>
                <div class="stat-value">${value}</div>
                <div class="stat-footer stat-trend-${trendDir}">
                    <i data-lucide="trending-${trendDir === 'up' ? 'up' : 'down'}"></i>
                    ${trendText}
                </div>
            </div>
        `;
    },

    _distItem(label, pct, color) {
        return `
            <div class="flex flex-col gap-1 w-full">
                <div class="flex justify-between items-center text-xs font-semibold">
                    <span>${label}</span>
                    <span class="text-secondary">${pct}%</span>
                </div>
                <div style="height:4px; width:100%; background:var(--color-gray-50); border-radius:4px; overflow:hidden;">
                    <div style="height:100%; width:${pct}%; background:${color}; border-radius:4px;"></div>
                </div>
            </div>
        `;
    },

    renderRecentTasks(tareas) {
        const active = tareas.filter(t => t.estado === 'in-progress' || t.estado === 'todo').slice(0, 4);
        if (!active.length) return `<p class="text-sm text-secondary text-center">No hay tareas pendientes</p>`;

        return `<div class="flex flex-col gap-1">
            ${active.map(t => `
                <div class="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                    <div style="width:10px;height:10px;border-radius:50%;background:${t.prioridad === 'alta' ? 'var(--color-secondary-red)' : 'var(--color-primary-500)'};"></div>
                    <div class="flex-1">
                        <div class="text-sm font-semibold">${t.titulo}</div>
                        <div class="text-xs text-secondary">${t.proyecto || 'General'}</div>
                    </div>
                    <i data-lucide="chevron-right" class="text-gray-300 w-4 h-4"></i>
                </div>
            `).join('')}
        </div>`;
    },

    renderStockAlerts(productos) {
        const low = productos.filter(p => p.stock <= p.stockMinimo).slice(0, 4);
        if (!low.length) return `<p class="text-sm text-secondary text-center">Stock bajo control</p>`;

        return `<div class="flex flex-col gap-1">
            ${low.map(p => `
                <div class="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                    <div class="avatar-sm" style="background:var(--color-error-50); color:var(--color-error-600); border-radius:8px;">
                        <i data-lucide="alert-circle" width="16"></i>
                    </div>
                    <div class="flex-1">
                        <div class="text-sm font-semibold">${p.nombre}</div>
                        <div class="text-xs text-secondary">${p.stock} unidades en stock</div>
                    </div>
                    <span class="badge badge-danger">Crítico</span>
                </div>
            `).join('')}
        </div>`;
    },

    attachEvents() {
        document.querySelectorAll('[data-action="refresh"]').forEach(btn => {
            btn.addEventListener('click', () => { Components.toast('Actualizando datos...', 'success'); this.render(); });
        });
        document.querySelectorAll('[data-action="export"]').forEach(btn => {
            btn.addEventListener('click', () => Components.toast('Generando reporte PDF...', 'info'));
        });
    }
};

window.DashboardModule = DashboardModule;
