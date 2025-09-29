// URL da API
var URL_API = 'http://127.0.0.1:5000';

const socket = io(URL_API);

// Exporta como default
export { URL_API, socket };