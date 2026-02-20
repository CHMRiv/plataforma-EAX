/* ==========================================================================
   Aura Platform - Main Application
   ========================================================================== */

const App = {
    init() {
        console.log('App: Registrando detector de inicio...');

        const start = () => {
            console.log('App: Iniciando componentes core...');
            try {
                // Initialize Store ID counter
                if (window.Store && Store._initIdCounter) {
                    Store._initIdCounter();
                    console.log('App: Store iniciado');
                }

                // Initialize icons
                if (window.lucide) {
                    console.log('App: Iniciando iconos Lucide...');
                    try {
                        lucide.createIcons();
                    } catch (e) {
                        console.warn('App: Error al crear iconos inicialmente:', e);
                    }
                }

                // Setup sidebar toggle
                this.setupSidebar();

                // Setup global search
                this.setupGlobalSearch();

                // Setup header buttons
                this.setupHeader();

                // Register routes
                this.registerRoutes();

                // Initialize router
                if (window.Router) {
                    Router.init();
                    console.log('App: Router iniciado');
                }

                // Hide splash screen if everything ok
                const splash = document.getElementById('splash-screen');
                if (splash) {
                    splash.style.opacity = '0';
                    setTimeout(() => splash.remove(), 500);
                }

                console.log('Aura Platform initialized successfully');
            } catch (err) {
                console.error('App: Error crítico durante la carga:', err);
                const status = document.getElementById('splash-status');
                if (status) status.textContent = 'Error al cargar: ' + err.message;
            }
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', start);
        } else {
            start();
        }
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
                if (term) this.performGlobalSearch(term);
            }
        });

        // Keyboard shortcut Ctrl/Cmd + K (Command Palette)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.openCommandPalette();
            }
        });
    },

    openCommandPalette() {
        const { modal, close } = Components.modal({
            title: 'Búsqueda Global',
            size: 'lg',
            content: `
                <div class="px-4 pb-4">
                    <div class="relative group">
                        <i data-lucide="search" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors"></i>
                        <input type="text" id="palette-search" class="form-input text-lg pl-12 py-4 bg-gray-50 border-none ring-0 focus:ring-2 focus:ring-primary-500/20" placeholder="Buscar clientes, tareas, productos, facturas..." autofocus>
                    </div>
                    <div id="palette-results" class="mt-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                        <div class="text-center py-12 text-gray-400">
                            <i data-lucide="command" style="width:48px;height:48px;margin:0 auto 16px;opacity:0.2;"></i>
                            <p>Escribe algo para empezar a buscar</p>
                            <p class="text-xs mt-2 uppercase tracking-widest font-semibold opacity-50">Sugerencia: "Empresa", "Motor", "Licitación"</p>
                        </div>
                    </div>
                </div>
            `
        });

        const input = document.getElementById('palette-search');
        input?.addEventListener('input', Utils.debounce((e) => {
            const results = this.getGlobalSearchResults(e.target.value);
            const resultsDiv = document.getElementById('palette-results');
            if (resultsDiv) resultsDiv.innerHTML = this.renderSearchResults(results, e.target.value);

            resultsDiv?.querySelectorAll('[data-nav-path]').forEach(item => {
                item.addEventListener('click', () => { close(); Router.navigate(item.dataset.navPath); });
            });
            if (window.lucide) lucide.createIcons();
        }, 200));

        if (window.lucide) lucide.createIcons();
    },

    getGlobalSearchResults(term) {
        if (!term || term.length < 2) return null;
        return {
            clientes: Utils.search(Store.get('clientes'), term, ['nombre', 'contacto', 'email']),
            tareas: Utils.search(Store.get('tareas'), term, ['titulo', 'proyecto']),
            productos: Utils.search(Store.get('productos'), term, ['nombre', 'sku', 'marca']),
            empleados: Utils.search(Store.get('empleados'), term, ['nombre', 'cargo', 'departamento']),
            licitaciones: Utils.search(Store.get('ventasPublicas'), term, ['titulo', 'entidad', 'idPortal']),
            cotizaciones: Utils.search(Store.get('cotizaciones'), term, ['numero', 'cliente'])
        };
    },

    renderSearchResults(results, term) {
        if (!results) return '<div class="text-center py-12 text-gray-400">Escribe al menos 2 caracteres...</div>';

        const total = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);
        if (total === 0) return Components.emptyState({ icon: 'search', title: 'Sin resultados', message: `No encontramos nada para "${term}"` });

        let html = '';
        const categories = {
            clientes: { label: 'Contactos', icon: 'users', path: '/crm' },
            tareas: { label: 'Desarrollo', icon: 'clipboard-check', path: '/desarrollo' },
            productos: { label: 'Inventario / PIM', icon: 'package', path: '/inventario' },
            empleados: { label: 'RRHH', icon: 'user-cog', path: '/rrhh' },
            licitaciones: { label: 'Ventas Públicas', icon: 'landmark', path: '/licitaciones' },
            cotizaciones: { label: 'Comercial', icon: 'file-text', path: '/comercial' }
        };

        for (const [key, items] of Object.entries(results)) {
            if (items.length === 0) continue;
            const cat = categories[key];
            html += `
                <div class="mb-4">
                    <div class="px-2 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <i data-lucide="${cat.icon}" style="width:12px;height:12px;"></i> ${cat.label}
                    </div>
                    <div class="space-y-1">
                        ${items.slice(0, 4).map(item => `
                            <div class="flex items-center gap-3 p-3 rounded-xl hover:bg-primary-50 hover:text-primary-700 transition-all cursor-pointer group" data-nav-path="${cat.path}">
                                <div class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-gray-500 group-hover:bg-primary-100 group-hover:text-primary-600 transition-colors">
                                    ${Utils.getInitials(item.nombre || item.titulo || item.numero)}
                                </div>
                                <div class="flex-1 min-w-0">
                                    <div class="font-semibold truncate">${item.nombre || item.titulo || item.numero}</div>
                                    <div class="text-xs opacity-60 truncate">${item.email || item.proyecto || item.sku || item.entidad || 'Ver detalles'}</div>
                                </div>
                                <i data-lucide="chevron-right" class="opacity-0 group-hover:opacity-100 transition-opacity" style="width:16px;"></i>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        return html;
    },

    setupHeader() {
        const notificationsBtn = document.getElementById('notifications-btn');
        const settingsBtn = document.getElementById('settings-btn');
        const userBtn = document.getElementById('user-menu-btn');

        notificationsBtn?.addEventListener('click', () => this.showNotifications());
        settingsBtn?.addEventListener('click', () => this.toggleDarkMode());

        // Listen for store changes to update badge
        Store.on('notifications:changed', (n) => {
            const unread = n.filter(x => !x.read).length;
            const badge = document.getElementById('notif-badge');
            if (badge) {
                badge.textContent = unread;
                badge.style.display = unread > 0 ? 'flex' : 'none';
                badge.classList.add('animate-bounce');
                setTimeout(() => badge.classList.remove('animate-bounce'), 1000);
            }
        });
    },

    toggleDarkMode() {
        const isDark = document.body.classList.toggle('dark-mode');
        Utils.storage.set('darkMode', isDark);
        Components.toast(isDark ? 'Modo oscuro activado' : 'Modo claro activado', 'info');
    },

    showNotifications() {
        const notifications = Store.state.notifications;

        const content = notifications.length === 0
            ? Components.emptyState({ icon: 'bell-off', title: 'Sin notificaciones', message: 'Todo al día por aquí' })
            : `
                <div class="flex flex-col gap-2 p-2 max-h-[70vh] overflow-y-auto">
                    ${notifications.map((n, i) => `
                        <div class="flex gap-4 p-4 rounded-2xl ${n.read ? 'opacity-60' : 'bg-primary-50 border border-primary-100'} transition-all hover:bg-white hover:shadow-lg group">
                            <div class="w-12 h-12 rounded-full flex items-center justify-center ${n.type === 'warning' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}">
                                <i data-lucide="${n.type === 'warning' ? 'alert-triangle' : 'bell'}"></i>
                            </div>
                            <div class="flex-1">
                                <div class="flex items-center justify-between mb-1">
                                    <div class="font-bold text-gray-900">${n.title}</div>
                                    <div class="text-[10px] text-gray-400 font-medium uppercase">${n.time}</div>
                                </div>
                                <div class="text-sm text-gray-600 mb-2">${n.message}</div>
                                ${!n.read ? `<button class="text-[10px] font-bold text-primary-600 uppercase tracking-wider hover:underline" onclick="App.markNotifRead(${i}, this)">Marcar como leída</button>` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;

        Components.modal({
            title: 'Centro de Notificaciones',
            size: 'md',
            content
        });

        if (window.lucide) lucide.createIcons();
    },

    markNotifRead(idx, btn) {
        if (Store.state.notifications[idx]) {
            Store.state.notifications[idx].read = true;
            Store.emit('notifications:changed', Store.state.notifications);
            if (btn) btn.closest('.contact-card')?.classList.remove('bg-primary-50');
            btn?.remove();
        }
    },

    registerRoutes() {
        // Register all module routes with error handling and context binding
        const safeRender = (module, name) => {
            console.log(`App: Intentando renderizar módulo ${name}...`);
            try {
                if (!module) {
                    throw new Error(`El módulo ${name} no está definido (posible error de sintaxis en el archivo JS)`);
                }
                if (typeof module.render === 'function') {
                    module.render.bind(module)();
                    console.log(`App: Módulo ${name} renderizado correctamente.`);
                } else {
                    console.error(`Module ${name} does not have a render function`);
                }
            } catch (error) {
                console.error(`Error rendering module ${name}:`, error);
                Components.toast(`Error cargando módulo ${name}: ${error.message}`, 'error');

                // Show error details in page content for focus
                const content = document.getElementById('page-content');
                if (content) {
                    content.innerHTML = `
                        <div class="p-12 text-center">
                            <div class="w-20 h-20 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-6">
                                <i data-lucide="alert-circle" class="w-10 h-10"></i>
                            </div>
                            <h2 class="text-xl font-bold text-gray-900 mb-2">Error al cargar el módulo ${name}</h2>
                            <p class="text-gray-500 max-w-md mx-auto mb-6">${error.message}</p>
                            <button class="btn btn-primary" onclick="window.location.reload()">Reintanciar Plataforma</button>
                        </div>
                    `;
                    if (window.lucide) lucide.createIcons();
                }
            }
        };

        Router.register('dashboard', () => safeRender(DashboardModule, 'Dashboard'));
        Router.register('crm', () => safeRender(CRMModule, 'CRM'));
        Router.register('comercial', () => safeRender(ComercialModule, 'Comercial'));
        Router.register('desarrollo', () => safeRender(DesarrolloModule, 'Desarrollo'));
        Router.register('inventario', () => safeRender(InventarioModule, 'Inventario'));
        Router.register('rrhh', () => safeRender(RRHHModule, 'RRHH'));
        Router.register('licitaciones', () => safeRender(VentasPublicasModule, 'Ventas Públicas'));
        Router.register('canvas', () => safeRender(CanvasModule, 'Canvas'));
        Router.register('pim', () => safeRender(PIMModule, 'PIM'));
        Router.register('postventa', () => safeRender(PostventaModule, 'Postventa'));
        Router.register('proveedores', () => safeRender(ProveedoresModule, 'Proveedores'));
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
