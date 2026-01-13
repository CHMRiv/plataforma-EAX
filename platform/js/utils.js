/* ==========================================================================
   EAX Platform - Utility Functions
   ========================================================================== */

const Utils = {
    // Format currency (CLP)
    formatCurrency(value) {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0
        }).format(value);
    },

    // Format number with thousand separators
    formatNumber(value) {
        return new Intl.NumberFormat('es-CL').format(value);
    },

    // Format date
    formatDate(date, format = 'short') {
        const d = new Date(date);
        const options = format === 'long'
            ? { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
            : { year: 'numeric', month: '2-digit', day: '2-digit' };
        return d.toLocaleDateString('es-CL', options);
    },

    // Format time
    formatTime(date) {
        return new Date(date).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
    },

    // Format relative time
    formatRelativeTime(date) {
        const now = new Date();
        const d = new Date(date);
        const diff = now - d;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Ahora';
        if (minutes < 60) return `Hace ${minutes} min`;
        if (hours < 24) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
        if (days < 7) return `Hace ${days} día${days > 1 ? 's' : ''}`;
        return this.formatDate(date);
    },

    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle function
    throttle(func, limit) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Get initials from name
    getInitials(name) {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    },

    // Slugify text
    slugify(text) {
        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    },

    // Truncate text
    truncate(text, length = 50) {
        if (text.length <= length) return text;
        return text.substring(0, length) + '...';
    },

    // Deep clone object
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    // Check if object is empty
    isEmpty(obj) {
        if (!obj) return true;
        if (Array.isArray(obj)) return obj.length === 0;
        if (typeof obj === 'object') return Object.keys(obj).length === 0;
        return false;
    },

    // Group array by key
    groupBy(array, key) {
        return array.reduce((groups, item) => {
            const group = item[key];
            groups[group] = groups[group] || [];
            groups[group].push(item);
            return groups;
        }, {});
    },

    // Sort array by key
    sortBy(array, key, order = 'asc') {
        return [...array].sort((a, b) => {
            if (a[key] < b[key]) return order === 'asc' ? -1 : 1;
            if (a[key] > b[key]) return order === 'asc' ? 1 : -1;
            return 0;
        });
    },

    // Filter array by search term
    search(array, term, keys) {
        const searchTerm = term.toLowerCase();
        return array.filter(item =>
            keys.some(key =>
                String(item[key]).toLowerCase().includes(searchTerm)
            )
        );
    },

    // Calculate percentage
    percentage(value, total) {
        if (total === 0) return 0;
        return Math.round((value / total) * 100);
    },

    // Get status color
    getStatusColor(status) {
        const colors = {
            'activo': 'success',
            'active': 'success',
            'ganada': 'success',
            'completada': 'success',
            'done': 'success',
            'aprobada': 'success',
            'en progreso': 'primary',
            'in-progress': 'primary',
            'pendiente': 'warning',
            'todo': 'warning',
            'en revisión': 'warning',
            'review': 'warning',
            'inactivo': 'secondary',
            'perdida': 'error',
            'rechazada': 'error',
            'cancelada': 'error',
            'traslado': 'info',
            'transferencia': 'info'
        };
        return colors[status.toLowerCase()] || 'secondary';
    },

    // Get priority color
    getPriorityColor(priority) {
        const colors = {
            'alta': 'error',
            'high': 'error',
            'media': 'warning',
            'medium': 'warning',
            'baja': 'success',
            'low': 'success'
        };
        return colors[priority.toLowerCase()] || 'secondary';
    },

    // Download as JSON
    downloadJSON(data, filename) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    },

    // Download as CSV
    downloadCSV(data, filename) {
        if (data.length === 0) return;

        const headers = Object.keys(data[0]);
        const csv = [
            headers.join(','),
            ...data.map(row =>
                headers.map(header => {
                    const value = row[header];
                    return typeof value === 'string' && value.includes(',')
                        ? `"${value}"`
                        : value;
                }).join(',')
            )
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    },

    // Local storage helpers
    storage: {
        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch {
                return defaultValue;
            }
        },
        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
            } catch (e) {
                console.error('Error saving to localStorage:', e);
            }
        },
        remove(key) {
            localStorage.removeItem(key);
        }
    },

    // DOM helpers
    dom: {
        $(selector) {
            return document.querySelector(selector);
        },
        $$(selector) {
            return document.querySelectorAll(selector);
        },
        create(tag, attrs = {}, children = []) {
            const el = document.createElement(tag);
            Object.entries(attrs).forEach(([key, value]) => {
                if (key === 'className') el.className = value;
                else if (key === 'innerHTML') el.innerHTML = value;
                else if (key === 'textContent') el.textContent = value;
                else if (key.startsWith('on')) el.addEventListener(key.slice(2).toLowerCase(), value);
                else if (key === 'dataset') Object.assign(el.dataset, value);
                else el.setAttribute(key, value);
            });
            children.forEach(child => {
                if (typeof child === 'string') el.appendChild(document.createTextNode(child));
                else el.appendChild(child);
            });
            return el;
        }
    }
};

// Make it global
window.Utils = Utils;
