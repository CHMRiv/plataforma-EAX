/* ==========================================================================
   EAX Platform - Global Store (State Management)
   ========================================================================== */

const Store = {
    // Application State
    state: {
        currentModule: 'dashboard',
        currentView: null,
        sidebarCollapsed: false,
        user: {
            id: 1,
            name: 'EAX Admin',
            email: 'admin@eax.com',
            role: 'Administrador',
            avatar: null
        },
        notifications: [
            { id: 1, title: 'Nueva tarea asignada', message: 'Se te ha asignado la tarea "Revisar documentación"', time: '5 min', read: false },
            { id: 2, title: 'Reunión en 30 minutos', message: 'Reunión de equipo con el cliente ABC', time: '25 min', read: false },
            { id: 3, title: 'Cotización aprobada', message: 'La cotización #COT-2024-001 ha sido aprobada', time: '1 hora', read: false }
        ]
    },

    // Data stores for each module
    data: {
        // CRM Data
        clientes: [
            { id: 1, nombre: 'Empresa ABC S.A.', rut: '76.123.456-7', sector: 'Minería', contacto: 'Juan Pérez', email: 'jperez@abc.cl', telefono: '+56 9 1234 5678', estado: 'Activo', oportunidades: 3, valor: 15000000 },
            { id: 2, nombre: 'Industrias XYZ Ltda.', rut: '77.234.567-8', sector: 'Manufactura', contacto: 'María González', email: 'mgonzalez@xyz.cl', telefono: '+56 9 2345 6789', estado: 'Activo', oportunidades: 2, valor: 8500000 },
            { id: 3, nombre: 'Constructora Delta', rut: '78.345.678-9', sector: 'Construcción', contacto: 'Carlos Rodríguez', email: 'crodriguez@delta.cl', telefono: '+56 9 3456 7890', estado: 'Prospecto', oportunidades: 1, valor: 25000000 },
            { id: 4, nombre: 'Tech Solutions SpA', rut: '79.456.789-0', sector: 'Tecnología', contacto: 'Ana Martínez', email: 'amartinez@techsol.cl', telefono: '+56 9 4567 8901', estado: 'Activo', oportunidades: 4, valor: 12000000 },
            { id: 5, nombre: 'Agrícola Los Andes', rut: '80.567.890-1', sector: 'Agricultura', contacto: 'Pedro Soto', email: 'psoto@losandes.cl', telefono: '+56 9 5678 9012', estado: 'Inactivo', oportunidades: 0, valor: 0 }
        ],

        oportunidades: [
            { id: 1, titulo: 'Equipamiento Planta Norte', cliente: 'Empresa ABC S.A.', clienteId: 1, valor: 8500000, etapa: 'propuesta', probabilidad: 60, fechaCierre: '2024-02-15', responsable: 'Juan Pérez' },
            { id: 2, titulo: 'Modernización Línea 2', cliente: 'Industrias XYZ Ltda.', clienteId: 2, valor: 4500000, etapa: 'negociacion', probabilidad: 75, fechaCierre: '2024-01-30', responsable: 'María González' },
            { id: 3, titulo: 'Proyecto Expansión', cliente: 'Constructora Delta', clienteId: 3, valor: 25000000, etapa: 'calificacion', probabilidad: 30, fechaCierre: '2024-03-20', responsable: 'Carlos Rodríguez' },
            { id: 4, titulo: 'Renovación Equipos', cliente: 'Tech Solutions SpA', clienteId: 4, valor: 6000000, etapa: 'propuesta', probabilidad: 50, fechaCierre: '2024-02-28', responsable: 'Ana Martínez' },
            { id: 5, titulo: 'Mantenimiento Anual', cliente: 'Empresa ABC S.A.', clienteId: 1, valor: 3500000, etapa: 'ganada', probabilidad: 100, fechaCierre: '2024-01-10', responsable: 'Juan Pérez' }
        ],

        actividades: [
            { id: 1, tipo: 'llamada', titulo: 'Llamada seguimiento', cliente: 'Empresa ABC S.A.', fecha: '2024-01-20', hora: '10:00', completada: true },
            { id: 2, tipo: 'reunion', titulo: 'Presentación propuesta', cliente: 'Industrias XYZ Ltda.', fecha: '2024-01-22', hora: '15:00', completada: false },
            { id: 3, tipo: 'email', titulo: 'Envío cotización', cliente: 'Constructora Delta', fecha: '2024-01-21', hora: '09:00', completada: true }
        ],

        // Desarrollo - Proyectos y Tareas
        proyectos: [
            { id: 1, nombre: 'Desarrollo Web EAX', descripcion: 'Desarrollo de la plataforma empresarial', estado: 'En progreso', progreso: 65 },
            { id: 2, nombre: 'App Móvil Clientes', descripcion: 'Aplicación móvil para clientes', estado: 'Planificación', progreso: 15 },
            { id: 3, nombre: 'Integración API', descripcion: 'Integración con sistemas externos', estado: 'En progreso', progreso: 40 }
        ],

        carpetas: [
            { id: 1, nombre: 'Frontend', proyectoId: 1 },
            { id: 2, nombre: 'Backend', proyectoId: 1 },
            { id: 3, nombre: 'DevOps', proyectoId: 1 },
            { id: 4, nombre: 'Diseño UI/UX', proyectoId: 2 },
            { id: 5, nombre: 'Desarrollo Nativo', proyectoId: 2 }
        ],

        tareas: [
            { id: 1, titulo: 'Diseño de interfaz principal', proyecto: 'Desarrollo Web EAX', proyectoId: 1, carpetaId: 1, estado: 'done', prioridad: 'alta', asignado: 'Juan Pérez', fechaVencimiento: '2024-01-15', etiquetas: ['UI', 'Diseño'] },
            { id: 2, titulo: 'Implementar módulo CRM', proyecto: 'Desarrollo Web EAX', proyectoId: 1, carpetaId: 2, estado: 'in-progress', prioridad: 'alta', asignado: 'María González', fechaVencimiento: '2024-01-25', etiquetas: ['Backend', 'CRM'] },
            { id: 3, titulo: 'Testing de integración', proyecto: 'Desarrollo Web EAX', proyectoId: 1, carpetaId: 3, estado: 'todo', prioridad: 'media', asignado: 'Carlos Rodríguez', fechaVencimiento: '2024-02-01', etiquetas: ['Testing'] },
            { id: 4, titulo: 'Documentación API', proyecto: 'Integración API', proyectoId: 3, carpetaId: null, estado: 'in-progress', prioridad: 'media', asignado: 'Ana Martínez', fechaVencimiento: '2024-01-28', etiquetas: ['Docs'] },
            { id: 5, titulo: 'Diseño UX móvil', proyecto: 'App Móvil Clientes', proyectoId: 2, carpetaId: 4, estado: 'todo', prioridad: 'alta', asignado: 'Pedro Soto', fechaVencimiento: '2024-02-10', etiquetas: ['UX', 'Mobile'] },
            { id: 6, titulo: 'Configurar base de datos', proyecto: 'Desarrollo Web EAX', proyectoId: 1, carpetaId: 2, estado: 'done', prioridad: 'alta', asignado: 'Juan Pérez', fechaVencimiento: '2024-01-10', etiquetas: ['Backend', 'DB'] },
            { id: 7, titulo: 'Módulo de reportes', proyecto: 'Desarrollo Web EAX', proyectoId: 1, carpetaId: 1, estado: 'review', prioridad: 'media', asignado: 'María González', fechaVencimiento: '2024-01-30', etiquetas: ['Frontend', 'Reports'] }
        ],

        configuracion_inventario: {
            stockMinimoDefault: 5,
            colores: {
                tema: 'Azul Clásico'
            },
            categorias: ['Motores', 'Variadores', 'Controladores', 'Sensores', 'Contactores', 'Cables'],
            ubicaciones: ['A-01-01', 'A-02-03', 'B-01-02', 'C-03-01', 'A-03-02', 'D-01-01', 'Oficina', 'Taller', 'Bodega Central'],
            tiposProducto: ['Equipo', 'Repuesto', 'Insumo', 'Herramienta', 'Accesorio']
        },

        // Inventario
        productos: [
            {
                id: 1,
                nombre: 'Motor Eléctrico 5HP',
                sku: 'MOT-5HP-001',
                categoria: 'Motores',
                tipo: 'Equipo',
                stock: 15,
                stockMinimo: 5,
                precio: 450000,
                ubicacion: 'A-01-01',
                modelo: '1LE1',
                imagen: null,
                marca: 'Siemens'
            },
            {
                id: 2,
                nombre: 'Variador de Frecuencia 10HP',
                sku: 'VAR-10HP-002',
                categoria: 'Variadores',
                tipo: 'Equipo',
                stock: 8,
                stockMinimo: 3,
                precio: 850000,
                ubicacion: 'A-02-03',
                modelo: 'G120',
                imagen: null,
                marca: 'Siemens'
            },
            {
                id: 3,
                nombre: 'PLC Siemens S7-1200',
                sku: 'PLC-S7-003',
                categoria: 'Controladores',
                tipo: 'Equipo',
                stock: 12,
                stockMinimo: 4,
                precio: 1200000,
                ubicacion: 'B-01-02',
                modelo: 'CPU 1214C',
                imagen: null,
                marca: 'Siemens'
            },
            {
                id: 4,
                nombre: 'Sensor Fotoeléctrico',
                sku: 'SEN-FOT-004',
                categoria: 'Sensores',
                tipo: 'Repuesto',
                stock: 45,
                stockMinimo: 20,
                precio: 85000,
                ubicacion: 'C-03-01',
                modelo: 'W12-3',
                imagen: null,
                marca: 'Sick'
            },
            {
                id: 5,
                nombre: 'Contactor 40A',
                sku: 'CON-40A-005',
                categoria: 'Contactores',
                tipo: 'Insumo',
                stock: 2,
                stockMinimo: 10,
                precio: 65000,
                ubicacion: 'A-03-02',
                modelo: '3RT2',
                imagen: null,
                marca: 'Siemens'
            },
            {
                id: 6,
                nombre: 'Cable Control 18AWG',
                sku: 'CAB-18AWG-006',
                categoria: 'Cables',
                tipo: 'Insumo',
                stock: 500,
                stockMinimo: 100,
                precio: 1500,
                ubicacion: 'D-01-01',
                modelo: '5300UE',
                imagen: null,
                marca: 'Belden'
            },
            {
                id: 7,
                nombre: 'Pie de Metro',
                sku: 'PM-001',
                categoria: 'Mecánica',
                tipo: 'Herramienta',
                stock: 1,
                stockMinimo: 1,
                precio: 45000,
                ubicacion: 'Oficina',
                modelo: 'HVC01150',
                imagen: 'img/tools/caliper.png',
                marca: 'Ingco'
            },
            {
                id: 8,
                nombre: 'Guantes de Seguridad',
                sku: 'GS-A1',
                categoria: 'Seguridad',
                tipo: 'Accesorio',
                stock: 2,
                stockMinimo: 5,
                precio: 5000,
                ubicacion: 'Taller',
                modelo: '-',
                imagen: null,
                marca: '3M'
            }
        ],

        movimientos: [
            { id: 1, tipo: 'entrada', producto: 'Motor Eléctrico 5HP', cantidad: 10, fecha: '2024-01-15', referencia: 'OC-2024-001' },
            { id: 2, tipo: 'salida', producto: 'PLC Siemens S7-1200', cantidad: 2, fecha: '2024-01-18', referencia: 'VT-2024-005' },
            { id: 3, tipo: 'entrada', producto: 'Sensor Fotoeléctrico', cantidad: 30, fecha: '2024-01-20', referencia: 'OC-2024-003' },
            { id: 4, tipo: 'salida', producto: 'Contactor 40A', cantidad: 5, fecha: '2024-01-22', referencia: 'MANT-001' }
        ],

        // RRHH - Empleados
        empleados: [
            { id: 1, nombre: 'Juan Pérez', cargo: 'Gerente General', departamento: 'Dirección', email: 'jperez@eax.com', telefono: '+56 9 1111 2222', fechaIngreso: '2018-03-15', estado: 'Activo' },
            { id: 2, nombre: 'María González', cargo: 'Jefa de Ventas', departamento: 'Comercial', email: 'mgonzalez@eax.com', telefono: '+56 9 2222 3333', fechaIngreso: '2019-06-01', estado: 'Activo' },
            { id: 3, nombre: 'Carlos Rodríguez', cargo: 'Desarrollador Senior', departamento: 'TI', email: 'crodriguez@eax.com', telefono: '+56 9 3333 4444', fechaIngreso: '2020-01-10', estado: 'Activo' },
            { id: 4, nombre: 'Ana Martínez', cargo: 'Analista de RRHH', departamento: 'Recursos Humanos', email: 'amartinez@eax.com', telefono: '+56 9 4444 5555', fechaIngreso: '2021-02-20', estado: 'Activo' },
            { id: 5, nombre: 'Pedro Soto', cargo: 'Técnico de Campo', departamento: 'Operaciones', email: 'psoto@eax.com', telefono: '+56 9 5555 6666', fechaIngreso: '2022-08-15', estado: 'Activo' }
        ],

        // Licitaciones
        licitaciones: [
            { id: 1, titulo: 'Suministro Equipos Industriales', entidad: 'CODELCO', tipo: 'Pública', monto: 150000000, estado: 'En preparación', fechaApertura: '2024-02-01', fechaCierre: '2024-02-28' },
            { id: 2, titulo: 'Mantención Preventiva Anual', entidad: 'SQM', tipo: 'Privada', monto: 45000000, estado: 'Presentada', fechaApertura: '2024-01-15', fechaCierre: '2024-01-31' },
            { id: 3, titulo: 'Automatización Línea Producción', entidad: 'CAP Acero', tipo: 'Pública', monto: 280000000, estado: 'En evaluación', fechaApertura: '2024-01-05', fechaCierre: '2024-01-20' }
        ],

        // Cotizaciones
        cotizaciones: [
            { id: 1, numero: 'COT-2024-001', cliente: 'Empresa ABC S.A.', fecha: '2024-01-15', validez: '2024-02-15', total: 8500000, estado: 'Aprobada', items: 5 },
            { id: 2, numero: 'COT-2024-002', cliente: 'Industrias XYZ Ltda.', fecha: '2024-01-18', validez: '2024-02-18', total: 4500000, estado: 'Pendiente', items: 3 },
            { id: 3, numero: 'COT-2024-003', cliente: 'Constructora Delta', fecha: '2024-01-20', validez: '2024-02-20', total: 12000000, estado: 'En revisión', items: 8 }
        ],

        // Canvas
        canvasItems: {
            partners: ['Proveedores locales', 'Distribuidores autorizados', 'Socios tecnológicos'],
            activities: ['Venta de equipos', 'Servicio técnico', 'Capacitación'],
            resources: ['Equipo técnico especializado', 'Inventario de productos', 'Know-how técnico'],
            value: ['Soluciones integrales de automatización', 'Soporte técnico 24/7', 'Garantía extendida'],
            relationships: ['Atención personalizada', 'Seguimiento post-venta', 'Programa de fidelización'],
            channels: ['Venta directa', 'E-commerce', 'Distribuidores'],
            segments: ['Industria minera', 'Manufactura', 'Construcción'],
            costs: ['Personal', 'Inventario', 'Infraestructura', 'Marketing'],
            revenue: ['Venta de equipos', 'Servicios de mantención', 'Capacitaciones']
        },

        // Comunicaciones
        mensajes: [
            { id: 1, de: 'María González', para: 'Equipo Comercial', asunto: 'Actualización metas Q1', fecha: '2024-01-20 14:30', leido: true },
            { id: 2, de: 'Juan Pérez', para: 'Todos', asunto: 'Reunión general viernes', fecha: '2024-01-20 10:00', leido: false },
            { id: 3, de: 'Carlos Rodríguez', para: 'TI', asunto: 'Mantenimiento servidores', fecha: '2024-01-19 16:45', leido: true }
        ],

        anuncios: [
            { id: 1, titulo: 'Nuevos beneficios para empleados', contenido: 'A partir de febrero...', fecha: '2024-01-18', autor: 'RRHH' },
            { id: 2, titulo: 'Cierre por inventario', contenido: 'El día 31 de enero...', fecha: '2024-01-15', autor: 'Operaciones' }
        ]
    },

    // Event listeners
    listeners: {},

    // Subscribe to state changes
    subscribe(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    },

    // Emit events
    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    },

    // Get data
    get(collection) {
        return this.data[collection] || [];
    },

    // Add item
    add(collection, item) {
        if (!this.data[collection]) {
            this.data[collection] = [];
        }
        item.id = Date.now();
        this.data[collection].push(item);
        this.emit(`${collection}:added`, item);
        this.emit(`${collection}:changed`, this.data[collection]);
        return item;
    },

    // Update item
    update(collection, id, updates) {
        const items = this.data[collection];
        if (!items) return null;

        const index = items.findIndex(item => item.id === id);
        if (index === -1) return null;

        items[index] = { ...items[index], ...updates };
        this.emit(`${collection}:updated`, items[index]);
        this.emit(`${collection}:changed`, items);
        return items[index];
    },

    // Delete item
    delete(collection, id) {
        const items = this.data[collection];
        if (!items) return false;

        const index = items.findIndex(item => item.id === id);
        if (index === -1) return false;

        const deleted = items.splice(index, 1)[0];
        this.emit(`${collection}:deleted`, deleted);
        this.emit(`${collection}:changed`, items);
        return true;
    },

    // Find item
    find(collection, id) {
        const items = this.data[collection];
        if (!items) return null;
        return items.find(item => item.id === id);
    },

    // Filter items
    filter(collection, predicate) {
        const items = this.data[collection];
        if (!items) return [];
        return items.filter(predicate);
    }
};

// Make it global
window.Store = Store;
