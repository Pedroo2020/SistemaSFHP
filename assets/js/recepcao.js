
// Obtém os botões
const botaoNovoPaciente = $('.botao1');
const modal = $('#modalNovoPaciente');
const fechar = $('.fechar');

// Abre o modal de novo paciente
botaoNovoPaciente.click(() => {
    modal.css('display', 'flex');
});

// Fecha o modal de novo paciente
fechar.click(() => {
    modal.css('display', 'none');
});

