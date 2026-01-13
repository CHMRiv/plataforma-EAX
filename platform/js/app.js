/* ==========================================================================
   EAX Platform - Main Application
   ========================================================================== */

const App = {
    init() {
        // Initialize icons
        lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });

        // Setup sidebar toggle
        this.setupSidebar();

        // Setup global search
        this.setupGlobalSearch();

        // Setup header buttons
        this.setupHeader();

        // Register routes
        this.registerRoutes();

        // Initialize router
        Router.init();

        console.log('EAX Platform initialized');
    },

    setupSidebar() {
        const sidebar = document.getElementById('sidebar');
        const toggle = document.getElementById('sidebar-toggle');
        const mobileToggle = document.getElementById('mobile-menu-toggle');

        toggle?.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            Store.state.sidebarCollapsed = sidebar.classList.contains('collapsed');
            Utils.storage.set('sidebarCollapsed', Store.state.sidebarCollapsed);
        });

        mobileToggle?.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });

        // Restore sidebar state
        if (Utils.storage.get('sidebarCollapsed')) {
            sidebar.classList.add('collapsed');
        }

        // Close mobile sidebar on navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 1024) {
                    sidebar.classList.remove('open');
                }
            });
        });
    },

    setupGlobalSearch() {
        const searchInput = document.getElementById('global-search');

        searchInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const term = e.target.value.trim();
                if (term) {
                    this.performGlobalSearch(term);
                }
            }
        });

        // Keyboard shortcut Ctrl/Cmd + K
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                searchInput?.focus();
            }
        });
    },

    performGlobalSearch(term) {
        // Search across all data
        const results = {
            clientes: Utils.search(Store.get('clientes'), term, ['nombre', 'contacto', 'email']),
            tareas: Utils.search(Store.get('tareas'), term, ['titulo', 'proyecto']),
            productos: Utils.search(Store.get('productos'), term, ['nombre', 'sku']),
            empleados: Utils.search(Store.get('empleados'), term, ['nombre', 'cargo'])
        };

        const totalResults = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);

        if (totalResults === 0) {
            Components.toast('No se encontraron resultados', 'info');
            return;
        }

        // Show results in modal
        const { modal } = Components.modal({
            title: `Resultados de búsqueda (${totalResults})`,
            size: 'lg',
            content: this.renderSearchResults(results, term)
        });

        lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });
    },

    renderSearchResults(results, term) {
        let html = '';

        const categories = {
            clientes: { label: 'Clientes', icon: 'users', path: '/crm' },
            tareas: { label: 'Tareas', icon: 'clipboard-list', path: '/desarrollo' },
            productos: { label: 'Productos', icon: 'package', path: '/inventario' },
            empleados: { label: 'Empleados', icon: 'user-cog', path: '/rrhh' }
        };

        for (const [key, items] of Object.entries(results)) {
            if (items.length === 0) continue;

            const cat = categories[key];
            html += `
                <div class="mb-6">
                    <h4 class="flex items-center gap-2 mb-3">
                        <i data-lucide="${cat.icon}"></i>
                        ${cat.label} (${items.length})
                    </h4>
                    <div class="flex flex-col gap-2">
                        ${items.slice(0, 5).map(item => `
                            <div class="contact-card" onclick="Router.navigate('${cat.path}')">
                                <div class="avatar">${Utils.getInitials(item.nombre || item.titulo)}</div>
                                <div class="contact-info">
                                    <div class="contact-name">${item.nombre || item.titulo}</div>
                                    <div class="contact-detail">${item.email || item.proyecto || item.sku || item.cargo || ''}</div>
                                </div>
                            </div>
                        `).join('')}
                        ${items.length > 5 ? `<p class="text-sm text-secondary">...y ${items.length - 5} más</p>` : ''}
                    </div>
                </div>
            `;
        }

        return html;
    },

    setupHeader() {
        const notificationsBtn = document.getElementById('notifications-btn');
        const settingsBtn = document.getElementById('settings-btn');

        notificationsBtn?.addEventListener('click', () => {
            this.showNotifications();
        });

        settingsBtn?.addEventListener('click', () => {
            Components.toast('Configuración próximamente', 'info');
        });
    },

    showNotifications() {
        const notifications = Store.state.notifications;

        const content = notifications.length === 0
            ? Components.emptyState({ icon: 'bell-off', title: 'Sin notificaciones', message: 'No tienes notificaciones pendientes' })
            : `
                <div class="flex flex-col gap-3">
                    ${notifications.map(n => `
                        <div class="contact-card ${n.read ? '' : 'bg-primary-50'}">
                            <div class="avatar ${n.read ? '' : 'bg-primary-500'}">${n.read ? '✓' : '!'}</div>
                            <div class="contact-info">
                                <div class="contact-name">${n.title}</div>
                                <div class="contact-detail">${n.message}</div>
                                <div class="text-xs text-tertiary mt-1">${n.time}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;

        Components.modal({
            title: 'Notificaciones',
            size: 'sm',
            content
        });

        lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });
    },

    registerRoutes() {
        // Register all module routes with error handling and context binding
        const safeRender = (module, name) => {
            try {
                if (typeof module.render === 'function') {
                    module.render.bind(module)();
                } else {
                    console.error(`Module ${name} does not have a render function`);
                }
            } catch (error) {
                console.error(`Error rendering module ${name}:`, error);
                Components.toast(`Error cargando módulo ${name}`, 'error');
            }
        };

        Router.register('dashboard', () => safeRender(DashboardModule, 'Dashboard'));
        Router.register('crm', () => safeRender(CRMModule, 'CRM'));
        Router.register('comercial', () => safeRender(ComercialModule, 'Comercial'));
        Router.register('desarrollo', () => safeRender(DesarrolloModule, 'Desarrollo'));
        Router.register('inventario', () => safeRender(InventarioModule, 'Inventario'));
        Router.register('rrhh', () => safeRender(RRHHModule, 'RRHH'));
        Router.register('licitaciones', () => safeRender(LicitacionesModule, 'Licitaciones'));
        Router.register('canvas', () => safeRender(CanvasModule, 'Canvas'));
        Router.register('pim', () => safeRender(PIMModule, 'PIM'));
        Router.register('comunicaciones', () => safeRender(ComunicacionesModule, 'Comunicaciones'));
        Router.register('intranet', () => safeRender(IntranetModule, 'Intranet'));
    },

    // Render content to main area
    renderContent(html) {
        const content = document.getElementById('page-content');
        content.innerHTML = html;
        if (window.lucide) {
            lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });
        }
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => App.init());

// Make it global
window.App = App;
