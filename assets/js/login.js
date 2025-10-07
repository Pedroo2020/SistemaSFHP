// Importa a URL da API
import { URL_API, socket } from './urlAPI.js';
// Função para formatar CPF
import { formatCPF } from './components/format.js';
// Função para remover caracteres não numericos
import { getNumber, alertMsg } from './components/utils.js';

// Ao carregar a página, adiciona as formatações ao input
$(document).ready(() => {
    formatCPF('#input-cpf');

    const logout = localStorage.getItem('logout');

    if (logout) {
        // Remove a mensagema
        localStorage.removeItem('logout');
        // Exibe a mensagem
        alertMsg(logout, 'success', '.div-message');
    }

    const msgLogout = localStorage.getItem('msg-logout');

    if (msgLogout) {
        // Remove a mensagema
        localStorage.removeItem('msg-logout');
        // Exibe a mensagem
        alertMsg(msgLogout, 'error', '.div-message');
    }
})

// Show password
$('.showPassword').click(() => {
    // Elementos
    const $this = $('.showPassword');
    const $input = $('#input-password');

    // Verifica se a senha está escondida
    if ($this.hasClass('fa-eye')) {

        // Altera o ícone do botão
        $this.removeClass('fa-eye').addClass('fa-eye-slash');
        // Mostra o conteúdo do input
        $input.prop('type', 'text');

    } else {

        // Altera o ícone do botão
        $this.removeClass('fa-eye-slash').addClass('fa-eye')
        // Esconde o conteúdo do input

        $input.prop('type', 'password');
    }

})

// Envio do formulário de login
$('.formulario').on('submit', (e) => {
    // Evita o comportamento padrão
    e.preventDefault();

    // Obtém os valores
    const cpfVal = getNumber($('#input-cpf').val());
    const senhaVal = $('#input-password').val();

    // Cria o objeto data
    const data = {
        cpf: cpfVal,
        senha: senhaVal
    }

    // Faz a requisição de login (POST)
    $.ajax({
        url: `${URL_API}/login`,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: (res) => {

            // Obtém o token
            const token = res.token;

            // Autentica com o token
            socket.emit("autenticar", { token });

            // Salva no localStorage
            localStorage.setItem('token', token);

            // Obtém o tipo do usuário
            const typeUser = parseInt(res.tipo_usuario);

            // Redireciona para a página designada
            if (typeUser === 1) {
                // ADM
                window.location.href = 'administrador-perfil.html';
            } else if (typeUser === 2) {
                // Médico
                window.location.href = 'medico-perfil.html';
            } else if (typeUser === 3) {
                // Enfermeiro
                window.location.href = 'enfermeiro-perfil.html';
            } else if (typeUser === 4) {
                // Recepcionista
                window.location.href = 'recepcionista-perfil.html';
            } else {
                // Inválido
                alertMsg('Login inválido', 'error', '.div-message');
            }
        },
        error: (err) => {
            // Exibe a mensagem de erro
            alertMsg(err.responseJSON.error, 'error', '.div-message');
        }
    })
})

// Btn recuperar senha
$('.rec-senha').click(() => {
    // Recuperar senha
})