(function(){
    var joueur;
    var nbcol = 12;
    var nblgn = 12;
    var cx = 30.4, cy = 30.4;
    var longueur = 4;
    var $plateau;
    var plateau;
    var gamecanvas, gamecanvasctx;
    var nbjoueurs = 2;
    var joueurs = [];
    joueurs[1] = {face:'X', couleur: '#008'};
    joueurs[2] = {face:'O', couleur: '#800'};
    joueurs[3] = {face:'#', couleur: '#080'};
    var directions = [
        [1,0], // verticale
        [0,1], // horizontale
        [1,1], // diagonale 1
        [1,-1] // diagonale 2
    ];

    window.grille = function() {
        gamecanvasctx.strokeStyle = "rgba(255, 0, 0, .5)";
        gamecanvasctx.lineWidth = 1;

        for(var i=0; i<=12; i++) {
            gamecanvasctx.beginPath();
            gamecanvasctx.moveTo(i*cx, 0);
            gamecanvasctx.lineTo(i*cx, 12*cy);
            gamecanvasctx.stroke();

            gamecanvasctx.beginPath();
            gamecanvasctx.moveTo(0, i*cy);
            gamecanvasctx.lineTo(12*cx, i*cy);
            gamecanvasctx.stroke();
        }
    }

    var raye = function(joueur, l1,c1,l2,c2,dir) {
        gamecanvasctx.strokeStyle = joueurs[joueur].couleur;//"rgba(255, 0, 0, .5)";
        gamecanvasctx.lineWidth = 5;
        gamecanvasctx.lineCap = 'round';
        gamecanvasctx.beginPath();
        gamecanvasctx.moveTo(c1*cx - 15, l1*cy - 15);
        gamecanvasctx.lineTo(c2*cx - 15, l2*cy - 15);
        gamecanvasctx.stroke();

        for(var _i = 0; _i<longueur; _i++) {
            plateau[l1 + _i * directions[dir][0]][c1 + _i * directions[dir][1]].used[dir] = true;
        }
    };

    var initJoueurs = function() {
        for(joueur = 1; joueur<=nbjoueurs; joueur++) {
            joueurs[joueur].score = 0;
        }
        joueur = 0;
        joueurSuivant();
        Game.trigger('scores/update');
    };

    var joueurSuivant = function() {
        joueur = (joueur + 1);
        if (joueur>nbjoueurs) joueur = 1;
        $("#invitanim").slideUp(200, function(){
            $("#invitanim").html(
                '<span class="pion" style="color:'
                + joueurs[joueur].couleur + '">' 
                + joueurs[joueur].face + '</span>' + " joue"
            );
            $("#invitanim").slideDown(200);
        });
    };

    var chercheLigne = function(l, c) {
        var joueur = plateau[l][c].joueur;
        var longmax;
        var _dir, _l, _c;

        // on va regarder dans toutes les directions
        for (var _d = 0;_d<4;_d++) {
            _dir = directions[_d];
            longmax = 0;

            // pas la peine de regarder plus loin qu'une ligne normale
            for(var _i=-(longueur-1);_i<longueur;_i++) {
                // la case qu'on va regarder
                _l = l + (_i*_dir[0]);
                _c = c + (_i*_dir[1]);

                // attention qu'on ne regarde pas une case en dehors de la grille
                if (0 < _l && _l <= nblgn && 0 < _c && _c <= nbcol) {
                    // si le prochain pion peut participer à une ligne
                    // ( il faudra ajouter un test pour eviter qu'un pion
                    // serve deux fois dans la meme direction )
                    if (plateau[_l][_c] && plateau[_l][_c].joueur == joueur && !plateau[_l][_c].used[_d]) {
                        longmax++;

                        // si on a une ligne de la bonne longueur
                        if (longmax==longueur) {
                            // on augmente le score des joueurs
                            joueurs[joueur].score++;
                            Game.trigger('scores/update');
                            raye(joueur,
                                _l-(3*_dir[0]),_c-(3*_dir[1]),
                                _l,_c,_d
                            );
                        }
                    } else {
                        longmax = 0;
                    }
                }
            }
        }
    }

    Game.on('nbplayerbtn', function(ev, ls, nbplayerbtn){
        $("button.nbplayer").removeClass("checked");
        nbjoueurs = parseInt($(nbplayerbtn).addClass("checked").html());
    });
    
    Game.on('gobtn/click', function(){
        Game.card('piste');
    });
    
    Game.on('piste/ready', function(){
        var _c, _l;
        // on vide le plateau en mémoire
        plateau = [];
        // on vide le plateau affiché
        $plateau = $("#piste .plateau").html('');

        gamecanvas = document.getElementById('barres');
        $(gamecanvas)
            .attr('width', cx * nbcol)
            .attr('height', cy * nblgn)
            .css({
                marginLeft: - 2 - 15 * nbcol,
                marginTop: '6px'
            })
        ;
        gamecanvasctx = gamecanvas.getContext('2d');
    
        // pour chaque ligne
        for(_l = 1; _l<=nblgn; _l++) {
            // on prépare la ligne en mémoire
            plateau[_l] = [];
            // on prépare le code d'affichage de la ligne
            var $ligne = $('<tr></tr>');

            // pour chaque colonne
            for(_c = 1; _c<=nbcol; _c++) {
                // on crée une case vide en mémoire
                plateau[_l][_c] = null;
                // on crée une case cliquable pour l'interface
                $ligne.append('<td><button id="l'+_l+'c'+_c+'" class="pion" event="pion" ligne="'+_l+'" colonne="'+_c+'"></button></td>');
            }

            // on envoie le code d'affichage de la ligne
            $plateau.append($ligne);
        }

        $("#invitanim").html('');
        initJoueurs();
    },'Game1Start');

    Game.on('pion',function(ev, ls, pion){
        // quel case a été cliquée ?
        var $pion = $(pion);
        var _l = parseInt($pion.attr('ligne'));
        var _c = parseInt($pion.attr('colonne'));

        // est-elle libre ?
        if(plateau[_l][_c]) {
            Game.alert('Choisir une case vide!');
            return;
        }

        // on note le nouveau pion
        plateau[_l][_c] = {
            joueur: joueur, 
            used: [false,false,false,false] // pas encore utilisé par une ligne
        };

        // et on l'affiche
        $(pion).html('<span class="pion" style="color:'+joueurs[joueur].couleur+'">' 
            + joueurs[joueur].face + '</span>');

        // chercher ligne en _l/_c
        chercheLigne(_l,_c);

        // on change de joueur
        joueurSuivant();
    });

    // les scores ont changés
    Game.on('scores/update', function(){
        var _sep = '';
        $('#scores').html('');

        for (var i=1; i<=nbjoueurs;i++) {
            $('#scores').append(
                _sep +
                'Joueur <span class="pion" style="color:'+joueurs[i].couleur+'">' 
                    + joueurs[i].face + '</span> : <span class="score">' + joueurs[i].score + '</span>'
            );
            _sep = ' / ';
        }
    });

    // evenement générique pour le retour au menu
    Game.on('gomenu', function(){
        Game.card('menu');
    });
})();