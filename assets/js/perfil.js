// Importa a URL da API
import URL_API from "./urlAPI.js";

// Redirecionar para a página correta
function redirectWindow(typeUser) {
    // Obtém o tipo do usuário
    typeUser = parseInt(typeUser);

    // Divide o endereço em uma lista
    const windowArray = window.location.href.split('/');
    
    // Obtém a URL atual
    const currentWindowLocation = windowArray[windowArray.length - 1];

    // Função para verificar a localização atual
    function checkRedirect(url) {
        // Caso não esteja na url
        if (currentWindowLocation != url) {
            // Redireciona para a url
            window.location.href = url;
        }
    }

    // Redireciona para a página designada
    if (typeUser === 1) {
        // Redireciona para a página do administrador
        checkRedirect('administrador-perfil.html');
    } else if (typeUser === 2) {
        // Redireciona para a página do médico
        checkRedirect('medico-perfil.html');
    } else if (typeUser === 3) {
        // Redireciona para a página do enfermeiro
        checkRedirect('enfermeiro-perfil.html');
    } else if (typeUser === 4) {
        // Redireciona para a página do recepcionista
        checkRedirect('recepcionista-perfil.html');
    } else {
        // Inválido
        alertMsg('Login inválido', 'error');  
    }
}

// Ao carregar a página
$(document).ready(() => {
    // Obtém o token
    const token = localStorage.getItem('token');

    // Caso não tenha token, redireciona para login
    if (!token) {
        return window.location.href = "index.html";
    }

    // Fetch em cadastro (GET)
    $.ajax({
        url: `${URL_API}/cadastro`,
        headers: {
            Authorization: `Bearer ${token}`
        },
        success: async (res) => {
            // Obtém os dados do usuário
            const dataUser = res.user;

            // Espera pela verificação da página
            await redirectWindow(dataUser.tipo_usuario);

            // Carrega o nome
            $('.nome').text(dataUser.nome);
        },
        error: (err) => {
            // Limpa o token
            localStorage.clear();
            // Retorna para login
            return window.location.href = "index.html";
        }
    })
})

$('.sair').click(() => {
    // Limpa o local storage
    localStorage.clear();

    // Redireciona para login
    window.location.href = 'index.html';
})