// Função para formatar CPF
import formatCPF from './formatCPF.js';
import URL_API from './urlAPI.js';

// Ao carregar a página, adiciona as formatações ao input
$(document).ready(() => {
    formatCPF('#input-cpf');
})

// Obtém os botões
const botaoNovoPaciente = $('.btn-novo-paciente');
const modal = $('#modalNovoPaciente');
const fechar = $('#fechar-modal');
const voltarParaCPF = $('#voltar-cpf');
const formCPF = $('#form-cpf');
const formCadastro = $('#form-cadastro');

// Abre o modal de novo paciente
botaoNovoPaciente.click(() => {
    modal.css('display', 'flex');
});

// Fecha o modal de novo paciente
fechar.click(() => {
    modal.hide();
});

// Volta para a tela de inserir CPF
voltarParaCPF.click(() => {
    // Altera o form visível
    formCadastro.hide();
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
    const cpfOnlyNumber = cpf.replace(/\D/g, '');

    // Altera o botão de voltar
    fechar.hide();
    voltarParaCPF.show();

    // Preenche o input com o cpf do usuário
    $('#cpf-blocked').val(cpf);

    // Requisição e lógica para validar cpf

    // Torna visível o form de cadastro
    formCPF.hide();
    formCadastro.css('display', 'flex');
}))

// Cadastrar usuário
formCadastro.on('submit', function (e) {
    // Evita comportamento padrão
    e.preventDefault();

    // Formata os dados
    const form = new FormData(this);

    const data = {
        nome: form.get('nome'),
        email: form.get('email'),
        telefone: form.get('telefone'),
        cpf: form.get('cpf-blocked').replace(/\D/g, ''),
        coren_crm_sus: "7002895784289203", // String
        sexo: form.get('sexo') === 'masculino' ? 1 : 2,
        nascimento: form.get('nascimento'),
        tipo_usuario: 5
    }

    $.ajax({
        url: `${URL_API}/cadastro`,
        method: 'POST',
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        contentType: 'Application/json',
        data: JSON.stringify(data),
        success: (res) => {
            alert('success')
        },
        error: (err) => {
            alert('err')
            console.log(err)
        }
    })
})