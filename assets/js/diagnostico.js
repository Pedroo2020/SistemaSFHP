// Importa a URL da API
import { URL_API, socket } from "./urlAPI.js";
// Funções para formatar
import { formatarNumeroCPF, formatarNumeroTelefone, formatarPressaoArterial } from "./components/format.js";
// Função para calcular idade
import { calcularIdade, alertMsg, abledScroll, disabledScroll } from './components/utils.js'

// Função para mostrar tela loading e desabilitar scroll
function hideLoading() {
    $('#div-loading').hide();
    // Habilita o scroll
    abledScroll($(document.body));
}

// Chama ao carregar a página
$(document).ready(async function () {
    try {
        await carregarDadosUser();
        await carregarDadosTriagem();
    } catch (err) {
        console.warn("Erro ao carregar triagem:", err.responseJSON.error);
    }

    // Verifica se está informando id consulta nos parâmetros
    const urlParams = new URLSearchParams(window.location.search);
    const idConsulta = urlParams.get("id_consulta");

    // Caso esteja buscando pela consulta, busca pelo diagnóstico
    if (idConsulta) {
        await carregarDadosDiagnostico();
        
        // Altera o título da página
        $('#title-page').text('Informações da consulta');

        // Altera o título do navegador
        $('#title-nav').text('SFHP - Informações da consulta');

        // Esconde elementos do header
        $('#caminho-consulta').hide();
        $('#span-consulta').hide();

        // Muda o texto
        $('#caminho-page').text('Informações da consulta');
    }

    // Botão de voltar
    $('.btn-voltar').click(() => {
        // Redireciona para perfil do enfermeiro
        window.location.href = idConsulta ? 'administrador-perfil.html' : 'medico-perfil.html';
    })

    // Retira a tela de loading
    hideLoading();
});

const sexos = {
    1: "Masculino",
    2: "Feminino"
};

// Função para carregar os usuários
function carregarDadosUser() {

    return new Promise((resolve, reject) => {
        const urlParams = new URLSearchParams(window.location.search);
        const cpf = urlParams.get("cpf");
        const idConsulta = urlParams.get("id_consulta");

        if (!cpf && !idConsulta) {
            window.location.href = 'medico-perfil.html';
            return;
        }

        // Monta a url passando o parâmetro
        const url = `${URL_API}/cadastro?${cpf ? `cpf=${cpf}` : `id_consulta=${idConsulta}`}`;

        $.ajax({
            url: url,
            method: "GET",
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            },
            success: (res) => {

                const user = res.user;

                // ===== Preenche os campos =====
                $("#nome-paciente").text(user.nome);
                $("#cpf-paciente").text(formatarNumeroCPF(user.cpf));
                $("#telefone-paciente").text(formatarNumeroTelefone(user.telefone));
                $("#sexo-paciente").text(sexos[user.sexo]);

                // Idade
                const idade = calcularIdade(user.data_nascimento);
                $("#idade-paciente").text(idade ? idade + " anos" : "—");

                // Sucesso
                resolve();
            },
            error: (err) => {
                if (err.responseJSON?.logout) {
                    localStorage.clear();
                    localStorage.setItem("msg-logout", err.responseJSON.error);
                    return window.location.href = "index.html";
                }

                alertMsg("Erro ao carregar usuário.", "error", "#div-msg-modal");

                // Erro
                reject(err);
            }
        });
    })
}

// Função para carregar os dados da triagem
async function carregarDadosTriagem() {

    return new Promise((resolve, reject) => {
        const urlParams = new URLSearchParams(window.location.search);
        const cpf = urlParams.get("cpf");
        const idConsulta = urlParams.get("id_consulta");

        if (!cpf && !idConsulta) {
            window.location.href = 'medico-perfil.html';
            return;
        }

        // Monta a url passando o parâmetro
        const url = `${URL_API}/triagem?${cpf ? `cpf=${cpf}` : `id_consulta=${idConsulta}`}`;

        $.ajax({
            url: url,
            method: "GET",
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            },
            success: (res) => {
                const triagem = res.triagem;

                if (!triagem) {
                    console.warn("Nenhum dado de triagem encontrado.");
                    return;
                }

                // ===== Preenche os campos ===== //
                $("#queixa-principal").text(triagem.queixa);
                $("#temperatura-paciente").text(triagem.temperatura ? triagem.temperatura + " °C" : "—");
                $("#pressao-arterial-paciente").text(formatarPressaoArterial(triagem.pressao || "—"));
                $("#frequencia-cardiaca-paciente").text(triagem.frequencia_cardiaca ? triagem.frequencia_cardiaca + " bpm" : "—");
                $("#saturacao-oxigenio-paciente").text(triagem.saturacao ? triagem.saturacao + "%" : "—");
                $("#alegias-paciente").text(triagem.alergia || "—");
                $("#medicamentos-uso-paciente").text(triagem.medicamento_uso || "—");

                var a = ['', 'Leve', 'Pouco urgente', 'Urgente', 'Muito urgente', 'Risco de vida']

                var div = criarEtiquetaPrioridade(a[triagem.classificacao_risco])
                $("#prioridade").html(div)

                // Obtém o nível de dor
                const nivelDor = triagem.nivel_dor;

                // Obtém a div pai dos inputs
                const divInputsNivelDor = $('#nivel_dor');

                // Percorre todos até achar o valor igual
                divInputsNivelDor.find('input').each((index, input) => {
                    // Caso seja igual, marca como checked
                    if ($(input).val() === String(nivelDor)) {
                        $(input).prop('checked', true);
                        return false;
                    }
                })

                // Sucesso
                resolve();
            },
            error: (err) => {
                if (err.responseJSON?.logout) {
                    localStorage.clear();
                    localStorage.setItem("msg-logout", err.responseJSON.error);
                    return window.location.href = "index.html";
                }

                // Mostra mensagem de dados ainda não cadastrados
                $('#triagem-nao-cadastrada').css('display', 'flex');

                // Erro
                reject(err);
            }
        });
    })
}

// Função para carregar os dados do diagnóstico
function carregarDadosDiagnostico() {

    return new Promise((resolve, reject) => {
    
        const urlParams = new URLSearchParams(window.location.search);
        const idConsulta = urlParams.get("id_consulta");
    
        if (!idConsulta) {
            window.location.href = 'administrador-perfil.html';
            return;
        }
    
        // Monta a url passando o parâmetro
        const url = `${URL_API}/diagnostico?id_consulta=${idConsulta}`;
    
        $.ajax({
            url: url,
            method: "GET",
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            },
            success: (res) => {
                // Obtém o diagnóstico
                const diagnostico = res.diagnostico;
    
                // ===== Preenche os campos e desabilita ===== //
                $("#diagnostico")
                    .text(diagnostico.diagnostico)
                    .prop('disabled', true);
                $("#receita")
                    .text(diagnostico.receita)
                    .prop('disabled', true);
                $("#enfermagem")
                    .text(diagnostico.enfermagem || 'N/A')
                    .prop('disabled', true);
    
                // Esconde o botão de alta e exibe os botões de exportar receita
                $('#btn-alta').hide();
                $('.div-btns-pdf').css('display', 'flex');
    
                // Não exibe o botão de exportar receita de enfermagem se não tiver receita
                if (!diagnostico.enfermagem) {
                    $('#btn-receita-enfermagem').hide();
                }
    
                // Busca pela mensagem de sucesso no local storage
                const msgSucesso = localStorage.getItem('diagnosticoCadastrado');
                
                // Exibe a mensagem de sucesso se tiver
                if (msgSucesso) {
                    alertMsg(msgSucesso, 'success', '.div-message');
                    localStorage.removeItem('diagnosticoCadastrado');
                }

                // ===== Preenche os campos e desabilita ===== //
                $("#diagnostico")
                    .prop('disabled', true);
                $("#receita")
                    .prop('disabled', true);
            
                // Esconde o botão de alta
                $('#btn-alta').hide();
                
                // Sucesso
                resolve();

            },
            error: (err) => {
                if (err.responseJSON?.logout) {
                    localStorage.clear();
                    localStorage.setItem("msg-logout", err.responseJSON.error);
                    return window.location.href = "index.html";
                }
    
                // Redireciona para o perfil do administrador
                window.location.href = 'administrador-perfil.html';

                // Erro
                reject(err);
            }
        });
    })
}

// Função para criar a etiqueta de prioridade
function criarEtiquetaPrioridade(prioridade) {
    // Cria a div principal
    const div = $('<div></div>').addClass('etiqueta-prioridade');

    // Adiciona a cor de fundo conforme a prioridade
    if (prioridade === 'Leve') {
        div.addClass('leve');
    } else if (prioridade === 'Pouco urgente') {
        div.addClass('pouco-urgente');
    } else if (prioridade === 'Urgente') {
        div.addClass('urgente');
    } else if (prioridade === 'Muito urgente') {
        div.addClass('muito-urgente');
    } else if (prioridade === 'Risco de vida') {
        div.addClass('risco-vida');
    }

    // Cria o elemento de texto
    const p = $('<p></p>').text(prioridade);

    // Adiciona o p a div
    div.append(p);

    // Retorna a etiqueta
    return div;
}

// Função para focar um input / textarea
function focusInput(input) {
    $(input)
        .css({
            'outline': 'var(--red-base)',
            'border-color': 'var(--red-base)'
        })
        .focus();
}

// Função para desfocar um input / textarea
function unfocusInput(input) {
    $(input)
        .css({
            'outline': 'var(--blue-dark)',
            'border-color': 'var(--gray-300)'
        })
}

// Função para marcar em vermelho input vazio
function showInputEmpty() {

    // Obtém a textarea
    const diagnostico = $('#diagnostico');

    // Verifica se está vazio
    if (!diagnostico.val().trim('')) {

        // Borda em vermelha e foca a text area
        focusInput(diagnostico);

        // Evento input para a textarea
        diagnostico.on('input', function () {
            // Desfoca o input caso esteja preenchido
            if ($(diagnostico).val().trim('')) {
                unfocusInput($(diagnostico));
            }
        })

        return;
    }

    // Desfoca a textarea
    unfocusInput(diagnostico);

    // Obtém a textarea
    const receita = $('#receita');

    // Verifica se está vazio
    if (!receita.val().trim('')) {

        // Borda em vermelha e foca a text area
        focusInput(receita);

        // Evento input para a textarea
        receita.on('input', function () {
            // Desfoca o input caso esteja preenchido
            if ($(receita).val().trim('')) {
                unfocusInput($(receita));
            }
        })

        return;
    }


    // Desfoca a textarea
    unfocusInput(receita);
}

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

    // Cria o objeto data da requisição
    const data = {
        diagnostico: formData.get('diagnostico'),
        receita: formData.get('receita'),
        enfermagem: formData.get('enfermagem'),
        cpf: cpf
    }

    // Requisição triagem (POST)
    $.ajax({
        url: `${URL_API}/diagnostico`,
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(data),
        success: (res) => {
            // Exibe a mensagem de sucesso
            localStorage.setItem('diagnosticoCadastrado', res.success);

            return window.location.href = `diagnostico.html?id_consulta=${res.id_consulta}`;
        },
        error: (err) => {
            // Logout true     
            if (err.responseJSON.logout) {
                // Limpa o local storage
                localStorage.clear();
                // Salva a mensagem 
                localStorage.setItem('div-message', err.responseJSON.error);
                // Redireciona para login
                return window.location.href = 'index.html';
            }

            // Mostra o input vazio
            showInputEmpty();

            // Exibe a mensagem de erro
            alertMsg(err.responseJSON.error, 'error', '.div-message');
        }
    })
})

// Evento de clique nos botões de exportação
$('.btn-export').on('click', function (e) {
    e.preventDefault();

    // Obtém o token
    const token = localStorage.getItem('token');

    // Redireciona para login se não tiver token
    if (!token) {
        localStorage.clear();
        return window.location.href = 'index.html';
    }

    // Obtém os parâmetros da URL (ex: ?id_consulta=5)
    const urlParams = new URLSearchParams(window.location.search);
    const idConsulta = urlParams.get("id_consulta");

    // Identifica o tipo de receita que o botão representa
    const tipo = $(this).data('tipo'); // "paciente" ou "enfermagem"

    // Monta a URL da rota
    const url = `${URL_API}/relatorio/receita/${tipo}/${idConsulta}`;

    // Abre o pdf em uma nova aba
    window.open(url, '_blank');
});