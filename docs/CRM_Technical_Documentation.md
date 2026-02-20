# Documentación Técnica: Módulo CRM (Aura Platform)

## 1. Descripción General
El módulo de CRM (Customer Relationship Management) es el núcleo de gestión de relaciones con clientes y oportunidades de negocio de la Aura Platform. Permite centralizar la información de empresas, contactos, hitos comerciales y comunicaciones en una interfaz unificada y altamente interactiva.

## 2. Estructura de Navegación (Tabs)
El módulo se organiza en cuatro sub-vistas principales:
- **Clientes**: Gestión del directorio de empresas y vista 360°.
- **Negocios**: Tablero Kanban para el seguimiento del pipeline de ventas.
- **Bandeja de Entrada**: Centro de comunicaciones para gestionar correos y vincularlos a negocios.
- **Actividades**: Agenda y registro de interacciones (llamadas, reuniones, tareas).

---

## 3. Lógica por Submódulo

### 3.1. Clientes
- **Data Source**: `Store.get('clientes')`.
- **Funcionalidades**:
    - Listado con filtros por estado (Activo, Prospecto, Inactivo) y búsqueda global.
    - **Expediente 360°**: Modal complejo que integra:
        - **Información General**: Resumen ejecutivo y gestión de contactos múltiples por empresa.
        - **Negocios**: Historial linkeado de oportunidades comerciales.
        - **Ventas Públicas**: Licitaciones y Compras Ágiles asociadas (módulo Licitaciones).
        - **Postventa**: Visualización de tickets de soporte técnico (módulo Servicios).

### 3.2. Negocios (Oportunidades)
- **Data Source**: `Store.get('oportunidades')`.
- **Workflow**: Pipeline basado en un **Kanban Board** con cinco etapas:
    1. *Calificación*: Prospección inicial.
    2. *Propuesta*: Envío de cotización.
    3. *Negociación*: Ajustes finales.
    4. *Ganada*: Cierre exitoso.
    5. *Perdida*: Negocio fallido.
- **Interacciones**: Soporta **Drag & Drop** para cambio de etapa con persistencia en el Store.
- **Detalle de Negocio**: Vista estilo "HubSpot" con timeline de actividades y correos vinculados, probabilidad de cierre y monto total.

### 3.3. Bandeja de Entrada (Inbox)
- **Data Source**: `Store.get('crm_mensajes')`.
- **Lógica**: 
    - Renderiza una vista de dos columnas (lista de mensajes y visualizador).
    - Permite la **vinculación dinámica** de un correo electrónico con un negocio (oportunidad) existente. Esto actualiza el campo `negocioId` en el objeto del mensaje.

### 3.4. Actividades
- **Logic**: Combina un listado de tareas con un **Widget de Calendario** personalizado.
- **Eventos**: Permite registrar llamadas, reuniones y correos, definiendo responsables y resultados.
- **Estatus**: Diferenciación visual entre actividades pendientes y realizadas.

---

## 4. Entidades y Modelos de Datos (Store)

### Cliente
```json
{
  "id": number,
  "nombre": string,
  "rut": string,
  "sector": string,
  "contacto": string,
  "email": string,
  "telefono": string,
  "estado": "Activo" | "Prospecto" | "Inactivo",
  "oportunidades": number,
  "valor": number,
  "contactos": [ { "id": number, "nombre": string, "cargo": string, "email": string, "telefono": string } ]
}
```

### Oportunidad (Negocio)
```json
{
  "id": number,
  "titulo": string,
  "clienteId": number,
  "cliente": string,
  "valor": number,
  "probabilidad": number,
  "etapa": "calificacion" | "propuesta" | "negociacion" | "ganada" | "perdida",
  "fechaCierre": string,
  "responsable": string
}
```

### Actividad
```json
{
  "id": number,
  "tipo": "llamada" | "reunion" | "email",
  "titulo": string,
  "cliente": string,
  "oportunidadId": number | null,
  "responsable": string,
  "fecha": string,
  "hora": string,
  "completada": boolean,
  "resultado": string
}
```

---

## 5. Integraciones Críticas
- **Router**: El módulo se registra bajo el path `#/crm`.
- **Store**: Dependencia total para la reactividad de datos.
- **Components**: Uso intensivo de `Components.modal`, `Components.dataTable` y `Components.formInput`.
- **Utils**: Formateo de moneda, fechas relativas y validaciones de búsqueda.

## 6. Objetivos de la Nueva Generación (V6)
1. **Limpieza de Código**: Eliminar remanentes de "Inbox" obsoletos y asegurar que la definición del objeto sea robusta (Global scope).
2. **Arquitectura Modular**: Separar las funciones de renderizado de los controladores de eventos para mayor mantenibilidad.
3. **UI/UX Premium**: Mejorar las transiciones del Kanban y el diseño de la vista 360 del cliente.
4. **Relaciones Reforzadas**: Asegurar que la vinculación con el módulo Comercial (Cotizaciones) sea bidireccional.
