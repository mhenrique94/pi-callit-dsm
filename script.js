// Função Genérica de Recuperação de Informação
function recuperarInformacao(chave) {
  // Recuperando a informação do localStorage
  return JSON.parse(localStorage.getItem(chave))
}

// Função Genérica de Salvamento de Informação
function salvarInformacao(chave, valor) {
  // Salvando a informação no localStorage
  localStorage.setItem(chave, JSON.stringify(valor))
}

// Função de Login
function login() {
  // Salvando os dados no localStorage
  const dadosUsuario = recuperarInformacao("userData")

}

// Função de Cadastro
function cadastro(fullName, email, password) {
  // Criando um objeto para armazenar os dados do usuário
  let userData = {
    fullName: fullName,
    email: email,
    password: password
  }
  // Salvando os dados no localStorage
  salvarInformacao("userData", userData)
}

// Função de Verificação se Está Logado
function isLoggedIn() {
  // Verificando se os dados do usuário estão no localStorage
  const dadosUsuario = recuperarInformacao("userData")
  let fullName = dadosUsuario?.fullName
  if (fullName) {
    return {
      fullName: fullName
    }
  }
  return null
}
