import { formatCPF, formatSUS, formatTelefone, formatarNumeroSUS, formatarNumeroTelefone } from './components/format.js';
import { URL_API, socket } from './urlAPI.js';
import alertMsg from './alertMsg.js';

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
const botaoMaisDetalhes = $('#more-details')
const botaoVerConsulta = $('.btn-consulta')

// Abre o modal de novo usuário
botaoNovoUsuario.click(() => {
    modalNovoUsuario.css('display', 'flex');

    // Desabilita o scroll
    disabledScroll();
});

// Fecha o modal de novo usuario
fecharModalAdicionarUsuario.click(() => {
    modalNovoUsuario.hide();

    // Habilita o scroll
    abledScroll();
});

// Abre o modal de editar usuario
botaoMaisDetalhes.click(() => {
    modalEditarUsuario.css('display', 'flex');

    // Desabilita o scroll
    disabledScroll();
});


// Fecha o modal de novo usuario
fecharModalEditarUsuario.click(() => {
    modalEditarUsuario.hide();

    // Habilita o scroll
    abledScroll();
});

// Mudar inputs dependendo do tipo usuário do modal de adicionar usuário
$(document).ready(function () {
    const tipoUsuario = $("#tipo-user-cadastro");
    const labelSus = $("label[for='sus']");
    const inputSus = $("#sus-cadastro");
    const campoExtra = $("#campo-extra");
    const labelExtra = $("#campo-extra label");
    const inputExtra = $("#extra-cadastro");

    tipoUsuario.on("change", function () {
        let tipo = $(this).val();

        if (tipo === "paciente") {
            // Paciente → Número do SUS
            labelSus.text("Número do SUS");
            inputSus.attr("type", "text")
                .attr("placeholder", "Digite o número do SUS")
                .attr("id", "sus-cadastro")
                .attr("name", "sus-cadastro")
                .val("");

            campoExtra.hide(); // não mostra nada extra
            inputSus.prop("required", true);
            inputExtra.prop("required", false);

        } else if (tipo === "recepcionista" || tipo === "Administrador") {
            // Recepcionista ou Administrador → Senha
            labelSus.text("Senha");
            inputSus.attr("type", "password")
                .attr("placeholder", "Digite a senha")
                .attr("id", "senha-cadastro")
                .attr("name", "senha-cadastro")
                .val("");

            campoExtra.hide();
            inputSus.prop("required", true);
            inputExtra.prop("required", false);

        } else if (tipo === "enfermeiro") {
            // Enfermeiro → Senha + COREN
            labelSus.text("Senha");
            inputSus.attr("type", "password")
                .attr("placeholder", "Digite a senha")
                .attr("id", "senha-cadastro")
                .attr("name", "senha-cadastro")
                .val("");

            campoExtra.show();
            labelExtra.text("COREN");
            inputExtra.attr("placeholder", "Digite o COREN")
                .attr("name", "coren-cadastro")
                .val("");

            inputSus.prop("required", true);
            inputExtra.prop("required", true);

        } else if (tipo === "medico") {
            // Médico → Senha + CRM
            labelSus.text("Senha");
            inputSus.attr("type", "password")
                .attr("placeholder", "Digite a senha")
                .attr("id", "senha-cadastro")
                .attr("name", "senha-cadastro")
                .val("");

            campoExtra.show();
            labelExtra.text("CRM");
            inputExtra.attr("placeholder", "Digite o CRM")
                .attr("name", "crm-cadastro")
                .val("");

            inputSus.prop("required", true);
            inputExtra.prop("required", true);
        }
    });

    // Dispara o evento uma vez ao carregar (para inicializar corretamente)
    tipoUsuario.trigger("change");
});


// Mudar inputs dependendo do tipo usuário do modal de editar usuário
$(document).ready(function () {
    const tipoUsuarioEditar = $("#modalEditarUsuario #tipo-user-cadastro");
    const labelSusEditar = $("#modalEditarUsuario label[for='sus']");
    const inputSusEditar = $("#modalEditarUsuario #sus-cadastro");
    const campoExtraEditar = $("#modalEditarUsuario #campo-extra");
    const labelExtraEditar = $("#modalEditarUsuario #campo-extra label");
    const inputExtraEditar = $("#modalEditarUsuario #extra-cadastro");

    tipoUsuarioEditar.on("change", function () {
        let tipo = $(this).val();

        if (tipo === "paciente") {
            // Paciente → Número do SUS
            labelSusEditar.text("Número do SUS");
            inputSusEditar.attr("type", "text")
                .attr("placeholder", "Digite o número do SUS")
                .attr("name", "sus-cadastro")
                .val("");

            campoExtraEditar.hide();
            inputSusEditar.prop("required", true);
            inputExtraEditar.prop("required", false);

        } else if (tipo === "recepcionista" || tipo === "Administrador") {
            // Recepcionista / Administrador → Senha
            labelSusEditar.text("Senha");
            inputSusEditar.attr("type", "password")
                .attr("placeholder", "Digite a senha")
                .attr("name", "senha-cadastro")
                .val("");

            campoExtraEditar.hide();
            inputSusEditar.prop("required", true);
            inputExtraEditar.prop("required", false);

        } else if (tipo === "enfermeiro") {
            // Enfermeiro → Senha + COREN
            labelSusEditar.text("Senha");
            inputSusEditar.attr("type", "password")
                .attr("placeholder", "Digite a senha")
                .attr("name", "senha-cadastro")
                .val("");

            campoExtraEditar.show();
            labelExtraEditar.text("COREN");
            inputExtraEditar.attr("placeholder", "Digite o COREN")
                .attr("name", "coren-cadastro")
                .val("");

            inputSusEditar.prop("required", true);
            inputExtraEditar.prop("required", true);

        } else if (tipo === "medico") {
            // Médico → Senha + CRM
            labelSusEditar.text("Senha");
            inputSusEditar.attr("type", "password")
                .attr("placeholder", "Digite a senha")
                .attr("name", "senha-cadastro")
                .val("");

            campoExtraEditar.show();
            labelExtraEditar.text("CRM");
            inputExtraEditar.attr("placeholder", "Digite o CRM")
                .attr("name", "crm-cadastro")
                .val("");

            inputSusEditar.prop("required", true);
            inputExtraEditar.prop("required", true);
        }
    });

    // Dispara o evento para inicializar corretamente
    tipoUsuarioEditar.trigger("change");
});

// Puxar dados da API para editar os dados do Usuário
