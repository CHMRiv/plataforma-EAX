/* ==========================================================================
   EAX Platform - Comunicaciones Module (Slack-level)
   ========================================================================== */

const ComunicacionesModule = {
    currentChat: null,

    // Channel data with unread counts
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

        const totalUnread = chats.reduce((sum, c) => {
            const unread = c.messages?.filter(m => !m.sent && !m.read).length || 0;
            return sum + unread;
        }, 0);

        content.innerHTML = `
            <div class="animate-fadeIn" style="height:calc(100vh - 64px); display:flex; flex-direction:column;">
                <div style="display:flex; height:100%; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.08); border:1px solid #e2e8f0;">
                    
                    <!-- Slack-style Sidebar -->
                    <div style="width:260px; background:#1e1547; flex-shrink:0; display:flex; flex-direction:column;">
                        <!-- Workspace header -->
                        <div style="padding:16px 16px 12px; border-bottom:1px solid rgba(255,255,255,0.1);">
                            <div style="display:flex; align-items:center; justify-content:space-between;">
                                <div>
                                    <div style="color:#fff; font-weight:700; font-size:15px;">EAX Platform</div>
                                    <div style="color:#c4b5fd; font-size:12px; display:flex; align-items:center; gap:4px;">
                                        <div style="width:8px;height:8px;background:#10b981;border-radius:50%;"></div>
                                        EAX Admin
                                    </div>
                                </div>
                                <button style="color:#c4b5fd; background:rgba(255,255,255,0.1); border:none; border-radius:8px; padding:6px; cursor:pointer;" onclick="ComunicacionesModule.showNewMessageModal()">
                                    <i data-lucide="edit-3" style="width:16px;height:16px;"></i>
                                </button>
                            </div>
                        </div>

                        <!-- Sidebar content -->
                        <div style="flex:1; overflow-y:auto; padding:8px 0;">
                            <!-- Channels section -->
                            <div style="padding:4px 8px; margin-bottom:4px;">
                                <div style="display:flex; align-items:center; justify-content:space-between; padding:6px 8px; border-radius:6px; cursor:pointer;">
                                    <span style="color:#c4b5fd; font-size:13px; font-weight:600; text-transform:uppercase; letter-spacing:.05em;">Canales</span>
                                    <button style="background:none;border:none;color:#c4b5fd;cursor:pointer;" onclick="ComunicacionesModule.showNewMessageModal()">
                                        <i data-lucide="plus" style="width:14px;height:14px;"></i>
                                    </button>
                                </div>
                                ${channels.map(ch => `
                                    <div class="slack-channel-item ${this.currentChat && this.getChats().find(c => c.channelId === ch.id)?.id === this.currentChat ? 'active' : ''}" 
                                         onclick="ComunicacionesModule.openChannel('${ch.id}')"
                                         style="display:flex;align-items:center;gap:8px;padding:7px 8px;border-radius:6px;cursor:pointer;color:${ch.unread ? '#fff' : 'rgba(255,255,255,0.7)'};font-weight:${ch.unread ? '600' : '400'};font-size:14px;margin-bottom:1px;transition:background 0.15s;">
                                        <i data-lucide="${ch.icon}" style="width:14px;height:14px;opacity:0.7;"></i>
                                        <span style="flex:1;">${ch.name}</span>
                                        ${ch.unread ? `<span style="background:#f43f5e;color:#fff;font-size:11px;font-weight:700;min-width:18px;height:18px;border-radius:9px;display:flex;align-items:center;justify-content:center;padding:0 4px;">${ch.unread}</span>` : ''}
                                    </div>
                                `).join('')}
                            </div>

                            <!-- Separator -->
                            <div style="height:1px;background:rgba(255,255,255,0.08);margin:8px 16px;"></div>

                            <!-- Direct messages -->
                            <div style="padding:4px 8px;">
                                <div style="display:flex; align-items:center; justify-content:space-between; padding:6px 8px; border-radius:6px; cursor:pointer;">
                                    <span style="color:#c4b5fd; font-size:13px; font-weight:600; text-transform:uppercase; letter-spacing:.05em;">Mensajes Directos</span>
                                    <button style="background:none;border:none;color:#c4b5fd;cursor:pointer;" onclick="ComunicacionesModule.showNewMessageModal()">
                                        <i data-lucide="plus" style="width:14px;height:14px;"></i>
                                    </button>
                                </div>
                                ${chats.filter(c => !c.isChannel).map(chat => {
            const lastMsg = chat.messages[chat.messages.length - 1];
            const unread = chat.messages.filter(m => !m.sent && !m.read).length;
            return `
                                        <div class="slack-channel-item ${this.currentChat === chat.id ? 'active' : ''}"
                                             onclick="ComunicacionesModule.openChat(${chat.id})"
                                             style="display:flex;align-items:center;gap:8px;padding:7px 8px;border-radius:6px;cursor:pointer;color:${unread ? '#fff' : 'rgba(255,255,255,0.7)'};font-weight:${unread ? '600' : '400'};font-size:14px;margin-bottom:1px;transition:background 0.15s;">
                                            <div style="width:24px;height:24px;border-radius:50%;background:#6d28d9;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#fff;flex-shrink:0;">${chat.name.charAt(0)}</div>
                                            <span style="flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${chat.name}</span>
                                            <div style="width:8px;height:8px;border-radius:50%;background:#10b981;flex-shrink:0;"></div>
                                        </div>
                                    `;
        }).join('')}
                            </div>
                        </div>

                        <!-- Announcements button -->
                        <div style="padding:12px; border-top:1px solid rgba(255,255,255,0.1);">
                            <button onclick="ComunicacionesModule.showNewAnnouncementModal()" style="width:100%;background:rgba(255,255,255,0.1);color:#c4b5fd;border:none;border-radius:8px;padding:10px;cursor:pointer;font-size:13px;font-weight:600;display:flex;align-items:center;gap:8px;justify-content:center;">
                                <i data-lucide="megaphone" style="width:16px;height:16px;"></i>
                                Publicar Anuncio
                            </button>
                        </div>
                    </div>

                    <!-- Main Chat Area -->
                    <div style="flex:1; display:flex; flex-direction:column; min-width:0; background:#fff;">
                        ${this.currentChat ? this.renderChat() : this.renderWelcome()}
                    </div>
                </div>
            </div>
        `;

        if (window.lucide) lucide.createIcons();
        this.attachEvents();

        const msgs = document.querySelector('.chat-messages');
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
            <div style="flex:1; overflow-y:auto; padding:32px;">
                <h2 style="font-size:24px; font-weight:800; color:#0f172a; margin-bottom:8px;">👋 Bienvenido de nuevo, EAX Admin</h2>
                <p style="color:#64748b; margin-bottom:32px; font-size:15px;">Selecciona un canal o conversación para comenzar</p>

                <h3 style="font-size:14px; font-weight:700; color:#475569; text-transform:uppercase; letter-spacing:.05em; margin-bottom:16px;">Anuncios Corporativos</h3>
                <div style="display:flex; flex-direction:column; gap:12px;">
                    ${anuncios.slice(0, 4).map(a => `
                        <div style="border:1px solid #e2e8f0; border-radius:12px; padding:20px; background:#fafafa;">
                            <div style="display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:8px;">
                                <div style="font-weight:600; font-size:15px; color:#0f172a;">${a.titulo}</div>
                                <span style="font-size:11px; color:#94a3b8; flex-shrink:0;">${Utils.formatDate(a.fecha)}</span>
                            </div>
                            <p style="color:#475569; font-size:14px; line-height:1.6;">${a.contenido}</p>
                            <div style="margin-top:12px; font-size:12px; color:#94a3b8; display:flex; align-items:center; gap:4px;">
                                <i data-lucide="user" style="width:12px;height:12px;"></i>
                                Publicado por <strong>${a.autor}</strong>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    renderChat() {
        const chats = this.getChats();
        const chat = chats.find(c => c.id === this.currentChat);
        if (!chat) return this.renderWelcome();

        const EMOJI_REACTIONS = ['👍', '❤️', '✅', '😂', '🚀', '🔥'];

        return `
            <!-- Chat Header -->
            <div style="padding:14px 20px; border-bottom:1px solid #f1f5f9; display:flex; align-items:center; gap:12px; background:#fff;">
                <div style="width:36px;height:36px;border-radius:${chat.isGroup ? '10px' : '50%'};background:${chat.isGroup ? '#6d28d9' : '#3b82f6'};display:flex;align-items:center;justify-content:center;color:#fff;font-size:${chat.isGroup ? '14px' : '13px'};font-weight:700;">
                    ${chat.isGroup ? '<i data-lucide="hash" style="width:16px;height:16px;"></i>' : chat.name.charAt(0)}
                </div>
                <div style="flex:1;">
                    <div style="font-weight:700; font-size:15px; color:#0f172a;">${chat.isChannel ? '#' : ''}${chat.name}</div>
                    <div style="font-size:12px; color:#64748b;">${chat.isGroup ? chat.participants + ' participantes' : '<span style="color:#10b981;">● En línea</span>'}</div>
                </div>
                <div style="display:flex; gap:8px;">
                    <button style="border:none;background:#f1f5f9;border-radius:8px;padding:8px;cursor:pointer;color:#64748b;">
                        <i data-lucide="search" style="width:16px;height:16px;"></i>
                    </button>
                    <button style="border:none;background:#f1f5f9;border-radius:8px;padding:8px;cursor:pointer;color:#64748b;">
                        <i data-lucide="info" style="width:16px;height:16px;"></i>
                    </button>
                </div>
            </div>

            <!-- Messages -->
            <div class="chat-messages" id="chat-messages" style="flex:1; overflow-y:auto; padding:16px 20px; display:flex; flex-direction:column; gap:4px;">
                ${chat.messages.map(msg => this._renderMessage(msg, chat)).join('')}
            </div>

            <!-- Input Area -->
            <div style="padding:12px 20px 16px; border-top:1px solid #f1f5f9;">
                <div style="display:flex; align-items:flex-end; gap:8px; background:#f8fafc; border:1.5px solid #e2e8f0; border-radius:12px; padding:10px 12px; transition:border-color 0.15s;" id="chat-input-wrap">
                    <textarea id="message-input" rows="1" placeholder="Escribe un mensaje en ${chat.isChannel ? '#' : ''}${chat.name}... (@ para mencionar)" 
                        style="flex:1;border:none;background:transparent;outline:none;font-size:14px;resize:none;font-family:inherit;max-height:120px;line-height:1.5;"
                        oninput="this.style.height='auto';this.style.height=this.scrollHeight+'px'"></textarea>
                    <div style="display:flex; gap:4px; align-items:center;">
                        <button style="border:none;background:none;padding:4px;cursor:pointer;color:#94a3b8;" title="Adjuntar archivo">
                            <i data-lucide="paperclip" style="width:18px;height:18px;"></i>
                        </button>
                        <button id="send-message" style="border:none;background:#3b82f6;color:#fff;border-radius:8px;padding:8px 10px;cursor:pointer;display:flex;align-items:center;gap:4px;">
                            <i data-lucide="send" style="width:15px;height:15px;"></i>
                        </button>
                    </div>
                </div>
                <div style="margin-top:6px; display:flex; gap:6px;">
                    ${EMOJI_REACTIONS.map(e => `<button onclick="ComunicacionesModule.quickSend('${e}')" style="border:none;background:#f1f5f9;border-radius:6px;padding:4px 8px;cursor:pointer;font-size:14px;" title="Enviar ${e}">${e}</button>`).join('')}
                </div>
            </div>
        `;
    },

    _renderMessage(msg, chat) {
        const reactions = Object.entries(msg.reactions || {}).filter(([, count]) => count > 0);
        const mentionRegex = /@(\w+(?:\s\w+)?)/g;
        const processedText = msg.text.replace(mentionRegex, '<span style="background:#eff6ff;color:#3b82f6;border-radius:4px;padding:0 4px;font-weight:600;">@$1</span>');

        if (msg.sent) {
            return `
                <div style="display:flex; flex-direction:row-reverse; align-items:flex-end; gap:8px; margin-top:8px;">
                    <div style="max-width:65%;">
                        <div style="background:linear-gradient(135deg,#3b82f6,#2563eb);color:#fff;border-radius:16px 16px 4px 16px;padding:10px 14px;font-size:14px;line-height:1.5;">${processedText}</div>
                        <div style="font-size:11px;color:#94a3b8;text-align:right;margin-top:4px;padding-right:4px;">${msg.time}</div>
                        ${reactions.length ? `<div style="display:flex;gap:4px;flex-wrap:wrap;justify-content:flex-end;margin-top:4px;">${reactions.map(([e, c]) => `<span style="background:#f1f5f9;border-radius:12px;padding:2px 8px;font-size:13px;cursor:pointer;">${e} ${c}</span>`).join('')}</div>` : ''}
                    </div>
                </div>
            `;
        }

        return `
            <div style="display:flex; align-items:flex-start; gap:10px; margin-top:8px; group;">
                <div style="width:36px;height:36px;border-radius:50%;background:${msg.isSystem ? '#f1f5f9' : '#6d28d9'};display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#fff;flex-shrink:0;">${msg.isSystem ? '⚙️' : msg.avatar || msg.from.charAt(0)}</div>
                <div style="max-width:65%;">
                    <div style="display:flex; align-items:baseline; gap:8px; margin-bottom:4px;">
                        <span style="font-size:13px;font-weight:700;color:#0f172a;">${msg.from}</span>
                        <span style="font-size:11px;color:#94a3b8;">${msg.time}</span>
                    </div>
                    <div style="background:${msg.isSystem ? '#fffbeb' : '#f8fafc'};border:1px solid ${msg.isSystem ? '#fde68a' : '#f1f5f9'};border-radius:4px 16px 16px 16px;padding:10px 14px;font-size:14px;line-height:1.5;color:#334155;">${processedText}</div>
                    ${reactions.length ? `<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:4px;">${reactions.map(([e, c]) => `<span style="background:#f1f5f9;border-radius:12px;padding:2px 8px;font-size:13px;cursor:pointer;border:1px solid #e2e8f0;">${e} ${c}</span>`).join('')}</div>` : ''}
                </div>
            </div>
        `;
    },

    quickSend(emoji) {
        const input = document.getElementById('message-input');
        if (input) { input.value = emoji; this.sendMessage(); }
    },

    sendMessage() {
        const input = document.getElementById('message-input');
        if (!input || !input.value.trim()) return;

        const text = input.value.trim();
        const now = new Date();
        const time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

        const chats = this.getChats();
        const chat = chats.find(c => c.id === this.currentChat);
        if (!chat) return;

        const newMsg = { id: Date.now(), from: 'Tú', avatar: 'EA', text, time, sent: true, reactions: {} };
        chat.messages.push(newMsg);

        const messagesContainer = document.getElementById('chat-messages');
        if (messagesContainer) {
            const msgEl = document.createElement('div');
            msgEl.innerHTML = this._renderMessage(newMsg, chat);
            messagesContainer.appendChild(msgEl.firstElementChild);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;

            // Simulated auto-reply
            setTimeout(() => {
                const replies = ['Entendido, lo reviso ahora mismo.', 'Gracias por la info ✅', '¿Podrías darme más detalles?', 'Lo vemos en la próxima reunión.', 'Ok, perfecto 👍'];
                const replyText = replies[Math.floor(Math.random() * replies.length)];
                const replyTime = new Date().getHours().toString().padStart(2, '0') + ':' + new Date().getMinutes().toString().padStart(2, '0');
                const replyMsg = { id: Date.now() + 1, from: chat.name, avatar: chat.name.charAt(0), text: replyText, time: replyTime, sent: false, reactions: {} };
                chat.messages.push(replyMsg);

                if (this.currentChat === chat.id && messagesContainer.isConnected) {
                    const replyEl = document.createElement('div');
                    replyEl.innerHTML = this._renderMessage(replyMsg, chat);
                    messagesContainer.appendChild(replyEl.firstElementChild);
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                    if (window.lucide) lucide.createIcons();
                }
            }, 1500);
        }

        input.value = '';
        input.style.height = 'auto';
        input.focus();
    },

    attachEvents() {
        // Hover on sidebar items
        document.querySelectorAll('.slack-channel-item').forEach(el => {
            el.addEventListener('mouseenter', () => { if (!el.classList.contains('active')) el.style.background = 'rgba(255,255,255,0.08)'; });
            el.addEventListener('mouseleave', () => { if (!el.classList.contains('active')) el.style.background = ''; });
        });

        document.getElementById('send-message')?.addEventListener('click', () => this.sendMessage());
        document.getElementById('message-input')?.addEventListener('keydown', e => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.sendMessage(); }
        });
        document.getElementById('chat-input-wrap')?.querySelector('textarea')?.addEventListener('focus', e => {
            document.getElementById('chat-input-wrap').style.borderColor = '#3b82f6';
        });
        document.getElementById('chat-input-wrap')?.querySelector('textarea')?.addEventListener('blur', e => {
            document.getElementById('chat-input-wrap').style.borderColor = '#e2e8f0';
        });
    },

    showNewMessageModal() {
        const empleados = Store.get('empleados') || [];
        const { modal, close } = Components.modal({
            title: 'Nuevo Mensaje Directo',
            size: 'sm',
            content: `
                <form id="message-form">
                    ${Components.formInput({ label: 'Para', name: 'para', type: 'select', required: true, options: empleados.map(e => ({ value: e.nombre, label: e.nombre })) })}
                    ${Components.formInput({ label: 'Mensaje', name: 'mensaje', type: 'textarea', required: true })}
                </form>
            `,
            footer: `<button class="btn btn-secondary" data-action="cancel">Cancelar</button><button class="btn btn-primary" data-action="send"><i data-lucide="send"></i> Enviar</button>`
        });

        if (window.lucide) lucide.createIcons();
        modal.querySelector('[data-action="cancel"]').addEventListener('click', close);
        modal.querySelector('[data-action="send"]').addEventListener('click', () => {
            const form = document.getElementById('message-form');
            if (!form.checkValidity()) { form.reportValidity(); return; }
            const data = Object.fromEntries(new FormData(form).entries());
            const time = new Date().toTimeString().slice(0, 5);
            const chats = this.getChats();
            let chat = chats.find(c => c.name === data.para && !c.isGroup);
            if (!chat) {
                chat = { id: Date.now(), name: data.para, isGroup: false, participants: 2, messages: [] };
                chats.push(chat);
            }
            chat.messages.push({ id: Date.now(), from: 'Tú', avatar: 'EA', text: data.mensaje, time, sent: true, reactions: {} });
            this.currentChat = chat.id;
            Components.toast(`Mensaje enviado a ${data.para}`, 'success');
            close();
            this.render();
        });
    },

    showNewAnnouncementModal() {
        const { modal, close } = Components.modal({
            title: 'Nuevo Anuncio Corporativo',
            size: 'md',
            content: `
                <form id="announcement-form">
                    ${Components.formInput({ label: 'Título del Anuncio', name: 'titulo', required: true })}
                    ${Components.formInput({ label: 'Contenido', name: 'contenido', type: 'textarea', required: true })}
                    ${Components.formInput({
                label: 'Tipo', name: 'tipo', type: 'select', options: [
                    { value: 'general', label: 'General' }, { value: 'urgente', label: 'Urgente' }, { value: 'logro', label: '🏆 Logro del equipo' }
                ]
            })}
                </form>
            `,
            footer: `<button class="btn btn-secondary" data-action="cancel">Cancelar</button><button class="btn btn-primary" data-action="publish"><i data-lucide="megaphone"></i> Publicar</button>`
        });

        if (window.lucide) lucide.createIcons();
        modal.querySelector('[data-action="cancel"]').addEventListener('click', close);
        modal.querySelector('[data-action="publish"]').addEventListener('click', () => {
            const form = document.getElementById('announcement-form');
            if (!form.checkValidity()) { form.reportValidity(); return; }
            const data = Object.fromEntries(new FormData(form).entries());
            data.fecha = new Date().toISOString().split('T')[0];
            data.autor = 'EAX Admin';
            Store.add('anuncios', data);
            Components.toast('Anuncio publicado y visible en Intranet', 'success');
            close();
            this.render();
        });
    }
};

window.ComunicacionesModule = ComunicacionesModule;
