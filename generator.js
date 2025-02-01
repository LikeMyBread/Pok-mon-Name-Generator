function sRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function sRandomInt(seed, max, min) {
  seed = seed || 0;
  min = min || 0;
  return min + Math.floor(sRandom(seed) * (max - min));
}


class Trie {
  static insertNode(node, item) {
    if (node[item]) {
      node[item].C += 1;
    } else {
      node[item] = { C: 1 };
    }
    return node;
  }

  static removeNode(node, item) {
    if (node[item]) {
      node[item].C -= 1;
    }
    return node;
  }

  static addWord(node, word) {
    let currentNode = node;
    for (let i = 0; i < word.length; i++) {
      currentNode = Trie.insertNode(currentNode, word[i]);
      currentNode = currentNode[word[i]];
    }
    // Add the empty string to record word endings
    currentNode = Trie.insertNode(currentNode, "");
    return node;
  }

  static removeWord(node, word) {
    if (!Trie.contains(node, word)) {
      return false;
    }
    let currentNode = node;
    for (let i = 0; i < word.length; i++) {
      currentNode = Trie.removeNode(currentNode, word[i]);
      currentNode = currentNode[word[i]];
    }
    // Add the empty string to record word endings
    currentNode = Trie.removeNode(currentNode, "");
    return node;
  }

  static contains(node, word) {
    let currentNode = node;
    for (let i = 0; i < word.length; i++) {
      if (!currentNode[word[i]]) {
        return false;
      }
      currentNode = currentNode[word[i]];
    }
    // Require completed words
    if (!currentNode[""] || currentNode[""].C < 1) {
      return false;
    }
    return true;
  }

  static draw(node, seed) {
    const newSeed = seed || Math.floor(Math.random() * 10000000000);
    let total = 0;
    const keys = Object.keys(node).filter(key => key !== "C");
    for (let i = 0; i < keys.length; i++) {
      total += node[keys[i]].C;
    }
    let target = sRandomInt(newSeed, total + 1);
    let index = 0;
    target -= node[keys[0]].C;
    while (target > 0) {
      index += 1;
      target -= node[keys[index]].C;
    }
    return keys[index];
  }

  static randomWord(node, seed) {
    const newSeed = seed || Math.floor(Math.random() * 10000000000);
    const next = Trie.draw(node, newSeed);
    if (next !== "") {
      return next + Trie.randomWord(node[next], seed + 1);
    } else {
      return next;
    }
  }
}

/* eslint-disable */
function download(content, fileName, contentType) {
  const a = document.createElement("a");
  const file = new Blob([content], { type: contentType});
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
}
/* eslint-enable */

function capitalizeName(name) {
    let newName = name.toLowerCase()
    .split(' ')
    .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
    .join(' ');

    return newName.charAt(0).toUpperCase() + newName.slice(1);
}

/***************/

const SLICE_LENGTH = 5;

function process(list) {
  const prefixes = {};
  const suffixes = {};
  for (let i = 0; i < list.length; i++) {
    list[i] = list[i].toLowerCase();
  }
  
  for (let i = 0; i < list.length; i++) {
    Trie.addWord(prefixes, list[i].toLowerCase().slice(0, SLICE_LENGTH));
  }
  
  for (let i = 0; i < list.length; i++) {
    for (let j = 1; j < list[i].length; j++) {
      Trie.addWord(suffixes, list[i].toLowerCase().slice(j, j + SLICE_LENGTH));
    }
  }
  return {
    prefixes: prefixes,
    suffixes: suffixes
  };
}

const pokeTries = process(pokenames);

function newName(nameTries, minLength) {
  let name = Trie.randomWord(nameTries.prefixes);
  do {
    name += Trie.randomWord(nameTries.suffixes[name.slice(-1)]);
  } while (name.length < minLength);
  
  if (pokenames.includes(name)) {
    return newName(nameTries, minLength);
  }
  return name;
}

document.getElementById('clicker').onclick = function() {
  document.getElementById('trie').innerHTML = capitalizeName(newName(pokeTries, 1));
};