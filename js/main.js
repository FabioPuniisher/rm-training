const searchInput = document.getElementById('search');
const mainWrapper = document.querySelector('.main-wrapper');
const errorElement = document.querySelector('.error');
const spinnerElement = document.querySelector('.spinner');
const CHARACTERS_COUNT = 493;

window.onload = function () {
    showRandomCharacters();
};

function showRandomCharacters() {
    let ids = [];
    let charactersData = {
        results: [],
    };
    let i = 0;

    while(i < 10) {
        const id = getRandomIntInclusive(1, CHARACTERS_COUNT);
        const duplicate = ids.indexOf(id) !== -1;

        if (!duplicate) {
            ids.push(id);
            i++;
        }
    }

    ids.forEach(function(id, idx) {
        fetch(`https://rickandmortyapi.com/api/character/${id}`)
            .then(function (res) {
                if (!res.ok) {
                    errorElement.removeAttribute('hidden');
                    throw new Error('A API não retornou OK');
                }

                return res.json();
            })
            .then(function (data) {
                charactersData.results.push(data);

                if (idx === ids.length-1) {
                    createCharacters(charactersData);
                }
            })
            .catch(function (e) {
                errorElement.removeAttribute('hidden');
                console.error(e);
            });
    });
}

function findCharacter() {
    const characterName = searchInput.value;
    const characterStatus = searchInput.value;

    if (characterName.length < 1) {
        return;
    }

    spinnerElement.removeAttribute('hidden');
    errorElement.setAttribute('hidden', true);
    removeCharacterElements();

    // https://rickandmortyapi.com/api/character/?name={name}

    fetch(`https://rickandmortyapi.com/api/character/?name=${characterName}`)
        .then(function(res) {
            if (!res.ok) {
                errorElement.removeAttribute('hidden');
                throw new Error('A API não retornou OK');
            }

            return res.json();
        })
        .then(function(data) {
            createCharacters(data);
        })
        .catch(function(e) {
            errorElement.removeAttribute('hidden');
            console.error(e);
        });

    return false;
}

function createCharacters(data) {
    let container = document.createDocumentFragment();

    data.results.forEach(function (character) {
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
    let characterEl = document.createElement('div');
    let infoEl = document.createElement('div');
    let ul = document.createElement('ul');
    
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
    let infoEl = document.createElement('li');
    let infoKey = document.createElement('span');
    let infoValue = document.createElement('span');

    infoKey.textContent = key;
    infoValue.textContent = value;

    infoEl.appendChild(infoKey);
    infoEl.appendChild(infoValue);
    parentEl.appendChild(infoEl);
}

function createFigureElement(character, parentEl) {
    let imgEl = document.createElement('img');
    let figureEl = document.createElement('figure');
    let figcaptionEl = document.createElement('figcaption');
    let spanEl = document.createElement('span');
    let smallEl = document.createElement('small');

    spanEl.textContent = character.name;
    smallEl.textContent = '(' + character.id + ')';
    imgEl.src = character.image;

    figcaptionEl.appendChild(spanEl);
    figcaptionEl.appendChild(smallEl);
    figureEl.appendChild(imgEl);
    figureEl.appendChild(figcaptionEl);
    parentEl.appendChild(figureEl);
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random#Getting_a_random_integer_between_two_values_inclusive
function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive 
}