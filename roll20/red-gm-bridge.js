/*
 * RED GM Bridge v0.2 — read-only Roll20 Mod
 * Install this script under Game Details > Settings > Mod (API) Scripts.
 * GM commands: !red-ping, !red-characters, !red-inspect [character ID]
 * !red-inspect with a selected character token inspects its represented character.
 * No attribute, character, token, or campaign mutations.
 */
(function () {
    'use strict';
    var PREFIX = 'RED GM Bridge';
    var MAX_CHARACTERS = 100;
    var MAX_ATTRIBUTES = 80;

    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
    function whisper(message) {
        sendChat(PREFIX, '/w gm ' + message);
    }
    function sortedCharacters() {
        return (findObjs({ _type: 'character' }) || [])
            .sort(function (a, b) {
                var aName = String(a.get('name') || '').toLowerCase();
                var bName = String(b.get('name') || '').toLowerCase();
                return aName < bName ? -1 : aName > bName ? 1 : 0;
            });
    }
    function selectedCharacterId(msg) {
        var selection = msg.selected || [];
        for (var i = 0; i < selection.length; i++) {
            if (selection[i]._type !== 'graphic') continue;
            var token = getObj('graphic', selection[i]._id);
            if (token && token.get('represents')) return token.get('represents');
        }
        return '';
    }
    function listCharacters() {
        var characters = sortedCharacters();
        if (!characters.length) {
            whisper('No Roll20 characters found.');
            return;
        }
        var rows = characters.slice(0, MAX_CHARACTERS).map(function (character) {
            var id = character.id;
            return '<div><b>' + escapeHtml(character.get('name') || '(unnamed)') +
                '</b> <code>' + escapeHtml(id) + '</code></div>';
        });
        whisper('<b>Characters (' + characters.length + ')</b><br>' + rows.join('') +
            (characters.length > MAX_CHARACTERS ? '<br>Showing first ' + MAX_CHARACTERS + '.' : '') +
            '<br>Use <code>!red-inspect CHARACTER_ID</code>, or select a character token and use <code>!red-inspect</code>.');
    }
    function inspectCharacter(id) {
        var character = id && getObj('character', id);
        if (!character) {
            whisper('Character not found. Use <code>!red-characters</code> to obtain an ID, or select a linked token.');
            return;
        }
        var attributes = (findObjs({ _type: 'attribute', _characterid: character.id }) || [])
            .sort(function (a, b) {
                var aName = String(a.get('name') || '').toLowerCase();
                var bName = String(b.get('name') || '').toLowerCase();
                return aName < bName ? -1 : aName > bName ? 1 : 0;
            });
        var rows = attributes.slice(0, MAX_ATTRIBUTES).map(function (attr) {
            return '<div><code>' + escapeHtml(attr.get('name')) + '</code>: ' +
                escapeHtml(attr.get('current')) +
                (attr.get('max') === '' ? '' : ' / ' + escapeHtml(attr.get('max'))) + '</div>';
        });
        whisper('<b>Read-only character inspection</b><br><b>' +
            escapeHtml(character.get('name') || '(unnamed)') + '</b> (' +
            escapeHtml(character.id) + ')<br>Attributes: ' + attributes.length +
            '<br>' + (rows.join('') || '(No attributes found)') +
            (attributes.length > MAX_ATTRIBUTES ? '<br>Showing first ' + MAX_ATTRIBUTES + ' attributes.' : ''));
    }
    on('ready', function () {
        log('RED GM Bridge v0.2 initialized (read-only).');
        on('chat:message', function (msg) {
            if (!msg || msg.type !== 'api' || !playerIsGM(msg.playerid)) return;
            var input = String(msg.content || '').trim();
            if (input === '!red-ping') {
                whisper('RED GM Bridge v0.2 ONLINE — read-only.');
            } else if (input === '!red-characters') {
                listCharacters();
            } else if (input === '!red-inspect') {
                inspectCharacter(selectedCharacterId(msg));
            } else if (/^!red-inspect\s+\S+\s*$/.test(input)) {
                inspectCharacter(input.split(/\s+/)[1]);
            }
        });
    });
}());
