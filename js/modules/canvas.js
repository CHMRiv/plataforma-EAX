/* ==========================================================================
   EAX Platform - Advanced Canvas Module (Milanote-style)
   ========================================================================== */

const CanvasModule = {
    // Local state for the canvas interactions
    state: {
        currentBoardId: 'root',
        navigationStack: ['root'],
        scale: 1,
        panX: 0,
        panY: 0,
        isPanning: false,
        isDraggingItems: false,
        isResizing: false,
        isSelectingMarquee: false,
        selectedIds: [],
        dragStart: { x: 0, y: 0 },
        dragOffsets: {},
        marqueeStart: { x: 0, y: 0 },
        marqueeRect: { x: 0, y: 0, w: 0, h: 0 },
        resizeHandle: null,
        activeTool: null
    },

    init() {
        // Initialize data storage
        if (!Store.data.canvasBoards) {
            Store.data.canvasBoards = {
                'root': [
                    { id: 'item-1', type: 'note', x: 100, y: 100, width: 250, height: 180, content: '👋 <b>Bienvenido al Canvas Avanzado</b><br><br>• Doble clic en tableros para entrar.<br>• Usa las migas de pan para volver.<br>• Selección múltiple habilitada.', style: { color: 'yellow' } },
                    { id: 'item-demo-board', type: 'board', x: 400, y: 100, width: 140, height: 140, content: 'Proyectos 2024' }
                ]
            };
        }
        if (!Store.data.boardNames) {
            Store.data.boardNames = { 'root': 'Inicio', 'item-demo-board': 'Proyectos 2024' };
        }
    },

    render() {
        this.init();
        const content = document.getElementById('page-content');

        // Sync platform header
        const mainBreadcrumb = document.getElementById('breadcrumb');
        if (mainBreadcrumb) {
            mainBreadcrumb.innerHTML = `<span class="breadcrumb-item">Canvas</span> <i data-lucide="chevron-right" style="width:12px;"></i> <span class="breadcrumb-item">${Store.data.boardNames[this.state.currentBoardId] || 'Tablero'}</span>`;
        }

        // Build breadcrumb
        const breadcrumbs = this.state.navigationStack.map((id, index) => {
            const name = Store.data.boardNames[id] || 'Tablero';
            const isActive = index === this.state.navigationStack.length - 1;
            return `
                <div class="breadcrumb-item ${isActive ? 'active' : ''}" onclick="CanvasModule.navigateToStack(${index})">
                    ${index === 0 ? '<i data-lucide="layout-grid" style="width:14px; margin-right:4px;"></i>' : ''}
                    <span>${name}</span>
                </div>
                ${!isActive ? '<div class="breadcrumb-separator"><i data-lucide="chevron-right" style="width:12px;"></i></div>' : ''}
            `;
        }).join('');

        content.innerHTML = `
            <div class="canvas-wrapper animate-fadeIn">
                <div class="canvas-breadcrumb">
                    ${breadcrumbs}
                </div>
                
                <div class="canvas-container" id="canvas-container">
                    <!-- Milanote Style Toolbar (Exact Icons) -->
                    <div class="canvas-toolbar">
                        <div class="canvas-tool" draggable="true" data-type="note"><i data-lucide="file-text"></i><span>Nota</span></div>
                        <div class="canvas-tool" draggable="true" data-type="text"><i data-lucide="type"></i><span>Título</span></div>
                        <div class="canvas-tool" draggable="true" data-type="link"><i data-lucide="link"></i><span>Enlace</span></div>
                        <div class="canvas-tool" draggable="true" data-type="todo"><i data-lucide="check-square"></i><span>Lista</span></div>
                        <div class="canvas-tool" draggable="true" data-type="line"><i data-lucide="arrow-up-right"></i><span>Flecha</span></div>
                        <div class="canvas-tool" draggable="true" data-type="board"><i data-lucide="columns"></i><span>Tablero</span></div>
                        <div class="canvas-tool" draggable="true" data-type="column"><i data-lucide="grid"></i><span>Columna</span></div>
                        
                        <div class="toolbar-separator"></div>
                        
                        <div class="canvas-tool" draggable="true" data-type="image"><i data-lucide="image"></i><span>Imagen</span></div>
                        <div class="canvas-tool" draggable="true" data-type="file"><i data-lucide="upload-cloud"></i><span>Archivo</span></div>
                        
                        <div style="flex:1;"></div>
                        
                        <div class="canvas-tool" onclick="CanvasModule.clearCanvas()"><i data-lucide="trash-2"></i><span>Limpiar</span></div>
                    </div>

                    <!-- Viewport -->
                    <div class="canvas-viewport" id="canvas-viewport">
                        <div class="canvas-world" id="canvas-world">
                            <svg id="canvas-connections" class="canvas-connections-layer"></svg>
                            <div id="canvas-items-layer"></div>
                        </div>
                        <div id="selection-marquee" class="selection-marquee" style="display: none;"></div>
                    </div>
                </div>
            </div>
        `;

        if (window.lucide) lucide.createIcons();

        this.renderItems();
        this.attachEvents();
        this.resetViewOffsets();
    },

    renderItems() {
        const itemsLayer = document.getElementById('canvas-items-layer');
        if (!itemsLayer) return;

        const currentItems = Store.data.canvasBoards[this.state.currentBoardId] || [];

        // Render regular items
        itemsLayer.innerHTML = currentItems
            .filter(item => item.type !== 'connection_stub') // Filter out any stubs if they exist
            .map(item => this.createItemHTML(item)).join('');

        this.updateConnections();

        if (window.lucide) lucide.createIcons();
    },

    updateConnections(draftTo = null) {
        const svg = document.getElementById('canvas-connections');
        if (!svg) return;

        const items = Store.data.canvasBoards[this.state.currentBoardId] || [];
        const lines = items.filter(i => i.type === 'line');

        let html = lines.map(line => {
            if (!line.fromId || !line.toId) return '';
            const from = items.find(i => i.id === line.fromId);
            const to = items.find(i => i.id === line.toId);
            if (!from || !to) return '';

            const x1 = from.x + from.width / 2;
            const y1 = from.y + from.height / 2;
            const x2 = to.x + to.width / 2;
            const y2 = to.y + to.height / 2;

            return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#cbd5e1" stroke-width="2" stroke-dasharray="${line.content === 'dashed' ? '5,5' : '0'}" />`;
        }).join('');

        // Handle Draft Line
        if (draftTo && this.state.linkingFromId) {
            const from = items.find(i => i.id === this.state.linkingFromId);
            if (from) {
                const x1 = from.x + from.width / 2;
                const y1 = from.y + from.height / 2;
                html += `<line x1="${x1}" y1="${y1}" x2="${draftTo.x}" y2="${draftTo.y}" stroke="#3b82f6" stroke-width="2" stroke-dasharray="5,5" />`;
            }
        }

        svg.innerHTML = html;
    },

    createItemHTML(item) {
        const isSelected = this.state.selectedIds.includes(item.id);
        const style = `left: ${item.x}px; top: ${item.y}px; width: ${item.width}px; height: ${item.height}px;`;

        if (item.type === 'line') return ''; // Lines are rendered in SVG layer

        let body = '';
        let itemClass = 'canvas-item';

        switch (item.type) {
            case 'text':
                itemClass += ' canvas-item-text-only';
                body = `<div class="canvas-item-heading" contenteditable="true" onblur="CanvasModule.updateItemContent('${item.id}', this.innerHTML)">${item.content}</div>`;
                break;
            case 'note':
                body = `<div class="canvas-item-note" contenteditable="true" spellcheck="false" onblur="CanvasModule.updateItemContent('${item.id}', this.innerHTML)">${item.content}</div>`;
                break;
            case 'board':
                body = `
                    <div class="canvas-item-board" ondblclick="CanvasModule.enterBoard('${item.id}')">
                        <div class="board-icon-wrapper"><i data-lucide="folder"></i></div>
                        <div style="font-weight:600; font-size:14px; color:#1e293b; margin-top:4px;">${item.content}</div>
                        <div style="font-size:10px; color:#94a3b8; margin-top:4px;">DOBLE CLIC</div>
                    </div>
                `;
                break;
            case 'link':
                body = `
                    <div style="padding:16px; display:flex; gap:12px; align-items:center;">
                        <div style="width:40px; height:40px; background:#f1f5f9; border-radius:8px; display:flex; align-items:center; justify-content:center; color:#3b82f6;">
                            <i data-lucide="link"></i>
                        </div>
                        <div style="flex:1; overflow:hidden;">
                            <div style="font-weight:600; font-size:13px; color:#1e293b; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${item.content?.title || 'Enlace'}</div>
                            <div style="font-size:11px; color:#64748b; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${item.content?.url || ''}</div>
                        </div>
                    </div>
                `;
                break;
            case 'todo':
                const td = typeof item.content === 'object' ? item.content : { title: 'To-do', items: [] };
                body = `
                    <div style="padding:16px; height:100%;">
                        <div style="font-weight:700; font-size:15px; margin-bottom:12px; outline:none;" contenteditable="true">${td.title || 'Lista'}</div>
                        <div style="display:flex; flex-direction:column; gap:6px;">
                            ${(td.items || []).map((t, i) => `
                                <div style="display:flex; gap:10px; align-items:flex-start;">
                                    <input type="checkbox" style="margin-top:3px;" ${t.checked ? 'checked' : ''} onchange="CanvasModule.toggleTodo('${item.id}', ${i})">
                                    <div contenteditable="true" style="flex:1; font-size:14px; outline:none; ${t.checked ? 'text-decoration:line-through; color:#94a3b8;' : 'color:#475569;'}">${t.text}</div>
                                </div>
                            `).join('')}
                        </div>
                        <button class="btn btn-xs btn-ghost" style="margin-top:12px; font-weight:600; color:#3b82f6;" onclick="CanvasModule.addTodoItem('${item.id}')">+ Añadir tarea</button>
                    </div>
                `;
                break;
            case 'column':
                body = `
                    <div class="canvas-item-column">
                        <div style="font-weight:800; color:#475569; font-size:11px; text-transform:uppercase; letter-spacing:0.05em; padding-bottom:12px; border-bottom:1px solid #e2e8f0; margin-bottom:12px;">${item.content}</div>
                        <div style="display:flex; flex-direction:column; gap:12px; align-items:center; justify-content:center; height:60%; color:#cbd5e1; border:2px dashed #e2e8f0; border-radius:12px;">
                            <i data-lucide="plus" style="width:24px; height:24px;"></i>
                            <span style="font-size:12px; font-weight:500;">Organizar equipo</span>
                        </div>
                    </div>
                `;
                break;
            case 'image':
                body = `<div style="width:100%; height:100%; background:#f1f5f9; border-radius:4px; overflow:hidden; border:1px solid #e2e8f0;"><img src="${item.content}" style="width:100%; height:100%; object-fit:cover; display:block;"></div>`;
                break;
            default:
                body = `<div style="padding:12px; display:flex; align-items:center; gap:8px; color:#64748b;"><i data-lucide="box"></i> ${item.type}</div>`;
        }

        return `
            <div class="${itemClass} ${isSelected ? 'selected' : ''}" id="item-${item.id}" data-id="${item.id}" style="${style}" onmousedown="CanvasModule.handleItemMouseDown(event, '${item.id}')">
                <div class="item-header"></div>
                ${body}
                ${item.type !== 'text' ? `<div class="resize-handle handle-se" onmousedown="CanvasModule.handleResizeStart(event, '${item.id}', 'se')"></div>` : ''}
                ${isSelected ? `
                    <div class="item-quick-actions">
                        <div class="action-btn" onclick="CanvasModule.duplicateItem('${item.id}')" title="Duplicar"><i data-lucide="copy" style="width:14px;"></i></div>
                        <div class="action-btn delete" onclick="CanvasModule.deleteItem('${item.id}')" title="Eliminar"><i data-lucide="trash-2" style="width:14px;"></i></div>
                    </div>
                ` : ''}
            </div>
        `;
    },

    attachEvents() {
        const viewport = document.getElementById('canvas-viewport');
        if (!viewport) return;

        // Zoom & Pan Logic (Optimized)
        viewport.onwheel = (e) => {
            e.preventDefault();
            const factor = e.deltaY < 0 ? 1.1 : 0.9;
            const rect = viewport.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            const worldX = (mouseX - this.state.panX) / this.state.scale;
            const worldY = (mouseY - this.state.panY) / this.state.scale;

            this.state.scale = Math.min(Math.max(0.1, this.state.scale * factor), 5);
            this.state.panX = mouseX - worldX * this.state.scale;
            this.state.panY = mouseY - worldY * this.state.scale;
            this.updateTransform();
        };

        viewport.onmousedown = (e) => {
            if (e.target === viewport || e.target.id === 'canvas-world') {
                if (e.button === 0) { // Marquee
                    this.state.isSelectingMarquee = true;
                    this.state.marqueeStart = { x: e.clientX, y: e.clientY };
                    this.state.selectedIds = [];
                    this.renderItems();
                } else if (e.button === 1 || (e.button === 0 && e.altKey)) { // Pan
                    this.state.isPanning = true;
                    this.state.dragStart = { x: e.clientX, y: e.clientY };
                    viewport.classList.add('panning');
                }
            }
        };

        window.onmousemove = this.handleGlobalMouseMove.bind(this);
        window.onmouseup = this.handleGlobalMouseUp.bind(this);

        // Drag & Drop Tools
        document.querySelectorAll('.canvas-tool[draggable="true"]').forEach(t => {
            t.ondragstart = (e) => e.dataTransfer.setData('type', t.dataset.type);
        });

        viewport.ondragover = (e) => e.preventDefault();
        viewport.ondrop = (e) => {
            const type = e.dataTransfer.getData('type');
            if (type) {
                const rect = viewport.getBoundingClientRect();
                const x = (e.clientX - rect.left - this.state.panX) / this.state.scale;
                const y = (e.clientY - rect.top - this.state.panY) / this.state.scale;
                this.addItem(type, x, y);
            }
        };

        // Hotkeys
        window.onkeydown = (e) => {
            if ((e.key === 'Delete' || e.key === 'Backspace') && !e.target.isContentEditable) {
                this.state.selectedIds.forEach(id => this.deleteItem(id, false));
                this.state.selectedIds = [];
                this.renderItems();
            }
        };
    },

    // --- State Actions ---

    enterBoard(id) {
        if (!Store.data.canvasBoards[id]) {
            Store.data.canvasBoards[id] = [];
        }
        this.state.currentBoardId = id;
        this.state.navigationStack.push(id);

        // Update main platform header if exists
        const mainBreadcrumb = document.getElementById('breadcrumb');
        if (mainBreadcrumb) {
            mainBreadcrumb.innerHTML = `<span class="breadcrumb-item">Canvas</span> <i data-lucide="chevron-right" style="width:12px;"></i> <span class="breadcrumb-item">${Store.data.boardNames[id] || 'Tablero'}</span>`;
            if (window.lucide) lucide.createIcons();
        }

        this.render();
    },

    navigateToStack(index) {
        this.state.navigationStack = this.state.navigationStack.slice(0, index + 1);
        this.state.currentBoardId = this.state.navigationStack[index];
        this.render();
    },

    addItem(type, x, y) {
        const id = 'item-' + Date.now();
        const newItem = { id, type, x, y, width: 200, height: 150, content: '', style: { color: 'yellow' } };

        switch (type) {
            case 'board':
                newItem.content = 'Nuevo Tablero'; newItem.width = 160; newItem.height = 140;
                Store.data.boardNames[id] = newItem.content;
                break;
            case 'text':
                newItem.content = 'Título del Tablero'; newItem.width = 400; newItem.height = 40;
                break;
            case 'note':
                newItem.content = 'Escribe aquí tu pensamiento...'; newItem.width = 240; newItem.height = 180;
                break;
            case 'link':
                newItem.content = { url: 'https://eax-platform.com', title: 'Recurso Compartido' };
                newItem.width = 280; newItem.height = 100;
                break;
            case 'todo':
                newItem.content = { title: 'Pendientes', items: [{ text: 'Tarea 1', checked: false }] };
                newItem.width = 220; newItem.height = 200;
                break;
            case 'line':
                // Transition to linking mode instead of adding immediately
                const sourceId = this.state.selectedIds[0];
                if (sourceId) {
                    this.state.linkingFromId = sourceId;
                    Components.toast('Haz clic en el destino para conectar', 'info', 1500);
                    return; // Don't add item yet
                }
                // If nothing selected, just ignore or could follow mouse
                break;
            case 'column':
                newItem.width = 240; newItem.height = 400; newItem.content = 'Categoría';
                break;
            case 'image':
                newItem.content = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop';
                newItem.width = 300; newItem.height = 200;
                break;
        }

        Store.data.canvasBoards[this.state.currentBoardId].push(newItem);
        this.state.selectedIds = [id];
        this.renderItems();
    },

    deleteItem(id, confirmDelete = true) {
        if (!confirmDelete || confirm('¿Deseas eliminar este elemento?')) {
            // Also delete connections involving this item
            Store.data.canvasBoards[this.state.currentBoardId] = Store.data.canvasBoards[this.state.currentBoardId].filter(i => {
                if (i.id === id) return false;
                if (i.type === 'line' && (i.fromId === id || i.toId === id)) return false;
                return true;
            });
            delete Store.data.boardNames[id];
            if (confirmDelete) this.renderItems();
        }
    },

    duplicateItem(id) {
        const items = Store.data.canvasBoards[this.state.currentBoardId];
        const item = items.find(i => i.id === id);
        if (item) {
            const newItem = JSON.parse(JSON.stringify(item));
            newItem.id = 'item-' + Date.now();
            newItem.x += 40; newItem.y += 40;
            items.push(newItem);
            if (item.type === 'board') Store.data.boardNames[newItem.id] = newItem.content;
            this.state.selectedIds = [newItem.id];
            this.renderItems();
        }
    },

    updateItemContent(id, html) {
        const items = Store.data.canvasBoards[this.state.currentBoardId];
        const item = items.find(i => i.id === id);
        if (item) {
            item.content = html;
            if (item.type === 'board') Store.data.boardNames[id] = html;
        }
    },

    // --- Interaction Handlers ---

    handleItemMouseDown(e, id) {
        if (e.target.isContentEditable || e.target.tagName === 'INPUT' || e.target.closest('.action-btn')) return;
        e.stopPropagation();

        if (!e.shiftKey && !this.state.selectedIds.includes(id)) {
            this.state.selectedIds = [id];
        } else if (e.shiftKey) {
            if (this.state.selectedIds.includes(id)) {
                this.state.selectedIds = this.state.selectedIds.filter(sid => sid !== id);
            } else {
                this.state.selectedIds.push(id);
            }
        }

        this.state.isDraggingItems = true;
        this.state.dragStart = { x: e.clientX, y: e.clientY };
        this.state.dragOffsets = {};
        this.state.selectedIds.forEach(sid => {
            const item = Store.data.canvasBoards[this.state.currentBoardId].find(i => i.id === sid);
            if (item) this.state.dragOffsets[sid] = { x: item.x, y: item.y };
        });

        this.renderItems();
    },

    handleResizeStart(e, id, handle) {
        e.stopPropagation(); e.preventDefault();
        this.state.isResizing = true;
        this.state.resizeHandle = handle;
        this.state.selectedIds = [id];
        this.state.dragStart = { x: e.clientX, y: e.clientY };
        const item = Store.data.canvasBoards[this.state.currentBoardId].find(i => i.id === id);
        this.state.dragItemStart = { w: item.width, h: item.height };
    },

    handleGlobalMouseMove(e) {
        if (this.state.isPanning) {
            this.state.panX += e.clientX - this.state.dragStart.x;
            this.state.panY += e.clientY - this.state.dragStart.y;
            this.state.dragStart = { x: e.clientX, y: e.clientY };
            this.updateTransform(); return;
        }

        if (this.state.isSelectingMarquee) {
            const marquee = document.getElementById('selection-marquee');
            const rect = document.getElementById('canvas-viewport').getBoundingClientRect();
            const x1 = Math.min(this.state.marqueeStart.x, e.clientX);
            const x2 = Math.max(this.state.marqueeStart.x, e.clientX);
            const y1 = Math.min(this.state.marqueeStart.y, e.clientY);
            const y2 = Math.max(this.state.marqueeStart.y, e.clientY);

            this.state.marqueeRect = {
                left: (x1 - rect.left - this.state.panX) / this.state.scale,
                top: (y1 - rect.top - this.state.panY) / this.state.scale,
                right: (x2 - rect.left - this.state.panX) / this.state.scale,
                bottom: (y2 - rect.top - this.state.panY) / this.state.scale
            };

            marquee.style.display = 'block';
            marquee.style.left = (x1 - rect.left) + 'px';
            marquee.style.top = (y1 - rect.top) + 'px';
            marquee.style.width = (x2 - x1) + 'px';
            marquee.style.height = (y2 - y1) + 'px';
            return;
        }

        if (this.state.isDraggingItems) {
            const dx = (e.clientX - this.state.dragStart.x) / this.state.scale;
            const dy = (e.clientY - this.state.dragStart.y) / this.state.scale;
            this.state.selectedIds.forEach(id => {
                const item = Store.data.canvasBoards[this.state.currentBoardId].find(i => i.id === id);
                if (item && this.state.dragOffsets[id]) {
                    item.x = this.state.dragOffsets[id].x + dx;
                    item.y = this.state.dragOffsets[id].y + dy;
                    this.updateItemDOM(item);
                }
            });
        }

        if (this.state.isResizing) {
            const dx = (e.clientX - this.state.dragStart.x) / this.state.scale;
            const dy = (e.clientY - this.state.dragStart.y) / this.state.scale;
            const item = Store.data.canvasBoards[this.state.currentBoardId].find(i => i.id === this.state.selectedIds[0]);
            if (item) {
                item.width = Math.max(80, this.state.dragItemStart.w + dx);
                item.height = Math.max(40, this.state.dragItemStart.h + dy);
                this.updateItemDOM(item);
            }
        }

        // Handle Linking Preview
        if (this.state.linkingFromId) {
            const rect = document.getElementById('canvas-viewport').getBoundingClientRect();
            const mouseWorldX = (e.clientX - rect.left - this.state.panX) / this.state.scale;
            const mouseWorldY = (e.clientY - rect.top - this.state.panY) / this.state.scale;
            this.updateConnections({ x: mouseWorldX, y: mouseWorldY });
        }
    },

    handleGlobalMouseUp(e) {
        if (this.state.isSelectingMarquee) {
            const r = this.state.marqueeRect;
            this.state.selectedIds = Store.data.canvasBoards[this.state.currentBoardId]
                .filter(i => i.type !== 'line' && (i.x < r.right && i.x + i.width > r.left && i.y < r.bottom && i.y + i.height > r.top))
                .map(i => i.id);
            document.getElementById('selection-marquee').style.display = 'none';
            this.renderItems();
        }

        // Finalize Link
        if (this.state.linkingFromId) {
            const target = e.target.closest('.canvas-item');
            const targetId = target?.dataset.id;

            if (targetId && targetId !== this.state.linkingFromId) {
                const lineId = 'line-' + Date.now();
                Store.data.canvasBoards[this.state.currentBoardId].push({
                    id: lineId,
                    type: 'line',
                    fromId: this.state.linkingFromId,
                    toId: targetId,
                    content: 'solid'
                });
                Components.toast('Conexión creada', 'success', 800);
            }
            this.state.linkingFromId = null;
            this.renderItems();
        }

        if ((this.state.isDraggingItems || this.state.isResizing) && this.state.selectedIds.length > 0) {
            Store.emit('canvasBoards:changed', Store.data.canvasBoards);
        }

        document.getElementById('canvas-viewport')?.classList.remove('panning');
        this.state.isPanning = this.state.isDraggingItems = this.state.isResizing = this.state.isSelectingMarquee = false;
    },

    updateTransform() {
        const world = document.getElementById('canvas-world');
        if (world) world.style.transform = `translate(${this.state.panX}px, ${this.state.panY}px) scale(${this.state.scale})`;
        const viewport = document.getElementById('canvas-viewport');
        if (viewport) viewport.style.backgroundPosition = `${this.state.panX}px ${this.state.panY}px`;
    },

    updateItemDOM(item) {
        const el = document.getElementById(`item-${item.id}`);
        if (el) {
            el.style.left = item.x + 'px';
            el.style.top = item.y + 'px';
            el.style.width = item.width + 'px';
            el.style.height = item.height + 'px';
            this.updateConnections();
        }
    },

    resetViewOffsets() {
        this.state.panX = 100; this.state.panY = 60; this.state.scale = 1; this.updateTransform();
    },

    clearCanvas() {
        Components.confirm({
            title: '¿Vaciar tablero?',
            message: 'Todos los elementos de este tablero serán eliminados permanentemente.',
            confirmText: 'Limpiar',
            type: 'danger'
        }).then(conf => {
            if (conf) {
                Store.data.canvasBoards[this.state.currentBoardId] = [];
                this.renderItems();
            }
        });
    }
};

window.CanvasModule = CanvasModule;
