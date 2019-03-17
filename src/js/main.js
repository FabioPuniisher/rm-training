/* eslint-disable require-jsdoc */
import {getRandomIntInclusive, serialize} from './utils';

const form = document.querySelector('.search-form');
const searchInput = document.getElementById('search');
const statusSelect = document.getElementById('status');
const genderSelect = document.getElementById('gender');
const mainWrapper = document.querySelector('.main-wrapper');
const errorElement = document.querySelector('.error');
const spinnerElement = document.querySelector('.spinner');
const paginationElement = document.querySelector('.pagination');
const paginationBackward = paginationElement.querySelectorAll('button')[0];
const paginationForward = paginationElement.querySelectorAll('button')[1];
const paginationText = paginationElement.querySelector('span');

const CHARACTERS_COUNT = 493;

const statuses = [
  {
    text: 'Todos os estados',
    value: '',
  },
  {
    text: 'Vivo',
    value: 'alive',
  },
  {
    text: 'Morto',
    value: 'dead',
  },
  {
    text: 'Desconhecido',
    value: 'unknown',
  },
];

const genders = [
  {
    text: 'Todos os gêneros',
    value: '',
  },
  {
    text: 'Feminino',
    value: 'female',
  },
  {
    text: 'Masculino',
    value: 'male',
  },
  {
    text: 'Indefinido',
    value: 'genderless',
  },
  {
    text: 'Desconhecido',
    value: 'unknown',
  },
];

window.onload = () => {
  showRandomCharacters();
  setupSelectors();
};


form.onsubmit = () => {
  return findCharacter();
};

/**
 * Mostra personagens aleatórios
 */
function showRandomCharacters() {
  const ids = [];
  let i = 0;

  while (i < 10) {
    const id = getRandomIntInclusive(1, CHARACTERS_COUNT);
    const duplicate = ids.indexOf(id) !== -1;

    if (!duplicate) {
      ids.push(id);
      i += 1;
    }
  }

  fetch(`https://rickandmortyapi.com/api/character/${ids.join(',')}`)
      .then((res) => {
        if (!res.ok) {
          errorElement.removeAttribute('hidden');
          throw new Error('A API não retornou OK');
        }

        return res.json();
      })
      .then((data) => {
        createCharacters({results: data});
      })
      .catch((e) => {
        errorElement.removeAttribute('hidden');
        console.error(e);
      });
}

/**
 * Executa a request filtrada na API
 * com base nos dados obtidos pelo form e selectors
 * @return {bool}
 */
function findCharacter() {
  const characterName = searchInput.value;
  const characterStatus = statusSelect.value;
  const characterGender = genderSelect.value;

  if (characterName.length < 1) {
    return;
  }

  // https://rickandmortyapi.com/api/character/?name={name}

  const params = {
    name: characterName,
    status: characterStatus,
    gender: characterGender,
    // species: characterSpecies,
    // type
  };

  doRequest(`https://rickandmortyapi.com/api/character/?${serialize(params)}`);
  return false;
}

function doRequest(url) {
  spinnerElement.removeAttribute('hidden');
  errorElement.setAttribute('hidden', true);
  removeCharacterElements();

  fetch(url)
      .then((res) => {
        if (!res.ok) {
          errorElement.removeAttribute('hidden');
          throw new Error('A API não retornou OK');
        }

        return res.json();
      })
      .then((data) => {
        pagination(data.info);
        createCharacters(data);
      })
      .catch((e) => {
        errorElement.removeAttribute('hidden');
        console.error(e);
      });
}

function createCharacters(data) {
  const container = document.createDocumentFragment();

  data.results.forEach((character) => {
    createCharacterElement(character, container);
  });

  spinnerElement.setAttribute('hidden', true);
  mainWrapper.appendChild(container);
}

function removeCharacterElements() {
  while (mainWrapper.hasChildNodes()) {
    mainWrapper.removeChild(mainWrapper.firstChild);
  }
}

function createCharacterElement(character, parentEl) {
  const characterEl = document.createElement('div');
  const infoEl = document.createElement('div');
  const ul = document.createElement('ul');

  characterEl.className = 'character';
  infoEl.className = 'info';

  createFigureElement(character, characterEl);
  createInfoElement('Estado', character.status, ul);
  createInfoElement('Espécie', character.species, ul);
  createInfoElement('Gênero', character.gender, ul);
  createInfoElement('Local', character.location.name, ul);

  infoEl.appendChild(ul);
  characterEl.appendChild(infoEl);
  parentEl.appendChild(characterEl);
}

function createInfoElement(key, value, parentEl) {
  const infoEl = document.createElement('li');
  const infoKey = document.createElement('span');
  const infoValue = document.createElement('span');

  infoKey.textContent = key;
  infoValue.textContent = value;

  infoEl.appendChild(infoKey);
  infoEl.appendChild(infoValue);
  parentEl.appendChild(infoEl);
}

function createFigureElement(character, parentEl) {
  const imgEl = document.createElement('img');
  const figureEl = document.createElement('figure');
  const figcaptionEl = document.createElement('figcaption');
  const spanEl = document.createElement('span');
  const smallEl = document.createElement('small');

  spanEl.textContent = character.name;
  smallEl.textContent = `(${character.id})`;
  imgEl.src = character.image;

  figcaptionEl.appendChild(spanEl);
  figcaptionEl.appendChild(smallEl);
  figureEl.appendChild(imgEl);
  figureEl.appendChild(figcaptionEl);
  parentEl.appendChild(figureEl);
}

function setupSelectors() {
  statuses.forEach((status) => {
    const option = document.createElement('option');
    option.value = status.value;
    option.textContent = status.text;
    statusSelect.appendChild(option);
  });

  genders.forEach((gender) => {
    const option = document.createElement('option');
    option.value = gender.value;
    option.textContent = gender.text;
    genderSelect.appendChild(option);
  });
}

// data = info object from API response
function pagination(data) {
  if (data.pages > 1) {
    paginationElement.style.visibility = 'visible';

    if (data.prev !== '') {
      paginationBackward.onclick = () => {
        doRequest(data.prev);
      };

      paginationBackward.style.visibility = 'visible';

      const urlParams = new URLSearchParams(new URL(data.prev).search);

      if (urlParams.has('page')) {
        paginationText.textContent = String(
            parseInt(urlParams.get('page')) + 1
        );
      }
    } else {
      paginationBackward.onclick = () => {};
      paginationBackward.style.visibility = 'hidden';
      paginationText.textContent = '1';
    }

    if (data.next !== '') {
      paginationForward.onclick = () => {
        doRequest(data.next);
      };

      paginationForward.style.visibility = 'visible';
    } else {
      paginationForward.onclick = () => {};
      paginationForward.style.visibility = 'hidden';
    }
  } else {
    paginationElement.style.visibility = 'hidden';
  }
}
