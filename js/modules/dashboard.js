/* ==========================================================================
   EAX Platform - Dashboard Module
   ========================================================================== */

const DashboardModule = {
    render() {
        const content = document.getElementById('page-content');

        // Get data for stats
        const clientes = Store.get('clientes');
        const oportunidades = Store.get('oportunidades');
        const tareas = Store.get('tareas');
        const productos = Store.get('productos');

        // Calculate stats
        const totalClientes = clientes.length;
        const oportunidadesAbiertas = oportunidades.filter(o => o.etapa !== 'ganada' && o.etapa !== 'perdida').length;
        const valorPipeline = oportunidades.filter(o => o.etapa !== 'perdida').reduce((sum, o) => sum + o.valor, 0);
        const tareasEnProgreso = tareas.filter(t => t.estado === 'in-progress').length;
        const productosStockBajo = productos.filter(p => p.stock <= p.stockMinimo).length;

        content.innerHTML = `
            <div class="animate-fadeIn">
                ${Components.pageHeader({
            title: 'Dashboard',
            subtitle: 'Resumen general de la plataforma',
            actions: [
                { label: 'Exportar', icon: 'download', class: 'btn-outline', action: 'export' },
                { label: 'Actualizar', icon: 'refresh-cw', class: 'btn-primary', action: 'refresh' }
            ]
        })}
                
                <!-- Stats Grid -->
                <div class="quick-stats">
                    ${Components.statCard({ icon: 'users', label: 'Clientes Activos', value: totalClientes, change: 12, iconClass: 'primary' })}
                    ${Components.statCard({ icon: 'target', label: 'Oportunidades Abiertas', value: oportunidadesAbiertas, change: 8, iconClass: 'success' })}
                    ${Components.statCard({ icon: 'dollar-sign', label: 'Pipeline Total', value: Utils.formatCurrency(valorPipeline), change: 15, iconClass: 'warning' })}
                    ${Components.statCard({ icon: 'alert-circle', label: 'Stock Bajo', value: productosStockBajo, change: -5, iconClass: 'error' })}
                </div>
                
                <!-- Main Grid -->
                <div class="grid grid-cols-3 gap-6 mt-6">
                    <!-- Pipeline Chart -->
                    <div class="card" style="grid-column: span 2;">
                        <div class="card-header">
                            <h3 class="card-title">Pipeline de Ventas</h3>
                            <div class="flex gap-2">
                                <button class="btn btn-ghost btn-sm">Semana</button>
                                <button class="btn btn-secondary btn-sm">Mes</button>
                                <button class="btn btn-ghost btn-sm">Año</button>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="pipeline-stages">
                                ${DashboardModule.renderPipelineStages(oportunidades)}
                            </div>
                            <div class="mt-6">
                                ${DashboardModule.renderRecentOpportunities(oportunidades)}
                            </div>
                        </div>
                    </div>
                    
                    <!-- Tareas Recientes -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Mis Tareas</h3>
                            <a href="#/desarrollo" class="text-sm text-primary">Ver todas</a>
                        </div>
                        <div class="card-body">
                            ${DashboardModule.renderRecentTasks(tareas)}
                        </div>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-6 mt-6">
                    <!-- Actividades Recientes -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Actividad Reciente</h3>
                        </div>
                        <div class="card-body">
                            ${DashboardModule.renderActivityTimeline()}
                        </div>
                    </div>
                    
                    <!-- Alertas de Inventario -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Alertas de Stock</h3>
                            <a href="#/inventario" class="text-sm text-primary">Ver inventario</a>
                        </div>
                        <div class="card-body">
                            ${DashboardModule.renderStockAlerts(productos)}
                        </div>
                    </div>
                </div>
            </div>
        `;

        lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });
        DashboardModule.attachEvents();
    },

    renderPipelineStages(oportunidades) {
        const stages = [
            { id: 'calificacion', name: 'Calificación', color: 'var(--color-gray-400)' },
            { id: 'propuesta', name: 'Propuesta', color: 'var(--color-primary-500)' },
            { id: 'negociacion', name: 'Negociación', color: 'var(--color-warning-500)' },
            { id: 'ganada', name: 'Ganadas', color: 'var(--color-success-500)' }
        ];

        return stages.map(stage => {
            const count = oportunidades.filter(o => o.etapa === stage.id).length;
            const value = oportunidades.filter(o => o.etapa === stage.id).reduce((sum, o) => sum + o.valor, 0);
            return `
                <div class="pipeline-stage">
                    <span class="pipeline-stage-count">${count}</span>
                    <strong>${stage.name}</strong>
                    <div class="text-xs text-secondary mt-1">${Utils.formatCurrency(value)}</div>
                </div>
            `;
        }).join('');
    },

    renderRecentOpportunities(oportunidades) {
        const recent = oportunidades.slice(0, 4);
        return `
            <div class="flex flex-col gap-3">
                ${recent.map(op => `
                    <div class="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <div class="avatar">${Utils.getInitials(op.cliente)}</div>
                        <div class="flex-1">
                            <div class="font-medium text-sm">${op.titulo}</div>
                            <div class="text-xs text-secondary">${op.cliente}</div>
                        </div>
                        <div class="text-right">
                            <div class="font-semibold">${Utils.formatCurrency(op.valor)}</div>
                            <span class="badge badge-${Utils.getStatusColor(op.etapa)}">${op.etapa}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    renderRecentTasks(tareas) {
        const inProgress = tareas.filter(t => t.estado === 'in-progress' || t.estado === 'todo').slice(0, 5);

        if (inProgress.length === 0) {
            return Components.emptyState({ icon: 'check-circle', title: '¡Todo al día!', message: 'No tienes tareas pendientes' });
        }

        return `
            <div class="flex flex-col gap-2">
                ${inProgress.map(task => `
                    <div class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer" onclick="Router.navigate('/desarrollo')">
                        <input type="checkbox" class="form-checkbox" ${task.estado === 'done' ? 'checked' : ''}>
                        <div class="flex-1 min-w-0">
                            <div class="text-sm font-medium truncate">${task.titulo}</div>
                            <div class="text-xs text-secondary">${task.proyecto}</div>
                        </div>
                        <span class="badge badge-${Utils.getPriorityColor(task.prioridad)}">${task.prioridad}</span>
                    </div>
                `).join('')}
            </div>
        `;
    },

    renderActivityTimeline() {
        const activities = [
            { icon: 'check-circle', iconClass: 'success', title: 'Cotización aprobada', desc: 'COT-2024-001 - Empresa ABC', time: 'Hace 2 horas' },
            { icon: 'user-plus', iconClass: 'primary', title: 'Nuevo cliente registrado', desc: 'Tech Solutions SpA', time: 'Hace 4 horas' },
            { icon: 'message-square', iconClass: 'warning', title: 'Nuevo comentario', desc: 'en tarea "Diseño UI"', time: 'Hace 5 horas' },
            { icon: 'package', iconClass: 'primary', title: 'Stock actualizado', desc: 'Motor Eléctrico 5HP (+10)', time: 'Ayer' }
        ];

        return `
            <div class="timeline">
                ${activities.map(act => `
                    <div class="timeline-item">
                        <div class="timeline-icon ${act.iconClass}">
                            <i data-lucide="${act.icon}"></i>
                        </div>
                        <div class="timeline-content">
                            <div class="timeline-title">${act.title}</div>
                            <div class="timeline-description">${act.desc}</div>
                            <div class="timeline-time">${act.time}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    renderStockAlerts(productos) {
        const lowStock = productos.filter(p => p.stock <= p.stockMinimo);

        if (lowStock.length === 0) {
            return Components.emptyState({ icon: 'check-circle', title: 'Stock OK', message: 'Todos los productos tienen stock adecuado' });
        }

        return `
            <div class="flex flex-col gap-3">
                ${lowStock.map(prod => `
                    <div class="flex items-center gap-3 p-3 rounded-lg bg-error-50">
                        <div class="avatar" style="background: var(--color-error-100); color: var(--color-error-600);">
                            <i data-lucide="alert-triangle" style="width:18px;height:18px;"></i>
                        </div>
                        <div class="flex-1">
                            <div class="font-medium text-sm">${prod.nombre}</div>
                            <div class="text-xs text-secondary">SKU: ${prod.sku}</div>
                        </div>
                        <div class="text-right">
                            <div class="font-semibold text-error-600">${prod.stock} uds</div>
                            <div class="text-xs text-secondary">Mín: ${prod.stockMinimo}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    attachEvents() {
        document.querySelectorAll('[data-action="refresh"]').forEach(btn => {
            btn.addEventListener('click', () => {
                Components.toast('Dashboard actualizado', 'success');
                DashboardModule.render();
            });
        });

        document.querySelectorAll('[data-action="export"]').forEach(btn => {
            btn.addEventListener('click', () => {
                Components.toast('Exportando datos...', 'info');
            });
        });
    }
};

window.DashboardModule = DashboardModule;
