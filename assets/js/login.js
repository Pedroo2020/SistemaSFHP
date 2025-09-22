// Importa a URL da API
import URL_API from './urlAPI.js';

// Variável de controle do valor anterior
let lastValue = '';

// Ao alterar o input de CPF
$('#input-cpf').on('input', function(e) {
    // Pega só os números do input
    let value = $(this).val().replace(/\D/g, '');

    // Não permite que passe de 14 caracteres
    if (value.length > 11) {
        value = lastValue;
    }

    // Detecta se foi apagado
    let inputType = e.originalEvent.inputType;

    // Caso o evento seja de apagar
    if (inputType === "deleteContentBackward" || inputType === "deleteContentForward") {
        value = lastValue.slice(0, -1);
    }

    // Atualiza o valor anterior
    lastValue = value;

    // Máscara base
    let formatted = '___.___.___-__';

    // Preenche a máscara com os números
    for (let i = 0; i < value.length && i < 11; i++) {
        formatted = formatted.replace('_', value[i]);
    }

    $(this).val(formatted);
});

// Ao sair do input de CPF
$('#input-cpf').on('blur', function(e) {
    // Pega só os números do input
    let value = $(this).val().replace(/\D/g, '');

    // Caso esteja vazio, tira os underlines
    if (!value.length) {
        $(this).val('');
    }
});

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

// Mostrar mensagem de erro
function alertMsg(msg, type) {
    
    // Obtém a div de mensagem
    const $divMsg = $('.div-message');

    // Cria a div
    const $div = $('<div></div>')
                    .addClass(`msg ${type}`);

    // Cria o ícone
    const $icon = $('<i></i>')
                    .addClass(`fa-solid ${type === 'error' ? 'fa-xmark' : 'fa-check'}`);

    // Cria o parágrafo
    const $p = $('<p></p>')
                    .text(msg);

    // Adiciona cada elemento a seu respectivo pai
    $div.append($icon, $p).appendTo($divMsg);

    $div.on('animationend', () => {
        $div.remove();
    })
}

// Envio do formulário de login
$('.formulario').on('submit', (e) => {
    // Evita o comportamento padrão
    e.preventDefault();

    // Obtém os valores
    const cpfVal = $('#input-cpf').val().replace(/\D/g, '');
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

            // Salva no localStorage
            localStorage.setItem('token', token);

            // Obtém o tipo do usuário
            const typeUser = parseInt(res.tipo_usuario);

            // Redireciona para a página designada
            if (typeUser === 1) {
                // ADM
                location.href = 'administrador-perfil.html';
            } else if (typeUser === 2) {
                // Médico
                location.href = 'medico-perfil.html';
            } else if (typeUser === 3) {
                // Enfermeiro
                location.href = 'enfermeiro-perfil.html';
            } else if (typeUser === 4) {
                // Recepcionista
                location.href = 'recepcionista-perfil.html';
            } else {
                // Inválido
                alertMsg('Login inválido', 'error');  
            }
        },
        error: (err) => {
            // Exibe a mensagem de erro
            alertMsg(err.responseJSON.error, 'error');  
        }
    })
})

// Btn recuperar senha
$('.rec-senha').click(() => {
    // Recuperar senha
})