// Importa a URL da API
import { URL_API, socket } from './urlAPI.js';
// Função para formatar CPF
import { formatCPF, maskInputNumber } from './components/format.js';
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

// Função show password
function showPassword(idBtn, idInput) {
    $(idBtn).click(() => {
        // Elementos
        const $this = $(idBtn);
        const $input = $(idInput);

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
}

// Ao carregar a página
$(document).ready(() => {
    // Adiciona a função ao btn de mostrar senha
    showPassword('#show-password', '#input-password');
    showPassword('#show-change-password', '#input-change-password');
    showPassword('#show-confirm-change-password', '#input-confirm-change-password');
})

// Envio do formulário de login
$('#form-login').on('submit', (e) => {
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

    // Obtém o valor do CPF
    const cpf = getNumber($('#input-cpf').val());

    // Retorna se não tiver CPF
    if (!cpf) {
        alertMsg('Insira o CPF para recuperar a senha.', 'error', '.div-message');
        return;
    }

    $.ajax({
        url: `${URL_API}/gerar_codigo?cpf=${cpf}`,
        method: 'POST',
        success: (res) => {
            // Exibe a mensagem de sucesso
            alertMsg(res.success, 'success', '.div-message');

            // Coloca o email na tela de validar código
            $('#email-adress').text(res.email);

            // Máscara para input de código
            maskInputNumber($('#input-codigo'));

            // Mostra o form de validar código
            $('#form-login').hide();
            $('#form-validar-codigo').css('display', 'flex');
        },
        error: (err) => {
            // Exibe a mensagem de erro
            alertMsg(err.responseJSON.error, 'error', '.div-message');
        }
    })
})

// Formulário de validar código
$('#form-validar-codigo').on('submit', (e) => {
    // Evita o comportamento padrão
    e.preventDefault();

    // Obtém o valor do código
    const codigo = $('#input-codigo').val();

    // Retorna se não tiver código
    if (!codigo) {
        alertMsg('Insira o código para validar.', 'error', '.div-message');
        return;
    }

    // Obtém o valor do CPF
    const cpf = getNumber($('#input-cpf').val());

    // Retorna se não tiver CPF
    if (!cpf) {
        alertMsg('Insira o CPF para recuperar a senha.', 'error', '.div-message');
        return;
    }

    // Requisição para validar o código
    $.ajax({
        url: `${URL_API}/validar_codigo?codigo=${codigo}&cpf=${cpf}`,
        method: 'POST',
        success: (res) => {
            // Exibe a mensagem de sucesso
            alertMsg(res.success, 'success', '.div-message');

            // Mostra o form de redefinir senha
            $('#form-validar-codigo').hide();
            $('#form-nova-senha').css('display', 'flex');
        },
        error: (err) => {
            // Exibe a mensagem de erro
            alertMsg(err.responseJSON.error, 'error', '.div-message');
        }
    })
})

// Formulário de redefinir senha
$('#form-nova-senha').on('submit', (e) => {
    // Evita o comportamento padrão
    e.preventDefault();

    // Obtém o valor do código
    const senha = $('#input-change-password').val();
    const confirmarSenha = $('#input-confirm-change-password').val();

    // Retorna se não tiver código
    if (!senha || !confirmarSenha) {
        alertMsg('Insira o código para validar.', 'error', '.div-message');
        return;
    }

    // Obtém o valor do CPF
    const cpf = getNumber($('#input-cpf').val());

    // Retorna se não tiver CPF
    if (!cpf) {
        alertMsg('Insira o CPF para recuperar a senha.', 'error', '.div-message');
        return;
    }

    // Requisição para validar o código
    $.ajax({
        url: `${URL_API}/alterar_senha?cpf=${cpf}`,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ senha, confirmarSenha }),
        success: (res) => {
            // Exibe a mensagem de sucesso
            alertMsg(res.success, 'success', '.div-message');

            // Mostra o form de redefinir senha
            $('#form-nova-senha').hide();
            $('#form-login').css('display', 'flex');
            
            // Limpa o valor do input
            $('#input-codigo').val('');

            // Limpa o valor dos inputs de senha
            $('#input-change-password').val('');
            $('#input-confirm-change-password').val('');
        },
        error: (err) => {
            // Exibe a mensagem de erro
            alertMsg(err.responseJSON.error, 'error', '.div-message');
        }
    })
})

// Botão para voltar no form de código de recuperação
$('#btn-return-login').click(() => {
    // Mostra o form de redefinir senha
    $('#form-validar-codigo').hide();
    $('#form-login').css('display', 'flex');

    // Limpa o valor do input
    $('#input-codigo').val('');
})

// Botão para voltar no form de código de recuperação
$('#btn-return-send-code').click(() => {
    // Mostra o form de redefinir senha
    $('#form-nova-senha').hide();
    $('#form-login').css('display', 'flex');
    
    // Limpa o valor do input
    $('#input-codigo').val('');

    // Limpa o valor dos inputs de senha
    $('#input-change-password').val('');
    $('#input-confirm-change-password').val('');
})