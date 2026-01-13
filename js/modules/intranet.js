/* ==========================================================================
   EAX Platform - Intranet Module
   ========================================================================== */

const IntranetModule = {
    render() {
        const content = document.getElementById('page-content');
        const empleados = Store.get('empleados');
        const anuncios = Store.get('anuncios');

        content.innerHTML = `
            <div class="animate-fadeIn">
                ${Components.pageHeader({
            title: 'Intranet',
            subtitle: 'Portal corporativo interno',
            actions: []
        })}
                
                <!-- Welcome Banner -->
                <div class="card mb-6" style="background: linear-gradient(135deg, var(--color-primary-600), var(--color-accent-600)); color: white; border: none;">
                    <div class="card-body p-8">
                        <div class="flex items-center gap-6">
                            <div class="avatar avatar-xl" style="background: rgba(255,255,255,0.2);">
                                ${Utils.getInitials(Store.state.user.name)}
                            </div>
                            <div>
                                <h2 class="text-2xl font-semibold mb-1">¡Bienvenido, ${Store.state.user.name}!</h2>
                                <p style="opacity: 0.9;">Es hora de hacer cosas increíbles. Tu portal corporativo está listo.</p>
                            </div>
                            <div class="ml-auto text-right">
                                <div class="text-sm" style="opacity: 0.8;">Hoy es</div>
                                <div class="text-xl font-semibold">${new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="grid grid-cols-3 gap-6">
                    <!-- Main Content -->
                    <div style="grid-column: span 2;" class="flex flex-col gap-6">
                        <!-- Quick Links -->
                        <div class="card">
                            <div class="card-header">
                                <h3 class="card-title">Accesos Rápidos</h3>
                            </div>
                            <div class="card-body">
                                <div class="grid grid-cols-4 gap-4">
                                    ${this.renderQuickLinks()}
                                </div>
                            </div>
                        </div>
                        
                        <!-- News & Announcements -->
                        <div class="card">
                            <div class="card-header">
                                <h3 class="card-title">Noticias y Anuncios</h3>
                                <a href="#/comunicaciones" class="text-sm text-primary">Ver todos</a>
                            </div>
                            <div class="card-body">
                                <div class="flex flex-col gap-4">
                                    ${anuncios.map(a => `
                                        <div class="flex gap-4 p-4 bg-gray-50 rounded-lg">
                                            <div class="avatar" style="background: var(--color-warning-100); color: var(--color-warning-600);">
                                                <i data-lucide="megaphone" style="width:18px;height:18px;"></i>
                                            </div>
                                            <div class="flex-1">
                                                <div class="font-medium">${a.titulo}</div>
                                                <div class="text-sm text-secondary mt-1">${a.contenido}</div>
                                                <div class="text-xs text-tertiary mt-2">${Utils.formatDate(a.fecha)} • ${a.autor}</div>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                        
                        <!-- Documents -->
                        <div class="card">
                            <div class="card-header">
                                <h3 class="card-title">Documentos Importantes</h3>
                            </div>
                            <div class="card-body">
                                <div class="grid grid-cols-2 gap-3">
                                    ${this.renderDocuments()}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Sidebar -->
                    <div class="flex flex-col gap-6">
                        <!-- Upcoming Events -->
                        <div class="card">
                            <div class="card-header">
                                <h3 class="card-title">Próximos Eventos</h3>
                            </div>
                            <div class="card-body">
                                ${this.renderEvents()}
                            </div>
                        </div>
                        
                        <!-- Birthdays -->
                        <div class="card">
                            <div class="card-header">
                                <h3 class="card-title">🎂 Cumpleaños del Mes</h3>
                            </div>
                            <div class="card-body">
                                <div class="flex flex-col gap-3">
                                    ${empleados.slice(0, 3).map(e => `
                                        <div class="flex items-center gap-3">
                                            <div class="avatar avatar-sm">${Utils.getInitials(e.nombre)}</div>
                                            <div class="flex-1">
                                                <div class="text-sm font-medium">${e.nombre}</div>
                                                <div class="text-xs text-secondary">${e.departamento}</div>
                                            </div>
                                            <div class="text-xs text-secondary">${Math.floor(Math.random() * 28) + 1} Ene</div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                        
                        <!-- Directory -->
                        <div class="card">
                            <div class="card-header">
                                <h3 class="card-title">Directorio</h3>
                                <a href="#/rrhh" class="text-sm text-primary">Ver todos</a>
                            </div>
                            <div class="card-body">
                                <div class="input-with-icon mb-4">
                                    <i data-lucide="search" class="icon"></i>
                                    <input type="text" class="form-input" placeholder="Buscar personas..." id="search-directory">
                                </div>
                                <div class="flex flex-col gap-2" id="directory-list">
                                    ${empleados.slice(0, 4).map(e => `
                                        <div class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                                            <div class="avatar avatar-sm">${Utils.getInitials(e.nombre)}</div>
                                            <div class="flex-1 min-w-0">
                                                <div class="text-sm font-medium truncate">${e.nombre}</div>
                                                <div class="text-xs text-secondary truncate">${e.cargo}</div>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });
        this.attachEvents();
    },

    renderQuickLinks() {
        const links = [
            { icon: 'users', label: 'CRM', color: 'primary', path: '/crm' },
            { icon: 'clipboard-list', label: 'Tareas', color: 'success', path: '/desarrollo' },
            { icon: 'calculator', label: 'Cotizar', color: 'warning', path: '/comercial' },
            { icon: 'package', label: 'Inventario', color: 'error', path: '/inventario' },
            { icon: 'user-cog', label: 'RRHH', color: 'secondary', path: '/rrhh' },
            { icon: 'file-text', label: 'Licitaciones', color: 'primary', path: '/licitaciones' },
            { icon: 'layout-grid', label: 'Canvas', color: 'accent', path: '/canvas' },
            { icon: 'message-square', label: 'Chat', color: 'success', path: '/comunicaciones' }
        ];

        const colors = {
            primary: { bg: 'var(--color-primary-100)', color: 'var(--color-primary-600)' },
            success: { bg: 'var(--color-success-100)', color: 'var(--color-success-600)' },
            warning: { bg: 'var(--color-warning-100)', color: 'var(--color-warning-600)' },
            error: { bg: 'var(--color-error-100)', color: 'var(--color-error-600)' },
            secondary: { bg: 'var(--color-gray-100)', color: 'var(--color-gray-600)' },
            accent: { bg: 'var(--color-accent-100)', color: 'var(--color-accent-600)' }
        };

        return links.map(link => {
            const c = colors[link.color];
            return `
                <a href="#${link.path}" class="flex flex-col items-center gap-2 p-4 rounded-xl hover:shadow-md transition-all cursor-pointer" style="background: ${c.bg};">
                    <div style="color: ${c.color};">
                        <i data-lucide="${link.icon}" style="width:24px;height:24px;"></i>
                    </div>
                    <span class="text-sm font-medium" style="color: ${c.color};">${link.label}</span>
                </a>
            `;
        }).join('');
    },

    renderDocuments() {
        const docs = [
            { name: 'Manual de Políticas', icon: 'file-text', type: 'PDF' },
            { name: 'Código de Ética', icon: 'shield', type: 'PDF' },
            { name: 'Reglamento Interno', icon: 'book', type: 'PDF' },
            { name: 'Organigrama 2024', icon: 'git-branch', type: 'PNG' }
        ];

        return docs.map(doc => `
            <div class="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <div class="avatar avatar-sm" style="background: var(--color-error-100); color: var(--color-error-600);">
                    <i data-lucide="${doc.icon}" style="width:16px;height:16px;"></i>
                </div>
                <div class="flex-1">
                    <div class="text-sm font-medium">${doc.name}</div>
                    <div class="text-xs text-secondary">${doc.type}</div>
                </div>
                <i data-lucide="download" style="width:16px;height:16px;color:var(--color-gray-400);"></i>
            </div>
        `).join('');
    },

    renderEvents() {
        const events = [
            { title: 'Reunión de Equipo', date: 'Hoy, 15:00', type: 'meeting' },
            { title: 'Capacitación Seguridad', date: 'Mañana, 10:00', type: 'training' },
            { title: 'Cierre Inventario', date: '31 Ene, 18:00', type: 'deadline' }
        ];

        const icons = { meeting: 'video', training: 'graduation-cap', deadline: 'clock' };
        const colors = { meeting: 'primary', training: 'success', deadline: 'warning' };

        return `
            <div class="flex flex-col gap-3">
                ${events.map(e => `
                    <div class="flex items-center gap-3 p-3 bg-${colors[e.type]}-50 rounded-lg">
                        <div class="avatar avatar-sm" style="background: var(--color-${colors[e.type]}-100); color: var(--color-${colors[e.type]}-600);">
                            <i data-lucide="${icons[e.type]}" style="width:16px;height:16px;"></i>
                        </div>
                        <div class="flex-1">
                            <div class="text-sm font-medium">${e.title}</div>
                            <div class="text-xs text-secondary">${e.date}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    attachEvents() {
        // Directory search
        document.getElementById('search-directory')?.addEventListener('input', Utils.debounce((e) => {
            const term = e.target.value.toLowerCase();
            const empleados = Store.get('empleados');
            const filtered = empleados.filter(emp =>
                emp.nombre.toLowerCase().includes(term) ||
                emp.cargo.toLowerCase().includes(term)
            );

            const list = document.getElementById('directory-list');
            list.innerHTML = filtered.slice(0, 4).map(e => `
                <div class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div class="avatar avatar-sm">${Utils.getInitials(e.nombre)}</div>
                    <div class="flex-1 min-w-0">
                        <div class="text-sm font-medium truncate">${e.nombre}</div>
                        <div class="text-xs text-secondary truncate">${e.cargo}</div>
                    </div>
                </div>
            `).join('');
        }, 300));
    }
};

window.IntranetModule = IntranetModule;
