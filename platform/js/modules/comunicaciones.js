/* ==========================================================================
   EAX Platform - Comunicaciones Module
   ========================================================================== */

const ComunicacionesModule = {
    currentChat: null,

    render() {
        const content = document.getElementById('page-content');
        const mensajes = Store.get('mensajes');
        const anuncios = Store.get('anuncios');

        content.innerHTML = `
            <div class="animate-fadeIn">
                ${Components.pageHeader({
            title: 'Comunicaciones',
            subtitle: 'Mensajería interna y anuncios corporativos',
            actions: [
                { label: 'Nuevo Anuncio', icon: 'megaphone', class: 'btn-outline', action: 'new-announcement' },
                { label: 'Nuevo Mensaje', icon: 'plus', class: 'btn-primary', action: 'new-message' }
            ]
        })}
                
                <div class="chat-container">
                    <!-- Chat Sidebar -->
                    <div class="chat-sidebar">
                        <div class="chat-search">
                            ${Components.searchInput({ placeholder: 'Buscar conversaciones...', id: 'search-chats' })}
                        </div>
                        <div class="chat-list">
                            ${this.renderChatList()}
                        </div>
                    </div>
                    
                    <!-- Chat Main -->
                    <div class="chat-main">
                        ${this.currentChat ? this.renderChat() : this.renderAnuncios(anuncios)}
                    </div>
                </div>
            </div>
        `;

        lucide.createIcons({ icons: lucide.icons, nameAttr: 'data-lucide' });
        this.attachEvents();
    },

    renderChatList() {
        const empleados = Store.get('empleados');
        const chats = [
            { id: 1, name: 'Equipo Comercial', lastMessage: 'Revisemos los números de enero', time: '14:30', unread: 2, isGroup: true },
            { id: 2, name: 'María González', lastMessage: 'Ok, perfecto!', time: '12:15', unread: 0, isGroup: false },
            { id: 3, name: 'Carlos Rodríguez', lastMessage: 'El deploy está listo', time: 'Ayer', unread: 1, isGroup: false },
            { id: 4, name: 'Proyecto EAX', lastMessage: 'Reunión mañana a las 10', time: 'Ayer', unread: 0, isGroup: true }
        ];

        return chats.map(chat => `
            <div class="chat-item ${this.currentChat === chat.id ? 'active' : ''}" data-chat="${chat.id}">
                <div class="avatar ${chat.isGroup ? '' : ''}" style="${chat.isGroup ? 'background: var(--color-secondary-500);' : ''}">
                    ${chat.isGroup ? '<i data-lucide="users" style="width:18px;height:18px;"></i>' : Utils.getInitials(chat.name)}
                </div>
                <div class="chat-item-content">
                    <div class="chat-item-header">
                        <span class="chat-item-name">${chat.name}</span>
                        <span class="chat-item-time">${chat.time}</span>
                    </div>
                    <div class="chat-item-preview">${chat.lastMessage}</div>
                </div>
                ${chat.unread > 0 ? `<span class="badge badge-primary" style="min-width:20px;height:20px;padding:0;display:flex;align-items:center;justify-content:center;">${chat.unread}</span>` : ''}
            </div>
        `).join('');
    },

    renderChat() {
        return `
            <div class="chat-header">
                <div class="avatar">EQ</div>
                <div class="flex-1">
                    <div class="font-medium">Equipo Comercial</div>
                    <div class="text-xs text-secondary">5 participantes</div>
                </div>
                <button class="btn btn-ghost btn-icon"><i data-lucide="more-vertical"></i></button>
            </div>
            <div class="chat-messages">
                <div class="message received">
                    <div class="message-bubble">Hola equipo, ¿cómo vamos con las metas del mes?</div>
                    <div class="message-time">María - 14:20</div>
                </div>
                <div class="message sent">
                    <div class="message-bubble">Vamos bien, ya cerramos 3 oportunidades</div>
                    <div class="message-time">14:25</div>
                </div>
                <div class="message received">
                    <div class="message-bubble">Excelente! Revisemos los números de enero</div>
                    <div class="message-time">María - 14:30</div>
                </div>
            </div>
            <div class="chat-input-container">
                <input type="text" class="chat-input" placeholder="Escribe un mensaje..." id="message-input">
                <button class="btn btn-primary" id="send-message">
                    <i data-lucide="send"></i>
                </button>
            </div>
        `;
    },

    renderAnuncios(anuncios) {
        return `
            <div class="p-6">
                <h3 class="text-lg font-semibold mb-4">Anuncios Recientes</h3>
                <div class="flex flex-col gap-4">
                    ${anuncios.map(a => `
                        <div class="card">
                            <div class="card-body">
                                <div class="flex justify-between items-start mb-2">
                                    <h4 class="font-semibold">${a.titulo}</h4>
                                    <span class="text-xs text-secondary">${Utils.formatDate(a.fecha)}</span>
                                </div>
                                <p class="text-secondary">${a.contenido}</p>
                                <div class="mt-3 text-xs text-secondary">
                                    <i data-lucide="user" style="width:12px;height:12px;display:inline;"></i>
                                    Publicado por ${a.autor}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="text-center mt-8 p-8">
                    <div class="avatar avatar-xl mx-auto mb-4" style="background: var(--color-gray-100); color: var(--color-gray-400);">
                        <i data-lucide="message-circle" style="width:32px;height:32px;"></i>
                    </div>
                    <h3 class="font-semibold mb-2">Selecciona una conversación</h3>
                    <p class="text-secondary">Elige una conversación de la lista o inicia una nueva</p>
                </div>
            </div>
        `;
    },

    attachEvents() {
        // Chat items
        document.querySelectorAll('.chat-item').forEach(item => {
            item.addEventListener('click', () => {
                this.currentChat = parseInt(item.dataset.chat);
                this.render();
            });
        });

        // Send message
        document.getElementById('send-message')?.addEventListener('click', () => {
            const input = document.getElementById('message-input');
            if (input.value.trim()) {
                Components.toast('Mensaje enviado', 'success');
                input.value = '';
            }
        });

        document.getElementById('message-input')?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('send-message')?.click();
            }
        });

        // New message
        document.querySelector('[data-action="new-message"]')?.addEventListener('click', () => {
            this.showNewMessageModal();
        });

        // New announcement
        document.querySelector('[data-action="new-announcement"]')?.addEventListener('click', () => {
            this.showNewAnnouncementModal();
        });
    },

    showNewMessageModal() {
        const empleados = Store.get('empleados');

        const { modal, close } = Components.modal({
            title: 'Nuevo Mensaje',
            size: 'sm',
            content: `
                <form id="message-form">
                    ${Components.formInput({
                label: 'Para', name: 'para', type: 'select', required: true,
                options: empleados.map(e => ({ value: e.nombre, label: e.nombre }))
            })}
                    ${Components.formInput({ label: 'Mensaje', name: 'mensaje', type: 'textarea', required: true })}
                </form>
            `,
            footer: `
                <button class="btn btn-secondary" data-action="cancel">Cancelar</button>
                <button class="btn btn-primary" data-action="send">Enviar</button>
            `
        });

        modal.querySelector('[data-action="cancel"]').addEventListener('click', close);
        modal.querySelector('[data-action="send"]').addEventListener('click', () => {
            Components.toast('Mensaje enviado', 'success');
            close();
        });
    },

    showNewAnnouncementModal() {
        const { modal, close } = Components.modal({
            title: 'Nuevo Anuncio',
            size: 'md',
            content: `
                <form id="announcement-form">
                    ${Components.formInput({ label: 'Título', name: 'titulo', required: true })}
                    ${Components.formInput({ label: 'Contenido', name: 'contenido', type: 'textarea', required: true })}
                </form>
            `,
            footer: `
                <button class="btn btn-secondary" data-action="cancel">Cancelar</button>
                <button class="btn btn-primary" data-action="publish">Publicar</button>
            `
        });

        modal.querySelector('[data-action="cancel"]').addEventListener('click', close);
        modal.querySelector('[data-action="publish"]').addEventListener('click', () => {
            const form = document.getElementById('announcement-form');
            if (!form.checkValidity()) { form.reportValidity(); return; }

            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            data.fecha = new Date().toISOString().split('T')[0];
            data.autor = Store.state.user.name;

            Store.add('anuncios', data);
            Components.toast('Anuncio publicado', 'success');
            close();
            this.render();
        });
    }
};

window.ComunicacionesModule = ComunicacionesModule;
