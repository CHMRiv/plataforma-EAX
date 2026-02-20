/* ==========================================================================
   EAX Platform - UI Components
   ========================================================================== */

const Components = {
    // Toast notifications
    toast(message, type = 'info', duration = 4000) {
        const container = document.getElementById('toast-container');
        const icons = {
            success: 'check-circle',
            error: 'x-circle',
            warning: 'alert-triangle',
            info: 'info'
        };

        const toast = Utils.dom.create('div', { className: `toast ${type} animate-fadeInUp` }, []);
        toast.innerHTML = `
            <i data-lucide="${icons[type] || 'info'}"></i>
            <span class="toast-message">${message}</span>
            <button class="toast-close"><i data-lucide="x"></i></button>
        `;

        container.appendChild(toast);
        lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });

        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.remove();
        });

        setTimeout(() => toast.remove(), duration);
    },

    // Modal
    modal({ title, content, size = 'md', footer = null, onClose = null }) {
        const container = document.getElementById('modal-container');

        const backdrop = Utils.dom.create('div', { className: 'modal-backdrop' });
        const modal = Utils.dom.create('div', { className: `modal modal-${size}` });

        modal.innerHTML = `
            <div class="modal-header">
                <h3 class="modal-title">${title}</h3>
                <button class="modal-close"><i data-lucide="x"></i></button>
            </div>
            <div class="modal-body">${typeof content === 'string' ? content : ''}</div>
            ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
        `;

        if (typeof content !== 'string') {
            modal.querySelector('.modal-body').appendChild(content);
        }

        container.appendChild(backdrop);
        container.appendChild(modal);

        lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });

        const close = () => {
            backdrop.remove();
            modal.remove();
            document.removeEventListener('keydown', escHandler);
            if (onClose) onClose();
        };

        // Escape key closes modal
        const escHandler = (e) => { if (e.key === 'Escape') close(); };
        document.addEventListener('keydown', escHandler);

        modal.querySelector('.modal-close').addEventListener('click', close);
        backdrop.addEventListener('click', close);

        return { modal, close };
    },

    // Confirm dialog
    confirm({ title, message, confirmText = 'Confirmar', cancelText = 'Cancelar', type = 'primary' }) {
        return new Promise((resolve) => {
            const { modal, close } = this.modal({
                title,
                content: `<p>${message}</p>`,
                size: 'sm',
                footer: `
                    <button class="btn btn-secondary cancel-btn">${cancelText}</button>
                    <button class="btn btn-${type} confirm-btn">${confirmText}</button>
                `
            });

            modal.querySelector('.cancel-btn').addEventListener('click', () => {
                close();
                resolve(false);
            });

            modal.querySelector('.confirm-btn').addEventListener('click', () => {
                close();
                resolve(true);
            });
        });
    },

    // Page header
    pageHeader({ title, subtitle = '', actions = [] }) {
        return `
            <div class="page-header">
                <div class="page-header-left">
                    <h1 class="page-title">${title}</h1>
                    ${subtitle ? `<p class="page-subtitle">${subtitle}</p>` : ''}
                </div>
                <div class="page-header-actions">
                    ${actions.map(action => `
                        <button class="btn ${action.class || 'btn-secondary'}" data-action="${action.action || ''}">
                            ${action.icon ? `<i data-lucide="${action.icon}"></i>` : ''}
                            ${action.label}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    },

    // Stat card
    statCard({ icon, label, value, change = null, iconClass = 'primary' }) {
        return `
            <div class="card stat-card">
                <div class="stat-icon ${iconClass}">
                    <i data-lucide="${icon}"></i>
                </div>
                <div class="stat-value">${value}</div>
                <div class="stat-label">${label}</div>
                ${change ? `
                    <div class="stat-change ${change >= 0 ? 'positive' : 'negative'}">
                        <i data-lucide="${change >= 0 ? 'trending-up' : 'trending-down'}"></i>
                        ${Math.abs(change)}%
                    </div>
                ` : ''}
            </div>
        `;
    },

    // Data table
    dataTable({ columns, data, actions = [], onRowClick = null }) {
        if (data.length === 0) {
            return this.emptyState({
                icon: 'inbox',
                title: 'Sin datos',
                message: 'No hay registros para mostrar'
            });
        }

        return `
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            ${columns.map(col => `<th>${col.label}</th>`).join('')}
                            ${actions.length > 0 ? '<th>Acciones</th>' : ''}
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(row => `
                            <tr data-id="${row.id}" ${onRowClick ? 'style="cursor:pointer"' : ''}>
                                ${columns.map(col => `<td>${this.renderCell(row[col.key], col)}</td>`).join('')}
                                ${actions.length > 0 ? `
                                    <td>
                                        <div class="flex gap-1">
                                            ${actions.map(action => `
                                                <button class="btn btn-ghost btn-icon" data-action="${action.action}" data-id="${row.id}" title="${action.label}">
                                                    <i data-lucide="${action.icon}"></i>
                                                </button>
                                            `).join('')}
                                        </div>
                                    </td>
                                ` : ''}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    // Render table cell based on type
    renderCell(value, column) {
        if (value === null || value === undefined) return '-';

        switch (column.type) {
            case 'currency':
                return Utils.formatCurrency(value);
            case 'date':
                return Utils.formatDate(value);
            case 'badge':
                const color = Utils.getStatusColor(value);
                return `<span class="badge badge-${color}">${value}</span>`;
            case 'avatar':
                return `<div class="avatar avatar-sm">${Utils.getInitials(value)}</div>`;
            case 'progress':
                return `
                    <div class="flex items-center gap-2">
                        <div class="progress" style="width: 100px;">
                            <div class="progress-bar primary" style="width: ${value}%"></div>
                        </div>
                        <span class="text-sm">${value}%</span>
                    </div>
                `;
            default:
                return value;
        }
    },

    // Tabs
    tabs({ tabs, activeTab, onChange }) {
        return `
            <div class="tabs">
                ${tabs.map(tab => `
                    <button class="tab ${tab.id === activeTab ? 'active' : ''}" data-tab="${tab.id}">
                        ${tab.icon ? `<i data-lucide="${tab.icon}"></i>` : ''}
                        ${tab.label}
                    </button>
                `).join('')}
            </div>
        `;
    },

    // Empty state
    emptyState({ icon, title, message, action = null }) {
        return `
            <div class="empty-state">
                <div class="empty-icon">
                    <i data-lucide="${icon}"></i>
                </div>
                <h3>${title}</h3>
                <p>${message}</p>
                ${action ? `
                    <button class="btn btn-primary" data-action="${action.action}">
                        ${action.icon ? `<i data-lucide="${action.icon}"></i>` : ''}
                        ${action.label}
                    </button>
                ` : ''}
            </div>
        `;
    },

    // Search input
    searchInput({ placeholder = 'Buscar...', value = '', id = 'search' }) {
        return `
            <div class="input-with-icon">
                <i data-lucide="search" class="icon"></i>
                <input type="text" class="form-input" id="${id}" placeholder="${placeholder}" value="${value}">
            </div>
        `;
    },

    // Form input
    formInput({ label, name, type = 'text', value = '', placeholder = '', required = false, options = [], disabled = false }) {
        let input = '';
        const disabledAttr = disabled ? 'disabled' : '';

        if (type === 'select') {
            input = `
                <select class="form-select" name="${name}" id="${name}" ${required ? 'required' : ''} ${disabledAttr}>
                    <option value="">Seleccionar...</option>
                    ${options.map(opt => `
                        <option value="${opt.value}" ${opt.value == value ? 'selected' : ''}>${opt.label}</option>
                    `).join('')}
                </select>
            `;
        } else if (type === 'textarea') {
            input = `<textarea class="form-textarea" name="${name}" id="${name}" placeholder="${placeholder}" ${required ? 'required' : ''} ${disabledAttr}>${value}</textarea>`;
        } else {
            input = `<input type="${type}" class="form-input" name="${name}" id="${name}" value="${value}" placeholder="${placeholder}" ${required ? 'required' : ''} ${disabledAttr}>`;
        }

        return `
            <div class="form-group">
                <label class="form-label" for="${name}">${label}${required ? ' *' : ''}</label>
                ${input}
            </div>
        `;
    },

    // Dropdown menu
    dropdown({ trigger, items, align = 'right' }) {
        return `
            <div class="dropdown">
                ${trigger}
                <div class="dropdown-menu" style="${align === 'left' ? 'left: 0; right: auto;' : ''}">
                    ${items.map(item =>
            item.divider
                ? '<div class="dropdown-divider"></div>'
                : `
                                <div class="dropdown-item" data-action="${item.action || ''}">
                                    ${item.icon ? `<i data-lucide="${item.icon}"></i>` : ''}
                                    ${item.label}
                                </div>
                            `
        ).join('')}
                </div>
            </div>
        `;
    },

    // Badge
    badge(text, type = 'primary') {
        return `<span class="badge badge-${type}">${text}</span>`;
    },

    // Avatar
    avatar(name, size = '') {
        return `<div class="avatar ${size}">${Utils.getInitials(name)}</div>`;
    },

    // Progress bar
    progressBar(value, type = 'primary') {
        return `
            <div class="progress">
                <div class="progress-bar ${type}" style="width: ${value}%"></div>
            </div>
        `;
    },

    // Loader
    loader(size = '') {
        return `<div class="loader ${size}"></div>`;
    },

    // Card
    card({ title = '', actions = [], body, footer = '' }) {
        return `
            <div class="card">
                ${title || actions.length ? `
                    <div class="card-header">
                        <h3 class="card-title">${title}</h3>
                        ${actions.length ? `
                            <div class="flex gap-2">
                                ${actions.map(a => `
                                    <button class="btn btn-ghost btn-sm" data-action="${a.action}">
                                        ${a.icon ? `<i data-lucide="${a.icon}"></i>` : ''}
                                        ${a.label || ''}
                                    </button>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                ` : ''}
                <div class="card-body">${body}</div>
                ${footer ? `<div class="card-footer">${footer}</div>` : ''}
            </div>
        `;
    },

    // Label-Value pair (used in detail views)
    labelValue({ label, value }) {
        return `
            <div class="label-value">
                <div class="text-xs text-secondary uppercase tracking-wider mb-1">${label}</div>
                <div class="font-medium">${value ?? '-'}</div>
            </div>
        `;
    },

    // Tooltip
    tooltip(text, content) {
        return `<span class="tooltip-trigger" title="${text}">${content}</span>`;
    }
};

// Make it global
window.Components = Components;
