
/**
 * This solution uses jQuery to load and parse XML (AJAX), handle events, as a selector engine, and as an animation engine.
 *
 * To implement the card change animation, the solution uses z-index to create a temporary 'background buffer'.
 *
 * Concepts illustrated:
 *  - object-oriented JavaScript
 *  - separation of concerns
 *  - functional programming
 */

/**
 * Cards class
 */

function Cards() {

	//the cards object stores each loaded card
	this.cards = [];

	//the state property stores which card is currently being displayed
	this.state = 0;

	//the disabled property stops the 'previous' and 'next' buttons being used while an animation is being completed
	this.disabled = false;

	//the load method uses AJAX to fetch the XML from the backend
	this.load = function () {
		$.ajax({
		    type: "GET",
		    url: "data.xml",
		    dataType: "xml",
		    context: this,
		    success: this.xmlParser
		});
	};

	//the xmlParser method parses the XML into the cards object and draws the first card
	this.xmlParser = function (xml) {
		var self = this;
		$(xml).find('card').each(function () {
			var title = $(this).attr('title');
			//From jQuery docs, .html() is not available on XML documents (and doesn't work in IE)
			//But we can clone the childen of the card into a temporary orphan element, and use that to get the HTML
			//see http://stackoverflow.com/questions/652763
			var html = $('<div></div>').append($(this).clone().children()).html();
			self.cards.push({title: title, html: html});
		})
		this.draw(0, "#card");
	};

	//the animate method performs the card change with an animation
	this.animate = function (left) {
		var self = this;
		$('#container').append('<div id="buffer"></div>'); //temporary buffer, background layer
		this.draw(this.state, '#buffer'); //draw the new card onto the background buffer
		$("#card").animate({ //animate the old card off the screen
			left: left
		}, 800, function () { //callback on completion
			$("#card").remove(); //remove the old card
			$("#buffer").attr("id","card").css('z-index', 'auto'); //make the temporary buffer become the new card, and bring it to front layer
			$("#container").css('z-index', 'auto');
			self.disabled = false;
		});
	}

	//the next method draws the next page
	this.next = function () {
		if (!this.disabled && this.state < this.cards.length-1) {
			this.disabled = true;
			this.state += 1;
			var width = $(window).width();
			this.animate(-width);
		}
	};

	//the previous method draws the previous page
	this.previous = function () {
		if (!this.disabled && this.state > 0) {
			this.disabled = true;
			this.state -= 1;
			var width = $(window).width();
			this.animate(width);
		}
	};

	//the draw method renders the card onto a container
	this.draw = function (card, container) {
		var html = [], i = -1;
		html[++i] = '<h1>'+this.cards[card].title+'</h1>';
		html[++i] = '<div>'+this.cards[card].html+'</div>';
		$(container).html(html.join(''));
	};
};

$(document).ready(function() {
	var cards = new Cards();
	cards.load();

	$('#navigation').on('click', '#previous', function(event) {
		cards.previous();
	});

	$('#navigation').on('click', '#next', function(event) {
		cards.next();
	});
});
