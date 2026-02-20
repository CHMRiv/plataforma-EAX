/* ==========================================================================
   EAX Platform - Intranet Module
   ========================================================================== */

const IntranetModule = {
    render() {
        const content = document.getElementById('page-content');
        const empleados = Store.get('empleados');
        const anuncios = Store.get('anuncios');

        // Initialize events if not exists
        if (!Store.data.eventos) {
            Store.data.eventos = [
                { id: 1, titulo: 'Reunión de Equipo', fecha: new Date().toISOString().split('T')[0], hora: '15:00', tipo: 'meeting' },
                { id: 2, titulo: 'Capacitación Seguridad', fecha: new Date(Date.now() + 86400000).toISOString().split('T')[0], hora: '10:00', tipo: 'training' },
                { id: 3, titulo: 'Cierre Inventario', fecha: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0], hora: '18:00', tipo: 'deadline' }
            ];
        }

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
                                <a href="#/comunicaciones" class="text-sm text-primary" style="font-weight:500;">Ver todos →</a>
                            </div>
                            <div class="card-body" style="display:flex;flex-direction:column;gap:16px;">
                                ${anuncios.map((a, idx) => {
            const typeMap = { urgente: { bg: '#fff1f2', color: '#f43f5e', label: '🚨 Urgente' }, logro: { bg: '#ecfdf5', color: '#059669', label: '🏆 Logro' }, general: { bg: '#eff6ff', color: '#3b82f6', label: '📢 Anuncio' } };
            const tc = typeMap[a.tipo] || typeMap.general;
            const reactions = a.reactions || { like: 0, celebrate: 0 };
            return `
                                        <div style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;background:#fff;">
                                            <div style="height:3px;background:${tc.color};"></div>
                                            <div style="padding:18px;">
                                                <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px;">
                                                    <div>
                                                        <span style="font-size:11px;font-weight:600;padding:2px 10px;border-radius:20px;background:${tc.bg};color:${tc.color};display:inline-block;margin-bottom:6px;">${tc.label}</span>
                                                        <div style="font-weight:700;font-size:15px;color:#0f172a;">${a.titulo}</div>
                                                    </div>
                                                    <span style="font-size:11px;color:#94a3b8;flex-shrink:0;">${Utils.formatDate(a.fecha)}</span>
                                                </div>
                                                <p style="color:#475569;font-size:14px;line-height:1.6;margin-bottom:14px;">${a.contenido}</p>
                                                <div style="display:flex;align-items:center;justify-content:space-between;padding-top:12px;border-top:1px solid #f1f5f9;">
                                                    <div style="display:flex;align-items:center;gap:6px;font-size:12px;color:#64748b;">
                                                        <div style="width:24px;height:24px;border-radius:50%;background:#6d28d9;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#fff;">${(a.autor || 'A').charAt(0)}</div>
                                                        ${a.autor || 'EAX Admin'}
                                                    </div>
                                                    <div style="display:flex;gap:6px;">
                                                        <button onclick="IntranetModule.reactPost(${idx},'like')" id="react-like-${idx}" style="border:1px solid #e2e8f0;background:#fff;border-radius:8px;padding:4px 12px;cursor:pointer;font-size:12px;font-weight:500;color:#64748b;display:flex;align-items:center;gap:4px;transition:all 0.15s;">
                                                            👍 <span id="like-count-${idx}">${reactions.like || 0}</span>
                                                        </button>
                                                        <button onclick="IntranetModule.reactPost(${idx},'celebrate')" id="react-celebrate-${idx}" style="border:1px solid #e2e8f0;background:#fff;border-radius:8px;padding:4px 12px;cursor:pointer;font-size:12px;font-weight:500;color:#64748b;display:flex;align-items:center;gap:4px;transition:all 0.15s;">
                                                            🎉 <span id="celebrate-count-${idx}">${reactions.celebrate || 0}</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    `;
        }).join('')}
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
                                    ${this.renderBirthdays(empleados)}
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
            { icon: 'landmark', label: 'Ventas Públicas', color: 'primary', path: '/licitaciones' },
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
            <div class="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer doc-download" data-doc="${doc.name}" data-type="${doc.type}">
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
        const eventos = Store.data.eventos || [];
        const icons = { meeting: 'video', training: 'graduation-cap', deadline: 'clock' };
        const colors = { meeting: 'primary', training: 'success', deadline: 'warning' };

        const formatEventDate = (fecha, hora) => {
            const today = new Date().toISOString().split('T')[0];
            const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
            if (fecha === today) return `Hoy, ${hora}`;
            if (fecha === tomorrow) return `Mañana, ${hora}`;
            return `${Utils.formatDate(fecha)}, ${hora}`;
        };

        return `
            <div class="flex flex-col gap-3">
                ${eventos.map(e => `
                    <div class="flex items-center gap-3 p-3 rounded-lg" style="background: var(--color-${colors[e.tipo] || 'primary'}-50);">
                        <div class="avatar avatar-sm" style="background: var(--color-${colors[e.tipo] || 'primary'}-100); color: var(--color-${colors[e.tipo] || 'primary'}-600);">
                            <i data-lucide="${icons[e.tipo] || 'calendar'}" style="width:16px;height:16px;"></i>
                        </div>
                        <div class="flex-1">
                            <div class="text-sm font-medium">${e.titulo}</div>
                            <div class="text-xs text-secondary">${formatEventDate(e.fecha, e.hora)}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    renderBirthdays(empleados) {
        // Use deterministic dates based on employee ID instead of Math.random()
        const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const currentMonth = new Date().getMonth();

        return empleados.slice(0, 3).map((e, i) => {
            const day = ((e.id * 7 + 3) % 28) + 1;
            return `
                <div class="flex items-center gap-3">
                    <div class="avatar avatar-sm">${Utils.getInitials(e.nombre)}</div>
                    <div class="flex-1">
                        <div class="text-sm font-medium">${e.nombre}</div>
                        <div class="text-xs text-secondary">${e.departamento}</div>
                    </div>
                    <div class="text-xs text-secondary">${day} ${monthNames[currentMonth]}</div>
                </div>
            `;
        }).join('');
    },

    reactPost(idx, type) {
        const anuncios = Store.get('anuncios') || [];
        if (!anuncios[idx]) return;
        if (!anuncios[idx].reactions) anuncios[idx].reactions = { like: 0, celebrate: 0 };
        anuncios[idx].reactions[type] = (anuncios[idx].reactions[type] || 0) + 1;
        const countEl = document.getElementById(`${type}-count-${idx}`);
        const btnEl = document.getElementById(`react-${type}-${idx}`);
        if (countEl) countEl.textContent = anuncios[idx].reactions[type];
        if (btnEl) { btnEl.style.borderColor = '#3b82f6'; btnEl.style.color = '#3b82f6'; }
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

        // Document downloads
        document.querySelectorAll('.doc-download').forEach(doc => {
            doc.addEventListener('click', () => {
                const docName = doc.dataset.doc;
                const docType = doc.dataset.type;

                Components.toast(`Generando "${docName}.${docType.toLowerCase()}"...`, 'info');

                // Simulate real download by creating a blob
                setTimeout(() => {
                    let blob;
                    if (docType === 'PDF') {
                        blob = new Blob(['%PDF-1.4\n%... Fichero PDF EAX ficticio ...'], { type: 'application/pdf' });
                    } else {
                        blob = new Blob([''], { type: 'image/png' });
                    }

                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${docName.replace(/\s+/g, '_')}.${docType.toLowerCase()}`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);

                    Components.toast(`"${docName}.${docType.toLowerCase()}" descargado correctamente`, 'success');
                }, 1000);
            });
        });
    }
};

window.IntranetModule = IntranetModule;
