
$.contactList = {

	listItemBuilder : function(options) {

		var fields = [
			{ id:'itemTitle', 'class':'title', sortable:'true' },
			{ id:'topics', 'class':'topics', sortable:'true' }
		];
		

		var classes = {
			contentWrapper: 'articleContent',
			displayed: 'displayed',

			itemTitle : 'title',
			topics: 'topics',
			outletInfo: 'outletInfo',
			primaryOutlet: 'primaryOutlet',
			contactInfo: 'contactInfo',
			contactLinks: 'contactLinks',
			mediaType: 'mediaType',
			email: 'email',
			twitter: 'twitter',
			address1: 'address',
			location: 'location',
			DMA: 'DMA',
			phone: 'phone',
			website: 'website',

			// expando boxes
			profileSummaryLink: 'profileSummaryLink',
			profileSummary: 'profileSummary',
			recentArticlesLink: 'recentArticlesLink',
			recentArticles: 'recentArticles',
			allOutletsLink2: 'allOutlets2',
			allOutletsLink: 'allOutletsLink',
			allOutletsList: 'allOutletList',

			metrics: 'metrics',
			circulation: 'circulation',
			uvpm: 'uvpm',
			frequency: 'frequency',
			onairTime: 'onairTime'
		};
		
		var text = {
			titles: 'Covering',

			allOutletsLabel: 'View All Outlets',
			hideAllOutletsLabel: 'Hide All Outlets',

			profileSummaryLink : 'View Profile Summary',
			hideProfileSummary: 'Hide Profile Summary',
			showRecentArticles: 'View Recent Articles',
			hideRecentArticles: 'Hide Recent Articles',
			circulation: "Circulation",
			uvpm: "UVPM",
			frequency: "Frequency",
			onairTime: "On Air Time"

		};	

		var $item = null;
		var $contactInfo = null;
		var $metrics = null;

		var buildItem = function() {  

			var _this = this; 

			this.$article = options.$article;
			this.settings = options.settings;
			$item = $('<div/>', { 'class': classes.contentWrapper + ' clr' });

			var $header = $('<h3/>', { 'class':'clr' })
			
			// make $name either a link or a span based on if item link value exists
			var $name = ( options.item.nameLink !== undefined || options.item.nameLink !== null ) 
				? $('<a/>', { href:options.item.nameLink, target:'_blank' }) : $('<span/>');
				
			$name.html(options.item.name).appendTo($header);	
			
			$header.appendTo($item);

			if ( options.item.title && options.item.title !== '' ) {
				$('<span/>', { target:'_blank', text:options.item.title, 'class':classes.itemTitle })
					.appendTo($header);
			} 

			if ( options.item.outlet && options.item.outlet !== '' ) {
				var $outletInfo = $('<div/>', { 'class':classes.outletInfo })
					.append( $('<a/>', { 'class':classes.primaryOutlet, text:options.item.outlet, href:options.item.outletLink })  )

				if ( options.item.mediaType && options.item.mediaType !== '') {
					$('<span/>', { 'class':classes.mediaType, text:options.item.mediaType }).appendTo($outletInfo);
				}

					if ( options.item.allOutletsLink && options.item.allOutletsLink !== '' ) {

						$('<a/>', { 'class':classes.allOutletsLink2, text:text.allOutletsLabel, href:options.item.allOutletsLink })
							.appendTo($outletInfo)
							.click(function() {

								var $link = $(this);

								var $allOutletsList = $outletInfo.find('.' + classes.allOutletsList );

								if ( $link.hasClass(classes.displayed) ) {

									$link.removeClass(classes.displayed).text(text.allOutletsLabel);
									$allOutletsList.fadeOut();

								} else {

									$link.addClass(classes.displayed).text(text.hideAllOutletsLabel);

									if ( $allOutletsList.length === 0 ) {
										$.ajax({
											url:'tempdata/alloutlets.html',
											dataType:'html',
											success : function(data) { 
												$(data).addClass(classes.allOutletsList)
													.hide()
													.appendTo($outletInfo)
													.fadeIn(_this.settings.speed_slideDown);
											}
										});
									} else {  $allOutletsList.fadeIn(_this.settings.speed_slideDown);  }
								} 
								return false;
							});
					}

				$outletInfo.appendTo($item);
			}

			if ( options.item.topics && options.item.topics !== '' ) {
				var $topics = $('<dl>', { 'class':classes.topics + ' clr', html:'<dt>' + text.titles + ': </dt><dd></dd>' });
				var $topicsDD = $topics.find('dd');
				$.each(options.item.topics, function(index,topic) {
					if ( index !== 0 ) { $topicsDD.append(', ') }
					$topicsDD.append( $('<span/>', { html:topic }) );
				});
				$topics.appendTo($item);
			}

			var buildDL = function(dlClass, dlLabel, dlValue) {
				var $dl = $('<dl>', { 'class':dlClass + ' clr', html:'<dt>' + dlLabel + ': </dt><dd></dd>' });
				$dl.find('dd').append( $('<span/>', { html:dlValue })  );

				return $dl;
			};

			// -- METRICS ------------------------------------------------------------------ //
			$metrics = $('<div/>', { 'class':classes.metrics });

			var circulationText = '';
			if ( options.item.circulation && options.item.circulation !== '') { circulationText = options.item.circulation }
			if ( options.item.frequency && options.item.frequency !== '' ) { 
				if ( circulationText !== '' ) { circulationText += ' / ' }  
				circulationText += options.item.frequency;
			}

			if ( circulationText !== '' ) {
				$metrics.append( buildDL( classes.circulation, text.circulation, circulationText )  );
			}

			if ( options.item.uvpm && options.item.uvpm !== '' ) {
				$metrics.append( buildDL( classes.uvpm, text.uvpm, options.item.uvpm ) );
			}

			if ( options.item.onairTime && options.item.onairTime !== '' ) {
				$metrics.append( buildDL( classes.onairTime, text.onairTime, options.item.onairTime )  );
			}

			// -- ADD LOCATION INFO -------------------------------------------------------- //
			$contactInfo = $('<div/>', { 'class':classes.contactInfo });

			if ( options.item.address1 && options.item.address1 !== '' ) {
				$('<div/>', { text:options.item.address1, 'class':classes.address1 }).appendTo($contactInfo);
			}

			if ( options.item.location && options.item.location !== '' ) {
				$('<div/>', { text:options.item.location, 'class':classes.location }).appendTo($contactInfo);
			}

			if ( options.item.DMA && options.item.DMA !== '' ) {  $('<div/>', { html:options.item.DMA, 'class':classes.DMA }).appendTo($contactInfo);  }

			if ( options.item.phone && options.item.phone !== '' ) {
				$('<div/>', { text:options.item.phone, 'class':classes.phone }).appendTo($contactInfo)
			} 

			// -- CONTACT LINKS ------------------------------------------------------------------- //
			var $contactLinks = $('<div/>', { 'class':classes.contactLinks + ' clr' }).appendTo($contactInfo)

			if ( options.item.email && options.item.email !== '' ) {
				$('<a/>', { html:options.item.email, href:'mailto:' + options.item.email, 'class':classes.email })
					.appendTo($contactLinks)
					.click(function() {
						window.prompt ("Copy to clipboard: Ctrl+C, Enter", options.item.email);
						return false;
					});
			}

			if ( options.item.twitter && options.item.twitter !== '' ) {
				$('<a/>', { 'class':classes.twitter, html:options.item.twitter, href:'http://www.twitter.com/' + options.item.twitter, target: '_blank' })
					.appendTo($contactLinks);
			}

			if ( options.item.website && options.item.website !== '' ) {
				$('<a/>', { 'class':classes.website, html:options.item.website, href:options.item.website, target:'_blank' })
					.appendTo($contactLinks);
			}


			// -- DETAIL EXPANDERS --------------------------------------------------------------- //
			$item
				.append(
					this.buildExpanderLink({
						class_link: classes.profileSummaryLink,
						class_detail: classes.profileSummary,
						text_showDetail: text.profileSummaryLink,
						text_hideDetail: text.hideProfileSummary,
						url: 'tempdata/profilesummary.html'
					})
				)
				.append(
					this.buildExpanderLink({
						class_link: classes.recentArticlesLink,
						class_detail: classes.recentArticles,
						text_showDetail: text.showRecentArticles,
						text_hideDetail: text.hideRecentArticles,
						url: 'tempdata/recentarticles.html'
					})
				)
				.append(
					this.buildExpanderLink({
						class_link: classes.allOutletsLink,
						class_detail: classes.allOutletsList,
						text_showDetail: text.allOutletsLabel,
						text_hideDetail: text.hideAllOutletsLabel,
						url: 'tempdata/alloutlets.html'
					})
				);			
		};


		buildItem.prototype = {
			buildExpanderLink: function(model) {

				// model = {
				// 	class_link: ,
				// 	class_detail: ,
				// 	text_showDetail: ,
				// 	text_hideDetail: ,
				// 	url: '
				// }

				var _this = this;

				var $expanderLink = $('<div/>', { 'class':model.class_link + ' expander clr' })
					.append( $('<span/>', { text:model.text_showDetail }).hide()  )
					.prepend(
						$('<em/>', { text:'v' })
							.mouseenter(function() {
								$expanderLink.find('span').show();
							})
							.mouseleave(function() {
								$expanderLink.find('span').hide();
							})
							.click(function() {

								var $desc = $expanderLink.find('span');
								var $button = $(this);

								$desc.hide();

								var $detail = _this.$article.find('.' + model.class_detail );
								console.log('deets',$detail);

								if ( $expanderLink.hasClass(classes.displayed) ) {
									$button.text('v');
									$detail.slideUp(_this.settings.slideUp);
									$expanderLink.removeClass(classes.displayed);
									$desc.text(model.text_showDetail);

								} else {

									$expanderLink.addClass(classes.displayed);
									$button.text('^');
									$desc.text(model.text_hideDetail);

									if ( $detail.length === 0 ) {
										$.ajax({
											url:model.url,
											success : function(data) { 

												$(data).addClass(model.class_detail + ' detail')
													.hide()
													.appendTo(_this.$article)
													.slideDown(_this.settings.slideDown);

												if ( model.loadItemCallback ) { model.loadItemCallback(data) }

											}
										});
									} else {  $detail.slideDown(_this.settings.slideDown);  }
								}
								return false;
							})
					);
				return $expanderLink;
			}
		};

		var newItem = new buildItem;

		return $item
			.add($contactInfo)
			.add($metrics);
	},
	completedListCallback : function(model) {
        
	    var classes = {
	        viewOptions: 'viewOptions'
	    };	    		    		    
	    
	    // put options in a view container and add to parent wrap
	    var $viewOptions = $('<div/>', { 'class':classes.viewOptions })

        if ( model.returnControls.$templateLinks ) {  $viewOptions.append(model.returnControls.$templateLinks);  }
        if ( model.returnControls.$showSelected ) { $viewOptions.append(model.returnControls.$showSelected) }

	    $viewOptions.appendTo(model.$listwrap);
	}
	
}


