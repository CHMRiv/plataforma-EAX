/* ==========================================================================
   Aura Platform - Global Store (State Management)
   ========================================================================== */

const Store = {
    // Application State
    state: {
        currentModule: 'dashboard',
        currentView: null,
        sidebarCollapsed: false,
        user: {
            id: 1,
            name: 'Aura Admin',
            email: 'admin@aura.com',
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
            {
                id: 1, nombre: 'Empresa ABC S.A.', rut: '76.123.456-7', sector: 'Minería',
                contacto: 'Juan Pérez', email: 'jperez@abc.cl', telefono: '+56 9 1234 5678',
                estado: 'Activo', oportunidades: 3, valor: 15000000,
                contactos: [
                    { id: 1, nombre: 'Juan Pérez', email: 'jperez@abc.cl', telefono: '+56 9 1234 5678', cargo: 'Gerente Comercial' },
                    { id: 2, nombre: 'Ricardo Soto', email: 'rsoto@abc.cl', telefono: '+56 9 8765 4321', cargo: 'Jefe de Compras' }
                ]
            },
            {
                id: 2, nombre: 'Industrias XYZ Ltda.', rut: '77.234.567-8', sector: 'Manufactura',
                contacto: 'María González', email: 'mgonzalez@xyz.cl', telefono: '+56 9 2345 6789',
                estado: 'Activo', oportunidades: 2, valor: 8500000,
                contactos: [
                    { id: 3, nombre: 'María González', email: 'mgonzalez@xyz.cl', telefono: '+56 9 2345 6789', cargo: 'Jefa de Ventas' }
                ]
            },
            {
                id: 3, nombre: 'Constructora Delta', rut: '78.345.678-9', sector: 'Construcción',
                contacto: 'Carlos Rodríguez', email: 'crodriguez@delta.cl', telefono: '+56 9 3456 7890',
                estado: 'Prospecto', oportunidades: 1, valor: 25000000,
                contactos: [
                    { id: 4, nombre: 'Carlos Rodríguez', email: 'crodriguez@delta.cl', telefono: '+56 9 3456 7890', cargo: 'Director de Proyectos' }
                ]
            },
            {
                id: 4, nombre: 'Tech Solutions SpA', rut: '79.456.789-0', sector: 'Tecnología',
                contacto: 'Ana Martínez', email: 'amartinez@techsol.cl', telefono: '+56 9 4567 8901',
                estado: 'Activo', oportunidades: 4, valor: 12000000,
                contactos: [
                    { id: 5, nombre: 'Ana Martínez', email: 'amartinez@techsol.cl', telefono: '+56 9 4567 8901', cargo: 'CEO' }
                ]
            },
            {
                id: 5, nombre: 'Agrícola Los Andes', rut: '80.567.890-1', sector: 'Agricultura',
                contacto: 'Pedro Soto', email: 'psoto@losandes.cl', telefono: '+56 9 5678 9012',
                estado: 'Inactivo', oportunidades: 0, valor: 0,
                contactos: []
            }
        ],

        proveedores: [
            {
                id: 1,
                nombre: 'PowerTech Global',
                razonSocial: 'PowerTech Global Corp',
                pais: 'China',
                rating: 'Alto',
                representacion: 'Representado en Chile',
                equipos: ['Generadores Diesel', 'Tableros de Transferencia'],
                certificaciones: ['ISO 9001:2015', 'IEC 60034'],
                contactos: [
                    { id: 1, nombre: 'Chen Wei', cargo: 'Gerente Comercial', email: 'cwei@powertech.cn', telefono: '+86 123 456 789' }
                ]
            },
            {
                id: 2,
                nombre: 'EcoEnergy Solutions',
                razonSocial: 'EcoEnergy Solutions GmbH',
                pais: 'Alemania',
                rating: 'Medio',
                representacion: 'En proceso de representación',
                equipos: ['Paneles Solares', 'Inversores'],
                certificaciones: ['TÜV Rheinland', 'CE'],
                contactos: [
                    { id: 2, nombre: 'Hans Müller', cargo: 'Sales Manager', email: 'h.mueller@ecoenergy.de', telefono: '+49 30 1234 5678' }
                ]
            },
            {
                id: 3,
                nombre: 'Local Components SpA',
                razonSocial: 'Local Components SpA',
                pais: 'Chile',
                rating: 'Bajo',
                representacion: 'No requiere representación',
                equipos: ['Gabinetes Eléctricos', 'Cableado'],
                certificaciones: ['SEC', 'ISO 14001'],
                contactos: [
                    { id: 3, nombre: 'Francisco Rojas', cargo: 'Director Técnico', email: 'frojas@localcomp.cl', telefono: '+56 2 2345 6789' }
                ]
            }
        ],

        oportunidades: [
            { id: 1, titulo: 'Equipamiento Planta Norte', cliente: 'Empresa ABC S.A.', clienteId: 1, valor: 8500000, etapa: 'propuesta', probabilidad: 60, fechaCierre: '2024-02-15', responsable: 'Juan Pérez' },
            { id: 2, titulo: 'Modernización Línea 2', cliente: 'Industrias XYZ Ltda.', clienteId: 2, valor: 4500000, etapa: 'negociacion', probabilidad: 75, fechaCierre: '2024-01-30', responsable: 'María González' },
            { id: 3, titulo: 'Proyecto Expansión', cliente: 'Constructora Delta', clienteId: 3, valor: 25000000, etapa: 'calificacion', probabilidad: 30, fechaCierre: '2024-03-20', responsable: 'Carlos Rodríguez' },
            { id: 4, titulo: 'Renovación Equipos', cliente: 'Tech Solutions SpA', clienteId: 4, valor: 6000000, etapa: 'propuesta', probabilidad: 50, fechaCierre: '2024-02-28', responsable: 'Ana Martínez' },
            { id: 5, titulo: 'Mantenimiento Anual', cliente: 'Empresa ABC S.A.', clienteId: 1, valor: 3500000, etapa: 'ganada', probabilidad: 100, fechaCierre: '2024-01-10', responsable: 'Juan Pérez' }
        ],

        actividades: [
            { id: 1, tipo: 'llamada', titulo: 'Llamada seguimiento', cliente: 'Empresa ABC S.A.', oportunidadId: 1, responsable: 'Juan Pérez', fecha: '2024-01-20', hora: '10:00', completada: true },
            { id: 2, tipo: 'reunion', titulo: 'Presentación propuesta', cliente: 'Industrias XYZ Ltda.', oportunidadId: 2, responsable: 'María González', fecha: '2024-01-22', hora: '15:00', completada: false },
            { id: 3, tipo: 'email', titulo: 'Envío cotización', cliente: 'Constructora Delta', oportunidadId: 3, responsable: 'María González', fecha: '2024-01-21', hora: '09:00', completada: true }
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
            { id: 1, titulo: 'Diseño de interfaz principal', proyecto: 'Desarrollo Web Aura', proyectoId: 1, carpetaId: 1, estado: 'done', prioridad: 'alta', asignado: 'Juan Pérez', fechaVencimiento: '2024-01-15', etiquetas: ['UI', 'Diseño'] },
            { id: 2, titulo: 'Implementar módulo CRM', proyecto: 'Desarrollo Web Aura', proyectoId: 1, carpetaId: 2, estado: 'in-progress', prioridad: 'alta', asignado: 'María González', fechaVencimiento: '2024-01-25', etiquetas: ['Backend', 'CRM'] },
            { id: 3, titulo: 'Testing de integración', proyecto: 'Desarrollo Web EAX', proyectoId: 1, carpetaId: 3, estado: 'todo', prioridad: 'media', asignado: 'Carlos Rodríguez', fechaVencimiento: '2024-02-01', etiquetas: ['Testing'] },
            { id: 4, titulo: 'Documentación API', proyecto: 'Integración API', proyectoId: 3, carpetaId: null, estado: 'in-progress', prioridad: 'media', asignado: 'Ana Martínez', fechaVencimiento: '2024-01-28', etiquetas: ['Docs'] },
            { id: 5, titulo: 'Diseño UX móvil', proyecto: 'App Móvil Clientes', proyectoId: 2, carpetaId: 4, estado: 'todo', prioridad: 'alta', asignado: 'Pedro Soto', fechaVencimiento: '2024-02-10', etiquetas: ['UX', 'Mobile'] },
            { id: 6, titulo: 'Configurar base de datos', proyecto: 'Desarrollo Web Aura', proyectoId: 1, carpetaId: 2, estado: 'done', prioridad: 'alta', asignado: 'Juan Pérez', fechaVencimiento: '2024-01-10', etiquetas: ['Backend', 'DB'] },
            { id: 7, titulo: 'Módulo de reportes', proyecto: 'Desarrollo Web Aura', proyectoId: 1, carpetaId: 1, estado: 'review', prioridad: 'media', asignado: 'María González', fechaVencimiento: '2024-01-30', etiquetas: ['Frontend', 'Reports'] }
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
                nombreComercial: 'Motor Trifásico Industrial 5HP',
                sku: 'MOT-5HP-001',
                categoria: 'Motores',
                tipo: 'Equipo',
                familia: 'Motores Eléctricos',
                linea: 'Industrial',
                cicloVida: 'Activo',
                procedencia: 'Alemania',
                stock: 15,
                stockMinimo: 5,
                precioCompra: 280000,
                precioVenta: 450000,
                precio: 450000,
                ubicacion: 'A-01-01',
                modelo: '1LE1',
                imagen: null,
                marca: 'Siemens',
                descripcionComercial: 'Motor trifásico de alta eficiencia para aplicaciones industriales. Diseño robusto y confiable con protección IP55.',
                ventajas: ['Alta eficiencia energética IE3', 'Bajo nivel de ruido', 'Mantenimiento mínimo', 'Diseño compacto'],
                beneficios: ['Reduce costos operativos hasta un 15%', 'Mayor vida útil del equipo', 'Compatible con variadores de frecuencia'],
                especificaciones: [
                    {
                        categoria: 'Datos Eléctricos', items: [
                            { key: 'Potencia', value: '5 HP (3.7 kW)' },
                            { key: 'Voltaje', value: '380/400V' },
                            { key: 'Frecuencia', value: '50/60 Hz' },
                            { key: 'RPM', value: '1450' }
                        ]
                    },
                    {
                        categoria: 'Datos Mecánicos', items: [
                            { key: 'Frame', value: '112M' },
                            { key: 'IP', value: 'IP55' },
                            { key: 'Peso', value: '28 kg' }
                        ]
                    }
                ],
                certificaciones: [
                    { nombre: 'Certificado CE' },
                    { nombre: 'IEC 60034-1' }
                ],
                marketing: {
                    fab_ficha: { checked: true, url: 'https://support.industry.siemens.com/ds/1LE1-ficha.pdf' },
                    fab_catalogo: { checked: true, url: 'https://siemens.com/catalogo-motores-2024.pdf' },
                    mkt_img_principal: { checked: true, url: 'https://api.eax-platform.com/assets/products/motor-siemens-main.jpg' },
                    mkt_video_eax: { checked: false, url: '' },
                    mkt_web: { checked: true, url: 'https://eax.cl/p/motor-siemens-5hp' }
                },
                pim_postventa: {
                    manual_operacion: { checked: true, notRequired: false, url: 'https://manuales.eax.cl/siemens-1le1-op.pdf' },
                    instructivos_montaje: { checked: true, notRequired: false, url: 'https://manuales.eax.cl/siemens-1le1-inst.pdf' },
                    programa_mantencion: { checked: false, notRequired: false, url: '' },
                    costos_operacion: { checked: false, notRequired: true, url: '' },
                    manual_capacitacion: { checked: false, notRequired: false, url: '' },
                    catalogo_repuestos: { checked: true, notRequired: false, url: 'https://manuales.eax.cl/siemens-1le1-parts.pdf' },
                    fichas_despiece: { checked: false, notRequired: false, url: '' }
                }
            },
            {
                id: 2,
                nombre: 'Variador de Frecuencia 10HP',
                nombreComercial: 'Variador de Frecuencia G120 10HP',
                sku: 'VAR-10HP-002',
                categoria: 'Variadores',
                tipo: 'Equipo',
                familia: 'Drives & Variadores',
                linea: 'Automatización',
                cicloVida: 'Activo',
                procedencia: 'Alemania',
                stock: 8,
                stockMinimo: 3,
                precioCompra: 520000,
                precioVenta: 850000,
                precio: 850000,
                ubicacion: 'A-02-03',
                modelo: 'G120',
                imagen: null,
                marca: 'Siemens',
                descripcionComercial: 'Variador de frecuencia modular para control preciso de motores. Ideal para aplicaciones de bombeo, ventilación y transporte.',
                ventajas: ['Control vectorial sin sensor', 'Comunicación PROFINET integrada', 'Funciones de seguridad STO'],
                beneficios: ['Ahorro energético de hasta 30%', 'Puesta en marcha rápida', 'Menor desgaste mecánico'],
                especificaciones: [
                    {
                        categoria: 'Datos Eléctricos', items: [
                            { key: 'Potencia', value: '10 HP (7.5 kW)' },
                            { key: 'Entrada', value: '380-480V 3F' },
                            { key: 'Frecuencia Salida', value: '0-550 Hz' }
                        ]
                    }
                ],
                certificaciones: [
                    { nombre: 'Certificado CE' },
                    { nombre: 'UL Listed' }
                ],
                marketing: {
                    fab_ficha: { checked: true, url: 'https://support.industry.siemens.com/ds/G120-ficha.pdf' },
                    mkt_img_principal: { checked: true, url: 'https://api.eax-platform.com/assets/products/g120-main.jpg' },
                    mkt_video_eax: { checked: true, url: 'https://youtube.com/eax-g120-demo' },
                    mkt_ficha: { checked: true, url: 'https://eax.cl/p/g120-tecnico.pdf' }
                }
            },
            {
                id: 3,
                nombre: 'PLC Siemens S7-1200',
                nombreComercial: 'Controlador Lógico S7-1200 CPU 1214C',
                sku: 'PLC-S7-003',
                categoria: 'Controladores',
                tipo: 'Equipo',
                familia: 'Controladores PLC',
                linea: 'Automatización',
                cicloVida: 'Activo',
                procedencia: 'Alemania',
                stock: 12,
                stockMinimo: 4,
                precioCompra: 750000,
                precioVenta: 1200000,
                precio: 1200000,
                ubicacion: 'B-01-02',
                modelo: 'CPU 1214C',
                imagen: null,
                marca: 'Siemens',
                descripcionComercial: 'Controlador compacto de alto rendimiento para automatización industrial. Incluye entradas/salidas integradas y comunicación PROFINET.',
                ventajas: ['14 DI / 10 DO / 2 AI integradas', 'Puerto PROFINET', 'Servidor Web integrado'],
                beneficios: ['Programación intuitiva con TIA Portal', 'Escalable con módulos de señal', 'Ideal para máquinas pequeñas y medianas'],
                especificaciones: [
                    {
                        categoria: 'CPU', items: [
                            { key: 'Memoria de Trabajo', value: '100 KB' },
                            { key: 'Entradas Digitales', value: '14' },
                            { key: 'Salidas Digitales', value: '10' },
                            { key: 'Entradas Analógicas', value: '2' }
                        ]
                    }
                ],
                certificaciones: [
                    { nombre: 'Certificado CE' },
                    { nombre: 'IEC 61131-2' }
                ],
                marketing: {
                    fab_ficha: { checked: true, url: 'https://support.industry.siemens.com/ds/S7-1200-ficha.pdf' },
                    fab_catalogo: { checked: true, url: 'https://siemens.com/catalogo-automatizacion.pdf' },
                    mkt_img_principal: { checked: true, url: 'https://api.eax-platform.com/assets/products/s7-1200-main.jpg' }
                }
            },
            {
                id: 4,
                nombre: 'Sensor Fotoeléctrico',
                nombreComercial: 'Sensor Fotoeléctrico W12-3',
                sku: 'SEN-FOT-004',
                categoria: 'Sensores',
                tipo: 'Repuesto',
                familia: 'Sensores Ópticos',
                linea: 'Detección',
                cicloVida: 'Activo',
                procedencia: 'Alemania',
                stock: 45,
                stockMinimo: 20,
                precioCompra: 52000,
                precioVenta: 85000,
                precio: 85000,
                ubicacion: 'C-03-01',
                modelo: 'W12-3',
                imagen: null,
                marca: 'Sick',
                descripcionComercial: 'Sensor fotoeléctrico compacto con alta precisión de detección. Carcasa robusta IP67.',
                ventajas: ['IP67', 'Alta velocidad de respuesta', 'LED visible para alineación'],
                beneficios: ['Fácil instalación', 'Resistente a entornos industriales'],
                especificaciones: [
                    {
                        categoria: 'Datos Técnicos', items: [
                            { key: 'Alcance', value: '0-2000 mm' },
                            { key: 'Tipo', value: 'Reflexión directa' },
                            { key: 'Conexión', value: 'M12, 4 pines' }
                        ]
                    }
                ],
                certificaciones: [
                    { nombre: 'Certificado CE' }
                ]
            },
            {
                id: 5,
                nombre: 'Contactor 40A',
                sku: 'CON-40A-005',
                categoria: 'Contactores',
                tipo: 'Insumo',
                stock: 2,
                stockMinimo: 10,
                precioCompra: 38000,
                precioVenta: 65000,
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
                precioCompra: 900,
                precioVenta: 1500,
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
                precioCompra: 28000,
                precioVenta: 45000,
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
                precioCompra: 3000,
                precioVenta: 5000,
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
            { id: 1, nombre: 'Juan Pérez', cargo: 'Gerente General', departamento: 'Dirección', email: 'jperez@aura.com', telefono: '+56 9 1111 2222', fechaIngreso: '2018-03-15', estado: 'Activo', nivelHierarquico: '1' },
            { id: 2, nombre: 'María González', cargo: 'Jefa de Ventas', departamento: 'Comercial', email: 'mgonzalez@aura.com', telefono: '+56 9 2222 3333', fechaIngreso: '2019-06-01', estado: 'Activo', nivelHierarquico: '2' },
            { id: 3, nombre: 'Carlos Rodríguez', cargo: 'Desarrollador Senior', departamento: 'TI', email: 'crodriguez@aura.com', telefono: '+56 9 3333 4444', fechaIngreso: '2020-01-10', estado: 'Activo', nivelHierarquico: '2' },
            { id: 4, nombre: 'Ana Martínez', cargo: 'Analista de RRHH', departamento: 'Recursos Humanos', email: 'amartinez@aura.com', telefono: '+56 9 4444 5555', fechaIngreso: '2021-02-20', estado: 'Activo', nivelHierarquico: '2' },
            { id: 5, nombre: 'Pedro Soto', cargo: 'Técnico de Campo', departamento: 'Operaciones', email: 'psoto@aura.com', telefono: '+56 9 5555 6666', fechaIngreso: '2022-08-15', estado: 'Activo', nivelHierarquico: '3' }
        ],

        // Ventas Públicas (Licitaciones + Compras Ágiles)
        ventasPublicas: [
            { id: 1, titulo: 'Suministro Equipos Industriales', entidad: 'CODELCO', modalidad: 'Licitación', tipo: 'Pública', monto: 150000000, estado: 'En preparación', fechaApertura: '2024-02-01', fechaCierre: '2024-02-28', idPortal: 'LIC-2024-001', negocioId: 1 },
            { id: 2, titulo: 'Mantención Preventiva Anual', entidad: 'SQM', modalidad: 'Licitación', tipo: 'Privada', monto: 45000000, estado: 'Presentada', fechaApertura: '2024-01-15', fechaCierre: '2024-01-31', idPortal: 'LIC-2024-002', negocioId: null },
            { id: 3, titulo: 'Automatización Línea Producción', entidad: 'CAP Acero', modalidad: 'Licitación', tipo: 'Pública', monto: 280000000, estado: 'En evaluación', fechaApertura: '2024-01-05', fechaCierre: '2024-01-20', idPortal: 'LIC-2024-003', negocioId: 3 },
            { id: 4, titulo: 'Adquisición Sensores Industriales', entidad: 'Ministerio de Obras Públicas', modalidad: 'Compra Ágil', monto: 12000000, estado: 'Enviada', fechaApertura: '2024-02-10', fechaCierre: '2024-02-17', idPortal: '4502-15-LE24', plataforma: 'Mercado Público', negocioId: null },
            { id: 5, titulo: 'Repuestos Variadores de Frecuencia', entidad: 'Hospital Santiago', modalidad: 'Compra Ágil', monto: 8500000, estado: 'Adjudicada', fechaApertura: '2024-01-20', fechaCierre: '2024-01-25', idPortal: '2239-8-CM24', plataforma: 'Mercado Público', negocioId: 5 },
            { id: 6, titulo: 'Cables y Conectores para Red Eléctrica', entidad: 'Municipalidad de Las Condes', modalidad: 'Compra Ágil', monto: 3200000, estado: 'Identificada', fechaApertura: '2024-02-15', fechaCierre: '2024-02-22', idPortal: '3801-22-LE24', plataforma: 'ChileCompra', negocioId: null }
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
        ],

        // CRM Comunicaciones (Bandeja de Entrada)
        crm_mensajes: [
            {
                id: 1,
                clienteId: 1,
                negocioId: 1,
                de: 'Juan Pérez (Empresa ABC)',
                email: 'jperez@abc.cl',
                asunto: 'Consulta sobre presupuesto Planta Norte',
                cuerpo: 'Estimados, recibimos la propuesta. Quisiéramos agendar una reunión para revisar los detalles técnicos y los plazos de entrega.',
                fecha: '2024-02-18 09:30',
                leido: false,
                tipo: 'entrada'
            },
            {
                id: 2,
                clienteId: 2,
                negocioId: 2,
                de: 'María González (Industrias XYZ)',
                email: 'mgonzalez@xyz.cl',
                asunto: 'Confirmación de especificaciones',
                cuerpo: 'Adjunto las especificaciones finales de los motores que conversamos ayer.',
                fecha: '2024-02-18 11:45',
                leido: true,
                tipo: 'entrada'
            },
            {
                id: 3,
                clienteId: 1,
                negocioId: 1,
                de: 'Admin Aura',
                email: 'ventas@aura.com',
                asunto: 'Re: Consulta sobre presupuesto Planta Norte',
                cuerpo: 'Hola Juan, por supuesto. ¿Te parece bien el jueves a las 15:00?',
                fecha: '2024-02-18 14:20',
                leido: true,
                tipo: 'salida'
            }
        ],

        // Postventa y Servicios
        servicios: {
            metrics: {
                ticketsAbiertos: 2,
                tiempoPromedio: '4.5h',
                satisfaccion: '5.0/5.0',
                tasaFalta: '3.2%'
            },
            tickets: [
                {
                    id: 1001,
                    idDisplay: '#1001',
                    asunto: 'Falla en Trituradora Eliet',
                    fecha: '2025-05-11 10:00',
                    cliente: 'Minera Escondida',
                    clienteId: 1,
                    estado: 'En Proceso',
                    prioridad: 'Alta',
                    asignado: 'Juan Mora',
                    descripcion: 'El equipo se detiene tras 15 min de uso.',
                    historial: [
                        { fecha: '2025-05-10 09:00', responsable: 'Admin', tipo: 'Creado', mensaje: 'Ingreso inicial por llamada telefónica.' },
                        { fecha: '2025-05-10 14:00', responsable: 'Juan Mora', tipo: 'Cambio Estado', mensaje: 'Asignado a técnico. En revisión.' }
                    ]
                },
                {
                    id: 1002,
                    idDisplay: '#1002',
                    asunto: 'Mantenimiento Preventivo 500h',
                    fecha: '2025-05-12 08:30',
                    cliente: 'Hospital Regional',
                    clienteId: 2,
                    estado: 'Abierto',
                    prioridad: 'Media',
                    asignado: 'Sin Asignar',
                    descripcion: 'Mantenimiento programado según contrato de servicios semestral.',
                    historial: [
                        { fecha: '2025-05-11 16:30', responsable: 'Admin', tipo: 'Creado', mensaje: 'Ticket generado automáticamente por sistema de mantenimiento.' }
                    ]
                },
                {
                    id: 998,
                    idDisplay: '#998',
                    asunto: 'Consulta Garantia Inversor',
                    fecha: '2025-04-22 15:00',
                    cliente: 'Constructora del Sur',
                    clienteId: 3,
                    estado: 'Cerrado',
                    prioridad: 'Baja',
                    asignado: 'Maria Soto',
                    descripcion: 'Cliente consulta por vigencia de garantía de inversor trifásico.',
                    historial: [
                        { fecha: '2025-04-22 15:00', responsable: 'Admin', tipo: 'Creado', mensaje: 'Consulta ingresada vía web.' },
                        { fecha: '2025-04-23 11:00', responsable: 'Maria Soto', tipo: 'Resuelto', mensaje: 'Se informa al cliente que equipo cuenta con garantía vigente hasta Dic 2025.' }
                    ]
                }
            ],
            garantias: [
                {
                    id: 1,
                    equipo: 'Motor Trifásico 5HP',
                    sku: 'MOT-5HP-001',
                    cliente: 'Minera Escondida',
                    fechaActivacion: '2024-05-10',
                    periodo: 24, // meses
                    vencimiento: '2026-05-10',
                    documento: 'acta_garantia_MOT001.pdf',
                    estado: 'Vigente'
                },
                {
                    id: 2,
                    equipo: 'Variador de Frecuencia G120',
                    sku: 'VAR-10HP-002',
                    cliente: 'Hospital Regional',
                    fechaActivacion: '2023-01-20',
                    periodo: 12,
                    vencimiento: '2024-01-20',
                    documento: 'acta_garantia_VAR002.pdf',
                    estado: 'Caducada'
                }
            ]
        }
    },

    // Event listeners
    listeners: {},
    _nextId: 10000,

    // Initialize ID counter from existing data
    _initIdCounter() {
        let maxId = 0;
        Object.values(this.data).forEach(collection => {
            if (Array.isArray(collection)) {
                collection.forEach(item => { if (item.id > maxId) maxId = item.id; });
            }
        });
        this._nextId = maxId + 1;
    },

    // Subscribe to events
    on(event, callback) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(callback);
    },

    // Emit event
    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    },

    // Get data
    get(collection) {
        return this.data[collection] || [];
    },

    // Set data (generic)
    set(key, value) {
        this.data[key] = value;
        this.emit(`${key}:changed`, value);
    },

    // Add item
    add(collection, item) {
        if (!this.data[collection]) {
            this.data[collection] = [];
        }
        item.id = this._nextId++;
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
    },

    // Notifications helper
    notify(title, message, type = 'info') {
        const notification = {
            id: Date.now(),
            title,
            message,
            type,
            time: 'Ahora',
            read: false
        };
        this.state.notifications.unshift(notification);
        this.emit('notifications:added', notification);
        this.emit('notifications:changed', this.state.notifications);

        // Also trigger a toast for immediate feedback
        if (window.Components && Components.toast) {
            Components.toast(title, type);
        }

        return notification;
    }
};

// Make it global
window.Store = Store;
