//////////////////////////////////////////////////////
//// 
////    $().trackStuff();
////    $().buildMeAFormOrSomething();
////    author: Kirin Murphy, www.codethings.net 
////   
//////////////////////////////////////////////////////

/*
var cacheStatusValues = [];
cacheStatusValues[0] = 'uncached';
cacheStatusValues[1] = 'idle';
cacheStatusValues[2] = 'checking';
cacheStatusValues[3] = 'downloading';
cacheStatusValues[4] = 'updateready';
cacheStatusValues[5] = 'obsolete';

var cache = window.applicationCache;
cache.addEventListener('cached', logEvent, false);
cache.addEventListener('checking', logEvent, false);
cache.addEventListener('downloading', logEvent, false);
cache.addEventListener('error', logEvent, false);
cache.addEventListener('noupdate', logEvent, false);
cache.addEventListener('obsolete', logEvent, false);
cache.addEventListener('progress', logEvent, false);
cache.addEventListener('updateready', logEvent, false);

function logEvent(e) {
    var online, status, type, message;
    online = (navigator.onLine) ? 'yes' : 'no';
    status = cacheStatusValues[cache.status];
    type = e.type;
    message = 'online: ' + online;
    message+= ', event: ' + type;
    message+= ', status: ' + status;
    if (type == 'error' && navigator.onLine) {
        message+= ' (prolly a syntax error in manifest)';
    }
    console.log(message);
}

window.applicationCache.addEventListener(
    'updateready',
    function(){
        window.applicationCache.swapCache();
        console.log('swap cache has been called');
    },
    false
);

setInterval(function(){cache.update()}, 10000);
*/


(function($) {		

	$.TrackStuff = function($parent,settings) {
		this.$parent = $parent;
		this.settings = settings;

		this.masterData = null;
		
		var _this = this;
		
		// LIST CONTAINER - create display list for tasks and add header row
		this.$listContainer = $('<ul/>').attr('class',this.settings.class_listcontainer);

		// add create form and add to container
		this.buildCreateTaskForm();

		this.setupLocalStorage(); 

		this.$listContainer.appendTo(this.$parent);
	};
	
	$.TrackStuff.prototype = {
		setupLocalStorage : function() {
			
			var _this = this;
			
			// if localStorage exists
			if ( localStorage !== undefined ) {
				
				// create localstorage key used to save info
				this.localStorageKey = this.settings.userKey + '_' + this.settings.projectKey;

				// if this key already exists in localStorage, parse the string into an object and store in masterData object
				if ( localStorage[this.localStorageKey] ) {
					this.masterData = $.parseJSON(localStorage[this.localStorageKey]);
				
				// if this key does not exist in localStorage, create default masterData object and save to localStorage
				} else {
					
					// create 
					this.masterData = {
						'user':this.settings.userKey,
						'project':this.settings.projectKey,
						'date': this.getTimestamp(),
						'tasks': []
					};

					// create sample task object
					var sampletask = { 
						task:'Sample Task', 
						created:this.getTimestamp() 
					};
					
					// create default task in local storage
					this.createTaskInLocalStorage(sampletask);
				}

				// build saved items
				$.each(this.masterData.tasks, function(index,timestamp) {

					// get timestamped task from local storage and convert to object
					var taskObject = $.parseJSON(localStorage[_this.localStorageKey + '_' + timestamp]);
					
					// build item for each timestamp in masterdata
					_this.$listContainer.append(_this.buildListItem(taskObject));
					
				});
			
			// if localStorage === undefined 	
			} else {  alert('sorry boofrash, your browser sucks');  }

		},
		getTimestamp : function() {
			return JSON.stringify(new Date).replace('"','').replace('"','');
		},
		saveProjectInLocalStorage : function() {
			localStorage[this.localStorageKey] = JSON.stringify(this.masterData);
		},
		createTaskInLocalStorage : function(task) {
			
			// create new localStorage key with project and string timestamp 
			localStorage[this.localStorageKey + '_' + task.created ] = JSON.stringify(task);

			// add timestamp to master project key and saves project
			this.masterData.tasks.push(task.created);
			this.saveProjectInLocalStorage();
		},
		updateTaskInLocalStorage : function(task) {
			localStorage[this.localStorageKey + '_' + task.created] = JSON.stringify(task);	
		},
		buildCreateTaskForm : function() {
			var _this = this;
			
			this.$parent.buildMeAFormOrSomething({
				formID : 'createTask',
				addFormLevelErrorMsg : false,
				text_submitButton : '&oplus;',
				text_clearButton : '&otimes;',
				items : [
					{ type:'text', 
						properties:{ type:'text', name:'task', id:'task', required:true, placeholder:'What u gotta do?' } }
				],
				submitSuccessCallback : function(task) { 
					task.created = _this.getTimestamp();

					_this.createTaskInLocalStorage(task);

					// build item and append to list
					_this.$listContainer.append(_this.buildListItem(task));
				}
			});
		},
		buildListItem : function(listdata,classname) {

			var _this = this;

			// if item is removed, don't build it
			if ( listdata.removed !== undefined ) { return; }

			var $item = $('<li/>').attr('class','clr')

			// add class for important state
			if ( listdata.important !== undefined && listdata.important === true ) {
				$item.addClass(this.settings.class_importantTask);
			}

			// add class for completed state
			if ( listdata.done ) {  $item.addClass(this.settings.class_done);  }
			
			// -- BUILD item elements ---------------------------------------------
			// @fix - should make this a table?
			var $task = $('<div/>', { html:'<span>' + listdata.task + '</span>' })
				.attr('class', this.settings.class_itemtask)
				.appendTo($item);
			
			// @fix - if done state changes after onload, inline edit will not happen, need to reset somehow
			if ( !$item.hasClass(this.settings.class_done)) {
				$task.doAnInlineEdit({
					fieldType : 'textarea',
					submitSuccessCallback : function(editedValue) {
						// update the masterData object
						listdata.edited = true;
						listdata.task = editedValue;

						_this.updateTaskInLocalStorage(listdata);
					}
				});
			}
			
			// add $important trigger
			$('<div/>', { html:'!' })
				.attr('class',this.settings.class_importantBtn + ' ' + this.settings.class_listAction )
				.click(function(){

					// if we're in the list header or task is completed, exit out of function
					if ( $item.hasClass(_this.settings.class_done )  ) { return; }

					// set important to true
					if ( !$item.hasClass(_this.settings.class_importantTask)) {
						listdata.important = true;
						_this.updateTaskInLocalStorage(listdata);
						$item.addClass(_this.settings.class_importantTask);

					// or set important to false
					} else {
						listdata.important = false;
						_this.updateTaskInLocalStorage(listdata);
						$item.removeClass(_this.settings.class_importantTask);
					}
				})
				.appendTo($item);				

			// Complete Button 
			$('<div/>', { html:'&#10004;' })
				.attr('class',this.settings.class_completeBtn + ' ' + this.settings.class_listAction )
				.click(function(){
					// set complete with new complete timestamp
					if ( !$item.hasClass(_this.settings.class_done)) {
						listdata.done = new Date;
						listdata.important = false;
					
						_this.updateTaskInLocalStorage(listdata);
						$item.removeClass(_this.settings.class_important);
						$item.addClass(_this.settings.class_done);

					// or undo complete and change timestamp to null
					} else {
						listdata.done = null;
						_this.updateTaskInLocalStorage(listdata);
						$item.removeClass(_this.settings.class_done);
					}
				})
				.appendTo($item);
			
			// remove button	
			$('<div/>', { html: this.settings.text_removeButton })
				.attr('class',this.settings.class_removeBtn + ' ' + this.settings.class_listAction )
				.click(function(){
					// add remove date to object
					listdata.removed = _this.getTimestamp();
					_this.updateTaskInLocalStorage(listdata);

					// and remove the DOM element
					$item.remove();					
				})
				.appendTo($item);
										
			return $item;
		}
	};

	$.fn.startTrackStuff = function(options) {
		
		var settings = {
			userKey : 'UserName',
			projectKey : 'ProjectName',
			
			createProjectClass : 'createproject',
			createProjectButtonText : 'Add New Project',
			
			class_listcontainer : 'list',
			class_itemtask : 'task',
			class_itemowner : 'owner',
			class_completeBtn : 'complete',
			class_removeBtn : 'remove',
			class_importantBtn : 'important',
			class_listAction : 'listaction',
			class_importantTask : 'importantTask',
			class_done : 'done',
			
			text_removeButton : '&otimes;'
		};
		
		return this.each(function() {
			if ( options ) { $.extend(settings,options); }
			var trackStuff = new $.TrackStuff($(this), settings);
		});
	};
	
	
})(jQuery);