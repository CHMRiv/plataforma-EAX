/* ==========================================================================
   EAX Platform - Comunicaciones Module (Reworked)
   ========================================================================== */

const ComunicacionesModule = {
    currentChat: null,

    getChannels() {
        if (!Store.data.channels) {
            Store.data.channels = [
                { id: 'c-general', name: 'general', icon: 'hash', unread: 3, pinned: true, description: 'Canal principal de la empresa' },
                { id: 'c-proyectos', name: 'proyectos', icon: 'hash', unread: 0, pinned: false, description: 'Actualizaciones de proyectos' },
                { id: 'c-alertas', name: 'alertas', icon: 'alert-triangle', unread: 2, pinned: false, description: 'Alertas automáticas del sistema' },
                { id: 'c-comercial', name: 'comercial', icon: 'hash', unread: 0, pinned: false, description: 'Equipo comercial' },
            ];
        }
        return Store.data.channels;
    },

    getChats() {
        if (!Store.data.chats) {
            Store.data.chats = [
                {
                    id: 1, name: 'Equipo Comercial', isGroup: true, isChannel: true, channelId: 'c-comercial', participants: 5,
                    messages: [
                        { id: 1, from: 'María González', avatar: 'MG', text: 'Hola equipo, ¿cómo vamos con las metas del mes?', time: '14:20', sent: false, reactions: { '👍': 2, '🚀': 1 } },
                        { id: 2, from: 'Tú', avatar: 'EA', text: 'Vamos bien, ya cerramos 3 oportunidades esta semana', time: '14:25', sent: true, reactions: {} },
                        { id: 3, from: 'María González', avatar: 'MG', text: '¡Excelente! @EAX Admin revisemos los números de enero juntos hoy', time: '14:30', sent: false, reactions: { '✅': 3 } }
                    ]
                },
                {
                    id: 2, name: 'María González', isGroup: false, participants: 2,
                    messages: [
                        { id: 1, from: 'María González', avatar: 'MG', text: '¿Pudiste revisar la cotización del cliente ABC?', time: '11:50', sent: false, reactions: {} },
                        { id: 2, from: 'Tú', avatar: 'EA', text: 'Sí, la revisé. Se ve bien. Ya la envié al cliente.', time: '12:10', sent: true, reactions: {} },
                        { id: 3, from: 'María González', avatar: 'MG', text: 'Perfecto, gracias! 👏', time: '12:15', sent: false, reactions: { '❤️': 1 } }
                    ]
                },
                {
                    id: 3, name: 'Carlos Rodríguez', isGroup: false, participants: 2,
                    messages: [
                        { id: 1, from: 'Tú', avatar: 'EA', text: '¿Cómo va el deploy del módulo nuevo?', time: '16:00', sent: true, reactions: {} },
                        { id: 2, from: 'Carlos Rodríguez', avatar: 'CR', text: 'El deploy está listo ✅ Puedes probarlo en staging', time: '16:30', sent: false, reactions: {} }
                    ]
                },
                {
                    id: 4, name: 'general', isGroup: true, isChannel: true, channelId: 'c-general', participants: 12,
                    messages: [
                        { id: 1, from: 'Sistema', avatar: '⚙️', text: '🚨 Stock bajo en Motor Eléctrico 5HP — quedan 3 unidades', time: '09:00', sent: false, reactions: {}, isSystem: true },
                        { id: 2, from: 'Juan Pérez', avatar: 'JP', text: 'Recordatorio: reunión de equipo mañana a las 10:00 en sala de conferencias', time: '10:15', sent: false, reactions: { '👍': 5 } },
                        { id: 3, from: 'Ana Martínez', avatar: 'AM', text: 'Estaré ahí. @María González ¿También puedes asistir?', time: '10:20', sent: false, reactions: {} }
                    ]
                },
            ];
        }
        return Store.data.chats;
    },

    render() {
        const content = document.getElementById('page-content');
        const chats = this.getChats();
        const channels = this.getChannels();

        content.innerHTML = `
            <div class="comm-container animate-fade-in">
                <!-- Sidebar -->
                <aside class="comm-sidebar">
                    <div class="comm-sidebar-header">
                        <h2 class="text-lg font-bold">Comunicaciones</h2>
                        <button class="header-btn" onclick="ComunicacionesModule.showNewMessageModal()">
                            <i data-lucide="edit-3" style="width:16px;"></i>
                        </button>
                    </div>

                    <div class="overflow-auto flex-1 custom-scrollbar">
                        <!-- Channels Section -->
                        <div class="comm-section">
                            <h3 class="comm-section-title">Canales</h3>
                            <div class="flex flex-col gap-1">
                                ${channels.map(ch => {
            const chat = chats.find(c => c.channelId === ch.id);
            const isActive = chat && chat.id === this.currentChat;
            return `
                                        <div class="comm-item ${isActive ? 'active' : ''}" onclick="ComunicacionesModule.openChannel('${ch.id}')">
                                            <i data-lucide="${ch.icon}" style="width:16px;"></i>
                                            <span>${ch.name}</span>
                                            ${ch.unread ? `<span class="unread-badge">${ch.unread}</span>` : ''}
                                        </div>
                                    `;
        }).join('')}
                            </div>
                        </div>

                        <!-- Direct Messages Section -->
                        <div class="comm-section" style="margin-top:20px;">
                            <h3 class="comm-section-title">Mensajes Directos</h3>
                            <div class="flex flex-col gap-1">
                                ${chats.filter(c => !c.isChannel).map(chat => {
            const isActive = chat.id === this.currentChat;
            return `
                                        <div class="comm-item ${isActive ? 'active' : ''}" onclick="ComunicacionesModule.openChat(${chat.id})">
                                            <div class="avatar-sm" style="width:24px; height:24px; font-size:10px;">${chat.name.charAt(0)}</div>
                                            <span class="truncate" style="flex:1;">${chat.name}</span>
                                            <div style="width:8px;height:8px;border-radius:50%;background:var(--color-primary-500);flex-shrink:0;"></div>
                                        </div>
                                    `;
        }).join('')}
                            </div>
                        </div>
                    </div>

                    <!-- Footer Action -->
                    <div class="p-4 border-t" style="border-color:var(--color-gray-100);">
                        <button class="btn btn-primary w-full" onclick="ComunicacionesModule.showNewAnnouncementModal()">
                            <i data-lucide="megaphone" style="width:16px;"></i>
                            Publicar Anuncio
                        </button>
                    </div>
                </aside>

                <!-- Chat Area -->
                <main class="comm-chat-area">
                    ${this.currentChat ? this.renderChat() : this.renderWelcome()}
                </main>
            </div>
        `;

        if (window.lucide) lucide.createIcons();
        this.attachEvents();

        const msgs = document.getElementById('chat-messages');
        if (msgs) msgs.scrollTop = msgs.scrollHeight;
    },

    openChannel(channelId) {
        const chat = this.getChats().find(c => c.channelId === channelId);
        if (chat) { this.currentChat = chat.id; this.render(); }
    },

    openChat(id) {
        this.currentChat = id;
        this.render();
    },

    renderWelcome() {
        const anuncios = Store.get('anuncios') || [];
        return `
            <div class="comm-chat-messages items-center justify-center text-center">
                <div class="avatar" style="width:80px; height:80px; margin-bottom:24px; background:var(--color-primary-50); color:var(--color-primary-500);">
                    <i data-lucide="message-square" style="width:40px;height:40px;"></i>
                </div>
                <h2 class="text-2xl font-bold mb-2">Bienvenido al Centro de Comunicaciones</h2>
                <p class="text-secondary max-w-md mb-8">Selecciona una conversación o canal de la izquierda para comenzar a colaborar con tu equipo.</p>

                <div class="w-full max-w-2xl text-left">
                    <h3 class="comm-section-title">Anuncios Recientes</h3>
                    <div class="grid grid-cols-1 gap-4">
                        ${anuncios.slice(0, 3).map(a => `
                            <div class="card p-4">
                                <div class="flex justify-between items-start mb-2">
                                    <h4 class="font-bold">${a.titulo}</h4>
                                    <span class="text-xs text-tertiary">${Utils.formatDate(a.fecha)}</span>
                                </div>
                                <p class="text-sm text-secondary mb-3">${a.contenido}</p>
                                <div class="flex items-center gap-2 text-xs text-tertiary">
                                    <i data-lucide="user" style="width:12px;"></i>
                                    Publicado por ${a.autor}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    renderChat() {
        const chat = this.getChats().find(c => c.id === this.currentChat);
        if (!chat) return this.renderWelcome();

        return `
            <div class="comm-chat-header">
                <div class="avatar-sm" style="background:${chat.isGroup ? 'var(--color-primary-100)' : 'var(--color-primary-500)'}; color:${chat.isGroup ? 'var(--color-primary-600)' : 'white'};">
                    ${chat.isGroup ? '<i data-lucide="hash" style="width:14px;"></i>' : chat.name.charAt(0)}
                </div>
                <div class="flex-1">
                    <h3 class="font-bold text-base line-height-1">${chat.isChannel ? '#' : ''}${chat.name}</h3>
                    <span class="text-xs text-secondary">${chat.isGroup ? chat.participants + ' participantes' : 'En línea'}</span>
                </div>
                <div class="flex gap-2">
                    <button class="header-btn"><i data-lucide="search" style="width:16px;"></i></button>
                    <button class="header-btn"><i data-lucide="more-vertical" style="width:16px;"></i></button>
                </div>
            </div>

            <div class="comm-chat-messages custom-scrollbar" id="chat-messages">
                ${chat.messages.map(msg => this._renderMessage(msg)).join('')}
            </div>

            <div class="comm-input-area">
                <div class="comm-input-wrapper">
                    <textarea id="message-input" rows="1" placeholder="Escribe tu mensaje..."></textarea>
                    <div class="flex gap-2">
                        <button class="btn btn-icon btn-ghost"><i data-lucide="paperclip"></i></button>
                        <button class="btn btn-primary btn-icon" id="send-message"><i data-lucide="send"></i></button>
                    </div>
                </div>
            </div>
        `;
    },

    _renderMessage(msg) {
        const isSent = msg.sent;
        return `
            <div class="flex flex-col ${isSent ? 'items-end' : 'items-start'} gap-1 group relative">
                <div class="flex items-baseline gap-2 mb-1" style="${isSent ? 'flex-direction:row-reverse' : ''}">
                    <span class="text-xs font-bold">${isSent ? 'Tú' : msg.from}</span>
                    <span class="text-3xs text-tertiary font-medium">${msg.time}</span>
                </div>
                <div class="message-bubble ${isSent ? 'message-sent' : 'message-received'}">
                    ${msg.text}
                </div>
                <!-- Message Actions Hover -->
                <div class="message-actions opacity-0 group-hover:opacity-100 transition-opacity absolute top-1/2 -translate-y-1/2 ${isSent ? 'right-full mr-2' : 'left-full ml-2'} flex gap-1">
                    <button class="btn btn-icon btn-ghost btn-xs bg-white shadow-sm border convert-to-task-btn" title="Convertir en Tarea" data-text="${Utils.escapeHtml(msg.text)}">
                        <i data-lucide="clipboard-check" style="width:14px;height:14px;color:var(--color-primary-600);"></i>
                    </button>
                    <button class="btn btn-icon btn-ghost btn-xs bg-white shadow-sm border" title="Reaccionar">
                        <i data-lucide="smile" style="width:14px;height:14px;"></i>
                    </button>
                </div>
            </div>
        `;
    },

    showConvertToTaskModal(msgText) {
        const areas = Store.get('areas') || [];
        const proyectos = Store.get('proyectos') || [];
        const carpetas = Store.get('carpetas') || [];
        const empleados = Store.get('empleados') || [];

        const { modal, close } = Components.modal({
            title: 'Convertir Mensaje en Tarea',
            size: 'lg',
            content: `
                <form id="convert-task-form">
                    <div class="grid grid-cols-2 gap-4">
                        <div class="form-group col-span-2">
                            <label class="form-label">Nombre de la Tarea</label>
                            <input type="text" name="titulo" class="form-input" value="${msgText.substring(0, 50)}${msgText.length > 50 ? '...' : ''}" required>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Área / Espacio</label>
                            <select name="areaId" id="task-area-select" class="form-select" required>
                                <option value="">Seleccionar Área...</option>
                                ${areas.map(a => `<option value="${a.id}">${a.nombre}</option>`).join('')}
                            </select>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Proyecto</label>
                            <select name="proyectoId" id="task-project-select" class="form-select" required>
                                <option value="">Seleccionar Proyecto...</option>
                                <option value="NEW">+ Solicitar Nuevo Proyecto</option>
                            </select>
                            <input type="text" id="new-project-input" name="newProjectName" class="form-input mt-2 hidden" placeholder="Nombre del proyecto solicitado">
                        </div>

                        <div class="form-group">
                            <label class="form-label">Subcarpeta</label>
                            <select name="carpetaId" id="task-folder-select" class="form-select">
                                <option value="">(Raíz del proyecto)</option>
                                <option value="NEW">+ Solicitar Nueva Subcarpeta</option>
                            </select>
                            <input type="text" id="new-folder-input" name="newFolderName" class="form-input mt-2 hidden" placeholder="Nombre de subcarpeta solicitada">
                        </div>

                        <div class="form-group">
                            <label class="form-label">Encargado</label>
                            <select name="asignado" class="form-select" required>
                                <option value="">Seleccionar Encargado...</option>
                                ${empleados.map(e => `<option value="${e.nombre}">${e.nombre}</option>`).join('')}
                            </select>
                        </div>

                        <div class="form-group col-span-2">
                             <label class="form-label">Carpeta Google Drive Asociada</label>
                             <div class="flex gap-2">
                                <div class="input-group-icon w-full">
                                    <i data-lucide="link" class="w-4 h-4 text-gray-400"></i>
                                    <input type="url" name="driveUrl" class="form-input pl-10" placeholder="https://drive.google.com/..." value="">
                                </div>
                             </div>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Fecha Inicio</label>
                            <input type="date" name="fechaInicio" class="form-input" value="${new Date().toISOString().split('T')[0]}">
                        </div>

                        <div class="form-group">
                            <label class="form-label">Fecha Término</label>
                            <input type="date" name="fechaVencimiento" class="form-input">
                        </div>

                        <div class="form-group col-span-2">
                            <label class="form-label">Descripción Completa</label>
                            <textarea name="descripcion" class="form-textarea" rows="3">${msgText}</textarea>
                        </div>
                    </div>
                </form>
            `,
            footer: `
                <button class="btn btn-secondary" onclick="this.closest('.modal-backdrop').remove()">Cancelar</button>
                <button class="btn btn-primary" id="btn-create-task-from-msg">Crear Tarea e Impactar Desarrollo</button>
            `
        });

        if (window.lucide) lucide.createIcons();

        // Cascading logic
        const areaSelect = document.getElementById('task-area-select');
        const projectSelect = document.getElementById('task-project-select');
        const folderSelect = document.getElementById('task-folder-select');
        const newProjectInput = document.getElementById('new-project-input');
        const newFolderInput = document.getElementById('new-folder-input');

        areaSelect.addEventListener('change', () => {
            const areaId = areaSelect.value;
            projectSelect.innerHTML = '<option value="">Seleccionar Proyecto...</option>';
            if (areaId) {
                proyectos.filter(p => p.areaId == areaId).forEach(p => {
                    projectSelect.innerHTML += `<option value="${p.id}">${p.nombre}</option>`;
                });
                projectSelect.innerHTML += '<option value="NEW">+ Solicitar Nuevo Proyecto</option>';
            }
            folderSelect.innerHTML = '<option value="">(Raíz del proyecto)</option><option value="NEW">+ Solicitar Nueva Subcarpeta</option>';
        });

        projectSelect.addEventListener('change', () => {
            const isNew = projectSelect.value === 'NEW';
            newProjectInput.classList.toggle('hidden', !isNew);

            folderSelect.innerHTML = '<option value="">(Raíz del proyecto)</option>';
            if (!isNew && projectSelect.value) {
                carpetas.filter(c => c.proyectoId == projectSelect.value).forEach(c => {
                    folderSelect.innerHTML += `<option value="${c.id}">${c.nombre}</option>`;
                });
            }
            folderSelect.innerHTML += '<option value="NEW">+ Solicitar Nueva Subcarpeta</option>';
        });

        folderSelect.addEventListener('change', () => {
            newFolderInput.classList.toggle('hidden', folderSelect.value !== 'NEW');
        });

        document.getElementById('btn-create-task-from-msg').addEventListener('click', () => {
            const form = document.getElementById('convert-task-form');
            if (!form.checkValidity()) { form.reportValidity(); return; }

            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            let finalProjectId = data.proyectoId;
            let finalFolderId = data.carpetaId;

            if (data.proyectoId === 'NEW') {
                const request = Store.add('projectRequests', {
                    tipo: 'proyecto', areaId: data.areaId, nombre: data.newProjectName,
                    solicitadoPor: Store.state.user.name, fecha: new Date().toISOString(), estado: 'pendiente'
                });
                finalProjectId = `PENDING-${request.id}`;
            }

            if (data.carpetaId === 'NEW') {
                const request = Store.add('projectRequests', {
                    tipo: 'subcarpeta', proyectoId: finalProjectId, nombre: data.newFolderName,
                    solicitadoPor: Store.state.user.name, fecha: new Date().toISOString(), estado: 'pendiente'
                });
                finalFolderId = `PENDING-${request.id}`;
            }

            Store.add('tareas', {
                titulo: data.titulo, proyectoId: finalProjectId, carpetaId: finalFolderId,
                asignado: data.asignado, fechaInicio: data.fechaInicio, fechaVencimiento: data.fechaVencimiento,
                driveUrl: data.driveUrl, descripcion: data.descripcion,
                estado: 'todo', prioridad: 'media', fechaCreacion: new Date().toISOString()
            });

            Components.toast('Tarea creada y enviada a Desarrollo', 'success');

            const chat = this.getChats().find(c => c.id === this.currentChat);
            if (chat) {
                chat.messages.push({
                    id: Date.now(), from: 'Sistema Aura', avatar: '⚙️',
                    text: `✅ He convertido este mensaje en una tarea: **${data.titulo}**. Estructura: ${areas.find(a => a.id == data.areaId)?.nombre} > ...`,
                    time: 'Ahora', sent: false, isSystem: true
                });
            }

            close();
            this.render();
        });
    },

    sendMessage() {
        const input = document.getElementById('message-input');
        if (!input || !input.value.trim()) return;

        const chat = this.getChats().find(c => c.id === this.currentChat);
        if (!chat) return;

        const text = input.value.trim();
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const newMsg = { id: Date.now(), from: 'Tú', avatar: 'EA', text, time, sent: true, reactions: {} };

        chat.messages.push(newMsg);
        this.render(); // Refrescar para ver el mensaje

        // Mock reply
        setTimeout(() => {
            const replyMsg = { id: Date.now() + 1, from: chat.name, avatar: '?', text: '¡Recibido! Estaré atento.', time: 'Recién', sent: false, reactions: {} };
            chat.messages.push(replyMsg);
            if (this.currentChat === chat.id) this.render();
        }, 2000);
    },

    attachEvents() {
        document.getElementById('send-message')?.addEventListener('click', () => this.sendMessage());
        document.getElementById('message-input')?.addEventListener('keydown', e => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.sendMessage(); }
        });

        const input = document.getElementById('message-input');
        if (input) {
            input.addEventListener('input', () => {
                input.style.height = 'auto';
                input.style.height = input.scrollHeight + 'px';
            });
        }

        // Delegación de eventos para botones de mensajes
        const chatMsgs = document.getElementById('chat-messages');
        if (chatMsgs) {
            chatMsgs.onclick = (e) => {
                const btn = e.target.closest('.convert-to-task-btn');
                if (btn) {
                    const text = btn.getAttribute('data-text');
                    console.log('Capturado clic en convertir tarea:', text);
                    this.showConvertToTaskModal(text);
                }
            };
        }
    },

    showNewMessageModal() {
        const { modal, close } = Components.modal({
            title: 'Nuevo Mensaje Directo',
            size: 'sm',
            content: `
                <div class="form-group">
                    <label class="form-label">Destinatario</label>
                    <input type="text" class="form-input" placeholder="Nombre del usuario...">
                </div>
                <div class="form-group">
                    <label class="form-label">Mensaje</label>
                    <textarea class="form-textarea" placeholder="Escribe algo para iniciar la conversación..."></textarea>
                </div>
            `,
            footer: `
                <button class="btn btn-secondary" onclick="this.closest('.modal-backdrop').remove()">Cancelar</button>
                <button class="btn btn-primary">Iniciar Chat</button>
            `
        });
    },

    showNewAnnouncementModal() {
        const { modal, close } = Components.modal({
            title: 'Publicar Anuncio',
            size: 'md',
            content: `
                <div class="form-group">
                    <label class="form-label">Título</label>
                    <input type="text" class="form-input" placeholder="Ej: Nueva política de vacaciones">
                </div>
                <div class="form-group">
                    <label class="form-label">Contenido</label>
                    <textarea class="form-textarea" rows="4" placeholder="Describe los detalles del anuncio..."></textarea>
                </div>
            `,
            footer: `
                <button class="btn btn-secondary" onclick="this.closest('.modal-backdrop').remove()">Cancelar</button>
                <button class="btn btn-primary">Publicar Ahora</button>
            `
        });
    }
};

window.ComunicacionesModule = ComunicacionesModule;
