export function Validation(input) {
  const typeInput = input.dataset.tipo;

  if (validators[typeInput]) {
    validators[typeInput](input);
  }

  if (input.validity.valid) {
    input.parentElement.classList.remove("input-container--invalido");
    input.parentElement.querySelector(".input-mensagem-erro").innerHTML = "";
  } else {
    input.parentElement.classList.add("input-container--invalido");
    input.parentElement.querySelector(".input-mensagem-erro").innerHTML =
      showMessageError(typeInput, input);
  }
}

const TypesOfError = [
  "valueMissing",
  "typeMismatch",
  "patternMismatch",
  "customError",
];

const errorMessages = {
  nome: {
    valueMissing: "O campo de nome não pode estar vazio.",
  },
  email: {
    valueMissing: "O campo de email não pode estar vazio.",
    typeMismatch: "O email digitado não é válido.",
  },
  senha: {
    valueMissing: "O campo de senha não pode estar vazio.",
    patternMismatch:
      "A senha deve conter entre 6 a 12 caracteres, deve conter pelo menos uma letra maiúscula, um número e não deve conter símbolos.",
  },
  dataNascimento: {
    valueMissing: "O campo de data de nascimento não pode estar vazio.",
    customError: "Você deve ser maior que 18 anos para se cadastrar.",
  },
  cpf: {
    valueMissing: "O campo de CPF não pode estar vazio.",
    customError: "O CPF digitado não é válido.",
  },
  cep: {
    valueMissing: "O campo de CEP não pode estar vazio.",
    patternMismatch: "O CEP digitado não é válido.",
    customError: "Não foi possível buscar o CEP.",
  },
  logradouro: {
    valueMissing: "O campo de logradouro não pode estar vazio.",
  },
  cidade: {
    valueMissing: "O campo de cidade não pode estar vazio.",
  },
  estado: {
    valueMissing: "O campo de estado não pode estar vazio.",
  },
  preco: {
    valueMissing: "O campo de preço não pode estar vazio.",
  },
};

const validators = {
  dataNascimento: (input) => validDateOfBirth(input),
  cpf: (input) => validatesCPF(input),
  cep: (input) => retrieveZipCode(input),
};

function showMessageError(typeOfInput, input) {
  let message = "";
  TypesOfError.forEach((erro) => {
    if (input.validity[erro]) {
      message = errorMessages[typeOfInput][erro];
    }
  });

  return message;
}

function validDateOfBirth(input) {
  const receivedDate = new Date(input.value);
  let message = "";

  if (!overEighteenYearsOfAge(receivedDate)) {
    message = "Você deve ser maior que 18 anos para se cadastrar.";
  }

  input.setCustomValidity(message);
}

function overEighteenYearsOfAge(data) {
  const atualDate = new Date();
  const dateOverEighteen = new Date(
    data.getUTCFullYear() + 18,
    data.getUTCMonth(),
    data.getUTCDate()
  );

  return dateOverEighteen <= atualDate;
}

function validatesCPF(input) {
  const cpfFormatted = input.value.replace(/\D/g, "");
  let message = "";

  if (!checkCpfRepeated(cpfFormatted) || !checkTheStructureCpf(cpfFormatted)) {
    message = "O CPF digitado não é válido.";
  }

  input.setCustomValidity(message);
}

function checkCpfRepeated(cpf) {
  const repeatValues = [
    "00000000000",
    "11111111111",
    "22222222222",
    "33333333333",
    "44444444444",
    "55555555555",
    "66666666666",
    "77777777777",
    "88888888888",
    "99999999999",
  ];
  let validCpf = true;

  repeatValues.forEach((valor) => {
    if (valor == cpf) {
      validCpf = false;
    }
  });

  return validCpf;
}

function checkTheStructureCpf(cpf) {
  const multiplier = 10;

  return checkDigit(cpf, multiplier);
}

function checkDigit(cpf, multiplier) {
  if (multiplier >= 12) {
    return true;
  }

  let initialMultiplier = multiplier;
  let sum = 0;

  const cpfWithoutDigits = cpf.substr(0, multiplier - 1).split("");
  const checkDigitVerific = cpf.charAt(multiplier - 1);
  for (let counter = 0; initialMultiplier > 1; initialMultiplier--) {
    sum = sum + cpfWithoutDigits[counter] * initialMultiplier;
    counter++;
  }

  if (checkDigitVerific == confirmeDigit(sum)) {
    return checkDigit(cpf, multiplier + 1);
  }

  return false;
}

function confirmeDigit(soma) {
  return 11 - (soma % 11);
}

function retrieveZipCode(input) {
  const cep = input.value.replace(/\D/g, "");
  const url = `https://viacep.com.br/ws/${cep}/json/`;
  const options = {
    method: "GET",
    mode: "cors",
    headers: {
      "content-type": "application/json;charset=utf-8",
    },
  };

  if (!input.validity.patternMismatch && !input.validity.valueMissing) {
    fetch(url, options)
      .then((response) => response.json())
      .then((data) => {
        if (data.erro) {
          input.setCustomValidity("Não foi possível buscar o CEP.");
          return;
        }
        input.setCustomValidity("");
        fillZipCodeFields(data);
        return;
      });
  }
}

function fillZipCodeFields(data) {
  const publicArea = document.querySelector('[data-tipo="logradouro"]');
  const city = document.querySelector('[data-tipo="cidade"]');
  const state = document.querySelector('[data-tipo="estado"]');

  publicArea.value = data.logradouro;
  city.value = data.localidade;
  state.value = data.uf;
}
