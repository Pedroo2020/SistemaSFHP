// Importa a URL da API
import { URL_API } from './urlAPI.js';
// Função para calcular idade e remover caracteres nao numericos
import { calcularIdade, getNumber, alertMsg, carregarTotalPacitentes } from './components/utils.js';
// Funções para formatar
import { formatCPF, formatTelefone, formatSUS, formatarNumeroCPF, formatarNumeroTelefone, formatarNumeroSUS } from './components/format.js';

// Função para desabilitar o scroll
function disabledScroll() {
    $(document.body).css('overflow', 'hidden');
}

// Função para habilitar o scroll
function abledScroll() {
    $(document.body).css('overflow', 'auto');
}

const botaoNovoUsuario = $('.btn-add-user');
const modalNovoUsuario = $('#modalNovoUsuario');
const modalEditarUsuario = $('#modalEditarUsuario')
const fecharModalAdicionarUsuario = $('#fechar-modal-adicionar-usuario');
const fecharModalEditarUsuario = $('#fechar-modal-editar-usuario')

// Abre o modal de novo usuário
botaoNovoUsuario.click(() => {
    modalNovoUsuario.css('display', 'flex');
    disabledScroll();
});

// Fecha o modal de novo usuario
fecharModalAdicionarUsuario.click(() => {
    modalNovoUsuario.hide();
    abledScroll();
    $('#modalNovoUsuario').find('input, textarea').val('');
});

// Função para carregar os usuários
function carregarUsuarios(tipoUsuario, like) {

    // Limpa a tabela antes de carregar novos dados
    $('#table-usuarios').empty();

    function addNotFound() {
        // Adiciona uma mensagem de sem resultados encontrados
        const userNotFound = $('<tr></tr>')
            .append($('<td></td>')
                .text('Nenhum resultado encontrado para essa busca')
                .addClass('consultas-not-found')
                .attr('colspan', 9))

        // Adiciona a cédula a tabela
        $('#table-usuarios').append(userNotFound);
    }

    let searchParams = []

    if (tipoUsuario) {
        searchParams.push(`t=${tipoUsuario}`)
    }

    if (like) {
        searchParams.push(`s=${like}`)
    }

    $.ajax({
        url: `${URL_API}/users${searchParams ? `?${searchParams.join('&')}` : ""}`,
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        success: (res) => {

            // Obtém os usuários
            const usuarios = res.users;

            if (usuarios.length > 0) {
                // Carrega os usuários na tabela
                usuarios.map((user) => addUser(user));
            } else {
                addNotFound();
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

            // Adiciona mensagem de não encontrado
            addNotFound();
        }
    })
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
            carregarUsuarios(situacao, like);

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
            carregarUsuarios(situacao, like);
        }
    })
})

// Função para adicionar os dados a tabela
function addUser(user) {
    // Lista de cargos
    const cargos = {
        1: "Administrador",
        2: "Médico",
        3: "Enfermeiro",
        4: "Recepcionista",
        5: "Paciente"
    };

    // tbody
    const $tbody = $('#table-usuarios');

    // Cria a <tr></tr> 
    const $tr = $('<tr></tr>');

    const nome = $('<td></td>')
        .text(user.nome)
        .addClass('td-string')

    const idadeNumber = calcularIdade(user.data_nascimento);

    const idade = $('<td></td>')
        .text(idadeNumber)
        .addClass('td-numero')

    const sexo = $('<td></td>')
        .text(user.sexo === 1 ? 'Masculino' : 'Feminino')
        .addClass('td-string')

    const cargo = $('<td></td>')
        .text(cargos[user.tipo_usuario])
        .addClass('td-string')

    const susCorenCRMText = user.coren_crm_sus ? user.tipo_usuario == 5 ? formatarNumeroSUS(user.coren_crm_sus) : user.coren_crm_sus : '~';

    const susCorenCRM = $('<td></td>')
        .text(susCorenCRMText)
        .addClass('td-numero')

    // Ícone de ação
    const iconeMoreDetails = $('<i></i>')
        .addClass('fa-solid fa-ellipsis icon-more-details')
        .attr('data-cpf', user.cpf);

    const iconAcao = $('<td></td>')
        .append(iconeMoreDetails)
        .addClass('td-time');

    // Adiciona os elementos ao tr
    $tr
        .append(nome)
        .append(idade)
        .append(sexo)
        .append(cargo)
        .append(susCorenCRM)
        .append(iconAcao)

    // Adiciona ao tbody
    $tbody.append($tr);
}

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

// Puxar dados da API para montar a tabela
$(document).ready(async function () {
    await carregarUsuarios();

    // Carrega os dados do painel
    await carregarTotalPacitentes($("#totalPacientes"), $("#totalConsultas"), $("#tempoMedioEspera"), true);

    // Retira a tela de loading
    hideLoading();
});


// Clique no ícone "..." para abrir modal editar usuário
$(document).on("click", ".icon-more-details", function () {
    const cpf = $(this).attr("data-cpf");
    const url = `${URL_API}/cadastro?cpf=${cpf}`;
    const token = localStorage.getItem("token");

    const cargos = {
        1: "Administrador",
        2: "Medico",
        3: "Enfermeiro",
        4: "Recepcionista",
        5: "Paciente"
    };

    const sexos = {
        1: "Masculino",
        2: "Feminino"
    };

    $.ajax({
        url: url,
        type: "GET",
        headers: {
            "Authorization": "Bearer " + token
        },
        success: function (response) {

            const user = response.user;

            // Habilita ou desabilita os inputs
            ableDisableInputs('#form-editar', !user.ativo);

            // Preenche os inputs básicos
            $("#nome-editar").val(user.nome);
            $("#email-editar").val(user.email);

            // Preenche com as formatações
            $("#cpf-editar").val(formatarNumeroCPF(user.cpf));
            $("#telefone-editar").val(formatarNumeroTelefone(user.telefone));

            // Formata o input de cpf e telefone
            formatCPF($("#cpf-editar"), user.cpf)
            formatTelefone($('#telefone-editar'), user.telefone);

            // Salva o valor do CPF antigo no input hidden
            $('#old-cpf').val(cpf);

            // Formata a data corretamente
            if (user.data_nascimento) {
                const dataRecebida = new Date(user.data_nascimento);
                const ano = dataRecebida.getUTCFullYear();
                const mes = String(dataRecebida.getUTCMonth() + 1).padStart(2, '0');
                const dia = String(dataRecebida.getUTCDate()).padStart(2, '0');

                const dataFormatada = `${ano}-${mes}-${dia}`;

                $("#nascimento-editar").val(dataFormatada);
            } else {
                $("#nascimento-editar").val('');
            }

            // Seleciona sexo e tipo usuário
            $("#sexo-editar").val(sexos[user.sexo]).trigger("change");
            $("#tipo-user-editar").val(cargos[user.tipo_usuario]).trigger("change");

            if (user.tipo_usuario === 5) {
                $('#btn-ver-consultas').show();
            } else {
                $('#btn-ver-consultas').hide();
            }

            // Campos extras
            $(".campo-extra-crm-editar").css("display", "none");
            $(".campo-extra-coren-editar").css("display", "none");
            $(".campo-extra-senha").css("display", "none");

            // Limpa valores antigos
            $("#senha-editar").val("");
            $("#crm-editar").val("");
            $("#coren-editar").val("");

            // Determina o tipo de usuário
            const tipo = (cargos[user.tipo_usuario] ?? "").toLowerCase();

            // Lógica de exibição dos campos extras
            if (tipo === "administrador" || tipo === "recepcionista") {
                // Mostra campo de senha
                $(".campo-extra-senha").css("display", "flex");
                $("#senha-editar").val(user.senha ?? "");
                $("#sus-editar").val(""); // sem SUS

            } else if (tipo === "medico") {
                $(".campo-extra-senha").show();
                $(".campo-extra-crm-editar").show();
                $("#senha-editar").val(user.senha ?? "");
                $("#crm-editar").val(user.coren_crm_sus ?? "");
                $("#sus-editar").val("");

            } else if (tipo === "enfermeiro") {
                $(".campo-extra-senha").show();
                $(".campo-extra-coren-editar").show();
                $("#senha-editar").val(user.senha ?? "");
                $("#coren-editar").val(user.coren_crm_sus ?? "");
                $("#sus-editar").val("");

            } else if (tipo === "paciente") {
                // Apenas número do SUS
                $("#sus-editar").val(formatarNumeroSUS(user.coren_crm_sus))
                formatSUS($("#sus-editar"), user.coren_crm_sus);
            }

            // Abre o modal
            $("#modalEditarUsuario").css("display", "flex");
            $("body").css("overflow", "hidden");
        },
        error: function (err) {
            // Logout true     
            if (err.responseJSON.logout) {
                // Limpa o local storage
                localStorage.clear();
                // Salva a mensagem 
                localStorage.setItem('msg-logout', err.responseJSON.error);
                // Redireciona para login
                return window.location.href = 'index.html';
            }

            // Exibe a mensagem
            alertMsg("Erro ao carregar usuário.", "error", "#msg-home");
        }
    });
});

// Fecha o modal de editar usuario
fecharModalEditarUsuario.click(() => {
    modalEditarUsuario.hide();
    abledScroll();
});


function alteraSelect(itens) {
    const tipoUsuario = itens.tipoUsuario

    const campoSus = itens.campoSus
    const campoSenha = itens.campoSenha
    const campoCRM = itens.campoCRM
    const campoCOREN = itens.campoCOREN

    tipoUsuario.on("change", function () {
        const tipo = $(this).val();

        // Esconde todos os campos opcionais inicialmente
        campoSus.hide();
        campoSenha.hide();
        campoCRM.hide();
        campoCOREN.hide();

        if (tipo === "Paciente") {
            campoSus.show();
            $(".camp-lad-cpf").css('width', '100%');
            $('#btn-ver-consultas').show();
        }
        else if (tipo === "Enfermeiro") {
            campoCOREN.show();
            campoSenha.show();
            $(".camp-lad-cpf").css('width', '50%')
            $('#btn-ver-consultas').hide();
        }
        else if (tipo === "Medico") {
            campoCRM.show();
            campoSenha.show();
            $(".camp-lad-cpf").css('width', '50%')
            $('#btn-ver-consultas').hide();
        } else {
            campoSenha.show();
            $(".camp-lad-cpf").css('width', '50%')
            $('#btn-ver-consultas').hide();
        }
    });
}

// Mudar inputs dependendo do tipo usuário do modal de adicionar usuário
$(document).ready(function () {
    const tipoUsuario = $("#tipo-user-cadastro");

    alteraSelect({
        tipoUsuario: $("#tipo-user-cadastro"),
        campoSus: $(".campo-sus-cadastro"),
        campoSenha: $(".campo-senha-cadastro"),
        campoCRM: $(".campo-extra-crm"),
        campoCOREN: $(".campo-extra-coren")
    })

    // Executa ao abrir o modal
    tipoUsuario.trigger("change");
});

// Mudar inputs dependendo do tipo usuário do modal de editar usuário
$(document).ready(function () {
    const tipoUsuarioEditar = $("#tipo-user-editar");

    alteraSelect({
        tipoUsuario: $("#tipo-user-editar"),
        campoSus: $(".campo-sus-editar"),
        campoSenha: $(".campo-senha-editar"),
        campoCRM: $(".campo-extra-crm-editar"),
        campoCOREN: $(".campo-extra-coren-editar")
    })

    tipoUsuarioEditar.trigger("change");
});

// Cadastrar Usuários
$(document).ready(function () {

    // Formtação do input de CPF
    formatCPF($('#cpf-cadastro'));
    formatCPF($('#cpf-editar'));

    // Formatação do input de Telefone
    formatTelefone($('#telefone-cadastro'));
    formatTelefone($('#telefone-editar'));

    // Formatação do input do Número do Sus
    formatSUS($('#sus-cadastro'));
    formatSUS($('#sus-editar'));

    $("#form-cadastro").on("submit", function (e) {
        e.preventDefault();

        const token = localStorage.getItem("token");

        if (!token) {
            // Redireciona para login
            localStorage.clear();
            return window.location.href = "index.html";
        }

        // Mapas
        const mapTipoUsuario = { "Paciente": 5, "Recepcionista": 4, "Enfermeiro": 3, "Medico": 2, "Administrador": 1 };
        const sexoMap = { "Masculino": 1, "Feminino": 2 };

        const tipoSelecionado = $("#tipo-user-cadastro").val();
        const tipo_usuario = mapTipoUsuario[tipoSelecionado];

        // Captura e formata valores
        const nome = $("#nome-cadastro").val();
        const cpf = getNumber($("#cpf-cadastro").val());
        const email = $("#email-cadastro").val();
        const telefone = getNumber($("#telefone-cadastro").val());
        const sexo = sexoMap[$("#sexo-cadastro").val()];
        const nascimento = $("#nascimento-cadastro").val();

        let coren_crm_sus = null;
        let senha = null;

        if (tipoSelecionado === "Paciente") {
            coren_crm_sus = getNumber($("#sus-cadastro").val());
        }
        else if (tipoSelecionado === "Recepcionista" || tipoSelecionado === "Administrador") {
            senha = $("#senha-cadastro").val();
        }
        else if (tipoSelecionado === "Enfermeiro") {
            senha = $("#senha-cadastro").val();
            coren_crm_sus = $("#coren-cadastro").val(); // COREN
        }
        else if (tipoSelecionado === "Medico") {
            senha = $("#senha-cadastro").val();
            coren_crm_sus = $("#crm-cadastro").val(); // CRM
        }

        // Monta JSON para API
        const data = { nome, email, cpf, telefone, sexo, nascimento, tipo_usuario, coren_crm_sus, senha };

        // Chamada AJAX
        $.ajax({
            url: `${URL_API}/cadastro`,
            type: "POST",
            headers: { "Authorization": "Bearer " + token, "Content-Type": "application/json" },
            data: JSON.stringify(data),
            success: function (response) {

                alertMsg(response.success, "success", "#msg-home");
                $("#form-cadastro")[0].reset();
                $("#modalNovoUsuario").hide();

                abledScroll();

                // Recarrega os usuários
                carregarUsuarios();

            },
            error: function (err) {
                // Logout true     
                if (err.responseJSON.logout) {
                    // Limpa o local storage
                    localStorage.clear();
                    // Salva a mensagem 
                    localStorage.setItem('msg-logout', err.responseJSON.error);
                    // Redireciona para login
                    return window.location.href = 'index.html';
                }

                // Exibe a mensagem
                alertMsg(err.responseJSON.error, "error", "#msg-cadastro");
            }
        });
    });
});

// Editar usuários
$("#form-editar").on("submit", function (e) {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) return window.location.href = "index.html";

    const mapTipoUsuario = { "Paciente": 5, "Recepcionista": 4, "Enfermeiro": 3, "Medico": 2, "Administrador": 1 };
    const sexoMap = { "Masculino": 1, "Feminino": 2 };

    const tipoSelecionado = $("#tipo-user-editar").val();
    const tipo_usuario = mapTipoUsuario[tipoSelecionado];

    const nome = $("#nome-editar").val();
    const cpfNovo = getNumber($("#cpf-editar").val());
    const cpfAntigo = getNumber($("#old-cpf").val());
    const email = $("#email-editar").val();
    const telefone = getNumber($("#telefone-editar").val());
    const sexo = sexoMap[$("#sexo-editar").val()];
    const nascimento = $("#nascimento-editar").val();

    let coren_crm_sus = null;
    let senha = null;

    if (tipoSelecionado === "Paciente") {
        coren_crm_sus = getNumber($("#sus-editar").val());
    } else if (tipoSelecionado === "Recepcionista" || tipoSelecionado === "Administrador") {
        senha = $("#senha-editar").val();
    } else if (tipoSelecionado === "Enfermeiro") {
        senha = $("#senha-editar").val();
        coren_crm_sus = $("#coren-editar").val();
    } else if (tipoSelecionado === "Medico") {
        senha = $("#senha-editar").val();
        coren_crm_sus = $("#crm-editar").val();
    }

    const data = { nome, email, cpfNovo, cpfAntigo, telefone, sexo, nascimento, tipo_usuario, coren_crm_sus, senha };

    $.ajax({
        url: `${URL_API}/cadastro`,
        type: "PUT", // PUT para editar
        headers: {
            "Authorization": "Bearer " + token,
            "Content-Type": "application/json"
        },
        data: JSON.stringify(data),
        success: function (response) {
            alertMsg(response.success, "success", "#msg-home");
            $("#form-editar")[0].reset();
            $("#modalEditarUsuario").hide();
            $("body").css("overflow", "auto");

            // Recarrega a lista de usuários
            carregarUsuarios();
        },
        error: function (err) {
            // Logout true     
            if (err.responseJSON.logout) {
                // Limpa o local storage
                localStorage.clear();
                // Salva a mensagem 
                localStorage.setItem('msg-logout', err.responseJSON.error);
                // Redireciona para login
                return window.location.href = 'index.html';
            }

            // Exibe a mensagem
            alertMsg(err.responseJSON?.error || "Erro ao editar usuário.", "error", "#msg-editar");
        }
    });
});

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
        $('#botao-inativar').css('display', 'flex');
        $('#botao-ativar').hide();
        $('#btn-salvar-edicao').prop('disabled', false)
    } else {
        $('#botao-ativar').css('display', 'flex');
        $('#botao-inativar').hide();
        $('#btn-salvar-edicao').prop('disabled', true)
    }
}

// Ao clicar no botão de ativar usuário
$('#botao-ativar').click(() => {
    AtivarUser();
})

// Ativação de Usuário
function AtivarUser() {

    const cpf = $('#old-cpf').val();

    if (!cpf) {
        return alertMsg('Erro inesperado. Tente novamente mais tarde.', 'error', '#msg-editar');
    }

    $.ajax({
        url: `${URL_API}/cadastro/ativar`,
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`,
            "Content-Type": "Application/json"
        },
        data: JSON.stringify({ cpf }),
        success: (res) => {
            // Reseta o form
            $("#form-editar")[0].reset();

            // Oculta o form
            $("#modalEditarUsuario").hide();

            // Habilita o scroll
            $("body").css("overflow", "auto");

            // Exibe a mensagem
            alertMsg(res.success, "success", "#msg-home");

            // Recarrega a lista de usuários
            carregarUsuarios();
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

            // Exibe a mensagem
            alertMsg(err.responseJSON.error, "error", "#msg-editar");
        }
    })

}

// Ao clicar no botão de inativar usuário
$('#botao-inativar').click(() => {
    InativarUser();
})

// Inativação de Usuário
function InativarUser() {

    const cpf = $('#old-cpf').val();

    if (!cpf) {
        return alertMsg('Erro inesperado. Tente novamente mais tarde.', 'error', '#msg-editar');
    }

    $.ajax({
        url: `${URL_API}/cadastro`,
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`,
            "Content-Type": "Application/json"
        },
        data: JSON.stringify({ cpf }),
        success: (res) => {
            // Reseta o form
            $("#form-editar")[0].reset();

            // Oculta o form
            $("#modalEditarUsuario").hide();

            // Habilita o scroll
            $("body").css("overflow", "auto");

            // Exibe a mensagem
            alertMsg(res.success, "success", "#msg-home");

            // Recarrega a lista de usuários
            carregarUsuarios();
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

            // Exibe a mensagem
            alertMsg(err.responseJSON.error, "error", "#msg-editar");
        }
    })

}

// Show password modal adicionar usuario
$('.showPasswordCadastro').click(() => {
    // Elementos
    const $this = $('.showPasswordCadastro');
    const $input = $('#senha-cadastro');

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

// Show password modal editar usuario
$('.showPasswordEditar').click(() => {
    // Elementos
    const $this = $('.showPasswordEditar');
    const $input = $('#senha-editar');

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

const botaoVerConsultas = $('#btn-ver-consultas');
const iconFecharConsultas = $('#fechar-consultas');
const modalTodasConsultas = $('.div-modal-consultas');
const overlayModalConsultas = $('.overlay-modal-consultas')

// Abrir modal todas as consultas
botaoVerConsultas.click(async () => {
    // Obtém o cpf do paciente
    const cpfPaciente = $('#old-cpf').val();

    // Faz a requisição para obter as consultas
    await $.ajax({
        url: `${URL_API}/get_consultas?cpf=${cpfPaciente}`,
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        success: async (res) => {
            // Obtém a lista de consultas
            const consultas = res.consultas;

            if (!consultas.length) {
                // Esconde a tabela de consultas
                $('#table-consultas').hide();

                // Mostra mensagem de nenhuma consulta encontrada
                $('#consult-not-found').show();
                return;
            }

            // Mostra a tabela de consultas
            $('#table-consultas').show();
            // Esconde mensagem de nenhuma consulta encontrada
            $('#consult-not-found').hide();

            // Limpa o tbody
            $('#tbody-consultas').empty();

            await consultas.map((consulta) => criarLabelConsulta(consulta));

            // Adicioona o evento click da label consulta
            addEventClickLabelConsulta();
        }
    })

    // Exibe os modais
    modalEditarUsuario.css('display', 'none');
    overlayModalConsultas.css('display', 'flex');
    modalTodasConsultas.css('display', 'flex');

    // Desabilita o scroll
    disabledScroll();
});

// Fecha o modal de todas as consultas
iconFecharConsultas.click(() => {
    modalTodasConsultas.hide();
    overlayModalConsultas.hide();

    abledScroll();
});

// Função para criar cada linha das consultas
function criarLabelConsulta(consulta) {
    // Cria a tr
    const $tr = $('<tr></tr>')
        .attr('id_consulta', consulta.id_consulta)
        .addClass('etiqueta-consulta');

    // Nome paciente
    const $nomePaciente = $('<td></td>').text(consulta.paciente);

    // Nome recepcionista
    const $nomeRecepcionista = $('<td></td>').text(consulta.recepcionista);

    // Nome enfermeiro
    const $nomeEnfermeiro = $('<td></td>').text(consulta.enfermeiro);

    // Nome médico
    const $nomeMedico = $('<td></td>').text(consulta.medico);

    // Situação
    const $situacao = $('<td></td>').append(
        $('<p></p>')
            .text(consulta.situacao)
            .addClass('situacao-consulta')
            .addClass(consulta.situacao === 'Alta' ? 'concluido' : 'em-andamento')
    );

    // Cria um objeto date
    const date = new Date(consulta.data_entrada);

    // Obtém ano, mes e dia
    const ano = date.getFullYear();
    const mes = String(date.getMonth() + 1).padStart(2, '0'); // meses começam em 0
    const dia = String(date.getDate()).padStart(2, '0');

    // Cria a string da data formatada
    const dataFormatada = `${dia}/${mes}/${ano}`;

    // Data entrada
    const $dataEntrada = $('<td></td>').text(dataFormatada);

    // Append em todas as colunas na $tr
    $tr
        .append($nomePaciente)
        .append($nomeRecepcionista)
        .append($nomeEnfermeiro)
        .append($nomeMedico)
        .append($situacao)
        .append($dataEntrada)

    // Adiciona a $tr
    $('#tbody-consultas').append($tr);
}

// Função para adicionar o evento de clique a label de consulta
function addEventClickLabelConsulta() {

    // Event click
    $('.etiqueta-consulta').click(function () {
        // Obtém o id da consulta
        const idConsulta = $(this).attr('id_consulta');

        window.location.href = `diagnostico.html?id_consulta=${idConsulta}`;
    })

}