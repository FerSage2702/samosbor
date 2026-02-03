(function () {
  'use strict';

  var ELEMENTS = {
    electric: { name: 'Электро', damagePerLevel: 2, desc: 'Доп. урон по др. целям' },
    frost: { name: 'Мороз', damagePerLevel: 1, freezeRounds: 1, desc: 'Цель застывает на ход' },
    fire: { name: 'Огонь', burnRounds: 2, burnDamagePerLevel: 2, desc: 'Горение 2 хода' },
    acid: { name: 'Кислота', weakenPercent: 10, damageBoostPercent: 15, desc: 'Ослабляет врага, +урон' }
  };
  var ELEMENT_KEYS = Object.keys(ELEMENTS);

  var CONFIG = {
    player: { max_hp: 100, base_action_points: 3 },
    cards: {
      fist: { name: 'Кулак', type: 'weapon', damage_min: 3, damage_max: 8, target: 'single', effect: null, unlock_from_start: true },
      knife: { name: 'Нож', type: 'weapon', damage_min: 12, damage_max: 18, target: 'single', effect: null, unlock_from_start: true },
      axe: { name: 'Топор', type: 'weapon', damage_min: 18, damage_max: 28, target: 'single', effect: 'bleed', bleed_chance: 30, unlock_from_start: false },
      sgushka: { name: 'Сгушка', type: 'weapon', damage_min: 8, damage_max: 14, target: 'all', effect: null, unlock_from_start: false },
      gvozdomet: { name: 'Гвоздомет', type: 'weapon', damage_min: 6, damage_max: 10, target: 'volley3', volley_count: 3, effect: null, unlock_from_start: false },
      rocket: { name: 'Сигнальная ракета', type: 'weapon', damage_min: 15, damage_max: 22, target: 'rocket', splash_damage: 5, fire_rounds: 3, fire_damage_per_round: 4, unlock_from_start: false },
      medkit: { name: 'Аптечка', type: 'heal', heal: 30, unlock_from_start: false },
      bread: { name: 'Буханка хлеба', type: 'heal', heal: 10, unlock_from_start: true, start_count: 1 }
    },
    shields: {
      trashcan_lid: { name: 'Крышка от ведра', block: 6, type: 'medium' },
      trashcan: { name: 'Мусорное ведро', block: 12, type: 'high' }
    },
    enemies: {
      rat: {
        name: 'Крыса', hp: 25, damage_min: 4, damage_max: 10, image: 'rat', coins: 3,
        aggressive: { name: 'Крыса (агрессивная)', hp: 40, damage_min: 8, damage_max: 16, image: 'rat_agg', coins: 6 }
      },
      stalker: {
        name: 'Сталкер', hp: 35, damage_min: 6, damage_max: 12, image: 'stalker', coins: 5,
        aggressive: { name: 'Сталкер (агрессивный)', hp: 55, damage_min: 12, damage_max: 20, image: 'stalker_agg', coins: 10 }
      },
      mutant: {
        name: 'Мутант', hp: 45, damage_min: 10, damage_max: 18, image: 'mutant', coins: 8,
        aggressive: { name: 'Мутант (агрессивный)', hp: 70, damage_min: 16, damage_max: 26, image: 'mutant_agg', coins: 15 }
      }
    },
    shop: {
      hp_upgrade: { cost: 30, hp_bonus: 15, permanent: true },
      extra_life: { cost: 50, name: 'Доп. жизнь' },
      trashcan_lid: { cost: 25, name: 'Крышка ведра (блок 6)', type: 'shield' },
      trashcan: { cost: 45, name: 'Мусорное ведро (блок 12)', type: 'shield' },
      axe: { cost: 40, name: 'Топор', type: 'weapon' },
      sgushka: { cost: 35, name: 'Сгушка', type: 'weapon' },
      gvozdomet: { cost: 35, name: 'Гвоздомет', type: 'weapon' },
      rocket: { cost: 50, name: 'Сигнальная ракета', type: 'weapon' },
      medkit: { cost: 25, name: 'Аптечка', type: 'heal' },
      bread: { cost: 10, name: 'Буханка хлеба', type: 'heal' },
      element_upgrade: { cost: 20 }
    },
    shop_random_pool: ['extra_life', 'trashcan_lid', 'trashcan', 'axe', 'sgushka', 'gvozdomet', 'rocket', 'medkit', 'bread'],
    enemies_progression: { 0: 1, 2: 2, 5: 3 },
    unlock_locations: {
      axe: ['shop_1', 'node_5'], sgushka: ['shop_2', 'node_8'], gvozdomet: ['shop_1', 'node_12'],
      rocket: ['shop_2', 'node_15'], medkit: ['rest_1', 'shop_1', 'node_7'], bread: ['rest_1', 'shop_1', 'shop_2']
    }
  };

  var MAP = {
    start: { id: 'start', type: 'start', next: ['node_1', 'node_2'], name: 'Старт' },
    node_1: { id: 'node_1', type: 'enemy', next: ['node_3'], name: 'Тёмная аллея' },
    node_2: { id: 'node_2', type: 'rest', next: ['node_4'], name: 'Привал' },
    node_3: { id: 'node_3', type: 'shop', next: ['node_5', 'node_6'], name: 'Торговец' },
    node_4: { id: 'node_4', type: 'enemy', next: ['node_6'], name: 'Развалины' },
    node_5: { id: 'node_5', type: 'enemy', next: ['node_7'], name: 'Подвал' },
    node_6: { id: 'node_6', type: 'rest', next: ['node_8'], name: 'Кострище' },
    node_7: { id: 'node_7', type: 'shop', next: ['node_9'], name: 'Склад' },
    node_8: { id: 'node_8', type: 'enemy', next: ['node_10'], name: 'Туннель' },
    node_9: { id: 'node_9', type: 'enemy', next: ['node_11'], name: 'Заброшка' },
    node_10: { id: 'node_10', type: 'rest', next: ['node_12'], name: 'Укрытие' },
    node_11: { id: 'node_11', type: 'enemy', next: ['node_13'], name: 'Опасная зона' },
    node_12: { id: 'node_12', type: 'shop', next: ['node_14'], name: 'База' },
    node_13: { id: 'node_13', type: 'rest', next: ['node_15'], name: 'Ночлёг' },
    node_14: { id: 'node_14', type: 'enemy', next: ['finish'], name: 'Финал' },
    node_15: { id: 'node_15', type: 'enemy', next: ['finish'], name: 'Финал' },
    finish: { id: 'finish', type: 'finish', next: [], name: 'Победа' }
  };

  function enemySvg(key, uid) {
    var svgs = {
      rat: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80"><defs><linearGradient id="{{uid}}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#6b5b4f"/><stop offset="100%" style="stop-color:#4a4038"/></linearGradient></defs><ellipse cx="40" cy="50" rx="28" ry="22" fill="url(#{{uid}})"/><circle cx="40" cy="28" r="18" fill="url(#{{uid}})"/><ellipse cx="32" cy="24" rx="4" ry="5" fill="#2a2a2a"/><ellipse cx="48" cy="24" rx="4" ry="5" fill="#2a2a2a"/></svg>',
      rat_agg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80"><defs><linearGradient id="{{uid}}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#8b3a3a"/><stop offset="100%" style="stop-color:#5a2525"/></linearGradient></defs><ellipse cx="40" cy="50" rx="28" ry="22" fill="url(#{{uid}})"/><circle cx="40" cy="28" r="18" fill="url(#{{uid}})"/><ellipse cx="48" cy="24" rx="4" ry="5" fill="#c44"/><path d="M18 50 L22 38 M62 50 L58 38" stroke="#4a2a2a" stroke-width="3" fill="none"/></svg>',
      stalker: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80"><defs><linearGradient id="{{uid}}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#5a6a5a"/><stop offset="100%" style="stop-color:#3a4a3a"/></linearGradient></defs><rect x="18" y="35" width="44" height="38" rx="4" fill="url(#{{uid}})"/><circle cx="40" cy="28" r="16" fill="#4a554a"/><rect x="28" y="50" width="8" height="20" fill="#2a352a"/><rect x="44" y="50" width="8" height="20" fill="#2a352a"/><path d="M35 22 L40 16 L45 22" stroke="#6a7a6a" stroke-width="2" fill="none"/></svg>',
      stalker_agg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80"><defs><linearGradient id="{{uid}}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#6a4a4a"/><stop offset="100%" style="stop-color:#4a2a2a"/></linearGradient></defs><rect x="16" y="33" width="48" height="42" rx="4" fill="url(#{{uid}})"/><circle cx="40" cy="26" r="17" fill="#5a3a3a"/><rect x="26" y="52" width="10" height="22" fill="#3a2222"/><rect x="44" y="52" width="10" height="22" fill="#3a2222"/><path d="M32 18 L40 8 L48 18" stroke="#8a5a5a" stroke-width="2" fill="none"/></svg>',
      mutant: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80"><defs><linearGradient id="{{uid}}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#5a4a6a"/><stop offset="100%" style="stop-color:#3a2a4a"/></linearGradient></defs><ellipse cx="40" cy="52" rx="30" ry="24" fill="url(#{{uid}})"/><path d="M20 45 Q15 30 28 22 Q40 18 52 22 Q65 30 60 45" fill="url(#{{uid}})"/><ellipse cx="35" cy="38" rx="5" ry="6" fill="#2a1a3a"/><ellipse cx="45" cy="38" rx="5" ry="6" fill="#2a1a3a"/><path d="M30 55 L25 72 M50 55 L55 72" stroke="#4a3a5a" stroke-width="4" fill="none"/></svg>',
      mutant_agg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80"><defs><linearGradient id="{{uid}}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#6a3a4a"/><stop offset="100%" style="stop-color:#4a2a2a"/></linearGradient></defs><ellipse cx="40" cy="52" rx="32" ry="25" fill="url(#{{uid}})"/><path d="M18 44 Q12 26 28 18 Q40 14 52 18 Q68 26 62 44" fill="url(#{{uid}})"/><ellipse cx="46" cy="36" rx="6" ry="7" fill="#c44"/><path d="M28 54 L20 75 M52 54 L60 75" stroke="#5a3a3a" stroke-width="5" fill="none"/></svg>'
    };
    var s = svgs[key] || '';
    return s.replace(/\{\{uid\}\}/g, uid);
  }

  var state = {
    player: {
      hp: 100, max_hp: 100, bread_count: 1, unlocked_cards: ['fist', 'knife', 'bread'],
      coins: 15, extra_lives: 0, shield: null, weapon_elements: {},
      elements_inventory: {}
    },
    deck: [], hand: [],
    shop_random_items: [],
    progress: { battles_won: 0, nodes_visited: {}, current_node: 'start' },
    combat: null
  };

  function getEnemyCount() {
    var won = state.progress.battles_won;
    if (won >= 5) return 3;
    if (won >= 2) return 2;
    return 1;
  }

  function getAggressiveChance() {
    var won = state.progress.battles_won;
    var total = 16;
    if (won >= 12) return 0.9;
    if (won >= 8) return 0.7;
    if (won >= 5) return 0.5;
    if (won >= 3) return 0.3;
    return 0.15;
  }

  function tryUnlockCards(nodeId) {
    var loc = CONFIG.unlock_locations;
    for (var card in loc) {
      if (loc[card].indexOf(nodeId) !== -1 && state.player.unlocked_cards.indexOf(card) === -1)
        state.player.unlocked_cards.push(card);
    }
  }

  function restHeal() {
    state.player.hp = Math.min(state.player.max_hp, state.player.hp + 25);
    state.player.bread_count = Math.min(3, state.player.bread_count + 1);
  }

  function roll(min, max) {
    return min >= max ? min : min + Math.floor(Math.random() * (max - min + 1));
  }

  function shuffleArray(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function buildDeck() {
    var deck = [];
    var cards = CONFIG.cards;
    state.player.unlocked_cards.forEach(function (key) {
      if (!cards[key]) return;
      var c = cards[key];
      if (key === 'bread') {
        for (var i = 0; i < state.player.bread_count; i++)
          deck.push({ key: key, name: c.name, type: c.type, data: c });
      } else {
        deck.push({ key: key, name: c.name, type: c.type, data: c });
      }
    });
    return shuffleArray(deck);
  }

  function drawHand() {
    state.deck = state.deck.length ? state.deck : buildDeck();
    var handSize = Math.min(5, state.deck.length);
    state.hand = state.deck.splice(0, handSize);
  }

  function getHand() {
    if (!state.hand || state.hand.length === 0) drawHand();
    return state.hand;
  }

  function useCardFromHand(cardKey) {
    for (var i = 0; i < state.hand.length; i++) {
      if (state.hand[i].key === cardKey) {
        state.hand.splice(i, 1);
        break;
      }
    }
  }

  function startCombat(count) {
    var types = Object.keys(CONFIG.enemies);
    var enemies = [];
    var aggChance = getAggressiveChance();
    for (var i = 0; i < count; i++) {
      var type = types[Math.floor(Math.random() * types.length)];
      var base = CONFIG.enemies[type];
      var agg = Math.random() < aggChance && base.aggressive;
      var e = agg ? base.aggressive : { name: base.name, hp: base.hp, damage_min: base.damage_min, damage_max: base.damage_max, image: base.image, coins: base.coins };
      var coins = e.coins || base.coins || 5;
      enemies.push({
        id: 'e' + i, type: type, name: e.name, hp: e.hp, max_hp: e.hp,
        damage_min: e.damage_min, damage_max: e.damage_max, image: e.image,
        aggressive: !!agg, bleed: 0, fire_rounds: 0, freeze_rounds: 0, acid_rounds: 0,
        acid_damage_boost: 0, coins: coins
      });
    }
    drawHand();
    state.combat = {
      enemies: enemies, turn: 'player', log: [],
      action_points: CONFIG.player.base_action_points,
      max_action_points: CONFIG.player.base_action_points
    };
  }

  function findEnemy(id) {
    for (var i = 0; i < state.combat.enemies.length; i++)
      if (state.combat.enemies[i].id === id) return state.combat.enemies[i];
    return null;
  }

  function getWeaponElements(cardKey) {
    return state.player.weapon_elements[cardKey] || {};
  }

  function getElementLevel(elements, elem) {
    return elements[elem] || 0;
  }

  function damageEnemy(id, dmg, log, cardKey) {
    var enemy = findEnemy(id);
    if (!enemy) return;
    var elements = cardKey ? getWeaponElements(cardKey) : {};
    var acidBoost = (enemy.acid_damage_boost || 0) / 100;
    dmg = Math.floor(dmg * (1 + acidBoost));
    enemy.hp = Math.max(0, enemy.hp - dmg);
    log.push(enemy.name + ': -' + dmg + ' HP');
  }

  function addFire(id, rounds, dmgPerRound) {
    var enemy = findEnemy(id);
    if (enemy) {
      enemy.fire_rounds = Math.max(enemy.fire_rounds || 0, rounds);
      enemy.fire_damage_per_round = dmgPerRound;
    }
  }

  function addAcid(id, rounds, weaken, damageBoost) {
    var enemy = findEnemy(id);
    if (enemy) {
      enemy.acid_rounds = Math.max(enemy.acid_rounds || 0, rounds);
      enemy.acid_damage_boost = (enemy.acid_damage_boost || 0) + damageBoost;
    }
  }

  function applyElementEffects(cardKey, targetId, baseDmg, log) {
    var elements = getWeaponElements(cardKey);
    var totalBonus = 0;
    var enemies = state.combat.enemies;
    for (var elem in elements) {
      var lvl = elements[elem];
      if (lvl <= 0) continue;
      var cfg = ELEMENTS[elem];
      if (!cfg) continue;
      switch (elem) {
        case 'electric':
          var dmg = (cfg.damagePerLevel || 2) * lvl;
          enemies.forEach(function (e) {
            if ((targetId === null || e.id !== targetId) && e.hp > 0) {
              damageEnemy(e.id, dmg, log, null);
              totalBonus += dmg;
            }
          });
          break;
        case 'frost':
          if (targetId) {
            var f = findEnemy(targetId);
            if (f && f.hp > 0) {
              f.freeze_rounds = (cfg.freezeRounds || 1);
              var fd = (cfg.damagePerLevel || 1) * lvl;
              damageEnemy(targetId, fd, log, null);
              log.push(f.name + ' застыл!');
            }
          } else {
            enemies.forEach(function (en) {
              if (en.hp > 0) {
                en.freeze_rounds = (cfg.freezeRounds || 1);
                var fd = (cfg.damagePerLevel || 1) * lvl;
                damageEnemy(en.id, fd, log, null);
                log.push(en.name + ' застыл!');
              }
            });
          }
          break;
        case 'fire':
          if (targetId) {
            var fr = findEnemy(targetId);
            if (fr && fr.hp > 0) {
              var br = cfg.burnRounds || 2;
              var bd = (cfg.burnDamagePerLevel || 2) * lvl;
              addFire(targetId, br, bd);
              log.push('Горение ' + br + ' хода!');
            }
          } else {
            enemies.forEach(function (e) {
              if (e.hp > 0) {
                var br = cfg.burnRounds || 2;
                var bd = (cfg.burnDamagePerLevel || 2) * lvl;
                addFire(e.id, br, bd);
                log.push('Горение на ' + e.name + '!');
              }
            });
          }
          break;
        case 'acid':
          if (targetId) {
            var ar = findEnemy(targetId);
            if (ar && ar.hp > 0) {
              var wp = (cfg.weakenPercent || 10) * lvl;
              var db = (cfg.damageBoostPercent || 15) * lvl;
              addAcid(targetId, 2, wp, db);
              log.push('Кислота ослабила врага!');
            }
          } else {
            enemies.forEach(function (e) {
              if (e.hp > 0) {
                var wp = (cfg.weakenPercent || 10) * lvl;
                var db = (cfg.damageBoostPercent || 15) * lvl;
                addAcid(e.id, 2, wp, db);
                log.push('Кислота на ' + e.name + '!');
              }
            });
          }
          break;
      }
    }
    return totalBonus;
  }

  function applyBleedAndFire() {
    var en = state.combat.enemies;
    for (var i = 0; i < en.length; i++) {
      if ((en[i].bleed || 0) > 0) {
        en[i].hp = Math.max(0, en[i].hp - 3);
        en[i].bleed--;
        state.combat.log.push(en[i].name + ': кровотечение -3 HP');
      }
      if ((en[i].fire_rounds || 0) > 0) {
        var d = en[i].fire_damage_per_round || 4;
        en[i].hp = Math.max(0, en[i].hp - d);
        en[i].fire_rounds--;
        state.combat.log.push(en[i].name + ': огонь -' + d + ' HP');
      }
      if ((en[i].acid_rounds || 0) > 0) en[i].acid_rounds--;
    }
    var killed = en.filter(function (e) { return e.hp <= 0; });
    state.combat.enemies = en.filter(function (e) { return e.hp > 0; });
    return killed;
  }

  function getBlockAmount() {
    var s = state.player.shield;
    if (!s || !CONFIG.shields[s]) return 0;
    return CONFIG.shields[s].block || 0;
  }

  function enemyTurn() {
    var block = getBlockAmount();
    state.combat.enemies.forEach(function (e) {
      if (e.hp <= 0) return;
      if ((e.freeze_rounds || 0) > 0) {
        e.freeze_rounds--;
        state.combat.log.push(e.name + ' заморожен, пропускает ход.');
        return;
      }
      var dmg = roll(e.damage_min, e.damage_max);
      var acidWeaken = (e.acid_rounds || 0) > 0 ? 0.25 : 0;
      dmg = Math.max(1, Math.floor(dmg * (1 - acidWeaken)));
      dmg = Math.max(0, dmg - block);
      state.player.hp = Math.max(0, state.player.hp - dmg);
      state.combat.log.push(e.name + ' бьёт вас: -' + dmg + ' HP');
    });
    if (state.player.hp <= 0) {
      if (state.player.extra_lives > 0) {
        state.player.extra_lives--;
        state.player.hp = Math.floor(state.player.max_hp * 0.5);
        state.combat.log.push('Доп. жизнь! Восстановлено ' + state.player.hp + ' HP.');
      } else {
        state.combat.log.push('Вы погибли...');
        state.combat.defeat = true;
        return;
      }
    }
    state.combat.turn = 'player';
    state.combat.action_points = CONFIG.player.base_action_points;
    drawHand();
  }

  function endPlayerTurn() {
    state.combat.turn = 'enemy';
    var killed = applyBleedAndFire();
    if (state.combat.enemies.length === 0) {
      dropLoot(killed);
      state.progress.battles_won++;
      state.combat = null;
      return;
    }
    enemyTurn();
  }

  function dropLoot(enemies) {
    var coins = 0;
    var elements = {};
    enemies.forEach(function (e) {
      if (e.hp <= 0) {
        coins += e.coins || 5;
        if (Math.random() < 0.35) {
          var elem = ELEMENT_KEYS[Math.floor(Math.random() * ELEMENT_KEYS.length)];
          elements[elem] = (elements[elem] || 0) + 1;
        }
      }
    });
    state.player.coins += coins;
    for (var k in elements) {
      state.player.elements_inventory[k] = (state.player.elements_inventory[k] || 0) + elements[k];
    }
    return { coins: coins, elements: elements };
  }

  function useCard(cardKey, targetId) {
    var combat = state.combat;
    if (!combat || combat.turn !== 'player') return { ok: false, error: 'Не ваш ход' };
    if ((combat.action_points || 0) <= 0) return { ok: false, error: 'Нет очков действий' };
    var card = CONFIG.cards[cardKey];
    if (!card) return { ok: false, error: 'Нет такой карты' };
    var inHand = false;
    state.hand.forEach(function (c) { if (c.key === cardKey) inHand = true; });
    if (!inHand) return { ok: false, error: 'Карты нет в руке' };
    var enemies = state.combat.enemies;

    if (card.type === 'heal') {
      if (cardKey === 'bread' && state.player.bread_count <= 0) return { ok: false, error: 'Нет хлеба' };
      var heal = card.heal;
      state.player.hp = Math.min(state.player.max_hp, state.player.hp + heal);
      if (cardKey === 'bread') state.player.bread_count--;
      state.combat.log.push('Использовано: ' + card.name + '. +' + heal + ' HP.');
      useCardFromHand(cardKey);
      combat.action_points--;
      if (combat.action_points <= 0) {
        endPlayerTurn();
      }
      return { ok: true };
    }

    var log = [];
    switch (card.target) {
      case 'single':
        if (!targetId) return { ok: false, error: 'Выберите цель' };
        if (!findEnemy(targetId)) return { ok: false, error: 'Цель не найдена' };
        var dmg = roll(card.damage_min, card.damage_max);
        damageEnemy(targetId, dmg, log, cardKey);
        applyElementEffects(cardKey, targetId, dmg, log);
        if (card.effect === 'bleed' && Math.floor(Math.random() * 100) < (card.bleed_chance || 30)) {
          var t = findEnemy(targetId);
          if (t) t.bleed = 3;
          log.push('Кровотечение!');
        }
        break;
      case 'all':
        enemies.forEach(function (e) {
          damageEnemy(e.id, roll(card.damage_min, card.damage_max), log, cardKey);
        });
        applyElementEffects(cardKey, null, 0, log);
        break;
      case 'volley3':
        if (!targetId) return { ok: false, error: 'Выберите цель' };
        for (var v = 0; v < (card.volley_count || 3); v++)
          damageEnemy(targetId, roll(card.damage_min, card.damage_max), log, cardKey);
        applyElementEffects(cardKey, targetId, 0, log);
        break;
      case 'rocket':
        if (!targetId) return { ok: false, error: 'Выберите цель' };
        damageEnemy(targetId, roll(card.damage_min, card.damage_max), log, cardKey);
        var splash = card.splash_damage || 5, fr = card.fire_rounds || 3, fd = card.fire_damage_per_round || 4;
        enemies.forEach(function (e) {
          addFire(e.id, fr, fd);
          if (e.id !== targetId) damageEnemy(e.id, splash, log, null);
        });
        applyElementEffects(cardKey, targetId, 0, log);
        log.push('Огонь на ' + fr + ' хода!');
        break;
      default:
        return { ok: false, error: 'Неизвестная карта' };
    }
    log.forEach(function (line) { state.combat.log.push(line); });
    useCardFromHand(cardKey);
    combat.action_points--;
    var allEnemies = combat.enemies.slice();
    state.combat.enemies = state.combat.enemies.filter(function (e) { return e.hp > 0; });
    if (state.combat.enemies.length === 0) {
      var killed = allEnemies.filter(function (e) { return e.hp <= 0; });
      var loot = dropLoot(killed);
      state.progress.battles_won++;
      state.combat = null;
      return { ok: true, victory: true, loot: loot };
    }
    if (combat.action_points <= 0) {
      endPlayerTurn();
    }
    return { ok: true };
  }

  function buyShopItem(item) {
    var shop = CONFIG.shop[item];
    if (!shop) return { ok: false, error: 'Нет такого товара' };
    if (state.player.coins < shop.cost) return { ok: false, error: 'Недостаточно монет' };
    if (item === 'hp_upgrade') {
      state.player.max_hp += shop.hp_bonus;
      state.player.hp += shop.hp_bonus;
    } else if (item === 'extra_life') {
      state.player.extra_lives++;
    } else if (item === 'trashcan_lid') {
      if (state.player.shield === 'trashcan') return { ok: false, error: 'У вас уже лучше' };
      state.player.shield = 'trashcan_lid';
    } else if (item === 'trashcan') {
      state.player.shield = 'trashcan';
    } else if (item === 'bread') {
      if (state.player.bread_count >= 3) return { ok: false, error: 'Макс. хлеба (3)' };
      state.player.bread_count++;
    } else if (['axe', 'sgushka', 'gvozdomet', 'rocket', 'medkit'].indexOf(item) !== -1) {
      if (state.player.unlocked_cards.indexOf(item) !== -1) return { ok: false, error: 'Уже куплено' };
      state.player.unlocked_cards.push(item);
    } else if (item === 'element_upgrade') {
      return { ok: false, error: 'Используйте прокачку элемента на оружии' };
    }
    state.player.coins -= shop.cost;
    if (state.shop_random_items.indexOf(item) !== -1) {
      state.shop_random_items.splice(state.shop_random_items.indexOf(item), 1);
    }
    return { ok: true };
  }

  function buyElementUpgrade(weaponKey, elementKey) {
    var inv = state.player.elements_inventory[elementKey] || 0;
    if (inv <= 0) return { ok: false, error: 'Нет элементов ' + (ELEMENTS[elementKey] ? ELEMENTS[elementKey].name : elementKey) };
    var we = state.player.weapon_elements[weaponKey] || {};
    var cur = we[elementKey] || 0;
    if (cur >= 3) return { ok: false, error: 'Макс. уровень элемента на оружии' };
    var cost = CONFIG.shop.element_upgrade.cost;
    if (state.player.coins < cost) return { ok: false, error: 'Недостаточно монет (' + cost + ')' };
    state.player.coins -= cost;
    state.player.elements_inventory[elementKey]--;
    we[elementKey] = cur + 1;
    state.player.weapon_elements[weaponKey] = we;
    return { ok: true };
  }

  function generateShopItems() {
    var pool = CONFIG.shop_random_pool;
    var p = state.player;
    var available = pool.filter(function (key) {
      if (key === 'trashcan_lid') return p.shield !== 'trashcan_lid' && p.shield !== 'trashcan';
      if (key === 'trashcan') return p.shield !== 'trashcan';
      if (key === 'bread') return p.bread_count < 3;
      if (['axe', 'sgushka', 'gvozdomet', 'rocket', 'medkit'].indexOf(key) !== -1)
        return p.unlocked_cards.indexOf(key) === -1;
      if (key === 'extra_life') return true;
      return true;
    });
    var count = Math.min(3, Math.max(2, available.length));
    var shuffled = available.slice();
    for (var i = shuffled.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = shuffled[i]; shuffled[i] = shuffled[j]; shuffled[j] = t;
    }
    state.shop_random_items = shuffled.slice(0, count);
  }

  function moveTo(nodeId) {
    var node = MAP[state.progress.current_node];
    if (!node || (node.next || []).indexOf(nodeId) === -1) return { ok: false, error: 'Неверный узел' };
    state.progress.current_node = nodeId;
    state.progress.nodes_visited[nodeId] = true;
    node = MAP[nodeId];
    tryUnlockCards(nodeId);
    if (node.type === 'enemy') {
      startCombat(getEnemyCount());
      return { ok: true, combat: true };
    }
    if (node.type === 'rest') restHeal();
    if (node.type === 'shop') generateShopItems();
    return { ok: true };
  }

  function resetGame() {
    state.player = {
      hp: 100, max_hp: 100, bread_count: 1, unlocked_cards: ['fist', 'knife', 'bread'],
      coins: 15, extra_lives: 0, shield: null, weapon_elements: {},
      elements_inventory: {}
    };
    state.deck = [];
    state.hand = [];
    state.shop_random_items = [];
    state.progress = { battles_won: 0, nodes_visited: {}, current_node: 'start' };
    state.combat = null;
  }

  function typeLabel(t) {
    return t === 'enemy' ? 'враги' : t === 'rest' ? 'отдых' : t === 'shop' ? 'магазин' : t;
  }

  function escapeHtml(s) {
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function getWeaponCards() {
    var weapons = [];
    for (var k in CONFIG.cards) {
      var c = CONFIG.cards[k];
      if (c.type === 'weapon' && state.player.unlocked_cards.indexOf(k) !== -1)
        weapons.push(k);
    }
    return weapons;
  }

  function render() {
    var main = document.getElementById('main');
    var hpFill = document.getElementById('hpFill');
    var hpValue = document.getElementById('hpValue');
    var progressEl = document.getElementById('progress');
    var coinsEl = document.getElementById('coins');
    var actionsEl = document.getElementById('actionPoints');
    var p = state.player;
    var hpPct = p.max_hp ? Math.min(100, Math.round(p.hp / p.max_hp * 100)) : 0;
    hpFill.style.width = hpPct + '%';
    hpValue.textContent = p.hp + ' / ' + p.max_hp;
    progressEl.textContent = 'Побед: ' + state.progress.battles_won;
    if (coinsEl) coinsEl.textContent = p.coins + ' монет';
    if (actionsEl && state.combat) {
      actionsEl.textContent = 'Действия: ' + state.combat.action_points + ' / ' + state.combat.max_action_points;
      actionsEl.style.display = 'inline';
    } else if (actionsEl) actionsEl.style.display = 'none';
    var extraEl = document.getElementById('extraLives');
    if (extraEl) extraEl.textContent = p.extra_lives > 0 ? 'Жизни: ' + p.extra_lives : '';

    if (state.player.hp <= 0 || (state.combat && state.combat.defeat)) {
      main.innerHTML = '<section class="screen screen-defeat"><h1>Поражение</h1><p>Вы погибли в бою.</p><button type="button" class="btn btn-primary" id="btnResetDefeat">Начать заново</button></section>';
      document.getElementById('btnResetDefeat').onclick = function () { resetGame(); render(); };
      return;
    }

    if (state.combat) {
      var node = MAP[state.progress.current_node];
      var ap = state.combat.action_points;
      var html = '<section class="screen screen-combat"><h2>Бой — ' + escapeHtml(node.name) + '</h2>';
      html += '<div class="combat-stats"><span class="ap-display">Очки действий: ' + ap + ' / ' + state.combat.max_action_points + '</span>';
      if (p.shield) html += '<span class="shield-display">Щит: ' + (CONFIG.shields[p.shield] ? CONFIG.shields[p.shield].name : p.shield) + ' (блок ' + getBlockAmount() + ')</span>';
      html += '</div><div class="combat-enemies">';
      state.combat.enemies.forEach(function (e) {
        var svg = enemySvg(e.image, 'g-' + e.id);
        html += '<div class="enemy-card' + (e.aggressive ? ' enemy-aggressive' : '') + '" data-enemy-id="' + escapeHtml(e.id) + '">';
        html += '<div class="enemy-image">' + svg + '</div>';
        html += '<div class="enemy-name">' + escapeHtml(e.name) + '</div>';
        html += '<div class="enemy-hp"><div class="enemy-hp-bar"><div class="enemy-hp-fill" style="width:' + (e.max_hp ? Math.round(e.hp / e.max_hp * 100) : 0) + '%"></div></div><span>' + e.hp + ' / ' + e.max_hp + '</span></div>';
        if (e.fire_rounds) html += '<span class="status status-fire">Огонь ' + e.fire_rounds + '</span>';
        if (e.bleed) html += '<span class="status status-bleed">Кровь ' + e.bleed + '</span>';
        if (e.freeze_rounds) html += '<span class="status status-frost">Заморозка</span>';
        if (e.acid_rounds) html += '<span class="status status-acid">Кислота</span>';
        html += '</div>';
      });
      html += '</div><div class="combat-log">';
      (state.combat.log.slice(-10)).forEach(function (line) {
        html += '<div class="log-line">' + escapeHtml(line) + '</div>';
      });
      html += '</div>';
      if (state.combat.turn === 'player') {
        html += '<div class="combat-hand"><p class="hand-label">Карты (каждая тратит 1 очко действия). Выберите карту:</p><div class="hand-cards">';
        getHand().forEach(function (card) {
          var needTarget = ['single', 'volley3', 'rocket'].indexOf((card.data.target || '')) !== -1;
          var elemStr = '';
          var we = getWeaponElements(card.key);
          for (var ek in we) { if (we[ek]) elemStr += ' [' + (ELEMENTS[ek] ? ELEMENTS[ek].name : ek) + 'x' + we[ek] + ']'; }
          html += '<button type="button" class="card-btn' + (ap <= 0 ? ' disabled' : '') + '" data-card-key="' + escapeHtml(card.key) + '" data-need-target="' + (needTarget ? '1' : '0') + '">';
          html += '<span class="card-name">' + escapeHtml(card.name) + elemStr + '</span>';
          if (card.type === 'weapon') html += '<span class="card-damage">' + (card.data.damage_min || 0) + '–' + (card.data.damage_max || 0) + ' урона</span>';
          else html += '<span class="card-heal">+' + (card.data.heal || 0) + ' HP</span>';
          html += '</button>';
        });
        html += '</div><p class="target-hint" id="targetHint" style="display:none">Выберите цель среди врагов.</p>';
        if (ap > 0) html += '<button type="button" class="btn btn-secondary" id="btnEndTurn">Завершить ход</button>';
        html += '</div>';
      } else {
        html += '<p class="turn-info">Ход врагов...</p><button type="button" class="btn btn-primary" id="btnEnemyTurn">Продолжить</button>';
      }
      html += '</section>';
      main.innerHTML = html;

      if (state.combat.turn === 'player') {
        var targetHint = document.getElementById('targetHint');
        var cardBtns = main.querySelectorAll('.card-btn:not(.disabled)');
        var enemyCards = main.querySelectorAll('.enemy-card[data-enemy-id]');
        var selectedCard = null;
        cardBtns.forEach(function (btn) {
          btn.onclick = function () {
            if (ap <= 0) return;
            var need = btn.dataset.needTarget === '1';
            var key = btn.dataset.cardKey;
            if (need) {
              selectedCard = key;
              enemyCards.forEach(function (el) { el.classList.remove('selected'); });
              if (targetHint) targetHint.style.display = 'block';
              cardBtns.forEach(function (b) { b.classList.remove('selected'); });
              btn.classList.add('selected');
              return;
            }
            var r = useCard(key, null);
            if (!r.ok) alert(r.error); else render();
          };
        });
        enemyCards.forEach(function (el) {
          el.onclick = function () {
            if (!selectedCard || ap <= 0) return;
            var r = useCard(selectedCard, el.dataset.enemyId);
            if (!r.ok) alert(r.error); else render();
          };
        });
        var btnEndTurn = document.getElementById('btnEndTurn');
        if (btnEndTurn) btnEndTurn.onclick = function () { endPlayerTurn(); render(); };
      } else {
        document.getElementById('btnEnemyTurn').onclick = function () { render(); };
      }
      return;
    }

    var currentNode = MAP[state.progress.current_node] || MAP.start;
    var nextIds = currentNode.next || [];
    var html = '<section class="screen screen-map"><h2>Карта</h2>';
    html += '<div class="current-node">Вы находитесь: <strong>' + escapeHtml(currentNode.name) + '</strong> (' + typeLabel(currentNode.type) + ')</div>';
    if (currentNode.type === 'shop') {
      html += '<div class="shop-panel"><h3>Магазин</h3><p class="coins-display">У вас: ' + p.coins + ' монет</p>';
      var elemInv = [];
      ELEMENT_KEYS.forEach(function (ek) {
        var n = p.elements_inventory[ek] || 0;
        if (n > 0) elemInv.push((ELEMENTS[ek] ? ELEMENTS[ek].name : ek) + ': ' + n);
      });
      if (elemInv.length) html += '<p class="elements-display">Элементы: ' + elemInv.join(', ') + '</p>';
      html += '<div class="shop-items">';
      html += '<button type="button" class="shop-btn" data-item="hp_upgrade">+15 HP макс. (' + CONFIG.shop.hp_upgrade.cost + ' монет)</button>';
      state.shop_random_items.forEach(function (key) {
        var s = CONFIG.shop[key];
        if (!s) return;
        if (key === 'trashcan_lid' && (p.shield === 'trashcan' || p.shield === 'trashcan_lid')) return;
        if (key === 'trashcan' && p.shield === 'trashcan') return;
        if (key === 'bread' && p.bread_count >= 3) return;
        if (['axe', 'sgushka', 'gvozdomet', 'rocket', 'medkit'].indexOf(key) !== -1 && p.unlocked_cards.indexOf(key) !== -1) return;
        var label = (s.name || key) + ' (' + s.cost + ' монет)';
        html += '<button type="button" class="shop-btn" data-item="' + escapeHtml(key) + '">' + escapeHtml(label) + '</button>';
      });
      html += '</div>';
      html += '<h4>Прокачка оружия элементами (20 монет за уровень)</h4><div class="element-upgrades">';
      var weapons = getWeaponCards();
      weapons.forEach(function (wk) {
        var we = p.weapon_elements[wk] || {};
        var cardName = CONFIG.cards[wk] ? CONFIG.cards[wk].name : wk;
        html += '<div class="weapon-row"><span class="weapon-name">' + escapeHtml(cardName) + ':</span> ';
        ELEMENT_KEYS.forEach(function (ek) {
          var cur = we[ek] || 0;
          var inv = p.elements_inventory[ek] || 0;
          var name = ELEMENTS[ek] ? ELEMENTS[ek].name : ek;
          if (cur < 3 && inv > 0)
            html += '<button type="button" class="elem-btn" data-weapon="' + wk + '" data-elem="' + ek + '">' + name + ' +1 (есть ' + inv + ')</button> ';
          else if (cur > 0)
            html += '<span class="elem-owned">' + name + ' x' + cur + '</span> ';
        });
        html += '</div>';
      });
      html += '</div></div>';
    }
    html += '<div class="map-moves"><p>Куда идти?</p>';
    nextIds.forEach(function (nid) {
      var n = MAP[nid];
      if (!n) return;
      html += '<button type="button" class="btn btn-move move-btn" data-node-id="' + escapeHtml(nid) + '">';
      html += escapeHtml(n.name) + ' <span class="node-type">(' + typeLabel(n.type) + ')</span></button>';
    });
    html += '</div>';
    if (currentNode.type === 'rest') html += '<div class="rest-info">Вы отдохнули. +25 HP, +1 хлеб (макс. 3).</div>';
    if (currentNode.type === 'shop' && !document.querySelector('.shop-panel')) { }
    if (currentNode.type === 'finish') html += '<div class="finish-info">Поздравляем! Вы прошли игру. Побед в боях: ' + state.progress.battles_won + '.</div>';
    html += '</section>';
    main.innerHTML = html;

    main.querySelectorAll('.move-btn').forEach(function (btn) {
      btn.onclick = function () {
        moveTo(btn.dataset.nodeId);
        render();
      };
    });

    main.querySelectorAll('.shop-btn').forEach(function (btn) {
      btn.onclick = function () {
        var r = buyShopItem(btn.dataset.item);
        if (!r.ok) alert(r.error); else render();
      };
    });

    main.querySelectorAll('.elem-btn').forEach(function (btn) {
      btn.onclick = function () {
        var r = buyElementUpgrade(btn.dataset.weapon, btn.dataset.elem);
        if (!r.ok) alert(r.error); else render();
      };
    });
  }

  document.getElementById('btnReset').onclick = function () {
    resetGame();
    render();
  };

  render();
})();
