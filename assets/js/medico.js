// Importa a URL da API
import { URL_API } from "./urlAPI.js";
// Função para mostrar mensagens de alerta
import { alertMsg, carregarTotalPacitentes, getTodayInputDate } from "./components/utils.js";
// Função para formatar os Minutos
import { formatarMinutos } from "./components/format.js";

// Função para mostrar tela loading e desabilitar scroll
function hideLoading() {
    $('#div-loading').hide();
    // Habilita o scroll
    abledScroll($(document.body));
}

// Função para adicionar os eventos on change aos inputs de data
function onChangeInputDate(inputDateStart, inputDateEnd) {
    
    inputDateStart.on('change', function() {

        let dateInputStart = inputDateStart.val();
        let dateInputEnd = inputDateEnd.val();

        if (dateInputStart > dateInputEnd) {
            inputDateStart.val(dateInputEnd);
        }

        recarregarConsultas();
    })

    inputDateEnd.on('change', function() {

        let dateInputStart = inputDateStart.val();
        let dateInputEnd = inputDateEnd.val();

        if (dateInputEnd < dateInputStart) {
            inputDateEnd.val(dateInputStart);
        }

        recarregarConsultas();
    })
    
}

// Carrega a tabela ao carregar a página
$(document).ready(async () => {
    // Carrega as consultas na fase de diagnostico concluída
    await carregarConsultas(false, 3);

    // Adicionando os ventos on change aos inputs date
    await onChangeInputDate($('#filtro-date-start'), $('#filtro-date-end'));

    // Obtendo a data atual
    await getTodayInputDate($('#filtro-date-start'), $('#filtro-date-end'));

    // Função para carregar os dados do painel
    await carregarTotalPacitentes($("#totalPacientes"), $("#casosUrgentes"), $("#tempoMedioEspera"), $('#filtro-date-start').val(), $('#filtro-date-end').val());

    // Evento click
    addMoreDetailsMenu("#menu-entrada", ".details-entrada");
    addMoreDetailsMenu("#menu-diagnostico", ".details-diagnostico");
    addMoreDetailsMenu("#menu-abrir-diagnostico", ".ver-details-diagnostico");
    
    // Retira a tela de loading
    hideLoading();

    // Obtém a mensagem
    const msg = localStorage.getItem('diagnostico-cadastrado');

    if (msg) {
        // Remove a mensagem
        localStorage.removeItem('diagnostico-cadastrado');
        // Exibe a mensagem
        alertMsg(msg, 'success', '#div-message');
    }
});

// Ao clicar no botão, atualiza as consultas
$("#refresh-consultas").on("click", async () => {
    // Adiciona a animação de girar ao botão
    $("#refresh-icon").addClass("refreshing");

    // Recarregar consultas
    await recarregarConsultas();

    // Remove a animação de girar ao botão
    $("#refresh-icon").removeClass("refreshing");
});

// Função para recarrregar consultas com a situação atual
function recarregarConsultas() {
    // Declara a variável
    let situacao;

    // Percorre todos os elementos do filtro consulta
    $(".filtro-consulta").each((_, item) => {
        // Transforma em objeto jquery
        const $item = $(item);

        // Caso o objeto tenha a class active
        if ($item.hasClass("active")) {
            // Atualiza o valor da situação
            return (situacao = $item.attr("sit"));
        }
    });

    // Obtém o valor do like
    const like = $('#input-search-usuario').val();

    // Caso situação exista, refaz a busca
    if (situacao) {
        carregarConsultas(false, situacao, like);
    }

    // Recarrega os dados do painel
    carregarTotalPacitentes($("#totalPacientes"), $("#casosUrgentes"), $("#tempoMedioEspera"), $('#filtro-date-start').val(), $('#filtro-date-end').val());
}

// Função para carregar consultas
function carregarConsultas(getConsultas, situacao, like) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `${URL_API}/consultas/${situacao}${like ? `?s=${like}` : ''}`,
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            success: async (res) => {
                const consultas = res.consultas;

                // Retorna a lista de consultas
                if (getConsultas) {
                    resolve(consultas);
                    return;
                }

                // Se não pediu só os dados, preenche tabela
                $("#table-consultas").empty();

                if (consultas.length > 0) {
                    await consultas.map((consulta) => addConsulta(consulta, situacao));
                } else {
                    const consultasNotFound = $("<tr></tr>").append(
                        $("<td></td>")
                            .text("Nenhum resultado encontrado para essa busca")
                            .addClass("consultas-not-found")
                            .attr("colspan", 8)
                    );

                    $("#table-consultas").append(consultasNotFound);
                }

                const dataAtual = new Date();
                const dataFormatada = dataAtual.toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                });

                $(".last-att").text(`Última atualização: ${dataFormatada}`);
                resolve(); // retorna vazio só pra indicar que terminou
            },
            error: (err) => {
                // Logout true
                if (err.responseJSON.logout) {
                    // Limpa o local storage
                    localStorage.clear();
                    // Salva a mensagem
                    localStorage.setItem("msg-logout", err.responseJSON.error);
                    // Redireciona para login
                    return (window.location.href = "index.html");
                }

                // Exibe a mensagem de erro
                alertMsg(err.responseJSON.error, "error", "#div-msg");

                // Retorna error
                reject(err);
            },
        });
    });
}

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
            carregarConsultas(false, situacao, like);
        }
    })
})

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
function addConsulta(consulta, situacao) {
    // tbody
    const $tbody = $("#table-consultas");

    // Cria a <tr></tr>
    const $tr = $("<tr></tr>");

    // Cria as tds
    const posicao = $("<td></td>")
        .text(`${consulta.posicao}°`)
        .addClass("td-numero");

    const nome = $("<td></td>").text(consulta.nome).addClass("td-string");

    const idade = $("<td></td>").text(consulta.idade).addClass("td-numero");

    const sexo = $("<td></td>").text(consulta.sexo).addClass("td-string");

    const prioridade = $("<td></td>")
        .text(consulta.prioridade)
        .addClass("td-time");

    // Caso exista prioridade, cria a etiqueta
    if (consulta.classificacao_risco) {
        prioridade.append(criarEtiquetaPrioridade(consulta.classificacao_risco))
    } else {
        // Senão, adiciona o texto ~
        prioridade.text('~');
    }

    const entrada = $("<td></td>")
        .text(consulta.data_entrada)
        .addClass("td-time");

    const tempoDecorrido = $("<td></td>")
        .text(formatarMinutos(consulta.tempo_decorrido))
        .addClass("td-time");

    // Ícone de ação
    const iconeMoreDetails = $("<i></i>").addClass(
        "fa-solid fa-ellipsis icon-more-details"
    );

    const iconAcao = $("<td></td>")
        .append(iconeMoreDetails)
        .attr("cpf", consulta.cpf)
        .attr("id_consulta", consulta.id_consulta)
        .addClass("td-time")
        .addClass(
            situacao == 3
                ? "details-entrada"
                : situacao == 4
                    ? "details-diagnostico"
                    : situacao == 5 ? "ver-details-diagnostico" : ""
        ); // muda a class conforme a situação;

    // Adiciona os elementos ao tr
    $tr
        .append(posicao)
        .append(nome)
        .append(idade)
        .append(sexo)
        .append(prioridade)
        .append(entrada)
        .append(tempoDecorrido)
        .append(iconAcao);

    // Adiciona ao tbody
    $tbody.append($tr);
}

// Função para adicionar o menu de mais detalhes
function addMoreDetailsMenu(menu, classIcon) {

    const $menu = $(menu);

    $(document).on("click", classIcon, function (e) {
        e.stopPropagation(); // evita fechar pelo listener do document

        if (menu === "#menu-diagnostico") {
            $("#cpf-diagnostico").val($(this).attr("cpf"));
        } else if (menu === "#menu-entrada") {
            $("#cpf-entrada").val($(this).attr("cpf"));
        } else if (menu === "#menu-abrir-diagnostico") {
            $("#id-consulta-diagnostico").val($(this).attr("id_consulta"));
        }

        const btn = this;
        const rect = btn.getBoundingClientRect(); // posição relativa à viewport

        // mostra invisível para poder medir dimensões (não quebra o layout)
        $menu.css({ display: "block", visibility: "hidden" });

        const menuW = $menu.outerWidth();
        const menuH = $menu.outerHeight() - 13;
        const vh = $(window).height();

        // tenta alinhar a borda direita do menu com a borda direita do botão
        let left = rect.right - 125;
        // se sair muito pra esquerda, alinha à esquerda do botão
        if (left < 8) left = rect.left;

        // posiciona abaixo por padrão
        let top = rect.bottom - 13;

        // se não couber embaixo, abre acima
        if (top + menuH > vh - 8) {
            top = rect.top - menuH;
            if (top < 8) top = 8;
        }

        // aplica posição (position: fixed usa coords da viewport)
        $menu.css({
            top: Math.round(top) + "px",
            left: Math.round(left) + "px",
            visibility: "visible",
        });

        // toggle seguro (fecha se já aberto pelo mesmo botão)
        if ($menu.is(":visible") && $menu.data("opened-by") === btn) {
            $menu.hide().data("opened-by", null).attr("aria-hidden", "true");
        } else {
            $menu.show().data("opened-by", btn).attr("aria-hidden", "false");
        }
    });

    // fecha quando clicar fora
    $(document).on("click", function () {
        $menu.hide().data("opened-by", null).attr("aria-hidden", "true");
    });

    // fecha também ao redimensionar/scroll para evitar menu "solto"
    $(window).on("resize scroll", function () {
        $menu.hide().data("opened-by", null).attr("aria-hidden", "true");
    });

    // tratar clique nas opções do menu
    $(document).on("click", `${menu} .item`, function (e) {
        e.stopPropagation();
        const action = $(this).data("action");
        $menu.hide().data("opened-by", null);

        if (action === "copy") {
            // exemplo: copiar texto para clipboard
            console.log("copiar link");
        } else if (action === "report") {
            console.log("denunciar abuso");
        }
    });
}

// Função para desabilitar o scroll
function disabledScroll() {
    $(document.body).css("overflow", "hidden");
}

// Função para habilitar o scroll
function abledScroll() {
    $(document.body).css("overflow", "auto");
}

// Obtém os botões
const botaoNovoPaciente = $(".btn-novo-paciente");
const modal = $("#modalNovoPaciente");
const fechar = $("#fechar-modal");
const formDiagnostico = $("#form-diagnostico");
const selectPaciente = $("#paciente-diagnostico");

// Abre o modal de novo paciente
botaoNovoPaciente.click(async () => {
    modal.css("display", "flex");
    formDiagnostico.css("display", "flex");

    // Limpa o select
    selectPaciente.empty();

    // Obtém os pacientes da consulta
    const consultas = await carregarConsultas(true, 3);

    // Cria as options de consulta
    consultas.map((consulta, index) => {
        // Cria o objeto
        const option = $("<option></option>")
            .val(consulta.cpf)
            .attr("entrada", consulta.data_entrada)
            .attr("posicao", consulta.posicao)
            .text(consulta.nome);

        // Adiciona ao select
        selectPaciente.append(option);

        // Altera os dados da entrada e posição caso seja index 0
        if (index === 0) {
            // Atualiza o horário de entrada
            $(".time-entrada").text(`Entrada: ${consulta.data_entrada}`);
            $(".posicao").text(`Posição: ${consulta.posicao}°`);
        }
    });

    // Desabilita o scroll
    disabledScroll();
});

// Ao alterar o valor do select
selectPaciente.on("change", () => {
    // Obtém os elementos option dentro do select
    const options = selectPaciente.find("option");

    // Declara a variável
    let entrada;
    let posicao;

    // Percorre todos os elementos
    options.each((index, option) => {
        // Transforma em objeto jquery
        const $option = $(option);

        // Caso o valor da option seja igual ao valor do select atual
        if ($option.val() == selectPaciente.val()) {
            // Armazena o horário de entrada
            entrada = $option.attr("entrada");
            posicao = $option.attr("posicao");
        }
    });

    // Atualiza o horário de entrada
    $(".time-entrada").text(`Entrada: ${entrada}`);
    $(".posicao").text(`Posição: ${posicao}°`);
});

// Fecha o modal de novo paciente
fechar.click(() => {
    modal.hide();

    // Habilita o scroll
    abledScroll();
});

// Form de iniciar o diagnóstico
$("#form-diagnostico").on("submit", (e) => {
    // Evita comportamento padrão
    e.preventDefault();

    // Obtém os elementos option dentro do select
    const cpfPaciente = selectPaciente.val();

    // Inicia a triagems
    startDiagnostico(cpfPaciente, "#div-msg-modal");
});

// Ao clicar no botão chamar paciente
$("#chamarPaciente").on("click", function () {
    const cpf = $("#cpf-entrada").val();

    // Inicia a triagem
    startDiagnostico(cpf, "#div-msg");
});

// Ao clicar no botão chamar paciente
$("#cadastrarDiagnostico").on("click", function () {
    const cpf = $("#cpf-diagnostico").val();

    // Cria a url passado CPF como parâmetro
    let newUrl = `diagnostico.html?cpf=${encodeURIComponent(cpf)}`;

    // Redireciona para triagem
    return window.location.href = newUrl;
});

// Função para abrir a tela de dianostico
$('#abrirDiagnostico').on('click', function () {
    // Obtém o id da consulta
    const idConsulta = $('#id-consulta-diagnostico').val();

    // Cria a url passado o id da consulta como parâmetro
    let newUrl = `diagnostico.html?id_consulta=${idConsulta}`;

    // Redireciona para o diagnostico cadastrado
    return window.location.href = newUrl;
})

function startDiagnostico(cpf, idDivMsg) {
    // Obtém o token
    const token = localStorage.getItem("token");

    if (!token) {
        // limpa o local storage
        localStorage.clear();
        // Redireciona para login
        return (window.location.href = "index.html");
    }

    // Faz a requisição
    $.ajax({
        url: `${URL_API}/start_diagnostico`,
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        data: JSON.stringify({
            cpf: cpf,
        }),
        success: (res) => {
            // Cria a url passado CPF como parâmetro
            let newUrl = `diagnostico.html?cpf=${encodeURIComponent(cpf)}`;

            // Redireciona para triagem
            return (window.location.href = newUrl);
        },
        error: (err) => {
            // Logout true
            if (err.responseJSON.logout) {
                // Limpa o local storage
                localStorage.clear();
                // Salva a mensagem
                localStorage.setItem("msg-logout", err.responseJSON.error);
                // Redireciona para login
                return (window.location.href = "index.html");
            }

            // Exibe a mensagem de erro
            alertMsg(err.responseJSON.error, "error", idDivMsg);
        },
    });
}

// Filtro da consulta
$(".filtro-consulta").each((_, element) => {
    // Transforma em objeto jquery
    const $element = $(element);

    // Função on click
    $element.on("click", function () {
        // Percorre todos os elementos do filtro consulta
        $(".filtro-consulta").each((_, item) => {
            // Transforma em objeto jquery
            const $item = $(item);

            // Verifica se o objeto é diferente do objeto clicado
            if ($item[0] !== this) {
                // Remove a class active
                return $item.removeClass("active");
            }

            // Obtém a situação do filtro
            const situacao = $item.attr("sit");

            // Carrega as consultas
            carregarConsultas(false, situacao);

            // Adiciona a class active
            return $item.addClass("active");
        });
    });
});