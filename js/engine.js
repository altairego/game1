Game = (function() {
    var _listeners = [];
    var _card, _cards;
    var alertpending, alerttimeout;

    // init cards data
    $(function(){
        _cards = [];
        $(".cards .card").hide().each(function(){_cards.push(this.id);if ($(this).hasClass('init')) _card = this.id;});
        $("#"+_card).show();
        Game.trigger('game/ready');
    });

    // redirect mouse clicks to Game triggers
    $(".game").delegate("button[id],a[id]","click",function(ev) {
        Game.trigger(this.id+"/click");
        var _ev_attr = $(this).attr('event');
        if (_ev_attr) {
            Game.trigger(_ev_attr,this);
        }
    });

    return {
        // register to a game event
        on: function(ev, ls, nm) {
            _listeners[ev] = _listeners[ev] || [];
            if (!nm) {
                nm = ev+this.hash(ls.toString());
            }
            _listeners[ev][nm] = ls;
        },
        // cancel an event register
        cancel: function(ls) {
            for(var _ev in _listeners) {
                for(var _ls in _listeners[_ev]) {
                    if (ls === _ls) {
                        delete(_listeners[_ev][_ls]);
                    }
                };
            };
        },
        // trigger a game event
        trigger: function(ev,ctxt) {
            console.log("Game event triggered ["+ev+"]");
            _listeners[ev] = _listeners[ev] || [];
            for(var _ls in _listeners[ev]) {
                if (_listeners[ev][_ls]) {
                    _listeners[ev][_ls](ev, _ls, ctxt);
                }
            };
        },
        // get a hash
        hash: function(s){
            return Math.abs(s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0));
        },
        // debug : dump game data
        dump: function(){
            console.log('listeners');
            for(var _ev in _listeners) {console.log('**'+_ev+'**');for(var _ls in _listeners[_ev]) {console.log(_ev+'/'+_ls);} }
        },
        // display a message at the bottom of the game
        message: function(msg) {
            $("#message").html(msg);
        },
        // blink an alert message in the title bar
        alert: function(msg) {
            if(alertpending) {
                alertpending();
                alertpending = null;
            }
            var $t = $("#titre");
            var _title = $t.html();
            $t.html(msg).addClass("error");
            alerttimeout = setTimeout(function(){
                if(alertpending) {
                    alertpending();
                    alertpending = null;
                }
            },1000);
            alertpending = function(){
                clearTimeout(alerttimeout);
                $t.html(_title).removeClass("error");
            };
        },
        // select/create a card
        card: function(card) {
            var $card = $("#"+_card);
            if (card == _card) {
                Game.trigger(_card+'/refresh', $card);
                return;
            }

            Game.trigger(_card+'/dispose', $card);
            $card.hide();

            var $newcard = $("#"+card);

            if (!$newcard.length) {
                $newcard = $('<div id="'+card+'" class="card">'+card+' card</div>');
                $card.after($newcard);
                _cards.push(card);
                Game.trigger('card/create', $newcard);
            }

            _card = card;

            $newcard.show();
            Game.trigger(_card+'/ready', $newcard);
        }
    };
})();
