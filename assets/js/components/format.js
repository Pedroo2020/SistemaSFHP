function formatCPF(input, oldValue) {
    // Variável de controle do valor anterior
    let lastValue = oldValue || '';

    // Ao alterar o input de CPF
    $(input).on('input', function (e) {
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
    $(input).on('blur', function (e) {
        // Pega só os números do input
        let value = $(this).val().replace(/\D/g, '');

        // Caso esteja vazio, tira os underlines
        if (!value.length) {
            $(this).val('');
        }
    });
}

function formatSUS(input, oldValue) {
    let lastValue = oldValue || '';

    $(input).on('input', function (e) {
        let value = $(this).val().replace(/\D/g, '');

        // Limite de 15 dígitos
        if (value.length > 15) {
            value = lastValue;
        }

        let inputType = e.originalEvent.inputType;
        if (inputType === "deleteContentBackward" || inputType === "deleteContentForward") {
            value = lastValue.slice(0, -1);
        }

        lastValue = value;

        // Máscara base
        let formatted = '___ ____ ____ ____';

        for (let i = 0; i < value.length && i < 15; i++) {
            formatted = formatted.replace('_', value[i]);
        }

        $(this).val(formatted);
    });

    $(input).on('blur', function () {
        let value = $(this).val().replace(/\D/g, '');
        if (!value.length) {
            $(this).val('');
        }
    });
}

function formatTelefone(input, oldValue) {
    let lastValue = oldValue || '';

    $(input).on('input', function (e) {
        let value = $(this).val().replace(/\D/g, '');

        // Limite de 11 dígitos
        if (value.length > 11) {
            value = lastValue;
        }

        let inputType = e.originalEvent.inputType;
        if (inputType === "deleteContentBackward" || inputType === "deleteContentForward") {
            value = lastValue.slice(0, -1);
        }

        lastValue = value;

        // Máscara base
        let formatted = '(__) _____-____';

        for (let i = 0; i < value.length && i < 11; i++) {
            formatted = formatted.replace('_', value[i]);
        }

        $(this).val(formatted);
    });

    $(input).on('blur', function () {
        let value = $(this).val().replace(/\D/g, '');
        if (!value.length) {
            $(this).val('');
        }
    });
}

// Formata número do SUS (15 dígitos -> "0000 0000 0000 000")
function formatarNumeroSUS(value) {
    if (!value) return "";

    // Mantém apenas números
    value = value.replace(/\D/g, "").slice(0, 15);

    // Aplica formatação
    return value
        .replace(/^(\d{4})(\d)/, "$1 $2")
        .replace(/^(\d{4}) (\d{4})(\d)/, "$1 $2 $3")
        .replace(/^(\d{4}) (\d{4}) (\d{4})(\d)/, "$1 $2 $3 $4");
}

// Formata telefone brasileiro (10 ou 11 dígitos -> "(00) 00000-0000")
function formatarNumeroTelefone(value) {
    if (!value) return "";

    // Mantém apenas números
    value = value.replace(/\D/g, "").slice(0, 11);

    // Aplica formatação
    return value
        .replace(/^(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4,5})(\d{4})$/, "$1-$2");
}

// Função para formatar minutos em horas e minutos
function formatarMinutos(minutos) {
    // Obtém hora e minuto separado
    let horas = String(Math.floor(minutos / 60));
    let min = String(minutos % 60);

    // Adiciona um 0 caso seja menor que 10 minutos
    if (min.length < 2) {
        min = `0${min}`;
    }

    // Adiciona um 0 caso seja menor que 10 horas
    if (horas.length < 2) {
        horas = `0${horas}`;
    }

    // Retorna formatado
    return `${horas}h ${min}min`
}

// Formatar input apenas de números
function maskInputNumber(input, max) {

    $(input).on('input', function () {
        // Retira caractéres não numéricos
        let newValue = $(this).val().replace(/\D/g, '');

        if (newValue > max) {
            newValue = max
        }

        // Retorna
        return $(this).val(newValue);
    })

}

// Máscara para input de temperatura (ex: 38.7)
function maskInputTemperature(input) {
    // Variável de controle do valor anterior
    let lastValue;

    // Ao alterar o input de CPF
    $(input).on('input', function (e) {
        // Pega só os números do input
        let value = $(this).val().replace(/\D/g, '');

        // Não permite que passe de 14 caracteres
        if (value.length > 3) {
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
        let formatted = '__._';

        // Preenche a máscara com os números
        for (let i = 0; i < value.length && i < 11; i++) {
            formatted = formatted.replace('_', value[i]);
        }

        $(this).val(formatted);
    });

    // Ao sair do input de CPF
    $(input).on('blur', function (e) {
        // Pega só os números do input
        let value = $(this).val().replace(/\D/g, '');

        // Caso esteja vazio, tira os underlines
        if (!value.length) {
            $(this).val('');
        }
    });
}

function formatarNumeroCPF(numero) {
    // Máscara base
    let formatted = '___.___.___-__';

    // Preenche a máscara com os números
    for (let i = 0; i < numero.length && i < 11; i++) {
        formatted = formatted.replace('_', numero[i]);
    }

    return formatted;
}

// Função para formatar Pressão Arterial (ex: "12080" -> "120/80 mmHg")
function formatarPressaoArterial(valor) {
    if (!valor || valor === "—") return "—";

    // Converte para string e remove espaços
    valor = valor.toString().trim();

    // Se já tiver barra "/", apenas limpa e garante o formato
    if (valor.includes("/")) {
        const partes = valor.split("/");
        const sistolica = partes[0].replace(/\D/g, "");
        const diastolica = partes[1] ? partes[1].replace(/\D/g, "") : "";

        if (!sistolica || !diastolica) return "—";
        return `${sistolica}/${diastolica} mmHg`;
    }

    // Remove tudo que não for número
    valor = valor.replace(/\D/g, "");

    // Limita a 6 dígitos (evita erro)
    valor = valor.slice(0, 6);

    // Se tiver até 3 dígitos, ainda não formata
    if (valor.length <= 3) return valor;

    // Se tiver 4 dígitos -> "12/08"
    if (valor.length === 4) return `${valor.slice(0, 2)}/${valor.slice(2)} mmHg`;

    // Se tiver 5 ou 6 dígitos -> "120/80"
    return `${valor.slice(0, 3)}/${valor.slice(3)} mmHg`;
}

function formatarTempo(value) {

    // Calcula as horas
    let horas = Math.floor(value / 60);

    // Calcula os minutos
    let minutos = value % 60;

    // Caso tenha apenas 1 dígito, adiciona um 0 antes
    if (String(minutos).length < 2) {
        minutos = `0${minutos}`;
    }

    // Caso tenha apenas 1 dígito, adiciona um 0 antes
    if (String(horas).length < 2) {
        horas = `0${horas}`;
    }

    // Retorna o valor formatado
    return `${horas}h ${minutos}min`
}

function formatCOREN(el) {
    let raw = el.val();
    let before = raw; // valor antes da formatação

    // Detecta se está apagando (inputType só funciona no jQuery >= 3.6)
    let isDeleting = el.data("last") && el.data("last").length > raw.length;
    el.data("last", raw);

    // Remove qualquer caracter que não seja letra/número
    let clean = raw.replace(/[^A-Za-z0-9]/g, "");

    // UF (2 letras)
    let uf = clean.match(/^[A-Za-z]{0,2}/)[0].toUpperCase();

    // resto após UF
    let rest = clean.slice(uf.length);

    // números (6 máximo)
    let nums = rest.replace(/[^0-9]/g, "").slice(0, 6);

    // letras finais (3 máximo)
    let letras = rest.replace(/[0-9]/g, "").slice(0, 3).toUpperCase();

    // MONTA A FORMATAÇÃO
    let out = "";

    if (uf.length) out += uf;

    if (nums.length) {
        out += " ";

        if (nums.length <= 3) {
            out += nums;
        } else {
            out += nums.slice(0, 3) + "." + nums.slice(3);
        }
    }

    // Só coloca "-" quando NÃO estiver apagando
    if (!isDeleting && nums.length === 6) {
        out += "-";
    }

    // Só coloca sufixo se o "-" existir
    if (nums.length === 6 && !isDeleting) {
        out += letras;
    }

    // Atualiza valor final
    el.val(out);
}

function formatCRM(el) {
    const prefix = "CRM/";
    let val = el.val();
    const input = el.get(0);

    // Salva posição do cursor ANTES de formatar
    let cursorPos = input.selectionStart;

    // Impede apagar o prefixo
    if (!val.startsWith(prefix)) {
        val = prefix;
    }

    let rest = val.slice(prefix.length);

    // UF: permite apagar normalmente
    let uf = rest.replace(/[^A-Za-z]/g, "").toUpperCase().slice(0, 2);

    // Números: até 6
    let nums = rest.replace(/\D/g, "").slice(0, 6);

    // Monta final
    let final = prefix + uf + (uf.length === 2 ? " " : "") + nums;
    el.val(final);

    // ---- Correção DO CURSOR ----
    // Se tentar entrar dentro do prefixo, joga para depois
    if (cursorPos < prefix.length) {
        cursorPos = prefix.length;
    }

    // Restaura cursor corretamente
    setTimeout(() => {
        input.setSelectionRange(cursorPos, cursorPos);
    }, 0);
}

export { formatCPF, formatSUS, formatTelefone, formatarNumeroSUS, formatarNumeroTelefone, formatarMinutos, maskInputTemperature, maskInputNumber, formatarNumeroCPF, formatarPressaoArterial, formatarTempo, formatCOREN,
formatCRM };