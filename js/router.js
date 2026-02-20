/* ==========================================================================
   EAX Platform - Router
   ========================================================================== */

const Router = {
    routes: {},
    currentRoute: null,

    // Register a route
    register(path, handler) {
        this.routes[path] = handler;
    },

    // Navigate to a route
    navigate(path) {
        window.location.hash = path;
    },

    // Get current path
    getPath() {
        return window.location.hash.slice(1) || '/dashboard';
    },

    // Parse route parameters
    parseParams(path) {
        const parts = path.split('/').filter(Boolean);
        return {
            module: parts[0] || 'dashboard',
            view: parts[1] || null,
            id: parts[2] || null
        };
    },

    // Handle route change
    handleRoute() {
        console.log('Router: Handling route change...');
        const path = this.getPath();
        const params = this.parseParams(path);

        console.log(`Router: Navigating to ${params.module} / ${params.view || 'default'}`);

        // Update active state in sidebar
        const navLinks = document.querySelectorAll('.nav-link');
        if (navLinks.length > 0) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.dataset.module === params.module) {
                    link.classList.add('active');
                }
            });
        }

        // Update breadcrumb
        this.updateBreadcrumb(params);

        // Update store
        if (window.Store && Store.state) {
            Store.state.currentModule = params.module;
            Store.state.currentView = params.view;
        }

        // Find and execute route handler
        const handler = this.routes[params.module];
        if (handler) {
            try {
                handler(params);
                console.log(`Router: Rendered module ${params.module}`);
            } catch (err) {
                console.error(`Router: Error executing handler for ${params.module}:`, err);
            }
        } else {
            console.warn(`Router: No handler for module ${params.module}`);
            this.render404();
        }

        this.currentRoute = path;
    },

    // Update breadcrumb
    updateBreadcrumb(params) {
        const breadcrumb = document.getElementById('breadcrumb');
        const moduleNames = {
            dashboard: 'Dashboard',
            crm: 'CRM',
            comercial: 'Comercial',
            desarrollo: 'Desarrollo',
            inventario: 'Inventario',
            rrhh: 'RRHH',
            licitaciones: 'Ventas Públicas',
            canvas: 'Canvas',
            pim: 'PIM',
            postventa: 'Postventa',
            comunicaciones: 'Comunicaciones',
            intranet: 'Intranet',
            proveedores: 'Proveedores'
        };

        let items = [{ name: moduleNames[params.module] || params.module, path: `#/${params.module}` }];

        if (params.view) {
            items.push({ name: params.view.charAt(0).toUpperCase() + params.view.slice(1), path: null });
        }

        breadcrumb.innerHTML = items.map((item, index) => {
            const isLast = index === items.length - 1;
            return `
                ${index > 0 ? '<i data-lucide="chevron-right" style="width:14px;height:14px;color:var(--color-gray-400)"></i>' : ''}
                <span class="breadcrumb-item ${isLast ? '' : 'text-secondary'}">
                    ${item.path && !isLast ? `<a href="${item.path}">${item.name}</a>` : item.name}
                </span>
            `;
        }).join('');

        lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });
    },

    // Render 404
    render404() {
        console.log('Router: Rendering 404 page');
        const content = document.getElementById('page-content');
        if (!content) return;

        content.innerHTML = Components.emptyState({
            icon: 'file-question',
            title: 'Página no encontrada',
            message: 'La página que buscas no existe o ha sido movida.',
            action: { label: 'Ir al Dashboard', action: 'go-dashboard', icon: 'home' }
        });

        if (window.lucide) lucide.createIcons();

        content.querySelector('[data-action="go-dashboard"]')?.addEventListener('click', () => {
            this.navigate('/dashboard');
        });
    },

    // Initialize
    init() {
        console.log('Router: Initializing...');
        // Listen for hash changes
        window.addEventListener('hashchange', () => {
            console.log('Router: Hash change detected:', window.location.hash);
            this.handleRoute();
        });

        // Handle initial route
        if (!window.location.hash || window.location.hash === '#/') {
            console.log('Router: No initial hash, setting to #/dashboard');
            window.location.hash = '/dashboard';
        } else {
            this.handleRoute();
        }
    }
};

// Make it global
window.Router = Router;
