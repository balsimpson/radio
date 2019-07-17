let info =
{
	resume: {
		collection: 'Game Of Thrones',
		item: 'Catelyn',
		index: 1,
		offset: 12345
	},
	list: [
		{
			"name": "Party Radio",
			"type": "playlist",
			"items": [
				{
					"url": "https://yp.shoutcast.com/sbin/tunein-station.m3u?id=1376488",
					"name": "Hitparty by PulsRadio"
				},
				{
					"url": "https://yp.shoutcast.com/sbin/tunein-station.m3u?id=1757116",
					"name": "Club Mix Radio"
				}
			]
		},
		{
			"name": "Meditation Radio",
			"type": "playlist",
			"items": [
				{
					"url": "https://yp.shoutcast.com/sbin/tunein-station.m3u?id=1656843",
					"name": "1.FM - Destination:SPA"
				},
				{
					"url": "https://yp.shoutcast.com/sbin/tunein-station.m3u?id=1390835",
					"name": "Ambient Sleeping Pill"
				},
				{
					"url": "https://yp.shoutcast.com/sbin/tunein-station.m3u?id=99428464",
					"name": "Hippie Soul Cafe"
				}
			]
		},
		{
			"name": "Grand Theft Auto",
			"type": "playlist",
			"items": [
				{
					"url": "https://s3.amazonaws.com/gtaradio/Bounce FM.mp3",
					"name": "Bounce FM"
				},
				{
					"url": "https://s3.amazonaws.com/gtaradio/VROCK.mp3",
					"name": "V Rock"
				},
				{
					"url": "https://s3.amazonaws.com/gtaradio/FEVER.mp3",
					"name": "Fever"
				}
			]
		},
		{
			"name": "Game Of Thrones",
			"type": "book",
			"progress": {
				"index": 1,
				"offset": 12345,
				"status": "in progress"
			},
			"items": [
				{
					"url": "https://numerous-mosquito-9311.dataplicity.io/chapter_1_1.mp3",
					"name": "Bran",
					"offset": 0,
					"completed": 1,
					"status": "available"
				},
				{
					"url": "https://numerous-mosquito-9311.dataplicity.io/chapter_1_2.mp3",
					"name": "Catelyn",
					"offset": 12345,
					"completed": 0,
					"status": "available"
				}
			]
		}
	],
	settings: {
		now_playing_text: [
			"Now playing",
			"This is"
		],
		resuming_text: [
			"Now resuming",
			"Resuming"
		],
		exit_text: [
			"Goodbye",
			"Talk to you soon"
		]
	}
}

const empty_state_html = `
	<div class="empty-state">
		<div class="flow-text">You have not saved anything.
		<br>
		Add a channel or a book, by clicking the buttons above.</div>
	</div>
`

// Entire collection data
let collection_resume;
// Items list from collection 
let collection_list;
// Settings from collection 
let collection_settings;
// Notifications from collection 
let collection_notifications;

let new_collection = {
	name: '',
	items: []
};

getItems();
// ^(https).+\.(m3u|mp3)+(\?([^?]*))? - find valid URLs

// Add Collection Item Button Listener
// Update Modal Fields - Channel / Book
document.querySelectorAll('.collection-item-add-btn').forEach(collection_add_btn => {
	collection_add_btn.addEventListener('click', e => {
		let collection_type = e.target.getAttribute('data-type');
		// Clear Items
		getElement('#modal-items-list').innerHTML = '';
		// Update Modal Title
		getElement('#modal-collection-title').innerHTML = (collection_type === 'book') ? 'Add Book Collection' : 'Add Channel';
		// Update Icon
		getElement('#modal-collection-icon').innerHTML = (collection_type === 'book') ? 'collections_bookmark' : 'library_music';
		// Update Collection Name Placeholder
		getElement('#modal-collection-name-input').placeholder = (collection_type === 'book') ? 'Collection name' : 'Channel name';
		// Update Collection Name Helper Text
		getElement('#modal-collection-name-helper').innerHTML = (collection_type === 'book') ? 'e.g: Game of Thrones' : 'e.g: Chill Out or Smooth Jazz';
		// Add Advanced Item Add Option
		if (collection_type === 'book') {
			// console.log(getElement('#advanced-tab').classList);
			getElement('.basic-tab').classList.add('active');
			getElement('.advanced-tab').classList.remove('disabled');
		} else {
			getElement('.basic-tab').classList.add('active');
			getElement('.advanced-tab').classList.remove('active');
			getElement('.advanced-tab').classList.add('disabled');
		}
		// Update Collection Add Item Name Placeholder
		getElement('#modal-item-name').placeholder = (collection_type === 'book') ? 'Book name' : 'Station name';
		// Update Collection Add Item URL Placeholder
		getElement('#modal-item-url').placeholder = (collection_type === 'book') ? 'https://example.com/folder/book_1.mp3' : 'https://shoutcast.com/tunein-station.m3u?id=1796807'
		// Update Collection Save Button with Collection Type
		getElement('#modal-collection-save').innerHTML = (collection_type === 'book') ? 'Save Collection' : 'Save Channel';

		if (collection_type === 'book') {
			getElement('#modal-collection-save').setAttribute('data-type', 'book');
		} else {
			getElement('#modal-collection-save').setAttribute('data-type', 'playlist');
		}
	})
})


// EVENT LISTENERS
// <!-- Modal Add Item -->
getElement('#modal-add-item-btn').addEventListener('click', e => {
	let station_items_div = getElement('#modal-items-list');

	let item_name = getElement('#modal-item-name');
	let item_url = getElement('#modal-item-url');

	let name_valid = item_name.classList.contains("valid");
	let url_valid = item_url.classList.contains("valid");

	if (name_valid && url_valid) {
		// Add to collection
		let new_item = {
			name: item_name.value,
			url: item_url.value,
			offset: 0,
			completed: 0,
			status: 'unplayed'
		}

		new_collection.items.push(new_item);
		renderModalItem(new_collection.items);

		// showToast('check', `${item_name.value} added` );

		// Clear form
		getElement('#modal-item-name').value = '';
		getElement('#modal-item-name').classList.remove('valid');
		getElement('#modal-item-url').value = '';
		getElement('#modal-item-url').classList.remove('valid');

	} else {
		console.log('Add station name and station url');

		if (name_valid) {
			showToast('error', 'Enter a valid URL. <br>e.g: http://yp.shoutcast.com/sbin/tunein-station.m3u?id=1796807')
		} else if (url_valid) {
			showToast('error', 'Enter the station name')
		} else {
			showToast('error', 'Enter the station name and the station URL')
		}
	}

});

// <!-- Modal Add Item - Advanced -->
getElement('#modal-add-item-advanced-btn').addEventListener('click', e => {
	let pattern_path = getElement('#url-pattern-path');
	let pattern_number = getElement('#url-pattern-number');
	let pattern_extension = getElement('#url-pattern-extension');

	let book_name = getElement('#url-pattern-book-name').innerHTML;

	console.log(pattern_path.value + pattern_number.value + pattern_extension.value);
	console.log(book_name.innerHTML);

	// Add Items
	for (let i = 0; i < pattern_number.value; i++) {
		// console.log(pattern_path.value + i + pattern_extension.value); 

		let new_item = {
			name: `${book_name} ${i + 1}`,
			url: pattern_path.value + (i + 1) + pattern_extension.value,
			offset: 0,
			completed: 0,
			status: 'unplayed'
		};

		console.log(new_item);

		new_collection.items.push(new_item);
		renderModalItem(new_collection.items);
	}

});

// <!-- Modal Save Collection -->
getElement('#modal-collection-save').addEventListener('click', e => {
	let collection_name = getElement('#modal-collection-name-input').value;

	let collection_type = getElement('#modal-collection-save').getAttribute('data-type');
	if (collection_name && new_collection.items.length > 0) {
		// console.log('clicked');
		new_collection.index = collection_list.length;
		new_collection.name = collection_name;
		new_collection.type = collection_type;
		getElement('#modal-collection-save').classList.add('modal-close');

		// Add new channel to channel list
		console.log(collection_list, new_collection);
		collection_list.push(new_collection);
		// Render channels
		renderCollections(collection_list);
		saveStations(collection_list);

		let item_txt = (new_collection.items.length > 1) ? 'items' : 'item';

		showToast('check', `${collection_name} ${collection_type} saved with ${new_collection.items.length} ${item_txt}`);

		// Clear form

		getElement('#modal-add-collection-form').reset()
	} else {
		if (collection_name) {
			showToast('error', `Add at least one book`);
		} else {
			showToast('error', `Give a name to the collection`);
			getElement('#modal-collection-name-input').focus();
		}
	}
});


// Get Data
async function getItems() {
	axios({
		url: 'https://tinkr.api.stdlib.com/radio@dev/stations/',
		method: "GET"
	})
		.then(result => {
			console.log('result', result.data);
			// Empty state check
			collection = result.data;

			// Save info to local variables
			collection_resume = collection.resume || {};
			collection_list = collection.list || [];
			collection_settings = collection.settings || {};
			collection_notifications = collection.notifications || [];

			renderCollections(collection_list);
			// Listen to Channel Name Edit
			let collection_names = document.querySelectorAll('.collection-name');
			// console.log(channel_names);
			// console.log(channel_names);

			collectionRenameListener(collection_names);

		})
}

// Show Item Add Input Fields
function showAddItem(collection_item_name, event) {
	event.preventDefault();
	let item_add = document.querySelector(`.${collection_item_name}-item-add`);
	let item_add_icon = document.querySelector(`#${collection_item_name}-show-add`);

	if (item_add.style.display === 'block') {
		item_add.style = 'display:none'
		item_add_icon.innerHTML = 'add'
	} else {
		item_add.style = 'display:block'
		item_add_icon.innerHTML = 'close'
	}
}

function collectionAddItem(collection_item_name, event) {

	console.log('event:', event);

	event.preventDefault();
	let collection_item_div = getElement(collection_item_name);
	let item_name = getElement(`#${collection_item_name}-item-name`).value;
	let item_url = getElement(`#${collection_item_name}-item-url`).value;

	let items_div = getElement(`#${collection_item_name}-items-container`);

	let item = {
		name: item_name,
		url: item_url,
		status: 'unplayed'
	}

	if (item_name && item_url) {

		items_div.appendChild(itemDivHTML(item, collection_item_name));

		for (const [index, collection] of collection_list.entries()) {
			if (collection.name === collection_item_name.replace(/-/g, ' ')) {

				// Clear input fields
				getElement(`#${collection_item_name}-item-name`).value = '';
				getElement(`#${collection_item_name}-item-name`).classList.remove('valid');
				getElement(`#${collection_item_name}-item-url`).value = '';
				getElement(`#${collection_item_name}-item-url`).classList.remove('valid');

				let new_item = {
					name: item_name,
					url: item_url,
					offset: 0,
					completed: 0,
					status: 'unplayed'
				}

				collection_list[index].items.push(new_item);
				console.log('collection_list', collection_list);
				saveStations(collection_list);
				// Toast
				showToast('check', `${item_name} added to ${collection_item_name.replace(/-/g, ' ')}`);

			} else {
				console.log(index, collection.name, collection_item_name);
			}
		}


	} else {
		showToast('check', `Add station name and station URL`);

	}
}

function deleteItem(collection_name, item_name, event) {
	event.preventDefault();
	collection_name = collection_name.replace(/-/g, ' ');
	for (const [collection_index, collection] of collection_list.entries()) {
		console.log(collection_name, collection.name);
		if (collection.name === collection_name) {
			for (const [index, item] of collection.items.entries()) {
				// for (const station of channel.stations) {
				if (item.name === item_name) {
					console.log(index, item);
					collection_list[collection_index].items.splice(index, 1);

					// Delete Collection if it has no items
					if (collection_list[collection_index].items.length > 0) {
						showToast('check', `${item_name} deleted from ${collection_name}`);
					} else {
						collection_list.splice(collection_index, 1);
						showToast('check', `${collection_name} deleted`);
					}

					renderCollections(collection_list);
					saveStations(collection_list);
				}
			}
		}
	}
}

function collectionRenameListener(channel_names) {
	channel_names.forEach(channel_name => {
		channel_name.addEventListener('keypress', e => {
			// Listen for submit
			if (e.keyCode == 13) {
				console.log(channel_name);
				e.preventDefault();
				e.target.blur();
			}
		});
		channel_name.addEventListener('blur', e => {
			e.preventDefault();
			// Listen for submit
			console.log(e.target.textContent);
			let index = e.target.getAttribute('data-index');
			// Update channel list
			collection_list[index].name = e.target.textContent;
			renderCollections(collection_list);
			saveStations(collection_list);
			console.log(collection_list);
		});
	});
}

function saveStations(collections) {
	let data = {
		settings: collection.settings || {},
		resume: collection.resume || {},
		list: collections
	}
	updateDB(data);
}

// Listen for Show Settings Button Click
let show_settings_btn = document.getElementById('show-settings-btn');
show_settings_btn.addEventListener('click', e => {
	// Fill Input Fields - Now Playing
	if (collection_settings.now_playing) {
		document.querySelector('.now-playing').querySelectorAll('input').forEach((now_playing_txt, index) => {
			now_playing_txt.value = collection_settings.now_playing[index] || '';
		});
	}
	// Fill Input Fields - Stop Playing
	if (collection_settings.stop_playing) {
		document.querySelector('.stop-playing').querySelectorAll('input').forEach((stop_playing_txt, index) => {
			stop_playing_txt.value = collection_settings.stop_playing[index] || '';
		});
	}
	// Fill Input Fields - Error
	if (collection_settings.error) {
		document.querySelector('.error').querySelectorAll('input').forEach((error_txt, index) => {
			error_txt.value = collection_settings.error[index] || '';
		});
	}
})

// Listen for Save Settings Button Click
let save_settings_btn = document.getElementById('settings-save');
save_settings_btn.addEventListener('click', e => {
	let now_playing_txt_div = document.querySelector('.now-playing');
	let stop_playing_txt_div = document.querySelector('.stop-playing');
	let error_txt_div = document.querySelector('.error');

	collection_settings.now_playing = [];
	collection_settings.stop_playing = [];
	collection_settings.error = [];

	now_playing_txt_div.querySelectorAll('input').forEach(txt => {
		if (txt.value) {
			collection_settings.now_playing.push(txt.value);
		}
	});
	stop_playing_txt_div.querySelectorAll('input').forEach(txt => {
		if (txt.value) {
			collection_settings.stop_playing.push(txt.value);
		}
	});
	error_txt_div.querySelectorAll('input').forEach(txt => {
		if (txt.value) {
			collection_settings.error.push(txt.value);
		}
	});

	let data = {
		settings: collection_settings,
		list: collection_list,
		resume: collection_resume
	}

	console.log('saving settings...');

	updateDB(data);
})

async function updateDB(data) {
	axios({
		url: `https://tinkr.api.stdlib.com/radio@dev/stations?status=update&info=${JSON.stringify(data)}`,
		method: "GET"
	})
		.then(result => {
			console.log('result', result);
		})
		.catch(error => {
			console.log('error', error);
		})
}

// Render Channels and Books
function renderCollections(collection_list) {
	let collection_list_div = document.getElementById('collection-list');
	collection_list_div.innerHTML = '';

	let collections = Object.keys(collection_list);
	// console.log(channels);

	if (collections.length > 0) {
		for (const [index, _collection] of collections) {
			let collection = collection_list[index];
			// console.log(collection);
			let collection_name = collection.name.replace(/ /g, '-');
			collection_name = collection_name.replace(/\'|!|\?/gim, '');
			// collection_name = encodeURI(collection_name);
			// div for each collection
			let collection_div = createNode('div', ['container', 'collection', 'card']);
			collection_div.id = collection_name;

			collection_div.innerHTML = collectionItemHTML(index, collection, collection_name);
			collection_list_div.appendChild(collection_div);

			let items_div = getElement(`#${collection_name}-items-container`);
			// Add items
			for (const item of collection.items) {
				let item_div = itemDivHTML(item, collection_name);
				items_div.appendChild(item_div);
			}

			collection_div.appendChild(items_div);

		}
	} else {
		collection_list_div.innerHTML = empty_state_html;
	}
}

function collectionItemHTML(index, collection, collection_name) {
	let collection_icon = (collection.type === 'book') ? 'collections_bookmark' : 'queue_music';

	let item_name_placeholder = '';
	let item_url_placeholder = '';

	if (collection.type === 'book') {
		item_name_placeholder = 'Book name';
		item_url_placeholder = 'Book url';
	} else {
		item_name_placeholder = 'Station name';
		item_url_placeholder = 'Station url';
	}

	// collection_name = encodeURI(collection_name);

	let html = `
		<div class="collection-header">
			<form class="row">
				<div class="col s1 left-align">
					<i class="material-icons">${collection_icon}</i>
				</div>
				<div class="col s10">
					<div data-index="${index}" class="collection-name left-align" contenteditable="true">${collection.name}</div>
				</div>
				<div class="col s1">
					<a data-type="${collection.type}" onclick="showAddItem('${collection_name}', event)" class="add-item-btn" href="#"><i id="${collection_name}-show-add" class="material-icons right">add</i></a>
				</div>
			</form>
		</div>
		<div class="row collection-item-add ${collection_name}-item-add" style="display:none">
			<form>
				<div class="col s12">
					<input id="${collection_name}-item-url" placeholder="${item_url_placeholder}" type="url" class="validate">
				</div>
				<div class="col s10">
					<input id="${collection_name}-item-name" placeholder="${item_name_placeholder}" type="text" class="validate">
				</div>
				<div class="col s2 right-align" style="padding: 14px 6px;">
					<a onclick="collectionAddItem('${collection_name}', event)" class="btn-floating btn-small pulse"><i
							class="material-icons">add</i></a>
				</div>
			</form>

			<div id="${collection_name}-items-container" class="collection-items-container"></div>
		</div>
		`;

	return html;
}

function itemDivHTML(item, collection_name) {
	console.log('collection_name:', collection_name);

	let item_div = createNode('div', ['row', 'item', 'valign-wrapper']);
	item_div.innerHTML = `
		<div class="col s11">
			<span class="item-name">${item.name}</span>
			<span class="item-status-${item.status}">${item.status}</span><br>
			<span class="item-url">${item.url}</span>
		</div>
	
		<div class="col s1">
			<a onclick="deleteItem('${collection_name}', '${item.name}', event)" class="delete-item-btn" href="#"><i class="tiny material-icons right">close</i></a>
		</div>
	`;

	return item_div;
}

// <!-- Modal Delete Station -->
function deleteModalItem(index) {
	console.log('is this on? - deleteModalItem');

	showToast('check', `${new_collection.items[index].name} deleted`);
	new_collection.items.splice(index, 1);
	renderModalItem(new_collection.items);
}

// Render Modal Item
function renderModalItem(items) {
	console.log('is this on? - renderModalItem');
	let items_list_div = document.getElementById('modal-items-list');

	if (items.length > 0) {
		items_list_div.innerHTML = '';

		items.forEach((item, index) => {
			items_list_div.innerHTML += `
					<div id="modal-item-${index}" class="row item valign-wrapper">
						<div class="col s8">
							<span class="item-name">${item.name}</span><br>
							<span class="item-url grey-text">${item.url}</span>
						</div>
						<div class="col s4">
							<a onclick="deleteModalItem('${index}')" data-index="${index}" href="#"><i class="material-icons right">close</i></a>
						</div>
					</div>				
					`
		});
	} else {
		items_list_div.innerHTML = '';
	}
}

modalAddItemAdvanced();
// Listener for Book URL Pattern
function modalAddItemAdvanced() {
	let pattern_path = getElement('#url-pattern-path');
	let pattern_number = getElement('#url-pattern-number');
	let pattern_extension = getElement('#url-pattern-extension');

	let pattern_url = getElement('#url-pattern-url');

	let item_count = getElement('#auto-item-count');
	let book_item_count = getElement('#book-item-count');

	let book_advanced_add_btn = getElement('#modal-add-item-advanced-btn');

	let pattern_path_valid = pattern_path.classList.contains("valid");
	let pattern_number_valid = pattern_number.classList.contains("valid");
	let pattern_extension_valid = pattern_extension.classList.contains("valid");

	pattern_path.addEventListener('keyup', e => {
		pattern_path_valid = pattern_path.classList.contains("valid");
		pattern_number_valid = pattern_number.classList.contains("valid");
		pattern_extension_valid = pattern_extension.classList.contains("valid");
		pattern_url.innerHTML = pattern_path.value + pattern_number.value + pattern_extension.value;

		console.log(pattern_path_valid, pattern_number_valid, pattern_extension_valid);

		if (pattern_path_valid && pattern_number_valid && pattern_extension_valid) {
			book_advanced_add_btn.classList.remove('disabled');
		}
	})
	pattern_number.addEventListener('keyup', e => {
		pattern_path_valid = pattern_path.classList.contains("valid");
		pattern_number_valid = pattern_number.classList.contains("valid");
		pattern_extension_valid = pattern_extension.classList.contains("valid");
		pattern_url.innerHTML = pattern_path.value + pattern_number.value + pattern_extension.value;
		book_item_count.innerHTML = ` ${pattern_number.value}`;

		console.log(pattern_path_valid, pattern_number_valid, pattern_extension_valid);
		if (pattern_path_valid && pattern_number_valid && pattern_extension_valid) {
			book_advanced_add_btn.classList.remove('disabled');
		}
	})
	pattern_extension.addEventListener('keyup', e => {
		pattern_path_valid = pattern_path.classList.contains("valid");
		pattern_number_valid = pattern_number.classList.contains("valid");
		pattern_extension_valid = pattern_extension.classList.contains("valid");
		pattern_url.innerHTML = pattern_path.value + pattern_number.value + pattern_extension.value;

		console.log(pattern_path_valid, pattern_number_valid, pattern_extension_valid);
		if (pattern_path_valid && pattern_number_valid && pattern_extension_valid) {
			book_advanced_add_btn.classList.remove('disabled');
		}
	})
}

// show notifications
getElement('#show-notifications-btn').addEventListener('click', e => {
	console.log('clicked');
	notificationsHTML(collection_notifications);
	document.querySelector('.notification-items').classList.toggle('show');
})

// create notification items div
function notificationsHTML(notifications) {
	let notifications_div = getElement('.notification-items');

	if (notifications.length > 0) {
		notifications.forEach(notification => {
			console.log(notification);
		})
		
	} else {
		notifications_div.innerHTML = `
		<div class="notifications-none" style="
			color: black;
			text-align: center;
		">No Notifications</div>`
	}
}


// HELPER FUNCTIONS
function createNode(element, classNames) {
	let elem = document.createElement(element);
	if (classNames && classNames.length > 0) {
		for (const className of classNames) {
			elem.classList.add(className);
		}
	}
	return elem;
}

function getElement(id_class) {
	return document.querySelector(encodeURI(id_class));
}

// Get Random Activity
const activity = () => {
	let activities = ["Read a book", "Rearrange the furniture", "Start an observation notebook", "Learn a foreign language", "Deep-clean your room", "Take a nap", "Dig up your family tree", "Do some puzzles", "Teach yourself a card trick", "Start a workout routine", "Blow bubbles", "Write a journal", "Plan a vacation", "Read the newspaper", "Play with a cat", "on a wandering walk", "Explore Wikipedia", "Take a long bath", "Binge-watch a great TV series", "Discover new music", "Revisit a favorite movie", "Do some stargazing", "on a hike", "Write poetry", "Ride a bike", "listen to a podcast", "learn to juggle", "bake some bread", "Take some pictures", "Start a blog", "visit an art gallery", "practice origami", "Make a time capsule", "Do some networking", "Build some paper airplanes", "Walk around the city", "Draw something", "Do some excercise"];

	const randomItem = (arrayOfItems) => {
		let i = 0;
		i = Math.floor(Math.random() * arrayOfItems.length);
		return (arrayOfItems[i]);
	};

	return `I'll go ${randomItem(activities).toLowerCase()}.`;
}

function showToast(status, message) {

	console.log('toast:', status, message);

	M.toast({ html: `<i class="material-icons" style="margin-right:6px">${status}</i> ${message}`, displayLength: 4000 });
}
