(function () {
  'use strict';

  var CONFIG = {
    player: { max_hp: 100 },
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
    enemies: {
      rat: {
        name: 'Крыса', hp: 25, damage_min: 4, damage_max: 10, image: 'rat',
        aggressive: { name: 'Крыса (агрессивная)', hp: 40, damage_min: 8, damage_max: 16, image: 'rat_agg' }
      },
      stalker: {
        name: 'Сталкер', hp: 35, damage_min: 6, damage_max: 12, image: 'stalker',
        aggressive: { name: 'Сталкер (агрессивный)', hp: 55, damage_min: 12, damage_max: 20, image: 'stalker_agg' }
      },
      mutant: {
        name: 'Мутант', hp: 45, damage_min: 10, damage_max: 18, image: 'mutant',
        aggressive: { name: 'Мутант (агрессивный)', hp: 70, damage_min: 16, damage_max: 26, image: 'mutant_agg' }
      }
    },
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
    player: { hp: 100, max_hp: 100, bread_count: 1, unlocked_cards: ['fist', 'knife', 'bread'] },
    progress: { battles_won: 0, nodes_visited: {}, current_node: 'start' },
    combat: null
  };

  function getEnemyCount() {
    var won = state.progress.battles_won;
    if (won >= 5) return 3;
    if (won >= 2) return 2;
    return 1;
  }

  function tryUnlockCards(nodeId) {
    var loc = CONFIG.unlock_locations;
    for (var card in loc) {
      if (loc[card].indexOf(nodeId) !== -1 && state.player.unlocked_cards.indexOf(card) === -1)
        state.player.unlocked_cards.push(card);
    }
  }

  function restHeal() {
    state.player.hp = Math.min(CONFIG.player.max_hp, state.player.hp + 25);
    state.player.bread_count = Math.min(3, state.player.bread_count + 1);
  }

  function roll(min, max) {
    return min >= max ? min : min + Math.floor(Math.random() * (max - min + 1));
  }

  function startCombat(count) {
    var types = Object.keys(CONFIG.enemies);
    var enemies = [];
    for (var i = 0; i < count; i++) {
      var type = types[Math.floor(Math.random() * types.length)];
      var base = CONFIG.enemies[type];
      var agg = Math.random() < 0.5 && base.aggressive;
      var e = agg ? base.aggressive : { name: base.name, hp: base.hp, damage_min: base.damage_min, damage_max: base.damage_max, image: base.image };
      enemies.push({
        id: 'e' + i, type: type, name: e.name, hp: e.hp, max_hp: e.hp,
        damage_min: e.damage_min, damage_max: e.damage_max, image: e.image,
        aggressive: !!agg, bleed: 0, fire_rounds: 0
      });
    }
    state.combat = { enemies: enemies, turn: 'player', log: [] };
  }

  function getHand() {
    var hand = [];
    var cards = CONFIG.cards;
    state.player.unlocked_cards.forEach(function (key) {
      if (!cards[key]) return;
      var c = cards[key];
      if (key === 'bread') {
        for (var i = 0; i < state.player.bread_count; i++)
          hand.push({ key: key, name: c.name, type: c.type, data: c });
      } else {
        hand.push({ key: key, name: c.name, type: c.type, data: c });
      }
    });
    return hand;
  }

  function findEnemy(id) {
    for (var i = 0; i < state.combat.enemies.length; i++)
      if (state.combat.enemies[i].id === id) return state.combat.enemies[i];
    return null;
  }

  function damageEnemy(id, dmg, log) {
    for (var i = 0; i < state.combat.enemies.length; i++) {
      if (state.combat.enemies[i].id === id) {
        state.combat.enemies[i].hp = Math.max(0, state.combat.enemies[i].hp - dmg);
        log.push(state.combat.enemies[i].name + ': -' + dmg + ' HP');
        return;
      }
    }
  }

  function addFire(id, rounds, dmgPerRound) {
    for (var i = 0; i < state.combat.enemies.length; i++) {
      if (state.combat.enemies[i].id === id) {
        state.combat.enemies[i].fire_rounds = Math.max(state.combat.enemies[i].fire_rounds || 0, rounds);
        state.combat.enemies[i].fire_damage_per_round = dmgPerRound;
        return;
      }
    }
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
    }
    state.combat.enemies = en.filter(function (e) { return e.hp > 0; });
  }

  function enemyTurn() {
    state.combat.enemies.forEach(function (e) {
      if (e.hp <= 0) return;
      var dmg = roll(e.damage_min, e.damage_max);
      state.player.hp = Math.max(0, state.player.hp - dmg);
      state.combat.log.push(e.name + ' бьёт вас: -' + dmg + ' HP');
    });
    if (state.player.hp <= 0) {
      state.combat.log.push('Вы погибли...');
      state.combat.defeat = true;
      return;
    }
    state.combat.turn = 'player';
  }

  function endPlayerTurn() {
    state.combat.turn = 'enemy';
    applyBleedAndFire();
    enemyTurn();
  }

  function useCard(cardKey, targetId) {
    var combat = state.combat;
    if (!combat || combat.turn !== 'player') return { ok: false, error: 'Не ваш ход' };
    var card = CONFIG.cards[cardKey];
    if (!card) return { ok: false, error: 'Нет такой карты' };
    var enemies = state.combat.enemies;

    if (card.type === 'heal') {
      if (cardKey === 'bread' && state.player.bread_count <= 0) return { ok: false, error: 'Нет хлеба' };
      var heal = card.heal;
      state.player.hp = Math.min(CONFIG.player.max_hp, state.player.hp + heal);
      if (cardKey === 'bread') state.player.bread_count--;
      state.combat.log.push('Использовано: ' + card.name + '. +' + heal + ' HP.');
      endPlayerTurn();
      return { ok: true };
    }

    var log = [];
    switch (card.target) {
      case 'single':
        if (!targetId) return { ok: false, error: 'Выберите цель' };
        if (!findEnemy(targetId)) return { ok: false, error: 'Цель не найдена' };
        var dmg = roll(card.damage_min, card.damage_max);
        damageEnemy(targetId, dmg, log);
        if (card.effect === 'bleed' && Math.floor(Math.random() * 100) < (card.bleed_chance || 30)) {
          for (var j = 0; j < state.combat.enemies.length; j++)
            if (state.combat.enemies[j].id === targetId) state.combat.enemies[j].bleed = 3;
          log.push('Кровотечение!');
        }
        break;
      case 'all':
        enemies.forEach(function (e) {
          damageEnemy(e.id, roll(card.damage_min, card.damage_max), log);
        });
        break;
      case 'volley3':
        if (!targetId) return { ok: false, error: 'Выберите цель' };
        for (var v = 0; v < (card.volley_count || 3); v++)
          damageEnemy(targetId, roll(card.damage_min, card.damage_max), log);
        break;
      case 'rocket':
        if (!targetId) return { ok: false, error: 'Выберите цель' };
        damageEnemy(targetId, roll(card.damage_min, card.damage_max), log);
        var splash = card.splash_damage || 5, fr = card.fire_rounds || 3, fd = card.fire_damage_per_round || 4;
        enemies.forEach(function (e) {
          addFire(e.id, fr, fd);
          if (e.id !== targetId) damageEnemy(e.id, splash, log);
        });
        log.push('Огонь на ' + fr + ' хода!');
        break;
      default:
        return { ok: false, error: 'Неизвестная карта' };
    }
    log.forEach(function (line) { state.combat.log.push(line); });
    state.combat.enemies = state.combat.enemies.filter(function (e) { return e.hp > 0; });
    if (state.combat.enemies.length === 0) {
      state.progress.battles_won++;
      state.combat = null;
      return { ok: true, victory: true };
    }
    endPlayerTurn();
    return { ok: true };
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
    return { ok: true };
  }

  function resetGame() {
    state.player = { hp: 100, max_hp: 100, bread_count: 1, unlocked_cards: ['fist', 'knife', 'bread'] };
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

  function render() {
    var main = document.getElementById('main');
    var hpFill = document.getElementById('hpFill');
    var hpValue = document.getElementById('hpValue');
    var progressEl = document.getElementById('progress');
    var p = state.player;
    var hpPct = p.max_hp ? Math.min(100, Math.round(p.hp / p.max_hp * 100)) : 0;
    hpFill.style.width = hpPct + '%';
    hpValue.textContent = p.hp + ' / ' + p.max_hp;
    progressEl.textContent = 'Побед: ' + state.progress.battles_won;

    if (state.player.hp <= 0 || (state.combat && state.combat.defeat)) {
      main.innerHTML = '<section class="screen screen-defeat"><h1>Поражение</h1><p>Вы погибли в бою.</p><button type="button" class="btn btn-primary" id="btnResetDefeat">Начать заново</button></section>';
      document.getElementById('btnResetDefeat').onclick = function () { resetGame(); render(); };
      return;
    }

    if (state.combat) {
      var node = MAP[state.progress.current_node];
      var html = '<section class="screen screen-combat"><h2>Бой — ' + escapeHtml(node.name) + '</h2><div class="combat-enemies">';
      state.combat.enemies.forEach(function (e) {
        var svg = enemySvg(e.image, 'g-' + e.id);
        html += '<div class="enemy-card' + (e.aggressive ? ' enemy-aggressive' : '') + '" data-enemy-id="' + escapeHtml(e.id) + '">';
        html += '<div class="enemy-image">' + svg + '</div>';
        html += '<div class="enemy-name">' + escapeHtml(e.name) + '</div>';
        html += '<div class="enemy-hp"><div class="enemy-hp-bar"><div class="enemy-hp-fill" style="width:' + (e.max_hp ? Math.round(e.hp / e.max_hp * 100) : 0) + '%"></div></div><span>' + e.hp + ' / ' + e.max_hp + '</span></div>';
        if (e.fire_rounds) html += '<span class="status status-fire">Огонь ' + e.fire_rounds + '</span>';
        if (e.bleed) html += '<span class="status status-bleed">Кровь ' + e.bleed + '</span>';
        html += '</div>';
      });
      html += '</div><div class="combat-log">';
      (state.combat.log.slice(-8)).forEach(function (line) {
        html += '<div class="log-line">' + escapeHtml(line) + '</div>';
      });
      html += '</div>';
      if (state.combat.turn === 'player') {
        html += '<div class="combat-hand"><p class="hand-label">Выберите карту (и цель при необходимости):</p><div class="hand-cards">';
        getHand().forEach(function (card) {
          var needTarget = ['single', 'volley3', 'rocket'].indexOf((card.data.target || '')) !== -1;
          html += '<button type="button" class="card-btn" data-card-key="' + escapeHtml(card.key) + '" data-need-target="' + (needTarget ? '1' : '0') + '">';
          html += '<span class="card-name">' + escapeHtml(card.name) + '</span>';
          if (card.type === 'weapon') html += '<span class="card-damage">' + (card.data.damage_min || 0) + '–' + (card.data.damage_max || 0) + ' урона</span>';
          else html += '<span class="card-heal">+' + (card.data.heal || 0) + ' HP</span>';
          html += '</button>';
        });
        html += '</div><p class="target-hint" id="targetHint" style="display:none">Выберите цель среди врагов.</p></div>';
      } else {
        html += '<p class="turn-info">Ход врагов...</p><button type="button" class="btn btn-primary" id="btnEnemyTurn">Продолжить</button>';
      }
      html += '</section>';
      main.innerHTML = html;

      if (state.combat.turn === 'player') {
        var targetHint = document.getElementById('targetHint');
        var cardBtns = main.querySelectorAll('.card-btn');
        var enemyCards = main.querySelectorAll('.enemy-card[data-enemy-id]');
        var selectedCard = null;
        cardBtns.forEach(function (btn) {
          btn.onclick = function () {
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
            if (!selectedCard) return;
            var r = useCard(selectedCard, el.dataset.enemyId);
            if (!r.ok) alert(r.error); else render();
          };
        });
      } else {
        document.getElementById('btnEnemyTurn').onclick = function () { render(); };
      }
      return;
    }

    var currentNode = MAP[state.progress.current_node] || MAP.start;
    var nextIds = currentNode.next || [];
    var html = '<section class="screen screen-map"><h2>Карта</h2>';
    html += '<div class="current-node">Вы находитесь: <strong>' + escapeHtml(currentNode.name) + '</strong> (' + typeLabel(currentNode.type) + ')</div>';
    html += '<div class="map-moves"><p>Куда идти?</p>';
    nextIds.forEach(function (nid) {
      var n = MAP[nid];
      if (!n) return;
      html += '<button type="button" class="btn btn-move move-btn" data-node-id="' + escapeHtml(nid) + '">';
      html += escapeHtml(n.name) + ' <span class="node-type">(' + typeLabel(n.type) + ')</span></button>';
    });
    html += '</div>';
    if (currentNode.type === 'rest') html += '<div class="rest-info">Вы отдохнули. +25 HP, +1 хлеб (макс. 3).</div>';
    if (currentNode.type === 'shop') html += '<div class="shop-info">Здесь можно развиться. Новые карты открываются при посещении локаций.</div>';
    if (currentNode.type === 'finish') html += '<div class="finish-info">Поздравляем! Вы прошли игру. Побед в боях: ' + state.progress.battles_won + '.</div>';
    html += '</section>';
    main.innerHTML = html;
    main.querySelectorAll('.move-btn').forEach(function (btn) {
      btn.onclick = function () {
        moveTo(btn.dataset.nodeId);
        render();
      };
    });
  }

  document.getElementById('btnReset').onclick = function () {
    resetGame();
    render();
  };

  render();
})();
