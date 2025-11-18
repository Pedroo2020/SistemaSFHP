// Funções para formatar
import { formatCPF, formatSUS, formatTelefone, formatarNumeroSUS, formatarNumeroTelefone, formatarMinutos, formatarNumeroCPF } from './components/format.js';
// Fução para remover caracteres nao numericos
import { getNumber, alertMsg, abledScroll, disabledScroll, carregarTotalPacitentes, getTodayInputDate } from './components/utils.js';
// Importa a URL da API
import { URL_API } from './urlAPI.js';


// Função para adicionar os eventos on change aos inputs de data
function onChangeInputDate(inputDateStart, inputDateEnd) {

    inputDateStart.on('change', function () {

        let dateInputStart = inputDateStart.val();
        let dateInputEnd = inputDateEnd.val();

        if (dateInputStart > dateInputEnd) {
            inputDateStart.val(dateInputEnd);
        }

        recarregarConsultas();
    })

    inputDateEnd.on('change', function () {

        let dateInputStart = inputDateStart.val();
        let dateInputEnd = inputDateEnd.val();

        if (dateInputEnd < dateInputStart) {
            inputDateEnd.val(dateInputStart);
        }

        recarregarConsultas();
    })

}

// Obtém os botões
const botaoNovoPaciente = $('.btn-novo-paciente');
const modal = $('#modalNovoPaciente');
const fechar = $('#fechar-modal');
const voltarParaCPF = $('#voltar-cpf');
const formCPF = $('#form-cpf');
const formCadastro = $('#form-cadastro');
const formConsulta = $('#form-consulta');

// Abre o modal de novo paciente
botaoNovoPaciente.click(() => {
    modal.css('display', 'flex');
    formCPF.css('display', 'flex');

    // Desabilita o scroll
    disabledScroll($(document.body));
});

// Fecha o modal de novo paciente
fechar.click(() => {
    modal.hide();

    // Habilita o scroll
    abledScroll($(document.body));
});

// Volta para a tela de inserir CPF
voltarParaCPF.click(() => {
    // Altera o form visível
    formCadastro.hide();
    formConsulta.hide();
    formCPF.css('display', 'flex');

    // Altera o botão de voltar
    fechar.show();
    voltarParaCPF.hide();
});

// Busca pelos dados do usuário
formCPF.on('submit', ((e) => {
    // Evita o comportamento padrão
    e.preventDefault();

    // Obtem o CPF formatado e apenas dígitos
    const cpf = $('#input-cpf').val();
    const cpfOnlyNumber = getNumber(cpf);

    // Altera o botão de voltar
    fechar.hide();
    voltarParaCPF.show();

    // Requisição e lógica para validar cpf
    buscarCPF(cpfOnlyNumber, true);
}))

// Buscar dados consulta
function buscarCPF(cpfOnlyNumber, showMsg) {
    $.ajax({
        url: `${URL_API}/cadastro?cpf=${cpfOnlyNumber}`,
        method: 'GET',
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        success: (res) => {

            // Obtém os dados do usuário
            const user = res.user;

            // Exibe mensagem de usuário inativo
            if (!user.ativo) {
                alertMsg('Usuário inativo.', 'error', '#div-msg-modal');
                return;
            }

            // Mensagem de sucesso
            if (showMsg) {
                alertMsg('Usuário encontrado.', 'success', '#div-msg-modal');
            }

            // Preenche o input com o cpf do usuário
            $('#cpf-consulta').val(formatarNumeroCPF(cpfOnlyNumber));

            // Exibe o form de cadastro de consulta
            formCPF.hide();
            formConsulta.css('display', 'flex');

            // Preenche os dados do usuário
            $('#nome-consulta').val(user.nome);
            $('#sus-consulta').val(formatarNumeroSUS(user.coren_crm_sus));
            $('#email-consulta').val(user.email);
            $('#telefone-consulta').val(formatarNumeroTelefone(user.telefone));
            $('#sexo-consulta').val(user.sexo === 1 ? 'masculino' : 'feminino');
            $('#nascimento-consulta').val(new Date(user.data_nascimento).toISOString().split('T')[0]);

            // Formata o input de telefone e número do sus
            formatTelefone('#telefone-consulta', user.telefone);
            formatSUS('#sus-consulta', user.coren_crm_sus);

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

            // Caso o CPF seja válido mas o usuário não seja encontrado
            if (err.responseJSON.userNotFound) {
                // Preenche o input com o cpf do usuário
                $('#cpf-cadastro').val(formatarNumeroCPF(cpfOnlyNumber));
                // Formata o input de CPF
                formatCPF('#cpf-cadastro', cpfOnlyNumber);
                formatTelefone('#telefone-cadastro');
                formatSUS('#sus-cadastro');

                // Torna visível o form de cadastro
                formCPF.hide();
                formCadastro.css('display', 'flex');
            }

            // Exibe mensagem de erro
            alertMsg(err.responseJSON.error, 'error', '#div-msg-modal');

        }
    })
}

// Cadastrar usuário
formCadastro.on('submit', function (e) {
    // Evita comportamento padrão
    e.preventDefault();

    // Formata os dados
    const form = new FormData(this);

    const data = {
        nome: form.get('nome-cadastro'),
        email: form.get('email-cadastro'),
        telefone: getNumber(form.get('telefone-cadastro')),
        cpf: getNumber(form.get('cpf-cadastro')),
        coren_crm_sus: getNumber(form.get('sus-cadastro')), // String
        sexo: form.get('sexo-cadastro') === 'masculino' ? 1 : 2,
        nascimento: form.get('nascimento-cadastro'),
        tipo_usuario: 5
    }

    // Função para cadastrar usuário
    cadastrarUsuario(data, form.get('cpf-cadastro'));
})

// Função para cadastrar usuário
function cadastrarUsuario(data, cpf) {
    $.ajax({
        url: `${URL_API}/cadastro`,
        method: 'POST',
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        contentType: 'Application/json',
        data: JSON.stringify(data),
        success: (res) => {
            // Exibe mensagem de sucesso
            alertMsg(res.success, 'success', '#div-msg-modal');

            // Preenche os dados do usuário
            $('#cpf-consulta').val(cpf);
            $('#nome-consulta').val(data.nome);
            $('#sus-consulta').val(formatarNumeroSUS(data.coren_crm_sus));
            $('#email-consulta').val(data.email);
            $('#telefone-consulta').val(formatarNumeroTelefone(data.telefone));
            $('#sexo-consulta').val(data.sexo === 1 ? 'masculino' : 'feminino');
            $('#nascimento-consulta').val(data.nascimento);

            // Formata os inputs de telefone e número do sus 
            formatTelefone('#telefone-consulta', data.telefone);
            formatSUS('#sus-consulta', data.coren_crm_sus);

            // Exibe o form de cadastro de consulta
            formCadastro.hide();
            formCadastro[0].reset();
            formConsulta.css('display', 'flex');
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

            // Exibe mensagem de erro
            alertMsg(err.responseJSON.error, 'error', '#div-msg-modal');
        }
    })
}

// Form de cadastro de consulta
formConsulta.on('submit', function (e) {
    // Previne o evento padrão do navegador
    e.preventDefault();

    // Cria o objeto data
    const data = {
        situacao: 1,
        cpf: getNumber($('#cpf-consulta').val()),
    }

    $.ajax({
        url: `${URL_API}/consulta`,
        method: 'POST',
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        contentType: 'Application/json',
        data: JSON.stringify(data),
        success: (res) => {
            // Fecha o modal e habilita o scroll
            modal.hide();
            formConsulta.hide();
            abledScroll($(document.body));

            // Reseta os valores dos forms
            formConsulta[0].reset();
            formCPF[0].reset();

            // Atualiza as consultas
            recarregarConsultas();

            // Exibe mensagem de sucesso
            alertMsg(res.success, 'success', '#div-msg');
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

            // Exibe mensagem de erro
            alertMsg(err.responseJSON.error, 'error', '#div-msg-modal');
        }
    })
})

// Função para mostrar tela loading e desabilitar scroll
function hideLoading() {
    $('#div-loading').hide();
    // Habilita o scroll
    abledScroll($(document.body));
}

// Carrega a tabela ao carregar a página
$(document).ready(async () => {

    // Carrega as consultas na fase de entrada
    await carregarConsultas('1');

    // Adicionando os ventos on change aos inputs date
    await onChangeInputDate($('#filtro-date-start'), $('#filtro-date-end'));

    // Obtendo a data atual
    await getTodayInputDate($('#filtro-date-start'), $('#filtro-date-end'));

    // Função para carregar os dados do painel
    await carregarTotalPacitentes($("#totalPacientes"), $("#casosUrgentes"), $("#tempoMedioEspera"), $('#filtro-date-start').val(), $('#filtro-date-end').val());

    // Adiciona formatação aos inputs de cpf
    await formatCPF('#input-cpf');
    await formatCPF('#cpf-consulta');

    // Retira a tela de loading
    hideLoading();

})

// Ao clicar no botão, atualiza as consultas
$('#refresh-consultas').on('click', async () => {
    // Adiciona a animação de girar ao botão
    $('#refresh-icon').addClass('refreshing');

    // Recarregar consultas
    await recarregarConsultas();

    // Remove a animação de girar ao botão
    $('#refresh-icon').removeClass('refreshing');
});

// Função para recarrregar consultas com a situação atual
function recarregarConsultas() {
    // Declara a variável
    let situacao;

    // Percorre todos os elementos do filtro consulta
    $('.filtro-consulta').each((_, item) => {
        // Transforma em objeto jquery
        const $item = $(item);

        // Caso o objeto tenha a class active
        if ($item.hasClass('active')) {
            // Atualiza o valor da situação
            return situacao = $item.attr('sit');
        }
    })

    // Obtém o valor do like
    const like = $('#input-search-usuario').val();

    // Caso situação exista, refaz a busca
    if (situacao) {
        carregarConsultas(situacao, like);
    }

    // Recarrega os dados do painel
    carregarTotalPacitentes($("#totalPacientes"), $("#casosUrgentes"), $("#tempoMedioEspera"), $('#filtro-date-start').val(), $('#filtro-date-end').val());
}

// Função para carregar consultas
function carregarConsultas(situacao, like) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${URL_API}/consultas/${situacao}${like ? `?s=${like}` : ''}`,
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            success: (res) => {
                // Obtém as consultas
                const consultas = res.consultas;

                // Limpa a tabela antes de carregar novos dados
                $('#table-consultas').empty();

                if (consultas.length > 0) {
                    // Carrega as consultas na tabela
                    consultas.map((consulta) => addConsulta(consulta));
                } else {

                    // Adiciona uma mensagem de sem resultados encontrados
                    const consultasNotFound = $('<tr></tr>')
                        .append($('<td></td>')
                            .text('Nenhum resultado encontrado para essa busca')
                            .addClass('consultas-not-found')
                            .attr('colspan', 9))

                    // Adiciona a cédula a tabela
                    $('#table-consultas').append(consultasNotFound);

                }


                // Obtém a data e hora atual
                const dataAtual = new Date()

                // Formata a data em padrão brasileiro
                const dataFormatada = dataAtual.toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false // mantém no formato 24h
                });

                // Atualiza a data e hora da última atualização
                $('.last-att').text(`Última atualização: ${dataFormatada}`);

                // Resolve a promise
                resolve();
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

                // Exibe mensagem de erro
                alertMsg(err.responseJSON.error, 'error', '#div-msg-modal');

                // Erro na promise
                reject(err);
            }
        })
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

// Função para adicionar os dados a tabela
function addConsulta(consulta) {
    // tbody
    const $tbody = $('#table-consultas');

    // Cria a <tr></tr> 
    const $tr = $('<tr></tr>');

    // Cria as tds
    const posicao = $('<td></td>')
        .text(`${consulta.posicao}°`)
        .addClass('td-numero')

    const nome = $('<td></td>')
        .text(consulta.nome)
        .addClass('td-string')

    const idade = $('<td></td>')
        .text(consulta.idade)
        .addClass('td-numero')

    const sexo = $('<td></td>')
        .text(consulta.sexo)
        .addClass('td-string')

    const prioridade = $('<td></td>')
        .addClass('td-time')

    // Caso exista prioridade, cria a etiqueta
    if (consulta.classificacao_risco) {
        prioridade.append(criarEtiquetaPrioridade(consulta.classificacao_risco))
    } else {
        // Senão, adiciona o texto ~
        prioridade.text('~');
    }

    const entrada = $('<td></td>')
        .text(consulta.data_entrada)
        .addClass('td-time')

    const tempoDecorrido = $('<td></td>')
        .text(formatarMinutos(consulta.tempo_decorrido))
        .addClass('td-time')

    const etapa = $('<td></td>')
        .text(consulta.situacao)
        .addClass('td-time')

    // Ícone de ação
    const iconeMoreDetails = $('<i></i>').addClass('fa-solid fa-ellipsis icon-more-details');
    const iconAcao = $('<td></td>')
        .append(iconeMoreDetails)
        .addClass('td-time');

    // Adiciona os elementos ao tr
    $tr
        .append(posicao)
        .append(nome)
        .append(idade)
        .append(sexo)
        .append(prioridade)
        .append(entrada)
        .append(tempoDecorrido)
        .append(etapa)

    // Adiciona ao tbody
    $tbody.append($tr);
}

// Filtro da consulta
$('.filtro-consulta').each((_, element) => {
    // Transforma em objeto jquery
    const $element = $(element);

    // Função on click
    $element.on('click', function () {

        // Obtém o valor do like
        const like = $('#input-search-usuario').val();

        // Percorre todos os elementos do filtro consulta
        $('.filtro-consulta').each((_, item) => {
            // Transforma em objeto jquery
            const $item = $(item);

            // Verifica se o objeto é diferente do objeto clicado
            if ($item[0] !== this) {
                // Remove a class active
                return $item.removeClass('active');
            }

            // Obtém a situação do filtro
            const situacao = $item.attr('sit');

            // Carrega as consultas
            carregarConsultas(situacao, like);

            // Adiciona a class active
            return $item.addClass('active');
        })
    })

})

// Evento input do input search
$('#input-search-usuario').on('input', function () {

    // Obtém o like
    const like = $(this).val();

    // Percorre todos os elementos do filtro consulta
    $('.filtro-consulta').each((_, item) => {
        // Transforma em objeto jquery
        const $item = $(item);

        // Verifica se o objeto é diferente do objeto clicado
        if ($item.hasClass('active')) {
            // Obtém a situação do filtro
            const situacao = $item.attr('sit');

            // Carrega as consultas
            carregarConsultas(situacao, like);
        }
    })
})

// Desabilitar ou habilitar inputs quando inativo
function ableDisableInputs(form, boolean) {
    const inputs = $(`${form} input`);
    const selects = $(`${form} select`);

    // Desabilita os inputs
    inputs.map((index, input) => {
        $(input).prop('disabled', boolean);
    })

    // Desabilita os selects
    selects.map((index, select) => {
        $(select).prop('disabled', boolean);
    })

    // Habilita ou desabilita os botões
    if (!boolean) {
        $('#btn-atualizar-paciente').css('display', 'flex');
        $('#btn-cadastrar-consulta').hide();
    } else {
        $('#btn-cadastrar-consulta').css('display', 'flex');
        $('#btn-atualizar-paciente').hide();
    }
}

// Botão de ativar modo de edição
$('#btn-edit-paciente').click(function () {

    if ($('#btn-edit-paciente').hasClass('on')) {
        // Desabilita a ediçaõ
        return habilitarDesabilitarEdicao(false, true);
    }

    // Habilita a edição
    habilitarDesabilitarEdicao(true, false);
})

// Função para habilitar/desabilitar edição
function habilitarDesabilitarEdicao(editon, canceled) {
    // Desativa caso ativa
    if (!editon) {
        $('#btn-edit-paciente')
            .removeClass('on')
            .addClass('off')
            .text('Editar');

        // Desabilita os botões
        ableDisableInputs('#form-consulta', true);

        if (canceled) {
            // Busca os dados antigos
            buscarCPF($('#cpf-antigo').val(), false);
        }

    } else {
        $('#btn-edit-paciente')
            .removeClass('off')
            .addClass('on')
            .text('Cancelar');

        // Habilita os botões
        ableDisableInputs('#form-consulta', false);

        // Salva o valor do CPF antigo
        $('#cpf-antigo').val(getNumber($('#cpf-consulta').val()));
    }

}

// Botão de salvar alterações
$('#btn-atualizar-paciente').click(() => {
    // Cria o objeto data
    const data = {
        nome: $('#nome-consulta').val(),
        email: $('#email-consulta').val(),
        telefone: getNumber($('#telefone-consulta').val()),
        cpfAntigo: getNumber($('#cpf-antigo').val()),
        cpfNovo: getNumber($('#cpf-consulta').val()),
        coren_crm_sus: getNumber($('#sus-consulta').val()), // String
        sexo: $('#sexo-consulta').val() === 'masculino' ? 1 : 2,
        nascimento: $('#nascimento-consulta').val(),
        tipo_usuario: 5,
        ativo: 1
    }

    // Função para cadastrar usuário
    atualizarUsuario(data, $('#cpf-consulta').val());
})

// Atualizar usuário
function atualizarUsuario(data, cpf) {
    $.ajax({
        url: `${URL_API}/cadastro`,
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        contentType: 'Application/json',
        data: JSON.stringify(data),
        success: (res) => {
            // Exibe mensagem de sucesso
            alertMsg(res.success, 'success', '#div-msg-modal');

            // Preenche os dados do usuário
            $('#cpf-consulta').val(cpf);
            $('#nome-consulta').val(data.nome);
            $('#sus-consulta').val(formatarNumeroSUS(data.coren_crm_sus));
            $('#email-consulta').val(data.email);
            $('#telefone-consulta').val(formatarNumeroTelefone(data.telefone));
            $('#sexo-consulta').val(data.sexo === 1 ? 'masculino' : 'feminino');
            $('#nascimento-consulta').val(data.nascimento);

            // Formata os inputs de telefone e número do sus 
            formatTelefone('#telefone-consulta', data.telefone);
            formatSUS('#sus-consulta', data.coren_crm_sus);

            // Exibe o form de cadastro de consulta
            formConsulta.css('display', 'flex');

            // Desabilita a edição
            habilitarDesabilitarEdicao(false, false);
        },
        error: (err) => {
            console.log(err)
            // Logout true     
            if (err.responseJSON.logout) {
                // Limpa o local storage
                localStorage.clear();
                // Salva a mensagem 
                localStorage.setItem('msg-logout', err.responseJSON.error);
                // Redireciona para login
                return window.location.href = 'index.html';
            }

            // Exibe mensagem de erro
            alertMsg(err.responseJSON.error, 'error', '#div-msg-modal');
        }
    })
}
