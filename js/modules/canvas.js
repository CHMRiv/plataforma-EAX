/* ==========================================================================
   EAX Platform - Canvas Module (Milanote-style)
   ========================================================================== */

const CanvasModule = {
    // Local state for the canvas interactions
    state: {
        scale: 1,
        panX: 0,
        panY: 0,
        isPanning: false,
        isDraggingItem: false,
        isResizing: false,
        selectedIds: [],
        dragStart: { x: 0, y: 0 },
        dragItemStart: { x: 0, y: 0 }, // Initial position of item being moved
        activeTool: null, // For toolbar drag
        resizeHandle: null,
        lastMouse: { x: 0, y: 0 }
    },

    render() {
        // Initialize data storage if not exists or if it's the old format (object instead of array)
        if (!Store.data.canvasItems || !Array.isArray(Store.data.canvasItems)) {
            // Migration / Reset to new object structure or array of objects
            Store.data.canvasItems = [
                { id: 'welcome-note', type: 'note', x: 400, y: 300, width: 250, height: 180, content: '👋 <b>¡Bienvenido al nuevo Canvas!</b><br><br>Este es un espacio infinito.<br>Arrastra notas, tareas, imágenes o tableros desde la barra izquierda.', style: { color: 'yellow' } },
                { id: 'todo-demo', type: 'todo', x: 700, y: 300, width: 240, height: 200, content: { title: 'Por hacer', items: [{ text: 'Probar el drag & drop', checked: true }, { text: 'Editar texto (doble click)', checked: false }, { text: 'Mover elementos', checked: false }] } },
                { id: 'image-demo', type: 'image', x: 400, y: 550, width: 250, height: 250, content: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=1000&auto=format&fit=crop' }
            ];
        }

        const content = document.getElementById('page-content');

        content.innerHTML = `
            <div class="animate-fadeIn" style="height: 100%; display: flex; flex-direction: column;">
                ${Components.pageHeader({
            title: 'Canvas Infinito',
            subtitle: 'Diseña libremente tu espacio de trabajo',
            actions: [
                { label: 'Limpiar Todo', icon: 'trash-2', class: 'btn-outline', action: 'clear-canvas' },
                { label: 'Exportar', icon: 'download', class: 'btn-primary', action: 'export-canvas' }
            ]
        })}
                
                <div class="canvas-container" id="canvas-container">
                    <!-- Toolbar -->
                    <div class="canvas-toolbar">
                        <div class="canvas-tool" draggable="true" data-type="note">
                            <i data-lucide="sticky-note"></i>
                            <span>Nota</span>
                        </div>
                        <div class="canvas-tool" draggable="true" data-type="todo">
                            <i data-lucide="check-square"></i>
                            <span>To-do</span>
                        </div>
                        <div class="canvas-tool" draggable="true" data-type="image">
                            <i data-lucide="image"></i>
                            <span>Imagen</span>
                        </div>
                        <div class="canvas-tool" draggable="true" data-type="board">
                            <i data-lucide="layout-dashboard"></i>
                            <span>Board</span>
                        </div>
                        <div style="height: 1px; width: 60%; background: #eee; margin: 8px 0;"></div>
                        <div class="canvas-tool" onclick="CanvasModule.resetView()">
                            <i data-lucide="crosshair"></i>
                            <span>Centrar</span>
                        </div>
                    </div>

                    <!-- Viewport -->
                    <div class="canvas-viewport" id="canvas-viewport">
                        <div class="canvas-world" id="canvas-world">
                            <!-- Items will be injected here -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });

        this.renderItems();
        this.attachEvents();

        // Center initial view roughly
        this.state.panX = -200;
        this.state.panY = -200;
        this.updateTransform();
    },

    renderItems() {
        const world = document.getElementById('canvas-world');
        if (!world) return;

        const itemsHtml = Store.data.canvasItems.map(item => this.createItemHTML(item)).join('');
        world.innerHTML = itemsHtml;

        // Re-attach lucide icons for newly rendered items
        lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });
    },

    createItemHTML(item) {
        const isSelected = this.state.selectedIds.includes(item.id);
        const style = `left: ${item.x}px; top: ${item.y}px; width: ${item.width}px; height: ${item.height}px;`;

        let contentHtml = '';

        switch (item.type) {
            case 'note':
                contentHtml = `
                    <div class="canvas-item-note" data-color="${item.style?.color || 'yellow'}" contenteditable="true" onblur="CanvasModule.updateItemContent('${item.id}', this.innerHTML)">
                        ${item.content}
                    </div>
                `;
                break;
            case 'image':
                contentHtml = `
                    <div class="canvas-item-image">
                        <img src="${item.content}" alt="Image" draggable="false">
                    </div>
                `;
                break;
            case 'todo':
                const items = typeof item.content === 'object' ? item.content.items : [];
                const title = typeof item.content === 'object' ? item.content.title : 'To-do';
                contentHtml = `
                    <div class="canvas-item-todo">
                        <div style="font-weight:600; margin-bottom:8px; outline:none;" contenteditable="true" onblur="CanvasModule.updateTodoTitle('${item.id}', this.innerText)">${title}</div>
                        <div style="display:flex; flex-direction:column; gap:4px;">
                            ${items.map((todo, idx) => `
                                <div style="display:flex; gap:8px; align-items:center;">
                                    <input type="checkbox" ${todo.checked ? 'checked' : ''} onchange="CanvasModule.toggleTodo('${item.id}', ${idx})">
                                    <span contenteditable="true" onblur="CanvasModule.updateTodoItem('${item.id}', ${idx}, this.innerText)" style="${todo.checked ? 'text-decoration:line-through;color:#aaa;' : ''}">${todo.text}</span>
                                </div>
                            `).join('')}
                            <button class="btn btn-sm btn-ghost" style="justify-content:flex-start; margin-top:4px;" onclick="CanvasModule.addTodoItem('${item.id}')">+ Item</button>
                        </div>
                    </div>
                `;
                break;
            case 'board':
                contentHtml = `
                    <div class="canvas-item-board" style="height:100%;">
                        <div class="canvas-item-board-icon">
                            <i data-lucide="layout"></i>
                        </div>
                        <div style="font-weight:600;">${item.content || 'Nuevo Board'}</div>
                    </div>
                `;
                break;
        }

        return `
            <div class="canvas-item ${isSelected ? 'selected' : ''}" id="item-${item.id}" data-id="${item.id}" style="${style}" onmousedown="CanvasModule.handleItemMouseDown(event, '${item.id}')">
                ${contentHtml}
                <div class="resize-handle handle-se" onmousedown="CanvasModule.handleResizeStart(event, '${item.id}', 'se')"></div>
                ${isSelected ? `
                    <div style="position:absolute; top:-24px; right:0; display:flex; gap:4px;">
                        <button class="btn btn-icon btn-xs btn-danger" onclick="CanvasModule.deleteItem('${item.id}')"><i data-lucide="trash-2"></i></button>
                    </div>
                ` : ''}
            </div>
        `;
    },

    attachEvents() {
        const viewport = document.getElementById('canvas-viewport');
        const toolbar = document.querySelector('.canvas-toolbar');

        // Global mouse events for dragging and resizing
        window.addEventListener('mousemove', this.handleGlobalMouseMove.bind(this));
        window.addEventListener('mouseup', this.handleGlobalMouseUp.bind(this));

        // Panning interaction (Space + Drag)
        viewport.addEventListener('mousedown', (e) => {
            if (e.target === viewport || e.target.id === 'canvas-world') {
                if (e.button === 0 || e.button === 1) { // Left (on background) or Middle
                    this.state.isPanning = true;
                    this.state.dragStart = { x: e.clientX, y: e.clientY };
                    viewport.classList.add('panning');
                }
                // Deselect if clicking empty space
                if (e.target === viewport || e.target.id === 'canvas-world') {
                    this.state.selectedIds = [];
                    this.renderItems();
                }
            }
        });

        // Toolbar Drag & Drop
        const tools = document.querySelectorAll('.canvas-tool[draggable="true"]');
        tools.forEach(tool => {
            tool.addEventListener('dragstart', (e) => {
                e.dataTransfer.effectAllowed = 'copy';
                e.dataTransfer.setData('type', tool.dataset.type);
                // Create a ghost image if needed, or rely on browser default
            });
        });

        viewport.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
        });

        viewport.addEventListener('drop', (e) => {
            e.preventDefault();
            const type = e.dataTransfer.getData('type');
            if (type) {
                const rect = viewport.getBoundingClientRect();
                // Calculate position relative to the world considering pan and scale
                const x = (e.clientX - rect.left - this.state.panX) / this.state.scale;
                const y = (e.clientY - rect.top - this.state.panY) / this.state.scale;
                this.addItem(type, x, y);
            }
        });

        // Zoom with wheel
        viewport.addEventListener('wheel', (e) => {
            if (e.ctrlKey) {
                e.preventDefault();
                const delta = e.deltaY > 0 ? 0.9 : 1.1;
                this.state.scale = Math.min(Math.max(0.1, this.state.scale * delta), 5);
                this.updateTransform();
            }
        }, { passive: false });
    },

    updateTransform() {
        const world = document.getElementById('canvas-world');
        if (world) {
            world.style.transform = `translate(${this.state.panX}px, ${this.state.panY}px) scale(${this.state.scale})`;
        }
    },

    // --- Interaction Handlers ---

    handleItemMouseDown(e, id) {
        // Prevent triggering if clicking input or contenteditable
        if (e.target.isContentEditable || e.target.tagName === 'INPUT') return;

        e.stopPropagation();
        this.state.isDraggingItem = true;
        this.state.selectedIds = [id]; // Simple selection for now

        const item = Store.data.canvasItems.find(i => i.id === id);
        this.state.dragStart = { x: e.clientX, y: e.clientY };
        this.state.dragItemStart = { x: item.x, y: item.y };

        this.renderItems(); // Re-render to show selection rect
    },

    handleResizeStart(e, id, handle) {
        e.stopPropagation();
        e.preventDefault(); // Prevent text selection
        this.state.isResizing = true;
        this.state.resizeHandle = handle;
        this.state.selectedIds = [id];
        this.state.dragStart = { x: e.clientX, y: e.clientY };

        const item = Store.data.canvasItems.find(i => i.id === id);
        this.state.dragItemStart = { w: item.width, h: item.height };
    },

    handleGlobalMouseMove(e) {
        if (this.state.isPanning) {
            const dx = e.clientX - this.state.dragStart.x;
            const dy = e.clientY - this.state.dragStart.y;
            this.state.panX += dx;
            this.state.panY += dy;
            this.state.dragStart = { x: e.clientX, y: e.clientY };
            this.updateTransform();
            return;
        }

        if (this.state.isDraggingItem && this.state.selectedIds.length > 0) {
            const dx = (e.clientX - this.state.dragStart.x) / this.state.scale;
            const dy = (e.clientY - this.state.dragStart.y) / this.state.scale;

            const item = Store.data.canvasItems.find(i => i.id === this.state.selectedIds[0]);
            if (item) {
                item.x = this.state.dragItemStart.x + dx;
                item.y = this.state.dragItemStart.y + dy;
                // Update DOM directly for performance, or re-render
                this.updateItemDOM(item);
            }
        }

        if (this.state.isResizing && this.state.selectedIds.length > 0) {
            const dx = (e.clientX - this.state.dragStart.x) / this.state.scale;
            const dy = (e.clientY - this.state.dragStart.y) / this.state.scale;

            const item = Store.data.canvasItems.find(i => i.id === this.state.selectedIds[0]);
            if (item) {
                if (this.state.resizeHandle === 'se') {
                    item.width = Math.max(50, this.state.dragItemStart.w + dx);
                    item.height = Math.max(50, this.state.dragItemStart.h + dy);
                }
                this.updateItemDOM(item);
            }
        }
    },

    handleGlobalMouseUp() {
        if (this.state.isPanning) {
            this.state.isPanning = false;
            document.getElementById('canvas-viewport').classList.remove('panning');
        }
        this.state.isDraggingItem = false;
        this.state.isResizing = false;
    },

    updateItemDOM(item) {
        const el = document.getElementById(`item-${item.id}`);
        if (el) {
            el.style.left = `${item.x}px`;
            el.style.top = `${item.y}px`;
            el.style.width = `${item.width}px`;
            el.style.height = `${item.height}px`;
        }
    },

    // --- Content Logic ---

    addItem(type, x, y) {
        const id = 'item-' + Date.now();
        let newItem = {
            id, type, x, y, width: 200, height: 150,
            content: '',
            style: { color: 'yellow' }
        };

        if (type === 'note') newItem.content = 'Nueva nota';
        if (type === 'todo') newItem.content = { title: 'Lista de tareas', items: [{ text: 'Tarea 1', checked: false }] };
        if (type === 'board') { newItem.content = 'Nuevo Tablero'; newItem.width = 120; newItem.height = 120; }
        if (type === 'image') {
            newItem.content = 'https://via.placeholder.com/200';
            newItem.width = 200; newItem.height = 200;
        }

        Store.data.canvasItems.push(newItem);
        this.renderItems();
    },

    deleteItem(id) {
        Store.data.canvasItems = Store.data.canvasItems.filter(i => i.id !== id);
        this.state.selectedIds = [];
        this.renderItems();
    },

    updateItemContent(id, html) {
        const item = Store.data.canvasItems.find(i => i.id === id);
        if (item) item.content = html;
    },

    updateTodoTitle(id, text) {
        const item = Store.data.canvasItems.find(i => i.id === id);
        if (item && item.type === 'todo') item.content.title = text;
    },

    updateTodoItem(id, index, text) {
        const item = Store.data.canvasItems.find(i => i.id === id);
        if (item && item.type === 'todo') item.content.items[index].text = text;
    },

    toggleTodo(id, index) {
        const item = Store.data.canvasItems.find(i => i.id === id);
        if (item && item.type === 'todo') {
            item.content.items[index].checked = !item.content.items[index].checked;
            this.renderItems(); // Re-render to update strike-through style
        }
    },

    addTodoItem(id) {
        const item = Store.data.canvasItems.find(i => i.id === id);
        if (item && item.type === 'todo') {
            item.content.items.push({ text: 'Nueva tarea', checked: false });
            this.renderItems();
        }
    },

    resetView() {
        this.state.panX = 0;
        this.state.panY = 0;
        this.state.scale = 1;
        this.updateTransform();
    },

    clearCanvas() {
        if (confirm('¿Seguro que quieres borrar todo el canvas?')) {
            Store.data.canvasItems = [];
            this.renderItems();
        }
    }
};

window.CanvasModule = CanvasModule;
