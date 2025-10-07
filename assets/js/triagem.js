// Importa a URL da API
import { URL_API, socket } from "./urlAPI.js";
// Funções para formatar
import { formatarNumeroCPF, formatarNumeroTelefone, maskInputNumber, maskInputTemperature } from "./components/format.js";
// Função para calcular idade
import { calcularIdade, alertMsg, abledScroll, disabledScroll } from './components/utils.js'

// Função para mostrar tela loading e desabilitar scroll
function showLoading() {
    $('#div-loading').css('display', 'flex');
    // Desabilita o scroll
    disabledScroll($(document.body));
}

// Função para mostrar tela loading e desabilitar scroll
function hideLoading() {
    $('#div-loading').hide();
    // Habilita o scroll
    abledScroll($(document.body));
}

// Redirecionar para a página correta
function redirectWindow(typeUser) {
    // Obtém o tipo do usuário
    typeUser = parseInt(typeUser);

    // Divide o endereço em uma lista
    const windowArray = window.location.href.split('/');

    // Divide o endereço em uma lista
    const urlArray = windowArray[windowArray.length - 1].split('?');

    // Obtém a URL atual
    const currentWindowLocation = urlArray[0];

    // Função para verificar a localização atual
    function checkRedirect(url) {
        // Caso não esteja na url
        if (currentWindowLocation != url) {
            // Redireciona para a url
            window.location.href = url;
        }
    }

    // Redireciona para a página designada
    if (typeUser === 3) {
        checkRedirect('triagem.html');
    } else if (typeUser === 1) {
        // Redireciona para a página do administrador
        checkRedirect('administrador-perfil.html');
    } else if (typeUser === 2) {
        // Redireciona para a página do médico
        checkRedirect('medico-perfil.html');
    } else if (typeUser === 4) {
        // Redireciona para a página do recepcionista
        checkRedirect('recepcionista-perfil.html');
    } else {
        // Inválido
        checkRedirect('index.html');
    }
}

// Ao carregar a página
$(document).ready(async () => {

    // Tela de carregamento
    showLoading();

    // TESTANDO SOCKET
    socket.on("autenticado", (data) => {
        console.log(data);
    });

    // Obtém o token
    const token = localStorage.getItem('token');

    // Caso não tenha token, redireciona para login
    if (!token) {
        return window.location.href = "index.html";
    }

    // Fetch em cadastro (GET)
    await $.ajax({
        url: `${URL_API}/cadastro`,
        headers: {
            Authorization: `Bearer ${token}`
        },
        success: async (res) => {
            // Obtém os dados do usuário
            const dataUser = res.user;

            // Espera pela verificação da página
            await redirectWindow(dataUser.tipo_usuario);
        },
        error: (err) => {
            // Limpa o token
            localStorage.clear();
            // Define a mensagem de logout
            localStorage.setItem('msg-logout', err.responseJSON.error);
            // Retorna para login
            return window.location.href = "index.html";
        }
    })

    // Obtém os parâmetros
    const params = new URLSearchParams(window.location.search);

    // Obtém o CPF do usuário
    const cpf = params.get('cpf');

    // Redireciona para a página do enfermeiro caso não tenha CPF
    if (!cpf) {
        return window.location.href = 'enfermeiro-perfil.html';
    }

    // Adiciona as formatações
    maskInputTemperature($('#temperatura'));
    maskInputNumber($('#frequencia_cardiaca'), 200);
    maskInputNumber($('#saturacao'), 100);

    await $.ajax({
        url: `${URL_API}/cadastro?cpf=${cpf}`,
        headers: {
            'Authorization': `Bearer ${token}`
        },
        success: (res) => {
            // Obtém os dados do usuário
            const dadosUser = res.user;

            // Nome
            $('#nome-paciente').text(dadosUser.nome);
            // Idade
            $('#idade-paciente').text(calcularIdade(dadosUser.data_nascimento));
            // Sexo
            $('#sexo-paciente').text(dadosUser.sexo === 1 ? 'Masculino' : 'Feminino');
            // CPF
            $('#cpf-paciente').text(formatarNumeroCPF(dadosUser.cpf));
            // Telefone
            $('#telefone-paciente').text(formatarNumeroTelefone(dadosUser.telefone));
        },
        error: (err) => {
            // Usuário token não existe
            if (err.responseJSON.logout) {
                // Limpa o local storage
                localStorage.clear();

                // Redireciona para login
                return window.location.href = "index.html";
            }

            // Caso usuário não seja encontrado
            if (err.responseJSON.userNotFound) {
                // Mensagem de erro
                localStorage.setItem('userNotFound', err.responseJSON.text);

                // Redireciona para a página do enfermeiro
                return window.location.href = "enfermeiro-perfil.html";
            }

            // Alert message
            alertMsg(err.responseJSON.error, 'error', '.div-message');
        }
    })

    // Função para mostrar tela loading e desabilitar scroll
    hideLoading();
})

// Logout
$('.sair').click(() => {
    // Obtém o token
    const token = localStorage.getItem('token');

    // Autentica com o token
    socket.emit("logout", { token });
    
    // Limpa o local storage
    localStorage.clear();

    // Salva a mensagem
    localStorage.setItem('logout', 'Logout realizado com sucesso.');

    // Redireciona para login
    window.location.href = 'index.html';
})

// Botão de voltar
$('.btn-voltar').click(() => {
    // Redireciona para perfil do enfermeiro
    window.location.href = 'enfermeiro-perfil.html';
})

// Função para enviar formulário
$('.formulario-container').on('submit', function (e) {
    // Evita o comportamento padrão
    e.preventDefault();

    // Obtém o token
    const token = localStorage.getItem('token');

    // Redireciona para login
    if (!token) {
        localStorage.clear();
        return window.location.href = 'index.html';
    }

    // Obtém os parâmetros
    const params = new URLSearchParams(window.location.search);

    // Obtém o CPF do usuário
    const cpf = params.get('cpf');

    // Cria o objeto form
    const formData = new FormData(this);

    // Declara a variável
    let nivelDor;

    // Obtém o nível dor
    $('.niveis-dor').find('input').each((index, input) => {
        // Caso esteja selecionado, atualiza a variável
        if ($(input).prop('checked')) {
            nivelDor = $(input).val();
        }
    })

    // Cria o objeto data da requisição
    const data = {
        queixa: formData.get('queixa'),
        temperatura: formData.get('temperatura'),
        pressao: formData.get('pressao'),
        frequencia_cardiaca: formData.get('frequencia_cardiaca'),
        saturacao: formData.get('saturacao'),
        nivel_dor: nivelDor,
        alergia: formData.get('alergia'),
        medicamento_uso: formData.get('medicamento_uso'),
        classificacao_risco: formData.get('classificacao_risco'),
        cpf: cpf
    }

    // Requisição triagem (POST)
    $.ajax({
        url: `${URL_API}/triagem`,
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(data),
        success: (res) => {
            // Salva a mensagem
            localStorage.setItem('triagem-cadastrada', res.success);

            // Redireciona para a página do enfermeiro
            return window.location.href = 'enfermeiro-perfil.html';
        },
        error: (err) => {
            // Logout true     
            if (err.responseJSON.logout) {
                // Limpa o local storage
                localStorage.clear();
                // Salva a mensagem 
                localStorage.setItem('msg-logout', err.responseJSON.error);
                // Redireciona para login
                return window.location.href = 'index.html';
            }

            // Exibe a mensagem de erro
            alertMsg(err.responseJSON.error, 'error', '.div-message');
        }
    })
})

// Envia o formulário
$('.send').on('click', () => {
    $('.formulario-container').submit();
});
