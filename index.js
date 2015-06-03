var $ = window.$ || {};

$(function(){

	var LS_name = 'kidsmemory';
	function toLS( m ){
		if ( !checkLS() ){ return; }
		var LS = window.localStorage;
		LS[ LS_name ] = JSON.stringify( m );
	}
	function fromLS(){
		if ( checkLS() ){
			var LS = window.localStorage;
			return JSON.parse( LS[ LS_name ] || '{}' );
		}else{
			return false;
		}
	}
	function checkLS(){
		return ( window.localStorage );
	}

	function chooseHeavy( level ){
		var sizes = getXYSize( Game.copies_count );
		var name = Game.name;
		for(var i in sizes){
			if ( sizes.hasOwnProperty( i ) ){
				var I = sizes[ i ];
				for(var j in I){
					if ( I.hasOwnProperty( j ) ){
						var str = i + ' x ' + j;
						var block = renderBlock( name, level, i, str );
						root.append( block );
					}
				}
			}
		}
	}

	function getXYSize( k ){
		var m = {};
		var max = 6;
		for(var i=2; i<=max; i++){
			for(var j=2; j<=max; j++){
				if ( (i*j) % k == 0 && j*2 >= i && i*2 >= j ){
					if ( i<=j ){
						m[j] = m[j] || {};
						m[j][i] = 1;
					}
				}
			}
		}
		return m;
	}

	function getAvatarsPath( name ){
		var avatars_path = sets[name].avatars_path;
		var path = {
			begin: 'sets_img',
			avatar: 'avatar'
		};
		if ( avatars_path ){
			avatars_path = './' + path.begin + '/' + avatars_path + '/' + path.avatar + '/';
		}
		return avatars_path;
	}

	function getLangText( str ){
		return window[ 'lang_' + Game.lang ][ str ] || str;
	}

	function render( name, level, show_name ){
		var m = sets[name]['level_' + level];
		var avatars_path = getAvatarsPath( name );

		var about_text = $('.about-text');
		if ( level && name == 'Game' && level == 1 ){
			about_text.show();
		}else{
			about_text.hide();
		}
		about_text.find('.text').hide().filter('.' + Game.lang).show();

		if ( m ){
			m.forEach( function ( elem, i ){
				var text;
				if ( i == 0 && name == 'Game' ){
					text = getLangText( elem );
					writeTimeLine( level );
					var h1 = $('<h1><span class="text pseudo-link"></span></h1>');
					h1.find('.text').html( text );
					h1.appendTo( root );
					if ( Game.level == 0 ){
						h1.find('.text').removeClass('pseudo-link');
					}
				}else{
					var avatars_path_img = ( avatars_path )? (avatars_path + elem.src): null;
					text = elem.name || elem;
					if ( !avatars_path && typeof elem === 'object' ){
						text = elem.src;
					}
					var name_item = getLangText( elem.name || elem );
					var block = renderBlock( name, level, (i), text, avatars_path_img, name_item );
					if ( level == 4 ){
						var text_len = block.find('.text').text();
						if ( text_len.indexOf( ' ' ) > -1 ){
							block.addClass('multi-line');
						}
						var get_count = 2;
						block.append( getLine() );
						var blocks = getRandomAvatars( elem, get_count, 1 );
						$(blocks[0]).addClass('left').appendTo( block );
						$(blocks[1]).addClass('right').appendTo( block );
						block.addClass( 'with-imgs' );
					}

					if ( show_name ){
						var list = $('<div class="list"></div>');
						list.append( block );
						$('<div class="name"></div>').html( getLangText( elem.name )).appendTo( list );
						root.append( list );
					}else{
						root.append( block );
					}
				}
			});
		}
	}

	function getRandomAvatars( name, count, level ){

		var blocks;
		var avatars = [];
		var set = sets[ name ];
		for(var i=0; i<level; i++){
			avatars = avatars.concat( set[ 'level_' + (i+1) ] );
		}

		var len = avatars.length;
		var m = [];

		var avatars_path = getAvatarsPath( name );
		for( i=0; i<count && i<len; i++){
			var n;
			do{
				n = Math.round( Math.random()*(len-1) );
			}while ( m.indexOf( n ) != -1 );
			m.push( n );
			var str = avatars[ n ];
			var avatars_path_img = (avatars_path)? ( avatars_path + str.src ): null;
			var str_text = ( typeof str == 'object' )? str.src: str;
			var name_item = getLangText( str.name || str );
			var block = renderBlock( name, Game.level+1, Game.i, str_text, avatars_path_img, name_item );
			if ( Game.level == 3 ){
				block.addClass('block-mini');
			}
			if ( i == 0 ){
				blocks = block;
			}else{
				blocks = $.merge( blocks, block );
			}
		}
		return blocks;
	}

	function renderBlock( name, level, i, _str, img, name_item ){
		var str = _str.toString();
		var text = getLangText( str );
		if ( Game.level == 3 && text == str ){
			text = getLangText( 'group_' + str.toLowerCase() );
			if ( text == 'group_' + str ){
				text = str;
			}
		}
		str = str.replace(/ /g,'_');
		var block_ID = name + '_' + level + '_' + i ;
		var castle_class = ( Game.blocks[block_ID] )? '': 'castle';
		var block = $('<div data-name-item="' + name_item + '" data-i="'+i+'" data-str="'+str+'" data-level="'+level+'" data-name="'+name+'" class="block name-' + name + ' level-' + level + ' str-' + str + ' i-'+i+ ' ' + castle_class +'"><span class="text"></span></div>');
		if ( name == 'Colors' ){
			block.css({background: str});
		}
		if ( name == 'Game' || name == 'Numbers' ){
			block.find('span').html( text );
		}
		if ( img ){
			$('<img class="image" src="' + img + '" alt="' + name_item + '"/>').appendTo( block );
			block.addClass('with-image');
		}
		return block;
	}

	function mainRender( action ){
		if ( Game.level != 6 && action == 'click'
			|| action == 'load'
			){
			renderClear();
		}
		var name_level = Game.name + '_' + Game.level;
		root.removeAttr('class').addClass('root level-' + (Game.level + 1));
		if ( Game.level == 5 ){
			render( 'Game', Game.level+1 );
		}
		switch ( name_level ){
			case 'Game_0':
				render( Game.name,  Game.level+1 );
				renderBack( Game.level-1 );
				break;
			case 'Game_1':
				switch ( Game.i ){
					case 1:
						if ( Game.str == 'quick_start' ){
							Game.quick = true;
							Game.level = 3;
						}
						render( Game.name, Game.level+1 );
						break;
					case 2:
						render( Game.name, Game.level+1 );
						break;
					case 3:
						writeTimeLine( Game.level+1 );
						renderAllAvatars();
						break;
					case 4:
						renderClear();
						writeTimeLine( Game.level+1 );
						about();
						break;
				}
				renderBack( Game.level-1 );
				break;
			case 'Game_2':
				Game.copies_count = Game.i;
				render( Game.name, Game.level+1 );
				chooseHeavy( Game.level+1 );
				renderBack( Game.level-1 );
				break;
			case 'Game_3':
				if ( Game.str.indexOf( 'x' ) > -1 ){
					Game.heavy = Game.str;
					Game.heavyX = parseInt( Game.str.replace(/^([\d]+).*$/,'$1') );
					Game.heavyY = parseInt( Game.str.replace(/^.*([\d]+)$/,'$1') );
				}
				render( Game.name, Game.level+1 );
				renderBack( Game.level-1 );
				break;
			case 'Game_4':
				Game.avatars_group = Game.str;
				render( Game.name,  Game.level+1 );
				renderAvatarsCount();
				renderBack( Game.level-1 );
				if ( Game.quick ){
					Game.quick = false;
					var blocks = $('.name-Game:not(.str-Back)',root);
					blocks[ blocks.length -1 ].click();
				}
				break;
			case 'Game_5':
				Game.avatars_level = Game.i || 1;
				Game.started = true;
				Game.stat.push( {
					click_count: 0,
					opened_count: 0,
					blocks: [],
					points: 0,
					blocks_count: 0
				} );
				renderGame();
				Game.stat[ Game.stat.length-1 ].blocks_count = $('.block:not(.name-Game)').length;
				renderBack( Game.level-1 );
				break;
			case 'Game_7':
				render( Game.name, Game.level );
				renderWin();
				renderBack( 3 );
				break;
		}
		if ( action == 'load' && Game.name != 'Game' ){
			Game.name = 'Game';
			Game.level--;
			mainRender( 'click' );
		}
		if ( Game.level == 6 ){
			Game.started = true;
		}
		if ( action == 'click' && Game.name != 'Game' && Game.level == 6 ){
			var curr_game = Game.stat[ Game.stat.length - 1 ];
			var id_opened_eq = true;
			var last_block_i = curr_game.blocks[ curr_game.blocks.length - 1 ];
			var blocks_game = root.find('.block.name-' + Game.avatars_group );
			var last_block = $( blocks_game[ last_block_i ] );
			if ( !last_block.hasClass( 'hidden' ) ){ return; }
			last_block.removeClass('hidden').addClass('disabled');
			for(var i=1; i<curr_game.blocks.length; i++){
				if ( $( blocks_game[ curr_game.blocks[ curr_game.blocks.length - 1 - i ] ]).data('str') != last_block.data('str') ){
					id_opened_eq = false;
					break;
				}
			}

			setNameToHeader( last_block.data('name-item') );
			if ( id_opened_eq ){
				if ( curr_game.blocks.length >= Game.copies_count ){
					curr_game.opened_count += Game.copies_count;
					for(i=0; i<curr_game.blocks.length; i++){
						$( blocks_game[ curr_game.blocks[ i ] ])
							.animate({padding: 0}, 300, function(){
								$(this).addClass( 'done' );
							})
					}
					setTimeout(function(){
						if ( Game.started ){
							curr_game.blocks = [];
							removeNameFromHeader();
						}
					},400);
				}
				if ( curr_game.opened_count >= blocks_game.length ){
					Game.level = 7;
					Game.started = false;
					delete curr_game.blocks;
					curr_game.points = getGamePoints( curr_game );
					delete curr_game.blocks_count;
					Game.name = 'Game';
					setTimeout(function(){
						mainRender( 'click' );
					},400);
				}
			}else{
				for(i=0; i<curr_game.blocks.length; i++){
					$( blocks_game[ curr_game.blocks[ i ] ])
						.animate({padding: 0}, 300, function(){
							$(this).addClass( 'hidden').removeClass('disabled');
							removeNameFromHeader();
						});
				}
				setTimeout(function(){
					curr_game.blocks = [];
				},400);
			}

		}
		$('.lang').remove();
		if ( Game.level < 5 ){
			var lang = $('<div class="lang"><ul></ul></div>').appendTo( root );
			var lang_root = lang.find('ul');
			for(i=0; i<Sets.Game.level_0.length; i++){
				var item = $('<li/>');
				var lang_name = Sets.Game.level_0[i].name;
				var span = $('<span/>').html( lang_name ).data( 'lang', lang_name ).appendTo( item );
				if ( Game.lang == lang_name ){ // selected
					span.addClass('selected');
				}else{
					span.addClass('pseudo-link');
				}
				item.appendTo( lang_root );
			}
		}
		window.location.hash = Game.lang;
	}

	function setNameToHeader( name ){
		removeNameFromHeader();
		$('<span class="name"/>').html( name ).insertAfter( $('h1 .text',root) );
	}
	function removeNameFromHeader(){
		$('h1 .name',root).remove();
	}

	function renderAllAvatars(){
		root.addClass( 'all-avatars' );
		var h1_text = Sets.Game.level_4[0];
		h1_text = getLangText( h1_text );
		var h1 = $('<h1><span class="text pseudo-link"></span></h1>');
		h1.find('.text').html( h1_text );
		h1.appendTo( root );
		$('<hr/>').appendTo( root );
		var groups_elem = $('<div class="groups"></div>');
		groups_elem.appendTo( root );
		var i_obj = Sets.Game.level_4;
		for(var i=1; i<i_obj.length; i++){

			var h2 = i_obj[i];
			var h2_name = getLangText( 'group_' + h2.toLowerCase() );
			$('<hr/>').appendTo( root );
			$('<h2/>').attr('id',h2).html( h2_name ).appendTo( root );
			var item = $('<a class="hidden-link item"/>');
			item.attr('href', '#' + h2).appendTo( groups_elem );
			var block = getRandomAvatars(h2, 1, 1).addClass('block-mini');
			block.appendTo( item );
			$('<span class="pseudo-link"></span>').html( h2_name).appendTo( item );
			var j_obj = Sets[ i_obj[i] ];
			for(var j=1; j<=j_obj.levels; j++){
				render( i_obj[i], j, true );
			}
//			console.log( 'getSite', h2 );
			getSite( h2 );
		}
		$('.block').addClass('disabled');
	}

	function renderWin(){
		$('<div></div>').html( getLangText( 'you_win_points' ) + ': <span  class="important">' + Game.stat[ Game.stat.length-1 ].points + '</span>').appendTo( root );
	}

	function renderGame(){
		var n_field = Game.heavyX * Game.heavyY;
		var n_different = Math.round( n_field / Game.copies_count );
		var blocks = getRandomAvatars( Game.avatars_group, n_different, Game.avatars_level );
		blocks
			.addClass('hidden')
			.append( '<img class="hidden-img" src="./img/pattern_close.svg"/>' );
		var blocks_new = [];
		for(var i= 0, il=blocks.length; i<il; i++){
			for(var j=0; j<Game.copies_count; j++){
				blocks_new.push( $(blocks[i]).clone() );
			}
		}
		blocks_new.sort(function(){
			return ( Math.random()*2 > 1 )? -1: 1;
		});
		for(i= 0; i<blocks_new.length; i++){
			$( blocks_new[i]).attr('data-i',i).appendTo( root );
			if ( (i+1) % Game.heavyX == 0 ){
				addLine();
			}
		}
	}

	function getGameClearPoints( n ){
		var s = 0;
		for(var j= 0; j<n; j++){
			s += j+1;
		}
		return s;
	}

	function getPoints( x, n ){
		var s = getGameClearPoints( n );
		s *= x*1.3;
		s = Math.round( s );
		return s;
	}

	function getGamePoints( curr_game ){
		var max = getPoints( Game.copies_count, curr_game.blocks_count );
		var n = curr_game.click_count;
		var peny = Math.round( getGameClearPoints( n ) * 0.8 );
		var game_point = max - peny;
		return ( game_point > curr_game.blocks_count )? game_point: curr_game.blocks_count;
	}

	var root = $('<div class="root"></div>');
	root.appendTo( '.kids-memory' );
	$('.root').delegate('.block','click',function(){
		var elem = $(this);
		if ( elem.hasClass('disabled') ){ return; }
		if ( elem.hasClass('done') ){ return; }

		if ( elem.hasClass('ingame') ){
		}else{
			var name = elem.data('name');
			var level = parseInt( elem.data('level') );
			var i = parseInt( elem.data('i') );
			var str = elem.data('str');
			Game.level = level;
			Game.name = name;
			Game.i = i;
			Game.str = ( str == 'Back' )? Game.avatars_group: str;

			if ( Game.started ){
				var curr_game = Game.stat[ Game.stat.length - 1 ];
				curr_game.click_count++;
				curr_game.blocks = curr_game.blocks || [];
				curr_game.blocks.push( i );
			}

			mainRender( 'click' );
		}
		toLS( Game );
	}).delegate('.lang .pseudo-link', 'click', function(){
		Game.lang = $(this).data('lang');
		mainRender( 'click' );
		toLS( Game );
	})
	.delegate('h1 .text', 'click', function(){
		Game.level = 0;
		Game.name = 'Game';
		mainRender( 'click' );
		toLS( Game );
	});
	$('<div class="fork misc-text"><a href="https://github.com/denisx/kidsmemory/">Fork me</a></div>').appendTo( 'body' );

	function renderClear(){
		root.html('');
	}

	function renderAvatarsCount(){
		for(var i=0; i<sets[ Game.str ].levels; i++){
			if ( i > 0 ){
				addLine();
			}
			var name = Game.name;
			var level = Game.level;
			var str = (i+1).toString();
			var block = renderBlock( name, level+1, (i+1), str );
			root.append( block );
			render( Game.str, (i+1) );
			root.find('.block').addClass('disabled block-mini').filter('.name-Game').removeClass('disabled block-mini');
		}
	}

	function addLine(){
		root.append( getLine() );
	}

	function writeTimeLine( level ){
		var line = $('<div class="time-line"><div class="inner"></div></div>').appendTo( root );
		line.find('.inner').addClass('level-' + level);
	}

	function about(){
		var h1 = $('<h1><span class="text pseudo-link"></span></h1>');
		h1.find('text').html( getLangText('about_game') );
		h1.appendTo( root );
		$('<div class="about"/>').html( getLangText('about') ).appendTo( root );
		for(var i= 0; i<Sets.Game.level_4.length; i++){
			getSite( Sets.Game.level_4[i] );
		}
	}

	function getSite( name ){
		if ( !Sets[ name ] ){ return; }
		var block = $('<div class="about-inner"></div>').appendTo( root );
		var text = Sets[ name ].site;
		if ( text != getLangText( text ) ){
			console.log( 1 );
			text = getLangText( text );
			$('<span/>').html( getLangText( 'go_to_site' ) + ' <a href="http://' + text + '">' + text + '</a>' ).appendTo( block );
		}
		var text_video = Sets[ name ].site_video;
		if ( text_video != getLangText( text_video ) ){
			text_video = getLangText( text_video );
			$('<span/>').html( ', ' + getLangText( 'watch_video' ) + ' <a href="http://' + text_video + '">' + text_video + '</a>' ).appendTo( block );
		}
	}

	function clearSite(){
		$('.about-inner').remove();
	}

	function getLine(){
		return $( '<div class="br"></div>' );
	}

	function renderBack( level ){
		var n = 1;
		var str = 'Back';
		var name = Game.name;
		var block = renderBlock( name, level, n, str );
		addLine();
		if ( Game.level > 0 ){
			root.append( block );
		}
		var s = [
			'x' + Game.copies_count,
			Game.heavy.replace(/_/g,''),
			Game.avatars_group,
			'lev.' + Game.avatars_level
			];
		var soc_text;
		if ( Game.level == 7 ){
			var point = Game.stat[ Game.stat.length-1 ].points;
			s.push( 'Points: ' + point );
			soc_text = point;
			soc_text = getLangText( 'find_pare' ) + '. ' + getLangText( 'my_result' ) + ': ' + soc_text;
			getSite( Game.avatars_group );
		}else{
			soc_text = getLangText( 'find_pare' );
//			clearSite();
		}
		s = s.join(' | ');
		soc_text += '. #kidsmemory ( ' + s + ' ) ';
		$('<div class="misc-text"></div>').html( s ).appendTo( root );
		$('title').html( soc_text );

		$('.social *').remove();
		$('<script class="yashare" type="text/javascript" src="https://yastatic.net/share/share.js" charset="utf-8"></script>').appendTo( '.social' );
		$('<div class="yashare yashare-auto-init" data-yashareL10n="ru" data-yashareType="small" data-yashareQuickServices="vkontakte,facebook,twitter,odnoklassniki,moimir,gplus" data-yashareTheme="counter"></div>').appendTo( '.social' );

	}

	var lang = window.location.hash.replace(/^#([a-z]{2,2}.*$)/,'$1');
	if ( ['ru','en'].indexOf( lang ) == -1 ){
		lang = 'ru';
	}

	var sets = window.Sets || {};
	window.Game = {
		level: 0,
		name: 'Game',
		lang: lang,
		copies_count: 2,
		heavy: '4_x_3',
		heavyX: 4,
		heavyY: 3,
		avatars_group: 'Colors',
		avatars_level: 1,
		stat: [],
		blocks: {},
		status: 'ok' // system value
	};
	if ( checkLS() ){
		// dev
//		delete window.localStorage.kidsmemory;

		var m = fromLS();
		if (m.status == 'ok' ){
			Game = m;
		}else{
			toLS( Game );
		}
	}
	mainRender( 'load' );

});

